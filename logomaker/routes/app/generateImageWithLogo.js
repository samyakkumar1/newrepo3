
var fs = require("fs"),
        path = require("path"),
        request = require('request'),
        phantom = require('phantom'),
        generateImage = require('./generateImage');

exports.index = function (req, res) {
    var options = {};
    var pageUrl;
    if (req.query.url && req.query.logoUrl) {
        pageUrl = config.APP_DOMAIN + (req.query.type == "card" ? "/img/cards/" : "/img/banners/") + req.query.url;
        options.width = req.query.width || '200';
        options.height = req.query.height || '115';
        options.quality = req.query.quality || '100';
        options.format = req.query.format || 'jpeg'; 
        options.url = req.query.logoUrl;
        if (!req.query.nodownload) {
            res.status(200).setHeader("Content-Disposition", 'attachment; filename="' + req.query.id + '.' + options.format + '"');
        }
        _actualSend(pageUrl, options, res);
    } else {
        res.send(404);
    }
};

function _actualSend(pageUrl, options, res) { 
    options.nodownload = true;
    options.callback = function (buff) {
            var logoImg = "data:image/" + options.format + ";base64," + buff.toString('base64');
            res.contentType("image/" + options.format);
            phantom.create(["--ignore-ssl-errors=yes", "--ssl-protocol=any"]).then(function (ph) {
                ph.createPage().then(function (page) {
                    page.property('viewportSize', {
                        width: options.width,
                        height: options.height
                    }).then(function () {
                        page.property('clipRect', {
                            top: 0,
                            left: 0,
                            width: options.width,
                            height: options.height
                        }).then(function () {
                            page.open(pageUrl).then(function (status) {
                                page.evaluate(function (format, imgData) {
                                    var attrib = document.createAttribute("style");
                                    attrib.nodeValue = "width:100%;height:100%;" + (format != 'png' ? "background:white" : "");
                                    document.documentElement.setAttributeNode(attrib);
                                    var matches = document.querySelectorAll('.logo');
                                    for (var i = 0; i < matches.length; i++) {
                                        matches[i].setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', imgData);
                                    }
                                }, options.format, logoImg);

                                var fileName = path.resolve(path.normalize(new Date().getTime() + ".tmp." + options.format));
                                page.render(fileName, {format: options.format, quality: options.quality}).then(function () {
                                    var readStream = fs.createReadStream(fileName); 
                                    readStream.pipe(res); 
                                    readStream.on('error', function (chunk) {
                                        res.send(500); 
                                        fs.unlink(fileName, function (err) {
                                            if (err) {
                                                logger.error(err);
                                            }
                                        });
                                    });
                                    readStream.on('end', function (code) {
                                        fs.unlink(fileName, function (err) {
                                            if (err) {
                                                logger.error(err);
                                            }
                                        });
                                    });
                                    ph.exit();
                                });
                            });
                        });
                    });
                });
            }, options); 
    };
    generateImage.generateImage(options, res); 
}