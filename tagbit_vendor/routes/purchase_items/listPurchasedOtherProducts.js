/**
 * Created by DesignerBe.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT  purchased_items.*,  shipping_address.email_address,  shipping_address.phone_number,  shipping_address.first_name,  shipping_address.last_name,  shipping_address.address1,  shipping_address.address2,  shipping_address.city,  shipping_address.state,  shipping_address.country,  shipping_address.postal_code,  other_products.name AS otherProductName FROM  purchased_items INNER JOIN  (shopping_carts CROSS JOIN  shipping_address) ON shopping_carts.id = purchased_items.shopping_cart_id AND shipping_address.id = shopping_carts.shipping_address_id INNER JOIN  user_other_products ON purchased_items.base_item_id = user_other_products.id INNER JOIN  other_products ON user_other_products.base_product_id = other_products.id WHERE  purchased_items.type = 'OTHER' ORDER BY  purchased_items.created_at DESC LIMIT ?, ?",
                params: [req.query.start ? parseInt(req.query.start) : 0, 10]
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