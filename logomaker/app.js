var APP_VERSION = "2.9.6";

global.config = {
    PUBLIC_HTML: "public",
    SESSION_EXPIRY: 30 * 60,
    NOTIFY_TIMEOUT: 10,
    GENERAL_ACTION_RETRY_TIMES: 3
};
var express = require('express'),
    https = require('https'),
    http = require('http'),
    path = require('path'),
    favicon = require('serve-favicon'),
    httpLogger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    fs = require('fs'),
    dateFormat = require('dateformat'),
    I18n = require('i18n-2'),
    session = require('express-session'),
    genericPool = require('generic-pool'),
    mysql = require('mysql'),
    redis = require("redis"),
    RedisStore = require('connect-redis')(express),
    nodemailer = require('nodemailer'),
    cluster = require('cluster'),
    paypal = require('paypal-rest-sdk'),
    crypto = require('crypto'),
    utils = require('./lib/utils'),
    geoip = require('geoip-lite'),
    url = require('url'),
    compression = require('compression'),
    emailTemplates = require('email-templates'),
    schedule = require('node-schedule'),
    smtpPool = require("nodemailer-smtp-pool"), 
    minifyHTML = require('express-minify-html'),
    sparkPostTransport = require('nodemailer-sparkpost-transport');

var algorithm = 'aes-256-ctr';

geoip.startWatchingDataUpdate();
global.emailTemplatesDir = path.resolve(__dirname, 'email');
global.checksum = require('./lib/checksum/checksum.js');
//global.PaytmChecksum = require('./lib/checksum/PaytmChecksum.js');

process.on('uncaughtException', function(err) {
    var stack = err.stack;
    console.log("uncaughtException: " + err.message + "\n", stack);
});

global.appRoot = path.resolve(__dirname);

readSettingsFile();

var transports = [];

if (config.DEVELOPMENT_VERSION) {
    transports.push(new(winston.transports.Console)());
} else {
    transports.push(new(winston.transports.File)({
        filename: "logomaker.winston.log",
        timestamp: 'true',
        maxsize: 1 * 1024 * 1024 * 1024,
    }));
}

global.logger = new(winston.Logger)({
    transports: transports
});

