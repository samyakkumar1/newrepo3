/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");
exports.index = function (req, res) {
    if (req.user) {
        if (req.body.saved_to == "purchase") {
            updateOtherProductFile(req.body.url, req.body.svg_data, function (err, url) {
                if (err) {
                    logger.error("Error saving file.");
                    logger.error(err);
                }
                res.send({status: 200, url: req.body.url});
            });
        } else {
            var url;
            var db = easydb(dbPool);
            db
                    .query(function () {
                        return {
                            query: "SELECT image_url FROM `user_other_products` WHERE `id` = ? AND `user_id` = ?",
                            params: [req.body.saved_item_id, req.user.id]
                        };
                    })
                    .success(function (rows) {
                        if (rows.length > 0) {
                            url = rows[0].image_url;
                            updateOtherProductFile(url, req.body.svg_data, function (err, url) {
                                if (err) {
                                    logger.error("Error saving file.");
                                    logger.error(err);
                                }
                            });
                        } else {
                            throw new Error("Invalid user product ID");
                        }
                    })
                    .query(function () {
                        return {
                            query: "UPDATE `user_other_products` SET base_design_id = ?, user_logo_id= ?, `modified_at` = CURRENT_TIMESTAMP WHERE `id` = ? AND `user_id` = ?",
                            params: [req.body.design_id, req.body.user_logo_id, req.body.saved_item_id, req.user.id]
                        };
                    })
                    .success(function (rows) {
                        if (rows.affectedRows > 0) {
                            db
                                    .query(function () {
                                        return {
                                            query: "DELETE FROM `user_other_product_settings` WHERE user_other_product_id = ?",
                                            params: [req.body.saved_item_id]
                                        };
                                    })
                                    .query(function () {
                                        var sql = "INSERT INTO `user_other_product_settings` (`user_other_product_id`, `product_settings_id`, `setting_value`) VALUES ";
                                        var rem = [];
                                        var params = [];
                                        for (var setting in req.body.settings) {
                                            if (req.body.settings.hasOwnProperty(setting)) {
                                                var item = req.body.settings[setting];
                                                var _fn = function (value) {
                                                    rem.push("(?, ?, ?) ");
                                                    params.push(req.body.saved_item_id);
                                                    params.push(setting);
                                                    params.push(value);
                                                }
                                                if (Array.isArray(item.value)) {
                                                    for (var i = 0; i < item.value.length; i++) {
                                                        _fn(item.value[i]);
                                                    }
                                                } else {
                                                    _fn(item.value);
                                                }
                                            }
                                        }
                                        return {
                                            query: sql + rem.join(","),
                                            params: params
                                        }
                                    })
                                    .success(function (rows) {
                                        res.send({status: 200, url: url});
                                    });
                        } else {
                            res.send({msg: "No rows updated", status: 500});
                        }
                    })
                    .error(function (err) {
                        logger.error(err);
                        res.send({msg: err.message, status: 500});
                    }).execute();
        }
    } else {
        res.send(403);
    }
};
function updateOtherProductFile(url, contents, callback) {
    var fileName = config.USER_OTHER_PRODUCTS_PATH + "/" + url;
    fs.writeFile(fileName, contents, function (err) {
        if (err) {
            logger.error(err);
        } else {
            callback(undefined, url);
        }
    });
}
