/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            var afterQry = "";
            if (req.body.count != undefined){
                afterQry = "LIMIT 0 ," + req.body.count;
            }
            var extraWhereClause = "";
            if (req.body.categoryId >= 0){
                extraWhereClause = " AND category = ?"
            }
            return {
                query: "SELECT * FROM other_products WHERE status = 'Active' " + extraWhereClause + " ORDER BY category " + afterQry,
                params: [req.body.categoryId]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({products: rows, status: 200});
            } else {
                res.send({msg: "No products found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};