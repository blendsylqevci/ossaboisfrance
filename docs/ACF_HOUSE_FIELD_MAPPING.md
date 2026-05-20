# ACF House Field Mapping

Date: 2026-05-20

## Sources

- ACF export: `/Users/blendsylqevci/Downloads/acf-export-2026-05-19.json`
- WordPress export: `/Users/blendsylqevci/Downloads/ossaboiskit.WordPress.2026-05-19.xml`
- Theme template: `/Users/blendsylqevci/Downloads/single-houses.php`
- Theme scripts: `/Users/blendsylqevci/Downloads/house-builder.js`
- Theme functions: `/Users/blendsylqevci/Downloads/functions.php`

This document maps real WordPress/ACF fields before CMS implementation. Do not create CMS schema from memory; use this mapping first.

## ACF Groups

### Global House Options

ACF group: `Global House Options` (`group_68e824a6eb6fe`)

These are option-page repeaters. They are shared across houses, but each option only renders when the current house has a matching `house_layers_*` image.

| Field | Label | Type | Purpose |
| --- | --- | --- | --- |
| `global_isolation_options` | Isolation intermédiaire / Izolim i ndërmjetëm | repeater | Internal insulation options |
| `global_outer_isolation_options` | Isolation extérieure / Izolim i jashtëm | repeater | External insulation options |
| `global_facade_options` | Revêtement extérieur / Façade / Veshja e jashtme / Fasada | repeater | Exterior facade options |
| `global_roof_options` | Étanchéité / Pare-pluie / Hidroizolim / Mbrojtje nga shiu | repeater | EPDM / waterproofing options |
| `global_menuiseries_options` | Menuiseries extérieures / Dyer dhe dritare | repeater | Windows/doors options |
| `global_roof_isolation_options` | Isolation de la toiture par l’extérieur / Izolim i çatisë nga jashtë | repeater | Roof insulation options |
| `global_couverture_options` | Couverture / Mbulesa e kulmit | repeater | Roof covering options |
| `global_terrace_etancheite_options` | Étanchéité toiture terrasse avec couvertine / Hidroizolim i tarracës me kapak mbrojtës | repeater | Terrace waterproofing options |
| `global_faux_plafond_options` | Faux plafond / Tavan i brendshëm | repeater | Interior ceiling options |

Common repeater sub-fields:

| Field | Type | Notes |
| --- | --- | --- |
| `option_name` | text | Display label |
| `option_image` | image | Main option image |
| `option_mini_image` | image | Thumbnail shown in option card |
| `option_price` | number | Price for 60x160 or default price |
| `option_price_200` | number | Optional price override for 60x200 |
| `option_description` | textarea | Material popup/detail text |
| `layer_key` | text | Must match a current house `house_layers_*` key |

### House Product Details

ACF group: `House Product Details` (`group_68e8222d659dc`)

| Field | Label | Type | Purpose |
| --- | --- | --- | --- |
| `house_subheading` | house subheading | text | Subtitle near single house title |
| `default_image` | Default Image | image | Main/default house image |
| `price_60_x_160` | Price 60 x 160 | text | Base structure price before 40% margin |
| `price_60_x_200` | Price 60 x 200 | text | Base structure price before 40% margin |
| `perdhesa` | Dimenzonet | group | Surface/measurement values for formulas |
| `house_description` | House Description | textarea | Description and archive short text source |
| `house_specification` | House Specification | textarea | Specification tab/content |
| `windows` | Menuiseries / Dritaret | group | House-specific aluminium/PVC window prices |
| `enable_roof_option` | Enable Roof Option | true_false | Enables roof insulation flow |
| `enable_etancheite_terrasse` | Activer l’étanchéité terrasse | true_false | Enables terrace waterproofing when no roof option |
| `house_layers` | House Layers | group | Visual layer image references |
| `enable_etancheite_option` | Enable Etancheite Option | true_false | Enables EPDM / pare-pluie option |
| `enable_faux_plafond_option` | Enable Faux Plafond Option | true_false | Enables false-ceiling options |
| `enable_couverture_option` | Enable Couverture Option | true_false | Enables roof covering options |

### `perdhesa` Sub-Fields

These values are used by the calculator.

