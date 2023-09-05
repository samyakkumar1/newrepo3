/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");
exports.index = function (req, res) {
    if (req.user) {
        var url;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT s3_logo_url FROM `user_logos` WHERE `id` = ? AND `user_id` = ?",
                    params: [req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0) {
                    url = rows[0].s3_logo_url;
                    updateLogoFile(rows[0].s3_logo_url, req.body.url, function (err, url){
                        if (err){
                            logger.error("Error saving file.");
                            logger.error(err);
                        }
                    });
                } else {
                    throw new Error("Invalid logo ID");
                }
            })
            .query(function () {
                return {
                    query: "UPDATE `user_logos` SET `base_logo_id` = ?,`company_name` = ?,`slogan` = ?,`modified_at` = CURRENT_TIMESTAMP WHERE `id` = ? AND `user_id` = ?",
                    params: [req.body.base_item_id, req.body.company_name, req.body.slogan, req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.affectedRows > 0) {
                    res.send({status: 200, url: url});
                } else {
                    res.send({msg: "No rows updated", status: 500});
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
};
function updateLogoFile (url, contents, callback){
    var fileName = config.USER_LOGO_PATH + "/" + url;
    contents = contents.replace(/ArialMT/g, "Arial");
    contents = contents.replace(/Arial-BoldMT/g, "Arial");
    fs.writeFile(fileName, contents, function(err) {
        if(err) {
            logger.error(err);
        } else {
            callback(undefined, url);
        }
    });
}
