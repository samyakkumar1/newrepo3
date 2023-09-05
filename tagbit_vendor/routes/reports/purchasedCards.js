var xlsx = require('node-xlsx');
var dateFormat = require('dateformat');

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT shopping_carts.date_purchased, purchased_items.id AS order_id, purchased_items.shipping_type, purchased_items.back_side_super_premium, purchased_items.back_of_card, purchased_items.paper_stock, purchased_items.finish, purchased_items.qty, purchased_items.url, purchased_items.url_back, shipping_address.first_name, shipping_address.last_name, shipping_address.address1, shipping_address.address2, shipping_address.city, shipping_address.state, shipping_address.country, shipping_address.postal_code FROM shipping_address INNER JOIN shopping_carts ON shopping_carts.shipping_address_id = shipping_address.id INNER JOIN purchased_items ON purchased_items.shopping_cart_id = shopping_carts.id WHERE purchased_items.type = 'BC'",
                params: []
            };
        })
        .success(function (rows) {
            var array = [];
            array.push(['Date of Purchase', 'Paper','Quantity','File','File (Back of Card)','Back of Card','First','Last','Phone','Country','Address','City','State','Zip','OUR ORDER ID','PDF URL','Shipping Speed', 'Paper Stock']);
            if (rows.length > 0){
                for (var i = 0; i < rows.length; i++){
                    var item = rows[i];
                    var inner_array = [dateFormat(new Date(item.date_purchased), "mmm dd yyyy"), item.finish, item.qty, item.order_id + ".pdf", "", item.back_of_card, item.first_name, item.last_name, item.phone_number, item.country, item.address1 + " " + item.address2, item.city, item.state, item.postal_code, item.order_id, config.APP_DOMAIN + "/generatePDF?type=card&url="+item.url+'&id='+item.order_id, item.shipping_type == "Exp" ? "Express" : "Standard", item.paper_stock];
                    array.push(inner_array);
                }
            } else {
                array.push(["No items found"]);
            }
            var buffer = xlsx.build([{name: "Tagbit Report", data: array}]);
            res.status(200).setHeader("Content-Disposition", 'attachment; filename="'+ dateFormat(new Date(), "mmm dd yyyy") + '-Orders.xlsx"');
            res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.end(buffer);
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};