/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require('fs');

exports.index = function (req, res) {
    if (req.user) {
        var front, back;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT s3_front_card_url, s3_back_card_url FROM user_cards WHERE id = ? AND user_id = ?",
                    params: [req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    front = rows[0].s3_front_card_url;
                    back = rows[0].s3_back_card_url;
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "UPDATE user_cards SET status = 'Deleted', modified_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
                                params: [req.body.id, req.user.id]
                            };
                        })
                        .success(function (rows) {
                            if (rows.affectedRows == 0){
                                res.send({msg: "Invalid Card id", status: 201});
                            }
                        })
                        .query(function () {
                            return {
                                query: "DELETE FROM shopping_cart_items WHERE item_id = ? AND item_type = 'BC'",
                                params: [req.body.id]
                            };
                        })
                        .success(function (rows) { 
                            res.send({status: 200}); 
                        })
                        .error(function (err) {
                            logger.error(err);
                            res.send({msg: err.message, status: 500});
                        }).execute({transaction: true});
                } else {
                    res.send({msg: "Invalid Card id", status: 201});
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