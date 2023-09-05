global.config = {
    PUBLIC_HTML: "public",
    SESSION_EXPIRY: 30 * 60,
    NOTIFY_TIMEOUT: 10,
    GENERAL_ACTION_RETRY_TIMES: 3
};
var vendors ='';
var express = require('express'),
    http = require('http'),
    path = require('path'),
    favicon = require('static-favicon'),
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
    //redis = require("redis"),
    //RedisStore = require('connect-redis')(express),
    nodemailer = require('nodemailer'),
    utils = require('./lib/utils'),
    crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    emailTemplates = require('email-templates'),
    smtpPool = require("nodemailer-smtp-pool"),
    cron = require('node-cron'),
    basicAuth = require('express-basic-auth'),
    sparkPostTransport = require('nodemailer-sparkpost-transport');


var pages = require('./routes/app/pages'),
    getLogoImage = require('./routes/logo_master/getLogoImage'),
    getCardImage = require('./routes/card_master/getCardImage'),
    addCard = require("./routes/card_master/addCard"),
    getCardDetails = require("./routes/card_master/getCardDetails"),
    listCards = require("./routes/card_master/listCards"),
    removeCard = require("./routes/card_master/removeCard"),
    updateCard = require("./routes/card_master/updateCard"),
    addCategory = require("./routes/category_master/addCategory"),
    getCategoryDetails = require("./routes/category_master/getCategoryDetails"),
    listCategories = require("./routes/category_master/listCategories"),
    removeCategory = require("./routes/category_master/removeCategory"),
    updateCategory = require("./routes/category_master/updateCategory"),
    addLogo = require("./routes/logo_master/addLogo"),
    getLogoDetails = require("./routes/logo_master/getLogoDetails"),
    listLogos = require("./routes/logo_master/listLogos"),
    listPurchasedLogos = require("./routes/reports/listPurchasedLogos"),
    removeLogo = require("./routes/logo_master/removeLogo"),
    updateLogo = require("./routes/logo_master/updateLogo"),
    listCarts = require("./routes/purchase_items/listCarts"),
    updateImage = require("./routes/app/updateImage"),
    listPurchasedCards = require("./routes/purchase_items/listPurchasedCards"),
    getUserLogoImage = require('./routes/user/getUserLogoImage'),
    getUserCardImage = require('./routes/user/getUserCardImage'),
    getUserOtherProductImage = require('./routes/user/getUserOtherProductImage'),
    listUsers = require('./routes/user/listUsers'),
    getMoreUserDetails = require('./routes/user/getMoreUserDetails'),
    getUserOtherProductSettingValues = require('./routes/user/getUserOtherProductSettingValues'),
    updatePurchaseItem = require('./routes/purchase_items/updatePurchaseItem'),
    updateOrderReturn = require('./routes/purchase_items/updateOrderReturn'),
    updateOrderCancel = require('./routes/purchase_items/updateOrderCancel'),
    generatePDF = require('./routes/app/generatePDF'),
    listCountries = require('./routes/pricing/listCountries'),
    listLogoPricing = require('./routes/pricing/listLogoPricing'),
    listCardPricing = require('./routes/pricing/listCardPricing'),
    countryPricing = require('./routes/pricing/countryPricing'),
    logoPricing = require('./routes/pricing/logoPricing'),
    cardPricing = require('./routes/pricing/cardPricing'),
    listShippingInfo = require('./routes/shipping/listShippingInfo'),
    updateShipping = require('./routes/shipping/updateShipping'),
    purchasedCards = require('./routes/reports/purchasedCards'),
    purchasedLogos = require('./routes/reports/listPurchasedLogos'),
    updateLogoVisibilityStatus = require('./routes/logo_master/updateLogoVisibilityStatus'),
    downloadedLogos = require('./routes/reports/downloadedLogos'),
    getCountryList = require('./routes/app/getCountryList'),
    updatePricing = require('./routes/pricing/updatePricing'),
    getTransactions = require('./routes/pricing/getTransactions'),
    purchasedItems = require('./routes/reports/purchasedItems'),
    listKeywords = require("./routes/keyword_master/listKeywords"),
    otherProducts = require("./routes/other_products_master/listOtherProducts"),
    listOtherProductsPricing = require("./routes/other_product_pricing_master/listOtherProductsPricing"),
    addOtherProductsPricing = require("./routes/other_product_pricing_master/addOtherProductsPricing"),
    removeOtherProductsPricing = require("./routes/other_product_pricing_master/removeOtherProductsPricing"),
    updateOtherProductsPricing = require("./routes/other_product_pricing_master/updateOtherProductsPricing"),
    addOtherProduct = require("./routes/other_products_master/addOtherProduct"),
    removeOtherProduct = require("./routes/other_products_master/removeOtherProduct"),
    getOtherProductDetails = require("./routes/other_products_master/getOtherProductDetails"),
    getOtherProductImage = require("./routes/other_products_master/getOtherProductImage"),
    updateOtherProduct = require("./routes/other_products_master/updateOtherProduct"),
    addDesign = require("./routes/other_product_designs_master/addDesign"),
    removeDesign = require("./routes/other_product_designs_master/removeDesign"),
    getOtherProductDesignImage = require("./routes/other_product_designs_master/getOtherProductDesignImage"),
    getTemplatesList = require("./routes/email/getTemplatesList"),
    getTemplate = require("./routes/email/getTemplate"),
    addTemplate = require("./routes/email/addTemplate"),
    updateTemplate = require("./routes/email/updateTemplate"),
    changeOrder = require('./routes/other_product_settings/changeOrder'),
    addOtherProductSetting = require('./routes/other_product_settings/addOtherProductSetting'),
    getOtherProductSettingsValues = require('./routes/other_product_settings/getOtherProductSettingsValues'),
    deleteOtherProductSettingValues = require('./routes/other_product_settings/deleteOtherProductSettingValues'),
    deleteOtherProductSettings = require('./routes/other_product_settings/deleteOtherProductSettings'),
    updateOtherProductSettingValue = require('./routes/other_product_settings/updateOtherProductSettingValue'),
    getOtherProductSettings = require('./routes/other_product_settings/getOtherProductSettings'),
    updateOtherProductSettings = require('./routes/other_product_settings/updateOtherProductSettings'),
    addOtherProductSettingValue = require('./routes/other_product_settings/addOtherProductSettingValue'),
    listPurchasedOtherProducts = require('./routes/purchase_items/listPurchasedOtherProducts');
    listPurchasedOtherCustomProducts = require('./routes/purchase_items/listPurchasedOtherCustomProducts');
    listNewsletterUsers = require('./routes/user/listNewsletterUsers');
    getMyOtherProductImage = require('./routes/other_products_master/getMyOtherProductImage')
    listCashoutRequest = require('./routes/purchase_items/listCashoutItems'),
    getorderReturns = require('./routes/purchase_items/getorderReturns'),
    getVendors = require('./routes/vendors/listVendors'),
    removeVendor = require('./routes/vendors/removeVendor'),
    updateShipment = require('./routes/shipping/updateShipment'),
    getorderCancel = require('./routes/purchase_items/getorderCancel');
    


