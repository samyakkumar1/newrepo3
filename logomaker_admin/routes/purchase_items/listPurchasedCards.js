/**
 * Created by DesignerBe on 17-02-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT purchased_items.*, shipping_address.email_address,shipping_address.phone_number,shipping_address.first_name,shipping_address.last_name,shipping_address.address1,shipping_address.address2,shipping_address.city,shipping_address.state,shipping_address.country,shipping_address.postal_code FROM purchased_items INNER JOIN shopping_carts INNER JOIN shipping_address ON shopping_carts.id = purchased_items.shopping_cart_id AND shipping_address.id = shopping_carts.shipping_address_id WHERE purchased_items.type = 'BC' ORDER BY purchased_items.created_at DESC LIMIT ?, ?",
                params: [req.body.start ? parseInt(req.body.start) : 0, 11]
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