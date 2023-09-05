/**
 * Created by Harikrishnan on 08-12-2014.
 */

global.getLatestShoppingCartId = exports.index = function getLatestShoppingCartId (userId, callback, err_callback){
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT id, currency FROM shopping_carts WHERE user_id = ? AND status = 'PENDING'",
                params: [userId]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                callback(rows[0].id, {currency: rows[0].currency});
            } else {
                var shipping_id;
                easydb(dbPool)
                    .query(function () {
                        return {
                            query: "INSERT INTO shopping_carts (user_id,  created_at, modified_at, status) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)",
                            params: [userId, 'PENDING']
                        };
                    })
                    .success(function (rows) {
                        callback(rows.insertId);
                    })
                    .error(function (err) {
                        logger.error(err);
                        err_callback({msg: "Error creating shopping cart", status: 500});
                    }).execute();
            }
        })
        .error(function (err) {
            logger.error(err);
            err_callback({msg: err.message, status: 500});
        }).execute();
}

global.getLatestShoppingCartIdWithoutLogin = exports.index = function getLatestShoppingCartIdWithoutLogin (userId, callback, err_callback){
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT id, currency FROM shopping_carts WHERE user_id = ? AND status = 'PENDING' AND is_login = 0",
                params: [userId]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                callback(rows[0].id, {currency: rows[0].currency});
            } else {
                var shipping_id;
                easydb(dbPool)
                    .query(function () {
                        return {
                            query: "INSERT INTO shopping_carts (user_id,  created_at, modified_at, status,is_login) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?,?)",
                            params: [userId, 'PENDING',0]
                        };
                    })
                    .success(function (rows) {
                        callback(rows.insertId);
                    })
                    .error(function (err) {
                        logger.error(err);
                        err_callback({msg: "Error creating shopping cart", status: 500});
                    }).execute();
            }
        })
        .error(function (err) {
            logger.error(err);
            err_callback({msg: err.message, status: 500});
        }).execute();
}
