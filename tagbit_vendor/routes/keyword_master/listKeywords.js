/**
 * Created by Shyam Sathyan on 11-08-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * from keywords ORDER BY id DESC",
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({keywords: rows, status: 200});
            } else {
                res.send({msg: "No keywords found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};