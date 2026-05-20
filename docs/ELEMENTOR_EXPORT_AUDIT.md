# Elementor Export Audit

Date: 2026-05-20

## Source

- Export file: `/Users/blendsylqevci/Downloads/ossaboisfrance.zip`
- Site: `https://ossaboisfrance.com`
- Elementor version: `3.35.5`
- Elementor Pro version: `3.35.1`
- Export created: `2026-05-19 23:40:52`

This export is a design/layout source of truth. It does not replace the ACF and WordPress XML data source for configurator fields, prices, house records, or layer mapping.

## Included Files

| File | Purpose |
| --- | --- |
| `site-settings.json` | Global Elementor settings, colors, typography, breakpoints, lightbox settings |
| `templates/40.json` | Global header template |
| `templates/59.json` | Global footer template |
| `templates/289.json` | Houses archive template |
| `templates/206.json` | Houses loop item template |
| `templates/488.json` | Carousel/loop item variant |
| `content/page/14.json` | Homepage |
| `content/page/17.json` | About page |
| `content/page/19.json` | Contact page |
| `content/page/21.json` | Gallery/Realisations page |
| `content/page/24.json` | B2B / Work with us page |
| `content/page/48.json` | Products page |
| `wp-content/nav_menu_item/nav_menu_item.xml` | Navigation menu items |
| `wp-content/houses/houses.xml` | House post data included in export |
| `custom-code.json` | Elementor custom code snippets |

## Global Design Tokens Found

Typography:

- Primary: `PP Neue Montreal`, weight `600`
- Secondary: `PP Neue Montreal`, weight `400`
- Text: `PP Neue Montreal`, weight `400`
- Accent: `PP Neue Montreal`, weight `500`

Elementor color tokens in the export are generic Kadence defaults. The project brand source remains:

- Primary project color: `#5E6F4F`
- Font source: `/Users/blendsylqevci/Downloads/pp-neue-montreal-cufonfonts.zip`

## Templates

### Header - `templates/40.json`

Manifest title: `Elementor Header #40`

Widgets/components:

- `theme-site-logo`
- `nav-menu`
- `button`

Important visible text:

- Button: `Contactez-nous`

Implementation impact:

- Header must be rebuilt from this template before visual 1:1 work is considered complete.
- Navigation labels must come from `wp-content/nav_menu_item/nav_menu_item.xml`.
- Logo asset must use the confirmed Ossa Bois logo, not a placeholder.

### Footer - `templates/59.json`

Manifest title: `Elementor Footer #59`

Widgets/components:

- `image`
- `heading`
- `text-editor`
- `nav-menu`
- `social-icons`
- `form`

Important visible text:

- `Navigation`
- `Our Address`
- `50 rue Chanzy 28000 Chartres`
- `Contact Us`
- `infoossabois@gmail.com`
- `Reseaux sociaux`
- `Contact for any question`
- Form submit text: `Send`

Implementation impact:

- Footer should be rebuilt after the header because it shares navigation and brand assets.
- Footer logo reference: `https://ossaboisfrance.com/wp-content/uploads/2025/10/ossa-bois-footer-02.png`

### Houses Archive - `templates/289.json`

Manifest title: `Elementor Archive #289`

Widgets/components:

- `heading`
- `text-editor`
- `loop-grid`

Important visible text:

- `Modéles de Maisons`
- `Our commitments and guarantees`
- `Maisons à toiture terrasse`
- `Maisons à toiture terrasse avec étage`

Implementation impact:

- This is the source for the products/houses listing layout.
- It uses loop grids, so the Next.js version should render category sections from house data rather than hard-coded cards.

### Loop Item - `templates/206.json`

Manifest title: `Elementor Loop Item #206`

Widgets/components:

- `image`
- `heading`
- `shortcode`
- `button`

Important visible text:

- Heading fallback: `Modele Amre`
- Button: `Voir et configurer`

Implementation impact:

- This is the source for house cards in French.
- The shortcode values must be replaced by real house fields from WordPress/ACF data.

### Carousel Loop Item - `templates/488.json`

Manifest title: `carousel slide`

Widgets/components:

- `image`
- `heading`
- `shortcode`
- `button`

Important visible text:

- Heading fallback: `Modele Amre`
- Button: `View & Configure`

Implementation impact:

- This appears to be a loop/card variant, probably for carousel usage.
- Needs confirmation before being used as the main French card because its button text is English.

## Pages

| Page ID | Title | Current URL | Export File | Main Widgets |
| --- | --- | --- | --- | --- |
| `14` | Homepage | `/` | `content/page/14.json` | headings, text, images, buttons, loop grids, reviews, carousel |
| `17` | About | `/about/` | `content/page/17.json` | headings, text, images, buttons, accordion |
| `19` | Contact | `/contact/` | `content/page/19.json` | contact form, map, contact info |
| `21` | Gallery | `/gallery/` | `content/page/21.json` | gallery, intro heading/text |
| `24` | B2B | `/b2b/` | `content/page/24.json` | form, FAQ accordion, image |
| `48` | Products | `/products/` | `content/page/48.json` | headings, text, loop grid |

## Navigation Items Found

