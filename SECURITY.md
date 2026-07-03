# Security Overview

This document describes the security controls implemented in this application, the
operational requirements for deploying it securely, and the residual risks that
have been consciously reviewed and accepted. It is intended for maintainers and
for third-party security reviewers.

Stack: Next.js 16 (App Router) · Payload CMS 3 · PostgreSQL (Supabase) ·
S3-compatible storage · Resend (email) · deployed on Vercel.

---

## 1. Authentication & Authorization

- **Admin authentication** is handled by Payload CMS (`/admin`, cookie/JWT
  sessions). Payload's built-in login lockout (`maxLoginAttempts` / `lockTime`)
  applies.
- **Role-based access control.** The `users` collection has a `role` field
  (`admin` | `editor`). Access to sensitive data is gated on the `admin` role:
  - `orders` (customer PII): `read` / `update` / `delete` require `admin`;
    public `create` via the REST/GraphQL API is disabled. Orders are created
    only by the server-side checkout route via the Local API.
  - `users`: `create` / `update` / `delete` and role changes require `admin`
    (no self-promotion).
- **Secure-by-default collections.** Payload denies access to any collection
  without an explicit `access` block unless a user is authenticated. The
  public-read surface is explicit and limited to non-sensitive content
  (`houses`, `house-categories`, `media`, `field-definitions`, and the public
  parts of the `house-options` global). Cost-basis fields (`marginPercent`,
  per-m² rates, base prices, window prices) are restricted to authenticated
  users at the field level.

## 2. Public API endpoints

`/api/checkout`, `/api/contact`, `/api/b2b` are the only public write endpoints.

- **Rate limiting** (`lib/rate-limit.ts`) — per-IP, backed by Upstash/Vercel KV
  (Redis) when configured, with a bounded in-memory fallback. The client IP is
  taken from the platform-trusted `x-real-ip` / `x-vercel-forwarded-for`
  header, never the client-forgeable left-most `X-Forwarded-For` entry.
- **Input validation & sanitization** (`lib/form-utils.ts`) — length limits,
  control/bidi-character stripping, single-line enforcement on names/subjects,
  email validation, honeypot field.
- **Server-authoritative pricing** — the checkout total is recomputed on the
  server from database values; the client-supplied figure is used only to
  detect a mismatch and is never persisted or emailed.
- **Email safety** — all user-supplied values are HTML-escaped before being
  interpolated into transactional emails; email is sent via the Resend JSON API
  (no SMTP header-injection surface). The confirmation-email image source is
  restricted to a host allowlist.
- **Upload limits** — the checkout screenshot is size-capped before decoding
  (image-bomb protection); B2B attachments are size- and extension-limited.

## 3. Web hardening

- **Security headers** (`next.config.mjs`): HSTS (2y, preload),
  `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`,
  `Permissions-Policy`, and a Content-Security-Policy.
- **JSON-LD** is serialized with `lib/json-ld.ts`, which escapes `<`, `>`, `&`
  and line separators to prevent `</script>` breakout / stored XSS.
- **Transport** — Postgres TLS verifies the server certificate when
  `DATABASE_CA_CERT` is provided (see `lib/db-ssl.ts`).

## 4. Maintenance / import endpoints

The `import-*`, `cleanup-*`, and `upload-planimetry` routes are operational data
tools. They are:

- **Blocked entirely in production** (Vercel `NODE_ENV=production`) by
  `middleware.ts`.
- **Optionally gated by `ADMIN_TASK_TOKEN`** in non-production environments.
- Path-traversal-guarded (`lib/upload-planimetry-from-raw.ts`).

## 5. Secrets management

- **No secrets are committed.** `.env*` (except `.env.example`), `scratch/`, and
  `*.rtf` are git-ignored. `.env.example` documents every variable with
  placeholder values only.
- Secrets are provided at runtime via environment variables (Vercel project
  settings).

---

## Operational requirements (must be satisfied for a secure deployment)

1. **Set all production environment variables** in Vercel (see `.env.example`).
   `PAYLOAD_SECRET` is mandatory in production (the app refuses to boot without
   it). Set `DATABASE_CA_CERT` to enable full DB TLS verification.
2. **Run database migrations** (`npm run migrate`) as part of every deploy that
   ships a schema change. The `role` column is added by
   `migrations/20260703_120000_add_user_role.ts`; existing users default to
   `admin`. Downgrade non-privileged staff accounts to `editor`.
3. **Keep the users table non-empty.** Payload exposes an unauthenticated
   first-user registration endpoint (`/api/users/first-register`) that is only
   active while zero users exist. Create the first admin immediately on initial
   deploy and after any database reset.
4. **Configure durable rate limiting** (`UPSTASH_REDIS_*` or `KV_REST_API_*`)
   in production so limits are shared across serverless instances.
5. **Rotate credentials on a compromise.** If any secret is exposed, rotate it
   in the source of truth (Supabase / Resend / Vercel) — rotation, not code
   changes, is the authoritative remediation.

## Reviewed & accepted residual risks

- **Order configuration screenshots** are stored in the public media bucket for
  CDN performance; URLs contain an unguessable millisecond suffix. Move
  order-specific media to a private bucket with signed URLs if stricter
  confidentiality is required.
- **CSP uses `'unsafe-inline'` for scripts/styles.** Next.js App Router with ISR
  caching cannot use per-request nonces; the primary stored-XSS sink (JSON-LD)
  is mitigated in code. Revisit if a nonce-compatible rendering strategy is
  adopted.
- **`npm audit`** reports advisories that are entirely transitive through the
  Payload CMS framework and its build/admin tooling (`drizzle-kit`/`esbuild`,
  `monaco-editor`/`dompurify`, `@babel/core`, OpenTelemetry). These are
  dev/build-time or admin-panel-only and are not reachable from the
  customer-facing application. They are remediated by keeping Payload updated.

## Reporting

Report suspected vulnerabilities privately to the maintainer; do not open a
public issue containing exploit details.
