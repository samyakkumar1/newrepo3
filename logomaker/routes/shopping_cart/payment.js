/**
 * Created by Harikrishnan on 09-01-2015.
 */
var geoip = require('geoip-lite'),
        querystring = require('querystring'),
        https = require('https'),
        fs = require('fs'),
        stripe = require("stripe")(config.stripeCheckoutConfig.secretKey);

var paypal;
var checksum_lib = require('../../lib/checksum/checksum2')
exports.init = function () {
    paypal = require('paypal-express-checkout').init(
            config.paypalExpressConfig.username,
            config.paypalExpressConfig.password,
            config.paypalExpressConfig.signature,
            config.APP_DOMAIN + "/execute",
            config.APP_DOMAIN + "/cancel",
            true //config.DEVELOPMENT_VERSION == undefined ? false : config.DEVELOPMENT_VERSION
            );
};

exports.index = function (req, res) {
    if (req.user || req.body.userid) {
        if(req.body.userid){
            req.user = {};
            req.user.id = req.body.userid;
            req.user.email = req.body.email;
            req.user.login = false;
        }else{
            req.user.login = true;
        }
        calculatePrice(req.user.login,req.user.id, req.body.country, function (err, price, currency) {
            if (err) {
                res.send(err);
            } else {
                console.log("parseInt(config.SHIPPING_CHARGE);",parseInt(config.SHIPPING_CHARGE));
                console.log("Price",parseFloat(price))
                var price = parseFloat(price)+parseInt(config.SHIPPING_CHARGE); // +40 Added by Rohit for temporary checking
                console.log(price)
                easydb(dbPool)
                        .query(function () {
                            return {
                                query: "UPDATE shopping_carts SET price = ?, currency = ? WHERE user_id = ? AND status = 'PENDING'",
                                params: [price, currency, req.user.id]
                            };
                        })
                        .success(function () {
                            price=req.body.amt;
                            currency = req.body.currency;
                            if (price != req.body.amt || currency != req.body.currency) {
                                console.log("Price",price," amt: ",req.body.amt);
                                console.log("currency",currency,"  req.body.currency: ", req.body.currency);
                                logger.error("The amount or currency is defferenct from request!!");
                                logger.error("Actual: " + req.body.amt + " " + req.body.currency);
                                logger.error("Calculated: " + price + " " + currency);
                                logger.error("Requested From: " + req.connection.remoteAddress);
                                res.send({status: 500, from: req.connection.remoteAddress, msg: "The amount or currency is defferenct from request!!<br/>Actual: " + req.body.amt + " " + req.body.currency + "<br/>" + "Calculated: " + price + " " + currency});
                            } else {
                                switch (req.body.paymentType) {
                                    case "paypal":
                                    {
                                        paypal.pay(req.user.id + "WITH" + new Date().getTime(), price, 'Tagbit', currency, function (err, url) {
                                            if (err) {
                                                logger.error(err);
                                                updateTransactionStatus(req.user.id, "Paypal", "No Order/Txn ID", "Failure", err.message);
                                                res.status(500).render('txn_error', {
                                                    error: "Error in payment: Paypal Error (" + err.message + ")",
                                                    title: "Error - Transaction failed",
                                                    i18n: req.i18n,
                                                    geoip: geoip.lookup(global.formatIp(req)),
                                                    refiral_key: config.REFIRAL_KEY,
                                                    base: config.APP_DOMAIN,
                                                    user: req.user,
                                                    options: config.renderOptions
                                                });
                                            } else {
                                                res.redirect(url);
                                            }
                                        });
                                        break;
                                    }
                                    case "creditCard":
                                    {
                                        res.send({status: 500, message: "Sorry, We do not support it yet."});
                                        /*
                                         var stripeToken = req.body.stripeToken;
                                         var charge = stripe.charges.create({
                                         amount: getAmountInSmallestUnit(parseFloat(price), currency),
                                         currency: currency,
                                         source: stripeToken,
                                         description: "Tagbit.com Payment"
                                         }, function (err, charge) {
                                         if (err) {
                                         res.send({status: 500, msg: err.message});
                                         updateTransactionStatus(req.user.id, "Stripe", "None (Token: " + stripeToken + ")", "Failure", JSON.stringify(err));
                                         } else {
                                         updateTransactionStatus(req.user.id, "Stripe", charge.id, "Success", JSON.stringify(charge));
                                         doPaymentSuccessfulActions(req.user.id, req.user.email, function (err) {
                                         if (err) {
                                         res.send({status: 500, msg: "Payment successful. But an error is occurred during database update."});
                                         } else {
                                         res.send({status: 200, cartId: cartId});
                                         }
                                         }, "Stripe", charge.amount, charge.currency, charge.created, charge.id, req.user.first_name);
                                         }
                                         });
                                         */
                                        break;
                                    }
                                    case "paytm":
                                    {
                                        console.log("paytm");
                                        paytm_payment(req.user, price, 'Tagbit', currency, res, function (err) {
                                            if (err != undefined) {
                                                res.send({status: 500, msg: "Error: Can't do payment."});
                                                updateTransactionStatus(req.user.id, "Paytm", "No Order/Txn ID", "Failure", JSON.stringify(err));
                                            }
                                        });
                                        break;
                                    }
                                }
                            }
                        })
                        .error(function (err) {
                            logger.error(err);
                            res.send({msg: err.message, status: 500});
                        }).execute();
            }
        });
    } else {
        res.send(403);
    }
};




function calculatePrice(islogin,userId, country, callback) {

    if(islogin == true){
        getCartItems(userId, function (err, items) {
            if (err) {
                callback(err);
            } else {
                var price = 0;
                var currency = undefined;
                var idx = 0;
                items.forEach(function (val) {
                    getPriceForItem(country, val.item_type, val.item_id, function (result) {
                        if (result.status == 200 || result.status == 201) {
                            if (val.item_type == "BC") {
                                result.price -= ((config.FLAT_DISCOUNT_CARD / 100) * result.price);
                            } else if (val.item_type == "LOGO") {
                                result.price -= ((config.FLAT_DISCOUNT_LOGO / 100) * result.price);
                            } else if (val.item_type == "CUSTOM") {
                                result.price = result.price;
                            }else {
                                result.price -= ((config.FLAT_DISCOUNT_OTHER / 100) * result.price);
                            }
                            price += parseFloat(result.price);
                            if (!currency) {
                                currency = result.currency;
                            }
                            if (idx == items.length - 1) {
                                price = Number(price).toFixed(2);
                                callback(undefined, price, currency);
                            }
                        } else {
                            calculatePrice(result);
                        }
                        idx++;
                    })
                });
            }
        });
    }else{
        easydb(dbPool)
            .query(function () {
                return {
                    query: "select * from user_other_products_custom where user_id = ? AND is_login = 0",
                    params: [userId]
                };
            }).success(function(rows){
                var price = 0;
                if(rows.length > 0){
                    rows.forEach(function(item){
                        if(item.coupan_applied == 1){
                            price = price + parseInt(item.new_price)
                        }else{
                            price = price + parseInt(item.price)
                        }
                    })
                    callback(undefined,price,"INR");
                }else{
                    callback(true,"Somethting went wrong.Please try again latter");
                }
                
            }).execute();

    }
}