global.appRoot = path.resolve(__dirname);

readSettingsFile();

var transports = [];

if (config.DEVELOPMENT_VERSION) {
    transports.push(new(winston.transports.Console)());
} else {
    transports.push(new(winston.transports.File)({
        filename: "admin.winston.log",
        timestamp: 'true',
        maxsize: 1 * 1024 * 1024 * 1024,
    }));
}

global.logger = new(winston.Logger)({
    transports: transports
});

process.on('uncaughtException', function(err) {
    var stack = err.stack;
    //logger.error(stack);
    logger.error("uncaughtException: " + stack);
});

cron.schedule('59 1 * * *', function() {
    updateShipment.index();
});

cron.schedule('59 2 * * *', function() {
    updateShipment.updateShipments();
});

/*cron.schedule('* * * * *',function(){
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT JSON_OBJECT('username',username,'password',password) AS users FROM vendors WHERE username != ''",
                params: []
            };
        }).success(function(rows){
            users = {};
            if(rows.length > 0){
                console.log(rows);
              //  rows.forEach(element => {
               //     users[element["username"]] = users[element["password"]]
              //  });
            }
        }).execute();
})*/
global.emailTemplatesDir = path.resolve(__dirname, 'email');
global.sendMail = function(template_name, template_options, mail_options, successCallback, errCallback) {
    emailTemplates(emailTemplatesDir, function(err, template) {
        console.log("After email template",err)
        console.log("finally here2")
       // console.log("After email template",template)
        if (successCallback == undefined) {
            successCallback = function() {};
        }
        if (errCallback == undefined) {
            errCallback = function(err) {};
        }
        if (err) {
            logger.error(err);
            errCallback("Error getting email templates.");
        } else {
            console.log("template",template);
            template(template_name, template_options, function(err, html, text) {
                console.log("Error",err,html,text)
                if (err) {
                    console.log("Error",err);
                    logger.error(err);
                    errCallback("Error rendering email templates");
                } else {
                    console.log("HTML :",html);
                    console.log("Text :",text);
                    var mailOptions = {
                        html: html,
                        text: text
                    }; 
                    var mailOptions = extend({}, {
                        subject: 'Mail from Tagbit', 
                        html: html,
                        text: text,  
                        bcc: global.config.emailConfig_tagbit.auth.user,
                        replyTo: global.config.emailConfig_tagbit.auth.user
                    }, mail_options); 
                    /* Sparkmail doesn't allow setting custom from */
                    mailOptions.from = global.config.emailConfig_tagbit.auth.user;
                    console.log("mailOptions.from",mail_options)
                    transporter.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            console.log("---------",err);
                            console.log(mailOptions);
                            errCallback(err);
                        } else {
                            console.log("Info: ",info)
                            successCallback();
                        }
                    });
                }
            });
        }
    });
};

