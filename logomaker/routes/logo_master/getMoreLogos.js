/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    if (global.config.GENERAL_CATEGORY_ID != 0 && (global.config.GENERAL_CATEGORY_ID == "" || global.config.GENERAL_CATEGORY_ID == undefined || global.config.GENERAL_CATEGORY_ID == null)){
        global.config.GENERAL_CATEGORY_ID = -1;
    }
    var new_category, url;
    var extra_query = "";
    if (req.body.excluded){
        extra_query = "category_id NOT IN (SELECT " + req.body.excluded.join(" UNION ALL SELECT ") + ") AND";
    }
    easydb(dbPool)
        .query(function () {
            var not_in_part = "";
            if (req.body.excluded && req.body.excluded.length > 0){
                not_in_part = "category_id NOT IN (SELECT " + req.body.excluded.join(" UNION ALL SELECT ") + ") AND";
            }
            return {
                query: "SELECT category_id, url FROM logo_categories INNER JOIN categories ON categories.id = logo_categories.category_id AND categories.status <> 'Deleted' WHERE " + not_in_part + " category_id <> ? LIMIT 1",
                params: [global.config.GENERAL_CATEGORY_ID]
            }
        })
        .success(function (rows) {
            if (rows.length > 0){
                new_category = rows[0];
            } else {
                throw new Error("No more categories found.");
            }
        })
        .query(function () {
            return {
                query: "SELECT logos.*, ? AS category_id, ? AS category_url FROM logos INNER JOIN logo_categories ON logos.id = logo_categories.logo_id AND logo_categories.category_id = ? AND logos.status <> 'Deleted' AND logos.status <> 'Deleted' AND logos.visible = 1",
                params: [new_category.category_id, new_category.url, new_category.category_id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({logos: rows, status: 200, category: new_category});
            } else {
                res.send({msg: "No logos found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};