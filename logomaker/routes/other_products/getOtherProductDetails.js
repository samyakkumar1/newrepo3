/**
 * Created by DesignerBe on 03-06-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM other_products WHERE id = ?",
                params: [req.query.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({details: rows[0], status: 200});
            } else {
                throw new Error("Invalid product id");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};