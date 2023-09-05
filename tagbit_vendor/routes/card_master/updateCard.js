/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");
exports.index = function (req, res) {
    var updateDb = function () {
        var pool = easydb(dbPool);
        pool
            .query(function () {
                return {
                    query: "UPDATE `cards` SET `desc` = ?,`title` = ?, `url` = ?,`seo_title` = ?,`seo_description` = ?,`seo_keyword` = ?  WHERE `id` = ?",
                    params: [req.body.desc, req.body.title, req.body.url || null, req.body.seoTitle, req.body.seoDescription, req.body.seoKeyword, req.body.id]
                };
            })
            .query(function (){
                return {
                    query: "DELETE FROM card_categories WHERE card_id = ?",
                    params: [req.body.id]
                }
            })
            .success(function (rows) {
                var errs = [];
                var i = 0;
                var fn = function (){
                    pool
                        .query(function () {
                            return {
                                query: "INSERT INTO `card_categories` (card_id, category_id) VALUES (?, ?)",
                                params: [req.body.id, req.body.category_ids[i]]
                            };
                        })
                        .success(function (rows) {
                            if (i >= req.body.category_ids.length - 1) {
                                if (errs.length > 0){
                                    res.send({status: 500, msg: errs.join("\n")});
                                } else {
                                    res.send({status: 200});
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
                                res.send({msg: errs, status: 501, insertId: insertId, s3_front_card_url: frontCard, s3_back_card_url: backCard});
                            } else {
                                i++;
                                fn();
                            }
                        })
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
                query: "SELECT s3_front_card_url, s3_back_card_url FROM cards  WHERE `id` = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                saveCardFile(rows[0].s3_front_card_url, req.body.frontCard, function (err, frontCard) {
                    if (err) {
                        res.send({msg: err, status: 500});
                    } else {
                        saveCardFile(rows[0].s3_back_card_url, req.body.backCard, function (err, backCard) {
                            if (err) {
                                res.send({msg: err, status: 500});
                            } else {
                                updateDb();
                            }
                        });
                    }
                });
            } else {
                throw new Error("Invalid Card ID");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
};

function saveCardFile (fileName, contents, callback){
    if (contents != undefined && contents.trim().length > 0){
        contents = contents.replace(/ArialMT/g, "Arial");
        contents = contents.replace(/Arial-BoldMT/g, "Arial");
        fs.writeFile(global.config.CARD_PATH +"/" + fileName, contents, function(err) {
            if(err) {
                logger.error(err);
                callback(err);
            } else {
                callback(undefined, fileName);
            }
        });
    } else {
        callback(null);
    }
}
