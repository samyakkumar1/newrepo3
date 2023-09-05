/**
 * Created by DesignerBe on 05-10-2020.
 */
var fs = require("fs");

exports.index = function (req, res) {
    var url;
    easydb(dbPool)
        .query(function () {
            return {
                query: "DELETE FROM logo_categories WHERE logo_id = ?",
                params: [req.body.id]
            };
        })
        .query(function () {
            return {
                query: "SELECT s3_logo_url FROM logos WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                url = rows[0].s3_logo_url;
            } else {
                throw new Error("Invalid Logo id");
            }
        })
        .query(function () {
            return {
                query: "UPDATE logos SET status = 'Deleted' WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.affectedRows > 0){
                res.send({status: 200});
            } else {
                throw new Error("Invalid Logo id");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};