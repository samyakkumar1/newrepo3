/**
 * Created by DesignerBe on 15-12-2020.
 */

var fs = require("fs");

exports.index = function (req, res, next) {
    var fileName = config.USER_OTHER_PRODUCTS_PATH + "/" + req.query.id; 
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    if (!req.query.nodownload){
        res.setHeader("Content-Disposition", "filename=\"" + req.query.id + "\"");
    }
    var type = "image/svg+xml";
    if (req.query.type) {
        type = decodeURIComponent(req.query.type);
    }
    res.setHeader("Content-Type", type);
    var stream = fs.createReadStream(fileName);
    stream.on('error', function (err) {
        res.send(err);
    });
    stream.pipe(res);
};
