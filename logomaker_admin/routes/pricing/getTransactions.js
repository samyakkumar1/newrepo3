
exports.index = function (req, res, next) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT users.id AS user_id, users.email AS user_email, shipping_address.first_name, GROUP_CONCAT(DISTINCT shipping_address.phone_number SEPARATOR ', ') as phone_num, shipping_address.last_name, shipping_address.email_address as email, transactions.payment_gateway, transactions.id, transactions.transaction_id, transactions.status, transactions.failure_details, transactions.timestamp FROM users INNER JOIN transactions ON users.id = transactions.user_id INNER JOIN shipping_address ON transactions.user_id = shipping_address.user_id group by shipping_address.user_id, transactions.id ORDER BY timestamp DESC LIMIT ?, ?",
                params: [req.body.start ? parseInt(req.body.start) : 0, 20]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({transactions: rows, status: 200});
            } else {
                res.send({msg: "No transactions found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};
