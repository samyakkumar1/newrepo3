var geoip = require('geoip-lite');

exports.index = function (req, res) {
    var cartInfo;
    easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT shopping_carts.date_purchased, shipping.expected_date AS expected_date, shopping_carts.id AS order_id, users.email, shopping_carts.payement_type, CONCAT(shopping_carts.price, ' ', shopping_carts.currency) AS order_total, shipping.tracking_id AS tracking_id, DATE_FORMAT(shopping_carts.date_purchased, '%b %d %Y %h:%i %p ') AS date_purchased, CONCAT(shipping_address.email_address, '\n', shipping_address.phone_number, '\n', shipping_address.first_name, '\n', shipping_address.last_name, '\n', shipping_address.address1, '\n', shipping_address.address2, '\n', shipping_address.city, '\n', shipping_address.state, '\n', shipping_address.country, '\n', shipping_address.postal_code) AS shipping_address FROM shopping_carts INNER JOIN users ON shopping_carts.user_id = users.id INNER JOIN purchased_items ON shopping_carts.id = purchased_items.shopping_cart_id INNER JOIN shipping_address ON shopping_carts.shipping_address_id = shipping_address.id AND users.id = shipping_address.user_id INNER JOIN shipping ON purchased_items.shipping_info_id = shipping.id WHERE (shopping_carts.status = 'PURCHASED') AND shipping.id = ? GROUP BY shopping_carts.id",
                    params: [req.query.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0) {
                    cartInfo = rows[0];
                } else {
                    res.render("error", {
                        message: "Can't get Invoice Info",
                        error: new Error("Can't get Invoice Info"),
                        title: "Error",
                        i18n: req.i18n,
                        geoip: geoip.lookup(global.formatIp(req)),
                        refiral_key: config.REFIRAL_KEY,
                        base: config.APP_DOMAIN,
                        user: req.user,
                        options: config.renderOptions
                    });
                }
            })
            .query(function () {
                return {
                    query: "SELECT purchased_items.id, purchased_items.type, company_name, slogan, first_name, last_name, address_line_1, address_line_2, website, phone_no, email, qty, finish, paper_stock, back_of_card, back_side_super_premium,  purchased_items.shipping_type FROM shopping_carts INNER JOIN purchased_items ON shopping_carts.id = purchased_items.shopping_cart_id INNER JOIN shipping ON purchased_items.shipping_info_id = shipping.id WHERE (shopping_carts.status = 'PURCHASED') AND shipping.id = ?",
                    params: [req.query.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0) {
                    if(rows[0]["type"] == "CUSTOM"){
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: " SELECT uops.*,opd.* FROM shipping AS s LEFT JOIN purchased_items AS pui ON s.id = pui.shipping_info_id LEFT JOIN user_other_products_custom AS uops ON uops.id = pui.base_item_id LEFT JOIN other_product_details AS opd ON uops.base_product_id = opd.id WHERE s.id= ?",
                                params: [req.query.id]
                            };
                        })
                        .success(function (rows2) {
                            res.status(200).render('invoice', {
                                cartInfo: cartInfo,
                                products:rows2,
                                items: rows,
                                url: config.APP_DOMAIN + "/my-designs",
                                options: config.renderOptions
                            });
                        }).execute();
                    }else{
                        res.status(200).render('invoice', {
                            cartInfo: cartInfo,
                            products:[],
                            items: rows,
                            url: config.APP_DOMAIN + "/my-designs",
                            options: config.renderOptions
                        });
                    }  
                } else {
                    res.render("error", {
                        message: "Can't get Invoice Info",
                        error: new Error("Can't get Invoice Info"),
                        title: "Error",
                        i18n: req.i18n,
                        geoip: geoip.lookup(global.formatIp(req)),
                        refiral_key: config.REFIRAL_KEY,
                        base: config.APP_DOMAIN,
                        user: req.user,
                        options: config.renderOptions
                    });
                }
            })
            .error(function (err) {
                logger.error(err);
                res.render("error", {
                    message: "DB Error",
                    error: err,
                    title: "Error",
                    i18n: req.i18n,
                    geoip: geoip.lookup(global.formatIp(req)),
                    refiral_key: config.REFIRAL_KEY,
                    base: config.APP_DOMAIN,
                    user: req.user,
                    options: config.renderOptions
                });
            }).execute();
};