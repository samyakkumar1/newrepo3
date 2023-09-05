
exports.index = function (req, res) {
        easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE order_cancel SET status = ? WHERE id = ?",
                params: [req.body.status, req.body.id]
            };
        })
        .success(function (rows) {
            res.send({status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
   // })
};

