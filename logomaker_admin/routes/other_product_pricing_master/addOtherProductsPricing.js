
exports.index = function (req, res) {
    var db = easydb(dbPool);
    var pricingId;
    if (req.body.same_value_checked){
        db.query(function () {
            return {
                query: "DELETE FROM other_products_pricing WHERE setting_id IN(SELECT id FROM other_product_setting_values WHERE setting_id IN (SELECT setting_id FROM other_product_setting_values WHERE id = ?)) AND country_id = ?",
                params: [req.body.setting_id, req.body.country_id]
            };
        })
    };
    db.query(function () {
        return {
            query: "INSERT INTO other_products_pricing (`setting_id`, `country_id`, `price`) VALUES(?, ?, ?)",
            params: [req.body.setting_id, req.body.country_id, req.body.price]
        };
    })
    .success(function (rows) { 
        pricingId = rows.insertId;
    });
    if (req.body.same_value_checked){ 
        db.query(function () {
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
        });
    }
    db
        .done(function () { 
            res.send({insertId: pricingId, status: 200});
        })
        .error(function (err) {
            if (err.message.indexOf("ER_DUP_ENTRY") >= 0){
                res.send({msg: "Pricing for this product in this country is already added.", status: 500});
            } else {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }
        }).execute({transaction: true});
};