| Field | Purpose |
| --- | --- |
| `bruto` | Gross surface |
| `neto` | Net surface |
| `mure_te_jashtme` | External wall surface; multiplier for isolation/facade |
| `mure_mbajtese` | Load-bearing wall surface |
| `mure_ndarese` | Partition wall surface |
| `pllaka_e_kulmit` | Roof slab surface; multiplier for roof/EPDM/couverture/terrace |
| `pllaka_e_katit_0` | Floor slab 0 |
| `pllaka_e_katit_1` | Floor slab 1 |
| `pllaka_e_katit_2` | Floor slab 2 |
| `pllaka_e_katit` | Floor slab |
| `kulmi` | Roof |

### `windows` Sub-Fields

| Field | Purpose |
| --- | --- |
| `aluminium_price` | House-level aluminium windows/doors price |
| `pvc_price` | House-level PVC windows/doors price |

Needs confirmation:

- Older WordPress meta also contains `windows_alumil-feal_price`, `windows_trocal_price`, and facade-specific window price fields. The current `single-houses.php` reads only `windows.aluminium_price` and `windows.pvc_price`.

## House Layer Keys

These are the confirmed layer keys from `single-houses.php` and ACF.

| Layer key | Purpose |
| --- | --- |
| `bg` | Background/base image |
| `konstruksioni` | Wood structure |
| `iso_inter_verre` | Internal glass wool insulation |
| `iso_inter_roche` | Internal rock wool insulation |
| `iso_inter_bois` | Internal wood wool insulation |
| `iso_ext_roche_comprimee` | External compressed rock wool |
| `iso_ext_polystyrene` | External polystyrene |
| `iso_ext_fibre` | External fibre |
| `etancheite_epdm` | EPDM / waterproofing |
| `roof_polystyrene` | Roof polystyrene insulation |
| `roof_roche` | Roof rock wool insulation |
| `roof_verre` | Roof glass wool insulation |
| `couverture_pare_pluie_lattage` | Roof covering pare-pluie/lattage |
| `couverture_tuiles_gouttieres` | Roof tiles/gutters |
| `couverture_bac_acier_gouttieres` | Steel roof/gutters |
| `terrace_etancheite_epdm` | Terrace EPDM waterproofing |
| `faux_plafond_verre` | False ceiling glass wool |
| `faux_plafond_roche` | False ceiling rock wool |
| `faux_plafond_bois` | False ceiling wood wool |
| `facade_blanche` | White facade |
| `facade_bardage` | Wood cladding facade |
| `windows_aluminium` | Aluminium windows/doors |
| `windows_pvc` | PVC windows/doors |

## Rendering Rules From `single-houses.php`

- Base structure prices receive a 40% margin:
  - `price_60_x_160 * 1.4`
  - `price_60_x_200 * 1.4`
- Global option repeaters render only if the current house has a matching layer image for the option `layer_key`.
- `enable_roof_option` controls roof insulation.
- `enable_etancheite_option` controls EPDM / pare-pluie.
- `enable_couverture_option` is only relevant when `enable_roof_option` is true.
- `enable_etancheite_terrasse` renders terrace waterproofing only when `enable_roof_option` is false.
- `enable_faux_plafond_option` controls false-ceiling options.
- Menuiseries prices are house-specific from the `windows` group.

## Pricing Formula From `house-builder.js`

| Category | Formula |
| --- | --- |
| Base structure | selected size base price |
| Internal insulation | `option_price * perdhesa.mure_te_jashtme` |
| External insulation | `option_price * perdhesa.mure_te_jashtme` |
| Facade | `option_price * perdhesa.mure_te_jashtme` |
| EPDM / roof / couverture / terrace | `option_price * perdhesa.pllaka_e_kulmit` |
| Faux plafond | `option_price * perdhesa.pllaka_e_kulmit` or confirmed surface once checked per option |
| Menuiseries | fixed house-level price |

Needs confirmation:

- Faux plafond formula should be validated with a real house where `enable_faux_plafond_option = 1`. Current script groups roof-like options around roof surface, but this must be confirmed before enabling broadly.

## House Configurator Readiness From WordPress XML

This table answers: which houses already have `house_layers_*` data and can be candidates for a real configurator next.

