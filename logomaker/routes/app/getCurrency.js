/**
 * Created by DesignerBe on 09-01-2020.
 */

exports.index = function (req, res) {
    var country = 1;
    var currency = "USD";
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM countries WHERE code = ?",
                params: [req.body.country]
            };
        })
        .success(function (countryInfo) {
            if (countryInfo.length > 0) {
                res.send({status : 200, currency: countryInfo[0].currency});
            } else {
                res.send({status: 201, currency: "USD"});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};