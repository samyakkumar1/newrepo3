/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "INSERT INTO `shopping_cart_items` (`shopping_cart_id`, `item_id`, `item_type`, `qty`, `finish`, `paper_stock`, `back_of_card`) VALUES (?, ?, ?, ?, ?, ?, ?)",
                params: [req.body.shopping_cart_id, req.body.item_id, req.body.item_type, req.body.qty, req.body.finish, req.body.paper_stock, req.body.back_of_card]
            };
        })
        .success(function (rows) {
            res.send({status: 200, insertId: rows.insertId});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};