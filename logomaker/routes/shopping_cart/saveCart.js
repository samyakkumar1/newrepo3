/**
 * Created by DesignerBe on 08-12-2020.
 */
exports.index = function (req, res) {
    if (req.user) {
        getLatestShoppingCartId(req.user.id, function (latestId){
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "UPDATE `shopping_carts` SET `modified_at` = CURRENT_TIMESTAMP,`shipping_type` =  ? WHERE `id` = ? AND user_id = ?",
                        params: [req.body.shipping_type, latestId, req.user.id]
                    };
                })
                .success(function (rows) {
                    if (rows.affectedRows > 0) {
                        res.send({status: 200});
                    } else {
                        res.send({msg: "No rows updated", status: 500});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
        }, function (err){
            res.send(err);
        });
    } else {
        res.send(403);
    }
};
