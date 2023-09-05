/**
 * Updated by DesignerBe on 07-09-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM news_letter;"
            };
        })
        .success(function (rows) {
            res.send({status: 200, users: rows});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};