exports.execute = function (req, res) {
    var token = req.param('token');
    var payerId = req.param('PayerID');
    var errFn = function (data, uid) {
        res.status(500).render('txn_error', {
            error: "Error in payment: " + (data.PAYMENTSTATUS || data.ACK) + " (due to " + (data.PENDINGREASON || data.L_LONGMESSAGE0) + ", Code: " + (data.REASONCODE || data.L_ERRORCODE0) + ")",
            title: "Error - Transaction failed",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        });
        updateTransactionStatus(uid ? uid : req.user.id, "Paypal", data.TRANSACTIONID == undefined ? "None" : data.TRANSACTIONID, "Failure", JSON.stringify(data));
    }
    try {
        paypal.detail(token, payerId, function (err, data, invoiceNumber, price) {
            var userId;
            if (invoiceNumber.split("WITH").length > 0) {
                userId = invoiceNumber.split("WITH")[0];
                userId = userId || req.user.id;
            } else {
                userId = req.user.id;
            }
            if (err) {
                logger.error(err);
                res.status(500).render('txn_error', {
                    error: "Error in payment: Paypal detail failed",
                    title: "Error - Transaction failed",
                    i18n: req.i18n,
                    geoip: geoip.lookup(global.formatIp(req)),
                    refiral_key: config.REFIRAL_KEY,
                    base: config.APP_DOMAIN,
                    user: req.user,
                    options: config.renderOptions
                });
                updateTransactionStatus(userId, "Paypal", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, req.body.RESPCODE == 141 ? "Cancel" : "Failure", JSON.stringify(req.body));
            } else {
                var doSuccessActions = function () {
                    doPaymentSuccessfulActions(userId, req.user.email, function (err, cartId) {
                        if (err == undefined) {
                            res.redirect("/thank-you-for-buying-from-us?cartId=" + cartId);
                        } else {
                            res.status(500).render('error', {
                                message: "Error in database update",
                                error: err,
                                title: "Error",
                                i18n: req.i18n,
                                geoip: geoip.lookup(global.formatIp(req)),
                                refiral_key: config.REFIRAL_KEY,
                                base: config.APP_DOMAIN,
                                user: req.user,
                                options: config.renderOptions
                            });
                        }
                    }, "PAYPAL", parseFloat(data.TAXAMT) + parseFloat(data.AMT), data.CURRENCYCODE, data.TIMESTAMP, data.TRANSACTIONID, req.user.first_name);
                    updateTransactionStatus(userId, "Paypal", data.TRANSACTIONID == undefined ? "None (Token: " + data.TOKEN + ")" : data.TRANSACTIONID, "Success", JSON.stringify(data));
                };
                switch (data.PAYMENTSTATUS) {
                    case "Pending":
                    {
                        if (data.PENDINGREASON == "multicurrency") {
                            doSuccessActions();
                            sendMail("payment_pending", {}, {to: config.emailConfig.auth.user, subject: "Please check Paypal for PENDING transactions."});
                        } else {
                            errFn(data, userId);
                        }
                        break;
                    }
                    case "Created":
                    case "Completed":
                    case "Processed":
                    {
                        doSuccessActions();
                        break;
                    }
                    default:
                    {
                        errFn(data, userId);
                        break;
                    }
                }
            }
        });
    } catch (err) {
        logger.error(err);
        res.status(500).render('txn_error', {
            error: "Error in payment: Paypal detail failed due to invalid request",
            title: "Error - Transaction failed",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        });
        updateTransactionStatus(req.user ? req.user.id : undefined, "Paypal", "None", "Failure", err.message);
    }
};

exports.paytmResp = function (req, res, next) {
        checkOrderExistence(req.body.ORDERID,function(err,user){
            console.log("Req.body: ",req.body);
            console.log(user)
            if(req.body.MERC_UNQ_REF){
                if(err){
                    console.log(err)
                    res.send(403);
                }else{
                    req.user = user
                    if (checksum_lib.verifychecksum(req.body,config.payTmConfig.Merchant_Key,req.body.CHECKSUMHASH)) {
                        if (req.body.STATUS != "TXN_SUCCESS") {
                            console.log("Req.user12:",req.user.id, req.user.email);
                            res.status(500).render('txn_error', {
                                error: req.body.RESPMSG,
                                title: "Error - Transaction failed",
                                i18n: req.i18n,
                                geoip: geoip.lookup(global.formatIp(req)),
                                refiral_key: config.REFIRAL_KEY,
                                base: config.APP_DOMAIN,
                                user: req.user,
                                options: config.renderOptions
                            });
                            updateTransactionStatus(req.user.id, "Paytm", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, req.body.RESPCODE == 141 ? "Cancel" : "Failure", JSON.stringify(req.body));
                            deleteShopingDetails(req.user.id);
                        } else {
                            console.log("Req.user",req.user.id, req.user.email);
                            doPaymentSuccessfulActionsWithoutlogin(req.user.id, req.user.email, function (err, cartId) {
                                if (err == undefined) {
                                    res.redirect("/thank-you-for-buying-from-us?cartId=" + cartId);
                                    updateShopingDetails(req.user.id);
                                } else {
                                    deleteShopingDetails(req.user.id);
                                    res.status(500).render('error', {
                                        message: "Error in database update",
                                        error: err,
                                        title: "Error",
                                        i18n: req.i18n,
                                        geoip: geoip.lookup(global.formatIp(req)),
                                        refiral_key: config.REFIRAL_KEY,
                                        base: config.APP_DOMAIN,
                                        user: req.user,
                                        options: config.renderOptions
                                    });
                                }
                            }, "PAYTM", req.body.TXNAMOUNT, "INR", req.body.TXNDATE, req.body.TXNID, req.user.first_name);
                            updateTransactionStatus(req.user.id, "Paytm", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, "Success", JSON.stringify(req.body));
                        }
                    } else {
                        res.status(500).render('txn_error', {
                            error: "Error in payment: Checksum verification failed.",
                            title: "Error - Transaction failed",
                            i18n: req.i18n,
                            geoip: geoip.lookup(global.formatIp(req)),
                            refiral_key: config.REFIRAL_KEY,
                            base: config.APP_DOMAIN,
                            user: req.user,
                            options: config.renderOptions
                        });
                        updateTransactionStatus(req.user.id, "Paytm", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, "Failure", JSON.stringify(req.body));
                        deleteShopingDetails(req.user.id);
                    }
                }
            }else{
                if(err){
                    console.log(err)
                    res.send(403);
                }else{
                    req.user = user
                    console.log(req.user)
                    if (checksum_lib.verifychecksum(req.body,config.payTmConfig.Merchant_Key,req.body.CHECKSUMHASH)) {
                        if (req.body.STATUS != "TXN_SUCCESS") {
                            console.log("Req.user12:",req.user.id, req.user.email);
                            res.status(500).render('txn_error', {
                                error: req.body.RESPMSG,
                                title: "Error - Transaction failed",
                                i18n: req.i18n,
                                geoip: geoip.lookup(global.formatIp(req)),
                                refiral_key: config.REFIRAL_KEY,
                                base: config.APP_DOMAIN,
                                user: req.user,
                                options: config.renderOptions
                            });
                            updateTransactionStatus(req.user.id, "Paytm", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, req.body.RESPCODE == 141 ? "Cancel" : "Failure", JSON.stringify(req.body));
                        } else {
                            console.log("Req.user",req.user.id, req.user.email);
                            doPaymentSuccessfulActions(req.user.id, req.user.email, function (err, cartId) {
                                if (err == undefined) {
                                    res.redirect("/thank-you-for-buying-from-us?cartId=" + cartId);
                                } else {
                                    res.status(500).render('error', {
                                        message: "Error in database update",
                                        error: err,
                                        title: "Error",
                                        i18n: req.i18n,
                                        geoip: geoip.lookup(global.formatIp(req)),
                                        refiral_key: config.REFIRAL_KEY,
                                        base: config.APP_DOMAIN,
                                        user: req.user,
                                        options: config.renderOptions
                                    });
                                }
                            }, "PAYTM", req.body.TXNAMOUNT, "INR", req.body.TXNDATE, req.body.TXNID, req.user.first_name);
                            updateTransactionStatus(req.user.id, "Paytm", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, "Success", JSON.stringify(req.body));
                        }
                    } else {
                        res.status(500).render('txn_error', {
                            error: "Error in payment: Checksum verification failed.",
                            title: "Error - Transaction failed",
                            i18n: req.i18n,
                            geoip: geoip.lookup(global.formatIp(req)),
                            refiral_key: config.REFIRAL_KEY,
                            base: config.APP_DOMAIN,
                            user: req.user,
                            options: config.renderOptions
                        });
                        updateTransactionStatus(req.user.id, "Paytm", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, "Failure", JSON.stringify(req.body));
                    }
                }
            }
        })
};

