
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE other_products SET status = 'Deleted' WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.affectedRows > 0) {
                res.send({status: 200});
            } else {
                throw new Error("Item with specified ID (" + req.body.id + ") is already deleted or could not be found.");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};