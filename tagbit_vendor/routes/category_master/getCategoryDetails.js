/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    if (req.user) {
        if (req.user.email == req.body.email) {
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT * FROM categories WHERE id=?",
                        params: [req.body.id]
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){
                        res.send({category: rows[0], status: 200});
                    } else {
                        res.send({msg: "Invalid Category id", status: 500});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
        } else {
            res.send(403);
        }
    } else {
        res.send(403);
    }
};

exports.getAllCategories = function (req, res) {
            easydb(dbPool)
                .query(function () {
                    return {
                        query: "SELECT * FROM categories",
                        params:[]
                        
                    };
                })
                .success(function (rows) {
                    if (rows.length > 0){
                        res.send({items: rows, status: 200});
                    } else {
                        res.send({msg: "Cannot retrieve data", status: 500});
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    res.send({msg: err.message, status: 500});
                }).execute();
};

exports.getCategoryDetailsWithKeywords = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "select categories.logo_category, categories.card_category, categories.other_category, categories.id, categories.seo_title, categories.seo_description, categories.seo_keyword, categories.category_name,categories.category_desc,categories.url, group_concat(keywords.keyword) as keyword,group_concat(keywords.id) as keyword_id from categories left join category_keyword on category_keyword.category_id=categories.id  left join keywords  on category_keyword.keyword_id=keywords.id where categories.id=? order by categories.id desc",
                params:[req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0){
                res.send({items: rows[0], status: 200});
            } else {
                res.send({msg: "Cannot retrieve data", status: 500});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};
