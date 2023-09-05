var fs = require("fs"),
        phantom = require('phantom'),
        path = require("path"),
        spawn = require('child_process').spawn;

/*
 * type: logo or card or anything else
 * format: pdf, or any image formats
 * nodownload: setting the Content-Disposition header according to value
 * id: file name for download
 * url: url of svg file
 * from: base or anything, base fetch files from base logo/card folders
 * cmyk: outputs cmyk version of PDF
 */
exports.index = function (req, res) {
    if (!req.query.format) {
        req.query.format = "pdf";
    }
    if (!req.query.quality) {
        req.query.quality = 100;
    }

    if (!req.query.nodownload) {
        res.status(200).setHeader("Content-Disposition", 'attachment; filename="' + req.query.id + '.' + req.query.format + '"');
    }
    if (req.query.format == "pdf") {
        res.contentType("application/pdf");
    } else {
        res.contentType("image/" + req.query.format);
    }
    generateImage(req.query, res, req);
};

/* some text */

function generateImage(options, res, req) {
    var fileName;
    if (options.url.indexOf("data:") == 0) {
        fileName = options.url
    } else {
        fileName = "file:///" + (options.type == "other" ?  (options.from == "base" ? config.OTHER_PRODUCTS_PATH : config.USER_OTHER_PRODUCTS_PATH) : (options.type == "card" ? (options.from == "base" ? config.CARD_PATH : config.USER_CARD_PATH) : (options.from == "base" ? config.LOGO_PATH : config.USER_LOGO_PATH))) + "/" + options.url;
    }

    phantom.create(["--ignore-ssl-errors=yes", "--ssl-protocol=any"]).then(function (ph) {
        var errFn = function (err) {
            logger.error(err);
            res.send(500, {staus: 500, msg: err.message});
            ph.exit();
        };
        ph.createPage().then(function (page) {
            var loadPage = function () {
                page.open(fileName).then(function (status) {
                    page.evaluate(function () {
                        try{
                            var list = document.querySelectorAll('[id=fonts]');
                            for (var i = 0; i < list.length; i++) {
                                list[i].parentNode.removeChild(list[i]);
                            }
                            var attrib = document.createAttribute("style");
                            attrib.nodeValue = "width:100%;height:100%;background-color: #ffffff;";
                            document.documentElement.setAttributeNode(attrib); 
                            var newList = document.querySelectorAll('*');
                            for (var i = 0; i < newList.length; i++){
                                if (newList[i].getAttribute("stroke") == "null"){ 
                                    newList[i].removeAttribute("stroke");
                                }
                            }
                        } catch (err){
                            console.log(err);
                        }
                    });
                    if (status !== 'success') {
                        logger.error("Unable to load the address: " + status);
                        res.send(404);
                        ph.exit(1);
                    } else {
                        var deleteFile = function (file) {
                            fs.unlink(file, function (err) {
                                if (err) {
                                    logger.error(err);
                                }
                            });
                        };
                        var fileName = path.resolve(path.normalize(new Date().getTime() + ".tmp." + options.format));
                        page.render(fileName, {quality: options.quality}).then(function () {
                            if (options.callback) {
                                fs.readFile(fileName, function (err, data) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        options.callback(data);
                                    }
                                    deleteFile(fileName);
                                });
                            } else {
                                var stream;
                                if (options.format == "pdf") {
                                    var gs_options = ['-sOutputFile=' + fileName + ".nscale", '-dSAFER', '-dBATCH', '-dNOPAUSE', '-dNOCACHE', '-sDEVICE=pdfwrite', fileName];
                                    var gs_proc = spawn('gs', gs_options);
                                    if (options.cmyk){ 
                                        gs_options.unshift('-sProcessColorModel=DeviceCMYK');
                                        gs_options.unshift('-sColorConversionStrategy=CMYK');
                                        gs_options.unshift('-sColorConversionStrategyForImages=CMYK');
                                    }
                                    gs_proc.on('close', function (code) { 
                                        deleteFile(fileName);
                                        if (options.type != "card"){
                                            stream = fs.createReadStream(fileName + ".nscale");
                                            stream.pipe(res).once("finish", function () {
                                                stream.destroy();
                                                deleteFile(fileName + ".nscale");
                                            }); 
                                        } else {
                                            //3.63x2.13
                                            //var gs_scale_options = ['-sOutputFile=%stdout', "-sDEVICE=pdfwrite", "-dDEVICEWIDTHPOINTS=261", "-dDEVICEHEIGHTPOINTS=153", "-dFIXEDMEDIA", "-dCompatibilityLevel=1.4", '-dSAFER', '-dBATCH', '-dNOPAUSE', '-dNOCACHE', fileName + ".nscale"];
                                            var gs_scale_options = ['-sOutputFile=%stdout', "-sDEVICE=pdfwrite", "-g2610x1530", "-dPDFFitPage", "-dCompatibilityLevel=1.4", '-dSAFER', '-dBATCH', '-dNOPAUSE', '-dNOCACHE', fileName + ".nscale"];
                                            var gs_scale_proc = spawn('gs', gs_scale_options);
                                            stream = gs_scale_proc.stdout;
                                            stream.pipe(res).once("finish", function () {
                                                stream.destroy();
                                                deleteFile(fileName + ".nscale");
                                            }); 
                                        }
                                    });
                                } else {
                                    stream = fs.createReadStream(fileName);
                                    stream.pipe(res).once("finish", function () {
                                        stream.destroy();
                                        deleteFile(fileName);
                                    }); 
                                }
                            }
                            ph.exit();
                        }, errFn);
                    }
                }, errFn);
            }
            var viewPortSize;
            if (options.type == "card") {
                viewPortSize = {width: parseFloat(options.width) || 1000, height: parseFloat(options.height) || 100};
            } else if (options.type == "logo") {
                viewPortSize = {width: parseFloat(options.width) || 1920, height: parseFloat(options.height) || 1460};
            } else {
                options.width = options.width || 585;
                options.height = options.height || 270;
                viewPortSize = {width: parseFloat(options.width), height: parseFloat(options.height)};
            } 
             
            page.property('viewportSize', viewPortSize).then(function () {
                loadPage();
            }, errFn);  
        }, errFn);
    });
}

exports.generateImage = generateImage;