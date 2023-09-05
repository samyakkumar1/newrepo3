var dateFormat = require('dateformat');

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            var where_clauses = [" 1 = 1 "];
            var params = [];
            if (req.body.orderNo) {
                var no = (req.body.orderNo + "").toUpperCase();
                if (no.indexOf("BC") > -1 || no.indexOf("LG") > -1 || no.indexOf("CU") > -1 || no.indexOf("OT") > -1) {
                    var type;
                    if (no.indexOf("BC") > -1) {
                        type = "BC";
                    } else if (no.indexOf("OT") > -1) {
                        type = "OTHER";
                    } else if (no.indexOf("CU") > -1) {
                        type = "CUSTOM";
                    } else {
                        type = "LOGO";
                    }
                    no = no.replace("BC", "-").replace("LG", "-").replace("OT", "-").replace("CU", "-");
                    var nums = no.split("-");
                    where_clauses.push("(shopping_carts.id = ? OR shopping_cart_items.item_id = ?) AND shopping_cart_items.item_type = ?");
                    params.push(nums[0]);
                    params.push(nums[1]);
                    params.push(type);
                } else {
                    where_clauses.push("(shopping_carts.id = ? OR shopping_cart_items.item_id = ?)");
                    params.push(req.body.orderNo);
                    params.push(req.body.orderNo);
                }
            }
            if (req.body.orderStatus) {
                where_clauses.push("purchased_items.status = ?");
                params.push(req.body.orderStatus);
            }
            if (req.body.product) {
                where_clauses.push("shopping_cart_items.item_type = ?");
                params.push(req.body.product);
            }
            if (req.body.endDate) {
                where_clauses.push("date(shopping_carts.date_purchased) <= ?");
                params.push(req.body.endDate);
            }
            if (req.body.startDate) {
                where_clauses.push("date(shopping_carts.date_purchased) >= ?");
                params.push(req.body.startDate);
            }
            var where = " WHERE " + where_clauses.join(" AND ");
            //logger.error( "SELECT shopping_carts.id AS cart_id, shopping_carts.created_at, shopping_carts.modified_at, shopping_carts.status, shopping_carts.shipping_type, shopping_carts.payement_type, shopping_carts.price, shopping_carts.currency, shopping_carts.date_purchased, shopping_carts.txn_id, shopping_cart_items.item_id, shopping_cart_items.item_type, shipping_address.id, shipping_address.user_id, shipping_address.email_address,  shipping_address.phone_number, shipping_address.first_name, shipping_address.last_name, shipping_address.address1, shipping_address.address2, shipping_address.city, shipping_address.state,  shipping_address.country, shipping_address.postal_code, shopping_cart_items.id AS order_id, purchased_items.back_side_super_premium, purchased_items.back_of_card,  purchased_items.paper_stock, purchased_items.finish, purchased_items.qty, purchased_items.status AS order_status FROM shopping_carts INNER JOIN shopping_cart_items ON shopping_carts.id = shopping_cart_items.shopping_cart_id INNER JOIN shipping_address ON shopping_carts.shipping_address_id = shipping_address.id INNER JOIN purchased_items ON shopping_carts.id = purchased_items.shopping_cart_id AND shopping_cart_items.item_id = purchased_items.base_item_id AND shopping_cart_items.item_id = purchased_items.base_item_id " + where + " ORDER BY " + req.body.sortField + " " + req.body.sortOrder, params);
            var limit = "";
            if (req.body.limit){
                limit = "LIMIT " + req.body.limit;
            }
            console.log("SELECT shopping_carts.id AS cart_id, shopping_carts.created_at, shopping_carts.modified_at, shopping_carts.status, shopping_carts.shipping_type, shopping_carts.payement_type, shopping_carts.price, shopping_carts.currency, shopping_carts.date_purchased, shopping_carts.txn_id, shopping_cart_items.item_id, shopping_cart_items.item_type, shipping_address.id, shipping_address.user_id, shipping_address.email_address,  shipping_address.phone_number, shipping_address.first_name, shipping_address.last_name, shipping_address.address1, shipping_address.address2, shipping_address.city, shipping_address.state,  shipping_address.country, shipping_address.postal_code, shopping_cart_items.id AS order_id, purchased_items.back_side_super_premium, purchased_items.back_of_card,  purchased_items.paper_stock, purchased_items.finish, purchased_items.qty, purchased_items.status AS order_status FROM shopping_carts INNER JOIN shopping_cart_items ON shopping_carts.id = shopping_cart_items.shopping_cart_id INNER JOIN shipping_address ON shopping_carts.shipping_address_id = shipping_address.id INNER JOIN purchased_items ON shopping_carts.id = purchased_items.shopping_cart_id AND shopping_cart_items.item_id = purchased_items.base_item_id AND shopping_cart_items.item_id = purchased_items.base_item_id " + where + " ORDER BY " + req.body.sortField + " " + req.body.sortOrder + " " + limit)
            console.log("params",params);
            return {
                query: " SELECT other_products.name ,shopping_carts.id AS cart_id, shopping_carts.created_at, shopping_carts.modified_at, shopping_carts.status, shopping_carts.shipping_type, shopping_carts.payement_type, shopping_carts.price, shopping_carts.currency, shopping_carts.date_purchased, shopping_carts.txn_id, shopping_cart_items.item_id, shopping_cart_items.item_type, shipping_address.id, shipping_address.user_id, shipping_address.email_address,  shipping_address.phone_number, shipping_address.first_name, shipping_address.last_name, shipping_address.address1, shipping_address.address2, shipping_address.city, shipping_address.state,  shipping_address.country, shipping_address.postal_code, shopping_cart_items.id AS order_id, purchased_items.back_side_super_premium, purchased_items.back_of_card,  purchased_items.paper_stock, purchased_items.finish, purchased_items.qty, purchased_items.status AS order_status FROM shopping_carts INNER JOIN shopping_cart_items ON shopping_carts.id = shopping_cart_items.shopping_cart_id INNER JOIN shipping_address ON shopping_carts.shipping_address_id = shipping_address.id INNER JOIN purchased_items ON shopping_carts.id = purchased_items.shopping_cart_id  INNER JOIN user_other_products_custom ON user_other_products_custom.id = purchased_items.base_item_id INNER JOIN other_product_details ON other_product_details.id = user_other_products_custom.base_product_id INNER JOIN other_products ON other_products.id = other_product_details.other_product_id AND shopping_cart_items.item_id = purchased_items.base_item_id AND shopping_cart_items.item_id = purchased_items.base_item_id " + where + " ORDER BY " + req.body.sortField + " " + req.body.sortOrder + " " + limit,
                params: params
            };
        })
        .success(function (rows) { 
            res.send({status: 200, items: rows}); 
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};