exports.cancel = function (req, res) {
    try {
        paypal.detail(req.query.token, null, function (err, data, invoiceNumber, price) {
            if (err) {
                logger.error(err);
                res.status(500).render('txn_error', {
                    error: "Error in payment: Paypal detail failed",
                    title: "Error - Transaction failed",
                    i18n: req.i18n,
                    geoip: geoip.lookup(global.formatIp(req)),
                    refiral_key: config.REFIRAL_KEY,
                    base: config.APP_DOMAIN,
                    user: req.user,
                    options: config.renderOptions
                });
                updateTransactionStatus(req.user.id, "Paypal", req.body.TXNID == undefined ? "None (Order ID: " + req.body.ORDERID + ")" : req.body.TXNID, req.body.RESPCODE == 141 ? "Cancel" : "Failure", JSON.stringify(req.body));
            } else {
                var userId;
                if (invoiceNumber.split("WITH").length > 0) {
                    userId = invoiceNumber.split("WITH")[0];
                    userId = userId || req.user.id;
                } else {
                    userId = req.user.id;
                }
                res.render('cancel', {
                    title: req.i18n.__("Error processing payment"),
                    i18n: req.i18n,
                    geoip: geoip.lookup(global.formatIp(req)),
                    refiral_key: config.REFIRAL_KEY,
                    base: config.APP_DOMAIN,
                    user: req.user,
                    options: config.renderOptions
                });
                updateTransactionStatus(userId, "Paypal", "None", "Cancel", JSON.stringify({token: req.query.token, invoiceNumber: invoiceNumber, price: price}));
            }
        });
    } catch (err) {
        logger.error(err);
        res.status(500).render('txn_error', {
            error: "Error in payment: Paypal detail failed due to invalid request",
            title: "Error - Transaction failed",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        });
        updateTransactionStatus(req.user.id, "Paypal", "None", "Failure", err.message);
    }
};

exports.fakePaymentSuccess = function (req, res) {
    if (req.headers.referer.indexOf(config.ADMIN_APP_DOMAIN) >= 0) {
        logger.warning("Request for fake payment arrived at ", req.connection.remoteAddress + " for user(" + req.user.id + ") " + req.body.email);
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT price, currency FROM shopping_carts WHERE user_id = ? AND status = 'PENDING'",
                        //params: [req.body.userId]
                        params:[req.user.id]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0) {
                        doPaymentSuccessfulActions(req.user.id, req.body.email, function (err, cartId) {
                            if (err) {
                                logger.error(err);
                                res.send({status: 500, msg: err.message});
                            } else {
                                res.send({status: 200});
                            }
                        }, req.body.payment_type, rows[0].price, rows[0].currency, req.body.date_purchased, req.body.txn_id, req.body.name);
                    } else {
                        res.send("No shopping cart!!");
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    err_callback({msg: err.message, status: 500});
                }).execute();
    } else {
        logger.error("Fake payment call from " + req.headers.referer);
        res.status(404);
    }
};

function updateShopingDetails(id){
    var shopping_cart_id;
    easydb(dbPool)
        .query(function () {
            return {
                query: "select * from shopping_carts where user_id = ? and is_login = 0",
                params: [id]
            };
        })
        .success(function(rows){
            shopping_cart_id = rows[0]["id"]
        })
        .query(function () {
            return {
                query: "UPDATE `shopping_carts` SET `is_login` = 1 WHERE `user_id` = ? And is_login = 0",
                params: [id]
            };
        })
        .query(function () {
            return {
                query: "UPDATE `shopping_cart_items` SET `is_login` = 1 WHERE `shopping_cart_id` = ? And is_login = 0",
                params: [shopping_cart_id]
            };
        })
        .query(function () {
            return {
                query: "UPDATE `user_other_products_custom` SET `is_login` = 1 WHERE `user_id` = ? AND `is_login` = 0 ",
                params: [id]
            };
        }).execute();
    
}

function deleteShopingDetails(id){
    var shopping_cart_id;
    easydb(dbPool)
        .query(function () {
            return {
                query: "select * from shopping_carts where user_id = ? and is_login = 0",
                params: [id]
            };
        })
        .success(function(rows){
            shopping_cart_id = rows[0]["id"]
        })
        .query(function () {
            return {
                query: "delete from `shopping_cart_items` WHERE `shopping_cart_id` = ? And is_login = 0",
                params: [shopping_cart_id]
            };
        })
        .query(function () {
            return {
                query: "delete from `shopping_carts` WHERE `user_id` = ? And is_login = 0",
                params: [id]
            };
        })
        .query(function () {
            return {
                query: "delete from `user_other_products_custom` WHERE `user_id` = ? AND `is_login` = 0 ",
                params: [id]
            };
        }).execute();
    
}


