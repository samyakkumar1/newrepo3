
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT other_product_setting_values.value_label AS setting_value_label, other_product_settings.id AS _setting_id, other_products_pricing.*, other_product_settings.setting_name, countries.country, countries.id AS country_id, other_products.name, other_products.id AS product_id FROM other_products_pricing INNER JOIN other_product_setting_values ON other_product_setting_values.id = other_products_pricing.setting_id INNER JOIN other_product_settings ON other_product_settings.id = other_product_setting_values.setting_id AND other_product_settings.status <> 'Deleted' INNER JOIN other_products ON other_products.id = other_product_settings.product_id AND other_products.status <> 'Deleted' INNER JOIN countries ON countries.id = other_products_pricing.country_id",
                params: []
            };
        })
        .success(function (rows) {
            res.send({items: rows, status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};