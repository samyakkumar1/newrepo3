exports.index = function (req, res) {
    var item;
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM other_products WHERE status <> 'Deleted' AND id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                item = rows[0];
            } else {
                throw new Error("Item with specified ID (" + req.body.id + ") is deleted or could not be found.");
            }
        })
        .query(function () {
            return {
                query: "SELECT id, design_file FROM other_products_designs WHERE other_product_id = ? AND status = 'Active'",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            res.send({item: item, designs: rows, status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};