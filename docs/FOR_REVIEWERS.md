# For reviewers

Quick orientation for developers, agencies, or technical auditors opening this repository.

## What this project is

Next.js 16 public website + Payload CMS 3 (PostgreSQL, S3 media) for **Ossa Bois France** — modular timber-frame house configurator, checkout/quote requests, and CMS-managed catalogue.

## Critical user journeys

| Journey | Entry | Backend |
|--------|--------|---------|
| Configure house | `/[locale]/maisons/[slug]` | Payload `houses` + `house-options` global |
| Place order / quote | `/[locale]/checkout` → `POST /api/checkout` | Orders collection + Resend emails |
| Contact | `/[locale]/contact` → `POST /api/contact` | Resend → `RESEND_ADMIN_EMAIL` |
| B2B | `/[locale]/b2b` → `POST /api/b2b` | Resend + optional attachment (≤10 MB) |
| CMS | `/admin` | Payload auth |

## House import (dev/staging only)

- List slugs: `GET /api/import-house`
- Import: `GET /api/import-house/{slug}`
- Blocked in production via `middleware.ts`

## Tests & CI

```bash
npm run typecheck
npm run test          # import + checkout pricing unit tests
npm run lint
npm run build
```

GitHub Actions: `.github/workflows/ci.yml`

## Environment (production)

Required:

- `DATABASE_URI`, `PAYLOAD_SECRET`
- S3: `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT`
- Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_ADMIN_EMAIL`

Optional: `NEXT_PUBLIC_SITE_URL` (absolute URLs for order screenshots in emails)

## Source of truth

See `docs/SOURCE_OF_TRUTH_RULES.md` — configurator layers and prices must match WordPress/ACF references, not guesses.

## Known layout

- `lib/house-mapper.ts` — CMS → configurator (large, stable)
- `lib/house-import.ts` — safe re-import engine
- `scratch/` — one-off migration scripts (not used at runtime)
