/**
 * Created by DesignerBe on 15-12-2020.
 */

var fs = require("fs");

exports.index = function (req, res, next) {
    var fileName = config.USER_LOGO_PATH + "/" + req.query.id;
    fs.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
            logger.error(err);
            res.writeHead(404);
            res.end();
        } else {
            res.status(200).setHeader("Content-Disposition", 'attachment; filename="'+ req.query.id +'.svg"');
            res.setHeader("Content-Type", "image/svg+xml");
            res.writeHead(200);
            res.end(data);
        }
    });
};
