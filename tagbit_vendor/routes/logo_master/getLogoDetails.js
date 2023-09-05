/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT logos.*, GROUP_CONCAT(logo_categories.category_id) as categories FROM logos INNER JOIN logo_categories ON logo_categories.logo_id = logos.id WHERE id = ? GROUP BY logo_categories.logo_id",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                res.send({logo: rows[0], status: 200});
            } else {
                throw new Error("Invalid logo id");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};