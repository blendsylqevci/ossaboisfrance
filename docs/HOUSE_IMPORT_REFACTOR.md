# House import refactor (safe rollback)

## Branch

Work is on `refactor/house-import-engine`. To revert all code changes:

```bash
git checkout main
```

To keep work but undo last commit only:

```bash
git revert HEAD
```

## What changed (phase 1)

| File | Role |
|------|------|
| `lib/house-import.ts` | Single engine: **update** house by slug, upload layers, delete **old media only** after success |
| `lib/house-import-shared.ts` | France kulm flags, placeholders, media ID helpers |
| `lib/house-import-configs/*.ts` | Per-house file mapping + CMS text (no duplicated upload logic) |
| `lib/run-house-import-route.ts` | Thin API handler |
| `app/api/import-{asebra,a-frame,enea}-*/route.ts` | 3-line routes |

**All houses with layer folders** are importable via the shared engine:

- Legacy routes: `/api/import-asebra-me-kulm`, `/api/import-flora`, … (14 routes)
- **Unified route:** `GET /api/import-house/{slug}` — list slugs: `GET /api/import-house`

Configs live in `lib/house-import-configs/*.ts` (14 hand-tuned) + `lib/house-import-definitions.ts` (generated via `lib/build-house-import-config.ts`).

Re-import **never deletes the house row**. `preservePricingOnUpdate` on houses with real CMS prices.

## Tests

```bash
npm run test:import
```

**Enea fix:** no longer deletes the whole house row (was the main risk).

## Verify after import (no UI regression)

For each slug:

```bash
curl -s "http://localhost:3000/api/test-map?slug=asebra-avec-toit" | jq '.configuratorConfig.enableFlags, .configuratorConfig.defaultSelection'
curl -s "http://localhost:3000/api/test-map?slug=a-frame-house-me-kulm" | jq '.configuratorConfig.categories[] | select(.id=="couverture") | .options[].id'
curl -s "http://localhost:3000/api/test-map?slug=enea-avec-toit" | jq '.configuratorConfig.enableFlags'
curl -s "http://localhost:3000/api/test-map?slug=emeraude-me-kulm" | jq '.configuratorConfig.enableFlags'
curl -s "http://localhost:3000/api/test-map?slug=ambre-me-kulm" | jq '.configuratorConfig.enableFlags'
```

Browser: open `/fr/maisons/<slug>` — Couverture shows pare-pluie (0€), tuiles, bac-acier; layers render.

Re-run import only when disk files changed:

```bash
curl "http://localhost:3000/api/import-enea-me-kulm"
```

## Orphan media cleanup

```bash
curl -s "http://localhost:3000/api/cleanup-orphan-media?dryRun=true"
curl -s "http://localhost:3000/api/cleanup-orphan-media?dryRun=false"
```

Never deletes `asebra-me-atike_*` (used by `asebra-avec-attique`).

## Next phases (optional)

- Refactor `house-mapper.ts` (higher risk — separate PR)
- Broader orphan patterns after auditing Payload media table
