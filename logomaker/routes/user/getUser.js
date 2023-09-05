/**
 * Created by DesignerBe on 05-05-2020.
 */

exports.index = function (req, res) {
    if (req.user) {
        if (req.user.email == req.body.email) {
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT * FROM users WHERE email=?",
                        params: [username]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){
                        delete rows[0].md5_password;
                        delete rows[0].salt;
                        res.send({user: rows[0], status: 200});
                    } else {
                        res.send({msg: "No user found", status: 500});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
        } else {
            res.send(403);
        }
    } else {
        res.send(403);
    }
};