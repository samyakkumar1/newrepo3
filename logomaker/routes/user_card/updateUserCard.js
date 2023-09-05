/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");

exports.index = function (req, res) {
    if (req.user) {
        var s3_front_card_url, s3_back_card_url;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT s3_front_card_url, s3_back_card_url, design_type FROM `user_cards` WHERE `id` = ? AND `user_id` = ?",
                    params: [req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                var _updateDb = function (front_url, back_url, callback) {
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "UPDATE `user_cards` SET `base_card_id` =  ?,`first_name` = ?,`last_name` =  ?,`address_line_1` = ?,`address_line_2` = ?,`website` = ?,`email` = ?,`phone_no` = ?,`s3_front_card_url` = ?,`s3_back_card_url` = ?,`modified_at` = CURRENT_TIMESTAMP, `qty` = ?, `finish` = ?, `paper_stock` = ?, `back_of_card` = ?, `back_side_super_premium` = ?, `shipping_type` = ?, `purchase_design` = ?, `dont_print_card` = ? WHERE `id` = ? AND user_id = ?",
                                params: [req.body.base_item_id, req.body.first_name, req.body.last_name, req.body.address_line_1, req.body.address_line_2, req.body.website, req.body.email, req.body.phone_no, front_url, back_url, req.body.qty, req.body.finish, req.body.paper_stock, req.body.back_of_card, req.body.back_side_super_premium, req.body.shipping_type, req.body.purchase_design, req.body.dont_print_card, req.body.id, req.user.id]
                            };
                        })
                        .success(function (rows) {
                            if (rows.affectedRows > 0) {
                                res.send({status: 200, frontUrl: front_url, backUrl: back_url});
                                if (callback) {
                                    callback();
                                }
                            } else {
                                res.send({msg: "No rows updated", status: 500});
                            }
                        })
                        .error(function (err) {
                            logger.error(err);
                            res.send({msg: err.message, status: 500});
                        }).execute();
                }
                var _updateFile = function (url, type, callback) {
                    saveCardFile(url, type, function (err, s3_front_card_url) {
                        if (err) {
                            res.send({msg: "Can't save card file", status: 500});
                        } else {
                            callback(s3_front_card_url);
                        }
                    });
                };
                var _deleteFile = function (path) {
                    fs.unlink(path, function (err) {
                        if (err) {
                            logger.error(err);
                        }
                    });
                };
                var _updateFilesAndDeleteOldFiles = function () {
                    _updateFile(req.body.url, req.body.design_type, function (s3_front_card_url) {
                        _updateFile(req.body.url_back, req.body.design_type, function (s3_back_card_url) {
                            _updateDb(s3_front_card_url, s3_back_card_url, function () {
                                _deleteFile(config.USER_CARD_PATH + "/" + rows[0].s3_front_card_url);
                                _deleteFile(config.USER_CARD_PATH + "/" + rows[0].s3_back_card_url);
                            });
                        });
                    });
                }
                if (rows.length > 0) {
                    if (req.body.design_type == "SystemDesign") {
                        if (rows[0].design_type == "SystemDesign") {
                            s3_front_card_url = rows[0].s3_front_card_url;
                            s3_back_card_url = rows[0].s3_back_card_url;
                            updateCardFile(s3_front_card_url, req.body.url, function (err, front_url) {
                                if (err) {
                                    res.send({msg: "Error saving card file.", status: 500});
                                } else {
                                    updateCardFile(s3_back_card_url, req.body.url_back, function (err, back_url) {
                                        if (err) {
                                            res.send({msg: "Error saving card file.", status: 500});
                                        } else {
                                            _updateDb(front_url, back_url);
                                        }
                                    });
                                }
                            });
                        } else {
                            _updateFilesAndDeleteOldFiles();
                        }
                    } else {
                        if (rows[0].design_type == "SystemDesign") {
                            _updateFilesAndDeleteOldFiles();
                        } else {
                            if (req.body.url && req.body.url_back) {
                                _updateFilesAndDeleteOldFiles();
                            } else {
                                s3_front_card_url = rows[0].s3_front_card_url;
                                s3_back_card_url = rows[0].s3_back_card_url;
                                if (req.body.url) {
                                    _updateFile(req.body.url, req.body.design_type, function (new_s3_front_card_url) {
                                        _updateDb(new_s3_front_card_url, s3_back_card_url, function () {
                                            _deleteFile(s3_front_card_url);
                                        });
                                    });
                                } else {
                                    _updateFile(req.body.url_back, req.body.design_type, function (new_s3_back_card_url) {
                                        _updateDb(s3_front_card_url, new_s3_back_card_url, function () {
                                            _deleteFile(s3_back_card_url);
                                        });
                                    });
                                }
                            }
                        }
                    }
                } else {
                    throw new Error("Invalid Card ID");
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

function updateCardFile(url, contents, callback) {
    if (url != null && contents != null) {
        var fileName = config.USER_CARD_PATH + "/" + url;
        contents = contents.replace(/ArialMT/g, "Arial");
        contents = contents.replace(/Arial-BoldMT/g, "Arial");
        fs.writeFile(fileName, contents, function (err) {
            if (err) {
                logger.error(err);
            } else {
                callback(undefined, url);
            }
        });
    } else {
        callback(undefined, null);
    }
}