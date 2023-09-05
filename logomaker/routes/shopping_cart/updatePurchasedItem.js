/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");

exports.index = function (req, res) {
    if (req.user) {
        var s3_front_card_url, s3_back_card_url;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT url, url_back, type FROM `purchased_items` WHERE `id` = ? AND `shopping_cart_id` IN (SELECT id FROM shopping_carts WHERE user_id = ?)",
                    params: [req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0) {
                    s3_front_card_url = rows[0].url;
                    s3_back_card_url = rows[0].url_back;
                    updateFile(rows[0].type, s3_front_card_url, req.body.url, function (err, front_url){
                        if (err){
                            res.send({msg: "Error saving card file.", status: 500});
                        } else {
                            updateFile(rows[0].type, s3_back_card_url, req.body.url_back, function (err, back_url){
                                if (err){
                                    res.send({msg: "Error saving card file.", status: 500});
                                } else {
                                    easydb(dbPool)
                                        /* Dont want to update card params - new
                                        .query(function () {
                                            return {
                                                query: "UPDATE `purchased_items` SET `first_name` = ?,`last_name` =  ?,`address_line_1` = ?,`address_line_2` = ?,`website` = ?,`email` = ?,`phone_no` = ?,`url` = ?,`url_back` = ?,`modified_at` = CURRENT_TIMESTAMP, `qty` = ?, `finish` = ?, `paper_stock` = ?, `back_of_card` = ?, `back_side_super_premium` = ?, `shipping_type` = ?, company_name = ?, slogan = ? WHERE `id` = ?",
                                                params: [req.body.first_name, req.body.last_name, req.body.address_line_1, req.body.address_line_2, req.body.website, req.body.email, req.body.phone_no, front_url, back_url, req.body.qty, req.body.finish, req.body.paper_stock, req.body.back_of_card, req.body.back_side_super_premium, req.body.shipping_type, req.body.company_name, req.body.slogan, req.body.id]
                                            };
                                        })
                                        */
                                        .query(function () {
                                            return {
                                                query: "UPDATE `purchased_items` SET `first_name` = ?,`last_name` =  ?,`address_line_1` = ?,`address_line_2` = ?,`website` = ?,`email` = ?,`phone_no` = ?,`url` = ?,`url_back` = ?,`modified_at` = CURRENT_TIMESTAMP, company_name = ?, slogan = ? WHERE `id` = ?",
                                                params: [req.body.first_name, req.body.last_name, req.body.address_line_1, req.body.address_line_2, req.body.website, req.body.email, req.body.phone_no, front_url, back_url, req.body.company_name, req.body.slogan, req.body.id]
                                            };
                                        })
                                        .success(function (rows) {
                                            if (rows.affectedRows > 0) {
                                                res.send({status: 200, url: front_url, url_back: back_url, insertId: req.body.id});
                                            } else {
                                                res.send({msg: "No rows updated", status: 500});
                                            }
                                        })
                                        .error(function (err) {
                                            logger.error(err);
                                            res.send({msg: err.message, status: 500});
                                        }).execute();
                                }
                            });
                        }
                    });
                } else {
                    throw new Error("Invalid Card ID");
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

function updateFile (type, url, contents, callback){
    if (url != null && contents != null) {
        var fileName = (type == "BC"? config.USER_CARD_PATH : config.USER_LOGO_PATH) + "/" + url;
        fs.writeFile(fileName, contents, function (err) {
            if (err) {
                logger.error(err);
            } else {
                callback(undefined, url);
            }
        });
    } else {
        callback(undefined, url);
    }
}