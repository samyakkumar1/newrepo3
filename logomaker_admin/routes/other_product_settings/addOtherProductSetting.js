
exports.index = function (req, res) {
    var insertId;
    var idx = 0;
    var maxOrder;
    var pool = easydb(dbPool);
    pool.query(function () {
        return {
            query: "SELECT MAX(item_order) AS maxOrder FROM other_product_settings WHERE `product_id` = ? AND status = 'Active'",
            params: [req.body.product_id]
        };
    }).success(function (rows) {
        if (rows[0].maxOrder || rows[0].maxOrder == 0){
            maxOrder = rows[0].maxOrder + 1;
        } else {
            maxOrder = 0;
        }
    }).query(function () {
        return {
            query: "INSERT INTO other_product_settings (`product_id`, `setting_name`, `control_type`, `page_number`, `related_setting`, `independent_pricing`, `item_order`) VALUES(?, ?, ?, ?, ?, ?, ?)",
            params: [req.body.product_id, req.body.setting_name, req.body.control_type, req.body.page_number, req.body.related_setting, req.body.independent_pricing, maxOrder]
        };
    }).success(function (rows) {
        insertId = rows.insertId;
    });
    for (var i = 0; i < req.body.setting_values.length; i++){
        pool.query(function () {
            idx++;
            return {
                query: "INSERT INTO other_product_setting_values (`setting_id`, `value_label`) VALUES(?, ?)",
                params: [insertId, req.body.setting_values[idx - 1].value_label]
            };
        });
    }
    pool.done(function (rows) {
        res.send({insertId: insertId, status: 200, index: req.body.index, order: maxOrder});
    })
    .error(function (err) {
        logger.error(err);
        res.send({msg: err.message, status: 500}); 
    }).execute({transaction: true});
};