var scheduler = require('./scheduler'),
    pages = require('./routes/app/pages'),
    getPricingDetails = require("./routes/shopping_cart/getPricingDetails"),
    getLogoImage = require('./routes/logo_master/getLogoImage'),
    getCardImage = require('./routes/card_master/getCardImage'),
    getCurrency = require('./routes/app/getCurrency'),
    getUserLogoImage = require('./routes/user_logo/getUserLogoImage'),
    getUserCardImage = require('./routes/user_card/getUserCardImage'),
    downloadLogo = require('./routes/user_logo/downloadLogo'),
    getCardDetails = require("./routes/card_master/getCardDetails"),
    listCards = require("./routes/card_master/listCards"),
    listCategories = require("./routes/category_master/listCategories"),
    listLogos = require("./routes/logo_master/listLogos"),
    addItem = require("./routes/shopping_cart/addItem"),
    listCartItems = require("./routes/shopping_cart/listCartItems"),
    removeItem = require("./routes/shopping_cart/removeItem"),
    addUser = require("./routes/user/addUser"),
    getSalt = require("./routes/user/getSalt"),
    getUser = require("./routes/user/getUser"),
    changePassword = require("./routes/user/changePassword"),
    forgotPassword = require("./routes/user/forgotPassword"),
    isLoggedIn = require("./routes/user/isLoggedIn"),
    passport = require('passport'),
    logout = require("./routes/user/logout"),
    login = require("./routes/user/login"),
    fakeLogin = require("./routes/user/fakeLogin"),
    resetPassword = require("./routes/user/resetPassword"),
    updateUser = require("./routes/user/updateUser"),
    addUserCard = require("./routes/user_card/addUserCard"),
    getUserCardDetails = require("./routes/user_card/getUserCardDetails"),
    listUserCards = require("./routes/user_card/listUserCards"),
    removeUserCard = require("./routes/user_card/removeUserCard"),
    updateUserCard = require("./routes/user_card/updateUserCard"),
    addUserLogo = require("./routes/user_logo/addUserLogo"),
    getLastLogo = require("./routes/user_logo/getLastLogo"),
    getUserLogoDetails = require("./routes/user_logo/getUserLogoDetails"),
    listUserLogos = require("./routes/user_logo/listUserLogos"),
    removeUserLogo = require("./routes/user_logo/removeUserLogo"),
    updateUserLogo = require("./routes/user_logo/updateUserLogo"),
    addItemToCurrentShoppingCart = require("./routes/shopping_cart/addItemToCurrentShoppingCart"),
    getLatestShoppingCartId = require("./routes/shopping_cart/getLatestShoppingCartId"),
    saveCart = require("./routes/shopping_cart/saveCart"),
    getCartDetails = require("./routes/shopping_cart/getCartDetails"),
    getPriceForItem = require("./routes/shopping_cart/getPriceForItem"),
    getPurchaseHistory = require("./routes/shopping_cart/getPurchaseHistory"),
    payment = require("./routes/shopping_cart/payment"),
    updateCheckoutDetails = require('./routes/shopping_cart/updateCheckoutDetails'),
    updateExpressCheckout = require('./routes/shopping_cart/updateExpressCheckout'),
    contactUs = require('./routes/app/sendContactUs'),
    addNewsLetterEmail = require('./routes/app/addNewsLetterEmail'),
    sendFeedback = require('./routes/app/sendFeedback'),
    unsubscribe = require('./routes/app/unsubscribe'),
    getLogoDetails = require('./routes/logo_master/getLogoDetails'),
    listAddresses = require('./routes/shopping_cart/listAddresses'),
    getPurchasedItemDetails = require('./routes/shopping_cart/getPurchasedItemDetails'),
    updatePurchasedItem = require('./routes/shopping_cart/updatePurchasedItem'),
    invoice = require('./routes/shopping_cart/invoice'),
    getOtherItems = require('./routes/shopping_cart/getOtherItems'),
    duplicateCard = require('./routes/user_card/duplicateCard'),
    sendTemp = require('./routes/app/sendTemp'),
    searchCategories = require('./routes/category_master/searchCategories'),
    getCategory = require('./routes/category_master/getCategory'),
    getMoreLogos = require('./routes/logo_master/getMoreLogos'),
    getOtherProductImage = require('./routes/other_products/getOtherProductImage'),
    getOtherProductDetails = require('./routes/other_products/getOtherProductDetails'),
    generateImage = require('./routes/app/generateImage'),
    generateImageWithLogo = require('./routes/app/generateImageWithLogo'),
    getOtherProductDesigns = require('./routes/other_products/getOtherProductDesigns'),
    updateUserCardFile = require('./routes/user_card/updateUserCardFile'),
    listOtherProducts = require('./routes/other_products/listOtherProducts'),
    getOtherProductDesignImage = require('./routes/other_products/getOtherProductDesignImage'),
    getOtherProductSettingsValues = require('./routes/other_product_settings/getOtherProductSettingsValues'),
    getOtherProductSettings = require('./routes/other_product_settings/getOtherProductSettings'),
    getUserOtherProductImage = require('./routes/user_other_products/getUserOtherProductImage'),
    listUserOtherProducts = require('./routes/user_other_products/listUserOtherProducts'),
    addUserOtherProduct = require('./routes/user_other_products/addUserOtherProduct'),
    updateUserOtherProduct = require('./routes/user_other_products/updateUserOtherProduct'),
    removeUserOtherProduct = require('./routes/user_other_products/removeUserOtherProduct'),
    addUserOtherProductCustom = require('./routes/user_other_products/addUserOtherProductCustom'),
    updateUserOtherProductFile = require('./routes/user_other_products/updateUserOtherProductFile'),
    getUserOtherProductDetails = require('./routes/user_other_products/getUserOtherProductDetails');
    getUserOtherCustomProductDetails = require('./routes/user_other_products/getUserOtherCustomProductDetails');
    
    colorSelector = require('./routes/logo_master/colorml');
    fontSelector = require('./routes/logo_master/font-selector');
    imgSelector = require('./routes/logo_master/img-selector');
    generateProduct = require("./routes/other_products/generateProduct");
    getMyOtherProductImage = require('./routes/other_products/getMyOtherProductImage'),

    //blog=require('./routes/blogs/blog');


