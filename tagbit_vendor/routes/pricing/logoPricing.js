
exports.addLogoPrice = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "INSERT INTO `logo_pricing` (`country` ,`price` ,`color_changes`) VALUES (?, ?, ?);",
                params: [req.body.country, req.body.price, req.body.color_changes]
            };
        })
        .success(function (rows) {
            res.send({insertId: rows.insertId, status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};

exports.updateLogoPrice = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE `logo_pricing` SET `country` = ?, `price` = ?, `color_changes` = ? WHERE `id` = ?",
                params: [req.body.country, req.body.price, req.body.color_changes, req.body.id]
            };
        })
        .success(function (rows) {
            res.send({status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};

exports.deleteLogoPrice = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "DELETE FROM `logo_pricing` WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            res.send({status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};