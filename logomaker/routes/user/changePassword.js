/**
 * Created by DesignerBe on 07-01-2020.
 */

exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "UPDATE `users` SET `md5_password` = ?, `salt` = ? WHERE `id` = ? AND `email` = ? AND `md5_password` = ?",
                    params: [req.body.md5_password, req.body.salt, req.user.id, req.user.email, req.body.old_md5_password]
                };
            })
            .success(function (rows) {
                if (rows.affectedRows > 0) {
                    res.send({status: 200});
                } else {
                    res.send({status: 500, msg: "The current password you entered is wrong."});
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
};