global.dbPool = genericPool.Pool({
    name: 'mysql',
    create: function(callback) {
        var c = mysql.createConnection({
            host: global.config.db.DB_HOST,
            user: global.config.db.DB_USER,
            password: global.config.db.DB_PASSWORD,
            database: global.config.db.DB_NAME,
            timezone: "+0000"
        });
        c.connect();
        callback(null, c);
    },
    destroy: function(client) {
        client.end();
    },
    max: global.config.db.MAX_DB_CONNECTIONS,
    min: 2,
    idleTimeoutMillis: 30000,
    log: false
});
global.easydb = require('./lib/easydb');
 
fs.watch("./config.json", function(event, filename) {
    if (event == 'change') {
        readSettingsFile();
    }
}); 
global.sendForbidden = function(req, res) {
    res.status(401).render('error', {
        message: "Access Denied",
        error: {
            stack: "Please Login before using this feature.",
            status: 401
        },
        title: "Error - Unauthorized",
        i18n: req.i18n
    });
};
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());

//app.use(httpLogger('dev'));
app.use(bodyParser({
    limit: '50mb'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    key: global.config.SESSION_KEY,
    secret: global.config.SESSION_SECRET,
    cookie: {
        httpOnly: false,
        maxAge: null,
        path: '/'
    }
}));
app.use(function(req, res, next) {
    console.log("Req.session : ",req.session);
    res.setHeader("Cache-Control", "max-age=3600");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Set-Cookie, Cookie");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();    
});


