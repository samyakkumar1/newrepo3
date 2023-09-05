/**
 * Created by Designerbe on 05-10-2020.
 */

var fs = require('fs');

exports.index = function (req, res) {
    if (req.user) {
                var db = easydb(dbPool);
                var productId;
                db.query(function () {
                        return {
                            query: "INSERT INTO `user_other_products_custom` ( `user_id`, `base_product_id`, `price`, `small`, `medium`,`large`,`xl`,`doublexl`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            params: [req.user.id, req.body.product_id, req.body.price, req.body.small, req.body.medium, req.body.large, req.body.xl, req.body.doublexl]
                        };
                    })
                    .success(function (rows) {
                            res.send({status: 200, insertId:  rows.insertId});
                    })
                    .error(function (err) {
                        logger.error(err);
                        res.send({msg: err.message, status: 500});
                    }).execute({transaction: true});
            
    } else {
        res.send(403);
    }
};


 