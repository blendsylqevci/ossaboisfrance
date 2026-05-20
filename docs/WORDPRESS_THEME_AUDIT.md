# WordPress Theme Audit

Date: 2026-05-20

## Source Files

- `/Users/blendsylqevci/Downloads/style.css`
- `/Users/blendsylqevci/Downloads/functions.php`
- `/Users/blendsylqevci/Downloads/house-builder.css`
- `/Users/blendsylqevci/Downloads/house-builder.js`
- `/Users/blendsylqevci/Downloads/font_setup_instructions.md`
- `/Users/blendsylqevci/Downloads/orders-viewer.php`
- `/Users/blendsylqevci/Downloads/page-checkout.php`
- `/Users/blendsylqevci/Downloads/single-houses.php`

## Important Note

Some uploaded files were saved as Rich Text Format even though they use `.php`, `.css`, or `.js` names. They can be read after conversion, but final source files should be plain text code files.

## File Findings

### style.css

Purpose:

- Hello Elementor child theme metadata.
- Imports parent `hello-elementor/style.css`.
- Sets global reset and PP Neue Montreal font.
- Contains initial layer-stage styles.

Important selectors:

- `.house-builder-container`
- `.temp-house-card-content`
- `.temp-house-card-desc`
- `.house-main-image`
- `.house-layer-stage`
- `.house-layer`

Migration impact:

- Keep the same container width behavior.
- Reuse the layer-stage approach rather than the first rough POC layout.

### functions.php

Purpose:

- Enqueues parent/child styles.
- Enqueues `house-builder.css` and `house-builder.js`.
- Defines custom font faces for PP Neue Montreal.
- Adds body classes for house archive/single views.
- Forces custom template for single house posts.
- Registers WordPress shortcodes and Elementor dynamic tags.
- Registers `house_order` custom post type.
- Handles AJAX order submission.
- Sends admin and customer emails.

Important functions:

- `hello_elementor_child_scripts`
- `hello_elementor_child_template_include`
- `house_starting_price_shortcode`
- `house_image_100x60_shortcode`
- `register_house_orders_post_type`
- `handle_house_order_submission_updated`

Migration impact:

- `house_order` maps to the new Orders CMS collection/table.
- AJAX order submission maps to a Next.js route handler/server action.
- `wp_mail` maps to Resend + React Email.
- Shortcodes/dynamic tags are no longer needed, but their logic informs CMS fields.

### house-builder.css

Purpose:

- Main styling for custom header/footer.
- Main styling for single house product page.
- Main styling for option cards.
- Main styling for price calculator and price breakdown.
- Main styling for checkout and success states.

Important selectors:

- `.custom-header`
- `.custom-footer`
- `.house-product-page`
- `.house-main-section`
- `.house-image-section`
- `.house-main-image`
- `.house-details-section`
- `.house-title`
- `.house-description`
- `.house-option-group`
- `.option-group-title`
- `.option-content`
- `.option-check`
- `.option-mini-image`
- `.price-calculator`
- `.price-total-section`
- `.price-breakdown`
- `.house-details-tabs`
- `.checkout-page`
- `.checkout-container`
- `.order-summary-card`
- `.success-message`

Migration impact:

- The current Next POC must be restyled around the WordPress structure:
  - page max width about `1200px`
  - two-column grid
  - left sticky image/details
  - right options
  - compact cards with circular check indicator
  - price calculator row with continue button
  - tabs below product builder

### house-builder.js

Purpose:

- Formats prices in French locale.
- Calculates live price.
- Handles 60x160 / 60x200 pricing.
- Uses measurement data from `window.perdhesaData`.
- Multiplies option prices by wall/roof m2 where needed.
- Builds price breakdown.
- Handles image/layer state.
- Handles facade dependency validation.
- Handles roof/terrace visibility.
- Saves configuration into `sessionStorage`.
- Redirects to checkout.
- Handles tabs and lightboxes.

Important logic:

