
exports.index = function (req, res) {
    var settings;
    var db = easydb(dbPool);
        db.query(function () {
            return {
                query: "SELECT user_other_product_settings.setting_value, other_product_settings.setting_name, other_product_settings.control_type, user_other_product_settings.id FROM user_other_product_settings INNER JOIN  other_product_settings ON other_product_settings.id = user_other_product_settings.product_settings_id WHERE  user_other_product_settings.user_other_product_id = ? AND  other_product_settings.status <> 'Deleted'",
                params: [req.query.product_id]
            };
        })
        .success(function (rows) {
            settings = rows;
            for (var i = 0; i < settings.length; i++){
                if (settings[i].control_type == "QuantityWithSize"){
                    db.query(function (obj) {
                        var vals = obj.value.split("=");
                        var id = vals[0];
                        settings[obj.index].setting_value = vals[1];
                        return {
                            query: "SELECT other_product_setting_values.value_label FROM other_product_setting_values WHERE other_product_setting_values.status <> 'Deleted' AND id = ?",
                            params: [id]
                        };
                    }, {value: settings[i].setting_value, index: i}) 
                    .success(function (rows, obj) {
                        if (rows.length > 0){
                            settings[obj.index].setting_name = rows[0].value_label;
                        }
                    }, {index: i});
                }
            }
        })
        .done(function(){
            res.send({status: 200, settings: settings});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};