/**
 * Created by DesignerBe on 10-02-2021.
 */

exports.index = function (req, res) {
    if(req.body.pay_type=='lp'){      
        easydb(dbPool)
                .query(function () {
                        return {
                            query: "INSERT INTO long_payment (`userid`,`ac_num`,`bname`,`ifsc`,`pay_method`,`regd_at`) VALUES (?,?,?,?,?, CURRENT_TIMESTAMP)",
                            params: [req.user.id,req.body.ac_num,req.body.bname,req.body.ifsc,req.body.pm]
                        };
                })
                .success(function (rows) {
                        res.send({status: 200});
                })
                .error(function (err) {
                        if (err.message.indexOf("ER_DUP_ENTRY") > -1) {
                            res.send({msg: "This Payment Method already Exists", status: 500});
                        } else {
                            console.log(err);
                            res.send({msg: err.message, status: 500});
                            logger.error(err);
                        }
                }).execute();
        }
        else{
            console.log("short payment triggered!");
            easydb(dbPool)
                    .query(function () {
                        return {
                            query: "INSERT INTO short_payment (`userid`,`pay_method`,`pay_id`,`regd_at`) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
                            params: [req.user.id,req.body.pm,req.body.pay_id]
                        };
                    })
                    .success(function (rows) {
                        res.send({status: 200});
                    })
                    .error(function (err) {
                        if (err.message.indexOf("ER_DUP_ENTRY") > -1) {
                            res.send({msg: "This Payment Method already Exists", status: 500});
                        } else {
                            res.send({msg: err.message, status: 500});
                            logger.error(err);
                        }
                    }).execute();
        }
        
    }  