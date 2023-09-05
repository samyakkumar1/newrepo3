/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    if (req.user) {
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM user_cards WHERE user_id = ? AND status <> 'Deleted' ORDER BY created_at DESC",
                    params: [req.user.id]
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
    } else {
        res.send(403);
    }
};