I18n.expressBind(app, {
    // setup some locales - other locales default to en silently
    locales: ['en', 'ml'],
    extension: ".json"
});
app.use(function(req, res, next) {
    req.i18n.setLocaleFromCookie();
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.basicAuth(global.config.APP_USERNAME, global.config.APP_PASSWORD));

/*app.use(basicAuth({
    users: { 'someuser': 'somepassword','someuser2': 'somepassword2' },
    challenge: true,
    realm: 'Imb4T3st4pp',
}))*/

app.use(app.router);
app.get('/', pages.middleware,pages.index);
app.get('/logo/listLogos', pages.middleware,pages.listLogo);
app.get('/logo/logoParams',pages.middleware, pages.logoParams);
app.get('/logo/purchasedLogos',pages.middleware, pages.purchasedLogos);
app.get('/card/listCards', pages.middleware,pages.listCard);
app.get('/card/cardParams', pages.middleware,pages.cardParams);
app.get('/category/listCategories',pages.middleware, pages.listCategory);
app.get('/admin/viewCardOrders',pages.middleware, pages.viewCardOrders);
app.get('/admin/viewOtherOrders',pages.middleware, pages.viewOtherOrders);
app.get('/admin/pricingAdmin', pages.middleware,pages.pricingAdmin);
app.get('/admin/shippingAdmin',pages.middleware, pages.shippingAdmin);
app.get('/admin/transactions',pages.middleware, pages.transactions);
app.get('/admin/reports',pages.middleware, pages.reports);
app.get('/admin/new-reports',pages.middleware, pages.new_reports);
app.get('/admin/invoice',pages.middleware, pages.invoice);
app.get('/other-products/list',pages.middleware, pages.otherProducts);
app.get("/other-products/add", pages.middleware,pages.addOtherProducts);
app.get('/users', pages.middleware,pages.users);
app.get('/emailer', pages.middleware,pages.emailer);
app.get('/composer',pages.middleware, pages.composer);
app.get('/admin/viewOtherCustomOrders',pages.middleware, pages.viewOtherCustomOrders);
app.get('/admin/viewCashoutRequest', pages.middleware,pages.viewCashoutRequest);
app.get('/admin/orderReturns', pages.middleware,pages.orderReturns);
app.get('/admin/orderCancel', pages.middleware,pages.orderCancel);
app.get('/login' ,pages.checklogin, pages.login)

//app.get('/editor', pages.editor);


app.get("*", function(req, res, next) {
    res.setHeader("Cache-Control", "private, max-age=0, no-cache");
    res.setHeader("Expires", 0);
    next();
});

app.get('/generatePDF', generatePDF.index);
app.get('/getLogoImage', getLogoImage.index);
app.get('/getCardImage', getCardImage.index);
app.get('/getUserLogoImage', getUserLogoImage.index);
app.get('/getUserCardImage', getUserCardImage.index);
app.get('/getUserOtherProductImage', getUserOtherProductImage.index);
app.get("/getMyOtherProductImage", getMyOtherProductImage.index);
app.get('/listUsers', listUsers.index);
app.get('/listNlUsers', listNewsletterUsers.index);
app.get('/getMoreUserDetails', getMoreUserDetails.index);
app.get("/getOtherProductDesignImage", getOtherProductDesignImage.index);
app.get('/getTemplatesList', getTemplatesList.index);
app.get('/getTemplate', getTemplate.index);
app.get('/getUserOtherProductSettingValues', getUserOtherProductSettingValues.index);
app.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.send(200, "Logged Out");
    });
});
app.get('/getOtherProductSettings', getOtherProductSettings.index);
app.get('/getOtherProductSettingsValues', getOtherProductSettingsValues.index);
app.get("/getOtherProductImage", getOtherProductImage.index);
app.get("/listPurchasedOtherProducts", listPurchasedOtherProducts.index);
app.get("/listPurchasedOtherCustomProducts", listPurchasedOtherCustomProducts.index);
app.get("/listCashoutRequest", listCashoutRequest.index);
app.get('/vendors/listvendors',pages.listVendors);
app.get('/getvendors',getVendors.index);


