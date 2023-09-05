/**
 * Created by DesignerBe on 17-02-2020.
 */

exports.index = function (req, res) {
    var status = req.query.status;
    if(status == "ALL"){
        var cond = "And purchased_items.status != ''";
    }else{
        var cond = "And purchased_items.status = '"+status+"'";
    }
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT  other_products.name as product_name,other_product_details.id AS productsku, other_product_details.color, purchased_items.*,  shipping_address.email_address,  shipping_address.phone_number,shipping_address.first_name,  shipping_address.last_name,  shipping_address.address1,shipping_address.address2,  shipping_address.city,  shipping_address.state,  shipping_address.country,shipping_address.postal_code, other_product_details.logo, other_product_details.title AS otherProductName,user_other_products_custom.small,user_other_products_custom.medium,user_other_products_custom.large,user_other_products_custom.xl,user_other_products_custom.doublexl FROM  purchased_items INNER JOIN  (shopping_carts CROSS JOIN  shipping_address) ON shopping_carts.id = purchased_items.shopping_cart_id AND shipping_address.id = shopping_carts.shipping_address_id INNER JOIN  user_other_products_custom ON purchased_items.base_item_id = user_other_products_custom.id INNER JOIN  other_product_details ON user_other_products_custom.base_product_id = other_product_details.id LEFT JOIN other_products ON other_products.id = other_product_details.other_product_id LEFT JOIN order_cancel ON order_cancel.purchased_id = purchased_items.id WHERE  purchased_items.type = 'CUSTOM' "+cond+" AND order_cancel.purchased_id IS NULL ORDER BY  purchased_items.created_at DESC",
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