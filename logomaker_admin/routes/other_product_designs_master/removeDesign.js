var fs = require ("fs");

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE other_products_designs SET status = 'Deleted' WHERE id = ?",
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