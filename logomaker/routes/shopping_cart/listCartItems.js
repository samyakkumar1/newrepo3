/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    if (req.user) {
        getCartItems(req.user.id, function (err, items){
            if (err){
                res.send(err);
            } else {
                res.send({items: items, status: 200});
            }
        }); 
    } else {
        res.send(403);
    }
};

function getCartItems (userId, callback){
    getLatestShoppingCartId(userId, function (latestId, cart) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM shopping_cart_items WHERE shopping_cart_id = ? AND shopping_cart_id IN (SELECT id FROM shopping_carts WHERE user_id = ?) ORDER BY id DESC",
                    params: [latestId, userId]
                };
            })
            .success(function (rows) {
                if (rows.length > 0) {
                    callback(undefined, rows, cart);
                } else {
                    callback({msg: "No items found", status: 201});
                }
            })
            .error(function (err) {
                logger.error(err);
                callback({msg: err.message, status: 500});
            }).execute();
    }, function(err){
        logger.error(err);
        callback(err);
    });
}

global.getCartItems = getCartItems;