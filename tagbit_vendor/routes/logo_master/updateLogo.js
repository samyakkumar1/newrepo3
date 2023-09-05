var fs = require("fs");

exports.index = function (req, res) {
    var afterSave = function (filename, req, res) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "UPDATE `logos` SET `s3_logo_url` = ?, `desc` = ?, `title` = ?,`url` = ?,`seo_title` = ?,`seo_description` = ?,`seo_keyword` = ? WHERE id = ?",
                    params: [filename, req.body.desc, req.body.title,req.body.url || null,req.body.seotitle,req.body.seoDescription,req.body.seoKeyword, req.body.id]
                };
            })
            .query(function () {
                return {
                    query: "DELETE FROM `logo_categories` WHERE logo_id = ?",
                    params: [req.body.id]
                };
            })
            .success(function (rows) {
                var i = 0;
                var errs = [];
                var fn = function () {
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "INSERT INTO `logo_categories` (logo_id, category_id) VALUES (?, ?)",
                                params: [req.body.id, req.body.category_ids[i]]
                            };
                        })
                        .success(function (rows) {
                            if (i >= req.body.category_ids.length - 1) {
                                if (errs.length > 0) {
                                    res.send({status: 501, insertId: req.body.id, s3_logo_url: filename});
                                } else {
                                    res.send({status: 200, insertId: req.body.id, s3_logo_url: filename});
                                }
                            } else {
                                i++;
                                fn();
                            }
                        })
                        .error(function (err) {
                            logger.error(err);
                            errs.push(err.message);
                            if (i >= req.body.category_ids.length - 1) {
                                res.send({msg: errs, status: 501, insertId: req.body.id, s3_logo_url: filename});
                            } else {
                                i++;
                                fn();
                            }
                        }).execute();
                };
                fn();
            })
            .error(function (err) {
                logger.error(err);
                if (err.message.indexOf("ER_DUP_ENTRY") >= 0){
                    res.send({msg: "Duplicate SEO URL found", status: 500});
                } else {
                    res.send({msg: err.message, status: 500});
                }
            }).execute({transaction: true});
    };

    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT s3_logo_url FROM logos WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                if (req.body.file != undefined) {
                    updateLogoFile(rows[0].s3_logo_url, req.body.file, function (err, url) {
                        if (err) {
                            res.send({msg: err, status: 500});
                        } else {
                            afterSave(url, req, res);
                        }
                    });
                } else {
                    afterSave(rows[0].s3_logo_url, req, res);
                }
            } else {
                throw new Error("Invalid logo id");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};


function updateLogoFile(fileName, contents, callback) {
    contents = contents.replace(/ArialMT/g, "Arial");
    contents = contents.replace(/Arial-BoldMT/g, "Arial");
    fs.writeFile(global.config.LOGO_PATH + "/" + fileName, contents, function (err) {
        if (err) {
            logger.error(err);
            callback(err);
        } else {
            callback(undefined, fileName);
        }
    });
}