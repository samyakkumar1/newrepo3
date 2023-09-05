
exports.index = function (req, res, next) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM countries",
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({countries: rows, status: 200});
            } else {
                res.send({msg: "No countries found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};
