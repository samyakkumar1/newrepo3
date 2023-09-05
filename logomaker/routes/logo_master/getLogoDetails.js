/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM logos WHERE id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({logo: rows[0], status: 200});
            } else {
                throw new Error("Invalid logo id");
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};