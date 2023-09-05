/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");

exports.index = function (req, res) {
    updateCardFile(req.body.url, req.body.content, function (err) {
        if (err) {
            res.send({msg: "Error saving card file.", status: 500});
        } else {
            res.send({status: 200});
        }
    });
};

function updateCardFile(url, contents, callback) {
    if (url && contents ) {
        var fileName = config.USER_CARD_PATH + "/" + url;
        contents = contents.replace(/ArialMT/g, "Arial");
        contents = contents.replace(/Arial-BoldMT/g, "Arial");
        fs.writeFile(fileName, contents, function (err) {
            if (err) {
                logger.error(err);
                callback(err);
            } else {
                callback(undefined, url);
            }
        });
    } else {
        callback(new Error("Nothing to update"), null);
    }
}