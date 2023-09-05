/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");

exports.index = function (req, res) {
    updateFile((req.body.type == "logo" ? config.LOGO_PATH : config.CARD_PATH) + "/" + req.body.fileName, req.body.newSrc, function (err, url){
        if (err){
            res.send({msg: "Error writing to file", status: 500});
        } else {
            res.send({status: 200});
        }
    });
};

function updateFile (fileName, contents, callback){
    fs.writeFile(fileName, contents, function(err) {
        if(err) {
            logger.error(err);
            callback(err);
        } else {
            callback(undefined);
        }
    });
}
