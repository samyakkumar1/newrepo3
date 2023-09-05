/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");

exports.index = function (req, res) {
    var f_url, b_url;
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE card_categories SET status = 'Deleted' WHERE card_id = ?",
                params: [req.body.id]
            };
        })
        .query(function () {
            return {
                query: "SELECT s3_front_card_url, s3_back_card_url FROM cards WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                f_url = rows[0].s3_front_card_url;
                b_url = rows[0].s3_back_card_url;
            } else {
                throw new Error("Invalid Card id");
            }
        })
        .query(function () {
            return {
                query: "UPDATE cards SET status = 'Deleted' WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.affectedRows > 0){
                res.send({status: 200});
            } else {
                throw new Error("Invalid Card id");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};