| Status | Slug | Title | Category | 60x160 | 60x200 | Layer count | Active flags |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| publish | `a-frame-house` | A frame house | Maison Toitu Terrasse | 17022 | 18522 | 16 | none |
| publish | `a-frame-house-kulm` | A Frame House (kulm) | Maison plein pied | 16060 | 17560 | 0 | none |
| publish | `cristal` | Cristal | Maison combles amenageable | 37443 | 38354 | 0 | none |
| draft | `diademe` | Diademe | Maison plein pied | 16100 | 17600 | 0 | none |
| publish | `dianne` | Dianne | Maison combles amenageable | 26675 | 28175 | 0 | none |
| publish | `mairie` | MAIRIE | Maison plein pied | 20113 | 21613 | 0 | none |
| publish | `maison-a` | Maison A | Maison plein pied | 20113 | 21613 | 0 | none |
| publish | `maison-b` | Maison B | Maison plein pied | 19335 | 20835 | 0 | none |
| publish | `maison-c` | Maison C | Maison plein pied | 18037 | 19537 | 0 | none |
| publish | `maison-d` | Maison D | Maison plein pied | 15116 | 16616 | 0 | none |
| publish | `maison-e` | Maison E | Maison plein pied | 15370 | 16870 | 0 | none |
| publish | `maison-emmy` | Maison Emmy | Maison toiture terrasse avec étage | 37157 | 38657 | 0 | none |
| draft | `ambre-me-cati` | Ambre Asebra Charpente | Maison plein pied | 21563 | 23063 | 0 | none |
| draft | `asebra-me-cati` | Asebra Charpente | Maison plein pied | 28693 | 30193 | 0 | none |
| draft | `maison-calme-me-cati` | Maison Calme Charpente | Maison plein pied | 28262 | 29762 | 0 | none |
| publish | `maison-jola` | Maison Jola | Maison plein pied | 17433 | 18933 | 0 | none |
| publish | `maison-loren` | MAISON LOREN | Maison Toitu Terrasse | 20716 | 22216 | 0 | none |
| publish | `maison-monna` | Maison Monna | Maison plein pied | 19138 | 20638 | 0 | none |
| publish | `medialuna` | Medialuna | Maison plein pied | 28605 | 30105 | 0 | none |
| publish | `mountain-valley-villa` | Mountain Valley Villa | Maison combles amenageable | 20630 | 22130 | 0 | none |
| publish | `mountainview-cottage` | Mountainview Cottage | Maison plein pied | 14100 | 15600 | 0 | none |
| publish | `nina-house` | Nina House | Maison combles amenageable | 26863 | 30363 | 0 | none |
| publish | `orenda` | Orenda | Maison combles amenageable | 32550 | 34050 | 0 | none |
| publish | `ambre-sans-faitage` | Ambre Toiture Terrasse | Maison Toitu Terrasse | 25985 | 27485 | 14 | `enable_etancheite_option` |
| publish | `australe` | Australe | Maison toiture terrasse avec étage | 30393 | 31893 | 0 | none |
| publish | `boreale` | Boreale Toiture Terrasse | Maison Toitu Terrasse | 27462 | 28962 | 19 | `enable_roof_option`, `enable_etancheite_option`, `enable_etancheite_terrasse`, `enable_couverture_option`, `enable_faux_plafond_option` |
| publish | `maison-calme` | Maison Calme Toiture Terrasse | Maison Toitu Terrasse | 31292 | 32792 | 14 | `enable_etancheite_option` |
| publish | `asebra` | ASEBRA Toiture Terrasse | Maison Toitu Terrasse | 28693 | 30193 | 14 | `enable_etancheite_option` |
| publish | `cotage-toiture-terrasse` | Cotage Toiture Terrasse | Maison Toitu Terrasse | missing | missing | 14 | `enable_etancheite_option` |
| publish | `diademe-toiture-terrasse` | Diademe Toiture Terrasse | Maison Toitu Terrasse | missing | missing | 14 | `enable_etancheite_option` |
| publish | `emeraude-toiture-terrasse` | Emeraude Toiture Terrasse | Maison Toitu Terrasse | missing | missing | 14 | none |
| publish | `emmy-house-etage-toiture-terrasse` | Emmy House Étage Toiture Terrasse | Maison toiture terrasse avec étage | missing | missing | 14 | `enable_etancheite_option` |

## Recommended Next Configurator Candidates

