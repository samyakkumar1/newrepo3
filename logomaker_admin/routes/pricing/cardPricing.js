
exports.addCardPrice = function (req, res) {
    var db = easydb(dbPool);
    db
        .query(function () {
            return {
                query: "INSERT INTO `vc_pricing` (`country`, `finish`, `qty`, `premium`, `back_side`, `super_premium`, `back_side_super_premium`, `std_shipping`, `exp_shipping`, `card_design`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                params: [req.body.country, req.body.finish, req.body.qty, req.body.premium, req.body.back_side, req.body.super_premium, req.body.back_side_super_premium, req.body.std_shipping, req.body.exp_shipping, req.body.card_design]
            };
        })
        .success(function (rows) { 
            if (req.body.same_for_all){ 
                db.query(function () {
                    return {
                        query: "UPDATE`vc_pricing` SET `card_design` = ? WHERE `country` = ?",
                        params: [req.body.card_design, req.body.country]
                    };
                }).success(function (rows) { 
                    res.send({insertId: rows.insertId, status: 200});
                });
            } else {
                res.send({insertId: rows.insertId, status: 200});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
};

exports.updateCardPrice = function (req, res) {
    var db = easydb(dbPool);
    db
        .query(function () {
            return {
                query: "UPDATE `vc_pricing` SET `country` = ?, `finish` = ?, `qty` = ?, `premium` = ?, `back_side` = ?, `super_premium` = ?, `back_side_super_premium` = ?, `std_shipping` = ?, `exp_shipping` = ?, `card_design` = ? WHERE `id` = ?",
                params: [req.body.country, req.body.finish, req.body.qty, req.body.premium, req.body.back_side, req.body.super_premium, req.body.back_side_super_premium, req.body.std_shipping, req.body.exp_shipping, req.body.card_design, req.body.id]
            };
        })
        .success(function (rows) {
            if (req.body.same_for_all){
                db.query(function () {
                    return {
                        query: "UPDATE`vc_pricing` SET `card_design` = ? WHERE `country` = ?",
                        params: [req.body.card_design, req.body.country]
                    };
                }).success(function (rows) { 
                    res.send({status: 200});
                });
            } else {
                res.send({status: 200});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};

exports.deleteCardPrice = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "DELETE FROM `vc_pricing` WHERE id = ?",
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