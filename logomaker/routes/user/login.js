/**
 * Created by DesignerBe on 05-10-2020.
 */

var     passport = require('passport'),
        mysql = require('mysql'),
        LocalStrategy = require('passport-local').Strategy;

exports.setUser = function (user, done) {
    acquireRedis(function (err, client) {
        if (err) {
            done(err);
        } else {
            client.setex(user.id, config.SESSION_EXPIRY, JSON.stringify(user));
            done(null, user.id);
            releaseRedis(client);
        }
    });
};


passport.serializeUser(exports.setUser);

passport.deserializeUser(function (id, done) {
    acquireRedis(function (err, client) {
        if (err) {
            done(err);
        } else {
            client.get(id, function (err, reply) {
                if (err) {
                    done(err);
                } else {
                    client.expire(id, config.SESSION_EXPIRY);
                    done(null, JSON.parse(reply));
                }
            });
            releaseRedis(client);
        }
    });
});

passport.use(new LocalStrategy({
    usernameField: 'emailid',
    passwordField: 'md5_secret'
}, function (username, password, done) {
    var retValue;
    easydb(dbPool)
            .query(function () {
                return {
                    query: "UPDATE users SET last_login_time = CURRENT_TIMESTAMP WHERE email = ? AND md5_password = ? AND verified = 1",
                    params: [username, password]
                };
            })
            .success(function (rows) {
                if (rows.affectedRows <= 0) {
                    retValue = done(null, false, {message: 'Incorrect username or password.'});
                    throw new Error("Incorrect username or password.");
                }
            })
            .query(function () {
                return {
                    query: "SELECT * FROM users WHERE email=?",
                    params: [username]
                };
            })
            .success(function (rows) {
                if ((rows.length > 0) && (rows[0].md5_password == password)) {
                    var user = rows[0];
                    delete user.md5_password;
                    delete user.salt;
                    retValue = done(null, user);
                } else {
                    retValue = done(null, false, {message: 'Incorrect username or password.'});
                }
            })
            .error(function (err) {
                logger.error(err);
                retValue = done(err);
            })
            .done(function () {
                return retValue;
            }).execute({transaction: true});
}));

exports.index = function (req, res) {
    if (req.user) {
        logger.error("Login request arrived when user already logged in");
    }
    req.logout();
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return res.send({status: 500, msg: err});
        }
        if (!user) {
            return res.send({status: 401, msg: info.message});
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.send({status: 500, msg: err});
            } else {
                res.send({status: 200, user: user});
                return true;
            }
        });
    })(req, res);
};