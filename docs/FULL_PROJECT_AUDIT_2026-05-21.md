# Full Project Audit

Date: 2026-05-21

## Scope

This audit documents the current state of the Ossa Bois France rebuild after the WordPress/Elementor/Figma migration work, configurator logic work, Payload CMS setup, and the Payload admin CSS fix.

Rule for this document: report what is confirmed from the codebase and local CMS/API checks. Do not mark speculative work as complete.

## Executive Status

The project is now a working Next.js/Payload application with the public website and CMS separated into route groups:

- Public website: `app/(website)`
- Payload CMS/admin/API: `app/(payload)`
- Checkout API: `app/api/checkout/route.ts`

Confirmed local CMS/API inventory:

| Area | Current count/status |
| --- | ---: |
| Payload house records | 32 |
| Payload house categories | 5 |
| Payload media records | 230 |
| Files in `public/media` | 98 |
| Files in `public/images` | 77 |
| `npm run typecheck` | Passing |
| `npm run build` | Passing as of Payload CSS fix |
| `npm run lint` | Failing with known technical debt |

The main remaining risk is not basic functionality. The risk is source discipline: CMS data and mapped configurator options must not drift away from WordPress/ACF/theme behavior.

## Source Of Truth

Active source documents:

- `docs/SOURCE_OF_TRUTH_RULES.md`
- `docs/WORDPRESS_THEME_AUDIT.md`
- `docs/ELEMENTOR_EXPORT_AUDIT.md`
- `docs/ACF_HOUSE_FIELD_MAPPING.md`
- `docs/HOUSE_CATEGORY_CONFIGURATOR_AUDIT.md`

Original external/source files:

- WordPress XML: `/Users/blendsylqevci/Downloads/ossaboiskit.WordPress.2026-05-19.xml`
- ACF JSON: `/Users/blendsylqevci/Downloads/acf-export-2026-05-19.json`
- Elementor export: `/Users/blendsylqevci/Downloads/ossaboisfrance.zip`
- WordPress theme files in `/Users/blendsylqevci/Downloads`
- Figma: `Pobepo Website 01`
- Live site: `https://ossaboisfrance.com/`

Confirmed rule: no layer, price, field, route, text, spacing, or design choice should be guessed. If the source is unclear, mark it as `needs confirmation`.

## Technology Stack

| Layer | Current implementation |
| --- | --- |
| Framework | Next.js `16.2.6` App Router |
| React | `19.2.1` |
| TypeScript | `5.4.5` |
| CMS | Payload `3.84.1` |
| DB adapter | `@payloadcms/db-postgres` |
| Rich text | `@payloadcms/richtext-lexical` |
| Storage plugin | `@payloadcms/storage-s3` |
| Email | Resend REST endpoint in checkout API |
| Styling | Global CSS in `app/globals.css`; PP Neue Montreal loaded locally |

## Current Routing

Public website routes currently present:

| Route | Purpose |
| --- | --- |
| `/` | Root redirect/shell route |
| `/[locale]` | Homepage |
| `/[locale]/maisons` | Product/houses archive |
| `/[locale]/maisons/[slug]` | Dynamic house detail/configurator route |
| `/[locale]/checkout` | Checkout/request page |
| `/[locale]/contact` | Contact page |
| `/[locale]/qui-sommes-nous` | About page |
| `/[locale]/realisations` | Realisations/gallery page |
| `/[locale]/b2b` | B2B/work with us page |
| `/admin/[[...segments]]` | Payload admin |
| `/api/[...slug]` | Payload REST API |
| `/api/checkout` | Order/email endpoint |

Important implementation note: old direct `app/[locale]` routes were replaced by `app/(website)/[locale]` route groups. This is structurally correct because it separates public website layout from Payload layout.

## CMS/Payload Status

Payload is configured in `payload.config.ts` with these collections:

- `users`
- `media`
- `house-categories`
- `houses`
- `orders`

Confirmed CMS fix:

- `app/(payload)/layout.tsx` now imports `@payloadcms/next/css`.
- This fixed the broken unstyled Payload admin UI where `/admin` rendered as bare HTML with oversized SVG/logo.

CMS collections:

| Collection | Status | Notes |
| --- | --- | --- |
| `users` | Present | Uses Payload auth |
| `media` | Present | Upload dir is `public/media`; image sizes configured |
| `house-categories` | Present | 5 records confirmed via API |
| `houses` | Present | 32 records confirmed via API |
| `orders` | Present | Schema exists, but checkout API currently sends email and does not yet create Payload order records |

CMS warnings observed:

- Payload warns that no email adapter is configured; emails are written to console by Payload itself.
- Payload warns that image resizing is enabled but `sharp` is not installed.

