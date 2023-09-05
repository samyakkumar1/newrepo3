var geoip = require('geoip-lite');
var urlmodule = require('url');
const easydb = require('../../lib/easydb');


exports.editor = function (req, res, next) {
    if (req.headers.referer && (req.headers.referer.indexOf(config.ADMIN_APP_DOMAIN) >= 0 || req.headers.referer.indexOf("tagbit.com:8080") >= 0)) {
    } else {
        logger.warn("Unauthorized editor access: " + req.headers.referer);
        //res.send(404, "Please access this editor from admin console (from " + config.ADMIN_APP_DOMAIN + "). (you now opened " + (req.headers.referer ? "from " + req.headers.referer : " directly or refreshed the page." ) + ")");
    }
    res.setHeader("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
    res.setHeader("Expires", 0);
    res.render('editor');
};


exports.listOtherProducts = function (req, res, next) {
    if (req.params.categoryUrl) {
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT id, category_desc FROM categories WHERE status = 'Active' AND url = ?",
                        params: [req.params.categoryUrl]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0) {
                        res.render('other_products_list', {
                            meta_title: req.i18n.__("Other Products - Tagbit.co"),
                            desc: "Tagbit: Create and sell custom apparels online",
                            keyword: "Other Products - Tagbit.co",
                            i18n: req.i18n,
                            geoip: geoip.lookup(global.formatIp(req)),
                            refiral_key: config.REFIRAL_KEY,
                            base: config.APP_DOMAIN,
                            user: req.user,
                            params: {
                                categoryId: rows[0].id,
                                description: rows[0].category_desc
                            },
                            options: config.renderOptions
                        });
                    } else {
                        throw new Error("Category not found.");
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.status(500).render('error', {
                        message: "Error: " + err.message,
                        error: err,
                        title: "Error",
                        i18n: req.i18n,
                        geoip: geoip.lookup(global.formatIp(req)),
                        refiral_key: config.REFIRAL_KEY,
                        base: config.APP_DOMAIN,
                        user: req.user,
                        options: config.renderOptions
                    });
                }).execute();
    } else {
        res.render('other_products_list', {
            meta_title: req.i18n.__("Other Products - Tagbit.co"),
            desc: "Tagbit: Create and sell custom apparels online.",
            keyword: "other products tagbit",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            params: {
                categoryId: undefined
            },
            options: config.renderOptions
        });
    }
}

