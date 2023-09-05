/**
 * Created by DesignerBe on 22-01-2020.
 */

var geoip = require('geoip-lite');
var crypto = require('crypto');

exports.get = function (req, res) {
    preCheck(req, res, req.query.id, req.query.email, req.query.rand, function () {
        res.status(200).render('resetPassword', {
            title: "Reset Password",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        });
    }, function (message, err) {
        res.status(500).render('error', {
            message: message,
            error: err,
            title: "Error",
            i18n: req.i18n,
            geoip: geoip.lookup(global.formatIp(req)),
            refiral_key: config.REFIRAL_KEY,
            base: config.APP_DOMAIN,
            user: req.user,
            options: config.renderOptions
        });
    });
};

exports.post = function (req, res) {
    preCheck(req, res, req.body.id, req.body.email, req.body.rand, function () {
        var salt = req.body.salt;
        var md5_password = req.body.md5_password;
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "UPDATE users SET salt = ?, md5_password = ? WHERE email=?",
                        params: [salt, md5_password, req.body.email]
                    };
                })
                .success(function (rows) {
                    if (rows.affectedRows > 0) {
                        res.send({status: 200});
                    } else {
                        res.send({status: 500, msg: "Can't update password."});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({status: 500, msg: err});
                }).execute({transaction: true});
    }, function (message, err) {
        res.send({status: 500, msg: message});
    });
};

function getNewRandomNumber(min, max) {
    return Math.round((Math.random() * (max - min)) + min);
}

function preCheck(req, res, id, email, rand, callback, errCallback) {
    easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT email FROM users WHERE email=?",
                    params: [email]
                };
            })
            .success(function (rows) {
                if (rows.length > 0) {
                    var random = id;
                    var hex = crypto.createHash("md5")
                            .update(email + ":" + rows[0].md5_password + ":" + rows[0].salt + ":" + random)
                            .digest("hex");
                    if (hex == rand) {
                        callback();
                    } else {
                        errCallback("Invalid request", new Error("Invalid request."));
                    }
                } else {
                    errCallback("Invalid request", new Error("No user with this email ID."));
                }
            })
            .error(function (err) {
                logger.error(err);
                errCallback(err, err);
            }).execute({transaction: true});
}