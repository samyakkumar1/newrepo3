/**
* Created by DesignerBe on 05-10-2020.
*/
exports.index = function (req, res) {
    if (req.user) {
        var logo, base_url;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM user_logos WHERE id = ? AND user_id = ?",
                    params: [req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    logo = rows[0];
                } else {
                    throw new Error("Invalid Logo ID: " + req.body.id);
                }
            })
            .query(function () {
                return {
                    query: "SELECT url FROM logos WHERE id = ?",
                    params: [logo.base_logo_id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    logo.base_logo_url = rows[0].url;
                }
            })
            .query(function () {
                return {
                    query: "SELECT id, category_name, url FROM categories WHERE id IN (SELECT category_id FROM logo_categories WHERE logo_id = ?)",
                    params: [logo.base_logo_id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    res.send({logo: logo, status: 200, category: {id: rows[0].id, name: rows[0].category_name, url: rows[0].url}});
                } else {
                    res.send({logo: logo, status: 200, category: {id: global.config.GENERAL_CATEGORY_ID, name: "General", url: "general"}});
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
};
