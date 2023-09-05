exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM purchased_items WHERE shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ? AND status = 'PURCHASED') AND id = ?",
                    params: [req.user.id, req.body.id]
                };
            })
            .success(function (item) {
                if (item.length > 0) {
                    if (item[0].type == "LOGO") {
                        easydb(dbPool)
                            .query(function () {
                                return {
                                    query: "SELECT base_logo_id FROM user_logos WHERE id = ? AND user_id = ?",
                                    params: [item[0].base_item_id, req.user.id]
                                };
                            })
                            .success(function (rows) {
                                if (rows.length > 0) {
                                    item[0].base_logo_id = rows[0].base_logo_id;
                                } else {
                                    throw new Error("Invalid Logo ID: " + req.body.id);
                                }
                            })
                            .query(function () {
                                return {
                                    query: "SELECT url FROM logos WHERE id = ?",
                                    params: [item[0].base_logo_id]
                                };
                            })
                            .success(function (rows) {
                                if (rows.length > 0){
                                    item[0].base_logo_url = rows[0].url;
                                }
                            })
                            .query(function () {
                                return {
                                    query: "SELECT id, category_name, url FROM categories WHERE id IN (SELECT category_id FROM logo_categories WHERE logo_id = ?)",
                                    params: [item[0].base_logo_id]
                                };
                            })
                            .success(function (categpry) {
                                res.send({
                                    logo: item[0],
                                    status: 200,
                                    category: categpry.length > 0 ? categpry[0] : {id: global.config.GENERAL_CATEGORY_ID, name: "General", url: "general"}
                                });
                            })
                            .error(function (err) {
                                logger.error(err);
                                res.send({msg: err.message, status: 500});
                            }).execute();
                    } else {
                        easydb(dbPool)
                            .query(function () {
                                return {
                                    query: "SELECT base_card_id FROM user_cards WHERE id = ? AND user_id = ?",
                                    params: [item[0].base_item_id, req.user.id]
                                };
                            })
                            .success(function (rows) {
                                if (rows.length > 0) {
                                    item[0].base_card_id = rows[0].base_card_id;
                                } else {
                                    throw new Error("Invalid Card ID: " + req.body.id);
                                }
                            })
                            .query(function () {
                                return {
                                    query: "SELECT url FROM cards WHERE id = ?",
                                    params: [item[0].base_card_id]
                                };
                            })
                            .success(function (rows) {
                                if (rows.length > 0){
                                    item[0].base_card_url = rows[0].url;
                                }
                                res.send({
                                    card: item[0],
                                    status: 200
                                });
                            })
                            .error(function (err) {
                                logger.error(err);
                                res.send({msg: err.message, status: 500});
                            }).execute();
                    }
                } else {
                    res.send({msg: "No such item purchased or you don't have permissions to access it.", status: 500});
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
};