/**
 * Created by DesignerBe on 17-02-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT r.*,lp.ac_num,lp.bname,lp.ifsc,lp.pay_method AS long_pay_method,sp.pay_method AS short_pay_method,sp.pay_id,u.first_name,u.last_name,u.email FROM revenue AS r LEFT JOIN long_payment AS lp ON r.long_payment_id = lp.ID LEFT JOIN short_payment AS sp ON r.short_payment_id = sp.ID LEFT JOIN users AS u ON r.userid = u.id",
               // params: [req.query.start ? parseInt(req.query.start) : 0, 100]
               params:[]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({items: rows, status: 200});
            } else {
                res.send({msg: "No items found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};
exports.updateCashoutRequest = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "update revenue set status = ? where id = ?",
                params: [req.body.status, req.body.id]
            };
        })
        .success(function (rows) {
            res.send({status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};