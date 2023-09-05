
exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM shipping_address WHERE user_id = ? AND show_in_list = 1",
                    params: [req.user.id]
                };
            })
            .success(function (rows) {
                res.send({addresses: rows, status: 200});
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
};