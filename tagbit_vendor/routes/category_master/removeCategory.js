/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE categories SET status = 'Deleted' WHERE id=?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.affectedRows > 0){
                res.send({status: 200});
            } else {
                res.send({msg: "Invalid Category id", status: 500});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};