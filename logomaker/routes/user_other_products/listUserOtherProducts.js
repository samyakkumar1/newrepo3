/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    if (req.user) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT other_products.name AS product_name, other_products.base_params_front, other_products.base_image_url, other_products.front_logo_params, other_products.seo_url, user_other_products.* FROM user_other_products INNER JOIN other_products ON other_products.id = user_other_products.base_product_id WHERE user_other_products.status = 'Active' AND user_other_products.user_id = ? ORDER BY modified_at, created_at",
                params: [req.user.id]
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
    } else {
        res.send(403);
    }
};