
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE other_product_setting_values SET `value_label` = ? WHERE id = ?",
                params: [req.body.value_label, req.body.id]
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