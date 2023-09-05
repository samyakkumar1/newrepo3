/**
 * Created by DesignerBe on 27-01-2020.
 */

var crypto = require('crypto');
exports.index = function (req, res) {
    var hex = crypto.createHash("md5")
        .update(decodeURIComponent(req.query.email))
        .digest("hex");
    if (hex == req.query.random){
        easydb(dbPool)
            .query(function () {
                return {
                    query: "DELETE FROM news_letter WHERE `email` = ?",
                    params: [decodeURIComponent(req.query.email)]
                };
            })
            .success(function (rows) {
                res.redirect('/?msg_id=4');
            })
            .error(function (err) {
                logger.error(err);
                res.redirect('/?msg_id=5');
            }).execute();
    } else {
        res.redirect('/?msg_id=5');
    }


}