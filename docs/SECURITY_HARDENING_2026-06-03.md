# Security Hardening — 2026-06-03

Follow-up actions on the launch-readiness audit. This document records the
high/medium-risk findings that were fixed, exactly what changed, and how each
fix was verified. Production readiness before this session: **86 / 100**.

Commit: `c43fa5f` — *fix(security): sanitize checkout inputs/emails (H1) + hide cost data from public API (H2)*

| ID | Finding | Risk | Status |
|----|---------|------|--------|
| H1 | Checkout API: no server-side input validation + unescaped HTML/attribute injection in transactional emails | High | ✅ Fixed & deployed |
| H2 | Public `GET /api/houses` leaked `marginPercent` + base cost/price structure | High | ✅ Fixed & deployed |
| M8 | Backups / PITR unconfirmed; media backup undefined | Medium | ✅ Verified (WAL archiving healthy) + dashboard follow-ups noted |

---

## H1 — Checkout input validation & email injection

**File:** `app/api/checkout/route.ts`

**Problem.** Client-supplied values (name, email, phone, address, notes, order
reference, house name/size) were written into the DB and interpolated **raw**
into the admin + client order emails, including into `href`/`src` attributes.
A malicious payload could inject arbitrary HTML/links into the emails received
by staff and customers. There was also no server-side validation.

**Fix.**

- **Validation & sanitization at the top of the handler:**
  - `orderRef` is restricted to `[A-Za-z0-9_-]`, max 64 chars; empty → `400`.
  - `clientEmail` validated with `isValidEmail`; invalid/missing → `400`.
  - All text fields pass through `sanitizeText` with length caps
    (name 120, email 254, phone 40, street 200, city 100, zip 20,
    region 100, country 80, notes 4000).
  - Sanitized `delivery` object is what gets persisted to the `orders` collection.
- **Output escaping for emails:** every client value rendered into email HTML
  goes through `escapeHtml` (`safeClientName`, `safeClientEmail`,
  `safeClientPhone`, `safeHouseName`, `safeSizeValue`, `safeDelivery.*`,
  `safeHouseImageUrl`). The `tel:` link uses `encodeURIComponent`; the
  `mailto:` and image `src`/`alt` use escaped values. Option labels in the
  options table are escaped too.
- Email **subjects** (not HTML) use the cleaned, length-capped values.

**Helpers used:** `escapeHtml` from `lib/resend-mail.ts`,
`isValidEmail` + `sanitizeText` from `lib/form-utils.ts`.

**Verification.** `npm run typecheck` ✅, `npm test` 20/20 ✅, lint 0 errors.
Grep confirms no remaining raw client interpolation in the email markup (only
dev `console.log` references remain).

---

## H2 — Cost/margin data hidden from the public API

**File:** `collections/Houses.ts`

**Problem.** `Houses` had `access.read: () => true`, so the public Payload REST
endpoint `GET /api/houses` returned the full pricing structure, including base
structure costs and the commercial margin (`marginPercent`) — for every house,
in bulk.

**Fix.** Added **field-level** read access to the cost fields so they are only
returned to authenticated (admin) requests:

```ts
access: { read: ({ req }) => Boolean(req.user) }
```

Applied to: `price60x160`, `price60x200`, `marginPercent`,
`windows.aluminiumPrice`, `windows.pvcPrice`.

**Why this is safe for the site.** Server-side rendering uses the Payload
**Local API** (`overrideAccess`), which bypasses field access, so the
configurator and on-page pricing are unaffected. Nothing client-side fetches
`/api/houses` (verified by grep — only admin components fetch
`/api/field-definitions`). Public content (`title`, `slug`, description,
images, dimensions) is intentionally still readable.

**Verification (live, after deploy).**

```
GET https://www.ossaboisfrance.com/api/houses?limit=1&depth=0
  → "title":"Enea avec Toit", "slug":"enea-avec-toit"            ✅ content intact
  → marginPercent / price60x160 / price60x200 /
    aluminiumPrice / pvcPrice                                     ❌ no longer present
```

**Known residual (follow-up, not a launch blocker).** A single house page still
ships `marginPercent` + base price to the **client** configurator, because the
live price calculation happens in the browser (`lib/house-mapper.ts` →
`marginPercent`). The API fix stops bulk scraping across all houses; fully
sealing this requires moving margin computation entirely server-side and sending
only final marked-up prices to the client (larger refactor).

---

## M8 — Backups & Point-in-Time Recovery (Supabase)

Checked directly against the production database (`spyhpakoxxzceltbdehn`).

**WAL archiving (the mechanism behind PITR) — healthy:**

| Signal | Value |
|--------|-------|
| `archive_mode` | `on` |
| WAL segments archived | `845` |
| Archive failures | `0` |
| Last archived | `2026-06-03 17:32 UTC` (recent) |
| `wal_level` | `logical` |
| Database size | `23 MB` |

→ Continuous WAL archiving is active and erroring-free, i.e. the physical backup
pipeline is working.

**Security advisors:** only INFO-level `rls_enabled_no_policy` across public
tables. RLS is enabled with **no policies = deny-all** through the Supabase Data
API (PostgREST), which is the desired, safe state. The app connects via direct
Postgres (Payload), bypassing RLS. No ERROR/WARN security advisories.

**Follow-ups that must be confirmed/done in the Supabase Dashboard** (the MCP has
no backup API to read or toggle these):

- **PITR retention window** — confirm/enable under *Database → Backups → PITR*
  (requires a paid plan); pick a retention (e.g. 7 days).
- **Restore drill** — restore once into a throwaway project to prove backups are
  usable; record the restore time.
- **Storage (S3 media) backup** — order screenshots + house media live in the
  Supabase storage bucket and are **not** covered by Postgres/WAL backups.
  Supabase Storage does not support S3 object versioning, so use an independent
  provider for the media copy.

**2026-07-16 implementation update:**

- `.github/workflows/platform-backup.yml` now defines one matched daily
  database + Storage recovery point with seven-day retention.
- Database archives are encrypted artifacts. Public media are checksum-verified
  daily snapshots in GitHub Actions Cache; later syncs transfer only changes
  from Supabase and old cache keys are pruned after seven days.
- The workflow is not operational until the secrets in
  `docs/BACKUP_RUNBOOK.md` are configured and its first manual run succeeds.

(See also `docs/OPERATIONS.md` → *Database backups & point-in-time recovery*.)

---

## Remaining audit items (not addressed this session)

From the launch-readiness audit, still open (none are launch blockers):

- **M1** — ~20 moderate dependency vulnerabilities (`npm audit`).
- **M2** — Payload `cors`/`csrf` not explicitly configured in `payload.config.ts`.
- **M3** — no audit log / versioning for admin actions.
- **M4** — JSON-LD via `dangerouslySetInnerHTML` from CMS content (layout + house page).
- **M5** — DB index/slow-query review (unindexed FKs, `houses.slug`).
- **M6** — no centralized env validation at startup.
- **M7** — dev/import/test routes still in the codebase (blocked only by `NODE_ENV` in middleware).
- **H2 residual** — client-side margin/base price exposure (see above).
