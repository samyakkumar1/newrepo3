/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM other_products WHERE status <> 'Deleted' ORDER BY created_at DESC",
                params: []
            };
        })
        .success(function (rows) {
            res.send({items: rows, status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};