payment.init();

global.sendMail = function(template_name, template_options, mail_options, successCallback, errCallback) {
    emailTemplates(emailTemplatesDir, function(err, template) {
        if (successCallback == undefined) {
            successCallback = function() {};
        }
        if (errCallback == undefined) {
            errCallback = function(err) {};
        }
        if (err) {
            console.log(err);
            errCallback("Error getting email templates.");
        } else {
            template(template_name, template_options, function(err, html, text) {
                if (err) {
                    console.log(err);
                    logger.error(err);
                    errCallback("Error rendering email templates");
                } else { 
                    var mailOptions = extend({}, {
                        subject: 'Mail from Tagbit', 
                        html: html,
                        text: text,   
                        replyTo: global.config.emailConfig.auth.user
                    }, mail_options); 
                    /* Sparkmail doesn't allow setting custom from */
                    mailOptions.from = global.config.emailConfig.auth.user;
                    transporter.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            console.log("Error :",err)
                            logger.error(err);
                            logger.error(mailOptions);
                            errCallback(err);
                        } else {
                            console.log("Info :",info)
                            successCallback();
                        }
                    });
                    
                }
            });
        }
    });
};

global.dbPool = mysql.createPool({
    connectionLimit: global.config.db.MAX_DB_CONNECTIONS,
    host: global.config.db.DB_HOST,
    user: global.config.db.DB_USER,
    password: global.config.db.DB_PASSWORD,
    database: global.config.db.DB_NAME,
    timezone: "+0000"
});

global.easydb = require('./lib/easydb');

global.subscribeRedisClient = redis.createClient(global.config.redis.REDIS_PORT, global.config.redis.REDIS_HOST);
global.subscribeRedisClient.auth(global.config.redis.REDIS_PASSWORD);

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, config.PASSWORD);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, config.PASSWORD);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

redisPool = genericPool.Pool({
    name: 'redis',
    create: function(callback) {
        var client = redis.createClient(global.config.redis.REDIS_PORT, global.config.redis.REDIS_HOST);
        client.auth(global.config.redis.REDIS_PASSWORD);
        client.on("error", function(err) {
            logger.error("Redis error event - " + client.host + ":" + client.port + " - " + err + " (From Pool)");
            logger.error(err.stack);
        });
        callback(null, client);
    },
    destroy: function(client) {
        client.quit();
    },
    max: global.config.redis.MAX_REDIS_CONNECTIONS,
    min: 2,
    idleTimeoutMillis: 30000,
    log: false
});

global.acquireRedis = function(callback) {
    redisPool.acquire(function(err, redis) {
        callback(err, redis);
    });
};

global.releaseRedis = function(redis) {
    redisPool.release(redis);
};

fs.watch("./config.json", function(event, filename) {
    if (event == 'change') {
        readSettingsFile();
    }
});
var sessionStoreRedisClient = redis.createClient(global.config.redis.REDIS_PORT, global.config.redis.REDIS_HOST);

sessionStoreRedisClient.auth(global.config.redis.REDIS_PASSWORD, function(err) {
    if (err) {
        logger.error("Redis auth failed: " + err);
    } else {
        logger.info("Connected to Redis for storing session");
    }
});
global.formatIp = function(request) {
    return request.connection.remoteAddress;
}
global.sessionStoreRedisClient = sessionStoreRedisClient;
global.sendForbidden = function(req, res) {
    res.status(401).render('error', {
        message: "Access Denied",
        error: {
            stack: "Please Login before using this feature.",
            status: 401
        },
        title: "Error - Unauthorized",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        user: req.user,
        base: config.APP_DOMAIN,
        options: config.renderOptions
    });
};

if (config.ENABLE_SCHEDULER) {
    schedule.scheduleJob(config.JOB_TRIGGER_TIME_IN_CRON_FORMAT || "0 0 * * *", scheduler.dayExpired);
}

