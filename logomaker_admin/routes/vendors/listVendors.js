/**
 * Updated by DesignerBe on 07-09-2020.
 */

 exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * from vendors",
                params: []
            };
        })
        .success(function (rows) {
            res.send({status: 200, items: rows});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};