exports.otherProducts = function (req, res, next) {
    var url = req.originalUrl.split("/")[2];
    var notFound = function () {
        res.status(404).render('error', {
            message: "Product not Found",
            error: {stack: "We can't find the requested page.", status: 404},
            title: "Error - File Not Found",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            user: req.user,
            base: config.APP_DOMAIN,
            options: config.renderOptions
        });
    }
    if (!url) {
        notFound();
    }
    var default_seo = {
        meta_title: "Tagbit | Create and sell Custom apparels online",
        keyword: "tagbit, sell custom apparels online",
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        alt_text: "sell custom apparels"
    };
    var params;
    var seoData;
    
    var db = easydb(dbPool);
    db.query(function () {
            return {
               // query: "SELECT * FROM other_products WHERE status = 'Active' AND seo_url = ?",
                query:"SELECT op.*,opi.front_image AS img1,opi.back_image AS img2,opi.color AS col FROM other_products op LEFT JOIN other_products_images opi ON opi.other_product_id = op.id  WHERE op.status = 'Active' AND op.seo_url = ?",
                params: [url]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                var other_images_color = [];
                var other_images = [];
                var other_back_images = [];
                rows.forEach(element => {
                    other_images_color.push(element.col);
                    other_images.push("/getOtherProductImage?id="+element.img1);
                    other_back_images.push("/getOtherProductImage?id="+element.img2)
                });
                var i = 0;
                params = {
                    name: rows[i].name,
                    id: rows[i].id,
                    frontUrl: rows[i].base_image_url,
                    backUrl: rows[i].base_image_back_url,
                    backLogoParams: rows[i].back_logo_params,
                    frontLogoParams: rows[i].front_logo_params,
                    desc: rows[i].description,
                    base_params_front: rows[i].base_params_front,
                    base_params_back: rows[i].base_params_back,
                    other_images_col:other_images_color,
                    otherimages:other_images,
                    otherimages_back:other_back_images,
                    userid:req.user.id,
                    base_price:rows[i].base_price
                    //other_images_col :  ["white","blue","red"],
                    //otherimages : ["/getOtherProductImage?id=1467710577831.jpeg","/getOtherProductImage?id=1467710577832.jpeg","/getOtherProductImage?id=1467710577833.jpeg"]

                };
                seoData = {
                    meta_title: rows[i].seo_title || default_seo.meta_title,
                    keyword: rows[i].seo_keywords || default_seo.keyword,
                    desc: rows[i].seo_description || default_seo.desc,
                    alt_text: default_seo.alt_text
                };

                db
                    .query(function () {
                        return {
                            query: "SELECT COUNT(1) AS designCount FROM other_products_designs WHERE status = 'Active' AND other_product_id = ?",
                            params: [params.id]
                        };
                    })
                    .success(function (rows) {
                        if (rows.length > 0) {
                            params.design_count = rows[0].designCount;
                        }
                        console.log(req.user)
                        res.setHeader("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
                        res.setHeader("Pragma", "no-cache");
                        res.setHeader("Expires", "0");
                        res.render('other_products_pod', global.extend({
                            i18n: req.i18n,
                            geoip: geoip.lookup(global.formatIp(req)),
                            refiral_key: config.REFIRAL_KEY,
                            base: config.APP_DOMAIN,
                            user: req.user,
                            params: params,
                            options: config.renderOptions,
                        }, seoData));
                    });
            } else {
                notFound();
            }
        })
        .error(function (err) {
            logger.error(err);
            res.status(500).render('error', {
                message: "Error in database query",
                error: err,
                title: "Error",
                i18n: req.i18n,
                geoip: geoip.lookup(global.formatIp(req)),
                refiral_key: config.REFIRAL_KEY,
                base: config.APP_DOMAIN,
                user: req.user,
                options: config.renderOptions
            });
        }).execute();
};

exports.index = function (req, res, next) { 
    res.render('index', {
        meta_title: req.i18n.__("Tagbit - Create and Sell Custom Apparels Online"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "tagbit, sell custom apparels online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.login = function (req, res, next) {
    res.render('login', {
        meta_title: req.i18n.__("Login | Tagbit | Create and Sell Custom Apparels Online in Minutes"),
        desc: "Login to your account and start making free custom apparels and sell them with tagbit. Enter username and password or Register",
        keyword: "tagbit, tagbit login",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.signup = function (req, res, next) {
    res.render('signup', {
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        keyword: "tagbit registration,create account tagbit, login to your account, tagbit signup,",
        desc: "Signup at Tagbit. Create and Sell Custom Apparels Online in Minutes",
        meta_title: "SignUp - Tagbit | Create and Sell Custom Apparels Online in Minutes",
        alt_text: "sell custom apparel online",
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.forgot_password = function (req, res, next) {
    res.render('forgot_password', {
        meta_title: req.i18n.__("Reset Password–Tagbit | Create and Sell Custom Apparels Online in Minutes"),
        desc: "Complete the form below to receive an email with the authorization code needed to change or reset your tagbit account password.",
        keyword: "change or reset your tagbit account password, reset password tagbit, forgot password tagbit",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.thank_you_for_buying_from_us = function (req, res, next) {
    easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT txn_id, price, currency FROM shopping_carts WHERE id = ?",
                    params: [req.query.cartId]
                };
            })
            .success(function (rows) {
                console.log("Req User : ",req.user)
                var islogin = false;
                if(req.user != undefined){
                    islogin = true;
                }
                res.render('execute', {
                    title: req.i18n.__("Successful Payment"),
                    i18n: req.i18n,
                    geoip: geoip.lookup(global.formatIp(req)),
                    refiral_key: config.REFIRAL_KEY,
                    base: config.APP_DOMAIN,
                    user: req.user,
                    islogin:islogin,
                    options: config.renderOptions,
                    txnInfo: rows[0]
                });
            })
            .error(function (err) {
                logger.error(err);
                res.status(500);
            }).execute();
};


exports.ailogodesigner = function (req, res, next) {
    var urls = decodeURIComponent(req.url.replace(/_/g, " ")).split("/").splice(2);
    var renderFn = function (seoData) {
        res.render('ailogodesigner', global.extend({
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        }, seoData));
    };
    var default_seo = {
        meta_title: req.i18n.__("Logo Creator Online: Make Your Logo Free & Generate in Suitable Format "),
        keyword: "logo design online, free logo generator online, download free logo online, steps to design logo online,make logo online,Free logo maker,Logo design free,Online logo maker,Logo design,Online business card maker free printable,Free logo,tagbit,wix logo maker",
        desc: "At Tagbit you can design your logo according to business category by following some steps to generate free logo. Our Logo maker enable's you to customize your logo for free anytime and anywhere. You can buy your customize brand logo in moments.",
        alt_text: "logo creator"
    };
    if (urls) {
        if (urls[1]) {
            easydb(dbPool)
                    .query(function () {
                        return {
                            query: "SELECT seo_keyword, seo_description, seo_title FROM logos WHERE id = ? OR url = ?",
                            params: [urls[1], urls[1]]
                        };
                    })
                    .success(function (rows) {
                        if (rows.length > 0) {
                            renderFn({
                                meta_title: rows[0].seo_title || default_seo.meta_title,
                                keyword: rows[0].seo_keyword || default_seo.keyword,
                                desc: rows[0].seo_description || default_seo.desc,
                                alt_text: default_seo.alt_text
                            });
                        } else {
                            renderFn(default_seo);
                        }
                    })
                    .error(function (err) {
                        logger.error(err);
                        renderFn(default_seo);
                    }).execute();
        } else if (urls[0]) {
            easydb(dbPool)
                    .query(function () {
                        return {
                            query: "SELECT seo_keyword, seo_description, seo_title FROM categories WHERE id = ? OR url = ?",
                            params: [urls[0], urls[0]]
                        };
                    })
                    .success(function (rows) {
                        if (rows.length > 0) {
                            renderFn({
                                meta_title: rows[0].seo_title || default_seo.meta_title,
                                keyword: rows[0].seo_keyword || default_seo.keyword,
                                desc: rows[0].seo_description || default_seo.desc,
                                alt_text: default_seo.alt_text
                            });
                        } else {
                            renderFn(default_seo);
                        }
                    })
                    .error(function (err) {
                        logger.error(err);
                        renderFn(default_seo);
                    }).execute();
        } else {
            renderFn(default_seo);
        }
    } else {
        renderFn(default_seo);
    }
};


exports.mydesigns = function (req, res, next) {
    var renderFn = function (products) {
        res.render('mydesigns', {
            meta_title: req.i18n.__("Tagbit-Create and Sell Custom Apparels Online"),
            desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
            keyword: "tagbit, sell custom apparels online",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions,
            products: products
        });
    };
    console.log(typeof req)
    if (typeof req != "undefined" && typeof req["user"] != "undefined") {
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT name, seo_url FROM other_products WHERE status = 'Active' ORDER BY category",
                        params: []
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0) {
                        renderFn(rows);
                    } else {
                        renderFn();
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    renderFn();
                }).execute();
    } else {
        renderFn();
    }
};

exports.checkout = function (req, res, next) {
    res.render('checkout', {
        title: req.i18n.__("Checkout: Tagbit | Create and Sell Custom apparels online"),
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        keyword: "sell custom apparel online, tagbit checkout",
        desc: "Buy high quality custom t-shirts only at Tagbit. Best designs online created by our independent designers.",
        meta_title: "Tagbit: Checkout",
        alt_text: "buy custom tshirt online",
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.mymerch = function (req, res, next) {
    if (req.user) {
        res.render('myMerch', {
            title: req.i18n.__("Tagbit: Dashboard"),
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            keyword: "sell custom apparel online, tagbit checkout",
            desc: "Create and sell custom apparels online right from your tagbit dashboard.",
            meta_title: "Tagbit: Dashboard",
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        });
    } else {
        sendForbidden(req, res);
    }
};

exports.getMerchData = function(req,res){
    var productlist;
    var orderlist;
    var coupanlist;
    var paymethod = {};
    easydb(dbPool)
    .query(function () {
        return {
            query: "SELECT * from other_product_details where user_id = ? AND isdeleted = '0'",
            params: [req.user.id]
        };
    })
    .success(function (rows) {
        if (rows.length > 0) {
            productlist = rows;
        }else{
            productlist = [];
        }
    })
    .query(function () {
        return {
            query: "SELECT opd.*,c.code,c.percent,c.id as coupan_id from other_product_details AS opd LEFT JOIN coupancode AS c ON c.other_product_detail_id = opd.id where opd.user_id = ? AND opd.isdeleted = '0' AND c.id IS NOT NULL",
            params: [req.user.id]
        };
    })
    .success(function (rows) {
        if (rows.length > 0) {
            coupanlist = rows;
        }else{
            coupanlist = [];
        }
    })
    .query(function(){
        return {
            query: "SELECT ss.shipment_status , pui.status AS shipping_status ,sci.id AS shopping_cart_item_id,opd.title,opd.price AS single_price,opd.front_image AS image ,opd.color,op.base_price ,sc.shipping_type,sc.status AS purchase_status,sc.date_purchased,IFNULL(opc.new_price,opc.price) AS total_price,opc.small,opc.medium,opc.large,opc.xl,opc.doublexl,opd.id FROM shopping_cart_items AS sci LEFT JOIN shopping_carts sc ON sci.shopping_cart_id = sc.id INNER JOIN purchased_items AS pui ON pui.shopping_cart_id = sci.shopping_cart_id LEFT JOIN user_other_products_custom  opc ON opc.id = sci.item_id LEFT JOIN other_product_details  opd ON opd.id = opc.base_product_id LEFT JOIN other_products  op ON op.id = opd.other_product_id LEFT JOIN shipping_status ss ON ss.purchased_id = pui.id WHERE sci.item_id IN(SELECT id FROM user_other_products_custom WHERE base_product_id IN( SELECT id FROM other_product_details WHERE user_id = ? )) AND sci.item_type = 'CUSTOM' AND sc.status = 'PURCHASED'",
            params: [req.user.id]
        };
    })
    .success(function(rows){
        if(rows.length > 0){
            orderlist = rows;
        }else{
            orderlist = [];
        }
    }).query(function(){
        return {
            query: "SELECT * from long_payment where userid =  ? ",
            params: [req.user.id]
        };
    })
    .success(function(rows){
        if(rows.length > 0){
            paymethod["long_payment"] = rows;
        }else{
            paymethod["long_payment"] = null;
        }
    }).query(function(){
        return {
            query: "SELECT * from short_payment where userid =  ? ",
            params: [req.user.id]
        };
    })
    .success(function(rows){
        if(rows.length > 0){
            paymethod["short_payment"] = rows;
        }else{
            paymethod["short_payment"] = null;
        }
        res.send({status:200,productlist:productlist,orderlist:orderlist,paymethod:paymethod,coupanlist:coupanlist})
    }).execute();
}
exports.deleteOtherProductDetails = function(req,res){
    var id = req.body.id;
    easydb(dbPool)
    .query(function () {
        return {
            query: "Update other_product_details set isdeleted = '1'  where id = ?",
            params: [id]
        };
    })
    .success(function (rows) {
        res.send({status:200})
    }).execute();

},
exports.deleteCoupan = function(req,res){
    var id = req.body.id;
    easydb(dbPool)
    .query(function () {
        return {
            query: "delete from coupancode where id = ?",
            params: [id]
        };
    })
    .success(function (rows) {
        res.send({status:200})
    }).execute();

},
exports.editProfile = function (req, res, next) {
    if (req.user) {
        res.render('editProfile', {
            title: req.i18n.__("Edit Profile"),
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        });
    } else {
        sendForbidden(req, res);
    }
};

exports.aboutUs = function (req, res, next) {
    res.render('aboutUs', {
        meta_title: req.i18n.__("About Us- Tagbit | Create and Sell custom Apparels online in minutes"),
        desc: "Tagbit is platform hosting independent creators to sell custom apparels online without and hassle and upfront cost.",
        keyword: "about tagbit",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.emailverification = function (req, res, next) {
    if(req.query.id){
        var id = req.query.id.split("-");
        var uid = id[0];
        var otp = id[1];
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "update users set verified = 1 WHERE id = ? And otp = ?",
                        params: [uid,otp]
                    };
                })
                .success(function (rows) {
                    res.render('emailverify', {
                        title: req.i18n.__("Email Verification"),
                        i18n: req.i18n,
                        geoip: geoip.lookup(global.formatIp(req)),
                        refiral_key: config.REFIRAL_KEY,
                        base: config.APP_DOMAIN,
                        user: req.user,
                        options: config.renderOptions,
                    });
                })
                .error(function (err) {
                    logger.error(err);
                    res.status(500);
                }).execute();
    }else{
        sendForbidden(req, res);
    }
};


exports.blog = function (req, res, next) {
    res.render('blog', {
        meta_title: req.i18n.__("Design and sell Custom apparels online | Blog | Tagbit"),
        desc: "Tabit is platform hosting independent creators to sell custom apparels online without and hassle and upfront cost.",
        keyword: "Blog tagbit",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};


//Posts

exports.cafeStartup = function (req, res, next) {
    res.render('blog1', {
        meta_title: req.i18n.__("Logo Design Online | Blog | Logo Maker | Tagbit"),
        desc: "tagbit has the best logo maker to design logo online for your company. Easy way to get theunique logo design online using free logo making software.",
        keyword: "Blog tagbit, online logo making software, make logo online, steps to create logo online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.eventManagement = function (req, res, next) {
    res.render('blog2', {
        meta_title: req.i18n.__("Logo Design Online | Blog | Logo Maker | Tagbit"),
        desc: "tagbit has the best logo maker to design logo online for your company. Easy way to get theunique logo design online using free logo making software.",
        keyword: "Blog tagbit, online logo making software, make logo online, steps to create logo online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.teamWork = function (req, res, next) {
    res.render('blog3', {
        meta_title: req.i18n.__("Logo Design Online | Blog | Logo Maker | Tagbit"),
        desc: "tagbit has the best logo maker to design logo online for your company. Easy way to get theunique logo design online using free logo making software.",
        keyword: "Blog tagbit, online logo making software, make logo online, steps to create logo online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.techProduct = function (req, res, next) {
    res.render('blog4', {
        meta_title: req.i18n.__("Logo Design Online | Blog | Logo Maker | Tagbit"),
        desc: "tagbit has the best logo maker to design logo online for your company. Easy way to get theunique logo design online using free logo making software.",
        keyword: "Blog tagbit, online logo making software, make logo online, steps to create logo online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.fclpost = function (req, res, next) {
    res.render('blog0', {
        meta_title: req.i18n.__("Logo Design Online | Blog | Logo Maker | Tagbit"),
        desc: "tagbit has the best logo maker to design logo online for your company. Easy way to get theunique logo design online using free logo making software.",
        keyword: "Blog tagbit, online logo making software, make logo online, steps to create logo online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.vmbpost = function (req, res, next) {
    res.render('blog10', {
        meta_title: req.i18n.__("Logo Design Online | Blog | Logo Maker | Tagbit"),
        desc: "tagbit has the best logo maker to design logo online for your company. Easy way to get theunique logo design online using free logo making software.",
        keyword: "Blog tagbit, online logo making software, make logo online, steps to create logo online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};


exports.contact_us = function (req, res, next) {
    res.render('contact_us', {
        meta_title: req.i18n.__("Contact Us - Tagbit | Questions? Feel free to contact us"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "tagbit, sell custom apparels online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.bulk_orders = function (req, res, next) {
    res.render('bulk_orders', {
        meta_title: req.i18n.__("Bulk Orders - Tagbit | For Colleges, Events and More"),
        desc: "Design and distribute bulk orders with just a few clicks. Learn more",
        keyword: "tagbit, distribute custom apparels online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.howItWorks = function (req, res, next) {
    res.render('howItWorks', {
        meta_title: req.i18n.__("Create and Sell Custom Apparels Online"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "tagbit, sell custom apparels online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.logoGetStarted = function (req, res, next) {
    res.render('logoGetStarted', {
        title: req.i18n.__("Tagbit"),
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.moreFaq = function (req, res, next) {
    res.render('moreFaq', {
        meta_title: req.i18n.__("FAQ-Tagbit | Frequent Asked Questions"),
        desc: "Tagbit answers all your questions related to designing and selling custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "make logo online,Free logo maker,Logo design free,Online logo maker,Logo design,Online business card maker free printable,Free logo,tagbit,wix logo maker,faq, frequently asked questions, tagbit, free logo online, make logo online, design logo online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.onFreeLogo = function (req, res, next) {
    res.render('onFreeLogo', {
        meta_title: req.i18n.__("Create and Sell Custom Apparels Online –Tagbit"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "tagbit, sell custom apparels online",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.privacyPolicy = function (req, res, next) {
    res.render('privacyPolicy', {
        meta_title: req.i18n.__("Privacy Policy -Tagbit | Create and Sell Custom Apparels Online"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "privacy policy, tagbit privacy policy, what data does tagbit collects",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.refundPolicy = function (req, res, next) {
    res.render('refundPolicy', {
        meta_title: req.i18n.__("Refund Policy-Tagbit | Create and Sell Custom Apparels Online"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "refund policy, tagbit refund policy, read tagbit refund policy",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.guidelines = function (req, res, next) {
    res.render('guidelines', {
        meta_title: req.i18n.__("Community Guidelines-Tagbit | Create and Sell Custom Apparels Online"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "community guidelines, tagbit community guidelines, read tagbit community guidelines",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.termsUse = function (req, res, next) {
    res.render('termsUse', {
        meta_title: req.i18n.__("Terms of Use-Tagbit | Create and Sell Custom Apparels Online"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost. Our Terms of use.",
        keyword: "terms and condition, tagbit terms and conditions, read tagbit terms and conditions",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.shippingPolicy = function (req, res, next) {
    res.render('shippingPolicy', {
        meta_title: req.i18n.__("Shipping Policy-Tagbit | Create and Sell Custom Apparels Online"),
        desc: "Design and sell custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "shipping policy, Tagbit shipping policy, read Tagbit shipping policy",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.changePassword = function (req, res, next) {
    res.render('changePassword', {
        meta_title: req.i18n.__("Change Password-Tagbit | Create and Sell Custom Apparels Online"),
        desc: "Create new password for your tagbit account and start selling custom apparels online using Tagbit without any hassle or upfront cost.",
        keyword: "tagbit change password, tagbit",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.tips = function (req, res, next) {
    res.render('tips', {
        meta_title: req.i18n.__("Tips-Tagbit | Tips for Designing and selling custom apparels online"),
        desc: "Awesome tips for free logo design is available at tagbit. Tips that will design logo online using free logo generator in professional and simple ways",
        keyword: "logo desing tips, tips to desing logo online, online logo desing tips, tagbit,make logo online,Free logo maker,Logo design free,Online logo maker,Logo design,Online business card maker free printable,Free logo,tagbit,wix logo maker",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};


exports.test = function (req, res, next) {
    res.render('test', {
        meta_title: req.i18n.__("Tagbit-Online Logo Design Tips | Online Logo Design Steps "),
        desc: "Tagbit is a simple and easy logo design tips which will help you to design logo online, and also educate you in selecting logo for your company or startup.",
        keyword: "logo desing tips, tips to desing logo online, online logo desing tips, tagbit,make logo online,Free logo maker,Logo design free,Online logo maker,Logo design,Online business card maker free printable,Free logo,tagbit,wix logo maker",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.pythontest = function (req, res, next) {
    res.render('pythontest', {
        meta_title: req.i18n.__("Tagbit-Python Test"),
        desc: "Tagbit is a simple and easy logo design tips which will help you to design logo online, and also educate you in selecting logo for your company or startup.",
        keyword: "python",
        i18n: req.i18n,
        geoip: geoip.lookup(global.formatIp(req)),
        refiral_key: config.REFIRAL_KEY,
        base: config.APP_DOMAIN,
        user: req.user,
        options: config.renderOptions
    });
};

exports.productDetails = function (req, res, next) {
    var url = req.query.url;
    //var q = urlmodule.parse(url, true);
    //var qdata = q.query;
    //console.log("qdata",qdata.id)
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT opd.*,u.first_name,u.last_name FROM other_product_details opd LEFT JOIN users u ON u.id = opd.user_id WHERE opd.id = ? AND opd.isdeleted = '0'",
                params: [req.query.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                var resultparams = {
                    price:rows[0]["price"],
                    title:rows[0]["title"],
                    description:rows[0]["description"],
                    front_image:rows[0]["front_image"],
                    back_image:rows[0]["back_image"],
                    first_name:rows[0]["first_name"],
                    last_name:rows[0]["last_name"],
                    keyword:rows[0]["keyword"],
                    id:rows[0]["id"],
                    out_of_stock:rows[0]["out_of_stock"],
                    color:(rows[0]["color"] == null || rows[0]["color"] == "")?"NA":rows[0]["color"]
                }
                res.render('productDetails', {
                    meta_title: req.i18n.__(rows[0]["title"]),
                    desc: rows[0]["description"],
                    keyword: rows[0]["keyword"],
                    i18n: req.i18n,
                    geoip: geoip.lookup(global.formatIp(req)),
                    refiral_key: config.REFIRAL_KEY,
                    base: config.APP_DOMAIN,
                    user: req.user,
                    options: config.renderOptions,
                    alldata:resultparams
                });
            } else {
                    res.status(404).render('error', {
                        message: "Product not Found",
                        error: {stack: "We can't find the requested page.", status: 404},
                        title: "Error - File Not Found",
                        i18n: req.i18n,
                        geoip: geoip.lookup(global.formatIp(req)),
                        refiral_key: config.REFIRAL_KEY,
                        user: req.user,
                        base: config.APP_DOMAIN,
                        options: config.renderOptions
                    });
            }
        })
        .error(function (err) {
            res.status(404).render('error', {
                message: "Product not Found",
                error: {stack: "We can't find the requested page.", status: 404},
                title: "Error - File Not Found",
                i18n: req.i18n,
                geoip: geoip.lookup(global.formatIp(req)),
                refiral_key: config.REFIRAL_KEY,
                user: req.user,
                base: config.APP_DOMAIN,
                options: config.renderOptions
            });
        }).execute();

    
};

exports.changeUserType = function(req,res,next){
    var userid = req.body.userid;
    console.log("Userid",userid)
    easydb(dbPool)
        .query(function () {
            return {
                query: "update users set usertype = 'DESIGNER' where id = ?",
                params: [userid]
            };
        })
        .success(function (rows) {
            req.user.usertype='DESIGNER';
            res.send({status:200})

        }).execute();
};

exports.addAccount = function(req,res){
if(req.user){
    if(req.body.type == "PAYPAL" || req.body.type == "UPI"){
        easydb(dbPool)
        .query(function () {
            return {
                query: "select * from short_payment where userid = ? AND pay_id = ?",
                params: [req.user.id,req.body.pay_id]
            };
        })
        .success(function (rows) {
            if(rows.length > 0){
                res.send({status:200,alreadyadded:'1'})
            }else{
                easydb(dbPool).query(function () {
                    return {
                        query: "Insert into short_payment (userid,pay_method,pay_id) VALUE(?,?,?)",
                        params: [req.user.id,req.body.type,req.body.pay_id]
                    };
                })
                .success(function (rows) {
                    res.send({status:200})
                }).execute();
            }
            
        }).execute();
    }else if(req.body.type == "BANKACCOUNT"){
        easydb(dbPool)
        .query(function () {
            return {
                query: "select * from long_payment where userid = ? AND ac_num = ?",
                params: [req.user.id,req.body.ac_num]
            };
        })
        .success(function (rows) {
            if(rows.length > 0){
                res.send({status:200,alreadyadded:'1'})
            }else{
                easydb(dbPool)
                .query(function () {
                    return {
                        query: "Insert into long_payment (userid,ac_num,bname,ifsc,pay_method) VALUE(?,?,?,?,?)",
                        params: [req.user.id,req.body.ac_num,req.body.bname,req.body.ifsc,req.body.type]
                    };
                })
                .success(function (rows) {
                    res.send({status:200})

                }).execute();
            }
        }).execute();
    }else{
        res.send({status:500})
    }
}else{
    res.send({status:500})
}
};

exports.requestMoney = function(req,res){
    if(req.user){
        var amount = req.body.amount;
        var payment = req.body.payment;
        var type_id = payment.split("-");
        var type = type_id[0];
        var id = type_id[1];
        var profitcalculated = 0;
        var pendingcashout = 0;
        var paidtodate = 0;
        easydb(dbPool).query(function () {
            return {
                query: "SELECT r.status,r.amount_request FROM revenue AS r LEFT JOIN long_payment AS lp ON r.long_payment_id = lp.ID LEFT JOIN short_payment AS sp ON r.short_payment_id = sp.ID LEFT JOIN users AS u ON r.userid = u.id WHERE r.userid = ?",
                params: [req.user.id]
            };
        })
        .success(function (shoppingrows) {
            if(shoppingrows.length > 0){
                for(var i=0;i<shoppingrows.length;i++){
                    if(shoppingrows[i]["status"] == 'PENDING'){
                        pendingcashout += parseInt(shoppingrows[i]["amount_request"])
                    }else{
                        paidtodate += parseInt(shoppingrows[i]["amount_request"])
                    }
                }
            }
            easydb(dbPool).query(function () {
                return {
                   // query: "SELECT SUM(IFNULL(opc.new_price,opc.price) - (op.base_price * (opc.small+opc.medium+opc.large+opc.xl+opc.doublexl)))AS profit FROM shopping_cart_items AS sci LEFT JOIN shopping_carts sc ON sci.shopping_cart_id = sc.id  INNER JOIN purchased_items AS pui ON pui.shopping_cart_id = sci.shopping_cart_id LEFT JOIN user_other_products_custom  opc ON opc.id = sci.item_id LEFT JOIN other_product_details  opd ON opd.id = opc.base_product_id  LEFT JOIN other_products  op ON op.id = opd.other_product_id WHERE sci.item_id IN(SELECT id FROM user_other_products_custom WHERE base_product_id IN( SELECT id FROM other_product_details WHERE user_id = ? )) AND sci.item_type = 'CUSTOM' AND sc.status = 'PURCHASED'",
                    query: "SELECT SUM(IFNULL(opc.new_price,opc.price) - (op.base_price * (opc.small+opc.medium+opc.large+opc.xl+opc.doublexl)))AS profit FROM shopping_cart_items AS sci LEFT JOIN shopping_carts sc ON sci.shopping_cart_id = sc.id INNER JOIN purchased_items AS pui ON pui.shopping_cart_id = sci.shopping_cart_id LEFT JOIN user_other_products_custom  opc ON opc.id = sci.item_id LEFT JOIN other_product_details  opd ON opd.id = opc.base_product_id INNER JOIN shipping_status ss ON ss.purchased_id = pui.id LEFT JOIN other_products  op ON op.id = opd.other_product_id WHERE sci.item_id IN(SELECT id FROM user_other_products_custom WHERE base_product_id IN( SELECT id FROM other_product_details WHERE user_id = ? )) AND sci.item_type = 'CUSTOM' AND sc.status = 'PURCHASED' AND ss.shipment_status = 'delivered_freeze'",
                    params: [req.user.id]
                };
            })
            .success(function (profit) {
                if(profit[0]["profit"] >= 0){
                    profitcalculated = profit[0]["profit"];
                }
                var balance = profitcalculated - paidtodate - pendingcashout;
                if(balance < amount){
                    res.send({status:201})
                }else{
                    if(type == "PAYPAL" || type == "UPI"){
                        easydb(dbPool).query(function () {
                            return {
                                query: "Insert into revenue(short_payment_id,amount_request,status,userid) VALUE(?,?,?,?)",
                                params: [id,amount,'PENDING',req.user.id]
                            };
                        })
                        .success(function (rows) {
                            res.send({status:200})
                        }).execute();
                    }else if(type == "BANKACCOUNT"){
                        easydb(dbPool).query(function () {
                            return {
                                query: "Insert into revenue(long_payment_id,amount_request,status,userid) VALUE(?,?,?,?)",
                                params: [id,amount,'PENDING',req.user.id]
                            };
                        })
                        .success(function (rows) {
                            res.send({status:200})
                        }).execute();
                    }else{
                        res.send({status:500})
                    }
                }

            }).execute();
        }).execute();
    }else{
        res.send({status:500})
    }
};

exports.getPaymentMethod = function(req,res){
    if(req.user){
        var paymethod = {};
        easydb(dbPool)
        .query(function(){
            return {
                query: "SELECT * from long_payment where userid =  ? ",
                params: [req.user.id]
            };
        })
        .success(function(rows){
            if(rows.length > 0){
                paymethod["long_payment"] = rows;
            }else{
                paymethod["long_payment"] = null;
            }
        }).query(function(){
            return {
                query: "SELECT * from short_payment where userid =  ? ",
                params: [req.user.id]
            };
        })
        .success(function(rows){
            if(rows.length > 0){
                paymethod["short_payment"] = rows;
            }else{
                paymethod["short_payment"] = null;
            }
            res.send({status:200,paymethod:paymethod})
        }).execute();
    }
}

exports.getCashout = function(req,res){
    if(req.user){
        var cashout;
        easydb(dbPool)
        .query(function(){
            return {
                query: "SELECT r.*,lp.ac_num,lp.bname,lp.ifsc,lp.pay_method AS long_pay_method,sp.pay_method AS short_pay_method,sp.pay_id,u.first_name,u.last_name,u.email FROM revenue AS r LEFT JOIN long_payment AS lp ON r.long_payment_id = lp.ID LEFT JOIN short_payment AS sp ON r.short_payment_id = sp.ID LEFT JOIN users AS u ON r.userid = u.id where r.userid = ?",
                params: [req.user.id]
            };
        })
        .success(function(rows){
            if(rows.length > 0){
                cashout = rows;
                res.send({status:200,cashout:cashout})
            }else{
                cashout = [];
                res.send({status:200,cashout:cashout})
            }
        }).error(function(msg){
            res.send({status:500,msg:msg})
        }).execute();
    }
}

exports.removePaymentMethod = function(req,res,next){
    console.log(req.body)
    if(req.body.payment_type !="" && req.body.id !=""){
    if(req.body.payment_type == 'short_payment'){
        easydb(dbPool)
        .query(function () {
            return {
                query: "Delete from short_payment  where ID = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            res.send({status:200})
        }).execute();
    }else{
        easydb(dbPool)
        .query(function () {
            return {
                query: "Delete from long_payment  where ID = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            res.send({status:200})
        }).execute();
    }
    }else{
        res.send({status:500})
    }
    
};

exports.getSizeChart = function(req,res){
        var sizechart;
        easydb(dbPool)
        .query(function(){
            return {
                query: "SELECT sc.*,op.chest_size_id,op.body_size_id, op.should_size_id FROM other_product_details AS opd LEFT JOIN other_products op ON op.id = opd.other_product_id LEFT JOIN size_chart AS sc ON sc.id = op.chest_size_id OR sc.id = op.body_size_id OR sc.id = op.should_size_id WHERE opd.id = ?",
                params: [req.body.id]
            };
        })
        .success(function(rows){
            if(rows.length > 0){
                sizechart = rows;
                res.send({status:200,sizechart:sizechart})
            }else{
                sizechart = [];
                res.send({status:200,sizechart:sizechart})
            }
        }).error(function(msg){
            res.send({status:500,msg:msg})
        }).execute();
}

exports.checkPinCode = function(req,res){
        easydb(dbPool)
        .query(function(){
            return {
                query: "SELECT COUNT(id) as num FROM pincode WHERE pincode=?",
                params: [req.body.pincode]
            };
        })
        .success(function(rows){
            if(rows[0]["num"] > 0){
                res.send({status:200,valid:1})
            }else{
                res.send({status:200,valid:0})
            }
        }).error(function(msg){
            res.send({status:500,msg:msg})
        }).execute();
}
exports.requestReturn = function(req,res){
    easydb(dbPool)
    .query(function(){
        return {
            query: "SELECT * FROM order_return WHERE purchased_id=?",
            params: [req.body.id]
        };
    })
    .success(function(rows){
        if(rows.length > 0){
            res.send({status:200,already:1})
        }else{
            easydb(dbPool)
            .query(function(){
                return {
                    query: "insert into order_return (purchased_id,reason) value(?,?)",
                    params: [req.body.id,req.body.reason]
                };
            }).execute();
            res.send({status:200,already:0})
        }
    }).error(function(msg){
        res.send({status:500,msg:msg})
    }).execute();
}
exports.requestCancel = function(req,res){
    easydb(dbPool)
    .query(function(){
        return {
            query: "SELECT * FROM order_cancel WHERE purchased_id=?",
            params: [req.body.id]
        };
    })
    .success(function(rows){
        if(rows.length > 0){
            res.send({status:200,already:1})
        }else{
            easydb(dbPool)
            .query(function(){
                return {
                    query: "insert into order_cancel (purchased_id,reason) value(?,?)",
                    params: [req.body.id,req.body.reason]
                };
            }).execute();
            res.send({status:200,already:0})
        }
    }).error(function(msg){
        res.send({status:500,msg:msg})
    }).execute();
}

exports.applyCoupan = function(req,res){
    if(req.user){
        var coupan = req.body.code;
        easydb(dbPool).query(function(){
            return {
                query: "SELECT c.*,opd.price,opd.other_product_id  FROM coupancode AS c LEFT JOIN other_product_details opd ON opd.id = c.other_product_detail_id WHERE c.code=? AND opd.isdeleted = '0'",
                params: [coupan]
            };
        }).success(function(coupanrows){
            if(coupanrows.length > 0){
                var coupandetails = coupanrows[0];
                getCartItems(req.user.id, function (err, items){
                    if (err){
                        res.send(err);
                    } else {
                        var ids = [];
                        var shopping_cart_ids = {};
                        var qry = "SELECT id,user_id,base_product_id,price,new_price,coupan_applied FROM user_other_products_custom  WHERE user_other_products_custom.id IN(";
                       // res.send({items: items, status: 200});
                        items.forEach(function(val){
                            ids.push(val.item_id);
                            shopping_cart_ids[val.item_id] = val.shopping_cart_id;
                        });
                        qry += ids.join(",");
                        qry += ")";
                        easydb(dbPool)
                        .query(function () {
                            return {
                                query: qry,
                                params: []
                            };
                        })
                        .success(function (rows) {
                            console.log("Rows: ",rows);
                            console.log("coupandetails",coupandetails);

                            if(rows.length > 0){
                                var updateflag = 0;
                                rows.forEach(function(prodata,i){
                                    if(prodata["base_product_id"] == coupandetails["other_product_detail_id"] && prodata["coupan_applied"] == 0){
                                        updateflag = 1;
                                        console.log("here ",shopping_cart_ids[prodata.id],prodata.id)
                                        var coupandeduct = Math.floor((Number(prodata["price"])*(Number(coupandetails["percent"])/100)));
                                        var new_price = (Number(prodata["price"]) - coupandeduct).toFixed(2); //Function to retrieve product price: for now 350 rupees
                                        updatePriceStatus(new_price,shopping_cart_ids[prodata.id],prodata.id);
                                    }
                                })
                                setTimeout(function(){
                                    if(updateflag == 1){
                                        res.send({msg:"Coupon Code Applied with "+coupandetails["percent"]+" % Discount",status:200});
                                    }else{
                                        res.send({msg:"Coupon Code Already Applied with "+coupandetails["percent"]+" % Discount",status:500});
                                    }
                                },1000)
                            }else{
                                res.send({msg:"Invalid coupon code",status:500});
                            }
                        })
                        .error(function (err) {
                            console.log("Erroer",err);
                            res.send({msg: err.message, status: 500});
                        }).execute();
                    }
                });
            }else{
                res.send({msg:"Invalid coupon code",status:500});
            }
        }).execute();
        
    }else{
        res.send({msg:"Invalid Request",status:500});
    }
}

exports.getCoupan = function(req,res){
    var coupan = req.body.code;
    easydb(dbPool).query(function(){
        return {
            query: "SELECT c.*,opd.price,opd.other_product_id  FROM coupancode AS c LEFT JOIN other_product_details opd ON opd.id = c.other_product_detail_id WHERE c.code=? AND opd.isdeleted = '0'",
            params: [coupan]
        };
    }).success(function(coupanrows){
            res.send({status:200,coupandetail:coupanrows})
    }).execute();
}

function updatePriceStatus(price,shop_id,item_id){
    easydb(dbPool)
        .query(function(){
            return {
                query: "update user_other_products_custom set new_price = ? ,coupan_applied = 1  where id = ?",
                params: [price,item_id]
            };
        }).query(function(){
            return {
                query: "update shopping_carts set price = ?  where id = ?",
                params: [price,shop_id]
            };
        }).execute();
}