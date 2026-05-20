{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 <?php\
/**\
 * Template Name: Checkout Page\
 * Simple checkout page for house builder\
 */\
\
get_header(); \
\
// Try to get house image from URL parameter or session\
$house_image_url = '';\
if (isset($_GET['house_id'])) \{\
    $house_id = intval($_GET['house_id']);\
    $default_image = get_field('default_image', $house_id);\
    if ($default_image && isset($default_image['url'])) \{\
        $house_image_url = $default_image['url'];\
    \}\
\}\
?>\
\
<div class="checkout-page">\
    <!-- Hidden element to store default image for JavaScript -->\
    <div id="checkout-page-default-image" data-default-image="<?php echo esc_attr($house_image_url); ?>" style="display: none;"></div>\
    \
    <div class="checkout-container">\
        <h1 class="checkout-title">Finalisation de la commande</h1>\
        \
        <div class="checkout-content">\
            <!-- Checkout Form Section -->\
            <div class="checkout-form-section">\
                <form id="checkout-form" method="post" class="checkout-form-card">\
                    <!-- Contact Information -->\
                    <div class="form-section">\
                       <h2 class="form-title">Informations de contact</h2>\
                        \
                        <div class="form-row">\
                            <div class="form-group form-group-half">\
                               <label class="form-label">Nom complet <span class="required">*</span></label>\
                                <input type="text" name="full_name" required class="form-input">\
                            </div>\
                            \
                            <div class="form-group form-group-half">\
                                <label class="form-label">Email <span class="required">*</span></label>\
                                <input type="email" name="email" required class="form-input">\
                            </div>\
                        </div>\
                        \
                        <div class="form-row">\
                            <div class="form-group form-group-half">\
                                <label class="form-label">T\'e9l\'e9phone <span class="required">*</span></label>\
                                <input type="tel" name="phone" required class="form-input">\
                            </div>\
                        </div>\
                    </div>\
                    \
                    <!-- Delivery Address -->\
                    <div class="form-section">\
                        <h2 class="form-title">Adresse de livraison</h2>\
                        \
                        <div class="form-row">\
                            <div class="form-group form-group-full">\
                                <label class="form-label">Adresse (rue) <span class="required">*</span></label>\
                                <input type="text" name="street_address" required class="form-input">\
                            </div>\
                        </div>\
                        \
                        <div class="form-row">\
                            <div class="form-group form-group-half">\
                                <label class="form-label">Ville <span class="required">*</span></label>\
                                <input type="text" name="city" required class="form-input">\
                            </div>\
                            \
                            <div class="form-group form-group-half">\
                                <label class="form-label">Code postal <span class="required">*</span></label>\
                                <input type="text" name="zip_code" required class="form-input">\
                            </div>\
    </div>\
    \
                        <div class="form-row">\
                            <div class="form-group form-group-full">\
                                <label class="form-label">State/Region <span class="required">*</span></label>\
                                <input type="text" name="state_region" required class="form-input">\
                            </div>\
        </div>\
        \
                        <div class="form-row">\
                            <div class="form-group form-group-full">\
                                <label class="form-label">Notes suppl\'e9mentaires</label>\
                                <textarea name="notes" rows="3" class="form-textarea"></textarea>\
                            </div>\
                        </div>\
        </div>\
        \
                    <!-- Transportation Method -->\
                    <div class="form-section transportation-section">\
                       <h6 class="transportation-title">Mode de transport</h6>\
                        \
                        <div class="transportation-option">\
                            <label class="transportation-label">\
                                <input type="checkbox" name="transportation" id="transportation-checkbox" checked class="transportation-checkbox" value="3000">\
                                <span class="transportation-custom-checkbox"></span>\
                                <div class="transportation-content">\
                                    <div class="transportation-info">\
                                        <span class="transportation-name">Transport standard</span>\
                                          <span class="transportation-description">Livraison \'e0 votre adresse sous 15 \'e0 20 jours</span>\
                                    </div>\
                                    <span class="transportation-price" id="transportation-price">\'803,000.00</span>\
                                </div>\
                            </label>\
                        </div>\
        </div>\
        \
                </form>\
        </div>\
        \
            <!-- Order Summary (populated from sessionStorage) -->\
            <div class="order-summary-card">\
                <h2 class="order-summary-title">Order Summary</h2>\
                <div id="order-details" class="order-details"></div>\
                <div class="order-summary-footer">\
                    <button type="submit" form="checkout-form" class="place-order-button">\
                        Place Order\
                    </button>\
                    <p class="terms-text">En passant votre commande, vous acceptez nos Conditions g\'e9n\'e9rales</p>\
                </div>\
            </div>\
        </div>\
        \
        <div id="success-message" class="success-message">\
            <div class="success-icon">\uc0\u10003 </div>\
        <h3>Merci pour votre commande&nbsp;!</h3>\
         <p>Nous avons bien re\'e7u votre demande et nous vous contacterons sous peu.</p>\
        </div>\
    </div>\
</div>\
\
<script type="text/javascript">\
jQuery(document).ready(function($) \{\
    // Transportation cost constant\
    const TRANSPORTATION_COST = 3000;\
    \
    // Default placeholder image URL\
    const PLACEHOLDER_IMAGE = '<?php echo get_template_directory_uri(); ?>/assets/images/placeholder.jpg';\
    \
    // Helper function to get value from selection object or string\
    function getSelectionValue(selection) \{\
        if (!selection) return 'Not selected';\
        if (typeof selection === 'object' && selection !== null) \{\
            return selection.value || selection.label || 'Not selected';\
        \}\
        return selection;\
    \}\
    \
    // Helper function to format price with Euro sign\
   function formatPrice(price) \{\
    if (!price || price === '0' || price === 0) return '\'800.00';\
    let numPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : parseFloat(price);\
    if (isNaN(numPrice)) return '\'800.00';\
    return '\'80' + numPrice.toLocaleString('fr-FR', \{\
        minimumFractionDigits: 2,\
        maximumFractionDigits: 2\
    \});\
\}\
    \
    // Calculate total with transportation\
    function calculateTotal(basePrice, transportationIncluded) \{\
        let base = parseFloat(basePrice) || 0;\
        let transport = transportationIncluded ? TRANSPORTATION_COST : 0;\
        return base + transport;\
    \}\
    \
    // Update order summary\
    function updateOrderSummary() \{\
        let selections = sessionStorage.getItem('house_selections');\
        let transportationIncluded = $('#transportation-checkbox').is(':checked');\
        \
        console.log('[Checkout] Updating order summary, transportation included:', transportationIncluded);\
        \
        if (selections) \{\
            try \{\
                let data = JSON.parse(selections);\
                console.log('[Checkout] Parsed selections data:', data);\
                \
let basePrice = Number(data.totalPrice) || 0;\
                let totalWithTransport = calculateTotal(basePrice, transportationIncluded);\
                let houseName = data.house?.name || 'Unknown';\
                \
                // Get image from selections - try multiple sources\
                let houseImage = '';\
                \
                // Priority 1: Get from house.image\
                if (data.house && data.house.image && data.house.image.trim() !== '') \{\
                    houseImage = data.house.image.trim();\
                    console.log('[Checkout] Image from data.house.image:', houseImage);\
                \}\
                \
                // Priority 2: Get from currentImage (stored separately)\
                if ((!houseImage || houseImage === '') && data.currentImage && data.currentImage.trim() !== '') \{\
                    houseImage = data.currentImage.trim();\
                    console.log('[Checkout] Image from data.currentImage:', houseImage);\
                \}\
                \
                // Priority 3: Get from size selection's image\
                if ((!houseImage || houseImage === '') && data.size && data.size.image && data.size.image.trim() !== '') \{\
                    houseImage = data.size.image.trim();\
                    console.log('[Checkout] Image from data.size.image:', houseImage);\
                \}\
                \
                // Priority 4: Try to get default image from PHP data attribute\
                if (!houseImage || houseImage === '' || houseImage === 'undefined') \{\
                    let defaultImg = $('#checkout-page-default-image').data('default-image');\
                    if (defaultImg && defaultImg.trim() !== '') \{\
                        houseImage = defaultImg.trim();\
                        console.log('[Checkout] Using default image from page data attribute:', houseImage);\
                    \}\
                \}\
                \
                // Priority 5: Last resort - use SVG placeholder\
                if (!houseImage || houseImage === '' || houseImage === 'undefined') \{\
                    houseImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f0f0f0" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3EImage%3C/text%3E%3C/svg%3E';\
                    console.warn('[Checkout] No image found after all checks, using SVG placeholder');\
                    console.warn('[Checkout] Debug - data.house:', data.house);\
                    console.warn('[Checkout] Debug - data.size:', data.size);\
                    console.warn('[Checkout] Debug - data.currentImage:', data.currentImage);\
                \}\
                \
                // Validate URL format\
                if (houseImage && houseImage.startsWith('http')) \{\
                    console.log('[Checkout] \uc0\u10003  Valid image URL found:', houseImage);\
                \} else \{\
                    console.warn('[Checkout] \uc0\u9888  Image URL may be invalid:', houseImage);\
                \}\
                \
                // Always show image container, even if image fails to load\
                console.log('[Checkout] Final house image URL:', houseImage);\
                \
                let sizeValue = getSelectionValue(data.size);\
                \
                // Build order HTML matching the design\
                let orderHtml = '<div class="order-product-item">';\
                \
                // Product section with image, name, and quantity - ALWAYS show image\
                orderHtml += '<div class="order-product-details">';\
                orderHtml += '<div class="order-product-image">';\
                // Always show image container - if image fails, show grey placeholder\
                orderHtml += '<img src="' + houseImage + '" alt="' + houseName + '" onerror="this.onerror=null; this.src=\\'' + PLACEHOLDER_IMAGE + '\\'; this.style.display=\\'block\\'; this.style.backgroundColor=\\'#f0f0f0\\';" style="display: block; width: 100%; height: 100%; object-fit: cover;">';\
                orderHtml += '</div>';\
                orderHtml += '<div class="order-product-info">';\
                orderHtml += '<div class="order-product-name">' + houseName + '</div>';\
                orderHtml += '<div class="order-product-qty">Qty: 1</div>';\
                orderHtml += '</div>';\
                orderHtml += '<div class="order-product-price">' + formatPrice(basePrice) + '</div>';\
                orderHtml += '</div>';\
                \
                // Divider line\
                orderHtml += '<div class="order-divider"></div>';\
                \
                // Price breakdown\
                orderHtml += '<div class="order-price-row">';\
                orderHtml += '<span class="order-price-label">Subtotal</span>';\
                orderHtml += '<span class="order-price-value">' + formatPrice(basePrice) + '</span>';\
                orderHtml += '</div>';\
                \
                orderHtml += '<div class="order-price-row">';\
                orderHtml += '<span class="order-price-label">Shipping</span>';\
                orderHtml += '<span class="order-price-value">' + (transportationIncluded ? formatPrice(TRANSPORTATION_COST) : formatPrice(0)) + '</span>';\
                orderHtml += '</div>';\
                \
                // Divider line before total\
                orderHtml += '<div class="order-divider"></div>';\
                \
                // Total\
                orderHtml += '<div class="order-price-row order-total-row">';\
                orderHtml += '<span class="order-price-label">Total</span>';\
                orderHtml += '<span class="order-price-value order-total-price">' + formatPrice(totalWithTransport) + '</span>';\
                orderHtml += '</div>';\
        \
        $('#order-details').html(orderHtml);\
                console.log('[Checkout] Order summary displayed successfully');\
            \} catch (e) \{\
                console.error('[Checkout] Error parsing selections:', e);\
                $('#order-details').html('<p style="color: red;">Error loading order details. Please go back and try again.</p>');\
            \}\
        \} else \{\
            console.warn('[Checkout] No selections found in sessionStorage');\
            $('#order-details').html('<p style="color: red;">No order data found. Please go back and select your options.</p>');\
        \}\
    \}\
    \
    // Initial load\
    updateOrderSummary();\
    \
    // Handle transportation checkbox change\
    $('#transportation-checkbox').on('change', function() \{\
        // Toggle checked class on label for CSS fallback\
        if ($(this).is(':checked')) \{\
            $(this).closest('.transportation-label').addClass('checked');\
        \} else \{\
            $(this).closest('.transportation-label').removeClass('checked');\
        \}\
        updateOrderSummary();\
    \});\
    \
    // Initialize checked state on load\
    if ($('#transportation-checkbox').is(':checked')) \{\
        $('#transportation-checkbox').closest('.transportation-label').addClass('checked');\
    \}\
    \
    // Handle form submission\
    $('#checkout-form').on('submit', function(e) \{\
        e.preventDefault();\
        \
        console.log('[Checkout] Form submitted');\
        \
        let selections = sessionStorage.getItem('house_selections');\
        let transportationIncluded = $('#transportation-checkbox').is(':checked');\
        \
        // Parse selections and add transportation\
        let selectionsData = null;\
        if (selections) \{\
            try \{\
                selectionsData = JSON.parse(selections);\
                let basePrice = parseFloat(selectionsData.totalPrice) || 0;\
                let totalWithTransport = calculateTotal(basePrice, transportationIncluded);\
                selectionsData.transportation = transportationIncluded;\
                selectionsData.transportationCost = transportationIncluded ? TRANSPORTATION_COST : 0;\
                selectionsData.totalPrice = totalWithTransport;\
                selections = JSON.stringify(selectionsData);\
            \} catch (e) \{\
                console.error('[Checkout] Error parsing selections for submission:', e);\
            \}\
        \}\
        \
        let formData = \{\
            selections: selections,\
            form: $(this).serialize(),\
            transportation: transportationIncluded ? '1' : '0',\
            transportationCost: transportationIncluded ? TRANSPORTATION_COST : 0\
        \};\
        \
        console.log('[Checkout] Submitting order with data:', \{\
            hasSelections: !!selections,\
            transportationIncluded: transportationIncluded,\
            formFields: $(this).serialize()\
        \});\
        \
        // Send AJAX request\
        $.ajax(\{\
            url: '<?php echo admin_url("admin-ajax.php"); ?>',\
            type: 'POST',\
            data: \{\
                action: 'submit_house_order',\
                data: formData\
            \},\
            success: function(response) \{\
                console.log('[Checkout] Order submission success:', response);\
                $('.checkout-form-section').hide();\
                $('.order-summary-card').hide();\
                $('.checkout-content').hide();\
                $('#success-message').addClass('show');\
                \
                // Adjust page to remove extra space\
                $('.checkout-page').addClass('success-showing').css(\{\
                    'min-height': 'auto',\
                    'padding-bottom': '40px'\
                \});\
                \
                // Scroll to success message smoothly\
                $('html, body').animate(\{\
                    scrollTop: $('#success-message').offset().top - 50\
                \}, 500);\
                \
                // Clear session storage\
                sessionStorage.removeItem('house_selections');\
            \},\
            error: function(xhr, status, error) \{\
                console.error('[Checkout] Order submission error:', \{\
                    status: status,\
                    error: error,\
                    response: xhr.responseText\
                \});\
                alert('There was an error submitting your order. Please try again.');\
            \}\
        \});\
    \});\
\});\
</script>\
\
<?php get_footer(); ?>\
}