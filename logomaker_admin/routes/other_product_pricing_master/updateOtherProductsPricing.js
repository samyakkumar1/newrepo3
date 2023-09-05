
exports.index = function (req, res) { 
    var db = easydb(dbPool); 
    if (req.body.same_value_checked){
        db.query(function () {
            return {
                query: "DELETE FROM other_products_pricing WHERE setting_id IN(SELECT id FROM other_product_setting_values WHERE setting_id IN (SELECT setting_id FROM other_product_setting_values WHERE id = ?)) AND country_id = ?",
                params: [req.body.setting_id, req.body.country_id]
            };
        })
        .query(function () {
            return {
                query: "INSERT INTO other_products_pricing (`setting_id`, `country_id`, `price`) VALUES(?, ?, ?)",
                params: [req.body.setting_id, req.body.country_id, req.body.price]
            };
        })
        .query(function () {
            return {
                query: "SELECT id FROM other_product_setting_values WHERE setting_id IN (SELECT setting_id FROM other_product_setting_values WHERE id = ?)",
                params: [req.body.setting_id]
            };
        })
        .success(function (rows) { 
            for (var i = 0; i < rows.length; i++){
                if (rows[i].id != req.body.setting_id){
                    db.query(function (id) {
                        return {
                            query: "INSERT INTO other_products_pricing (`setting_id`, `country_id`, `price`) VALUES(?, ?, ?)",
                            params: [id, req.body.country_id, req.body.price]
                        };
                    }, rows[i].id);
                }
            }
        })
        .done(function () {
            res.send({id: req.body.id, status: 200});
        }).execute({transaction: true});
    } else { 
        easydb(dbPool)
            .query(function () {
                return {
                    query: "UPDATE other_products_pricing SET `setting_id` = ?, `country_id` = ?, `price` = ? WHERE `id` = ?",
                    params: [req.body.setting_id, req.body.country_id, req.body.price, req.body.id]
                };
            })
            .done(function () {
                res.send({id: req.body.id, status: 200});
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    }
};