/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");

exports.index = function (req, res) {
    saveLogoFile(req.body.file, function (err, url){
        if (err){
            res.send({msg: err, status: 500});
        } else {
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "INSERT INTO `logos` (`s3_logo_url`, `desc`, `title`,`url`,`seo_title`,`seo_description`,`seo_keyword`,`status`) VALUES (?, ?, ?,?,?,?,?,?)",
                        params: [url, req.body.desc, req.body.title,req.body.url || null,req.body.seoTitle,req.body.seoDescription,req.body.seoKeyword,req.body.status]
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
                                    query: "INSERT INTO `logo_categories` (logo_id, category_id) VALUES (?, ?)",
                                    params: [insertId, req.body.category_ids[i]]
                                };
                            })
                            .success(function (rows) {
                                if (i >= req.body.category_ids.length - 1) {
                                    if (errs.length > 0){
                                        res.send({status: 501, insertId: insertId, s3_logo_url: url, errs: errs});
                                    } else {
                                        res.send({status: 200, insertId: insertId, s3_logo_url: url});
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
                                    res.send({msg: errs, status: 501, insertId: insertId, s3_logo_url: url});
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
        }
    });
};

function saveLogoFile (contents, callback){
    var fileName = Date.now() + ".svg";
    contents = contents.replace(/ArialMT/g, "Arial");
    contents = contents.replace(/Arial-BoldMT/g, "Arial");
    fs.writeFile(global.config.LOGO_PATH +"/" + fileName, contents, function(err) {
        if(err) {
            logger.error(err);
            callback(err);
        } else {
            callback(undefined, fileName);
        }
    });
}

exports.saveLogoFile = saveLogoFile;