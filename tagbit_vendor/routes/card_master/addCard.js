/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");
exports.index = function (req, res) {
    saveCardFile(req.body.frontCard, function (err, frontCard){
        if (err){
            res.send({msg: err, status: 500});
        } else {
            var updateDb = function (backCard){
                easydb(dbPool)
                    .query(function () {
                        return {
                            query: "INSERT INTO `cards` (`s3_front_card_url`, `s3_back_card_url`, `desc`, `title`,`url`,`seo_title`,`seo_description`,`seo_keyword`) VALUES (?, ?, ?, ?,?,?,?,?)",
                            params: [frontCard, backCard, req.body.desc, req.body.title, req.body.url || null,req.body.seoTitle,req.body.seoDescription,req.body.seoKeyword]
                        };
                    })
                    .success(function (rows) {
                        var i = 0;
                        var errs = [];
                        var insertId = rows.insertId;
                        var fn = function (){
                            easydb(dbPool)
                                .query(function () {
                                    return {
                                        query: "INSERT INTO `card_categories` (card_id, category_id) VALUES (?, ?)",
                                        params: [insertId, req.body.category_ids[i]]
                                    };
                                })
                                .success(function (rows) {
                                    if (i >= req.body.category_ids.length - 1) {
                                        if (errs.length > 0){
                                            res.send({status: 501, insertId: insertId, s3_front_card_url: frontCard, s3_back_card_url: backCard});
                                        } else {
                                            res.send({status: 200, insertId: insertId, s3_front_card_url: frontCard, s3_back_card_url: backCard});
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
                    }).execute();
            };
            if (req.body.backCard != undefined && req.body.backCard.trim().length > 0){
                saveCardFile(req.body.backCard, function (err, backCard) {
                    if (err){
                        res.send({msg: err, status: 500});
                    } else {
                        updateDb(backCard);
                    }
                });
            } else {
                updateDb(null);
            }
        }
    });
};

function saveCardFile (contents, callback){
    if (contents != undefined && contents.trim().length > 0){
        var fileName = Date.now() + ".svg";
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
