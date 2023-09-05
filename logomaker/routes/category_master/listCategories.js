/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) { 
    var conditions = [];
    if (req.body.type){
        if (req.body.type.indexOf("LOGO") > -1){ 
            conditions.push("logo_category = 1");
        }
        if (req.body.type.indexOf("BC") > -1){ 
            conditions.push("card_category = 1");
        }
        if (req.body.type.indexOf("OTHER") > -1){ 
            conditions.push("other_category = 1");
        }
        conditions.push("1 = 1")
    }
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT * FROM categories WHERE status <> 'Deleted' AND " + conditions.join(" AND "),
                params: []
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                res.send({categories: rows, status: 200});
            } else {
                res.send({msg: "No category found", status: 201});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};