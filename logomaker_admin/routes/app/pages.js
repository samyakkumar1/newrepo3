var md5 = require('md5');
const easydb = require('../../lib/easydb');

/* GET home page. */
exports.index = function (req, res, next) {
    res.render('viewOrderNew', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.otherProducts = function (req, res, next) {
    res.render('listOtherProducts', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.users = function (req, res, next) {
    res.render('users', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.addOtherProducts = function (req, res, next) {
    res.render('addOtherProducts', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.listLogo = function (req, res, next) {
    res.render('listLogos', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.listCard = function (req, res, next) {
    res.render('listCards', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.listCategory = function (req, res, next) {
    res.render('listCategories', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.logoParams = function (req, res, next) {
    res.render('logoParams', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.purchasedLogos = function (req, res, next) {
    res.render('purchasedLogos', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.cardParams = function (req, res, next) {
    res.render('cardParams', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.viewCardOrders = function (req, res, next) {
    res.render('viewOrdersCards', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.viewOtherOrders = function (req, res, next) {
    res.render('viewOrdersOtherProducts', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};
exports.viewOtherCustomOrders = function (req, res, next) {
    res.render('viewOrdersOtherCustomProducts', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.pricingAdmin = function (req, res, next) {
    res.render('pricingAdmin', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.shippingAdmin = function (req, res, next) {
    res.render('shippingAdmin', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.reports = function (req, res, next) {
    res.render('reports', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.transactions = function (req, res, next) {
    res.render('transactions', { title: req.i18n.__("Tagbit Admin Console"), hostName: config.REAL_APP_DOMAIN, i18n: req.i18n});
};

exports.new_reports = function (req, res, next) {
    res.render('viewOrderNew', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.invoice = function (req, res, next) {
    res.render('invoice', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.emailer = function (req, res, next) {
    res.render('emailer', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.composer = function (req, res, next) {
    res.render('composer', { title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};

exports.editor = function (req, res, next) {
    res.render('editor', {
        url: req.query.url
    });
};
exports.viewCashoutRequest = function (req, res, next) {
    res.render('viewCashoutRequest', { hostName: config.REAL_APP_DOMAIN, title: req.i18n.__("Tagbit Admin Console"), i18n: req.i18n});
};
exports.orderReturns = function (req, res, next) {
    res.render('orderReturns', { title: req.i18n.__("Tagbit Admin Console"), hostName: config.REAL_APP_DOMAIN, i18n: req.i18n});
};
exports.orderCancel = function (req, res, next) {
    res.render('orderCancel', { title: req.i18n.__("Tagbit Admin Console"), hostName: config.REAL_APP_DOMAIN, i18n: req.i18n});
};

exports.getprocatsubcat = function(req,res,next){
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT op.*,opi.color,opi.id As image_id FROM other_products AS op INNER JOIN other_products_images AS opi ON op.id = opi.other_product_id WHERE 1",
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                var obj = {};
                for(var i = 0; i <rows.length;i++){
                    if(!obj[rows[i]["name"]]){
                        obj[rows[i]["name"]] = [];
                        obj[rows[i]["name"]].push(rows[i]);
                    }else{
                        obj[rows[i]["name"]].push(rows[i]);
                    }
                }
                res.send({items: obj, status: 200});
            } else {
                res.send({msg: "No items found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};

exports.addVendor = function(req,res,next){
         var capacity = req.body.capacity;
         var address = req.body.address;
         var address2 = req.body.address2;
         var city = req.body.city;
         var state = req.body.state;
         var tech= req.body.tech;
         var gstin= req.body.gstin;
         var companyname= req.body.companyname;
         var pincode= req.body.pincode;
         var contactname= req.body.contactname;
         var email = req.body.email;
         var password = req.body.password;
         var username = req.body.username;
         var status = req.body.status;
         var products = req.body.products.toString();
         var phone = req.body.phone;
         console.log(req.body);
         if(!capacity || !address || !city || !state || !tech || !gstin || !companyname || !pincode || !contactname || !email || !username || !password || !products || !status){
            res.send({msg: "Please fill all required fields", status: 201});
         }else{
            easydb(dbPool)
            .query(function(){
                return {
                    query:"select * from vendors where email = ?",
                    params:[email]
                }
            }).success(function(rows){
                if(rows.length > 0 ){
                    res.send({msg: "User already exist", status: 201});
                }else{
                    easydb(dbPool).query(function () {
                        return {
                            query: "INSERT INTO vendors (companyname,contactname,gstin,status,tech,capacity,products,address,address2,city,state,pincode,email,username,password,phone) Values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            params: [companyname,contactname,gstin,status,tech,capacity,products,address,address2,city,state,pincode,email,username,password,phone]
                        };
                    })
                    .success(function (rows) {
                        res.send({status: 200});
                    })
                    .error(function (err) {
                        logger.error(err);
                        res.send({msg: err.message, status: 500});
                    }).execute();
                }
            }).execute();
         }
         
         
}
exports.listVendors = function(req,res,next){
    res.render('listVendors', { title: req.i18n.__("Tagbit Admin Console"), hostName: config.REAL_APP_DOMAIN, i18n: req.i18n});
}
exports.middleware = function(req,res,next){
    if(req.session && req.session.user){
        next();
    }else{
        res.render('login', { title: req.i18n.__("Tagbit Admin Console"), hostName: config.REAL_APP_DOMAIN, i18n: req.i18n});
    }
}
exports.login = function(req,res,next){
    res.render('login', { title: req.i18n.__("Tagbit Admin Console"), hostName: config.REAL_APP_DOMAIN, i18n: req.i18n});
}
exports.adminlogin = function(req,res,next){
    var email = req.body.email;
    var password = req.body.password;
    console.log(req.body);
    console.log(global.config.APP_USERNAME);
    console.log(global.config.APP_PASSWORD)
    if(email == global.config.APP_USERNAME && password ==global.config.APP_PASSWORD){
        req.session.user = {};
        req.session.user.role = 'ADMIN';
        res.send({status:200,data:"Success"});
    }else{
        console.log("Else")
        password = md5(password);
        console.log("password ",password)
        easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM vendors WHERE email = ? AND password = ? AND status = 'active'",
                params: [email,password]
            };
        }).success(function(rows){
            console.log("Rows : ",rows);
            if(rows.length > 0){
               req.session.user = {};
               req.session.user.role = 'VENDOR';
               req.session.user.products = rows[0]['products'];
               res.send({status:200,data:"Success"});
            }else{
                res.send({status:500,data:"Wrong credentials"});
            }
        }).error(function(err){
            console.log("Error ",err);
            res.send({status:500,data:"Something went worong"})
        }).execute();
    }
}

exports.checklogin = function(req,res,next){
    if(req.session.user){
        res.redirect("/")
    }else{
        next();
    }
}
