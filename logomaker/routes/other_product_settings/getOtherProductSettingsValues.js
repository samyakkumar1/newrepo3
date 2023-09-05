
exports.index = function (req, res) {
    if (req.user || 1) { 
        var db = easydb(dbPool);
        var sql = "SELECT  other_product_setting_values.setting_id,  other_product_setting_values.value_label,  other_products_pricing.country_id,  other_products_pricing.price,  countries.currency,  other_product_setting_values.id AS setting_value_id FROM other_product_setting_values LEFT JOIN  other_products_pricing ON other_products_pricing.setting_id = other_product_setting_values.id LEFT JOIN  countries ON other_products_pricing.country_id = countries.id WHERE  other_product_setting_values.setting_id = ? AND  other_product_setting_values.status = 'Active' AND (other_products_pricing.country_id IN (SELECT id FROM countries WHERE code = ?) OR other_products_pricing.country_id IS NULL)";
        db.query(function () {
            return {
                query: sql,
                params: [req.query.setting_id, req.query.country_id]
            };
        })
        .success(function (rows) {
            if (rows.length == 0) {
                db.query(function () {
                    var country_id = "US";
                    return {
                        query: sql,
                        params: [req.query.setting_id, country_id]
                    };
                })
                .success(function (rows) {
                    if (rows.length == 0) {
                        res.send({msg: "Pricing is not added for this setting", status: 404});
                    } else {
                        res.send({values: rows, status: 200});
                    }
                });
            } else {
                res.send({values: rows, status: 200});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
    } else {
        res.send(403);
    }
};