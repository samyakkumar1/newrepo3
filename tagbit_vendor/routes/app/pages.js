/* GET home page. */
exports.index = function (req, res, next) {
    res.render('viewOrderNew', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.otherProducts = function (req, res, next) {
    res.render('listOtherProducts', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.users = function (req, res, next) {
    res.render('users', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.addOtherProducts = function (req, res, next) {
    res.render('addOtherProducts', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.listLogo = function (req, res, next) {
    res.render('listLogos', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.listCard = function (req, res, next) {
    res.render('listCards', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.listCategory = function (req, res, next) {
    res.render('listCategories', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.logoParams = function (req, res, next) {
    res.render('logoParams', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.purchasedLogos = function (req, res, next) {
    res.render('purchasedLogos', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.cardParams = function (req, res, next) {
    res.render('cardParams', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.viewCardOrders = function (req, res, next) {
    res.render('viewOrdersCards', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.viewOtherOrders = function (req, res, next) {
    res.render('viewOrdersOtherProducts', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.pricingAdmin = function (req, res, next) {
    res.render('pricingAdmin', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.shippingAdmin = function (req, res, next) {
    res.render('shippingAdmin', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.reports = function (req, res, next) {
    res.render('reports', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.transactions = function (req, res, next) {
    res.render('transactions', { title: req.i18n.__("Tagbit Vendor Console"), hostName: config.REAL_APP_DOMAIN, i18n: req.i18n});
};

exports.new_reports = function (req, res, next) {
    res.render('viewOrderNew', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.invoice = function (req, res, next) {
    res.render('invoice', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.emailer = function (req, res, next) {
    res.render('emailer', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.composer = function (req, res, next) {
    res.render('composer', { title: req.i18n.__("Tagbit Vendor Console"), i18n: req.i18n});
};

exports.editor = function (req, res, next) {
    res.render('editor', {
        url: req.query.url
    });
};