1. `maison-calme`, `asebra`, or `a-frame-house`: published, has prices, has layers, simpler than Boreale.
2. `boreale`: published, has prices, has the richest layer/flag coverage, but higher risk because it exercises roof, terrace, couverture, and faux plafond logic.
3. `cotage-toiture-terrasse`, `diademe-toiture-terrasse`, `emeraude-toiture-terrasse`, `emmy-house-etage-toiture-terrasse`: have layers but are missing base prices, so they are not safe for calculator work yet.

Professional recommendation:

- Build one more simple terrace house configurator from the 14-layer group before Boreale.
- Then use Boreale as the full complex configurator test because it has all optional flags.

## Implemented Configurator Records

### `maison-calme`

Route: `/fr/maisons/maison-calme`

Confirmed source values:

| Field | Value |
| --- | --- |
| Title | Maison Calme Toiture Terrasse |
| Category | Maison Toitu Terrasse |
| `price_60_x_160` | 31292 |
| `price_60_x_200` | 32792 |
| Frontend base price `60x160` | 43808.8 |
| Frontend base price `60x200` | 45908.8 |
| `perdhesa.bruto` | 132.07 |
| `perdhesa.neto` | 115.8 |
| `perdhesa.mure_te_jashtme` | 203 |
| `perdhesa.mure_mbajtese` | 36 |
| `perdhesa.mure_ndarese` | 55 |
| `perdhesa.pllaka_e_kulmit` | 132 |
| `windows.aluminium_price` | 7564 |
| `windows.pvc_price` | 6176 |

Confirmed flags:

| Flag | Value | Frontend result |
| --- | --- | --- |
| `enable_roof_option` | 0 | Roof isolation hidden |
| `enable_etancheite_option` | 1 | EPDM / pare-pluie shown |
| `enable_etancheite_terrasse` | 0 | Terrace waterproofing hidden |
| `enable_couverture_option` | 0 | Couverture hidden |
| `enable_faux_plafond_option` | 0 | Faux plafond hidden |

Confirmed browser checks:

- Initial route state shows only `bg` and `konstruksioni` active.
- Initial route state selects only `60x160`.
- Initial price is `€43 808,80`.
- Selecting `Laine de verre` activates `iso_inter_verre` and updates price to `€46 072,25`.
- Selecting `Laine de verre` again unselects it, removes `iso_inter_verre`, and returns price to `€43 808,80`.

### `asebra`

Route: `/fr/maisons/asebra`

Confirmed source values:

| Field | Value |
| --- | --- |
| Title | ASEBRA Toiture Terrasse |
| Category | Maison Toitu Terrasse |
| `price_60_x_160` | 28693 |
| `price_60_x_200` | 30193 |
| Frontend base price `60x160` | 40170.2 |
| Frontend base price `60x200` | 42270.2 |
| `perdhesa.bruto` | 117.86 |
| `perdhesa.neto` | 103.6 |
| `perdhesa.mure_te_jashtme` | 125 |
| `perdhesa.mure_mbajtese` | 24 |
| `perdhesa.mure_ndarese` | 74 |
| `perdhesa.pllaka_e_kulmit` | empty in XML |
| `perdhesa.kulmi` | 163 |
| Frontend roof/EPDM surface | 163 |
| `windows_alumil-feal_price` | 7331 |
| `windows_trocal_price` | 5778 |

Confirmed flags:

| Flag | Value | Frontend result |
| --- | --- | --- |
| `enable_roof_option` | 0 | Roof isolation hidden |
| `enable_etancheite_option` | 1 | EPDM / pare-pluie shown |
| `enable_etancheite_terrasse` | 0 | Terrace waterproofing hidden |
| `enable_couverture_option` | absent | Couverture hidden |
| `enable_faux_plafond_option` | absent | Faux plafond hidden |

Confirmed browser checks:

- Initial route state shows only `bg` and `konstruksioni` active.
- Initial route state selects only `60x160`.
- Initial price is `€40 170,20`.
- Selecting `Laine de verre` activates `iso_inter_verre` and updates price to `€41 563,95`.
- Selecting `Laine de verre` again unselects it, removes `iso_inter_verre`, and returns price to `€40 170,20`.

Source-backed exception:

