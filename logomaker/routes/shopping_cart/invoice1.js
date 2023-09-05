exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "Select shipping_address.first_name, shipping_address.last_name, shipping.expected_date, shipping.tracking_id, shipping_address.address1, shipping_address.address2, shipping_address.city, shipping_address.state, shipping_address.country, shipping_address.postal_code, shopping_carts.payement_type, shopping_carts.currency, shopping_carts.date_purchased, purchased_items.shipping_type, purchased_items.first_name As first_name1, purchased_items.last_name As last_name1, shopping_carts.price From shipping_address Inner Join shopping_carts On shopping_carts.shipping_address_id = shipping_address.id Inner Join purchased_items On purchased_items.shopping_cart_id = shopping_carts.id Inner Join shipping On purchased_items.shipping_info_id = shipping.id Where shipping.id = ?",
                params: [req.query.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                res.status(200).render('invoice', {
                    id: req.query.id,
                    name: rows[0].first_name + " " + rows[0].last_name,
                    order_id: rows[0].tracking_id ? "#" + rows[0].tracking_id : "",
                    date: rows[0].expected_date,
                    order_date: rows[0].date_purchased,
                    order_total: rows[0].currency + " " + rows[0].price,
                    delivery_address: rows[0].address1 + "<br/>" + rows[0].address2 + "<br/>" + rows[0].city + "<br/>" + rows[0].state + "<br/>" + rows[0].country,
                    url: config.APP_DOMAIN + "/mydesigns",
                    bc_first_name: rows[0].first_name1,
                    bc_last_name: rows[0].last_name1,
                    item_price: "",
                    delivery_options: rows[0].shipping_type ? (rows[0].shipping_type == "Std" ? "Standared" : "Express") : "" ,
                    payment_gateway: rows[0].payement_type,
                    options: config.renderOptions
                });
            } else {
                res.redirect("/");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.redirect("/");
        }).execute();
};