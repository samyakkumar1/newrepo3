
exports.index = function (req, res) {
    var category_id;
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT category_id FROM logo_categories WHERE logo_id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                category_id = rows[0].category_id;
            } else {
                throw new Error("No category found");
            }
        })
        .query(function () {
            return {
                query: "SELECT * FROM categories WHERE id = ?",
                params: [category_id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                res.send({category: rows[0], status: 200});
            } else {
                throw new Error("No category found");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};