function doPaymentSuccessfulActions(userId, email, callback, payment_type, price, currency, date_purchased, txn_id, name) {
    if (!name) {
        name = email.substring(0, email.indexOf("@"));
        name = name.slice(0, 1).toUpperCase() + name.substring(1);
    }
    getLatestShoppingCartId(userId, function (latestId, cartDetails) {
        var logos;
        var cards;
        var products;
        var customproducts;
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT company_name, slogan, s3_logo_url, shopping_cart_items.item_id,user_logos.base_logo_id as base_logo FROM shopping_cart_items INNER JOIN user_logos ON shopping_cart_items.item_id = user_logos.id WHERE item_type = 'LOGO' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    logos = rows;
                })
                .query(function () {
                    return {
                        query: "SELECT first_name, last_name, address_line_1, address_line_2, website, email, phone_no, qty, finish, paper_stock, back_of_card, back_side_super_premium, design_type, purchase_design, dont_print_card, shipping_type, s3_front_card_url, s3_back_card_url, shopping_cart_items.item_id FROM shopping_cart_items INNER JOIN user_cards ON shopping_cart_items.item_id = user_cards.id WHERE item_type = 'BC' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    cards = rows;
                })
                .query(function () {
                    return {
                        query: "SELECT other_products.name, user_other_products.image_url, shopping_cart_items.item_id FROM user_other_products INNER JOIN shopping_cart_items ON shopping_cart_items.item_id = user_other_products.id INNER JOIN other_products ON other_products.id = user_other_products.base_product_id WHERE item_type = 'OTHER' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    products = rows;
                })
                .query(function () {
                    return {
                        query: "SELECT other_product_details.title, other_product_details.front_image,user_other_products_custom.price, shopping_cart_items.item_id FROM user_other_products_custom INNER JOIN shopping_cart_items ON shopping_cart_items.item_id = user_other_products_custom.id INNER JOIN other_product_details ON other_product_details.id = user_other_products_custom.base_product_id WHERE item_type = 'CUSTOM' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    customproducts = rows;
                })
                .query(function () {
                    return {
                        query: "UPDATE `shopping_carts` SET `modified_at` = CURRENT_TIMESTAMP, `status` = 'PURCHASED', `payement_type`=?, `price`=?, `currency`=?, `date_purchased`=?, `txn_id`=? WHERE `user_id` = ? AND `status` = 'PENDING'",
                        params: [payment_type, price, currency, date_purchased, txn_id, userId]
                    };
                })
                .query(function () {
                    return {
                        query: "INSERT INTO `shopping_carts` (`user_id`, `created_at`, `status`, `shipping_type`) VALUES (?, CURRENT_TIMESTAMP, 'PENDING', 'FREE')",
                        params: [userId]
                    };
                })
                .success(function (rows) {
                    console.log("Hiiiiiiiiiiiiiiiiiii");
                    var files = [];
                    var queries = [];
                    var cardOptions = "";
                    var person_name = "";
                    var companies = "";
                    var cardOptionsNewFormat = "";
                    var otherProductCaptions = [];
                    var otherCustomProductCaptions = [];
                    var logo_urls = [];
                    sendMail("payment_success", {}, {to: config.emailConfig.auth.user, bcc: global.config.emailConfig.auth.user, subject: "A successful payment has been made."});
                    for (var i = 0; i < logos.length; i++) {
                        var fileName = config.USER_LOGO_PATH + "/" + logos[i].s3_logo_url;
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url,
                                    content: fs.readFileSync(fileName),
                                    contentType: 'image/svg+xml'
                                }
                        );
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url + ".pdf",
                                    contentType: 'application/pdf',
                                    path: getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "pdf")
                                }
                        );
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url + ".png",
                                    contentType: 'image/png',
                                    path: getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "png")
                                }
                        );
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url + ".jpeg",
                                    contentType: 'image/jpeg',
                                    path: getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "jpeg")
                                }
                        );
                        logo_urls.push("<a href='" + getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "pdf") + "'>" + logos[i].company_name + ", " + logos[i].slogan + "</a>");
                        var newFile = "pur" + "." + new Date().getTime() + logos[i].s3_logo_url;
                        fs.createReadStream(fileName).pipe(fs.createWriteStream(config.USER_LOGO_PATH + "/" + newFile));
                        var itemId = logos[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `created_at`, `status`, company_name, slogan) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?, ?)",
                            params: [latestId, "LOGO", itemId, newFile, logos[i].company_name, logos[i].slogan]
                        });
                        queries.push({
                            query: "UPDATE `logos` SET status='Purchased', purchased_at = NOW() WHERE id=?",
                            params: [logos[i].base_logo]
                        });
                        var cmp = logos[i].company_name == "" ? "Unnamed" : logos[i].company_name;
                        if (i == logos.length - 3) {
                            companies += cmp + ", ";
                        } else if (i == logos.length - 2) {
                            companies += cmp + " and ";
                        } else {
                            companies += cmp;
                        }
                    }

                    for (var i = 0; i < products.length; i++) {
                        var fileName = config.USER_OTHER_PRODUCTS_PATH + "/" + products[i].image_url;
                        var newFileFr = "purOP" + "." + new Date().getTime() + products[i].image_url;
                        var rs = fs.createReadStream(fileName);
                        rs.on("error", function (err) {
                            logger.error(err);
                        })
                        rs.pipe(fs.createWriteStream(config.USER_OTHER_PRODUCTS_PATH + "/" + newFileFr));
                        var itemId = products[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `created_at`, `status`, `shipping_info_id`) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?)",
                            params: [latestId, "OTHER", itemId, newFileFr],
                            type: "OTHER"
                        });
                        otherProductCaptions.push(products[i].name + "");
                    }

                    for (var i = 0; i < customproducts.length; i++) {
                        var fileName = config.MY_OTHER_PRODUCTS_PATH  + customproducts[i].front_image;
                        var newFileFr = "purOP" + "." + new Date().getTime() + customproducts[i].front_image;
                        var rs = fs.createReadStream(fileName);
                        rs.on("error", function (err) {
                            logger.error(err);
                        })
                        rs.pipe(fs.createWriteStream(config.MY_OTHER_PRODUCTS_PATH  + newFileFr));
                        var itemId = customproducts[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `created_at`, `status`, `shipping_info_id`,`qty`) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?,?)",
                            params: [latestId, "CUSTOM", itemId, newFileFr],
                            type: "CUSTOM"
                        });
                        otherCustomProductCaptions.push(customproducts[i].title + "");
                    }

                    for (var i = 0; i < cards.length; i++) {
                        var frontFileName = config.USER_CARD_PATH + "/" + cards[i].s3_front_card_url;
                        var newFileFr = "purF" + "." + new Date().getTime() + cards[i].s3_front_card_url;
                        var rs = fs.createReadStream(frontFileName);
                        rs.on("error", function (err) {
                            logger.error(err);
                        })
                        rs.pipe(fs.createWriteStream(config.USER_CARD_PATH + "/" + newFileFr));
                        var backFileName = config.USER_CARD_PATH + "/" + cards[i].s3_back_card_url;
                        var newFileBk = null;
                        if (cards[i].s3_back_card_url != null) {
                            newFileBk = "purB" + "." + new Date().getTime() + cards[i].s3_back_card_url;
                            var rs1 = fs.createReadStream(backFileName);
                            rs1.on("error", function (err) {
                                logger.error(err);
                            });
                            rs1.pipe(fs.createWriteStream(config.USER_CARD_PATH + "/" + newFileBk));
                        }
                        var itemId = cards[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `url_back`, `created_at`, `status`, first_name, last_name, address_line_1, address_line_2, website, email, phone_no, qty, finish, paper_stock, back_of_card, back_side_super_premium, design_type, purchase_design, dont_print_card, shipping_type, shipping_info_id) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            params: [latestId, "BC", itemId, newFileFr, newFileBk, cards[i].first_name, cards[i].last_name, cards[i].address_line_1, cards[i].address_line_2, cards[i].website, cards[i].email, cards[i].phone_no, cards[i].qty, cards[i].finish, cards[i].paper_stock, cards[i].back_of_card, cards[i].back_side_super_premium, cards[i].design_type, cards[i].purchase_design, cards[i].dont_print_card, cards[i].shipping_type],
                            type: "BC"
                        });
                        cardOptions += "* Your <b>" + cards[i].qty + "</b> business cards printed on <b>" + (cards[i].paper_stock == "Premium" ? "Executive" : "Superior") + "</b> paper with <b>" + (cards[i].finish == "GLOSS" ? "Glossy" : "Matte") + "</b> finish with <b>" + cards[i].back_of_card + "</b> back side has been shipped via <b>" + (cards[i].shipping_type == "Std" ? "Standard Shipping" : "Express Shipping") + "</b>\n\n";
                        cardOptionsNewFormat += "Order details for business card for <b>" + ((cards[i].last_name != undefined || cards[i].last_name.length > 0) ? cards[i].last_name : "Unnamed") + "</b>\nQuantity: <b>" + cards[i].qty + "</b>\nFinish: <b>" + (cards[i].finish == "GLOSS" ? "Glossy" : "Matte") + "</b>\nBack: <b>" + cards[i].back_of_card + "</b>\nShipping: <b>" + (cards[i].shipping_type == "Std" ? "Standard Shipping" : "Express Shipping") + "</b>\n\n";
                        var name2 = cards[i].last_name == "" ? "Unnamed" : cards[i].last_name;
                        if (i == cards.length - 3) {
                            person_name += name2 + ", ";
                        } else if (i == cards.length - 2) {
                            person_name += name2 + " and ";
                        } else {
                            person_name += name2;
                        }
                        if (cards[i].purchase_design) {
                            if (cards[i].back_of_card != "Blank") {
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url,
                                        content: fs.readFileSync(backFileName),
                                        contentType: 'image/svg+xml'
                                    }
                                );
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url + ".pdf",
                                        contentType: 'application/pdf',
                                        path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_back_card_url, "card", undefined, undefined, false, "pdf")
                                    }
                                );
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url + ".png",
                                        contentType: 'image/png',
                                        //path: config.APP_DOMAIN + "/generateImage?format=png&height=575&width=1000&type=card&url=" + cards[i].s3_back_card_url
                                        path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_back_card_url, "card", undefined, undefined, false, "png")
                                    }
                                );
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url + ".jpeg",
                                        contentType: 'image/jpeg',
                                        path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_back_card_url, "card", undefined, undefined, false, "jpeg")
                                    }
                                );
                            }
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url,
                                    content: fs.readFileSync(frontFileName),
                                    contentType: 'image/svg+xml'
                                }
                            );
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url + ".pdf",
                                    contentType: 'application/pdf',
                                    path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_front_card_url, "card", undefined, undefined, false, "pdf")
                                }
                            );
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url + ".png",
                                    contentType: 'image/png',
                                    path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_front_card_url, "card", undefined, undefined, false, "png")
                                }
                            );
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url + ".jpeg",
                                    contentType: 'image/jpeg',
                                    path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_front_card_url, "card", undefined, undefined, false, "jpeg")
                                }
                            );
                        }
                    }
                    dbPool.getConnection(function (err, client) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                        } else {
                            client.beginTransaction(function (err) {
                                if (err) {
                                    client.release();
                                    logger.error(err);
                                    callback(err);
                                } else {
                                    var sendTxnMail = function () {
                                        var mailOptions = {
                                            from: config.emailConfig.auth.user,
                                            to: email,
                                            attachments: files
                                        };
                                        var templateOptions = {};
                                        var templateName;
                                        console.log("Cards",cards);
                                        console.log("Logos",logos);
                                        console.log("Products",products);
                                        console.log("Custom Products",customproducts);
                                        if (cards.length > 0) {
                                            if (logos.length > 0 && cards.length > 0) {
                                                mailOptions.subject = "Logo and business card for " + logos[0].company_name;
                                                templateName = "buyItems";
                                                templateOptions.name = cards[0].last_name.length > 0 ? cards[0].last_name : name;
                                                templateOptions.company = companies;
                                                templateOptions.card_details = cardOptions;
                                                templateOptions.logo_urls = logo_urls;
                                                templateOptions.otherProducts = otherProductCaptions.join(",");
                                            } else {
                                                mailOptions.subject = "Business card for " + (cards[0].last_name.length > 0 ? cards[0].last_name : name);
                                                templateName = "buyCards";
                                                templateOptions.person_name = person_name;
                                                templateOptions.card_details = cardOptionsNewFormat;
                                                templateOptions.otherProducts = otherProductCaptions.join(",");
                                            }
                                        } else if (logos.length > 0) {
                                            mailOptions.subject = "High Resolution Logo file for " + companies;
                                            templateName = "buyLogos";
                                            templateOptions.logo_urls = logo_urls;
                                            templateOptions.otherProducts = otherProductCaptions.join(",");
                                            templateOptions.name = name;
                                            templateOptions.company = companies;
                                        } else if (products.length > 0) {
                                            mailOptions.subject = "Thank you for ordering the products";
                                            templateName = "buyProducts";
                                            templateOptions.name = name;
                                            templateOptions.otherProducts = otherProductCaptions.join(", ");
                                        }else if (customproducts.length > 0) {
                                            mailOptions.subject = "Thank you for ordering the products";
                                            templateName = "buyProducts";
                                            templateOptions.name = name;
                                            templateOptions.otherProducts = otherCustomProductCaptions.join(", ");
                                        }
                                        mailOptions.bcc = global.config.emailConfig.auth.user, 
                                        templateOptions.name = name != undefined ? name : "";
                                        if (templateName != undefined) {
                                            callback(undefined, latestId);
                                            sendLogoPurchasedMail(userId, logos);
                                            sendMail(templateName, templateOptions, mailOptions, function () {
                                                /* we are not waiting for email to be sent. */
                                            }, function (err) {
                                                callback(err);
                                            });
                                        } else {
                                            callback(undefined, latestId);
                                        }
                                    };
                                    if (queries.length > 0) {
                                        var executeAllQueries = function () {
                                            if (queries.length > 0) {
                                                var fn = function () {
                                                    client.query(queries[0].query, queries[0].params, function (err, rows) {
                                                        if (err) {
                                                            client.rollback(function () {
                                                                logger.error(err);
                                                                callback(err);
                                                            });
                                                            client.release();
                                                        } else {
                                                            queries.shift();
                                                            executeAllQueries();
                                                        }
                                                    });
                                                };
                                                if (queries[0].type == "BC" || queries[0].type == "OTHER" || queries[0].type == "CUSTOM") {
                                                    client.query("INSERT INTO `shipping` (`id`) VALUES (NULL)", [], function (err, rows) {
                                                        if (err) {
                                                            client.rollback(function () {
                                                                logger.error(err);
                                                                callback(err);
                                                            });
                                                            client.release();
                                                        } else {
                                                            if(queries[0].type == "CUSTOM"){
                                                                queries[0].params.push(rows.insertId);
                                                                //queries[0].params.push(2);
                                                                easydb(dbPool)
                                                                    .query(function () {
                                                                        return {
                                                                            query: "SELECT (small+medium+large+xl+doublexl) AS qty,id FROM user_other_products_custom WHERE id = ?",
                                                                            params: [queries[0].params[2]]
                                                                        };
                                                                    })
                                                                    .success(function (rows2) {
                                                                        queries[0].params.push(rows2[0]["qty"])
                                                                        fn();
                                                                    }).execute();
                                                                
                                                            }else{
                                                                queries[0].params.push(rows.insertId);
                                                                fn();
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    fn();
                                                }
                                            } else {
                                                client.commit(function (err) {
                                                    if (err) {
                                                        client.rollback(function () {
                                                            logger.error(err);
                                                            callback(err);
                                                        });
                                                        client.release();
                                                    } else {
                                                        sendTxnMail();
                                                        client.release();
                                                    }
                                                });
                                            }
                                        };
                                        executeAllQueries();
                                    } else {
                                        client.rollback(function () {
                                            sendTxnMail();
                                            client.release();
                                        });
                                    }
                                }
                            });
                        }
                    });
                })
                .error(function (err) {
                    logger.error(err);
                    callback(err);
                }).execute();
    }, function (err) {
        logger.error(err);
        callback(err);
    });
}