These warnings do not block the public site, but they should be handled before production CMS use.

## CMS Data Inventory

Confirmed house categories:

| Slug | Name |
| --- | --- |
| `maison-avec-etage` | Maisons avec étage |
| `maison-combles-ammenageable` | Maisons avec combles aménageables |
| `maison-plein-pied` | Maisons de plain-pied |
| `maison-sans-faitage` | Maisons à toiture terrasse avec étage |
| `maison-toitu-terrasse` | Maisons à toiture terrasse |

Confirmed house records in Payload:

```txt
escape-villa-me-atike
orenda
nina-house
mountain-valley-villa
dianne
cristal
mountainview-cottage
medialuna
maison-monna
maison-jola
maison-e
maison-d
maison-c
maison-b
maison-a
mairie
maison-enea-me-kulm
asebra-me-kulm
a-frame-house-kulm
emmy-house-etage-toiture-terrasse
australe
maison-emmy
emeraude-toiture-terrasse
diademe-toiture-terrasse
cotage-toiture-terrasse
asebra
maison-calme
boreale
ambre-sans-faitage
maison-loren
a-frame-house
ambre
```

## Configurator Status

The reusable configurator component is:

- `components/HouseConfigurator.tsx`

Shared types are in:

- `data/house-configurator.ts`

Implemented local/static configurator data files:

| File | Export | Status |
| --- | --- | --- |
| `data/ambre.ts` | `ambreConfiguratorData` | Confirmed early POC data |
| `data/maison-calme.ts` | `maisonCalmeConfiguratorData` | Confirmed from WordPress/XML |
| `data/asebra.ts` | `asebraConfiguratorData` | Confirmed from WordPress/XML |
| `data/boreale.ts` | `borealeConfiguratorData` | Confirmed complex model |
| `data/escape-villa-atike.ts` | `escapeVillaAtikeConfiguratorData` | Candidate/imported data, needs stricter source review |
| `data/asebra-kulm.ts` | `asebraKulmConfiguratorData` | Candidate/imported data, needs stricter source review |
| `data/enea-kulm.ts` | `eneaKulmConfiguratorData` | Candidate/imported data, needs stricter source review |

Dynamic CMS-to-configurator mapper:

- `lib/house-mapper.ts`

Risk: `lib/house-mapper.ts` includes hardcoded option prices and some slug-specific fallbacks. This is useful as a bridge, but it must be audited against ACF/global options before being considered final source-of-truth logic.

Confirmed working configurator behaviors from previous browser checks:

- Select and unselect works.
- Layers are added and removed with option state.
- Price breakdown updates live.
- Material modal exists.
- Main image/preview supports zoom.
- Shared state resets when switching houses.
- Facade selection affects dependent image selection where configured.
- Boreale supports roof isolation and faux plafond.
- Boreale hides Couverture because no confirmed `couverture_*` layer exists on the source/live page.

Known configurator concerns:

- `components/HouseConfigurator.tsx` still has TypeScript `any` in selection handling.
- `continueToCheckout()` uses a route handoff that should be rechecked for locale and current CMS payload shape.
- Dynamic CMS mapper can enable configurators for records that have enough media fields, but prices/options need source validation first.

## Archive And Product Listing

Archive component:

- `components/HousesArchive.tsx`

Archive data:

- `data/houses-archive.ts`

Original implementation sources:

- Elementor archive template: `templates/289.json`
- Elementor card/loop template: `templates/206.json`

Confirmed archive decisions:

- Public archive has 5 model groups.
- Starting price follows `[house_starting_price]`: `price_60_x_160 * 1.4`.
- Archive cards use fallback media only when exact WordPress attachment URL was missing.

Current CMS direction:

- `/[locale]/maisons` should eventually read from Payload consistently.
- Avoid having two competing sources for archive data: `data/houses-archive.ts` and Payload records.

## Website Pages

Current public pages/components include:

- Homepage: `app/(website)/[locale]/page.tsx`
- About: `app/(website)/[locale]/qui-sommes-nous/page.tsx`
- Contact: `app/(website)/[locale]/contact/page.tsx`
- Realisations: `app/(website)/[locale]/realisations/page.tsx`
- B2B: `app/(website)/[locale]/b2b/page.tsx`
- Header: `components/SiteHeader.tsx`
- Footer: `components/SiteFooter.tsx`
- Carousels/grids: `HeroCarousel`, `ProductsCarousel`, `ProductsGrid`, `ReviewsCarousel`, `CollaboratorsCarousel`

Design status:

- A large part of the public website has been rebuilt.
- Exact 1:1 design QA is still a separate phase because the user explicitly wants Figma/live precision.
- Some pages contain ESLint/React Compiler warnings/errors that should be cleaned without changing visual behavior.

