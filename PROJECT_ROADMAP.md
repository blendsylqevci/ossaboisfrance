# Ossa Bois France - Project Roadmap

## Qellimi

Te rindertohet `ossaboisfrance.com` jashte WordPress-it si platforme profesionale ecommerce/request-order me CMS, konfigurator vizual me layers, shume gjuhe dhe dizajn 1:1 sipas Figma-s.

## Burimet Kryesore

- Figma: Pobepo Website 01
- Website aktual: https://ossaboisfrance.com/
- WordPress export: `ossaboiskit.WordPress.2026-05-19.xml`
- ACF export: `acf-export-2026-05-19.json`
- PDF plan: `Plan_Platforma_Shtepive_Modulare.pdf`
- Test asset set: `Ambre me atike` layers
- WordPress theme audit: `docs/WORDPRESS_THEME_AUDIT.md`
- Elementor export: `/Users/blendsylqevci/Downloads/ossaboisfrance.zip`
- Elementor export audit: `docs/ELEMENTOR_EXPORT_AUDIT.md`
- Source-of-truth rules: `docs/SOURCE_OF_TRUTH_RULES.md`
- ACF house field mapping: `docs/ACF_HOUSE_FIELD_MAPPING.md`
- House category/configurator audit: `docs/HOUSE_CATEGORY_CONFIGURATOR_AUDIT.md`

## Stack i Synuar

- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS
- CMS: Payload CMS
- Database: PostgreSQL
- Storage: Supabase Storage ose S3-compatible storage
- Email: Resend + React Email
- Hosting: Vercel
- Languages: French primary, then English, German, Dutch

## Brand Inputs

- Primary color: `#5E6F4F`
- Primary font: `PP Neue Montreal`
- Primary font source: `/Users/blendsylqevci/Downloads/pp-neue-montreal-cufonfonts.zip`
- Logo files:
  - `/Users/blendsylqevci/Downloads/OSSA-BOIS-LOGO-01-scaled.png`
  - `/Users/blendsylqevci/Downloads/OSSA-BOIS-LOGO-01-01-scaled.png`
  - `/Users/blendsylqevci/Downloads/ossa-bois-footer-02.png`

## Business Decisions

- Primary language: French (`fr`)
- Additional languages: English (`en`), German (`de`), Dutch (`nl`)
- Phase 1 payment flow: no online payment
- Phase 1 order flow: order/request is sent by email to admin and customer
- Phase 1 admin order recipient: `sylqevciblendi@gmail.com`

## Rregulla Pune

1. Asnje faze nuk quhet e mbaruar pa testim.
2. Nuk kalojme ne fazen tjeter pa checklist te mbyllur.
3. Dizajni krahasohet me Figma dhe website-in aktual para se te pranohet.
4. Cdo feature kryesor duhet te jete responsive per desktop, tablet dhe mobile.
5. CMS fields duhet te jene te kuptueshme per admin jo-teknik.
6. Konfiguratori testohet fillimisht vetem me nje shtepi: Ambre.
7. Pas validimit me Ambre, logjika behet reusable per te gjitha shtepite.
8. Te dhenat e importuara nga WordPress nuk ndryshohen manualisht pa arsye.
9. Cdo migrim duhet te kete script ose procedure te perseritshme.
10. Cdo forme qe ruan ose dergon data duhet te kete validim frontend dhe backend.
11. Email-et testohen me adrese test para se te lidhen me email zyrtar.
12. Performance dhe SEO maten para launch-it.
13. Nuk hamendesohet asnjehere per layer, cmim, field, route, tekst, spacing ose design.
14. Cdo vendim duhet te bazohet ne nje burim real: ACF export, WordPress XML, theme files, Elementor zip, Figma ose live site.
15. Nese burimet bien ndesh, prioriteti per configurator eshte: ACF house data -> theme PHP/JS/CSS -> WordPress XML -> live site -> Figma.
16. Nese nje burim mungon ose nuk eshte i qarte, shenohet `needs confirmation` dhe nuk lidhet gabimisht me supozim.
17. Layer mapping duhet te kontrollohet me `house_layers_*` per shtepine konkrete, jo me emrin e file-it.
18. CMS schema ndertohet vetem pasi logjika dhe field-et reale jane provuar me data lokale.
19. Pas cdo faze/feature te mbyllur, perditesohet roadmap/source-of-truth me statusin, testet, riskun dhe cfare mbetet.
20. Pas cdo faze/feature te mbyllur, sugjerohet hapi tjeter me profesional dhe me i sigurt sipas dependency order.

