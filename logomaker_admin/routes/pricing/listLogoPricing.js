
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM logo_pricing",
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