function doPaymentSuccessfulActionsWithoutlogin(userId, email, callback, payment_type, price, currency, date_purchased, txn_id, name) {
    if (!name) {
        name = email.substring(0, email.indexOf("@"));
        name = name.slice(0, 1).toUpperCase() + name.substring(1);
    }
    getLatestShoppingCartIdWithoutLogin(userId, function (latestId, cartDetails) {
        var logos;
        var cards;
        var products;
        var customproducts;
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT company_name, slogan, s3_logo_url, shopping_cart_items.item_id,user_logos.base_logo_id as base_logo FROM shopping_cart_items INNER JOIN user_logos ON shopping_cart_items.item_id = user_logos.id WHERE item_type = 'LOGO' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    logos = rows;
                })
                .query(function () {
                    return {
                        query: "SELECT first_name, last_name, address_line_1, address_line_2, website, email, phone_no, qty, finish, paper_stock, back_of_card, back_side_super_premium, design_type, purchase_design, dont_print_card, shipping_type, s3_front_card_url, s3_back_card_url, shopping_cart_items.item_id FROM shopping_cart_items INNER JOIN user_cards ON shopping_cart_items.item_id = user_cards.id WHERE item_type = 'BC' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    cards = rows;
                })
                .query(function () {
                    return {
                        query: "SELECT other_products.name, user_other_products.image_url, shopping_cart_items.item_id FROM user_other_products INNER JOIN shopping_cart_items ON shopping_cart_items.item_id = user_other_products.id INNER JOIN other_products ON other_products.id = user_other_products.base_product_id WHERE item_type = 'OTHER' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    products = rows;
                })
                .query(function () {
                    return {
                        query: "SELECT other_product_details.title, other_product_details.front_image,user_other_products_custom.price, shopping_cart_items.item_id FROM user_other_products_custom INNER JOIN shopping_cart_items ON shopping_cart_items.item_id = user_other_products_custom.id INNER JOIN other_product_details ON other_product_details.id = user_other_products_custom.base_product_id WHERE item_type = 'CUSTOM' AND shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ? AND is_login = 0)",
                        params: [latestId, userId]
                    };
                })
                .success(function (rows) {
                    customproducts = rows;
                })
                .query(function () {
                    return {
                        query: "UPDATE `shopping_carts` SET `modified_at` = CURRENT_TIMESTAMP, `status` = 'PURCHASED', `payement_type`=?, `price`=?, `currency`=?, `date_purchased`=?, `txn_id`=? WHERE `user_id` = ? AND `status` = 'PENDING' AND `is_login` = 0",
                        params: [payment_type, price, currency, date_purchased, txn_id, userId]
                    };
                })
                .query(function () {
                    return {
                        query: "INSERT INTO `shopping_carts` (`user_id`, `created_at`, `status`, `shipping_type`,`is_login`) VALUES (?, CURRENT_TIMESTAMP, 'PENDING', 'FREE',0)",
                        params: [userId]
                    };
                })
                .success(function (rows) {
                    console.log("Hiiiiiiiiiiiiiiiiiii");
                    var files = [];
                    var queries = [];
                    var cardOptions = "";
                    var person_name = "";
                    var companies = "";
                    var cardOptionsNewFormat = "";
                    var otherProductCaptions = [];
                    var otherCustomProductCaptions = [];
                    var logo_urls = [];
                    sendMail("payment_success", {}, {to: config.emailConfig.auth.user, bcc: global.config.emailConfig.auth.user, subject: "A successful payment has been made."});
                    for (var i = 0; i < logos.length; i++) {
                        var fileName = config.USER_LOGO_PATH + "/" + logos[i].s3_logo_url;
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url,
                                    content: fs.readFileSync(fileName),
                                    contentType: 'image/svg+xml'
                                }
                        );
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url + ".pdf",
                                    contentType: 'application/pdf',
                                    path: getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "pdf")
                                }
                        );
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url + ".png",
                                    contentType: 'image/png',
                                    path: getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "png")
                                }
                        );
                        files.push(
                                {
                                    filename: "logo_" + logos[i].s3_logo_url + ".jpeg",
                                    contentType: 'image/jpeg',
                                    path: getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "jpeg")
                                }
                        );
                        logo_urls.push("<a href='" + getWindowsPrinterLink(logos[i].item_id, logos[i].s3_logo_url, "logo", undefined, undefined, false, "pdf") + "'>" + logos[i].company_name + ", " + logos[i].slogan + "</a>");
                        var newFile = "pur" + "." + new Date().getTime() + logos[i].s3_logo_url;
                        fs.createReadStream(fileName).pipe(fs.createWriteStream(config.USER_LOGO_PATH + "/" + newFile));
                        var itemId = logos[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `created_at`, `status`, company_name, slogan) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?, ?)",
                            params: [latestId, "LOGO", itemId, newFile, logos[i].company_name, logos[i].slogan]
                        });
                        queries.push({
                            query: "UPDATE `logos` SET status='Purchased', purchased_at = NOW() WHERE id=?",
                            params: [logos[i].base_logo]
                        });
                        var cmp = logos[i].company_name == "" ? "Unnamed" : logos[i].company_name;
                        if (i == logos.length - 3) {
                            companies += cmp + ", ";
                        } else if (i == logos.length - 2) {
                            companies += cmp + " and ";
                        } else {
                            companies += cmp;
                        }
                    }

                    for (var i = 0; i < products.length; i++) {
                        var fileName = config.USER_OTHER_PRODUCTS_PATH + "/" + products[i].image_url;
                        var newFileFr = "purOP" + "." + new Date().getTime() + products[i].image_url;
                        var rs = fs.createReadStream(fileName);
                        rs.on("error", function (err) {
                            logger.error(err);
                        })
                        rs.pipe(fs.createWriteStream(config.USER_OTHER_PRODUCTS_PATH + "/" + newFileFr));
                        var itemId = products[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `created_at`, `status`, `shipping_info_id`) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?)",
                            params: [latestId, "OTHER", itemId, newFileFr],
                            type: "OTHER"
                        });
                        otherProductCaptions.push(products[i].name + "");
                    }

                    for (var i = 0; i < customproducts.length; i++) {
                        var fileName = config.MY_OTHER_PRODUCTS_PATH  + customproducts[i].front_image;
                        var newFileFr = "purOP" + "." + new Date().getTime() + customproducts[i].front_image;
                        var rs = fs.createReadStream(fileName);
                        rs.on("error", function (err) {
                            logger.error(err);
                        })
                        rs.pipe(fs.createWriteStream(config.MY_OTHER_PRODUCTS_PATH  + newFileFr));
                        var itemId = customproducts[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `created_at`, `status`, `shipping_info_id`,`qty`) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?,?)",
                            params: [latestId, "CUSTOM", itemId, newFileFr],
                            type: "CUSTOM"
                        });
                        otherCustomProductCaptions.push(customproducts[i].title + "");
                    }

                    for (var i = 0; i < cards.length; i++) {
                        var frontFileName = config.USER_CARD_PATH + "/" + cards[i].s3_front_card_url;
                        var newFileFr = "purF" + "." + new Date().getTime() + cards[i].s3_front_card_url;
                        var rs = fs.createReadStream(frontFileName);
                        rs.on("error", function (err) {
                            logger.error(err);
                        })
                        rs.pipe(fs.createWriteStream(config.USER_CARD_PATH + "/" + newFileFr));
                        var backFileName = config.USER_CARD_PATH + "/" + cards[i].s3_back_card_url;
                        var newFileBk = null;
                        if (cards[i].s3_back_card_url != null) {
                            newFileBk = "purB" + "." + new Date().getTime() + cards[i].s3_back_card_url;
                            var rs1 = fs.createReadStream(backFileName);
                            rs1.on("error", function (err) {
                                logger.error(err);
                            });
                            rs1.pipe(fs.createWriteStream(config.USER_CARD_PATH + "/" + newFileBk));
                        }
                        var itemId = cards[i].item_id;
                        queries.push({
                            query: "INSERT INTO `purchased_items` (`shopping_cart_id`, `type`, `base_item_id`, `url`, `url_back`, `created_at`, `status`, first_name, last_name, address_line_1, address_line_2, website, email, phone_no, qty, finish, paper_stock, back_of_card, back_side_super_premium, design_type, purchase_design, dont_print_card, shipping_type, shipping_info_id) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'NOT_PRINTED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            params: [latestId, "BC", itemId, newFileFr, newFileBk, cards[i].first_name, cards[i].last_name, cards[i].address_line_1, cards[i].address_line_2, cards[i].website, cards[i].email, cards[i].phone_no, cards[i].qty, cards[i].finish, cards[i].paper_stock, cards[i].back_of_card, cards[i].back_side_super_premium, cards[i].design_type, cards[i].purchase_design, cards[i].dont_print_card, cards[i].shipping_type],
                            type: "BC"
                        });
                        cardOptions += "* Your <b>" + cards[i].qty + "</b> business cards printed on <b>" + (cards[i].paper_stock == "Premium" ? "Executive" : "Superior") + "</b> paper with <b>" + (cards[i].finish == "GLOSS" ? "Glossy" : "Matte") + "</b> finish with <b>" + cards[i].back_of_card + "</b> back side has been shipped via <b>" + (cards[i].shipping_type == "Std" ? "Standard Shipping" : "Express Shipping") + "</b>\n\n";
                        cardOptionsNewFormat += "Order details for business card for <b>" + ((cards[i].last_name != undefined || cards[i].last_name.length > 0) ? cards[i].last_name : "Unnamed") + "</b>\nQuantity: <b>" + cards[i].qty + "</b>\nFinish: <b>" + (cards[i].finish == "GLOSS" ? "Glossy" : "Matte") + "</b>\nBack: <b>" + cards[i].back_of_card + "</b>\nShipping: <b>" + (cards[i].shipping_type == "Std" ? "Standard Shipping" : "Express Shipping") + "</b>\n\n";
                        var name2 = cards[i].last_name == "" ? "Unnamed" : cards[i].last_name;
                        if (i == cards.length - 3) {
                            person_name += name2 + ", ";
                        } else if (i == cards.length - 2) {
                            person_name += name2 + " and ";
                        } else {
                            person_name += name2;
                        }
                        if (cards[i].purchase_design) {
                            if (cards[i].back_of_card != "Blank") {
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url,
                                        content: fs.readFileSync(backFileName),
                                        contentType: 'image/svg+xml'
                                    }
                                );
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url + ".pdf",
                                        contentType: 'application/pdf',
                                        path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_back_card_url, "card", undefined, undefined, false, "pdf")
                                    }
                                );
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url + ".png",
                                        contentType: 'image/png',
                                        //path: config.APP_DOMAIN + "/generateImage?format=png&height=575&width=1000&type=card&url=" + cards[i].s3_back_card_url
                                        path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_back_card_url, "card", undefined, undefined, false, "png")
                                    }
                                );
                                files.push(
                                    {
                                        filename: "card_" + cards[i].s3_back_card_url + ".jpeg",
                                        contentType: 'image/jpeg',
                                        path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_back_card_url, "card", undefined, undefined, false, "jpeg")
                                    }
                                );
                            }
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url,
                                    content: fs.readFileSync(frontFileName),
                                    contentType: 'image/svg+xml'
                                }
                            );
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url + ".pdf",
                                    contentType: 'application/pdf',
                                    path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_front_card_url, "card", undefined, undefined, false, "pdf")
                                }
                            );
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url + ".png",
                                    contentType: 'image/png',
                                    path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_front_card_url, "card", undefined, undefined, false, "png")
                                }
                            );
                            files.push(
                                {
                                    filename: "card_" + cards[i].s3_front_card_url + ".jpeg",
                                    contentType: 'image/jpeg',
                                    path: getWindowsPrinterLink(cards[i].item_id, cards[i].s3_front_card_url, "card", undefined, undefined, false, "jpeg")
                                }
                            );
                        }
                    }
                    dbPool.getConnection(function (err, client) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                        } else {
                            client.beginTransaction(function (err) {
                                if (err) {
                                    client.release();
                                    logger.error(err);
                                    callback(err);
                                } else {
                                    var sendTxnMail = function () {
                                        var mailOptions = {
                                            from: config.emailConfig.auth.user,
                                            to: email,
                                            attachments: files
                                        };
                                        var templateOptions = {};
                                        var templateName;
                                        console.log("Cards",cards);
                                        console.log("Logos",logos);
                                        console.log("Products",products);
                                        console.log("Custom Products",customproducts);
                                        if (cards.length > 0) {
                                            if (logos.length > 0 && cards.length > 0) {
                                                mailOptions.subject = "Logo and business card for " + logos[0].company_name;
                                                templateName = "buyItems";
                                                templateOptions.name = cards[0].last_name.length > 0 ? cards[0].last_name : name;
                                                templateOptions.company = companies;
                                                templateOptions.card_details = cardOptions;
                                                templateOptions.logo_urls = logo_urls;
                                                templateOptions.otherProducts = otherProductCaptions.join(",");
                                            } else {
                                                mailOptions.subject = "Business card for " + (cards[0].last_name.length > 0 ? cards[0].last_name : name);
                                                templateName = "buyCards";
                                                templateOptions.person_name = person_name;
                                                templateOptions.card_details = cardOptionsNewFormat;
                                                templateOptions.otherProducts = otherProductCaptions.join(",");
                                            }
                                        } else if (logos.length > 0) {
                                            mailOptions.subject = "High Resolution Logo file for " + companies;
                                            templateName = "buyLogos";
                                            templateOptions.logo_urls = logo_urls;
                                            templateOptions.otherProducts = otherProductCaptions.join(",");
                                            templateOptions.name = name;
                                            templateOptions.company = companies;
                                        } else if (products.length > 0) {
                                            mailOptions.subject = "Thank you for ordering the products";
                                            templateName = "buyProducts";
                                            templateOptions.name = name;
                                            templateOptions.otherProducts = otherProductCaptions.join(", ");
                                        }else if (customproducts.length > 0) {
                                            mailOptions.subject = "Thank you for ordering the products";
                                            templateName = "buyProducts";
                                            templateOptions.name = name;
                                            templateOptions.otherProducts = otherCustomProductCaptions.join(", ");
                                        }
                                        mailOptions.bcc = global.config.emailConfig.auth.user, 
                                        templateOptions.name = name != undefined ? name : "";
                                        if (templateName != undefined) {
                                            callback(undefined, latestId);
                                            sendLogoPurchasedMail(userId, logos);
                                            sendMail(templateName, templateOptions, mailOptions, function () {
                                                /* we are not waiting for email to be sent. */
                                            }, function (err) {
                                                callback(err);
                                            });
                                        } else {
                                            callback(undefined, latestId);
                                        }
                                    };
                                    if (queries.length > 0) {
                                        var executeAllQueries = function () {
                                            if (queries.length > 0) {
                                                var fn = function () {
                                                    client.query(queries[0].query, queries[0].params, function (err, rows) {
                                                        if (err) {
                                                            client.rollback(function () {
                                                                logger.error(err);
                                                                callback(err);
                                                            });
                                                            client.release();
                                                        } else {
                                                            queries.shift();
                                                            executeAllQueries();
                                                        }
                                                    });
                                                };
                                                if (queries[0].type == "BC" || queries[0].type == "OTHER" || queries[0].type == "CUSTOM") {
                                                    client.query("INSERT INTO `shipping` (`id`) VALUES (NULL)", [], function (err, rows) {
                                                        if (err) {
                                                            client.rollback(function () {
                                                                logger.error(err);
                                                                callback(err);
                                                            });
                                                            client.release();
                                                        } else {
                                                            if(queries[0].type == "CUSTOM"){
                                                                queries[0].params.push(rows.insertId);
                                                                //queries[0].params.push(2);
                                                                easydb(dbPool)
                                                                    .query(function () {
                                                                        return {
                                                                            query: "SELECT (small+medium+large+xl+doublexl) AS qty,id FROM user_other_products_custom WHERE id = ?",
                                                                            params: [queries[0].params[2]]
                                                                        };
                                                                    })
                                                                    .success(function (rows2) {
                                                                        queries[0].params.push(rows2[0]["qty"])
                                                                        fn();
                                                                    }).execute();
                                                                
                                                            }else{
                                                                queries[0].params.push(rows.insertId);
                                                                fn();
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    fn();
                                                }
                                            } else {
                                                client.commit(function (err) {
                                                    if (err) {
                                                        client.rollback(function () {
                                                            logger.error(err);
                                                            callback(err);
                                                        });
                                                        client.release();
                                                    } else {
                                                        sendTxnMail();
                                                        client.release();
                                                    }
                                                });
                                            }
                                        };
                                        executeAllQueries();
                                    } else {
                                        client.rollback(function () {
                                            sendTxnMail();
                                            client.release();
                                        });
                                    }
                                }
                            });
                        }
                    });
                })
                .error(function (err) {
                    logger.error(err);
                    callback(err);
                }).execute();
    }, function (err) {
        logger.error(err);
        callback(err);
    });
}

