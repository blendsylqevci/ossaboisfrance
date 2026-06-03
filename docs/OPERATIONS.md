# Operations

## Production environment

| Variable | Notes |
|----------|--------|
| `RESEND_ADMIN_EMAIL` | **Required** in production for contact, B2B, and checkout admin notifications |
| `RESEND_API_KEY` | Required for real email delivery |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://ossaboisfrance.com` — used for absolute media URLs in order emails |
| `PAYLOAD_SECRET` | Must be set; no fallback in production |

## API rate limits (in-memory, per instance)

| Route | Limit |
|-------|--------|
| `POST /api/contact` | 8 / 15 min / IP |
| `POST /api/b2b` | 5 / 15 min / IP |
| `POST /api/checkout` | 6 / 15 min / IP |

For strict global limits on serverless, add Upstash Redis or Vercel Firewall.

## Dev-only routes (blocked when `NODE_ENV=production`)

- `/api/import-*`, `/api/import-house/*`
- `/api/cleanup-*`, `/api/test-*`, `/api/seed-*`, `/api/migrate`, `/api/reseed`

## Order configuration screenshots

Checkout uploads the client canvas to **Payload `media`** (S3), not the local filesystem — safe on Vercel.

## Database SSL

`payload.config.ts` uses `rejectUnauthorized: false` for Supabase Postgres — common for managed providers; document in infra runbook.

## Staging

If staging runs with `NODE_ENV=production`, import APIs are blocked. Use `NODE_ENV=development` on a protected staging host, or add auth to import routes.

## After CMS price or house changes

Re-import is optional for media only. For cache: house pages use `force-dynamic` today — no stale HTML risk; revisit `revalidate` if enabling static caching later.
