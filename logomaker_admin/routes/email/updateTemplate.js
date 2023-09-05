var fs = require("fs");

exports.index = function (req, res) {
    var name = config.EMAIL_TEMPLATES_DIR + "/" + req.body.name; 
    var isDir = fs.lstatSync(name).isDirectory();
    if (isDir) {
        fs.writeFile(name + "/html.ejs", req.body.code, function (h_err) { 
            fs.writeFile(name + "/text.ejs", req.body.text, function (t_err) { 
                res.send({status: 200, text_err: t_err ? t_err.message : t_err, html_err: h_err ? h_err.message : h_err});
            });
        });
    } else {
        fs.writeFile(name, req.body.text || req.body.code, function (err) {
            if (err){
                res.send({status: 500, msg: err.message});
            } else { 
                res.send({status: 200});
            }
        });
    }
};