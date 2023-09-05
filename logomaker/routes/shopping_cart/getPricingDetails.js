/**
 * Created by DesignerBe on 06-01-2020.
 */
exports.index = function (req, res){
    if (req.body.type == "BC"){
        var country = 1;
        var currency = "USD";
        var status;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM countries WHERE code = ?",
                    params: [req.body.country]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    country = rows[0].id;
                    currency = rows[0].currency;
                    status = 200;
                } else {
                    country = 1;
                    currency = "USD";
                    status = 201;
                }
            })
            .query(function () {
                return {
                    query: "SELECT * FROM vc_pricing WHERE country = ?",
                    params: [country]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    res.send({status: status, pricing: rows, currency: currency});
                } else {
                    country = 1;
                    status = 201;
                    var new_currency = "USD";
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "SELECT * FROM vc_pricing WHERE country = ?",
                                params: [country]
                            };
                        })
                        .success(function (rows) {
                            if (rows.length > 0){
                                res.send({status: status, pricing: rows, currency: new_currency, actual_currency: currency});
                            } else {
                                throw new Error("Pricing for atleast US must be present.");
                            }
                        })
                        .error(function (err) {
                            logger.error(err);
                            res.send({msg: err.message, status: 500});
                        }).execute();
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    }
};