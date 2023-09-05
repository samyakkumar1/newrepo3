/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT logos.id AS id, title, logos.desc, s3_logo_url,logos.status as status, GROUP_CONCAT(categories.category_name) as categories FROM logos INNER JOIN categories INNER JOIN logo_categories ON logo_categories.logo_id = logos.id AND logo_categories.category_id = categories.id WHERE logos.status <> 'Deleted' GROUP BY logos.id ORDER BY id DESC LIMIT ?, ?",
                params: [req.body.start ? parseInt(req.body.start) : 0, 10]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({logos: rows, status: 200});
            } else {
                res.send({msg: "No logos found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};