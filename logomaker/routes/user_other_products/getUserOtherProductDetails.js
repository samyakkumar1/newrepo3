/**
* Created by DesignerBe on 05-10-2020.
*/
exports.index = function (req, res) {
    var product;
    if (req.user) {
        if (req.query.from == "mydesigns"){
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT other_products.base_image_url, other_products.front_logo_params, other_products.base_params_front,  other_products.name AS product_name, other_products.seo_url, user_other_products.* FROM user_other_products INNER JOIN other_products ON other_products.id = user_other_products.base_product_id WHERE user_other_products.id = ? AND user_other_products.user_id = ?",
                        params: [req.query.id, req.user.id]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){
                        product = rows[0];  
                    } else {
                        throw new Error("Invalid Product ID: " + req.query.id);
                    }
                })
                .query(function () {
                    return {
                        query: "SELECT other_product_settings.control_type, user_other_product_settings.product_settings_id, user_other_product_settings.setting_value FROM user_other_product_settings INNER JOIN other_product_settings ON other_product_settings.id = user_other_product_settings.product_settings_id WHERE user_other_product_settings.user_other_product_id = ?",
                        params: [req.query.id]
                    };
                })
                .success(function (rows) {
                    res.send({product: product, settings: rows.length > 0 ? rows : undefined, status: 200}); 
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute(); 
        } else {
            var base_product;
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT other_products.name AS product_name, other_products.seo_url, user_other_products.* FROM user_other_products INNER JOIN other_products ON other_products.id = user_other_products.base_product_id WHERE user_other_products.id IN (SELECT base_item_id FROM purchased_items WHERE id = ?) AND user_other_products.user_id = ?",
                        params: [req.query.id, req.user.id]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){ 
                        base_product = rows[0];  
                    } else {
                        throw new Error("Invalid Product ID: " + req.query.id);
                    }
                })
                .query(function () {
                    return {
                        query: "SELECT url AS image_url FROM purchased_items WHERE id = ?",
                        params: [req.query.id]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){
                        rows[0].base_design_id = base_product.base_design_id; 
                        rows[0].base_product_id = base_product.base_product_id;
                        rows[0].user_logo_id = base_product.user_logo_id; 
                        rows[0].name = base_product.name;
                        rows[0].seo_url = base_product.seo_url; 
                        rows[0].id = base_product.id; 
                        product = rows[0];  
                    } else {
                        throw new Error("Invalid Product ID: " + req.query.id);
                    }
                })
                .query(function () {
                    return {
                        query: "SELECT other_product_settings.control_type, user_other_product_settings.product_settings_id, user_other_product_settings.setting_value FROM user_other_product_settings INNER JOIN other_product_settings ON other_product_settings.id = user_other_product_settings.product_settings_id WHERE user_other_product_settings.user_other_product_id = ?",
                        params: [base_product.id]
                    };
                })
                .success(function (rows) {
                    res.send({product: product, settings: rows.length > 0 ? rows : undefined, status: 200}); 
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute(); 
        }
    } else {
        res.send(403);
    }
};
