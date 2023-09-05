
exports.index = function (req, res) {
    easydb(dbPool).query(function () {
        return {
            query: "UPDATE other_product_settings SET `setting_name` = ?, `control_type` = ?, `page_number` = ?, `related_setting` = ?, `independent_pricing` = ? WHERE id = ?",
            params: [req.body.setting_name, req.body.control_type, req.body.page_number, req.body.related_setting, req.body.independent_pricing, req.body.setting_id]
        };
    }).success(function (rows) {
        res.send({status: 200});
    }).error(function (err) {
        logger.error(err);
        res.send({msg: err.message, status: 500});
    }).execute({transaction: true});
};