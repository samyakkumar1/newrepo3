/**
 * Created by DesignerBe on 12-12-2020.
 */

emailTemplates = require('email-templates');
exports.index = function (req, res) {
    if (req.user) {
        emailTemplates(emailTemplatesDir, function (err, template) {
            if (err) {
                logger.error(err);
                res.send({status: 500, msg: "Error getting email templates."});
            } else {
                sendMail('logoDownload', {company: req.body.company, name: req.body.name}, {from: config.emailConfig.auth.user, to: req.user.email, subject: 'Logo for ' + req.body.company, attachments: [{path: req.body.data}]}, function (){
                    res.send({status: 200});
                }, function (err) {
                    res.send({status: 500, msg: err});
                });
                sendMail('logoDownload', {company: req.body.company, name: req.body.name}, {from: config.emailConfig.auth.user, to: config.emailConfig.auth.user, subject: req.user.email + ' downloaded logo for ' + req.body.company}, function (){

                }, function (err) {
                    logger.error(err);
                });
                easydb(dbPool)
                    .query(function () {
                        return {
                            query: "INSERT INTO `download_logos` (`user_id`, `logo_id`, `downloaded_time`) VALUES (?, ?, CURRENT_TIMESTAMP);",
                            params: [req.user.id, req.body.id]
                        };
                    })
                    .error(function (err) {
                        logger.error(err);
                    }).execute();
            }
        });
    } else {
        res.send(403);
    }
};

/*
emailTemplates = require('email-templates');
var FB = require('fb');
var Step = require('step');

FB.options(config.facebook);

exports.index = function (req, res, next) {
    if (req.user) {
        var accessToken = req.session.access_token;
        req.session.logo = {
            company: req.body.company,
            name: req.body.name,
            data: req.body.data,
            id: req.body.id
        };
        if(!accessToken) {
            res.send({loginUrl: FB.getLoginUrl({ scope: 'publish_actions' }), status: 201});
        } else {
            res.send({status: 200});
        }
    } else {
        res.send(403);
    }
};

exports.loginCallback = function (req, res, next) {
    var code = req.query.code;

    if(req.query.error) {
        // user might have disallowed the app
        return res.send('login-error ' + req.query.error_description);
    } else if(!code) {
        return res.redirect('/shareToFb?rand=' + Math.random());
    }

    Step(function exchangeCodeForAccessToken() {
            FB.napi('oauth/access_token', {
                client_id:      FB.options('appId'),
                client_secret:  FB.options('appSecret'),
                redirect_uri:   FB.options('redirectUri'),
                code:           code
            }, this);
        },
        function extendAccessToken(err, result) {
            if(err) throw(err);
            FB.napi('oauth/access_token', {
                client_id:          FB.options('appId'),
                client_secret:      FB.options('appSecret'),
                grant_type:         'fb_exchange_token',
                fb_exchange_token:  result.access_token
            }, this);
        },
        function (err, result) {
            if(err) {
                return next(err);
            } else {
                req.session.access_token = result.access_token;
                req.session.expires = result.expires || 0;
                return res.redirect('/shareToFb?rand=' + Math.random());
            }
        }
    );
};

exports.shareToFb = function (req, res) {
    FB.setAccessToken(req.session.access_token);
    var body = 'I just created this logo for free from https://www.tagbit.co';
    FB.api('me/feed', 'post', {message: body, picture: global.config.APP_DOMAIN + "/freeLogoImage?id=" + req.session.logo.id + "&rand=" + Math.random(), name: "My Free Logo Image from Tagbit.co. "}, function (fb_res) {
        if(!fb_res || fb_res.error) {
            res.status(500).send({status: 500, msg: fb_res});
        } else {
            emailTemplates(emailTemplatesDir, function (err, template) {
                if (err) {
                    logger.error(err);
                    res.send({status: 500, msg: "Error getting email templates."});
                } else {
                    sendMail('logoDownload', {company: req.session.logo.company, name: req.session.logo.name}, {from: config.emailConfig.auth.user, to: req.user.email, subject: 'Logo for ' + req.session.logo.company, attachments: [{path: req.session.logo.data}]}, function (){
                        sendMail('logoDownload', {company: req.session.logo.company, name: req.session.logo.name}, {from: config.emailConfig.auth.user, to: config.emailConfig.auth.user, subject: req.user.email + ' downloaded logo for ' + req.session.logo.company}, function (){
                            delete req.session.logo;
                        }, function (err) {
                            logger.error(err);
                        });
                        easydb(dbPool)
                            .query(function () {
                                return {
                                    query: "INSERT INTO `download_logos` (`user_id`, `logo_id`, `downloaded_time`) VALUES (?, ?, CURRENT_TIMESTAMP);",
                                    params: [req.user.id, req.body.id]
                                };
                            })
                            .success(function (rows) {
                                res.render('closeWindow');
                            })
                            .error(function (err) {
                                logger.error(err);
                            }).execute();
                    }, function (err) {
                        res.send({status: 500, msg: err});
                    });
                }
            });
        }
    });
};
    */