{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 <?php\
/**\
 * The template for displaying single house posts\
 */\
\
get_header(); ?>\
\
<div class="house-builder-container">\
  <?php while (have_posts()) : the_post(); ?>\
    <?php\
      // === PRICE + 40% MARGIN ===\
      $margin_percent    = 40;\
      $margin_multiplier = 1 + ($margin_percent / 100);\
\
      $base_price_60x160 = floatval(get_field('price_60_x_160')) ?: 0;\
      $base_price_60x200 = floatval(get_field('price_60_x_200')) ?: 0;\
\
      $price_60x160 = $base_price_60x160 * $margin_multiplier;\
      $price_60x200 = $base_price_60x200 * $margin_multiplier;\
\
      // === MENUISERIES PRICES PER HOUSE ===\
      $windows_group = get_field('windows');\
      if (!is_array($windows_group)) \{\
        $windows_group = [];\
      \}\
\
      $aluminium_price = floatval($windows_group['aluminium_price'] ?? 0);\
      $pvc_price       = floatval($windows_group['pvc_price'] ?? 0);\
\
      // === ENABLE / DISABLE OPTIONS PER HOUSE ===\
      $enable_roof_option         = (bool) get_field('enable_roof_option');\
      $enable_etancheite_option   = (bool) get_field('enable_etancheite_option');\
      $enable_etancheite_terrasse = (bool) get_field('enable_etancheite_terrasse');\
      $enable_couverture_option   = (bool) get_field('enable_couverture_option');\
      $enable_faux_plafond_option = (bool) get_field('enable_faux_plafond_option');\
\
      // === HOUSE LAYERS ===\
      $house_layers = get_field('house_layers');\
      if (!is_array($house_layers)) $house_layers = [];\
\
      $get_image_url = function($image_field) \{\
        if (empty($image_field)) return '';\
        if (is_string($image_field) && filter_var($image_field, FILTER_VALIDATE_URL)) return $image_field;\
        if (is_array($image_field) && isset($image_field['url'])) return $image_field['url'];\
        if (is_numeric($image_field)) return wp_get_attachment_image_url($image_field, 'full');\
        return '';\
      \};\
\
      $get_mini_image_url = function($field) \{\
        if (empty($field)) return '';\
        if (is_array($field) && !empty($field['url'])) return $field['url'];\
        if (is_numeric($field)) return wp_get_attachment_image_url($field, 'thumbnail');\
        if (is_string($field) && filter_var($field, FILTER_VALIDATE_URL)) return $field;\
        return '';\
      \};\
\
      $LAYER_ORDER = [\
        'konstruksioni',\
        'iso_inter_verre',\
        'iso_inter_roche',\
        'iso_inter_bois',\
        'iso_ext_roche_comprimee',\
        'iso_ext_polystyrene',\
        'iso_ext_fibre',\
        'etancheite_epdm',\
        'roof_polystyrene',\
        'roof_roche',\
        'roof_verre',\
        'couverture_pare_pluie_lattage',\
        'couverture_tuiles_gouttieres',\
        'couverture_bac_acier_gouttieres',\
        'terrace_etancheite_epdm',\
        'faux_plafond_verre',\
        'faux_plafond_roche',\
        'faux_plafond_bois',\
        'facade_blanche',\
        'facade_bardage',\
        'windows_aluminium',\
        'windows_pvc',\
      ];\
\
      $perdhesa_group = get_field('perdhesa');\
      if (!is_array($perdhesa_group)) $perdhesa_group = [];\
\
      $has_renderable_options = function($acf_field_name) use ($house_layers, $get_image_url) \{\
        $options = get_field($acf_field_name, 'option');\
        if (!$options || !is_array($options)) return false;\
\
        foreach ($options as $option) \{\
          $layer_key = trim($option['layer_key'] ?? '');\
          if ($layer_key === '') continue;\
\
          $layer_image_url = $get_image_url($house_layers[$layer_key] ?? '');\
          if ($layer_image_url !== '') return true;\
        \}\
\
        return false;\
      \};\
\
      $render_radio_options = function($acf_field_name, $input_name, $option_class, $get_mini_image_url, $get_image_url, $house_layers) \{\
        $options = get_field($acf_field_name, 'option');\
        if (!$options || !is_array($options)) return;\
\
        foreach ($options as $option):\
          $layer_key = trim($option['layer_key'] ?? '');\
\
          if ($layer_key === '') continue;\
\
          $layer_image_url = $get_image_url($house_layers[$layer_key] ?? '');\
          if ($layer_image_url === '') continue;\
\
          $mini_image_url = $get_mini_image_url($option['option_mini_image'] ?? '');\
          $price_200      = $option['option_price_200'] ?? '';\
        ?>\
          <label class="<?php echo esc_attr($option_class); ?>">\
            <input type="radio"\
                   name="<?php echo esc_attr($input_name); ?>"\
                   value="<?php echo esc_attr($option['option_name'] ?? ''); ?>"\
                   data-layer-key="<?php echo esc_attr($layer_key); ?>"\
                   data-price="<?php echo esc_attr($option['option_price'] ?? '0'); ?>"\
                   data-price-200="<?php echo esc_attr($price_200); ?>"\
                   data-description="<?php echo esc_attr($option['option_description'] ?? ''); ?>">\
            <div class="option-content">\
              <div class="option-check">\
                <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">\
                  <path d="M1.5 7.5L6.5 11L14.5 1.5" stroke="white" stroke-width="2"/>\
                </svg>\
              </div>\
\
              <?php if (!empty($mini_image_url)): ?>\
                <img src="<?php echo esc_url($mini_image_url); ?>" alt="<?php echo esc_attr($option['option_name'] ?? ''); ?>" class="option-mini-image">\
              <?php endif; ?>\
\
              <div class="option-details">\
                <span class="option-name"><?php echo esc_html($option['option_name'] ?? ''); ?></span>\
              </div>\
            </div>\
          </label>\
        <?php\
        endforeach;\
      \};\
    ?>\
\
    <script type="text/javascript">\
      window.perdhesaData = \{\
        bruto: <?php echo json_encode($perdhesa_group['bruto'] ?? '0'); ?>,\
        neto: <?php echo json_encode($perdhesa_group['neto'] ?? '0'); ?>,\
        mure_te_jashtme: <?php echo json_encode($perdhesa_group['mure_te_jashtme'] ?? '0'); ?>,\
        mure_mbajtese: <?php echo json_encode($perdhesa_group['mure_mbajtese'] ?? '0'); ?>,\
        mure_ndarese: <?php echo json_encode($perdhesa_group['mure_ndarese'] ?? '0'); ?>,\
        pllaka_e_kulmit: <?php echo json_encode($perdhesa_group['pllaka_e_kulmit'] ?? '0'); ?>\
      \};\
    </script>\
\
    <div class="house-product-page">\
      <div class="house-main-section">\
\
        <div class="house-image-section">\
          <div class="house-header-left">\
            <h1 class="house-title"><?php the_title(); ?></h1>\
            <div class="house-description">\
              <?php echo wp_kses_post(get_field('house_subheading')); ?>\
            </div>\
          </div>\
\
          <div class="house-main-image" style="position: relative;">\
            <button type="button" id="house-stage-zoom-trigger" aria-label="Agrandir l\'92image" style="position:absolute; top:14px; right:14px; z-index:20; width:46px; height:46px; border:none; border-radius:999px; background:rgba(17,24,39,.82); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.18);">\
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\
                <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\
                <path d="M9 21H3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\
                <path d="M21 3L14 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\
                <path d="M3 21L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\
              </svg>\
            </button>\
\
            <div id="house-layer-stage" class="house-layer-stage">\
              <?php\
                $bg_url = $get_image_url($house_layers['bg'] ?? '');\
                if ($bg_url) \{\
                  echo '<img class="house-layer is-on" data-layer="bg" src="'.esc_url($bg_url).'" alt="">';\
                \}\
\
                foreach ($LAYER_ORDER as $key) \{\
                  $url = $get_image_url($house_layers[$key] ?? '');\
                  if (!$url) continue;\
\
                  $default_on = in_array($key, ['konstruksioni'], true) ? ' is-on' : '';\
                  echo '<img class="house-layer'.$default_on.'" data-layer="'.esc_attr($key).'" src="'.esc_url($url).'" alt="">';\
                \}\
              ?>\
            </div>\
\
            <img id="house-display-image"\
                 src="<?php echo esc_url(get_field('default_image')['url'] ?? ''); ?>"\
                 alt="<?php the_title(); ?>"\
                 class="house-image"\
                 style="display:none;">\
          </div>\
        </div>\
\
        <div class="house-details-section">\
\
          <div class="house-option-group">\
            <h3 class="option-group-title">Structure en ossature bois</h3>\
\
            <div class="size-options">\
              <div class="size-option-wrapper">\
                <label class="size-option">\
                  <input type="radio" name="house_size" value="60x160"\
                         data-image="<?php echo esc_url(get_field('house_size_images')['size_100x60_image']['url'] ?? get_field('default_image')['url']); ?>"\
                         data-price="<?php echo esc_attr($price_60x160); ?>"\
                         checked>\
                  <div class="size-option-content">\
                    <div class="option-check">\
                      <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">\
                        <path d="M1.5 7.5L6.5 11L14.5 1.5" stroke="white" stroke-width="2"/>\
                      </svg>\
                    </div>\
                    <div class="option-details">\
                      <span class="option-name">60x160</span>\
                    </div>\
                  </div>\
                </label>\
              </div>\
\
              <div class="size-option-wrapper">\
                <label class="size-option">\
                  <input type="radio" name="house_size" value="60x200"\
                         data-image="<?php echo esc_url(get_field('house_size_images')['size_200x60_image']['url'] ?? get_field('default_image')['url']); ?>"\
                         data-price="<?php echo esc_attr($price_60x200); ?>">\
                  <div class="size-option-content">\
                    <div class="option-check">\
                      <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">\
                        <path d="M1.5 7.5L6.5 11L14.5 1.5" stroke="white" stroke-width="2"/>\
                      </svg>\
                    </div>\
                    <div class="option-details">\
                      <span class="option-name">60x200</span>\
                    </div>\
                  </div>\
                </label>\
              </div>\
            </div>\
\
            <div class="size-info-div">\
              <span>Structure en ossature bois r\'e9alis\'e9e selon les normes en vigueur, contrevent\'e9e par panneaux OSB 12 mm assurant rigidit\'e9 et stabilit\'e9 de l\'92ensemble. Comprend les murs porteurs, murs de s\'e9paration et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie d\'e9cennale.</span>\
            </div>\
          </div>\
\
          <?php if ($has_renderable_options('global_isolation_options')): ?>\
            <div class="house-option-group">\
              <h3 class="option-group-title">Isolation interm\'e9diaire</h3>\
              <div class="isolation-options">\
                <?php $render_radio_options('global_isolation_options', 'house_isolation', 'isolation-option', $get_mini_image_url, $get_image_url, $house_layers); ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php if ($has_renderable_options('global_outer_isolation_options')): ?>\
            <div class="house-option-group">\
              <h3 class="option-group-title">Isolation ext\'e9rieure</h3>\
              <div class="outer-isolation-options">\
                <?php $render_radio_options('global_outer_isolation_options', 'house_outer_isolation', 'outer-isolation-option', $get_mini_image_url, $get_image_url, $house_layers); ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php if ($has_renderable_options('global_facade_options')): ?>\
            <div class="house-option-group">\
              <h3 class="option-group-title">Rev\'eatement ext\'e9rieur</h3>\
              <div class="facade-options">\
                <?php $render_radio_options('global_facade_options', 'house_facade', 'facade-option', $get_mini_image_url, $get_image_url, $house_layers); ?>\
              </div>\
\
              <div class="facade-validation-warning" id="facade-validation-warning" style="display: none;">\
                <span>Vous ne pouvez pas s\'e9lectionner <span class="warning-option-name"></span> sans avoir choisi l\'92isolation.</span>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php\
            $roof_options = get_field('global_roof_options', 'option');\
            $has_etancheite_renderable = false;\
\
            if ($roof_options && is_array($roof_options)) \{\
              foreach ($roof_options as $option) \{\
                $layer_key = trim($option['layer_key'] ?? 'etancheite_epdm');\
                $layer_image_url = $get_image_url($house_layers[$layer_key] ?? '');\
\
                if ($layer_key !== '' && $layer_image_url !== '') \{\
                  $has_etancheite_renderable = true;\
                  break;\
                \}\
              \}\
            \}\
          ?>\
\
          <?php if ($enable_etancheite_option && $has_etancheite_renderable): ?>\
            <div class="house-option-group">\
              <h3 class="option-group-title">\'c9tanch\'e9it\'e9 / Pare-pluie</h3>\
              <div class="etancheite-options">\
                <?php\
                  if ($roof_options && is_array($roof_options)):\
                    foreach ($roof_options as $option):\
                      $layer_key = trim($option['layer_key'] ?? 'etancheite_epdm');\
                      $layer_image_url = $get_image_url($house_layers[$layer_key] ?? '');\
\
                      if ($layer_key === '' || $layer_image_url === '') continue;\
\
                      $mini_image_url = $get_mini_image_url($option['option_mini_image'] ?? '');\
                ?>\
                  <label class="etancheite-option">\
                    <input type="checkbox" name="house_etancheite"\
                           value="<?php echo esc_attr($option['option_name'] ?? ''); ?>"\
                           data-layer-key="<?php echo esc_attr($layer_key); ?>"\
                           data-price="<?php echo esc_attr($option['option_price'] ?? '0'); ?>"\
                           data-price-200="<?php echo esc_attr($option['option_price_200'] ?? ''); ?>"\
                           data-description="<?php echo esc_attr($option['option_description'] ?? ''); ?>">\
                    <div class="option-content">\
                      <div class="option-check"></div>\
\
                      <?php if (!empty($mini_image_url)): ?>\
                        <img src="<?php echo esc_url($mini_image_url); ?>" alt="<?php echo esc_attr($option['option_name'] ?? ''); ?>" class="option-mini-image">\
                      <?php endif; ?>\
\
                      <div class="option-details">\
                        <span class="option-name"><?php echo esc_html($option['option_name'] ?? ''); ?></span>\
                      </div>\
                    </div>\
                  </label>\
                <?php endforeach; endif; ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php if ($enable_roof_option && $has_renderable_options('global_roof_isolation_options')): ?>\
            <div class="house-option-group">\
              <h3 class="option-group-title">Isolation de la toiture par l\'92ext\'e9rieur</h3>\
              <div class="struktura-plloqes-options">\
                <?php $render_radio_options('global_roof_isolation_options', 'house_struktura_plloqes', 'struktura-plloqes-option', $get_mini_image_url, $get_image_url, $house_layers); ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php if ($enable_roof_option && $enable_couverture_option && $has_renderable_options('global_couverture_options')): ?>\
            <div class="house-option-group" id="toiture-section">\
              <h3 class="option-group-title">Couverture</h3>\
              <div class="toiture-options">\
                <?php $render_radio_options('global_couverture_options', 'house_toiture', 'toiture-option', $get_mini_image_url, $get_image_url, $house_layers); ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php if (!$enable_roof_option && $enable_etancheite_terrasse && $has_renderable_options('global_terrace_etancheite_options')): ?>\
            <div class="house-option-group" id="etancheite-terrasse-section">\
              <h3 class="option-group-title">\'c9tanch\'e9it\'e9 toiture terrasse avec couvertine</h3>\
              <div class="etancheite-terrasse-options">\
                <?php $render_radio_options('global_terrace_etancheite_options', 'house_etancheite_terrasse', 'etancheite-terrasse-option', $get_mini_image_url, $get_image_url, $house_layers); ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php if ($enable_faux_plafond_option && $has_renderable_options('global_faux_plafond_options')): ?>\
            <div class="house-option-group">\
              <h3 class="option-group-title">Faux plafond</h3>\
              <div class="izolimi-plloqes-options">\
                <?php $render_radio_options('global_faux_plafond_options', 'house_izolimi_plloqes', 'izolimi-plloqes-option', $get_mini_image_url, $get_image_url, $house_layers); ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
          <?php\
            $default_price = $price_60x160;\
            $default_price_formatted = number_format((float) $default_price, 2, ',', ' ');\
          ?>\
\
          <div class="price-calculator">\
            <div class="price-total-section">\
              <div class="price-total" id="price-total">\
                <span class="price-label">\'80</span>\
                <span class="price-value"><?php echo esc_html($default_price_formatted); ?></span>\
                <span class="price-dropdown" id="price-dropdown">\
                  <svg class="dropdown-arrow" width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">\
                    <path d="M0.640137 0.768219L9.64014 8.26822L18.6401 0.768219" stroke="black" stroke-width="2"/>\
                  </svg>\
                </span>\
              </div>\
\
              <button class="continue-button">Continuer</button>\
            </div>\
\
            <div class="price-breakdown" id="price-breakdown" style="display: none;">\
              <div class="breakdown-item base-price-item">\
                <span class="breakdown-label">Base Price:</span>\
                <span class="breakdown-value">\'80 <span class="base-price-value"><?php echo esc_html($default_price_formatted); ?></span></span>\
              </div>\
              <div class="breakdown-items" id="breakdown-items"></div>\
              <div class="breakdown-total">\
                <span class="breakdown-label">Total:</span>\
                <span class="breakdown-value">\'80<span class="total-price-value"><?php echo esc_html($default_price_formatted); ?></span></span>\
              </div>\
            </div>\
          </div>\
\
          <?php\
            $menuiseries_options = get_field('global_menuiseries_options', 'option');\
            $has_menuiseries_renderable = false;\
\
            if ($menuiseries_options && is_array($menuiseries_options)) \{\
              foreach ($menuiseries_options as $option) \{\
                $layer_key = trim($option['layer_key'] ?? '');\
                $layer_image_url = $get_image_url($house_layers[$layer_key] ?? '');\
\
                if ($layer_key !== '' && $layer_image_url !== '') \{\
                  $has_menuiseries_renderable = true;\
                  break;\
                \}\
              \}\
            \}\
          ?>\
\
          <?php if ($has_menuiseries_renderable): ?>\
            <div class="house-option-group">\
              <h3 class="option-group-title">Menuiseries ext\'e9rieures</h3>\
              <div class="dritaret-options">\
                <?php\
                  if ($menuiseries_options && is_array($menuiseries_options)):\
                    foreach ($menuiseries_options as $option):\
                      $layer_key = trim($option['layer_key'] ?? '');\
                      $layer_image_url = $get_image_url($house_layers[$layer_key] ?? '');\
\
                      if ($layer_key === '' || $layer_image_url === '') continue;\
\
                      $option_name    = trim($option['option_name'] ?? '');\
                      $mini_image_url = $get_mini_image_url($option['option_mini_image'] ?? '');\
\
                      $menuiserie_price = 0;\
\
                      if ($layer_key === 'windows_aluminium') \{\
                        $menuiserie_price = $aluminium_price;\
                      \}\
\
                      if ($layer_key === 'windows_pvc') \{\
                        $menuiserie_price = $pvc_price;\
                      \}\
                ?>\
                  <label class="dritaret-option">\
                    <input type="radio"\
                           name="house_dritaret"\
                           value="<?php echo esc_attr($option_name); ?>"\
                           data-layer-key="<?php echo esc_attr($layer_key); ?>"\
                           data-price="<?php echo esc_attr($menuiserie_price); ?>"\
                           data-price-200="<?php echo esc_attr($menuiserie_price); ?>"\
                           data-description="<?php echo esc_attr($option['option_description'] ?? ''); ?>">\
                    <div class="option-content">\
                      <div class="option-check">\
                        <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M1.5 7.5L6.5 11L14.5 1.5" stroke="white" stroke-width="2"/>\
                        </svg>\
                      </div>\
\
                      <?php if (!empty($mini_image_url)): ?>\
                        <img src="<?php echo esc_url($mini_image_url); ?>" alt="<?php echo esc_attr($option_name); ?>" class="option-mini-image">\
                      <?php endif; ?>\
\
                      <div class="option-details">\
                        <span class="option-name"><?php echo esc_html($option_name); ?></span>\
                      </div>\
                    </div>\
                  </label>\
                <?php\
                    endforeach;\
                  endif;\
                ?>\
              </div>\
            </div>\
          <?php endif; ?>\
\
        </div>\
      </div>\
\
      <div class="house-details-tabs">\
        <div class="tab-buttons">\
          <button class="tab-button active" data-tab="description">Description</button>\
          <button class="tab-button" data-tab="specification">Sp\'e9cification</button>\
        </div>\
\
        <div class="tab-content">\
          <div class="tab-pane active" id="description">\
            <div class="description-content">\
              <div class="description-text">\
                <?php echo wp_kses_post(get_field('house_description')); ?>\
              </div>\
            </div>\
          </div>\
\
          <div class="tab-pane" id="specification">\
            <div class="specification-content">\
              <?php echo wp_kses_post(get_field('house_specification')); ?>\
            </div>\
          </div>\
        </div>\
      </div>\
\
    </div>\
  <?php endwhile; ?>\
\
  <div id="house-image-lightbox" class="lightbox-2">\
    <div class="lightbox-content-2">\
      <span class="close">&times;</span>\
      <img id="house-lightbox-image" src="" alt="">\
    </div>\
  </div>\
\
  <div id="house-stage-lightbox" style="position:fixed; inset:0; background:rgba(0,0,0,.82); z-index:99999; display:none; align-items:center; justify-content:center; padding:30px;">\
    <button type="button" id="house-stage-lightbox-close" aria-label="Fermer" style="position:absolute; top:20px; right:20px; width:46px; height:46px; border:none; border-radius:999px; background:rgba(255,255,255,.14); color:#fff; font-size:30px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>\
    <div id="house-stage-lightbox-content" style="position:relative; width:min(96vw,1200px); max-height:90vh; overflow:auto; display:flex; align-items:center; justify-content:center; padding:20px;"></div>\
  </div>\
</div>\
\
<script>\
(function()\{\
  const stage = document.getElementById('house-layer-stage');\
  if(!stage) return;\
\
  const layerImgs = Array.from(stage.querySelectorAll('.house-layer'));\
  const layerExists = (key) => layerImgs.some(img => (img.dataset.layer || '') === key);\
\
  const GROUPS = \{\
    iso_inter: ['iso_inter_verre','iso_inter_roche','iso_inter_bois'],\
    iso_ext: ['iso_ext_roche_comprimee','iso_ext_polystyrene','iso_ext_fibre'],\
    facade: ['facade_blanche','facade_bardage'],\
    etanche: ['etancheite_epdm'],\
    windows: ['windows_aluminium','windows_pvc'],\
    roof: ['roof_polystyrene','roof_roche','roof_verre'],\
    couverture: ['couverture_pare_pluie_lattage','couverture_tuiles_gouttieres','couverture_bac_acier_gouttieres'],\
    terrace: ['terrace_etancheite_epdm'],\
    faux_plafond: ['faux_plafond_verre','faux_plafond_roche','faux_plafond_bois']\
  \};\
\
  const detectGroup = (layerKey) => \{\
    const k = (layerKey || '').trim();\
    if(!k) return null;\
\
    if(k.startsWith('iso_inter_')) return 'iso_inter';\
    if(k.startsWith('iso_ext_')) return 'iso_ext';\
    if(k.startsWith('facade_')) return 'facade';\
    if(k.startsWith('etancheite_')) return 'etanche';\
    if(k.startsWith('windows_')) return 'windows';\
    if(k.startsWith('roof_')) return 'roof';\
    if(k.startsWith('couverture_')) return 'couverture';\
    if(k.startsWith('terrace_')) return 'terrace';\
    if(k.startsWith('faux_plafond_')) return 'faux_plafond';\
\
    for(const g in GROUPS)\{\
      if((GROUPS[g] || []).includes(k)) return g;\
    \}\
\
    return null;\
  \};\
\
  const turnOn = (layerKey) => \{\
    const k = (layerKey || '').trim();\
    if(!k) return;\
\
    layerImgs.forEach(img => \{\
      if((img.dataset.layer || '') === k) \{\
        img.classList.add('is-on');\
      \}\
    \});\
  \};\
\
  const turnOffGroup = (groupKey) => \{\
    const keys = GROUPS[groupKey] || [];\
    if(!keys.length) return;\
\
    layerImgs.forEach(img => \{\
      const lk = (img.dataset.layer || '');\
      if(keys.includes(lk)) \{\
        img.classList.remove('is-on');\
      \}\
    \});\
  \};\
\
  const applySelection = (input) => \{\
    const layerKey = (input?.dataset?.layerKey || '').trim();\
    const group = detectGroup(layerKey);\
    if(!group) return;\
\
    turnOffGroup(group);\
\
    if(input.checked && layerKey && layerExists(layerKey)) \{\
      turnOn(layerKey);\
    \}\
  \};\
\
  const makeRadiosToggleable = (name) => \{\
    const inputs = Array.from(document.querySelectorAll(`input[name="$\{name\}"]`));\
    if(!inputs.length) return;\
\
    const checked = inputs.find(i => i.checked);\
    if(checked) \{\
      applySelection(checked);\
    \}\
\
    inputs.forEach(input => \{\
      input.addEventListener('pointerdown', () => \{\
        input.dataset._preChecked = input.checked ? '1' : '0';\
      \});\
\
      input.addEventListener('click', (e) => \{\
        const wasChecked = input.dataset._preChecked === '1';\
\
        if(wasChecked)\{\
          e.preventDefault();\
          e.stopPropagation();\
\
          input.checked = false;\
          applySelection(input);\
          input.dispatchEvent(new Event('change', \{ bubbles: true \}));\
          return;\
        \}\
\
        setTimeout(() => \{\
          if(input.checked) applySelection(input);\
        \}, 0);\
      \});\
\
      input.addEventListener('change', () => \{\
        applySelection(input);\
      \});\
    \});\
  \};\
\
  makeRadiosToggleable('house_isolation');\
  makeRadiosToggleable('house_outer_isolation');\
  makeRadiosToggleable('house_facade');\
  makeRadiosToggleable('house_dritaret');\
  makeRadiosToggleable('house_struktura_plloqes');\
  makeRadiosToggleable('house_toiture');\
  makeRadiosToggleable('house_etancheite_terrasse');\
  makeRadiosToggleable('house_izolimi_plloqes');\
\
  document.querySelectorAll('input[name="house_etancheite"]').forEach(input => \{\
    input.addEventListener('change', () => \{\
      const layerKey = (input.dataset.layerKey || '').trim();\
      const group = detectGroup(layerKey);\
\
      if(group) turnOffGroup(group);\
\
      if(input.checked && layerKey && layerExists(layerKey)) \{\
        turnOn(layerKey);\
      \}\
    \});\
  \});\
\
  document.querySelectorAll('input[name="house_size"]').forEach(sizeInput => \{\
    sizeInput.addEventListener('change', () => \{\
      layerImgs.forEach(img => \{\
        const key = (img.dataset.layer || '').trim();\
\
        if (key === 'bg' || key === 'konstruksioni') \{\
          img.classList.add('is-on');\
        \} else \{\
          img.classList.remove('is-on');\
        \}\
      \});\
    \});\
  \});\
\
  const zoomTrigger = document.getElementById('house-stage-zoom-trigger');\
  const zoomLightbox = document.getElementById('house-stage-lightbox');\
  const zoomLightboxContent = document.getElementById('house-stage-lightbox-content');\
  const zoomClose = document.getElementById('house-stage-lightbox-close');\
\
  if (zoomTrigger && zoomLightbox && zoomLightboxContent) \{\
    const openZoom = () => \{\
      const clone = stage.cloneNode(true);\
      clone.id = 'house-layer-stage-zoom-clone';\
      clone.style.width = '100%';\
      clone.style.maxWidth = '1100px';\
      clone.style.margin = '0 auto';\
\
      zoomLightboxContent.innerHTML = '';\
      zoomLightboxContent.appendChild(clone);\
      zoomLightbox.style.display = 'flex';\
      document.body.style.overflow = 'hidden';\
    \};\
\
    const closeZoom = () => \{\
      zoomLightbox.style.display = 'none';\
      zoomLightboxContent.innerHTML = '';\
      document.body.style.overflow = '';\
    \};\
\
    zoomTrigger.addEventListener('click', openZoom);\
    if (zoomClose) zoomClose.addEventListener('click', closeZoom);\
\
    zoomLightbox.addEventListener('click', (e) => \{\
      if (e.target === zoomLightbox) closeZoom();\
    \});\
\
    document.addEventListener('keydown', (e) => \{\
      if ((e.key === 'Escape' || e.key === 'Esc') && zoomLightbox.style.display === 'flex') \{\
        closeZoom();\
      \}\
    \});\
  \}\
\})();\
</script>\
\
<?php get_footer(); ?>}