## Definition of Done per Faze

Nje faze konsiderohet e perfunduar vetem kur:

- Feature funksionon lokalisht.
- Nuk ka error ne console ose terminal.
- Responsive layout eshte kontrolluar.
- Data ruhet/lexohet sakte nga CMS ose database.
- Flow kryesor eshte testuar end-to-end.
- Useri e ka pare ose ka marre permbledhje te qarte te rezultatit.
- Roadmap/source-of-truth eshte perditesuar me vendimet e reja.
- Hapi tjeter profesional eshte sugjeruar qarte.

## Faza 0 - Audit dhe Planifikim

Status: In progress

### Qellimi

Te kuptohet plotesisht sistemi aktual WordPress/ACF/Elementor, Figma design dhe PDF scope.

### Pune

- [x] Kontrollo Figma canvas.
- [x] Kontrollo website live.
- [x] Lexo PDF planin.
- [x] Lexo WordPress XML export.
- [x] Lexo ACF JSON export.
- [x] Kontrollo setin e pare te layer fotove per Ambre.
- [x] Audito Elementor export-in dhe dokumento template/page inventory.
- [ ] Nxirr listen finale te fields nga ACF dhe mapimin ne CMS te ri.
- [x] Nxirr ACF house field mapping dhe configurator readiness per house records.
- [ ] Nxirr listen e faqeve/routes nga WordPress dhe Figma.
- [ ] Vendos data model final per Payload CMS.

### Testim / Verifikim

- [x] U konfirmua qe Figma hapet.
- [x] U konfirmua qe website live eshte i aksesueshem.
- [x] U konfirmua qe export-et jane te lexueshme.
- [x] U konfirmua qe layer fotot jane 3840x2160 RGBA.
- [x] U konfirmua qe Elementor zip ka header, footer, archive, loop item dhe 6 faqe content.

### Dalje

- Roadmap i projektit.
- Data model draft.
- Liste migrimi nga WordPress/ACF ne CMS te ri.
- Elementor template/page inventory.

## Faza 1 - Project Setup

Status: In progress

### Qellimi

Te ngrihet projekti teknik nga zero.

### Pune

- [x] Krijo Next.js project.
- [x] Konfiguro TypeScript.
- [ ] Konfiguro Tailwind CSS.
- [x] Vendos strukturat baze te folders.
- [x] Vendos linting/formatting.
- [x] Vendos routes per gjuhen primare `fr`.
- [x] Shto theme tokens nga Figma: colors, spacing, typography.

### Testim / Verifikim

- [x] `npm run dev` funksionon.
- [x] `npm run build` kalon.
- [x] Homepage placeholder hapet ne browser.
- [x] Nuk ka console errors.

### Dalje

- Projekt Next.js funksional.
- Theme foundation gati per UI.

## Faza 2 - CMS Foundation

Status: Pending

### Qellimi

Te ngrihet CMS-i dhe strukturat baze per administrim.

### Pune

- [ ] Instalo dhe konfiguro Payload CMS.
- [ ] Konfiguro database PostgreSQL.
- [ ] Krijo users/admin roles.
- [ ] Krijo collections baze:
  - Houses
  - House Categories
  - Global Options
  - House Layers
  - Media
  - Orders
  - Pages
  - Settings
