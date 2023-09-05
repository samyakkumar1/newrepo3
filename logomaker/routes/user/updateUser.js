/**
 * Created by Harikrishnan on 05-10-2014.
 */


exports.index = function (req, res) {
    if (req.user) {
        updateUser(req.body.first_name, req.body.last_name, req.body.phone_num, req.body.address, req.body.country, req.body.city, req.body.state, req.body.postal_code, req.user.id, req.user.email, req.body.old_md5_password, function (err){
            if (err == undefined){
                delete req.body.md5_password;
                delete req.body.salt;
                delete req.body.old_md5_password;
                req.body.id = req.user.id;
                req.body.email = req.user.email;
                acquireRedis(function (err, client) {
                    if (err) {
                        req.user.usertype = req.body.usertype;
                        res.send({status: 200, user: req.body});
                    } else {
                        req.user.usertype = req.body.usertype;
                        client.setex(req.user.id, config.SESSION_EXPIRY, JSON.stringify(req.body));
                        res.send({status: 200, user: req.body});
                        releaseRedis(client);
                    }
                });
            } else {
                res.send(err);
            }
        });
    } else {
        res.send(403);
    }
};

function updateUser(first_name, last_name, phone_num, address, country, city, state, postal_code, user_id, user_email, old_md5_password, callback){
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE `users` SET `first_name` = ?, `last_name` = ?, `phone_num` = ?, `address` = ?, `country` = ?, `city` = ?, `state` = ?, `postal_code` = ?, verified = '1' WHERE `id` = ? AND `email` = ? AND `md5_password` = ?",
                params: [first_name, last_name, phone_num, address, country, city, state, postal_code, user_id, user_email, old_md5_password]
            };
        })
        .success(function (rows) {
            if (rows.affectedRows > 0) {
                callback(undefined);
            } else {
                callback({status: 500, msg: "No changes made."});
            }
        })
        .error(function (err) {
            logger.error(err);
            callback({msg: err.message, status: 500});
        }).execute();
}

global.updateUser = updateUser;