function paytm_payment(user, amt, description, currency, actualRes, callback) {
    console.log("test",user);
    var orderid = user.id + "WITH" + new Date().getTime();
    var post_data = {
       // REQUEST_TYPE: "Payment",
        MID: config.payTmConfig.MID,
        ORDER_ID: orderid,
        CUST_ID: user.email,
        TXN_AMOUNT: amt,
        CHANNEL_ID: "WEB",
        CALLBACK_URL   : config.payTmConfig.CALLBACK_URL,
        INDUSTRY_TYPE_ID: config.payTmConfig.Industry_Type,
        WEBSITE: config.payTmConfig.Website,
        EMAIL : user.email
        //MOBILE_NO : '9163690166'
    };
    if(user.login == false){
        post_data["MERC_UNQ_REF"] = user.id;
    }
    console.log("POST DATA",post_data)
    checksum_lib.genchecksum(post_data, config.payTmConfig.Merchant_Key, function (err, checksum) {

        console.log(err,checksum)
        var txn_url = config.payTmConfig.TXN_URL
        //var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
        var form_fields = "";
        for (var x in post_data) {
            form_fields += "<input type='hidden' name='" + x + "' value='" + post_data[x] + "' >";
        }
        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
        var html= '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>';
        actualRes.send({status: 200, html: html})
        easydb(dbPool)
            .query(function () {
                return {
                    query: "INSERT INTO `order_records` (`user_id`, `order_id`,  `status`) VALUES (?, ?, ?)",
                    params: [user.id, orderid, 'PENDING']
                };
            })
            .success(function (rows) {
                console.log("Done")
            })
            .error(function (err) {
                logger.error(err);
                
            }).execute();
    });
}