- [ ] Krijo fields multilingual per content.
- [ ] Krijo fields per SEO metadata.

### Testim / Verifikim

- [ ] Admin login funksionon.
- [ ] Mund te krijohet nje house nga CMS.
- [ ] Mund te ngarkohet media.
- [ ] Data shfaqet ne frontend nga CMS.
- [ ] Roles/admin permissions testohen.

### Dalje

- CMS funksional.
- Data model i pare i implementuar.

## Faza 3 - Ambre Configurator Proof of Concept

Status: In progress

### Qellimi

Te ndertohet logjika e konfiguratorit me nje shtepi test para se te zgjerohet per te gjitha.

### Pune

- [x] Importo asset-et e Ambre.
- [x] Krijo house record per Ambre.
- [x] Krijo global options per kategorite:
  - Structure
  - Isolation intermediaire
  - Isolation exterieure
  - Facade
  - Roof / EPDM
  - Windows
- [x] Lidh secilin option me layer image.
- [x] Nderto UI layer stack.
- [x] Nderto state per zgjedhjet.
- [x] Nderto price calculator.
- [x] Nderto preview final te konfigurimit.

### Testim / Verifikim

- [x] Layer-at shfaqen ne rend te sakte.
- [x] Zgjedhja e opsionit nderron layer-in pa prishur layout.
- [x] Cmimi ndryshon live.
- [x] Konfiguratori punon ne desktop.
- [x] Konfiguratori punon ne mobile per flow-in baze te `maison-calme`.
- [x] Krahasohet vizualisht me asset final te Ambre.
- [x] Konfiguratori reusable u provua me shtepine e dyte `maison-calme`.
- [x] Konfiguratori reusable u provua me shtepine e trete `asebra`.
- [x] Konfiguratori reusable u provua me modelin kompleks `boreale`.

### Dalje

- Konfigurator reusable i validuar me nje shtepi.
- Konfigurator reusable i validuar me shtepine e dyte te thjeshte para kalimit te modelet me roof/couverture/faux plafond.
- Konfigurator reusable i validuar me tre shtepi terrace te thjeshta para testit kompleks `boreale`.
- Konfigurator reusable i validuar me roof isolation dhe faux plafond permes `boreale`.

## Faza 4 - Figma Design 1:1 Frontend

Status: Pending

### Qellimi

Te rindertohet frontend-i publik sipas Figma-s dhe website-it aktual.

### Pune

- [ ] Header 1:1.
- [ ] Footer 1:1.
- [ ] Homepage 1:1.
- [ ] About page.
- [ ] Contact page.
- [ ] Houses catalog.
- [ ] House detail page.
- [ ] Realisations listing.
- [ ] Realisation detail/gallery.
- [ ] B2B / Work with us.
- [ ] Mobile/tablet responsive.

### Testim / Verifikim

- [ ] Krahasim desktop me Figma.
- [ ] Krahasim mobile/tablet.
- [ ] Testo navigation.
- [ ] Testo images dhe galleries.
- [ ] Testo forms visually.
- [ ] Nuk ka layout overlap.
- [ ] Nuk ka text overflow.

### Dalje

- Website publik i ndertuar sipas dizajnit.

## Faza 5 - WordPress/ACF Migration

Status: Pending

### Qellimi

Te migrohen te dhenat ekzistuese ne sistemin e ri.

### Pune

- [ ] Parse WordPress XML.
- [ ] Parse ACF fields.
- [ ] Map old fields ne Payload CMS.
- [ ] Import houses.
- [ ] Import categories.
- [ ] Import media references.
- [ ] Import pages/content.
- [ ] Import existing orders vetem nese duhen.
- [ ] Raport per records qe nuk mund te migrohen automatikisht.

### Testim / Verifikim

- [ ] Numri i houses perputhet me export-in.
- [ ] Kategorite perputhen.
- [ ] Slugs jane unike.
- [ ] Cmimet jane korrekte.
- [ ] Imazhet jane te lidhura sakte.
- [ ] 5 houses kontrollohen manualisht ne CMS dhe frontend.

