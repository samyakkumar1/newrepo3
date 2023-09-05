var login = require("./login");

exports.index = function (req, res) {
    if (req.headers.referer.indexOf(config.ADMIN_APP_DOMAIN) >= 0) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM users WHERE email = ?",
                    params: [req.body.emailid]
                };
            })
            .success(function (rows) {
                if (rows.length > 0) {
                    if (req.body.md5_secret != rows[0].md5_password) {
                        res.status(404);
                    } else {
                        var user = rows[0];
                        delete user.md5_password;
                        delete user.salt;
                        req.logOut();
                        req.logout();
                        req.logIn(user, function (err) {
                            if (err) {
                                return res.send({status: 500, msg: err});
                            } else {
                                res.cookie('userInfo', JSON.stringify(user)).redirect("/");
                            }
                        });
                    }
                }
            })
            .error(function (err) {
                logger.error(err);
                res.status(404);
            })
            .execute({transaction: true});
    } else {
        logger.error("Fake login call from " + req.headers.referer);
        res.status(404);
    }
};