From `wp-content/nav_menu_item/nav_menu_item.xml`:

- `Accueil`
- `Qui Sommes-Nous`
- `B2B`
- `Réalisations`
- `Modéles de Maisons`
- `Maisons à toiture terrasse`
- `Maisons à toiture terrasse avec étage`
- `Maisons de plain-pied`
- `Maisons avec combles aménageables`
- `Maisons avec étage`

Slugs found in the export:

- `home`
- `44`
- `b2b`
- `47`
- `products`
- `houses`
- `villa`
- `menu-item`
- `maison-combles`
- `maison-avec-etase`

Needs confirmation:

- Some exported menu slugs are numeric or generic, so final Next.js routes should be confirmed against the live site and Figma before being finalized.
- `maison-avec-etase` appears misspelled in the export. Do not copy this into final public URLs without confirmation.

## House Records Found In Elementor Export

The Elementor export includes 20 `houses` records:

| Status | Slug | Title | Category |
| --- | --- | --- | --- |
| publish | `a-frame-house` | `A frame house` | `Maison Toitu Terrasse` |
| publish | `a-frame-house-kulm` | `A Frame House (kulm)` | `Maison plein pied` |
| publish | `cristal` | `Cristal` | `Maison combles amenageable` |
| draft | `diademe` | `Diademe` | `Maison plein pied` |
| publish | `dianne` | `Dianne` | `Maison combles amenageable` |
| publish | `mairie` | `MAIRIE` | `Maison plein pied` |
| publish | `maison-a` | `Maison A` | `Maison plein pied` |
| publish | `maison-b` | `Maison B` | `Maison plein pied` |
| publish | `maison-c` | `Maison C` | `Maison plein pied` |
| publish | `maison-d` | `Maison D` | `Maison plein pied` |
| publish | `maison-e` | `Maison E` | `Maison plein pied` |
| publish | `maison-emmy` | `Maison Emmy` | `Maison toiture terrasse avec étage` |
| publish | `maison-jola` | `Maison Jola` | `Maison plein pied` |
| publish | `maison-loren` | `MAISON LOREN` | `Maison Toitu Terrasse` |
| publish | `maison-monna` | `Maison Monna` | `Maison plein pied` |
| publish | `medialuna` | `Medialuna` | `Maison plein pied` |
| publish | `mountain-valley-villa` | `Mountain Valley Villa` | `Maison combles amenageable` |
| draft | `ambre-me-cati` | `Ambre Asebra Charpente` | `Maison plein pied` |
| draft | `asebra-me-cati` | `Asebra Charpente` | `Maison plein pied` |
| draft | `maison-calme-me-cati` | `Maison Calme Charpente` | `Maison plein pied` |

Needs confirmation:

- Current local route `/fr/maisons/ambre` is a development route. The export does not include a published `ambre` slug in this Elementor `houses.xml` list.
- Ambre data currently comes from the separate WordPress XML/ACF sources and user-provided Ambre layer files.

## Asset References Found

Important remote asset URLs referenced by Elementor:

- `https://ossaboisfrance.com/wp-content/uploads/2025/10/placeholder-1.png`
- `https://ossaboisfrance.com/wp-content/uploads/2025/10/ossa-bois-footer-02.png`
- `https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-1.png`
- `https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-1-scaled.jpg`
- `https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-2-scaled.jpg`
- `https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-3-scaled.jpg`
- `https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-4-scaled.jpg`
- `https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-5-scaled.jpg`
- `https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-6-scaled.jpg`
- `https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-7-scaled.jpg`
- `https://ossaboisfrance.com/wp-content/uploads/2025/10/div.avarta.png`
- `https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-2.png`
- `https://ossaboisfrance.com/wp-content/uploads/2025/10/Image.png`
- `https://ossaboisfrance.com/wp-content/uploads/2025/10/leaf-line.png`
- `https://ossaboisfrance.com/wp-content/uploads/2025/10/Frame-1171274713.png`

Needs confirmation:

- The Elementor zip does not include local media binaries.
- Assets should be downloaded or replaced only when matched to the exact Elementor node/page/template that uses them.
- Some WordPress `default_image` IDs referenced by houses did not have attachment URLs in the available XML. For those cards, use the confirmed Elementor loop fallback image `https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-1.png` until the exact media is provided or recovered.

## Recommended Implementation Order

1. Finish configurator proof with Ambre using confirmed ACF/XML/theme logic.
2. Build shared header from `templates/40.json`.
3. Build shared footer from `templates/59.json`.
4. Build houses archive/products page from `templates/289.json` and loop item `templates/206.json`.
5. Build homepage from `content/page/14.json`.
6. Build remaining static pages: About, Contact, Gallery/Realisations, B2B.
7. Only after data and UI are stable, move confirmed fields into CMS.

## Rules For Using This Export

- Do not infer missing design values from memory.
- For each page/template, read the relevant JSON before changing its Next.js implementation.
- If a widget uses a shortcode, resolve the shortcode through the WordPress theme audit before replacing it.
- If a menu item has an unclear URL, verify against the live site before creating the final route.
- Do not use Elementor fallback text such as `Modele Amre` as final content without checking the house data source.
