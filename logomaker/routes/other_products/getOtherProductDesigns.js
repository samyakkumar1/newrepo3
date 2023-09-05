
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM other_products_designs WHERE other_product_id = ? AND status = 'Active'",
                params: [req.query.id]
            };
        })
        .success(function (rows) {
            res.send({designs: rows, status: 200}); 
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};