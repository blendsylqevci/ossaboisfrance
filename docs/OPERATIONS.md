# Operations

## Production environment

| Variable | Notes |
|----------|--------|
| `RESEND_ADMIN_EMAIL` | **Required** in production for contact, B2B, and checkout admin notifications |
| `RESEND_API_KEY` | Required for real email delivery |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://ossaboisfrance.com` — used for absolute media URLs in order emails |
| `PAYLOAD_SECRET` | Must be set; no fallback in production |

## API rate limits

| Route | Limit |
|-------|--------|
| `POST /api/contact` | 8 / 15 min / IP |
| `POST /api/b2b` | 5 / 15 min / IP |
| `POST /api/checkout` | 6 / 15 min / IP |

Limiting uses a **durable backend (Upstash Redis / Vercel KV) when configured**,
falling back to an in-memory limiter per instance otherwise. To enable durable,
global limits set either `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN` or
`KV_REST_API_URL`+`KV_REST_API_TOKEN`. The limiter fails open (allows the
request) if the Redis call errors, so an outage never blocks legitimate traffic.

## Security headers & Content-Security-Policy

Set in `next.config.mjs` → `headers()`:

- HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `X-DNS-Prefetch-Control` on all routes.
- **Content-Security-Policy** (enforcing) on all routes **except `/admin` and
  `/api`**, which manage their own needs. The policy is ISR-compatible (no
  per-request nonce) and allows: self, inline scripts/styles, `data:`/`blob:`
  images, Supabase + legacy WP images, and the address-autocomplete APIs
  (`api-adresse.data.gouv.fr`, `nominatim.openstreetmap.org`).

**Adding a new third-party origin (script, font, iframe, API):**

1. Add the origin to the relevant CSP directive in `next.config.mjs`.
2. Set `CSP_REPORT_ONLY=true` in Vercel and redeploy.
3. Audit: `npx playwright test csp-audit` (visits key pages, fails on any
   violation). Report-only blocks nothing, so this is zero-risk on production.
4. Once clean, remove `CSP_REPORT_ONLY` and redeploy to re-enforce.

## Dev-only routes (blocked when `NODE_ENV=production`)

- `/api/import-*`, `/api/import-house/*`
- `/api/cleanup-*`, `/api/test-*`, `/api/seed-*`, `/api/migrate`, `/api/reseed`

## Order configuration screenshots

Checkout uploads the client canvas to **Payload `media`** (S3), not the local filesystem — safe on Vercel.

## Media serving (Supabase CDN)

House configurator **layers**, renders, planimetries, and option swatches are served
**directly from Supabase Storage’s public CDN**, not through the Payload proxy route
`/api/media/file/...`.

**Why.** The old proxy streamed every asset through a Vercel serverless function with
`Cache-Control: max-age=0` (`x-vercel-cache: MISS` on every request). With ~14
multi‑MB layer PNGs per house, that meant ~1.4–1.7s TTFB per layer on every toggle.
Serving from Supabase’s CDN keeps the **same original 4K files** but warm loads are
~0.08s TTFB (browser → Cloudflare → bucket).

**Configuration** (`payload.config.ts`):

- `s3Storage` → `media` collection:
  - `disablePayloadAccessControl: true` — removes the `/api/media/file` handler.
  - `generateFileURL` → `publicMediaUrl(filename, prefix)` from `lib/media-url.ts`.

**URL shape:**

```
{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/{S3_BUCKET}/{filename}
```

Example: `https://spyhpakoxxzceltbdehn.supabase.co/storage/v1/object/public/media/1.%20prapavija-15.png`

**Required env (already in `.env` / Vercel):**

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Base for public object URLs |
| `S3_BUCKET` | Bucket name (default `media`) |

**Next.js / CSP** (no change needed when adding CDN):

- `next.config.mjs` → `images.remotePatterns` includes `spyhpakoxxzceltbdehn.supabase.co`.
- CSP `img-src` allows `https://*.supabase.co`.

**Hardcoded asset paths.** Do **not** use `/api/media/file/...` in app code; that route
is no longer registered. Use `publicMediaUrl('filename.webp')` from `lib/media-url.ts`
for static fallbacks (option swatches in `lib/house-mapper.ts`, planimetry defaults in
`HouseConfigurator`, `HousesArchive`, `ProductsGrid`). CMS-backed URLs come from Payload
`afterRead` via `generateFileURL` automatically.

**Uploads / admin.** Upload and delete still go through Payload + S3 adapter; only
**public read** bypasses the app. The storage bucket must stay **public** for these URLs.

**Troubleshooting:**

- Broken layer images → check object exists:
  `curl -I "{SUPABASE_URL}/storage/v1/object/public/media/{filename}"` (expect `200`).
- `403` on CDN URL → bucket or object not public; fix in Supabase Storage settings.
- New third-party image host → update `images.remotePatterns` and CSP `img-src` in
  `next.config.mjs`, then run `npx playwright test csp-audit`.

## Database SSL

`payload.config.ts` uses `rejectUnauthorized: false` for Supabase Postgres — common for managed providers; document in infra runbook.

## Staging

If staging runs with `NODE_ENV=production`, import APIs are blocked. Use `NODE_ENV=development` on a protected staging host, or add auth to import routes.

## Caching & revalidation (ISR)

House pages (`/[locale]/maisons` and `/[locale]/maisons/[slug]`) use ISR with
`revalidate = 600` (10 min). On top of the time-based window, changes are pushed
instantly via **on-demand revalidation**:

- `collections/Houses.ts` (`afterChange` / `afterDelete`) and
  `globals/HouseOptions.ts` (`afterChange`) call `revalidateHousePaths()`.

So editing a house or pricing in Payload refreshes the public pages immediately;
otherwise they refresh at most 10 minutes later. No manual step is needed after
CMS price or house changes.

## Database backups & point-in-time recovery (Supabase)

- **Daily backups**: enabled by default on Supabase paid plans. Verify under
  *Project → Database → Backups*.
- **Point-in-Time Recovery (PITR)**: enable under *Database → Backups → PITR*
  (recommended for production; lets you restore to any second within the
  retention window). Free/lower tiers only have daily snapshots.
- **Restore drill**: periodically test a restore into a throwaway project to
  confirm backups are usable. Document the restore time observed.
- **Storage (S3 media)**: the Supabase storage bucket holds order screenshots
  and house media. Ensure bucket versioning/retention is configured; media is
  not covered by Postgres backups.
