
exports.index = function (req, res, next) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT o.id,o.status,u.first_name,u.last_name,u.email,u.id AS user_id,u.phone_num,sc.txn_id,sc.price,sc.shipping_address_id,o.reason,o.created,p_i.shipping_info_id,p_i.url FROM order_cancel AS o LEFT JOIN purchased_items p_i ON p_i.id = o.purchased_id LEFT JOIN shopping_carts sc ON sc.id = p_i.shopping_cart_id LEFT JOIN users u ON u.id = sc.user_id WHERE o.id != '' ORDER BY o.id DESC LIMIT ?, ?",
                params: [req.body.start ? parseInt(req.body.start) : 0, 20]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({data: rows, status: 200});
            } else {
                res.send({msg: "No Return Record found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};
