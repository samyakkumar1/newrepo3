/**
 * Created by Harikrishnan on 10-02-2015.
 */

exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT  user_other_products_custom.new_price,user_other_products_custom.coupan_applied,order_cancel.status AS cancel_status,order_return.status AS return_status,other_product_details.title,user_other_products_custom.price,user_other_products_custom.small,user_other_products_custom.medium,user_other_products_custom.large,user_other_products_custom.xl,user_other_products_custom.doublexl, purchased_items.* FROM purchased_items LEFT JOIN order_return ON order_return.purchased_id = purchased_items.id LEFT JOIN order_cancel ON order_cancel.purchased_id = purchased_items.id LEFT JOIN user_other_products_custom ON user_other_products_custom.id = purchased_items.base_item_id LEFT JOIN other_product_details ON user_other_products_custom.base_product_id = other_product_details.id WHERE purchased_items.shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ? AND STATUS = 'PURCHASED') ORDER BY purchased_items.id DESC",
                    params: [req.user.id]
                };
            })
            .success(function (rows) {
                res.send({items: rows, status: 200});
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
}