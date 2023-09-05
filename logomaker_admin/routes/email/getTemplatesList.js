var fs = require("fs");

exports.index = function (req, res) {
    fs.readdir(config.EMAIL_TEMPLATES_DIR, function (err, files) {
        if (err) {
            logger.error(err);
            res.send({status: 500, msg: err.message, err: err});
        } else {
            res.send({status: 200, files: files}); 
        }
    });
};