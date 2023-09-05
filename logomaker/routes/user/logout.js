/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    if (req.user) {
        acquireRedis(function (err, client) {
            if (err) {
                req.logOut();
                req.logout();
                res.send({status: 500, msg: "redis acquire failed"});
            } else {
                client.del(req.user.id, function (r_err, reply) {
                    req.logOut();
                    req.logout();
                    res.clearCookie('userInfo');
                    res.clearCookie('user');
                    req.session.destroy(function (err){
                        if (err || r_err) {
                            logger.error(err);
                            logger.error(r_err);
                            res.send({status: 500, msg: "Logout failed: " + r_err.message || err.message});
                        } else {
                            res.send({status: 200});
                        }
                    });
                });
                releaseRedis(client);
            }
        });
    } else {
        res.send(200, {msg: "User not logged in"});
    }
};