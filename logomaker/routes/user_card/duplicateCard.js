var fs = require("fs");

exports.index = function (req, res) {
    if (req.user) {
        var card;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM user_cards WHERE id = ? AND user_id = ?",
                    params: [req.query.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    card = rows[0];
                    duplicateCardFile(card.s3_front_card_url, function (err, s3_front_card_url) {
                        if (err) {
                            res.send({msg: "Can't save card file", status: 500});
                        } else {
                            duplicateCardFile(card.s3_back_card_url, function (err, s3_back_card_url) {
                                if (err) {
                                    res.send({msg: "Can't save card file", status: 500});
                                } else {
                                    easydb(dbPool)
                                        .query(function () {
                                            return {
                                                query: "INSERT INTO `user_cards` (`user_id`, `base_card_id`, `first_name`, `last_name`, `address_line_1`, `address_line_2`, `website`, `email`, `phone_no`, `s3_front_card_url`, `s3_back_card_url`, `created_at`, `qty`, `finish`, `paper_stock`, `back_of_card`, `back_side_super_premium`, `shipping_type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)",
                                                params: [req.user.id, card.base_card_id, card.first_name, card.last_name, card.address_line_1, card.address_line_2, card.website, card.email, card.phone_no, s3_front_card_url, s3_back_card_url, card.qty, card.finish, card.paper_stock, card.back_of_card, card.back_side_super_premium, card.shipping_type]
                                            };
                                        })
                                        .success(function (rows) {
                                            res.redirect("/design-business-card-online/edit/" + rows.insertId + "/mydesigns");
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
                    throw new Error("Invalid Card id");
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

function duplicateCardFile (url, callback){
    var newFileName = Date.now() + Math.random() + ".dup.svg";
    fs.createReadStream(config.USER_CARD_PATH + "/" +  url)
        .pipe(fs.createWriteStream( config.USER_CARD_PATH + "/" + newFileName))
        .on("error", function (err){
            callback(err);
        })
        .on("finish", function (){ 
            callback(undefined, newFileName);
        });
}