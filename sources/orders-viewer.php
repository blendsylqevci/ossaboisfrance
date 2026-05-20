{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 <?php\
/**\
 * Simple Orders Viewer\
 * View all house orders\
 */\
\
$orders = get_posts(array(\
    'post_type' => 'house_order',\
    'posts_per_page' => -1,\
    'post_status' => 'publish'\
));\
\
?>\
\
<!DOCTYPE html>\
<html>\
<head>\
    <title>House Orders</title>\
    <style>\
        body \{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; \}\
        .container \{ max-width: 1200px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); \}\
        h1 \{ color: #333; margin-bottom: 30px; \}\
        .order \{ border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px; \}\
        .order-header \{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; \}\
        .order-title \{ font-size: 18px; font-weight: bold; color: #1F4B43; \}\
        .order-date \{ color: #666; font-size: 14px; \}\
        .order-details \{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; \}\
        .detail-group \{ background: #f8f9fa; padding: 15px; border-radius: 5px; \}\
        .detail-label \{ font-weight: bold; color: #666; font-size: 12px; margin-bottom: 5px; \}\
        .detail-value \{ color: #333; \}\
        .price \{ font-size: 24px; font-weight: bold; color: #1F4B43; text-align: center; padding: 20px; background: #F7FFFD; border-radius: 5px; \}\
    </style>\
</head>\
<body>\
    <div class="container">\
        <h1>House Orders (<?php echo count($orders); ?>)</h1>\
        \
        <?php if (empty($orders)): ?>\
            <p>No orders yet.</p>\
        <?php else: ?>\
            <?php foreach ($orders as $order): ?>\
                <?php\
                $meta = get_post_meta($order->ID);\
                $customer_name = $meta['customer_name'][0] ?? 'Unknown';\
                $house_name = $meta['house_name'][0] ?? 'Unknown';\
                $total_price = $meta['total_price'][0] ?? '0';\
                $order_date = $meta['order_date'][0] ?? '';\
                ?>\
                <div class="order">\
                    <div class="order-header">\
                        <div class="order-title"><?php echo esc_html($order->post_title); ?></div>\
                        <div class="order-date"><?php echo esc_html($order_date); ?></div>\
                    </div>\
                    \
                    <div class="order-details">\
                        <div class="detail-group">\
                            <div class="detail-label">Customer</div>\
                            <div class="detail-value"><?php echo esc_html($meta['customer_name'][0] ?? ''); ?></div>\
                            <div style="margin-top: 10px;">\
                                <div class="detail-label">Email</div>\
                                <div class="detail-value"><?php echo esc_html($meta['customer_email'][0] ?? ''); ?></div>\
                            </div>\
                            <div style="margin-top: 10px;">\
                                <div class="detail-label">Phone</div>\
                                <div class="detail-value"><?php echo esc_html($meta['customer_phone'][0] ?? ''); ?></div>\
                            </div>\
                        </div>\
                        \
                        <div class="detail-group">\
                            <div class="detail-label">House</div>\
                            <div class="detail-value"><?php echo esc_html($house_name); ?></div>\
                            <div style="margin-top: 10px;">\
                                <div class="detail-label">Size</div>\
                                <div class="detail-value"><?php echo esc_html($meta['house_size'][0] ?? ''); ?></div>\
                            </div>\
                            <div style="margin-top: 10px;">\
                                <div class="detail-label">Total Price</div>\
                                <div class="detail-value" style="font-size: 18px; font-weight: bold; color: #1F4B43;">\
                                    \'80<?php echo esc_html($total_price); ?>\
                                </div>\
                            </div>\
                        </div>\
                        \
                        <div class="detail-group" style="grid-column: 1 / -1;">\
                            <div class="detail-label">Customer Address</div>\
                            <div class="detail-value"><?php echo esc_html($meta['customer_address'][0] ?? ''); ?></div>\
                        </div>\
                        \
                        <?php if (!empty($meta['customer_notes'][0])): ?>\
                        <div class="detail-group" style="grid-column: 1 / -1;">\
                            <div class="detail-label">Customer Notes</div>\
                            <div class="detail-value"><?php echo esc_html($meta['customer_notes'][0]); ?></div>\
                        </div>\
                        <?php endif; ?>\
                    </div>\
                </div>\
            <?php endforeach; ?>\
        <?php endif; ?>\
    </div>\
</body>\
</html>\
}