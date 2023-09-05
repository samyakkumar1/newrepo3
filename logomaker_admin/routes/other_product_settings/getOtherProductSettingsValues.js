
exports.index = function (req, res) { 
    easydb(dbPool)
        .query(function () {
            var sql = "";
            var id = [];
            if (req.query.item_id){
                sql = "setting_id IN (SELECT id FROM other_product_settings WHERE product_id = ? AND id <> ?)";
                id.push(req.query.item_id);
                id.push(req.query.setting_id);
            } else if (req.query.setting_id) {
                sql = "setting_id = ?";
                id.push(req.query.setting_id);
            } else { 
                sql = "id = ?";
                id.push(req.query.id);
            }
            return {
                query: "SELECT * FROM other_product_setting_values WHERE status = 'Active' AND " + sql ,
                params: id
            };
        })
        .success(function (rows) {
            res.send({values: rows, status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
};