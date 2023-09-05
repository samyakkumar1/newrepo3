var fs = require("fs");

exports.index = function (req, res) {
    saveOtherProductsFile(req.body.frontFileType, req.body.base_image_url, function (err, frontFileName){
        if (err){
            logger.error(err);
            res.send({msg: err.message, status: 500});
        } else {
            saveOtherProductsFile(req.body.backFileType, req.body.base_image_back_url, function (err, backFileName){
                if (err){
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                } else {
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "INSERT INTO `other_products` (`name`, `description`, `base_image_url`, `base_image_back_url`, `front_logo_params`, `back_logo_params`, base_params_front, base_params_back, `status`, `created_at`, `seo_url`, `seo_title`, `seo_description`, `seo_keywords`, `category`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?);",
                                params: [req.body.name, req.body.description, frontFileName, backFileName, req.body.front_logo_params, req.body.back_logo_params, req.body.base_params_front, req.body.base_params_back, req.body.status, req.body.seo_url  || null, req.body.seo_title, req.body.seo_description, req.body.seo_keywords, req.body.category]
                            };
                        })
                        .success(function (rows) {
                            res.send({itemId: rows.insertId, frontFileName: frontFileName, backFileName: backFileName, status: 200});
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
};

function saveOtherProductsFile (fileType, contents, callback){
    if (contents){
        var fileName = Date.now() + (fileType ? "." + fileType : "");
        fs.writeFile(global.config.OTHER_PRODUCTS_PATH +"/" + fileName, new Buffer(contents, "base64"), function(err) {
            if(err) {
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