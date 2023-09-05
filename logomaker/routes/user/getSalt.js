/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {query: "SELECT salt FROM users WHERE email=?", params: [req.body.email]};
        })
        .success(function (rows) {
            if (rows.length > 0)
            {
                res.send({status: 200, salt: rows[0].salt});
            }
            else
            {
                res.send({status: 401, msg: "Incorrect username or password."});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};