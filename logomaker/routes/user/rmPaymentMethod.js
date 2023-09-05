/**
 * Created by DesignerBe on 11-02-2021.
 */

exports.index = function (req, res) {
    if(req.body.pay_type=="sp"){
        easydb(dbPool)
            .query(function () {
                return {
                    query: "DELETE FROM short_payment WHERE `pay_id` = ?",
                    params: [req.body.pay_id]
                };
            })
            .success(function (rows) {
                res.send({status: 200});
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
        }else{
            easydb(dbPool)
            .query(function () {
                return {
                    query: "DELETE FROM long_payment WHERE `ac_num` = ?",
                    params: [req.body.ac_num]
                };
            })
            .success(function (rows) {
                res.send({status: 200});
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
        }
}