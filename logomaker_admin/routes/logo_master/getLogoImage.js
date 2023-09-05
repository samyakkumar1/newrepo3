/**
 * Created by DesignerBe on 14-12-2020.
 */
var fs = require("fs");

exports.index = function (req, res, next) {
    var fileName = config.LOGO_PATH + "/" + req.query.id;
    fs.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
            logger.error(err);
            res.writeHead(404);
            res.end();
        } else {
            res.setHeader("Content-Type", "image/svg+xml");
            res.writeHead(200);
            res.end(data);
        }
    });
};
