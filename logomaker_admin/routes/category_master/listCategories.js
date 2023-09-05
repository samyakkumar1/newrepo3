/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM categories WHERE status <> 'Deleted' ORDER BY id ",
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                res.send({categories: rows, status: 200});
            } else {
                res.send({msg: "No category found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};
