/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT `md5_password`, `id`, `email`, `first_name`, `last_name`, `phone_num`, `address`, `country`, `city`, `state`, `postal_code` FROM users WHERE email LIKE ? ORDER BY regd_at DESC LIMIT 0, ?",
                params: [req.query.email ? '%' + req.query.email.trim() + '%' : '%', req.query.limit ? parseInt(req.query.limit) : 10]
            };
        })
        .success(function (rows) {
            res.send({status: 200, users: rows});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};