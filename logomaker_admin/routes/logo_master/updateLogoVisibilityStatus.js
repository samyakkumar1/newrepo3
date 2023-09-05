
exports.index = function (req, res) {

    easydb(dbPool)
        .query(function () {
            return {
                query: "UPDATE `logos` SET `visible` = ? WHERE id = ?",
                params: [req.body.visible, req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.affectedRows == 0){
                throw new Error("Logo not found.");
            } else {
                res.send({status: 200});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
};