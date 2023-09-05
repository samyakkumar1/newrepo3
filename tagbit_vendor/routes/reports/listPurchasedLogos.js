var xlsx = require('node-xlsx');
var dateFormat = require('dateformat');

exports.index = function (req, res) {
    easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT purchased_items.created_at, users.first_name, users.last_name, purchased_items.id AS purchased_item_id, purchased_items.url, user_logos.base_logo_id, logos.id, logos.visible, users.email, logo_categories.category_id FROM purchased_items INNER JOIN shopping_carts ON purchased_items.shopping_cart_id = shopping_carts.id INNER JOIN shipping_address ON shopping_carts.shipping_address_id = shipping_address.id INNER JOIN user_logos ON purchased_items.base_item_id = user_logos.id INNER JOIN logos ON user_logos.base_logo_id = logos.id INNER JOIN logo_categories ON logos.id = logo_categories.logo_id INNER JOIN users ON users.id = user_logos.user_id WHERE (purchased_items.type = 'LOGO') " + (req.body.categoryId ? " AND logo_categories.category_id = ? " : "") + " ORDER BY purchased_items.created_at DESC",
                    params: [req.body.categoryId]
                };
            })
            .success(function (rows) {
                if (req.body.type == "xls") {
                    var array = [];
                    array.push(['Date of Purchase', 'Name', 'Email', 'File', 'PDF']); 
                    if (rows.length > 0) {
                        for (var i = 0; i < rows.length; i++) {
                            var item = rows[i];
                            var inner_array = [dateFormat(new Date(new Date(item.created_at).getTime()), "mmm dd yyyy hh:MM"), ((item.first_name == null ? "" : item.first_name) + " " + (item.last_name == null ? "" : item.last_name)), item.email, config.APP_DOMAIN + "/getUserLogoImage?id="+ item.url, config.APP_DOMAIN + "/generatePDF?type=logo&url=" + item.url + '&id=' + item.id];
                            array.push(inner_array);
                        }
                    } else {
                        array.push(["No items found"]);
                    }
                    var buffer = xlsx.build([{name: "Tagbit Report", data: array}]);
                    res.status(200).setHeader("Content-Disposition", 'attachment; filename="' + dateFormat(new Date(), "mmm dd yyyy") + '-Downloads.xlsx"');
                    res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    res.end(buffer);
                } else {
                    res.send({status: 200, logos: rows});
                }
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
};