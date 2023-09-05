
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT DISTINCT users.id AS user_id, shipping_address.email_address, shipping_address.phone_number, CONCAT(shipping_address.first_name, ' ', shipping_address.last_name) AS name, shipping_address.address1, shipping_address.address2, shipping_address.city, shipping_address.state, shipping_address.country, shipping_address.postal_code FROM users INNER JOIN shipping_address ON users.id = shipping_address.user_id WHERE user_id = ?",
                params: [req.query.id]
            };
        })
        .success(function (rows) {
            res.send({status: 200, details: rows});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};