
exports.addCountry = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "INSERT INTO `countries` (`country`,`currency`,`code`) VALUES (?, ?, ?)",
                params: [req.body.name, req.body.currency, req.body.code]
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

exports.updateCountry = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE `countries` SET `country` = ?, `currency` = ?, `code` = ? WHERE `id` = ?",
                params: [req.body.name, req.body.currency, req.body.code, req.body.id]
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

exports.deleteCountry = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "DELETE FROM `countries` WHERE id = ?",
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