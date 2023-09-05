var express = require('express'), 
    fs = require("fs"),
    phantom = require('phantom'),
    path = require("path"),
    spawn = require('child_process').spawn;
    
var PORT = 8081; 

var app = express();

process.on('uncaughtException', function(err) {
    var stack = err.stack;
    console.log("uncaughtException: " + stack);
});

app.use(function(req, res, next) {
    res.setHeader("Cache-Control", "private, max-age=0, no-cache");
    res.setHeader("Expires", 0);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Set-Cookie, Cookie");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
app.get('/', function (req, res) {
    if (!req.query.url){
        res.status(401).end("url paramerer is mandatory");
    } else {
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
        
        if (!req.query.type) {
            req.query.type = "card";
        }
        if (!req.query.thirdparty) {
            if (!req.query.rootUrl) {
                req.query.rootUrl = "https://www.tagbit.co";
            } else {
                req.query.rootUrl = decodeURIComponent(req.query.rootUrl);
            }
            if (req.query.type === "card"){
                req.query.url = req.query.rootUrl + "/getUserCardImage?nodownload=true&id=" + req.query.url;
            } else if (req.query.type === "logo"){
                req.query.url = req.query.rootUrl + "/getUserLogoImage?nodownload=true&id=" + req.query.url;
            } else {
                req.query.url = req.query.rootUrl + "/getUserOtherProductImage?nodownload=true&id=" + req.query.url;
            }
        }
        generateImage(req.query, req.query.url, res);
    }
});

var server = app.listen(PORT, function() {
    console.log('OFL PhantomJS printer server listening on port ' + server.address().port + ".\nDon't close this window!!");
});

function generateImage(options, url, res) {  
    phantom.create(["--ignore-ssl-errors=yes", "--ssl-protocol=any"]).then(function (ph) {
        var errFn = function (err) {
            console.log(err);
            res.send(500, {staus: 500, msg: err.message});
            ph.exit();
        };
        ph.createPage().then(function (page) {
            var loadPage = function () { 
                page.open(url).then(function (status) {
                    page.evaluate(function (type) {
                        try {
                            var list = document.querySelectorAll('[id=fonts]');
                            for (var i = 0; i < list.length; i++) {
                                list[i].parentNode.removeChild(list[i]);
                            }
                            var attrib = document.createAttribute("style");
                            attrib.nodeValue = "width:100%;height:100%;background-color: #ffffff;";
                            document.documentElement.setAttributeNode(attrib);
                            var newList = document.querySelectorAll('*');
                            for (var i = 0; i < newList.length; i++) {
                                if (newList[i].getAttribute("stroke") == "null") {
                                    newList[i].removeAttribute("stroke");
                                }
                            }
                            if (type == "logo"){
                                shape = document.getElementsByTagName("svg")[0];
                                shape.setAttribute("viewBox", "-40 0 450 246.609"); 
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }, options.type);
                    if (status !== 'success') {
                        console.log("Unable to load the address (" + url + "): " + status);
                        res.send(404);
                        ph.exit(1);
                    } else {
                        var deleteFile = function (file) {
                            fs.unlink(file, function (err) {
                                if (err) {
                                    console.log(err);
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
                                    if (options.cmyk) {
                                        gs_options.unshift('-sProcessColorModel=DeviceCMYK');
                                        gs_options.unshift('-sColorConversionStrategy=CMYK');
                                        gs_options.unshift('-sColorConversionStrategyForImages=CMYK');
                                    }
                                    gs_proc.on('close', function (code) {
                                        deleteFile(fileName);
                                        if (options.type != "card") {
                                            stream = fs.createReadStream(fileName + ".nscale");
                                            stream.pipe(res).once("finish", function () {
                                                stream.destroy();
                                                deleteFile(fileName + ".nscale");
                                            });
                                        } else {
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
                viewPortSize = {width: parseFloat(options.width) || 585, height: parseFloat(options.height) || 270};
            }
            page.property('viewportSize', viewPortSize).then(function () {
                loadPage();
            }, errFn);
        }, errFn);
    });
} 
