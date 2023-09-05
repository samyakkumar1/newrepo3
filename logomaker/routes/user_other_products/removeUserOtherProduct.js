/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require('fs');

exports.index = function (req, res) {
    if (req.user) {
        var url;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT image_url FROM user_other_products WHERE id = ? AND user_id = ?",
                    params: [req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    url = rows[0].s3_logo_url;
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "UPDATE user_other_products SET status = 'Deleted', modified_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
                                params: [req.body.id, req.user.id]
                            };
                        })
                        .success(function (rows) {
                            if (rows.affectedRows == 0){
                                throw new Error("Invalid product ID");
                            }
                        })
                        .query(function () {
                            return {
                                query: "DELETE FROM shopping_cart_items WHERE item_id = ? AND item_type = 'OTHER'",
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
                    res.send({msg: "Invalid user product ID", status: 201});
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
