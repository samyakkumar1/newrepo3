/**
 * Created by DesignerBe on 11-02-2021.
 */

exports.index = function (req, res) {
    console.log(req.user.id);
    if(req.body.pay_type=="sp"){
        easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT * FROM short_payment WHERE userid=?",
                        params: [req.user.id,req.user.id], 
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){
                        res.send({pm_user: rows, status: 200});
                    } else {
                        res.send({msg: "No Payment Method Found", status: 500});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
    }
    else{
        easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM long_payment WHERE userid=?",
                params: [req.user.id,req.user.id], 
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({pm_user: rows, status: 200});
            } else {
                res.send({msg: "No Payment Method Found", status: 500});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();

    }         
};