### Dalje

- Data ekzistuese e importuar ne CMS te ri.

## Faza 6 - Orders dhe Email

Status: Pending

### Qellimi

Te funksionoje procesi i porosise/kekeses pa pagese online.

### Pune

- [ ] Forma e porosise.
- [ ] Validim frontend.
- [ ] Validim backend.
- [ ] Ruajtje ne Orders collection.
- [ ] Reference number per porosi.
- [ ] Email konfirmimi per klient.
- [ ] Email njoftimi per admin.
- [ ] Confirmation page.

### Testim / Verifikim

- [ ] Order krijohet nga frontend.
- [ ] Order ruhet ne CMS.
- [ ] Total price ruhet sakte.
- [ ] Email klienti dergohet ne test mode.
- [ ] Email admin dergohet ne test mode.
- [ ] Error states funksionojne.

### Dalje

- Flow i porosise end-to-end.

## Faza 7 - Multilingual

Status: Pending

### Qellimi

Te behet platforma ne 4 gjuhe.

### Gjuhet

- `fr` - primary/default
- `en`
- `de`
- `nl`

### Pune

- [ ] Route structure per gjuhet.
- [ ] Language switcher.
- [ ] UI translations.
- [ ] CMS localized fields.
- [ ] SEO metadata per cdo gjuhe.
- [ ] Fallback logic kur mungon perkthimi.

### Testim / Verifikim

- [ ] Cdo route hapet ne 4 gjuhe.
- [ ] Language switcher ruan faqen aktuale.
- [ ] SEO tags ndryshojne sipas gjuhes.
- [ ] Nuk ka mixed-language UI ne flow kryesor.

### Dalje

- Website multilingual funksional.

## Faza 8 - Performance, SEO dhe QA

Status: Pending

### Qellimi

Te pergatitet platforma per launch.

### Pune

- [ ] Metadata per cdo faqe.
- [ ] Open Graph images.
- [ ] Sitemap.
- [ ] Robots.txt.
- [ ] Image optimization.
- [ ] Accessibility pass.
- [ ] Analytics setup.
- [ ] Error pages.
- [ ] Loading states.
- [ ] Empty states.

### Testim / Verifikim

- [ ] `npm run build` kalon.
- [ ] Lighthouse target 90+ per Performance.
- [ ] Lighthouse target 90+ per SEO.
- [ ] Test ne Chrome/Safari.
- [ ] Test mobile iOS/Android viewport.
- [ ] Test i plote i order flow.

### Dalje

- Release candidate gati.

## Faza 9 - Deployment dhe Launch

Status: Pending

### Qellimi

Te publikohet website-i ne production.

### Pune

- [ ] Krijo Vercel project.
- [ ] Lidh Git repository.
- [ ] Konfiguro environment variables.
- [ ] Konfiguro Supabase production.
- [ ] Konfiguro storage buckets.
- [ ] Konfiguro Resend domain/email.
- [ ] Konfiguro domain DNS.
- [ ] Final smoke test ne production.

### Testim / Verifikim

- [ ] Production URL hapet.
- [ ] CMS login punon.
- [ ] Imazhet dalin nga storage.
- [ ] Order flow punon.
- [ ] Email-et dergohen.
- [ ] Sitemap/robots jane live.
- [ ] Domain final punon me HTTPS.

### Dalje

- Website live.
- CMS gati per perdorim.

## Cfare Duhet Nga Klienti

### Tani

