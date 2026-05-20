# House Category Configurator Audit

Date: 2026-05-20

## Sources

- WordPress export: `/Users/blendsylqevci/Downloads/ossaboiskit.WordPress.2026-05-19.xml`
- ACF house field mapping: `docs/ACF_HOUSE_FIELD_MAPPING.md`
- Archive data: `data/houses-archive.ts`
- Header menu labels: `components/SiteHeader.tsx`

This audit checks the five public house model groups and decides which houses can safely become configurators now.

## Public Model Groups

| Menu label | Archive id | WordPress category | Current frontend status |
| --- | --- | --- | --- |
| Maisons à toiture terrasse | `maison-toitu-terrasse` | `Maison Toitu Terrasse` | Has configurator-ready houses |
| Maisons à toiture terrasse avec étage | `maison-sans-faitage` | `Maison toiture terrasse avec étage` | Mostly detail pages; one missing price with layers |
| Maisons de plain-pied | `maison-plein-pied` | `Maison plein pied` | Detail pages only; no layers in current published records |
| Maisons avec combles aménageables | `maison-combles-ammenageable` | `Maison combles amenageable` | Detail pages only; no layers in current published records |
| Maisons avec étage | `maison-avec-etage` | `Maison avec étage` | Empty in current published house export |

## Published Houses By Category

### Maisons à toiture terrasse

| Slug | Title | Prices | Layers | Flags | Decision |
| --- | --- | --- | ---: | --- | --- |
| `a-frame-house` | A frame house | complete | 16 | none | Configurator candidate, needs layer audit because several layer names appear offset |
| `maison-loren` | MAISON LOREN | complete | 0 | none | Detail page only |
| `ambre-sans-faitage` | Ambre Toiture Terrasse | complete | 14 | `enable_etancheite_option` | Implemented configurator |
| `boreale` | Boreale Toiture Terrasse | complete | 19 | roof, etancheite, terrace, couverture, faux plafond | Implemented complex configurator |
| `maison-calme` | Maison Calme Toiture Terrasse | complete | 14 | `enable_etancheite_option` | Implemented configurator |
| `asebra` | ASEBRA Toiture Terrasse | complete | 14 | `enable_etancheite_option` | Implemented configurator |
| `cotage-toiture-terrasse` | Cotage Toiture Terrasse | missing | 14 | `enable_etancheite_option` | Cannot enable calculator until prices are confirmed |
| `diademe-toiture-terrasse` | Diademe Toiture Terrasse | missing | 14 | `enable_etancheite_option` | Cannot enable calculator until prices are confirmed |
| `emeraude-toiture-terrasse` | Emeraude Toiture Terrasse | missing | 14 | none | Cannot enable calculator until prices are confirmed |

### Maisons à toiture terrasse avec étage

| Slug | Title | Prices | Layers | Flags | Decision |
| --- | --- | --- | ---: | --- | --- |
| `maison-emmy` | Maison Emmy | complete | 0 | none | Detail page only |
| `australe` | Australe | complete | 0 | none | Detail page only |
| `emmy-house-etage-toiture-terrasse` | Emmy House Étage Toiture Terrasse | missing | 14 | `enable_etancheite_option` | Cannot enable calculator until prices/surfaces are confirmed |

### Maisons de plain-pied

| Slug | Title | Prices | Layers | Flags | Decision |
| --- | --- | --- | ---: | --- | --- |
| `a-frame-house-kulm` | A Frame House (kulm) | complete | 0 | none | Detail page only |
| `mairie` | MAIRIE | complete | 0 | none | Detail page only |
| `maison-a` | Maison A | complete | 0 | none | Detail page only |
| `maison-b` | Maison B | complete | 0 | none | Detail page only |
| `maison-c` | Maison C | complete | 0 | none | Detail page only |
| `maison-d` | Maison D | complete | 0 | none | Detail page only |
| `maison-e` | Maison E | complete | 0 | none | Detail page only |
| `maison-jola` | Maison Jola | complete | 0 | none | Detail page only |
| `maison-monna` | Maison Monna | complete | 0 | none | Detail page only |
| `medialuna` | Medialuna | complete | 0 | none | Detail page only |
| `mountainview-cottage` | Mountainview Cottage | complete | 0 | none | Detail page only |

### Maisons avec combles aménageables

| Slug | Title | Prices | Layers | Flags | Decision |
| --- | --- | --- | ---: | --- | --- |
| `cristal` | Cristal | complete | 0 | none | Detail page only |
| `dianne` | Dianne | complete | 0 | none | Detail page only |
| `mountain-valley-villa` | Mountain Valley Villa | complete | 0 | none | Detail page only |
| `nina-house` | Nina House | complete | 0 | none | Detail page only |
| `orenda` | Orenda | complete | 0 | none | Detail page only |

### Maisons avec étage

No published `houses` record in the current WordPress XML export uses the category `Maison avec étage`.

Keep the menu group because it exists in the Elementor/WordPress menu, but do not invent house records for it.

## Implementation Rules

- A house can become a configurator only when it has complete base prices, required surfaces, and confirmed `house_layers_*` mappings.
- A house with prices but no layers stays a detail page.
- A house with layers but missing prices stays a detail page until prices and surfaces are confirmed.
- A category can exist in the public menu even if it has no published house cards yet.
- Do not copy layer mappings from another house, even if filenames look similar.

## Next Safe Candidates

1. `a-frame-house`: prices and layers exist, but it needs extra layer audit because several layer filenames appear offset against layer keys.
2. `emmy-house-etage-toiture-terrasse`: layers exist, but prices and surfaces are missing, so it needs user/source confirmation first.
3. `cotage-toiture-terrasse`, `diademe-toiture-terrasse`, `emeraude-toiture-terrasse`: layers exist, but prices are missing, so they should not become calculators yet.
