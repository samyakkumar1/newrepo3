
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "DELETE FROM other_products_pricing WHERE `id` = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            res.send({status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};