function getDate(d) {
    var m_names = new Array("Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec");
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    return curr_date + "-" + m_names[curr_month] + "-" + curr_year;
}

function updateTransactionStatus(userId, paymentGateWay, txId, status, failureDetails, callback) {
    easydb(dbPool)
            .query(function () {
                return {
                    query: "INSERT INTO `transactions` (`user_id`, `payment_gateway`, `transaction_id`, `status`, `failure_details`) VALUES (?, ?, ?, ?, ?)",
                    params: [userId, paymentGateWay, txId, status, failureDetails]
                };
            })
            .success(function (rows) {
                if (callback != undefined) {
                    callback(undefined, rows);
                }
            })
            .error(function (err) {
                logger.error(err);
                if (callback != undefined) {
                    callback(err);
                }
            }).execute();
}

function getAmountInSmallestUnit(amt, currency) {
    currency = currency.toUpperCase();
    var newAmt;
    switch (currency) {
        case "BIF":
        case "DJF":
        case "CLP":
        case "GNF":
        case "JPY":
        case "KMF":
        case "MGA":
        case "PYG":
        case "RWF":
        case "VND":
        case "VUV":
        case "XAF":
        case "XOF":
        case "XPF":
        case "KRW":
        {
            newAmt = Math.round(amt);
            break;
        }
        default:
        {
            newAmt = Math.round(amt * 100);
            break;
        }
    }
    return newAmt;
}

