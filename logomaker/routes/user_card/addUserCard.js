/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");
exports.index = function (req, res) {
    if (req.user) {
        saveCardFile(req.body.url, req.body.design_type, function (err, s3_front_card_url) {
            if (err) {
                res.send({msg: "Can't save card file", status: 500});
            } else {
                saveCardFile(req.body.url_back, req.body.design_type,function (err, s3_back_card_url) {
                    if (err) {
                        res.send({msg: "Can't save card file", status: 500});
                    } else {
                        easydb(dbPool)
                            .query(function () {
                                return {
                                    query: "INSERT INTO `user_cards` (`design_type`, `user_id`, `base_card_id`, `first_name`, `last_name`, `address_line_1`, `address_line_2`, `website`, `email`, `phone_no`, `s3_front_card_url`, `s3_back_card_url`, `created_at`, `qty`, `finish`, `paper_stock`, `back_of_card`, `back_side_super_premium`, `shipping_type`, `purchase_design`, `dont_print_card`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?)",
                                    params: [(req.body.design_type ? "UserDesign" : "SystemDesign"), req.user.id, req.body.base_item_id, req.body.first_name, req.body.last_name, req.body.address_line_1, req.body.address_line_2, req.body.website, req.body.email, req.body.phone_no, s3_front_card_url, s3_back_card_url, req.body.qty, req.body.finish, req.body.paper_stock, req.body.back_of_card, req.body.back_side_super_premium, req.body.shipping_type, req.body.purchase_design, req.body.dont_print_card]
                                };
                            })
                            .success(function (rows) {
                                res.send({status: 200, insertId: rows.insertId, frontUrl: s3_front_card_url, backUrl: s3_back_card_url});
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
        res.send(403);
    }
};

function saveCardFile (contents, isCustomDesign, callback){
    if (!contents){
        callback(null);
    } else {
        var ext = ".svg";
        if (isCustomDesign){
            ext = "." + contents.type;
            contents.content = contents.content.substring(contents.content.indexOf(","));
            contents = new Buffer(contents.content, 'base64');
        } else {
            contents = contents.replace(/ArialMT/g, "Arial");
            contents = contents.replace(/Arial-BoldMT/g, "Arial");
        }
        var fileName = Date.now() + Math.random() + ext;
        try {
            fs.writeFile(config.USER_CARD_PATH + "/" + fileName, contents, function (err){ 
                callback(err, fileName);
            });
        } catch (err) {
            logger.error(err);
            callback(err);
        }
    }
}

global.saveCardFile = saveCardFile;