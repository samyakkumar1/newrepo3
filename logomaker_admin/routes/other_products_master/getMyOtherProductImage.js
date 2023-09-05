/**
 * Created by DesignerBe on 14-12-2020.
 */
var fs = require("fs");

exports.index = function (req, res, next) {
    var fileName = config.MY_OTHER_PRODUCTS_PATH + "/" + req.query.id;
    fs.readFile(fileName, function (err, data) {
        if (err) {
            logger.error(err);
            res.writeHead(404);
            res.end();
        } else {
            res.setHeader("Content-Type", "image/" + fileName.split('.').pop());
            res.writeHead(200);
            res.end(data);
        }
    });
};
