var fs = require("fs");

exports.index = function (req, res) {
    saveOtherProductsDesignFile(req.body.fileType, req.body.design, function (err, designFile) {
        if (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        } else {
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "INSERT INTO `other_products_designs` (`other_product_id`, `design_file`) VALUES (?, ?)",
                        params: [req.body.id, designFile]
                    };
                })
                .success(function (rows) {
                    res.send({
                        id: rows.insertId,
                        fileName: designFile,
                        status: 200
                    });
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
        }
    })
};

function saveOtherProductsDesignFile(fileType, contents, callback) {
    if (contents) {
        var fileName = Date.now() + "_design" + (fileType ? "." + fileType : "");
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