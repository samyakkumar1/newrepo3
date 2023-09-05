/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query:"SELECT user_logos.id, user_logos.user_id, user_logos.base_logo_id, user_logos.company_name, user_logos.slogan, user_logos.s3_logo_url, user_logos.created_at, user_logos.modified_at, logos.status, shopping_carts.user_id AS owner FROM user_logos LEFT OUTER JOIN logos ON user_logos.base_logo_id = logos.id LEFT OUTER JOIN purchased_items ON user_logos.id = purchased_items.base_item_id LEFT OUTER JOIN shopping_carts ON purchased_items.shopping_cart_id = shopping_carts.id WHERE user_logos.user_id = ? AND user_logos.status <> 'Deleted' GROUP BY user_logos.id ORDER BY user_logos.created_at DESC",
                    params: [req.user.id]
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
    } else {
        res.send(403);
    }
};