- WordPress XML has `perdhesa_pllaka_e_kulmit` empty but `perdhesa_kulmi = 163`.
- The frontend maps this value into `perdhesa.pllaka_e_kulmit` only for calculation compatibility with the existing shared calculator.

### `boreale`

Route: `/fr/maisons/boreale`

Confirmed source values:

| Field | Value |
| --- | --- |
| Title | Boreale Toiture Terrasse |
| Category | Maison Toitu Terrasse |
| `price_60_x_160` | 27462 |
| `price_60_x_200` | 28962 |
| Frontend base price `60x160` | 38446.8 |
| Frontend base price `60x200` | 40546.8 |
| `perdhesa.bruto` | 124.8 |
| `perdhesa.neto` | 109 |
| `perdhesa.mure_te_jashtme` | 167 |
| `perdhesa.mure_mbajtese` | 41 |
| `perdhesa.mure_ndarese` | 63 |
| `perdhesa.pllaka_e_kulmit` | 122 |
| `windows_alumil-feal_price` | 9084 |
| `windows_trocal_price` | 5034 |

Confirmed flags:

| Flag | Value | Frontend result |
| --- | --- | --- |
| `enable_roof_option` | 1 | Roof isolation shown |
| `enable_etancheite_option` | 1 | EPDM / pare-pluie shown |
| `enable_etancheite_terrasse` | 1 | Hidden because `enable_roof_option` is true |
| `enable_couverture_option` | 1 | Hidden because no confirmed `couverture_*` layer exists |
| `enable_faux_plafond_option` | 1 | Faux plafond shown |

Confirmed browser checks:

- Initial route state shows only `bg` and `konstruksioni` active.
- Initial route state selects only `60x160`.
- Initial price is `€38 446,80`.
- Roof isolation and faux plafond are visible.
- Couverture is hidden, matching WordPress live behavior for this house.
- Selecting `Laine de Verre - 220mm` activates `roof_verre` and updates price to `€39 870,54`.
- Selecting `Laine de Verre - 220mm` again unselects it, removes `roof_verre`, and returns price to `€38 446,80`.
- Selecting faux plafond `Laine de Roche` activates `faux_plafond_roche` and updates price to `€40 250,40`.

Source-backed exception:

- WordPress XML has `enable_couverture_option = 1`, but the house has no confirmed `house_layers_couverture_*` values.
- The live WordPress page does not render the Couverture section for `boreale`; the new frontend follows that behavior.

### `asebra-me-kulm`

Route: `/fr/maisons/asebra-me-kulm`

Confirmed source values:

| Field | Value |
| --- | --- |
| Title | Asebra avec Toit |
| Category | Maison plain pied |
| `price_60_x_160` | 28693 |
| `price_60_x_200` | 30193 |
| Frontend base price `60x160` | 40170.2 |
| Frontend base price `60x200` | 42270.2 |
| `perdhesa.bruto` | 117.86 |
| `perdhesa.neto` | 103.6 |
| `perdhesa.mure_te_jashtme` | 125 |
| `perdhesa.mure_mbajtese` | 24 |
| `perdhesa.mure_ndarese` | 74 |
| `perdhesa.pllaka_e_kulmit` | 163 |
| `windows.aluminium_price` | 7331 |
| `windows.pvc_price` | 5778 |

Confirmed flags:

| Flag | Value | Frontend result |
| --- | --- | --- |
| `enable_roof_option` | 1 | Roof EPDM pare-pluie shown |
| `enable_etancheite_option` | 1 | EPDM / pare-pluie shown |
| `enable_etancheite_terrasse` | 0 | Terrace waterproofing hidden |
| `enable_couverture_option` | 1 | Couverture (Tuiles / Bac Acier) shown |
| `enable_faux_plafond_option` | 0 | Faux plafond hidden |

Confirmed browser checks:

- Initial route state shows only `bg` and `konstruksioni` active.
- Initial route state selects only `60x160`.
- Initial price is `€40 170,20`.
- Selecting `Couverture Tuiles (Céramique)` activates `couverture_tuiles_gouttieres` and updates price.
- Selecting `Couverture Bac Acier (Tôle)` activates `couverture_bac_acier_gouttieres` and updates price.
- Selecting `Menuiseries Aluminium` activates `windows_aluminium` and updates price.

