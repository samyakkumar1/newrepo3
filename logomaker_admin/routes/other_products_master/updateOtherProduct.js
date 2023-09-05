var fs = require("fs");

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT `base_image_url`, `base_image_back_url` FROM `other_products` WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (old_data) {
            updateOtherProductsFile(req.body.frontFileType, req.body.base_image_url, function (err, frontFileName) {
                if (!frontFileName) {
                    frontFileName = old_data[0].base_image_url;
                }
                if (req.body.forceRemoveFront){
                    frontFileName = null;
                }
                if (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                } else {
                    updateOtherProductsFile(req.body.backFileType, req.body.base_image_back_url, function (err, backFileName) {
                        if (!backFileName) {
                            backFileName = old_data[0].base_image_back_url;
                        }
                        if (req.body.forceRemoveBack){
                            backFileName = null;
                        }
                        if (err) {
                            logger.error(err);
                            res.send({msg: err.message, status: 500});
                        } else {
                            easydb(dbPool)
                                .query(function () {
                                    return {
                                        query: "UPDATE `other_products` SET  `base_image_url` = ?, `base_image_back_url` = ?, `name` = ?, `description` = ?, `front_logo_params` = ?, `back_logo_params` = ?, base_params_front = ?, base_params_back = ?, `status` = ?, `seo_url` = ?, `seo_title` = ?, `seo_description` = ?, `seo_keywords` = ?, `category` = ? WHERE id = ?",
                                        params: [frontFileName, backFileName, req.body.name, req.body.description, req.body.front_logo_params, req.body.back_logo_params, req.body.base_params_front, req.body.base_params_back, req.body.status, req.body.seo_url || null, req.body.seo_title, req.body.seo_description, req.body.seo_keywords, req.body.category, req.body.id]
                                    };
                                })
                                .success(function (rows) {
                                    if (req.body.forceRemoveFront || (req.body.base_image_url && old_data[0].base_image_url)) {
                                        fs.unlink(global.config.OTHER_PRODUCTS_PATH + "/" + req.body.frontFileName, function (err) {
                                            logger.error(err);
                                        });
                                    }
                                    if (req.body.forceRemoveBack || (req.body.base_image_back_url && old_data[0].base_image_back_url)) {
                                        fs.unlink(global.config.OTHER_PRODUCTS_PATH + "/" + req.body.backFileName, function (err) {
                                            logger.error(err);
                                        });
                                    }
                                    res.send({
                                        itemId: req.body.id,
                                        frontFileName: frontFileName,
                                        backFileName: backFileName,
                                        status: 200
                                    });
                                })
                                .error(function (err) {
                                    logger.error(err);
                                    if (err.message.indexOf("ER_DUP_ENTRY") >= 0){
                                        res.send({msg: "Duplicate SEO URL found", status: 500});
                                    } else {
                                        res.send({msg: err.message, status: 500});
                                    }
                                }).execute();
                        }
                    });
                }
            })
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};

function updateOtherProductsFile(fileType, contents, callback) {
    if (contents) {
        var fileName = Date.now() + (fileType ? "." + fileType : "");
        fs.writeFile(global.config.OTHER_PRODUCTS_PATH + "/" + fileName, new Buffer(contents, "base64"), function (err) {
            if (err) {
                logger.error(err);
                callback(err);
            } else {
                callback(undefined, fileName);
            }
        });
    } else {
        callback();
    }
}