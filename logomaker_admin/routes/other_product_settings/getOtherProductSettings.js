
exports.index = function (req, res) { 
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM other_product_settings WHERE product_id = ? AND status = 'Active' ORDER BY item_order",
                params: [req.query.product_id]
            };
        })
        .success(function (rows) { 
            res.send({settings: rows, status: 200}); 
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
};