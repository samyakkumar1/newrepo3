var fs = require("fs");

exports.index = function (req, res) {
    var writeFiles = function (dir) {
        fs.writeFile(dir + "/html.ejs", req.body.code, function (h_err) { 
            fs.writeFile(dir + "/text.ejs", req.body.text, function (t_err) { 
                res.send({status: 200, text_err: t_err ? t_err.message : t_err, html_err: h_err ? h_err.message : h_err});
            });
        }); 
    };
    var name = config.EMAIL_TEMPLATES_DIR + "/" + req.body.name;
    if (fs.existsSync(name)){
        var isDir = fs.lstatSync(name).isDirectory();
        if (isDir) {
            writeFiles(name);
        } else {
            res.send({status: 500, msg: "A file with the name '" + req.body.name + "' already exists! Please change the name!!"});
        }
    } else {
        fs.mkdirSync(name);
        writeFiles(name);
    }
};