- [x] Figma link.
- [x] Website aktual.
- [x] WordPress XML export.
- [x] ACF JSON export.
- [x] Ambre test layers.
- [x] WordPress theme files: `style.css`, `functions.php`, `house-builder.css`, `house-builder.js`, `page-checkout.php`, `single-houses.php`, `orders-viewer.php`.
- [x] Logo final PNG.
- [x] Emri i fontit: PP Neue Montreal.
- [x] Font files per PP Neue Montreal.
- [x] Primary brand color: `#5E6F4F`.
- [x] Konfirmim final per gjuhet: `fr`, `en`, `de`, `nl`.
- [x] Email ku do te vijne porosite: `sylqevciblendi@gmail.com`.
- [x] Konfirmim qe nuk ka pagese online ne fazen e pare.

### Para Fazes 2

- [ ] Supabase project ose vendim per database alternative.
- [ ] Vendim ku ruhen imazhet: Supabase Storage ose S3/R2.

### Para Fazes 6

- [ ] Resend account.
- [ ] Domain/email sender i verifikuar.
- [ ] Email zyrtar i administratorit.
- [ ] Teksti final i email-it per klient/admin, ose aprovim qe ta shkruajme ne.

### Para Fazes 9

- [ ] Vercel account/team access.
- [ ] Domain DNS access.
- [ ] Supabase production credentials.
- [ ] Resend production API key.

## Kur Duhet Supabase?

Supabase nuk duhet domosdoshmerisht ne minuten e pare te projektit. Per Faza 1 mund te punojme lokalisht.

Supabase duhet te jete gati para Fazes 2 nese duam qe CMS dhe storage te lidhen direkt me ambient real.

Rekomandimi:

- Faza 1: nuk nevojitet Supabase.
- Faza 2: duhet Supabase ose vendim final per database/storage.
- Faza 3: mire te jete gati, sepse konfiguratori ka media/layers.
- Faza 6: duhet patjeter database reale per orders.
- Faza 9: duhet production Supabase.

## Prioriteti i Menjehershem

1. Finalizo audit/data model.
2. Ngri Next.js project.
3. Implemento Ambre configurator proof of concept.
4. Krahaso me Figma dhe website aktual.
5. Pastaj zgjero CMS dhe migration.

## Development Log

### 2026-05-19

- Created initial Next.js app foundation.
- Upgraded foundation to Next.js `16.2.6` because `14.2.x` had current security advisories.
- Added PP Neue Montreal font files.
- Added Ossa Bois logo assets.
- Added primary brand color `#5E6F4F`.
- Added multilingual route shell for `fr`, `en`, `de`, `nl`.
- Added initial homepage route `/fr`.
- Added Ambre configurator route `/fr/maisons/ambre`.
- Added Ambre image/layer assets locally under `public/images/houses/ambre`.
- Verified `npm run typecheck`.
- Verified `npm run build`.
- Verified desktop preview in browser.
- Verified configurator interaction: changing facade option updates price and preview.
- Known dependency note: `npm audit --omit=dev` still reports moderate advisories from Next/PostCSS chain; no stable non-breaking npm audit fix was available in this install because `npm audit fix --force` suggested an invalid downgrade path.
- Audited uploaded WordPress theme files and created `docs/WORDPRESS_THEME_AUDIT.md`.
- Found that current POC must be restyled and restructured around the existing WordPress single-house template before treating it as a design-match candidate.
- Refactored `/fr/maisons/ambre` toward the WordPress `single-houses.php` structure: sticky left visual, right-side option groups, official layer keys/order, price row, breakdown dropdown, and tabs.
- Replaced the simple additive calculator with the WordPress-style formula using base size price, wall m2, roof m2, fixed window price, and option-specific 60x160/60x200 pricing.
- Added `/fr/checkout` skeleton based on `page-checkout.php`, using `sessionStorage` handoff, transport cost, order summary, form, and local success state.
- Added ESLint flat config for Next.js 16 and verified lint/build.

### 2026-05-20

- Added strict source-of-truth rules in `docs/SOURCE_OF_TRUTH_RULES.md`.
- Audited Elementor export and created `docs/ELEMENTOR_EXPORT_AUDIT.md`.
- Updated roadmap references for Elementor page/template inventory.
- Reworked shared header/footer from Elementor sources:
  - Header: `templates/40.json`
  - Footer: `templates/59.json`
  - Navigation labels: `wp-content/nav_menu_item/nav_menu_item.xml`
