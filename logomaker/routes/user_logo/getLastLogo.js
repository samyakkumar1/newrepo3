/**
 * Created by DesignerBe on 30-01-2020.
 */

exports.index = function (req, res) {
    if (req.user) {
        var logo;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT s3_logo_url FROM `user_logos` WHERE user_id = ? AND status <> 'Deleted' ORDER BY `created_at` DESC LIMIT 1",
                    params: [req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    res.send({status: 200, url:  rows[0].s3_logo_url});
                } else {
                    res.send({status: 201});
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