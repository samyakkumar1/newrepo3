/**
 * Created by Harikrishnan on 20-01-2015.
 */

var crypto = require('crypto');
exports.index = function (req, res) {
    console.log("Forgot password called")
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT email, first_name FROM users WHERE email=?",
                params: [req.body.email]
            };
        })
        .success(function (rows) {
            console.log("Rows : ",rows)
            if (rows.length > 0) {
                var salt;
                var random = Math.random();
                var hex = crypto.createHash("md5")
                    .update(req.body.email + ":" + req.body.md5_password + ":" + req.body.salt + ":" + random)
                    .digest("hex");
                sendMail('forgotPassword', {
                    url: config.APP_DOMAIN + "/resetPassword?email=" + req.body.email + "&id=" + random + "&rand=" + hex,
                    name: rows[0].first_name == null ? " " : rows[0].first_name
                }, {from: config.emailConfig.auth.user, to: req.body.email, subject: 'Tagbit.co password reset'}, function (){
                    res.send({status: 200});
                }, function (err) {
                    console.log("Error in send mail ",err)
                    res.send({status: 500, msg: err});
                });
            } else {
                res.send({status: 500, msg: "No user with this email ID"});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({status: 500, msg: err});
        }).execute({transaction: true});
};