- Verified `npm run lint`.
- Verified `npm run typecheck`.
- Verified `npm run build`.
- Browser checked local page for header/footer presence, mobile menu, footer color, footer contact data, and no console errors.
- Added `/fr/maisons` archive page from Elementor archive template `templates/289.json`.
- Added reusable house archive card from Elementor loop template `templates/206.json`.
- Built archive data from WordPress house records and attachment URLs; used the Elementor loop fallback image only where the exact attachment URL was missing.
- Added `/fr/maisons/ambre-sans-faitage` alias for the confirmed Ambre WordPress slug.
- Verified `/fr/maisons` in browser: 5 category sections, 28 cards, Ambre link present, first card image loaded, no console errors.
- Added safe dynamic house detail route for non-Ambre cards: `/fr/maisons/[slug]`.
- Non-Ambre detail pages show confirmed WordPress XML title, category, description, image, and starting price while configurators remain `needs confirmation`.
- Created `docs/ACF_HOUSE_FIELD_MAPPING.md` from ACF export, WordPress XML, and theme code.
- Confirmed that only 9 of 32 house records currently include `house_layers_*` data.
- Identified safer next configurator candidates: `maison-calme`, `asebra`, or `a-frame-house`; identified `boreale` as the richer but riskier full optional-flow candidate.
- Added `/fr/maisons/maison-calme` as the second real reusable configurator using confirmed WordPress XML fields and `house_layers_*` IDs/URLs.
- Confirmed `Maison Calme Toiture Terrasse` has `enable_etancheite_option = 1`, `enable_roof_option = 0`, `enable_couverture_option = 0`, `enable_etancheite_terrasse = 0`, and `enable_faux_plafond_option = 0`.
- Fixed shared configurator state reset so switching between house configs cannot keep stale selected layers/options.
- Verified `Maison Calme` initial state in browser: only `bg` + `konstruksioni` active, only `60x160` selected, no roof isolation section, price `€43 808,80`, and no console errors.
- Verified `Maison Calme` interaction in browser: selecting `Laine de verre` activates only `iso_inter_verre` and updates price to `€46 072,25`; selecting it again removes the layer and returns price to `€43 808,80`.
- Verified `npm run lint`, `npm run typecheck`, and `npm run build` after the reusable configurator update.
- Added `/fr/maisons/asebra` as the third real reusable configurator using confirmed WordPress XML fields and `house_layers_*` IDs/URLs.
- Confirmed `ASEBRA Toiture Terrasse` has `enable_etancheite_option = 1`, `enable_roof_option = 0`, `enable_etancheite_terrasse = 0`; `enable_couverture_option` and `enable_faux_plafond_option` are absent/disabled in the export.
- Confirmed `ASEBRA` uses `perdhesa_kulmi = 163` for the roof/EPDM calculation because `perdhesa_pllaka_e_kulmit` is empty in WordPress XML.
- Verified `ASEBRA` initial state in browser: only `bg` + `konstruksioni` active, only `60x160` selected, no roof isolation section, price `€40 170,20`, and no console errors.
- Verified `ASEBRA` interaction in browser: selecting `Laine de verre` activates only `iso_inter_verre` and updates price to `€41 563,95`; selecting it again removes the layer and returns price to `€40 170,20`.
- Verified `npm run lint`, `npm run typecheck`, and `npm run build` after adding `ASEBRA`.
- Corrected public menu/archive category labels to match the 5 confirmed house model groups:
  - Maisons à toiture terrasse
  - Maisons à toiture terrasse avec étage
  - Maisons de plain-pied
  - Maisons avec combles aménageables
  - Maisons avec étage