- Base price comes from selected `house_size`.
- Some option groups use `data-price-200` when size is `60x200`.
- Internal insulation cost = price per m2 * `mure_te_jashtme`.
- External insulation cost = price per m2 * `mure_te_jashtme`.
- Facade cost = price per m2 * `mure_te_jashtme`.
- Roof/EPDM/couverture/terrace costs = price per m2 * `pllaka_e_kulmit`.
- Windows are direct fixed house-level price.
- Continue button stores `house_selections` in `sessionStorage`.

Migration impact:

- Current React calculator must be changed from simple additive pricing to this real formula.
- Need CMS fields for:
  - `perdhesa.bruto`
  - `perdhesa.neto`
  - `perdhesa.mure_te_jashtme`
  - `perdhesa.mure_mbajtese`
  - `perdhesa.mure_ndarese`
  - `perdhesa.pllaka_e_kulmit`
  - `price_60_x_160`
  - `price_60_x_200`
  - window prices
  - per-option `option_price`
  - per-option `option_price_200`
  - per-option `layer_key`

### single-houses.php

Purpose:

- Custom product/house page.
- Reads ACF data.
- Applies 40% margin to base structure prices.
- Reads per-house windows prices.
- Reads enable/disable flags for roof, etancheite, terrace, couverture, faux plafond.
- Defines layer order.
- Renders image layer stack.
- Renders option groups only when layers exist.
- Renders price calculator and continue button.
- Renders description/specification tabs.
- Includes stage lightbox.

Important layer order:

- `konstruksioni`
- `iso_inter_verre`
- `iso_inter_roche`
- `iso_inter_bois`
- `iso_ext_roche_comprimee`
- `iso_ext_polystyrene`
- `iso_ext_fibre`
- `etancheite_epdm`
- `roof_polystyrene`
- `roof_roche`
- `roof_verre`
- `couverture_pare_pluie_lattage`
- `couverture_tuiles_gouttieres`
- `couverture_bac_acier_gouttieres`
- `terrace_etancheite_epdm`
- `faux_plafond_verre`
- `faux_plafond_roche`
- `faux_plafond_bois`
- `facade_blanche`
- `facade_bardage`
- `windows_aluminium`
- `windows_pvc`

Migration impact:

- New React page should use this layer order exactly.
- Current POC category names need to map to these real keys.
- Current POC image stage should be changed to pre-render all available layers and toggle visibility.

### page-checkout.php

Purpose:

- Checkout/request page.
- Reads configuration from `sessionStorage.house_selections`.
- Collects customer contact and address.
- Adds optional/default transportation cost of `3000`.
- Builds order summary.
- Submits AJAX request to WordPress admin AJAX.
- Shows success message and clears session storage.

Important fields:

- `full_name`
- `email`
- `phone`
- `street_address`
- `city`
- `zip_code`
- `state_region`
- `notes`
- `transportation`
- `transportationCost`

Migration impact:

- Build `/fr/commande` or `/fr/checkout` using the same flow.
- Keep email-only order flow in phase 1.
- Send admin email to `sylqevciblendi@gmail.com`.
- Send confirmation email to customer.

### orders-viewer.php

Purpose:

- Admin-facing view for existing `house_order` records.
- Helps understand how orders were stored and displayed in WordPress.

Migration impact:

- Payload Orders collection should expose equivalent order details:
  - customer details
  - selected house
  - selected options
  - price breakdown
  - transport
  - total
  - status/date

### font_setup_instructions.md

Purpose:

- Describes PP Neue Montreal setup in the WordPress theme.

Migration impact:

- Already handled in Next through local `@font-face`.

## Required Changes To Current Next POC

1. Replace rough POC product layout with WordPress single-house structure.
2. Reuse WordPress class naming where useful for 1:1 styling.
3. Change layer stack to use official layer keys and order.
4. Change price formula to match `house-builder.js`.
5. Add price breakdown dropdown.
6. Add continue button that stores selected configuration.
7. Add checkout page based on `page-checkout.php`.
8. Add tabs for Description and Specification.
9. Add stage/image lightbox.
10. Then compare against Figma and live WordPress for visual matching.
