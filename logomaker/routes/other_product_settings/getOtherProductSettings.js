
exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT id, setting_name, control_type, page_number, related_setting, independent_pricing FROM other_product_settings WHERE product_id = ? AND status = 'Active' ORDER BY page_number, item_order",
                    params: [req.query.product_id]
                };
            })
            .success(function (rows) {
                if (rows.length == 0) {
                    res.send({msg: "Item with the specified ID not found.", status: 404});
                } else {
                    res.send({settings: rows, status: 200});
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute({transaction: true});
    } else {
        res.send(403);
    }
};