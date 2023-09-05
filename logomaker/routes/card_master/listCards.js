/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            var afterQry = "";
            if (req.body.count != undefined){
                afterQry = "LIMIT 0 ," + req.body.count;
            }
            return {
                query: "SELECT * FROM cards WHERE status <> 'Deleted' ORDER BY id, created_at " + afterQry,
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({cards: rows, status: 200});
            } else {
                res.send({msg: "No cards found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};