var mainFn = function() {
    
    var app = express();
    var htmlToImage = require('html-to-image');
    app.locals.htmlToImage = htmlToImage;
    //view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(favicon(__dirname + '/public/img/favicon.ico'));

    //app.use(httpLogger('dev'));
    app.use(compression({
        filter: shouldCompress
    }))
    app.use(bodyParser({
        limit: '50mb'
    }));
    app.use(minifyHTML({
        override:      true,
        exception_url: false,
        htmlMinifier: {
            removeComments:            true,
            collapseWhitespace:        true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes:     true,
            minifyCSS:				   true,
            minifyJS:				   true,
            processScripts: 		   ["text/html", "text/plain"],
            removeEmptyAttributes:     true
        }
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());

    app.use(function(req, res, next) {
        res.setHeader("Cache-Control", "max-age=3600");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Set-Cookie, Cookie");
        res.setHeader("Access-Control-Allow-Methods", "POST,  OPTIONS");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        if (req.host != require('url').parse(config.APP_DOMAIN).hostname) {
            var url = config.APP_DOMAIN + req.path;
            res.redirect(url);
        } else {
            return next();
        }
    });
    //app.disable('etag');
    app.use(function(req, res, next) {
        if (req.url.indexOf("/img/") >= 0 || req.url.indexOf("/css/") >= 0 || req.url.indexOf("/js/") >= 0 || req.url.indexOf("/fonts/") >= 0 || req.url.indexOf("/svgedit/") >= 0 || req.url.indexOf("/vendor/") >= 0 || req.url.indexOf("/images/") >= 0) {
            res.setHeader("Cache-Control", "public, max-age=31536000");
            res.setHeader("Expires", new Date(Date.now() + 31536000).toUTCString());
        }
        if (req.headers['user-agent'] != undefined && req.headers['user-agent'].indexOf("libwww-perl") >= 0) {
            res.send(404);
        } else {
            next();
        }
    });
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieParser());
    app.use(session({
        saveUninitialized: false,
        resave: false,
        key: global.config.SESSION_KEY,
        secret: global.config.SESSION_SECRET,
        cookie: {
            httpOnly: false,
            maxAge: new Date().getTime() + (7 * 24 * 60),
            path: '/'
        },
        store: new RedisStore({
            prefix: global.config.redis.REDIS_SESSIION_PREFIX,
            client: sessionStoreRedisClient
        })
    }));

    I18n.expressBind(app, {
        // setup some locales - other locales default to en silently
        locales: ['en', 'de', 'es', 'fr', 'pt-pt', 'it', 'tr', 'zh-hans', 'jp', 'nl'],
        extension: ".json"
    });
    app.use(function(req, res, next) {
        req.i18n.setLocaleFromCookie();
        next();
    });
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.get('/test', pages.test);
    app.get('/', function(req, res, next) {
        res.setHeader("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
        res.setHeader("Expires", 0);
	if (req.user) {
            console.log(req.user)
            if(req.user.usertype == 'DESIGNER'){
                console.log("hi")
                pages.mymerch(req, res, next); 
            }else{
                console.log("hi2")
                pages.mydesigns(req, res, next);
            }
        } else {
             pages.index(req, res, next);
	}
    });
    app.get('/index', pages.index);

    //Logo Designer Application (Switched Off Temporarily)
    /*app.get('/logodesigner', function(req, res, next) {
        res.redirect("/logo-designer");
    });
    app.get('/logo-design-online', function(req, res, next) {
        res.redirect("/logo-designer");
    });

    app.get('/ailogodesigner', function(req, res, next) {
        res.redirect("/logo-designer");
    });
    app.get('/logo-designer/checkout', pages.checkout);
    app.get('/logo-designer', pages.ailogodesigner);
    app.get('/logo-designer/*', pages.ailogodesigner);*/



    app.get('/signup', pages.signup);
    app.get('/checkout', pages.checkout);
    app.get('/editProfile', pages.editProfile);

    
    app.get('/aboutUs', function(req, res, next) {
        res.redirect("/about-tagbit");
    });
    app.get('/about-tagbit', pages.aboutUs);
    app.get('/mymerch', pages.mymerch);

   app.get('/blog',function(req, res, next){
	res.redirect("http://blog.tagbit.co/");
	});



    app.get('/howItWorks', function(req, res, next) {
        res.redirect("/steps-to-design-logo-online");
    });
    app.get('/steps-to-design-logo-online', pages.howItWorks);

    app.get('/contact-us', pages.contact_us);
    //app.get('/bulk-orders', pages.bulk_orders);

    app.get('/logoGetStarted', pages.logoGetStarted);
    app.get('/moreFaq', function(req, res, next) {
        res.redirect("/frequently-asked-questions");
    });
    app.get('/frequently-asked-questions', pages.moreFaq);
    app.get('/onFreeLogo', function(req, res, next) {
        res.redirect("/why-online-free-logo");
    });
    app.get('/why-online-free-logo', pages.onFreeLogo);
    app.get('/refundPolicy', function(req, res, next) {
        res.redirect("/refund-policy");
    });
    app.get('/refund-policy', pages.refundPolicy);
    app.get('/community-guidelines', pages.guidelines);
    app.get('/privacyPolicy', function(req, res, next) {
        res.redirect("/privacy-policy");
    });
    app.get('/privacy-policy', pages.privacyPolicy);
    app.get('/shippingPolicy', function(req, res, next) {
        res.redirect("/shipping-policy");
    });
    app.get('/shipping-policy', pages.shippingPolicy);
    app.get('/termsUse', function(req, res, next) {
        res.redirect("/terms-use");
    });
    app.get('/terms-use', pages.termsUse);
   // app.get('/other-product-details', pages.productDetails)
    app.get('/shop/product-details', pages.productDetails)
    
    app.get('/changePassword', function(req, res, next) {
        res.redirect("/change-password");
    });
    app.get('/change-password', pages.changePassword);
    //app.get('/mydesigns', function(req, res, next) {
      //  res.redirect("/my-designs");
    //});
    
    app.get('/svgedit/editor', pages.editor);
    app.get('/my-logo-designs', pages.mydesigns);
    app.get('/getLogoImage', getLogoImage.index);
    app.get('/getCardImage', getCardImage.index);
    app.get('/getUserLogoImage', getUserLogoImage.index);
    app.get('/getUserCardImage', getUserCardImage.index);
    app.get('/cancel', payment.cancel);
    app.get('/execute', payment.execute);
    app.get('/tips', pages.tips);
    app.get('/resetPassword', resetPassword.get);
    app.get('/unsubscribe', unsubscribe.index);
    app.get('/invoice', invoice.index);
    app.get('/login', pages.login);
    app.get('/signup', pages.signup);
    app.get('/forgot_password', function(req, res, next) {
        res.redirect("/forgot-password");
    });


    app.get('/getPaymentMethod', pages.getPaymentMethod);
    app.post('/getCashout', pages.getCashout);
    
    app.get('/forgot-password', pages.forgot_password);
    app.get('/thank-you-for-buying-from-us', pages.thank_you_for_buying_from_us);
    app.get('/emailverification', pages.emailverification);

    //app.get('/sendTemp', sendTemp.index);
    app.get("/other/list", pages.listOtherProducts);

    app.get('/generateImage', generateImage.index);
    app.get('/generateImageWithLogo', generateImageWithLogo.index);
    
    var _noCacheFn = function(req, res, next) {
        res.setHeader("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
        res.setHeader("Expires", 0);
        next();
    };
    app.get('*', _noCacheFn);
    app.post('*', _noCacheFn);
    app.get('/getEncryptedText', function(req, res) {
        if (req.query.text){
            res.send("The encrypted text is: " + encrypt(req.query.text));
        } else {
            res.status(404);
        }
    });
    app.get('/my-designs', function(req, res) {
        res.redirect('/')
    });

    app.get('/getMerchData', pages.getMerchData);
    app.get("/other/list/:categoryUrl", pages.listOtherProducts);
    app.get('/duplicate-card', duplicateCard.index);
    app.get("/getOtherProductImage", getOtherProductImage.index);
    app.get("/getMyOtherProductImage", getMyOtherProductImage.index);
    app.get("/getOtherProductDetails", getOtherProductDetails.index);
    app.get("/getOtherProductDesigns", getOtherProductDesigns.index);
    app.get("/getOtherProductDesignImage", getOtherProductDesignImage.index);
    app.get('/getOtherProductSettings', getOtherProductSettings.index);
    app.get('/getOtherProductSettingsValues', getOtherProductSettingsValues.index);
    app.get("/getUserOtherProductDetails", getUserOtherProductDetails.index);
    app.get("/getUserOtherCustomProductDetails",getUserOtherCustomProductDetails.index);
    app.get("/listUserOtherProducts", listUserOtherProducts.index);
    app.get("/getUserOtherProductImage", getUserOtherProductImage.index);
    app.get("/other", function(req, res, next) {
        res.redirect("/other/list");
    });
    app.get("/other/*", pages.otherProducts);
    if (!config.DISABLE_HEAPDUMP) {
        var heapdump = require('heapdump');
        var lastDumpTime;
        app.get("/heapDump", function(req, res) {
            if ((Date.now() - lastDumpTime) < 14 * 60 * 1000) {
                res.status(404);
            } else {
                lastDumpTime = Date.now();
                heapdump.writeSnapshot(lastDumpTime + '.heapsnapshot', function(err, filename) {
                    if (err) {
                        logger.error(err);
                        res.status(500).send('Dump written to ' + filename);
                    } else {
                        logger.log('Dump written to ', filename);
                        res.send('Dump written to ' + filename);
                    }
                });
            }
        });
    }

    app.get("/email-template", function(req, res, next) {
        var remQuery
        if (req.query.userId) {
            remQuery = "users.id = ?";
        } else {
            remQuery = "-1 = ?";
            req.query.userId = -1;
        }

        easydb(dbPool)
            .query(function() {
                return {
                    query: "SELECT purchased_items.type, purchased_items.url, shipping_address.email_address, shipping_address.first_name AS first_name FROM purchased_items INNER JOIN   shopping_carts ON purchased_items.shopping_cart_id = shopping_carts.id INNER JOIN users ON shopping_carts.user_id = users.id INNER JOIN shipping_address ON shipping_address.user_id = users.id AND shopping_carts.shipping_address_id = shipping_address.id WHERE purchased_items.type = 'LOGO' AND " + remQuery + " group by users.email order by users.id limit ?, ?",
                    params: [req.query.userId, parseInt(req.query.start || 0), parseInt(req.query.limit || 120)]
                };
            })
            .success(function(rows) { 
                if (rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) {
                        var email = rows[i].email_address;
                        var emailName = rows[i].first_name;
                        var prepareAttachements = function(logo) {
                            var attachmentArray = []; 
                            attachmentArray.push({
                                filename: 'banner.jpg',
                                cid: "banner@logomaker.com",
                                contentType: "image/jpg",
                                path: config.APP_DOMAIN + '/generateImageWithLogo?format=png&quality=100&width=600&height=350&url=2.svg&type=banner&logoUrl=' + logo.url + '&nodownload=true'
                            });
                            attachmentArray.push({
                                filename: 'banner.jpg',
                                cid: "tshirt@logomaker.com",
                                contentType: "image/jpg",
                                path: config.APP_DOMAIN + '/generateImageWithLogo?format=png&quality=100&width=244&height=345&url=tshirt.svg&type=banner&logoUrl=' + logo.url + '&nodownload=true'
                            });
                            return attachmentArray;
                        }
                        sendMail("promo_other_products", {
                            base: config.APP_DOMAIN,
                            name: emailName
                        }, {
                            attachments: prepareAttachements({
                                url: rows[i].url
                            }),
                            from: config.emailConfig.auth.user,
                            to: email,
                            subject: emailName + ", Important Announcement | Custom T-shirts & Mugs Launch"
                        }, function() {
                            res.send(200);
                        });
                    }
                } else {
                    res.send("No email to send");
                }
            })
            .error(function(err) {
                logger.error(err);
                res.send({
                    msg: err.message,
                    status: 500
                });
            }).execute();
    });

    app.get('/getImageSelect', (req, res) => {
        const query = req.query;
        const response = {};
        const ImgURL = imgSelector.getRecommendedImageURL(query.industry);
        response.imgurl = ImgURL;
        res.status(200).json(response);
      });
    
      Object.defineProperty(Array.prototype, 'flatten', {
        value: function(depth = 1) {
          return this.reduce(function (flat, toFlatten) {
            return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
          }, []);
        }
      });

      function arrUnique(arr) { 
        let newArray = []; 
        let uniqueObject = {}; 
        for (let i in arr) { 
            objTitle = arr[i]['f']; 
            uniqueObject[objTitle] = arr[i]; 
        } 
        for (i in uniqueObject) { 
            newArray.push(uniqueObject[i]); 
        } 
        return newArray; 
    } 
    
    app.get('/getFontImageMatch', (req, res) => {
        const query = req.query
        const response = {};
        console.log(query.selectArr);
        const ArrSelect = query.selectArr.split("-");
        var payload_list = fontSelector.getImageStyle(ArrSelect);
        console.log(payload_list);

        const amountNear = 6;  //The number of nearest fonts we need
        fontsArr = [];
        for (var i = 0; i < payload_list.length; i++){
          fontsArr.push(fontSelector.getRecommendedFont(JSON.parse(JSON.stringify(payload_list[i][0])), amountNear));
        }
        
        const fonts = fontsArr.flatten(1);
        response.fonts = arrUnique(fonts);
        res.status(200).json(response);
      }); 

    //Point Blocker
    app.get("*", function(req, res, next) {
        res.status(404).render('error', {
            message: "File not Found",
            error: {
                stack: "We can't find the requested page.",
                status: 404
            },
            title: "Error - File Not Found",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            user: req.user,
            base: config.APP_DOMAIN,
            options: config.renderOptions
        });
    });

    app.post('/generateImage', generateImage.post);
    app.post('/updateCheckoutDetails', updateCheckoutDetails.index);
    app.post('/updateDetailsWithAddress', updateCheckoutDetails.updateDetailsWithAddress);
    app.post('/updateExpressCheckout', updateExpressCheckout.index);

    
   // app.post('/createDetailPage',createDetailPage.post)
    app.post('/colorSelectCall', colorSelector.post);
    app.post('/paytm', payment.paytmResp);
    app.post('/getLastLogo', getLastLogo.index);
    app.post('/resetPassword', resetPassword.post);
    app.post("/getCurrency", getCurrency.index);
    app.post("/getPriceForItem", getPriceForItem.index);
    app.post("/getPricingDetails", getPricingDetails.index);
    app.post('/payment', payment.index);
    app.post('/isLoggedIn', isLoggedIn.index);
    app.post('/getCardDetails', getCardDetails.index);
    app.post('/listCards', listCards.index);
    app.post('/listCategories', listCategories.index);
    app.post('/listLogos', listLogos.index);
    app.post('/addItem', addItem.index);
    app.post('/listCartItems', listCartItems.index);
    app.post('/removeItem', removeItem.index);
    app.post('/addUser', addUser.index);
    app.post('/forgotPassword', forgotPassword.index);
    app.post('/getSalt', getSalt.index);
    app.post('/getUser', getUser.index);
    app.post('/changePassword', changePassword.index);
    app.post('/logout', logout.index);
    app.post('/login', login.index);
    app.post('/fakeLogin', fakeLogin.index);
    app.post('/updateUser', updateUser.index);
    app.post('/addUserCard', addUserCard.index);
    app.post('/getUserCardDetails', getUserCardDetails.index);
    app.post('/listUserCards', listUserCards.index);
    app.post('/updateUserCard', updateUserCard.index);
    app.post('/updateUserCardFile', updateUserCardFile.index);
    app.post('/removeUserCard', removeUserCard.index);
    app.post('/listOtherProducts', listOtherProducts.index);
    app.post('/addUserLogo', addUserLogo.index);
    app.post('/getUserLogoDetails', getUserLogoDetails.index);
    app.post('/listUserLogos', listUserLogos.index);
    app.post('/removeUserLogo', removeUserLogo.index);
    app.post('/getLogoDetails', getLogoDetails.index);
    app.post('/updateUserLogo', updateUserLogo.index);
    app.post('/addItemToCurrentShoppingCart', addItemToCurrentShoppingCart.index);
    app.post('/getLatestShoppingCartId', getLatestShoppingCartId.index);
    app.post('/saveCart', saveCart.index);
    app.post('/getCartDetails', getCartDetails.index);
    app.post('/getPurchaseHistory', getPurchaseHistory.index);
    app.post('/contactUs', contactUs.index);
    app.post('/addNewsLetterEmail', addNewsLetterEmail.index);
    app.post('/sendFeedback', sendFeedback.index);
    app.post('/listAddresses', listAddresses.index);
    app.post('/getPurchasedItemDetails', getPurchasedItemDetails.index);
    app.post('/updatePurchasedItem', updatePurchasedItem.index);
    app.post('/getOtherItems', getOtherItems.index);
    app.post('/downloadLogo', downloadLogo.index);
    app.post('/getMoreLogos', getMoreLogos.index);
    app.post('/getCategory', getCategory.index);
    app.post('/searchCategories', searchCategories.index);
    app.post('/fakePaymentSuccess', payment.fakePaymentSuccess);

    app.post('/addUserOtherProduct', addUserOtherProduct.index);
    app.post('/updateUserOtherProduct', updateUserOtherProduct.index);
    app.post('/updateUserOtherProductFile', updateUserOtherProductFile.index);
    app.post('/removeUserOtherProduct', removeUserOtherProduct.index);
    app.post('/addUserOtherProductCustom', addUserOtherProductCustom.index);
    app.post('/generateProduct', generateProduct.index);
    app.post('/changeUserType', pages.changeUserType);
    app.post('/addAccount', pages.addAccount);
    app.post('/requestMoney', pages.requestMoney);
    app.post('/removePaymentMethod',pages.removePaymentMethod);
    app.post('/deleteOtherProductDetails',pages.deleteOtherProductDetails);
    app.post('/getSizeChart',pages.getSizeChart);
    app.post('/checkPinCode',pages.checkPinCode);
    app.post('/requestReturn',pages.requestReturn);
    app.post('/applyCoupan',pages.applyCoupan);
    app.post('/requestCancel',pages.requestCancel);
    app.post('/deleteCoupan',pages.deleteCoupan);
    app.post('/getCoupan',pages.getCoupan);

    

    //app.post('/blog',blog.index);


    /*
     http.createServer(function (req, res) {
     res.writeHead(301, { "Location": global.config.APP_DOMAIN + req.url });
     res.end();
     });
     */
    http.createServer(app).listen(global.config.APP_PORT, "0.0.0.0", function() {
        logger.info('HTTP server listening on port ' + global.config.APP_PORT);
    });
    //var privateKey = fs.readFileSync('sslcert/tagbit.key', 'utf8');
    //var certificate = fs.readFileSync('sslcert/tagbit.crt', 'utf8');
    /*var httpsServer = https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(global.config.APP_PORT_SECURE, function() {
        logger.info('HTTPS server listening on port ' + global.config.APP_PORT_SECURE);
    });*/
};

if (global.config.DEVELOPMENT_VERSION == undefined) {
    if (cluster.isMaster) {
        var numThreads = require('os').cpus().length;
        for (var i = 0; i < numThreads; i++) {
            cluster.fork();
        }
        cluster.on('exit', function(worker, code, signal) {
            logger.error('worker ' + worker.process.pid + ' died');
        });
    } else {
        mainFn();
    }
} else {
    mainFn();
}

function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false
    }

    // fallback to standard filter function
    return compression.filter(req, res)
}

function readSettingsFile() {
    var settingsFile = JSON.parse(fs.readFileSync("./config.json"));
    global.config = extend({}, global.config, settingsFile);
    try {
        global.config.emailConfig = extend({}, global.config.emailConfig_gmail, {
            maxConnections: 20,
            rateLimit: 5
        });
        global.config.emailConfig.auth.pass = decrypt(global.config.emailConfig_tagbit.auth.pass); 
        global.transporter = nodemailer.createTransport(smtpPool(global.config.emailConfig_tagbit)); 
        //global.transporter = nodemailer.createTransport(smtpPool(global.config.emailConfig_sparkPost)); 
        if (!global.config.renderOptions) {
            global.config.renderOptions = {};
        }
        global.config.renderOptions.version = APP_VERSION;  
    } catch (err) {
        console.log("Emails are not available.", err);
    }
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
    });
    return target;
}


global.extend = extend;
