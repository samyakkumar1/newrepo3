exports.index = function (req, res) {
    if (req.user) {
        getLatestShoppingCartId(req.user.id, function (id) {
            var insertId;
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "INSERT INTO  `shipping_address` (`user_id`, `email_address` ,`phone_number` ,`first_name` ,`last_name` ,`address1` ,`address2` ,`city` ,`state` ,`country` ,`postal_code` ,`show_in_list`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                        params: [req.user.id, req.body.email_id, req.body.phone_num, req.body.first_name, req.body.last_name, req.body.address_1, req.body.address_2, req.body.city, req.body.state, req.body.country, req.body.postal_code, req.body.show_in_list, id]
                    };
                })
                .success(function (rows) {
                    insertId = rows.insertId;
                })
                .query(function () {
                    return {
                        query: "UPDATE `shopping_carts` SET `shipping_address_id` =  ? WHERE `id` = ?",
                        params: [insertId, id]
                    };
                })
                .success(function (rows) {
                    if (rows.affectedRows > 0) {
                        res.send({status: 200});
                    } else {
                        res.send({msg: "No rows updated", status: 500});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
        }, function (err) {
            res.send(err);
        });
    } else {
        addUser(req.body.email_id, req.body.md5_password, req.body.salt, function (err, userId) {
            if (err) {
                res.send(err);
            } else {
                updateUser(req.body.first_name, req.body.last_name, req.body.phone_num, req.body.address_1 + "\n" + req.body.address_2, req.body.country, req.body.city, req.body.state, req.body.postal_code, userId, req.body.email_id, req.body.md5_password, function (err) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send({status: 200});
                    }
                });
            }
        }, true)
    }
};

exports.updateDetailsWithAddress = function (req, res) {
    if (req.user) {
        getLatestShoppingCartId(req.user.id, function (id) {
            var insertId = req.body.selected_shipping_id;

            easydb(dbPool)
                .query(function () {
                    return {
                        query: "Update shipping_address set email_address = ? ,phone_number = ? , first_name = ? ,last_name = ? , address1 = ? , address2 = ? , city = ? , state = ? , country = ? , postal_code = ? where id = ?",
                        params: [req.body.email_id, req.body.phone_num, req.body.first_name, req.body.last_name, req.body.address_1, req.body.address_2, req.body.city, req.body.state, req.body.country, req.body.postal_code, insertId]
                    };
                })
                .success(function (rows) {
                })
                .query(function () {
                    return {
                        query: "UPDATE `shopping_carts` SET `shipping_address_id` =  ? WHERE `id` = ?",
                        params: [insertId, id]
                    };
                })
                .success(function (rows) {
                    if (rows.affectedRows > 0) {
                        res.send({status: 200});
                    } else {
                        res.send({msg: "No rows updated", status: 500});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
        }, function (err) {
            res.send(err);
        });
    } else {
        addUser(req.body.email_id, req.body.md5_password, req.body.salt, function (err, userId) {
            if (err) {
                res.send(err);
            } else {
                updateUser(req.body.first_name, req.body.last_name, req.body.phone_num, req.body.address_1 + "\n" + req.body.address_2, req.body.country, req.body.city, req.body.state, req.body.postal_code, userId, req.body.email_id, req.body.md5_password, function (err) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send({status: 200});
                    }
                });
            }
        }, true)
    }
};
