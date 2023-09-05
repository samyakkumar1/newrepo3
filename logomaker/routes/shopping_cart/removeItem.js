/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "DELETE FROM shopping_cart_items WHERE item_id = ? AND item_type = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                    params: [req.body.item_id, req.body.type, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.affectedRows > 0){
                    res.send({status: 200});
                } else {
                    res.send({status: 201, msg: "Invalid Item."});
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
};