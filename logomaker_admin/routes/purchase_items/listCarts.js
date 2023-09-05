/**
 * Created by DesignerBe on 17-02-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            var condQry = "";
            if (req.body.email){
                condQry = "users.email LIKE '%" + req.body.email + "%' AND "
            }
            var limits = "";
            if (req.body.limit){
                limits = "LIMIT " + req.body.limit;
            }
            return {
                query: "SELECT DATE(purchased_items.created_at) AS orderdate,purchased_items.shopping_cart_id as orderid,purchased_items.qty,users.email, shopping_carts.payement_type, shopping_carts.price, shopping_carts.currency, shopping_carts.date_purchased, CONCAT(shipping_address.email_address, '\n', shipping_address.phone_number, '\n', shipping_address.first_name, '\n', shipping_address.last_name, '\n', shipping_address.address1, '\n', shipping_address.address2, '\n', shipping_address.city, '\n', shipping_address.state, '\n', shipping_address.country, '\n', shipping_address.postal_code) AS shipping_address, GROUP_CONCAT(purchased_items.id) AS purchaseItemIds, GROUP_CONCAT(purchased_items.type) AS purchaseTypes, GROUP_CONCAT(purchased_items.url) AS purchaseUrls, GROUP_CONCAT(purchased_items.url_back) AS purchaseBacks  FROM shopping_carts INNER JOIN users ON shopping_carts.user_id = users.id INNER JOIN shipping_address ON shopping_carts.shipping_address_id = shipping_address.id AND users.id = shipping_address.user_id INNER JOIN purchased_items ON shopping_carts.id = purchased_items.shopping_cart_id WHERE " + condQry + " (shopping_carts.status = 'PURCHASED') GROUP BY shopping_carts.id ORDER BY shopping_carts.id DESC " + limits,
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({carts: rows, status: 200});
            } else {
                res.send({msg: "No items found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};