/**
 * Created by DesignerBe on 14-12-2020.
 */
var fs = require("fs");

exports.index = function (req, res, next) {
    var fileName = config.OTHER_PRODUCTS_PATH + "/" + req.query.url;
    fs.readFile(fileName, function (err, data) {
        if (err) {
            logger.error(err);
            res.writeHead(404);
            res.end("Requested image not found!!");
        } else { 
            res.setHeader("Content-Type", "image/" + fileName.split('.').pop());
            res.writeHead(200);
            res.end(data);
        }
    });
};
