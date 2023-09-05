/**
 * Created by DesignerBe on 08-12-2020.
 */
exports.index = function (req, res) {
    if (req.user) {
        getLatestShoppingCartId(req.user.id, function (latestId) {
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT * FROM shopping_carts WHERE id = ?",
                        params: [latestId]
                    };
                })
                .success(function (rows) {
                    res.send({status: 200, cart: rows[0]});
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
        }, function (err) {
            res.send(err);
        });
    } else {
        res.send(403);
    }
};

