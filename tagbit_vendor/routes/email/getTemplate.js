var fs = require("fs");

exports.index = function (req, res) {
    var name = config.EMAIL_TEMPLATES_DIR + "/" + req.query.name;
    var isDir = fs.lstatSync(name).isDirectory();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    if (isDir) {
        fs.readFile(name + "/html.ejs", 'utf8', function (h_err, h_data) { 
            fs.readFile(name + "/text.ejs", 'utf8', function (t_err, t_data) { 
                res.send({status: 200, text: t_data, text_err: t_err ? t_err.message : t_err, html: h_data, html_err: h_err ? h_err.message : h_err});
            });
        });
    } else {
        fs.readFile(name, 'utf8', function (err, data) {
            if (err){
                res.send({status: 500, msg: err.message});
            } else { 
                res.send({status: 200, html: data});
            }
        });
    }
};