app.post('/listCarts', listCarts.index);
app.post('/updateImage', updateImage.index);
app.post('/addCard', addCard.index);
app.post('/getCardDetails', getCardDetails.index);
app.post('/listCards', listCards.index);
app.post('/removeCard', removeCard.index);
app.post('/updateCard', updateCard.index);
app.post('/addCategory', addCategory.index);
app.post('/getCategoryDetails', getCategoryDetails.index);
app.post('/listCategories', listCategories.index);
app.post('/removeCategory', removeCategory.index);
app.post('/updateCategory', updateCategory.index);
app.post('/addLogo', addLogo.index);
app.post('/getLogoDetails', getLogoDetails.index);
app.post('/listLogos', listLogos.index);
app.post('/listPurchasedLogos', listPurchasedLogos.index);
app.post('/updateLogoVisibilityStatus', updateLogoVisibilityStatus.index);
app.post('/removeLogo', removeLogo.index);
app.post('/updateLogo', updateLogo.index);
app.post('/listPurchasedCards', listPurchasedCards.index);
app.post('/updatePurchaseItem', updatePurchaseItem.index);
app.post('/updateOrderReturn', updateOrderReturn.index);
app.post('/updateOrderCancel', updateOrderCancel.index);
app.post('/listCountries', listCountries.index);
app.post('/listLogoPricing', listLogoPricing.index);
app.post('/listCardPricing', listCardPricing.index);
app.post('/addCountry', countryPricing.addCountry);
app.post('/updateCountry', countryPricing.updateCountry);
app.post('/deleteCountry', countryPricing.deleteCountry);
app.post('/addLogoPrice', logoPricing.addLogoPrice);
app.post('/updateLogoPrice', logoPricing.updateLogoPrice);
app.post('/deleteLogoPrice', logoPricing.deleteLogoPrice);
app.post('/addCardPrice', cardPricing.addCardPrice);
app.post('/updateCardPrice', cardPricing.updateCardPrice);
app.post('/deleteCardPrice', cardPricing.deleteCardPrice);
app.post('/listShippingInfo', listShippingInfo.index);
app.post('/updateShipping', updateShipping.index);
app.post('/purchasedCards', purchasedCards.index);
app.post('/purchasedLogos', purchasedLogos.index);
app.post('/downloadedLogos', downloadedLogos.index);
app.post('/getTransactions', getTransactions.index);
app.post('/getCountryList', getCountryList.index);
app.post('/updatePricing', updatePricing.index);
app.post('/purchasedItems', purchasedItems.index);
app.post('/getAllCategories', getCategoryDetails.getAllCategories);
app.post('/getCategoryDetailsWithKeywords', getCategoryDetails.getCategoryDetailsWithKeywords);
app.post('/listKeywords', listKeywords.index);

app.post("/addOtherProduct", addOtherProduct.index);
app.post("/removeOtherProduct", removeOtherProduct.index);
app.post("/getOtherProductDetails", getOtherProductDetails.index);
app.post("/updateOtherProduct", updateOtherProduct.index);
app.post("/listOtherProducts", otherProducts.index);
app.post("/listOtherProductsPricing", listOtherProductsPricing.index);
app.post("/addOtherProductsPricing", addOtherProductsPricing.index);
app.post("/removeOtherProductsPricing", removeOtherProductsPricing.index);
app.post("/updateOtherProductsPricing", updateOtherProductsPricing.index);

app.post("/addDesign", addDesign.index);
app.post("/removeDesign", removeDesign.index);

app.post('/addTemplate', addTemplate.index);
app.post('/updateTemplate', updateTemplate.index); 

app.post('/changeOrder', changeOrder.index);

app.post('/addOtherProductSetting', addOtherProductSetting.index);

app.post('/deleteOtherProductSettingValues', deleteOtherProductSettingValues.index);
app.post('/deleteOtherProductSettings', deleteOtherProductSettings.index);
app.post('/updateOtherProductSettingValue', updateOtherProductSettingValue.index);
app.post('/updateOtherProductSettings', updateOtherProductSettings.index);
app.post('/addOtherProductSettingValue', addOtherProductSettingValue.index);
app.post('/updateCashoutRequest', listCashoutRequest.updateCashoutRequest);
app.post('/getprocatsubcat',pages.getprocatsubcat);
app.post('/addVendor',pages.addVendor);
app.post('/removeVendor',removeVendor.index);
app.post('/adminlogin' , pages.adminlogin)


var server = app.listen(global.config.APP_PORT, function() {
    console.log('Express server listening on port ' + server.address().port);
});
app.post('/getorderReturns', getorderReturns.index);
app.post('/getorderCancel',getorderCancel.index);

function readSettingsFile() {
    var settingsFile = JSON.parse(fs.readFileSync("./config.json"));
    global.config = extend({}, global.config, settingsFile);
    /*
    settingsFile.emailConfig_tagbit.auth.pass = decrypt(settingsFile.emailConfig_tagbit.auth.pass);
    global.transporter = nodemailer.createTransport(settingsFile.emailConfig_tagbit);
    */
    console.log("smtpPool(global.config.emailConfig_tagbit)",smtpPool(global.config.emailConfig_tagbit))
    global.transporter = nodemailer.createTransport(smtpPool(global.config.emailConfig_tagbit)); 
   // global.transporter = nodemailer.createTransport(smtpPool(global.config.emailConfig_sparkPost)); 
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, config.PASSWORD)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
};

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