## Checkout And Email

Checkout UI:

- `components/checkout/CheckoutPage.tsx`
- `app/(website)/[locale]/checkout/page.tsx`

Checkout API:

- `app/api/checkout/route.ts`

Current behavior:

- Builds admin and client HTML emails.
- Uses Resend REST API when `RESEND_API_KEY` exists.
- Falls back to console logging locally.

Important gaps:

- Admin recipient currently appears as `info@ossaboisfrance.com` in the checkout route, while project business decision says phase 1 admin order recipient is `sylqevciblendi@gmail.com`.
- Orders collection exists in Payload, but checkout API does not yet create an `orders` record.
- Email sender/domain and Resend production setup still need production confirmation.

## Verification Status

Confirmed in this audit:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| Payload `/api/houses?limit=200` | 32 docs returned |
| Payload `/api/house-categories?limit=100` | 5 docs returned |
| Payload `/api/media?limit=1` | reports 230 media docs |

Known latest verification from recent work:

| Check | Result |
| --- | --- |
| `npm run build` | Passed after Payload CSS fix |
| `/admin` CSS | Fixed by importing `@payloadcms/next/css` |

Current lint result:

- `npm run lint` fails with 24 errors and 15 warnings.
- These are mostly cleanup/typing issues and React Compiler constraints, not a Payload CSS regression.

## Lint Debt

Current lint issue groups:

| File/area | Issue |
| --- | --- |
| `app/(payload)/admin/importMap.d.ts` | generated Payload `any` type |
| `app/(website)/[locale]/b2b/page.tsx` | unused imports/vars and `let` should be `const` |
| `app/(website)/[locale]/page.tsx` | unescaped apostrophes and unused `featuredHouses` |
| `app/(website)/[locale]/qui-sommes-nous/page.tsx` | unescaped apostrophes |
| `app/(website)/[locale]/realisations/page.tsx` | direct `document.body.style.overflow` mutation violates React Compiler immutability; hook dependency warnings |
| `app/api/checkout/route.ts` | `transportCost` unused and `catch (error: any)` |
| `components/AboutStats.tsx` | unused `start`; `let` should be `const` |
| `components/HouseConfigurator.tsx` | selection handling uses `any`; image warnings |
| `components/ProductsCarousel.tsx` | missing effect dependency |
| `components/checkout/CheckoutPage.tsx` | unused `transport` |
| `lib/house-mapper.ts` | `any` types |
| `sources/house-builder.js` | parsing error from raw WordPress source file; should be excluded from lint or moved outside lint scope |

Recommendation: do a dedicated lint cleanup phase with visual smoke tests after each file group. Do not mix lint cleanup with design changes.

## Main Risks

1. **Two data paths exist right now**
   - Static source-backed files under `data/*`
   - Dynamic Payload records through `lib/house-mapper.ts`
   - Risk: prices/layers may differ if both paths evolve separately.

2. **CMS mapper may be too optimistic**
   - It creates categories/options dynamically from available layers.
   - It includes hardcoded option prices that must be reconciled with ACF global options and WordPress live data.

3. **Checkout is email-first but not fully CMS-backed**
   - Emails can be sent/logged.
   - Payload `orders` records are not yet created.

4. **Admin recipient mismatch**
   - Business decision: `sylqevciblendi@gmail.com`
   - API route currently sends admin notification to `info@ossaboisfrance.com`.

5. **Source files included in lint**
   - `sources/house-builder.js` is a raw WordPress source artifact and should not be linted as app code.

6. **Image processing**
   - Payload image sizes are configured, but `sharp` is missing.

7. **Exact design QA is still pending**
   - The website is broadly built, but 1:1 Figma/live comparison must be performed page by page.

## Recommended Next Safe Phase

The next professional step should be **CMS hardening and data-source alignment**, not more visual expansion.

Recommended order:

1. Fix the admin order recipient in checkout API to match the confirmed business decision.
2. Decide whether frontend product/detail pages should read exclusively from Payload or keep static `data/*` until CMS is fully approved.
3. Audit `lib/house-mapper.ts` against ACF/global options and remove hardcoded assumptions.
4. Add Payload order creation inside `/api/checkout`.
5. Run a focused lint cleanup phase, excluding raw WordPress source files from ESLint.
6. Install/configure `sharp` or remove image resizing until production media strategy is final.
7. Then resume page-by-page 1:1 design QA.

## Do Not Touch Without Confirmation

- Layer mappings for new houses.
- Hardcoded option prices in `lib/house-mapper.ts`.
- CMS schema fields that may change admin workflow.
- Checkout email recipients/senders, except to align with already confirmed `sylqevciblendi@gmail.com`.
- Visual spacing/typography on public pages during a CMS-only phase.

