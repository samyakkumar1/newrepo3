
exports.index = function (req, res) {
    var logoItemIds;
    var cardItemIds = [];
    easydb(dbPool)
        .query(function () {
            return {
                query: "select * from purchased_items where shopping_cart_id IN (Select shopping_carts.id From shopping_carts Inner Join purchased_items On purchased_items.shopping_cart_id = shopping_carts.id Inner Join shipping On purchased_items.shipping_info_id = shipping.id Where shipping.id = ?)",
                params: [req.body.orderid]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                res.send({items: rows, status: 200});
            } else {
                throw new Exception ("No items found.");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};