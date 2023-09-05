/**
 * Created by DesignerBe on 27-01-2020.
 */

var crypto = require('crypto');
exports.index = function (req, res) {
    if (req.body.email) {
        if (validateEmail(req.body.email)) {
            easydb(dbPool)
                    .query(function () {
                        return {
                            query: "INSERT INTO news_letter (`email`, `regd_at`) VALUES (?, CURRENT_TIMESTAMP)",
                            params: [req.body.email]
                        };
                    })
                    .success(function (rows) {
                        res.send({status: 200});
                        var hex = crypto.createHash("md5")
                                .update(req.body.email)
                                .digest("hex");
                        sendMail("newsLetterAck", {unsubscribe_link: config.APP_DOMAIN + "/unsubscribe?email=" + encodeURIComponent(req.body.email) + "&random=" + hex}, {to: req.body.email, subject: "Thank you for your subscription"});
                    })
                    .error(function (err) {
                        if (err.message.indexOf("ER_DUP_ENTRY") > -1) {
                            res.send({msg: "The email is already subscribed.", status: 500});
                        } else {
                            res.send({msg: err.message, status: 500});
                            logger.error(err);
                        }
                    }).execute();
        } else {
            res.send({msg: "No email specified", status: 500});
        }
    }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
