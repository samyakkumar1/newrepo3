/**
 * Created by DesignerBe on 08-12-2020.
 */

exports.index = function (req, res) {
    if (req.user) {
        getLatestShoppingCartId(req.user.id, function (latestId) {
            var table = (req.body.itemType == "BC" ? "user_cards" : (req.body.itemType == "OTHER" ? "user_other_products" : "user_logos"));
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT `id`, `item_id` FROM `shopping_cart_items` WHERE shopping_cart_id = ? AND `item_type` = ? AND `item_id` = ? AND `item_id` IN (SELECT `id` FROM "+table+" WHERE `user_id` = ? AND `id` = ?)",
                        params: [latestId, req.body.itemType, req.body.item_id, req.user.id, req.body.item_id]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){
                        res.send({status: 200, insertId: rows[0].id});
                    } else {
                        easydb(dbPool)
                            .query(function () {
                                    return {
                                        query: "INSERT INTO `shopping_cart_items` (`shopping_cart_id`, `item_id`, `item_type`) VALUES (?, ?, ?)",
                                        params: [latestId, req.body.item_id, req.body.itemType]
                                    };
                                })
                            .success(function (rows) {
                                res.send({status: 200, insertId: rows.insertId});
                            })
                            .error(function (err) {
                                logger.error(err);
                                res.send({msg: err.message, status: 500});
                            }).execute({transaction: true});
                    }
                }).execute({transaction: true});
        }, function (err) {
            res.send(err);
        });
    } else {
        res.send(403);
    }
};