function sendLogoPurchasedMail(userId, logos) {
    getCustomCardImages_(function (cardImage) {
        getCustomLogoImages_(function (logoImage) {
            for (var i = 0; i < logos.length; i++) {
                var logo = logos[i];
                easydb(dbPool)
                        .query(function () {
                            return {
                                query: "SELECT DISTINCT(users.email) AS email, company_name, s3_logo_url FROM user_logos INNER JOIN users ON user_logos.user_id = users.id WHERE user_logos.status <> 'Deleted' AND users.id <> ? AND base_logo_id = ? ORDER BY users.last_login_time DESC LIMIT 50",
                                params: [userId, logo.base_logo]
                            };
                        })
                        .success(function (userInfo) {
                            for (var j = 0; j < userInfo.length; j++) {
                                var emailName = userInfo[j].email.substring(0, userInfo[j].email.indexOf("@"));
                                emailName = emailName.slice(0, 1).toUpperCase() + emailName.substring(1);
                                var mailOptions = {
                                    from: config.emailConfig.auth.user,
                                    to: userInfo[j].email,
                                    attachments: prepareAttachements(userInfo[j].s3_logo_url, cardImage, logoImage),
                                    subject: emailName + ", TRY another design for “" + userInfo[j].company_name + "”"
                                };
                                var templateOptions = {
                                    base: config.APP_DOMAIN,
                                    name: emailName,
                                    cardImage: cardImage,
                                    logoImage: logoImage,
                                    companyName: userInfo[j].company_name
                                };
                                sendMail("somebody_purchased_logo", templateOptions, mailOptions, function () {

                                }, function (err) {
                                    logger.error("Purchased Logo Mail Error: (below)");
                                    logger.error(err);
                                });
                            }
                        })
                        .error(function (err) {
                            logger.error(err);
                        }).execute();
            }
        });
    });
}

function prepareAttachements(userLogoUrl, cardImage, logoImage) {
    var attachments = prepareAttachements_(cardImage, logoImage);
    attachments.push({
        filename: "purchased_logo.jpg",
        cid: "purchased_logo@logomaker.com",
        contentType: "image/jpg",
        path: config.APP_DOMAIN + '/generateImage?height=124&width=124&url=' + userLogoUrl + '&type=logo&nodownload=true'
    });
    return attachments;
}


function getWindowsPrinterLink(id, url, type, height, width, cmyk, format) {
    var printerUrl = config.PRINTER_URL + "?rootUrl=" + encodeURIComponent(config.APP_DOMAIN);

    if (!type) {
        type = "card";
    }

    if (!height) {
        height = 100;
    }
    if (!width) {
        width = 1000;
    }
    if (!format) {
        format = "pdf";
    }
    if (cmyk) {
        cmyk = "&cmyk=true";
    } else {
        cmyk = "";
    }
    return printerUrl + '&format=' + format + '&width=' + width + '&height=' + height + cmyk + '&type=' + type + '&id=' + id + '&url=' + encodeURIComponent(url);
}

function checkOrderExistence(orderid,callback){
    easydb(dbPool)
            .query(function () {
                return {
                    query: "select * from order_records where order_id = ? order by id desc",
                    params: [orderid]
                };
            })
            .success(function (rows) {
                if(rows.length > 0){
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "select id,email,first_name,last_name,usertype from users where id = ?",
                                params: [rows[0]["user_id"]]
                            };
                        })
                        .success(function (rows) {
                            if(rows.length > 0){
                                if (callback != undefined) {
                                    callback(undefined, rows[0]);
                                }
                            }else{
                                callback('err');
                            }
                        }).execute()
                }else{
                    callback('err');
                }
                
            })
            .error(function (err) {
                logger.error(err);
                if (callback != undefined) {
                    callback(err);
                }
            }).execute();
}