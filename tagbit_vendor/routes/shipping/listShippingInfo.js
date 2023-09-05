
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT shopping_carts.date_purchased, shipping_address.postal_code, shipping_address.country, shipping_address.city, shipping_address.state, shipping_address.address1, shipping_address.address2, shipping_address.last_name, shipping_address.first_name, shipping_address.phone_number, shipping_address.email_address, shipping.shipper_name, shipping.status, shipping.expected_date, shipping.tracking_id, purchased_items.shipping_info_id, shopping_carts.id AS order_id, purchased_items.type FROM shipping_address INNER JOIN shopping_carts ON shopping_carts.shipping_address_id = shipping_address.id INNER JOIN purchased_items ON purchased_items.shopping_cart_id = shopping_carts.id INNER JOIN shipping ON purchased_items.shipping_info_id = shipping.id WHERE purchased_items.type =  'BC' ORDER BY purchased_items.created_at DESC ",
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({items: rows, status: 200});
            } else {
                res.send({msg: "No items found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};