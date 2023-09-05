/**
 * Created by DesignerBe on 05-10-2020.
 */

var fs = require('fs');

exports.index = function (req, res) {
    if (req.user) {
        saveOtherProductFile(req.body.svg_data, function (err, filename) {
            if (err) {
                res.send({msg: "Can't save other products file", status: 500});
            } else {
                var db = easydb(dbPool);
                var productId;
                db
                    .query(function () {
                        return {
                            query: "INSERT INTO `user_other_products` ( `user_id`, `base_product_id`, `base_design_id`, `user_logo_id`, `image_url`) VALUES (?, ?, ?, ?, ?)",
                            params: [req.user.id, req.body.product_id, req.body.design_id, req.body.user_logo_id, filename]
                        };
                    })
                    .success(function (rows) {
                        productId = rows.insertId;
                        db.query(function () {
                            var sql = "INSERT INTO `user_other_product_settings` (`user_other_product_id`, `product_settings_id`, `setting_value`) VALUES ";
                            var rem = [];
                            var params = [];
                            for (var setting in req.body.settings) {
                                if (req.body.settings.hasOwnProperty(setting)) {
                                    var item = req.body.settings[setting];
                                    var _fn = function (value) {
                                        rem.push("(?, ?, ?) ");
                                        params.push(productId);
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
                            res.send({status: 200, insertId: productId, url: filename});
                        });
                    })
                    .error(function (err) {
                        logger.error(err);
                        res.send({msg: err.message, status: 500});
                    }).execute({transaction: true});
            }
        });
    } else {
        res.send(403);
    }
};

function saveOtherProductFile(contents, callback) {
    var fileName = Date.now() + ".svg";
    fs.writeFile(config.USER_OTHER_PRODUCTS_PATH + "/" + fileName, contents, function (err) {
        if (err) {
            logger.error(err);
            callback(err);
        } else {
            callback(undefined, fileName);
        }
    });
}
 