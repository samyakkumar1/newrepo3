
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "INSERT INTO other_product_setting_values (`setting_id`, `value_label`) VALUES(?, ?)",
                params: [req.body.setting_id, req.body.value_label]
            };
        })
        .success(function (rows) {
            res.send({insertId: rows.insertId, status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
};