- Added `/fr/maisons/boreale` as the complex reusable configurator using confirmed WordPress XML fields, live WordPress option prices, and `house_layers_*` URLs.
- Confirmed `Boreale` has `enable_roof_option = 1`, `enable_etancheite_option = 1`, `enable_etancheite_terrasse = 1`, `enable_couverture_option = 1`, and `enable_faux_plafond_option = 1`.
- Confirmed `Boreale` does not render Couverture in WordPress live because no confirmed `couverture_*` layer exists for this house, so the new frontend also hides Couverture.
- Verified `Boreale` initial state in browser: only `bg` + `konstruksioni` active, only `60x160` selected, roof and faux plafond visible, Couverture hidden, price `€38 446,80`, and no console errors.
- Verified `Boreale` roof interaction in browser: selecting `Laine de Verre - 220mm` activates `roof_verre` and updates price to `€39 870,54`; selecting it again removes the layer and returns price to `€38 446,80`.
- Verified `Boreale` faux plafond interaction in browser: selecting `Laine de Roche` activates `faux_plafond_roche` and updates price to `€40 250,40`.
- Verified `npm run lint`, `npm run typecheck`, and `npm run build` after adding `Boreale`.
- Created `docs/HOUSE_CATEGORY_CONFIGURATOR_AUDIT.md` to lock the 5 public model groups and avoid guessing which houses can become configurators.
- Confirmed current configurator-ready/implemented group: `ambre-sans-faitage`, `maison-calme`, `asebra`, and `boreale`; confirmed `a-frame-house` needs a dedicated layer audit before enabling.
- Confirmed houses with missing prices or missing layers stay safe detail pages until their real source data is available.
- Created public pages under Phase 3A: Homepage `/fr`, Contact `/fr/contact`, Qui Sommes-Nous `/fr/qui-sommes-nous`, B2B `/fr/b2b`, and Réalisations `/fr/realisations`.
- Added CSS layout and styles in `app/globals.css` for carousels, testimonials, grids, forms, and responsive components.
- Adjusted sidebar placement on desktop to row-reverse, shifting the sidebar to the left and rendering house models on the right side.
- Fixed the sidebar toggle handle button to display correctly and remain interactive instead of being cut off.
- Rectified `.price-breakdown` width issues in Clean Mode by styling the breakdown overlay to a fixed size of 360px.
- Fully translated the Expression of Interest form title, subtitles, dropdown lists, checkboxes, and notifications to French.
- Fixed layout styling of the "Adresse" field in `globals.css` by appending `.form-group-full input` selector properties.
- Configured Expression of Interest form to submit details using a pre-populated client-side mailto redirected to `sylqevciblendi@gmail.com`.
- Structured mailto content to dynamically load model names, surfaces, contact info, messages, and selected options (only if they are non-default).
- Prevented the Expression of Interest submit button from redirecting users to the checkout page.
- Implemented fixed width (920px) and fixed height (520px) layout on desktop for the material info pop-up modal, centering image content and enabling scrollbars for long text content to prevent modal scaling based on uploaded image dimensions.
- Designed and built a premium mobile layout for the house configurator matching the Swedish bottom-sheet pattern: locked viewport height (`100dvh`), fixed top image stage (`38dvh`), rounded bottom-sheet drawer with a drag handle for scrollable options, and sticky price footer bar at the bottom.
- Implemented a full-screen zoom lightbox overlay in `HouseConfigurator.tsx` triggered by a circular expand button on both desktop and mobile.
- Redesigned the `/checkout` page to present a premium, multi-step localized experience complete with simulated processing states, success screens, and trust badges (10-Year CCMI, RE2020, PEFC).
- Relocated detailed configuration option list and structural parameters into the right sidebar summary section.
- Adjusted right sidebar layout width on the checkout page to `540px` to match the configurator split-mode menu width.
- Updated transportation and logistics estimated time of delivery to 3-4 weeks.
- Expanded the checkout page overall container max-width to `1400px` to match other site pages and the navigation menu.
- Verified build and static generation using `npm run build`.





