{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 <?php\
/**\
 * Hello Elementor Child Theme Functions\
 * House Builder Project\
 */\
\
// Prevent direct access\
if (!defined('ABSPATH')) \{\
    exit;\
\}\
\
/**\
 * Enqueue child theme styles\
 */\
function hello_elementor_child_enqueue_styles() \{\
    wp_enqueue_style(\
        'hello-elementor-child-style',\
        get_stylesheet_directory_uri() . '/style.css',\
        array('hello-elementor-theme-style'),\
        wp_get_theme()->get('Version')\
    );\
\}\
add_action('wp_enqueue_scripts', 'hello_elementor_child_enqueue_styles');\
\
/**\
 * Short description shortcode (ACF)\
 * Usage: [house_short_desc]\
 */\
function house_short_description() \{\
    if (!function_exists('get_field')) \{\
        return '';\
    \}\
\
    $text = get_field('house_description'); // ACF field\
    if (!$text) \{\
        return '';\
    \}\
\
    $text = wp_strip_all_tags($text);\
\
    $limit = 180;\
    if (function_exists('mb_strlen') && function_exists('mb_substr')) \{\
        if (mb_strlen($text) > $limit) \{\
            $text = mb_substr($text, 0, $limit) . '...';\
        \}\
    \} else \{\
        if (strlen($text) > $limit) \{\
            $text = substr($text, 0, $limit) . '...';\
        \}\
    \}\
\
    return $text;\
\}\
add_shortcode('house_short_desc', 'house_short_description');\
\
/**\
 * Enqueue custom fonts (PP Neue Montreal)\
 */\
function hello_elementor_child_custom_fonts() \{\
    $font_dir = get_stylesheet_directory_uri() . '/assets/fonts/';\
\
    $font_face_css = '\
        @font-face \{\
            font-family: "PP Neue Montreal";\
            src: url("' . esc_url($font_dir . 'ppneuemontreal-thin.otf') . '") format("opentype");\
            font-weight: 100;\
            font-style: normal;\
            font-display: swap;\
        \}\
        @font-face \{\
            font-family: "PP Neue Montreal";\
            src: url("' . esc_url($font_dir . 'ppneuemontreal-book.otf') . '") format("opentype");\
            font-weight: 400;\
            font-style: normal;\
            font-display: swap;\
        \}\
        @font-face \{\
            font-family: "PP Neue Montreal";\
            src: url("' . esc_url($font_dir . 'ppneuemontreal-medium.otf') . '") format("opentype");\
            font-weight: 500;\
            font-style: normal;\
            font-display: swap;\
        \}\
        @font-face \{\
            font-family: "PP Neue Montreal";\
            src: url("' . esc_url($font_dir . 'ppneuemontreal-semibolditalic.otf') . '") format("opentype");\
            font-weight: 600;\
            font-style: italic;\
            font-display: swap;\
        \}\
        @font-face \{\
            font-family: "PP Neue Montreal";\
            src: url("' . esc_url($font_dir . 'ppneuemontreal-bold.otf') . '") format("opentype");\
            font-weight: 700;\
            font-style: normal;\
            font-display: swap;\
        \}\
        @font-face \{\
            font-family: "PP Neue Montreal";\
            src: url("' . esc_url($font_dir . 'ppneuemontreal-italic.otf') . '") format("opentype");\
            font-weight: 400;\
            font-style: italic;\
            font-display: swap;\
        \}\
    ';\
\
    wp_add_inline_style('hello-elementor-child-style', $font_face_css);\
\}\
add_action('wp_enqueue_scripts', 'hello_elementor_child_custom_fonts', 15);\
\
/**\
 * Enqueue custom scripts and styles\
 */\
function hello_elementor_child_scripts() \{\
    wp_enqueue_script(\
        'house-builder-js',\
        get_stylesheet_directory_uri() . '/assets/js/house-builder.js',\
        array('jquery'),\
        '1.0.0',\
        true\
    );\
\
    wp_enqueue_style(\
        'house-builder-css',\
        get_stylesheet_directory_uri() . '/assets/css/house-builder.css',\
        array(),\
        '1.0.0'\
    );\
\
    // Font Awesome\
    wp_enqueue_style(\
        'font-awesome',\
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',\
        array(),\
        '5.15.4'\
    );\
\
    wp_add_inline_style('font-awesome', '\
        .fas, .far, .fab \{\
            font-family: "Font Awesome 5 Free", "Font Awesome 5 Brands", "Font Awesome 5 Pro" !important;\
        \}\
        .fa-check:before \{ content: "\uc0\u10003 "; \}\
        .fa-chevron-down:before \{ content: "\uc0\u9660 "; \}\
        .fa-chevron-up:before \{ content: "\uc0\u9650 "; \}\
        .fa-arrow-right:before \{ content: "\uc0\u8594 "; \}\
    ');\
\}\
add_action('wp_enqueue_scripts', 'hello_elementor_child_scripts');\
\
/**\
 * Make PP Neue Montreal font available in Elementor Pro\
 */\
function add_pp_neue_montreal_to_elementor($additional_fonts) \{\
    $additional_fonts['PP Neue Montreal'] = 'system';\
    return $additional_fonts;\
\}\
add_filter('elementor/fonts/additional_fonts', 'add_pp_neue_montreal_to_elementor');\
\
/**\
 * Add theme support\
 */\
function hello_elementor_child_setup() \{\
    add_theme_support('post-thumbnails');\
    add_theme_support('title-tag');\
    add_theme_support('html5', array(\
        'search-form',\
        'comment-form',\
        'comment-list',\
        'gallery',\
        'caption',\
    ));\
\}\
add_action('after_setup_theme', 'hello_elementor_child_setup');\
\
/**\
 * Register navigation menus\
 */\
function hello_elementor_child_menus() \{\
    register_nav_menus(array(\
        'primary' => esc_html__('Primary Menu', 'hello-elementor-child'),\
    ));\
\}\
add_action('init', 'hello_elementor_child_menus');\
\
/**\
 * Add custom body classes\
 */\
function hello_elementor_child_body_classes($classes) \{\
    if (is_post_type_archive('house')) \{\
        $classes[] = 'house-archive';\
    \}\
    if (is_singular('house')) \{\
        $classes[] = 'single-house';\
    \}\
    return $classes;\
\}\
add_filter('body_class', 'hello_elementor_child_body_classes');\
\
/**\
 * Support for ACF options page\
 */\
function hello_elementor_child_acf_support() \{\
    if (function_exists('acf_add_options_page')) \{\
        acf_add_options_page(array(\
            'page_title' => 'House Builder Settings',\
            'menu_title' => 'House Settings',\
            'menu_slug'  => 'house-builder-settings',\
            'capability' => 'edit_posts',\
        ));\
    \}\
\}\
add_action('acf/init', 'hello_elementor_child_acf_support');\
\
/**\
 * Fallback menu function\
 */\
function hello_elementor_child_fallback_menu() \{\
    echo '<ul class="nav-menu">';\
    echo '<li><a href="' . esc_url(home_url('/')) . '">Home</a></li>';\
    echo '<li><a href="' . esc_url(home_url('/houses')) . '">Products</a></li>';\
    echo '<li><a href="' . esc_url(home_url('/about')) . '">About Us</a></li>';\
    echo '<li><a href="' . esc_url(home_url('/b2b')) . '">B2B</a></li>';\
    echo '<li><a href="' . esc_url(home_url('/gallery')) . '">Gallery</a></li>';\
    echo '</ul>';\
\}\
\
/**\
 * Force WordPress to use our custom template for house posts\
 * Tries both: single-house.php and single-houses.php (to avoid mismatch issues)\
 */\
function hello_elementor_child_template_include($template) \{\
    if (is_singular('house')) \{\
        $try_templates = array(\
            get_stylesheet_directory() . '/single-house.php',\
            get_stylesheet_directory() . '/single-houses.php',\
        );\
\
        foreach ($try_templates as $custom_template) \{\
            if (file_exists($custom_template)) \{\
                return $custom_template;\
            \}\
        \}\
    \}\
    return $template;\
\}\
add_filter('template_include', 'hello_elementor_child_template_include', 99);\
\
/**\
 * Debug: Add a simple test to see if our template is being called\
 */\
function hello_elementor_child_debug_template() \{\
    if (is_singular('house')) \{\
        echo '<!-- DEBUG: Custom template should be loading for house post -->';\
    \}\
\}\
add_action('wp_head', 'hello_elementor_child_debug_template');\
\
/**\
 * Starting price shortcode\
 * Usage: [house_starting_price] or [house_starting_price post_id="123"]\
 */\
function house_starting_price_shortcode($atts) \{\
    if (!function_exists('get_field')) \{\
        return '';\
    \}\
\
    $atts = shortcode_atts(array(\
        'post_id' => get_the_ID(),\
    ), $atts);\
\
    $post_id = intval($atts['post_id']);\
\
    $margin_percent    = 40;\
    $margin_multiplier = 1 + ($margin_percent / 100);\
\
    $base_price_60x160 = floatval(get_field('price_60_x_160', $post_id)) ?: 0;\
    $starting_price    = $base_price_60x160 * $margin_multiplier;\
\
    if ($starting_price <= 0) \{\
        return '';\
    \}\
\
    $formatted_price = number_format($starting_price, 2, ',', ' ');\
\
    return '<span style="font-size: 16px; font-weight: 400; color: inherit;">\'c0 partir de</span> ' .\
           '<strong style="font-size: 22px; font-weight: bold; color: #1B1B1B;">' .\
           esc_html($formatted_price) . '&nbsp;\'80</strong>';\
\}\
add_shortcode('house_starting_price', 'house_starting_price_shortcode');\
\
/**\
 * Shortcode: Get house 100x60 image URL\
 * Usage: [house_image_100x60] or [house_image_100x60 post_id="123" return="image"]\
 */\
function house_image_100x60_shortcode($atts) \{\
    if (!function_exists('get_field')) \{\
        return '';\
    \}\
\
    $atts = shortcode_atts(array(\
        'post_id' => get_the_ID(),\
        'return'  => 'url', // 'url' or 'image'\
    ), $atts);\
\
    $post_id = intval($atts['post_id']);\
\
    $image_100x60 = get_field('house_size_images_size_100x60_image', $post_id);\
\
    if (empty($image_100x60)) \{\
        $house_size_images = get_field('house_size_images', $post_id);\
        if (is_array($house_size_images) && isset($house_size_images['size_100x60_image'])) \{\
            $image_100x60 = $house_size_images['size_100x60_image'];\
        \}\
    \}\
\
    if (empty($image_100x60)) \{\
        $image_100x60 = get_field('default_image', $post_id);\
    \}\
\
    $image_url = '';\
    if (is_array($image_100x60) && isset($image_100x60['url'])) \{\
        $image_url = $image_100x60['url'];\
    \} elseif (is_numeric($image_100x60)) \{\
        $image_url = wp_get_attachment_image_url(intval($image_100x60), 'full');\
    \} elseif (is_string($image_100x60)) \{\
        $image_url = $image_100x60;\
    \}\
\
    if (empty($image_url)) \{\
        return '';\
    \}\
\
    if ($atts['return'] === 'image') \{\
        $image_title = get_the_title($post_id);\
        return '<img src="' . esc_url($image_url) . '" alt="' . esc_attr($image_title) . '">';\
    \}\
\
    return esc_url($image_url);\
\}\
add_shortcode('house_image_100x60', 'house_image_100x60_shortcode');\
\
/**\
 * Elementor custom dynamic tag (100x60 image)\
 */\
function register_house_dynamic_tags() \{\
    if (!class_exists('Elementor\\Core\\DynamicTags\\Tag')) \{\
        return;\
    \}\
\
    if (!class_exists('House_Image_100x60_Tag')) \{\
        class House_Image_100x60_Tag extends \\Elementor\\Core\\DynamicTags\\Tag \{\
\
            public function get_name() \{\
                return 'house-image-100x60';\
            \}\
\
            public function get_title() \{\
                return 'House 100x60 Image';\
            \}\
\
            public function get_group() \{\
                return 'house';\
            \}\
\
            public function get_categories() \{\
                return [\\Elementor\\Modules\\DynamicTags\\Module::IMAGE_CATEGORY];\
            \}\
\
            protected function render() \{\
                if (!function_exists('get_field')) \{\
                    return;\
                \}\
\
                global $post;\
                if (!$post) \{\
                    return;\
                \}\
\
                $house_size_images = get_field('house_size_images', $post->ID);\
                $image_100x60 = '';\
\
                if (is_array($house_size_images) && isset($house_size_images['size_100x60_image'])) \{\
                    $image_100x60 = $house_size_images['size_100x60_image'];\
                \}\
\
                if (empty($image_100x60)) \{\
                    $image_100x60 = get_field('default_image', $post->ID);\
                \}\
\
                if (is_array($image_100x60) && isset($image_100x60['url'])) \{\
                    echo esc_url($image_100x60['url']);\
                \} elseif (is_numeric($image_100x60)) \{\
                    echo esc_url(wp_get_attachment_image_url(intval($image_100x60), 'full'));\
                \} elseif (is_string($image_100x60)) \{\
                    echo esc_url($image_100x60);\
                \}\
            \}\
\
            protected function get_supported_fields() \{\
                return ['image'];\
            \}\
        \}\
    \}\
\
    if (isset(\\Elementor\\Plugin::$instance->dynamic_tags)) \{\
        \\Elementor\\Plugin::$instance->dynamic_tags->register(new House_Image_100x60_Tag());\
    \}\
\}\
add_action('elementor/dynamic_tags/register', 'register_house_dynamic_tags');\
\
/**\
 * (Optional placeholder hooks kept)\
 */\
function add_house_acf_dynamic_tags($controls_manager) \{\}\
add_action('elementor/controls/register', 'add_house_acf_dynamic_tags');\
\
function add_100x60_image_url_field() \{\}\
add_action('acf/include_field_types', 'add_100x60_image_url_field');\
\
/**\
 * Helper: safe selection value getter\
 */\
if (!function_exists('hello_house_get_selection_value')) \{\
    function hello_house_get_selection_value($selection) \{\
        if (is_array($selection) && isset($selection['value'])) \{\
            return $selection['value'];\
        \}\
        return $selection ?? '';\
    \}\
\}\
\
/**\
 * AJAX hooks for order submission\
 */\
add_action('wp_ajax_submit_house_order', 'handle_house_order_submission_updated');\
add_action('wp_ajax_nopriv_submit_house_order', 'handle_house_order_submission_updated');\
\
/**\
 * Register Custom Post Type for Orders\
 */\
function register_house_orders_post_type() \{\
    $labels = array(\
        'name'               => 'Orders',\
        'singular_name'      => 'Order',\
        'menu_name'          => 'House Orders',\
        'add_new'            => 'Add New',\
        'add_new_item'       => 'Add New Order',\
        'edit_item'          => 'Edit Order',\
        'new_item'           => 'New Order',\
        'view_item'          => 'View Order',\
        'search_items'       => 'Search Orders',\
        'not_found'          => 'No orders found',\
        'not_found_in_trash' => 'No orders found in trash',\
    );\
\
    $args = array(\
        'labels'              => $labels,\
        'public'              => false,\
        'exclude_from_search' => true,\
        'show_ui'             => true,\
        'show_in_menu'        => true,\
        'menu_icon'           => 'dashicons-cart',\
        'menu_position'       => 26,\
        'capability_type'     => 'post',\
        'supports'            => array('title', 'editor'),\
        'has_archive'         => false,\
        'show_in_admin_bar'   => true,\
        'rewrite'             => false,\
    );\
\
    register_post_type('house_order', $args);\
\}\
add_action('init', 'register_house_orders_post_type');\
\
/**\
 * Add meta box to display order details\
 */\
function add_order_details_meta_box() \{\
    add_meta_box(\
        'order_details',\
        'Order Details',\
        'display_order_details',\
        'house_order',\
        'normal',\
        'high'\
    );\
\}\
add_action('add_meta_boxes', 'add_order_details_meta_box');\
\
function display_order_details($post) \{\
    ?>\
    <style>\
        .order-details-table \{ width: 100%; border-collapse: collapse; \}\
        .order-details-table td \{ padding: 10px; border-bottom: 1px solid #e0e0e0; \}\
        .order-details-table td:first-child \{ font-weight: bold; color: #666; width: 200px; \}\
        .order-section \{ margin-bottom: 30px; \}\
        .order-section h3 \{ color: #1F4B43; border-bottom: 2px solid #1F4B43; padding-bottom: 10px; \}\
        .order-price \{ font-size: 24px; font-weight: bold; color: #1F4B43; text-align: center; padding: 20px; background: #F7FFFD; border-radius: 5px; \}\
    </style>\
\
    <div class="order-sections">\
        <div class="order-section">\
            <h3>House Configuration</h3>\
            <table class="order-details-table">\
                <tr>\
                    <td>House Name:</td>\
                    <td><?php echo esc_html(get_post_meta($post->ID, 'house_name', true)); ?></td>\
                </tr>\
                <tr>\
                    <td>Size:</td>\
                    <td><?php\
                        $size = get_post_meta($post->ID, 'house_size', true);\
                        $size_price = get_post_meta($post->ID, 'house_size_price', true);\
                        echo esc_html($size);\
                        if ($size_price) echo ' (\'80' . esc_html($size_price) . ')';\
                    ?></td>\
                </tr>\
                <tr>\
                    <td>Isolation (Walls):</td>\
                    <td><?php\
                        $iso = get_post_meta($post->ID, 'isolation', true);\
                        $iso_price = get_post_meta($post->ID, 'isolation_price', true);\
                        echo esc_html($iso ?: 'Not selected');\
                        if ($iso_price) echo ' (\'80' . esc_html($iso_price) . ' per m\'b2)';\
                    ?></td>\
                </tr>\
                <tr>\
                    <td>Inner Isolation:</td>\
                    <td><?php\
                        $inner_iso = get_post_meta($post->ID, 'inner_isolation', true);\
                        $inner_iso_price = get_post_meta($post->ID, 'inner_isolation_price', true);\
                        echo esc_html($inner_iso ?: 'Not selected');\
                        if ($inner_iso_price) echo ' (\'80' . esc_html($inner_iso_price) . ' per m\'b2)';\
                    ?></td>\
                </tr>\
                <tr>\
                    <td>Facade:</td>\
                    <td><?php\
                        $facade = get_post_meta($post->ID, 'facade', true);\
                        $facade_price = get_post_meta($post->ID, 'facade_price', true);\
                        echo esc_html($facade ?: 'Not selected');\
                        if ($facade_price) echo ' (\'80' . esc_html($facade_price) . ' per m\'b2)';\
                    ?></td>\
                </tr>\
                <tr>\
                    <td>Roof:</td>\
                    <td><?php\
                        $roof = get_post_meta($post->ID, 'roof', true);\
                        $roof_price = get_post_meta($post->ID, 'roof_price', true);\
                        echo esc_html($roof ?: 'Not selected');\
                        if ($roof_price) echo ' (\'80' . esc_html($roof_price) . ' per m\'b2)';\
                    ?></td>\
                </tr>\
                <tr>\
                    <td>Struktura Plloqes:</td>\
                    <td><?php\
                        $struktura = get_post_meta($post->ID, 'struktura_plloqes', true);\
                        $struktura_price = get_post_meta($post->ID, 'struktura_plloqes_price', true);\
                        echo esc_html($struktura ?: 'Not selected');\
                        if ($struktura_price) echo ' (\'80' . esc_html($struktura_price) . ')';\
                    ?></td>\
                </tr>\
                <tr>\
                    <td>Dritaret (Windows):</td>\
                    <td><?php\
                        $dritaret = get_post_meta($post->ID, 'dritaret', true);\
                        $dritaret_price = get_post_meta($post->ID, 'dritaret_price', true);\
                        echo esc_html($dritaret ?: 'Not selected');\
                        if ($dritaret_price) echo ' (\'80' . esc_html($dritaret_price) . ')';\
                    ?></td>\
                </tr>\
            </table>\
        </div>\
\
        <?php\
        $price_breakdown_json = get_post_meta($post->ID, 'price_breakdown', true);\
        if (!empty($price_breakdown_json)) \{\
            $price_breakdown = json_decode($price_breakdown_json, true);\
            if (is_array($price_breakdown) && !empty($price_breakdown)) \{\
        ?>\
        <div class="order-section">\
            <h3>Price Breakdown</h3>\
            <table class="order-details-table">\
                <tr>\
                    <td>Base Price:</td>\
                    <td>\'80<?php echo number_format(floatval(get_post_meta($post->ID, 'base_price', true) ?: 0), 2, '.', ','); ?></td>\
                </tr>\
                <?php foreach ($price_breakdown as $item): ?>\
                <tr>\
                    <td><?php echo esc_html($item['label'] ?? ''); ?>:</td>\
                    <td>\'80<?php echo number_format(floatval($item['value'] ?? 0), 2, '.', ','); ?></td>\
                </tr>\
                <?php endforeach; ?>\
                <?php\
                $transportation = get_post_meta($post->ID, 'transportation', true);\
                $transportation_cost = floatval(get_post_meta($post->ID, 'transportation_cost', true));\
                if ($transportation === 'Yes' && $transportation_cost > 0): ?>\
                <tr>\
                    <td>Transportation:</td>\
                    <td>\'80<?php echo number_format($transportation_cost, 2, '.', ','); ?></td>\
                </tr>\
                <?php endif; ?>\
                <tr>\
                    <td>Total Price:</td>\
                    <td class="order-price">\'80<?php echo number_format(floatval(get_post_meta($post->ID, 'total_price', true) ?: 0), 2, '.', ','); ?></td>\
                </tr>\
            </table>\
        </div>\
        <?php\
            \}\
        \}\
\
        $perdhesa_json = get_post_meta($post->ID, 'perdhesa_data', true);\
        if (!empty($perdhesa_json)) \{\
            $perdhesa = json_decode($perdhesa_json, true);\
            if (is_array($perdhesa)) \{\
        ?>\
        <div class="order-section">\
            <h3>P\'ebrdhesa (Measurements)</h3>\
            <table class="order-details-table">\
                <tr><td>Sip\'ebrfaqja Bruto:</td><td><?php echo esc_html($perdhesa['bruto'] ?? '0'); ?> m\'b2</td></tr>\
                <tr><td>Sip\'ebrfaqja Neto:</td><td><?php echo esc_html($perdhesa['neto'] ?? '0'); ?> m\'b2</td></tr>\
                <tr><td>Mure te Jashtme:</td><td><?php echo esc_html($perdhesa['mure_te_jashtme'] ?? '0'); ?> m\'b2</td></tr>\
                <tr><td>Mure Mbajtese:</td><td><?php echo esc_html($perdhesa['mure_mbajtese'] ?? '0'); ?> m\'b2</td></tr>\
                <tr><td>Mure Ndarese:</td><td><?php echo esc_html($perdhesa['mure_ndarese'] ?? '0'); ?> m\'b2</td></tr>\
                <tr><td>Pllaka e Kulmit:</td><td><?php echo esc_html($perdhesa['pllaka_e_kulmit'] ?? '0'); ?> m\'b2</td></tr>\
            </table>\
        </div>\
        <?php\
            \}\
        \}\
        ?>\
\
        <div class="order-section">\
            <h3>Customer Information</h3>\
            <table class="order-details-table">\
                <tr><td>Name:</td><td><?php echo esc_html(get_post_meta($post->ID, 'customer_name', true)); ?></td></tr>\
                <tr><td>Email:</td><td><?php echo esc_html(get_post_meta($post->ID, 'customer_email', true)); ?></td></tr>\
                <tr><td>Phone:</td><td><?php echo esc_html(get_post_meta($post->ID, 'customer_phone', true)); ?></td></tr>\
\
                <?php\
                $street_address = get_post_meta($post->ID, 'customer_street_address', true);\
                if (!empty($street_address)):\
                ?>\
                    <tr><td>Street Address:</td><td><?php echo esc_html($street_address); ?></td></tr>\
                    <?php $city = get_post_meta($post->ID, 'customer_city', true); if (!empty($city)): ?>\
                        <tr><td>City:</td><td><?php echo esc_html($city); ?></td></tr>\
                    <?php endif; ?>\
                    <?php $zip_code = get_post_meta($post->ID, 'customer_zip_code', true); if (!empty($zip_code)): ?>\
                        <tr><td>ZIP Code:</td><td><?php echo esc_html($zip_code); ?></td></tr>\
                    <?php endif; ?>\
                    <?php $state_region = get_post_meta($post->ID, 'customer_state_region', true); if (!empty($state_region)): ?>\
                        <tr><td>State/Region:</td><td><?php echo esc_html($state_region); ?></td></tr>\
                    <?php endif; ?>\
                <?php else: ?>\
                    <tr><td>Address:</td><td><?php echo esc_html(get_post_meta($post->ID, 'customer_address', true)); ?></td></tr>\
                <?php endif; ?>\
\
                <tr><td>Notes:</td><td><?php echo esc_html(get_post_meta($post->ID, 'customer_notes', true)); ?></td></tr>\
                <tr><td>Order Date:</td><td><?php echo esc_html(get_post_meta($post->ID, 'order_date', true)); ?></td></tr>\
            </table>\
        </div>\
    </div>\
    <?php\
\}\
\
/**\
 * Order submission handler (AJAX)\
 */\
function handle_house_order_submission_updated() \{\
    error_log('[Order Handler] ===== ORDER SUBMISSION STARTED =====');\
    error_log('[Order Handler] POST data keys: ' . print_r(array_keys($_POST), true));\
\
    if (!isset($_POST['action']) || $_POST['action'] !== 'submit_house_order') \{\
        error_log('[Order Handler] ERROR: Invalid request - action missing or incorrect');\
        wp_send_json_error('Invalid request');\
        return;\
    \}\
\
    // Optional nonce validation (won't break if nonce not sent)\
    $nonce = '';\
    if (isset($_POST['nonce'])) \{\
        $nonce = sanitize_text_field(wp_unslash($_POST['nonce']));\
    \} elseif (isset($_POST['_wpnonce'])) \{\
        $nonce = sanitize_text_field(wp_unslash($_POST['_wpnonce']));\
    \}\
    if (!empty($nonce)) \{\
        if (!wp_verify_nonce($nonce, 'submit_house_order')) \{\
            error_log('[Order Handler] ERROR: Invalid nonce');\
            wp_send_json_error('Security check failed');\
            return;\
        \}\
    \} else \{\
        error_log('[Order Handler] WARNING: No nonce provided (proceeding)');\
    \}\
\
    $form_data = isset($_POST['data']) ? $_POST['data'] : null;\
    error_log('[Order Handler] Form data structure: ' . (is_array($form_data) ? 'array' : gettype($form_data)));\
\
    $raw_form = null;\
    $raw_selections = null;\
\
    if (is_array($form_data)) \{\
        $raw_form = $form_data['form'] ?? null;\
        $raw_selections = $form_data['selections'] ?? null;\
        error_log('[Order Handler] Extracted from data array - form: ' . ($raw_form ? 'exists' : 'missing') . ', selections: ' . ($raw_selections ? 'exists' : 'missing'));\
    \}\
    if ($raw_form === null && isset($_POST['form'])) \{\
        $raw_form = $_POST['form'];\
        error_log('[Order Handler] Found form in flat POST');\
    \}\
    if ($raw_selections === null && isset($_POST['selections'])) \{\
        $raw_selections = $_POST['selections'];\
        error_log('[Order Handler] Found selections in flat POST');\
    \}\
\
    if ($raw_form === null && $raw_selections === null) \{\
        error_log('[Order Handler] ERROR: No form or selections data found');\
        wp_send_json_error('No data received');\
        return;\
    \}\
\
    // Parse form fields\
    $form_fields = array();\
    if (!empty($raw_form) && is_string($raw_form)) \{\
        parse_str(wp_unslash($raw_form), $form_fields);\
    \}\
\
    // Sanitize common form fields\
    $full_name    = isset($form_fields['full_name']) ? sanitize_text_field($form_fields['full_name']) : '';\
    $email        = isset($form_fields['email']) ? sanitize_email($form_fields['email']) : '';\
    $phone        = isset($form_fields['phone']) ? sanitize_text_field($form_fields['phone']) : '';\
    $notes        = isset($form_fields['notes']) ? sanitize_textarea_field($form_fields['notes']) : '';\
    $street_addr  = isset($form_fields['street_address']) ? sanitize_text_field($form_fields['street_address']) : '';\
    $city         = isset($form_fields['city']) ? sanitize_text_field($form_fields['city']) : '';\
    $zip_code     = isset($form_fields['zip_code']) ? sanitize_text_field($form_fields['zip_code']) : '';\
    $state_region = isset($form_fields['state_region']) ? sanitize_text_field($form_fields['state_region']) : '';\
    $old_address  = isset($form_fields['address']) ? sanitize_text_field($form_fields['address']) : '';\
\
    // Decode selections JSON\
    $selections = array();\
    if (!empty($raw_selections) && is_string($raw_selections)) \{\
        $decoded = json_decode(wp_unslash($raw_selections), true);\
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) \{\
            $selections = $decoded;\
            error_log('[Order Handler] Successfully decoded selections JSON');\
        \} else \{\
            error_log('[Order Handler] ERROR: JSON decode failed - ' . json_last_error_msg());\
        \}\
    \} else \{\
        error_log('[Order Handler] WARNING: Raw selections is empty or not a string');\
    \}\
\
    if (empty($selections)) \{\
        error_log('[Order Handler] ERROR: Selections array is empty after parsing');\
        wp_send_json_error('No selections data found');\
        return;\
    \}\
\
    $house_name = isset($selections['house']['name']) ? sanitize_text_field($selections['house']['name']) : 'Unknown';\
\
    // Create order title\
    $order_title = 'Order: ' . $house_name . ' - ' . ($full_name ?: 'Unknown Customer');\
    error_log('[Order Handler] Creating order with title: ' . $order_title);\
\
    $order_id = wp_insert_post(array(\
        'post_title'   => $order_title,\
        'post_content' => 'Customer Notes: ' . $notes,\
        'post_status'  => 'publish',\
        'post_type'    => 'house_order',\
    ));\
\
    if (!$order_id || is_wp_error($order_id)) \{\
        error_log('[Order Handler] ERROR: Failed to create order post - ' . (is_wp_error($order_id) ? $order_id->get_error_message() : 'Unknown error'));\
        wp_send_json_error('Failed to save order');\
        return;\
    \}\
\
    error_log('[Order Handler] Order created successfully with ID: ' . $order_id);\
\
    // Transportation\
    $transportation_included = isset($selections['transportation'])\
        ? ($selections['transportation'] === true || $selections['transportation'] === '1' || $selections['transportation'] === 1)\
        : false;\
\
    $transportation_cost = isset($selections['transportationCost'])\
        ? floatval($selections['transportationCost'])\
        : ($transportation_included ? 3000 : 0);\
\
    // Build full address\
    $full_address = '';\
    if (!empty($street_addr)) \{\
        $address_parts = array_filter(array($street_addr, $city, $zip_code, $state_region));\
        $full_address = implode(', ', $address_parts);\
    \} else \{\
        $full_address = $old_address;\
    \}\
\
    // Prices\
    $base_price  = isset($selections['basePrice']) ? floatval($selections['basePrice']) : 0;\
    $total_price = isset($selections['totalPrice']) ? floatval($selections['totalPrice']) : 0;\
\
    // Save meta\
    $meta_fields = array(\
        'house_name'              => $house_name,\
        'house_size'              => sanitize_text_field(hello_house_get_selection_value($selections['size'] ?? '')),\
        'house_size_price'        => (is_array($selections['size'] ?? null) && isset($selections['size']['price'])) ? floatval($selections['size']['price']) : '',\
        'isolation'               => sanitize_text_field(hello_house_get_selection_value($selections['isolation'] ?? '')),\
        'isolation_price'         => (is_array($selections['isolation'] ?? null) && isset($selections['isolation']['price'])) ? floatval($selections['isolation']['price']) : '',\
        'inner_isolation'         => sanitize_text_field(hello_house_get_selection_value($selections['innerIsolation'] ?? '')),\
        'inner_isolation_price'   => (is_array($selections['innerIsolation'] ?? null) && isset($selections['innerIsolation']['price'])) ? floatval($selections['innerIsolation']['price']) : '',\
        'facade'                  => sanitize_text_field(hello_house_get_selection_value($selections['facade'] ?? '')),\
        'facade_price'            => (is_array($selections['facade'] ?? null) && isset($selections['facade']['price'])) ? floatval($selections['facade']['price']) : '',\
        'roof'                    => sanitize_text_field(hello_house_get_selection_value($selections['roof'] ?? '')),\
        'roof_price'              => (is_array($selections['roof'] ?? null) && isset($selections['roof']['price'])) ? floatval($selections['roof']['price']) : '',\
        'struktura_plloqes'       => sanitize_text_field(hello_house_get_selection_value($selections['strukturaPlloqes'] ?? '')),\
        'struktura_plloqes_price' => (is_array($selections['strukturaPlloqes'] ?? null) && isset($selections['strukturaPlloqes']['price'])) ? floatval($selections['strukturaPlloqes']['price']) : '',\
        'dritaret'                => sanitize_text_field(hello_house_get_selection_value($selections['dritaret'] ?? '')),\
        'dritaret_price'          => (is_array($selections['dritaret'] ?? null) && isset($selections['dritaret']['price'])) ? floatval($selections['dritaret']['price']) : '',\
        'transportation'          => $transportation_included ? 'Yes' : 'No',\
        'transportation_cost'     => $transportation_cost,\
        'base_price'              => $base_price,\
        'total_price'             => $total_price,\
        'price_breakdown'         => isset($selections['priceBreakdown']) ? wp_json_encode($selections['priceBreakdown']) : '',\
        'perdhesa_data'           => isset($selections['perdhesa']) ? wp_json_encode($selections['perdhesa']) : '',\
        'customer_name'           => $full_name,\
        'customer_email'          => $email,\
        'customer_phone'          => $phone,\
        'customer_address'        => $full_address,\
        'customer_street_address' => $street_addr,\
        'customer_city'           => $city,\
        'customer_zip_code'       => $zip_code,\
        'customer_state_region'   => $state_region,\
        'customer_notes'          => $notes,\
        'order_date'              => current_time('mysql'),\
    );\
\
    foreach ($meta_fields as $key => $value) \{\
        update_post_meta($order_id, $key, $value);\
    \}\
\
    error_log('[Order Handler] All meta fields saved successfully');\
\
    // Prepare email\
    $admin_email = get_option('admin_email');\
    $subject     = 'New House Order - ' . $house_name;\
\
    // Build admin email\
    $message  = '<h2>New House Order #' . intval($order_id) . '</h2>';\
    $message .= '<h3>House Configuration</h3>';\
    $message .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';\
    $message .= '<tr style="background: #f5f5f5;"><td style="padding: 10px; font-weight: bold; width: 200px;">House:</td><td style="padding: 10px;">' . esc_html($house_name) . '</td></tr>';\
\
    $fields_map = array(\
        'size'            => 'Size',\
        'isolation'       => 'Isolation (Walls)',\
        'innerIsolation'  => 'Inner Isolation',\
        'facade'          => 'Facade',\
        'roof'            => 'Roof',\
        'strukturaPlloqes' => 'Struktura Plloqes',\
        'dritaret'        => 'Dritaret (Windows)',\
    );\
\
    foreach ($fields_map as $key => $label) \{\
        if (isset($selections[$key])) \{\
            $val = hello_house_get_selection_value($selections[$key]);\
            $val = is_string($val) ? $val : '';\
            $message .= '<tr><td style="padding: 10px; font-weight: bold;">' . esc_html($label) . ':</td><td style="padding: 10px;">' . esc_html($val ?: 'Not selected') . '</td></tr>';\
        \}\
    \}\
\
    $message .= '</table>';\
\
    // Price Breakdown\
    $message .= '<h3>Price Breakdown</h3>';\
    $message .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';\
\
    $subtotal = $base_price;\
    if (isset($selections['priceBreakdown']) && is_array($selections['priceBreakdown'])) \{\
        foreach ($selections['priceBreakdown'] as $item) \{\
            $subtotal += floatval($item['value'] ?? 0);\
        \}\
    \}\
\
    $message .= '<tr style="background: #f5f5f5;"><td style="padding: 10px; font-weight: bold;">Subtotal:</td><td style="padding: 10px; text-align: right;">\'80' . number_format($subtotal, 2, '.', ',') . '</td></tr>';\
    $message .= '<tr><td style="padding: 10px; font-weight: bold;">Base Price:</td><td style="padding: 10px; text-align: right;">\'80' . number_format($base_price, 2, '.', ',') . '</td></tr>';\
\
    if (isset($selections['priceBreakdown']) && is_array($selections['priceBreakdown'])) \{\
        foreach ($selections['priceBreakdown'] as $item) \{\
            $label = sanitize_text_field($item['label'] ?? '');\
            $value = floatval($item['value'] ?? 0);\
            $message .= '<tr><td style="padding: 10px;">' . esc_html($label) . ':</td><td style="padding: 10px; text-align: right;">\'80' . number_format($value, 2, '.', ',') . '</td></tr>';\
        \}\
    \}\
\
    $message .= '<tr><td style="padding: 10px; font-weight: bold;">Transportation:</td><td style="padding: 10px; text-align: right;">\'80' . number_format($transportation_cost, 2, '.', ',') . '</td></tr>';\
\
    $message .= '<tr style="background: #1F4B43; color: white;"><td style="padding: 10px; font-weight: bold;">Total:</td><td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">\'80' . number_format($total_price, 2, '.', ',') . '</td></tr>';\
    $message .= '</table>';\
\
    // Perdhesa\
    if (isset($selections['perdhesa']) && is_array($selections['perdhesa'])) \{\
        $perdhesa = $selections['perdhesa'];\
        $message .= '<h3>P\'ebrdhesa (Measurements)</h3>';\
        $message .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Sip\'ebrfaqja Bruto:</td><td style="padding: 10px;">' . esc_html($perdhesa['bruto'] ?? '0') . ' m\'b2</td></tr>';\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Sip\'ebrfaqja Neto:</td><td style="padding: 10px;">' . esc_html($perdhesa['neto'] ?? '0') . ' m\'b2</td></tr>';\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Mure te Jashtme:</td><td style="padding: 10px;">' . esc_html($perdhesa['mure_te_jashtme'] ?? '0') . ' m\'b2</td></tr>';\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Mure Mbajtese:</td><td style="padding: 10px;">' . esc_html($perdhesa['mure_mbajtese'] ?? '0') . ' m\'b2</td></tr>';\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Mure Ndarese:</td><td style="padding: 10px;">' . esc_html($perdhesa['mure_ndarese'] ?? '0') . ' m\'b2</td></tr>';\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Pllaka e Kulmit:</td><td style="padding: 10px;">' . esc_html($perdhesa['pllaka_e_kulmit'] ?? '0') . ' m\'b2</td></tr>';\
        $message .= '</table>';\
    \}\
\
    // Customer details\
    $message .= '<hr>';\
    $message .= '<h3>Customer Details</h3>';\
    $message .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';\
    $message .= '<tr><td style="padding: 10px; font-weight: bold;">Name:</td><td style="padding: 10px;">' . esc_html($full_name) . '</td></tr>';\
    $message .= '<tr><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;">' . esc_html($email) . '</td></tr>';\
    $message .= '<tr><td style="padding: 10px; font-weight: bold;">Phone:</td><td style="padding: 10px;">' . esc_html($phone) . '</td></tr>';\
    if (!empty($street_addr)) \{\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Street Address:</td><td style="padding: 10px;">' . esc_html($street_addr) . '</td></tr>';\
        if (!empty($city)) $message .= '<tr><td style="padding: 10px; font-weight: bold;">City:</td><td style="padding: 10px;">' . esc_html($city) . '</td></tr>';\
        if (!empty($zip_code)) $message .= '<tr><td style="padding: 10px; font-weight: bold;">ZIP Code:</td><td style="padding: 10px;">' . esc_html($zip_code) . '</td></tr>';\
        if (!empty($state_region)) $message .= '<tr><td style="padding: 10px; font-weight: bold;">State/Region:</td><td style="padding: 10px;">' . esc_html($state_region) . '</td></tr>';\
    \} else \{\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Address:</td><td style="padding: 10px;">' . esc_html($old_address) . '</td></tr>';\
    \}\
    if (!empty($notes)) \{\
        $message .= '<tr><td style="padding: 10px; font-weight: bold;">Notes:</td><td style="padding: 10px;">' . esc_html($notes) . '</td></tr>';\
    \}\
    $message .= '</table>';\
    $message .= '<hr>';\
    $message .= '<p><em>View order in admin: <a href="' . esc_url(admin_url('post.php?post=' . intval($order_id) . '&action=edit')) . '">Click here</a></em></p>';\
\
    $headers = array('Content-Type: text/html; charset=UTF-8');\
\
    error_log('[Order Handler] Attempting to send admin email to: ' . $admin_email);\
    $sent = wp_mail($admin_email, $subject, $message, $headers);\
    error_log('[Order Handler] Admin email sent result: ' . ($sent ? 'SUCCESS' : 'FAILED'));\
\
    // Customer email\
    if (!empty($email) && is_email($email)) \{\
        $customer_message  = '<h2>Thank you for your order!</h2>';\
        $customer_message .= '<p>Your order for <strong>' . esc_html($house_name) . '</strong> has been received.</p>';\
        $customer_message .= '<h3>Order Summary</h3>';\
        $customer_message .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';\
        foreach ($fields_map as $key => $label) \{\
            if (isset($selections[$key])) \{\
                $val = hello_house_get_selection_value($selections[$key]);\
                $val = is_string($val) ? $val : '';\
                $customer_message .= '<tr><td style="padding: 10px; font-weight: bold;">' . esc_html($label) . ':</td><td style="padding: 10px;">' . esc_html($val ?: 'Not selected') . '</td></tr>';\
            \}\
        \}\
        $customer_message .= '</table>';\
\
        $customer_message .= '<h3>Pricing</h3>';\
        $customer_message .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';\
        $customer_message .= '<tr><td style="padding: 10px; font-weight: bold;">Subtotal:</td><td style="padding: 10px; text-align: right;">\'80' . number_format($subtotal, 2, '.', ',') . '</td></tr>';\
        $customer_message .= '<tr><td style="padding: 10px; font-weight: bold;">Transportation:</td><td style="padding: 10px; text-align: right;">\'80' . number_format($transportation_cost, 2, '.', ',') . '</td></tr>';\
        $customer_message .= '<tr style="background: #1F4B43; color: white;"><td style="padding: 10px; font-weight: bold;">Total:</td><td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">\'80' . number_format($total_price, 2, '.', ',') . '</td></tr>';\
        $customer_message .= '</table>';\
\
        $customer_message .= '<p>We will contact you shortly at this email address to confirm your order details.</p>';\
\
        $customer_headers = array('Content-Type: text/html; charset=UTF-8');\
\
        $customer_sent = wp_mail($email, 'Your House Order Confirmation', $customer_message, $customer_headers);\
        error_log('[Order Handler] Customer email sent result: ' . ($customer_sent ? 'SUCCESS' : 'FAILED'));\
    \}\
\
    error_log('[Order Handler] ===== ORDER SUBMISSION COMPLETED SUCCESSFULLY =====');\
    error_log('[Order Handler] Order ID: ' . $order_id);\
\
    wp_send_json_success(array(\
        'message'  => 'Order submitted successfully',\
        'order_id' => $order_id,\
    ));\
\}}