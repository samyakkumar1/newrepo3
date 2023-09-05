
exports.index = function (req, res) {
    var db = easydb(dbPool);
    var maxOrder;
    db.query(function () {
        return {
            query: "SELECT MAX(item_order) AS maxOrder FROM other_product_settings WHERE product_id = ?",
            params: [req.body.productId]
        };
    }).success(function (rows) {
        if (rows.length > 0) {
            maxOrder = rows[0].maxOrder;
        } else {
            maxOrder = 0;
        }
    });
    if (req.body.direction == "up") {
        db.query(function () {
            return {
                query: "UPDATE other_product_settings SET item_order = item_order + 1 WHERE product_id = ? AND item_order = ? AND id <> ? AND status = 'Active' AND " + req.body.current_order + " > 0",
                params: [req.body.productId, req.body.current_order - 1, req.body.item_id]
            };
        }).query(function () {
            return {
                query: "UPDATE other_product_settings SET item_order = item_order - 1 WHERE id = ? AND item_order > 0 AND status = 'Active'",
                params: [req.body.item_id]
            };
        });
    } else {
        db.query(function () {
            return {
                query: "UPDATE other_product_settings SET item_order = item_order - 1 WHERE product_id = ? AND item_order = ? AND id <> ? AND item_order > 0 AND status = 'Active'",
                params: [req.body.productId, req.body.current_order + 1, req.body.item_id]
            };
        }).query(function () {
            return {
                query: "UPDATE other_product_settings SET item_order = item_order + 1 WHERE id = ? AND status = 'Active' AND item_order < ?",
                params: [req.body.item_id, maxOrder]
            };
        });
    }
    db.success(function (rows) {
        res.send({status: 200});
    }).error(function (err) {
        logger.error(err);
        res.send({msg: err.message, status: 500});
    }).execute({transaction: true});
}