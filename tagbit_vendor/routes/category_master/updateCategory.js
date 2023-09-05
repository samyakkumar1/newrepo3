
exports.index = function (req, res) {
    var pool = easydb(dbPool);
    pool
        .query(function () {
            return {
                query: "UPDATE `categories` set category_name=?, category_desc=?,url=?, seo_title=?, seo_description=?, seo_keyword=?, logo_category = ?, card_category = ?, other_category = ? where id=?",
                params: [req.body.category_name, req.body.category_desc, req.body.url || null, req.body.seo_title, req.body.seo_description, req.body.seo_keyword, req.body.logo_category, req.body.card_category, req.body.other_category, req.body.id]
            };
        })
        .query(function () {
            return {
                query: "DELETE FROM category_keyword WHERE category_id = ?",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (req.body.keywords){
                var keywords;
                if (typeof req.body.keywords == "string"){
                    keywords = req.body.keywords.split(",");
                } else {
                    keywords = req.body.keywords;
                }
                var i = 0;
                var added = [];
                var fn = function () {
                    pool
                        .query(function () {
                            return {
                                query: "SELECT id FROM keywords WHERE keyword = ?",
                                params: [keywords[i]]
                            };
                        })
                        .success(function (rows) {
                            if (rows.length <= 0) {
                                pool.query(function () {
                                    return {
                                        query: "INSERT INTO keywords (keyword) VALUES (?)",
                                        params: [keywords[i]]
                                    };
                                })
                            } else {
                                pool.query(function () {
                                    return {
                                        query: "SELECT ? AS keywordId FROM DUAL",
                                        params: [rows[0].id]
                                    };
                                })
                            }
                            pool.success(function (actualRows) {
                                var keywordId = actualRows[0] ? actualRows[0].keywordId : actualRows.insertId;
                                pool
                                    .query(function () {
                                        return {
                                            query: "SELECT 1 FROM category_keyword WHERE category_id = ? AND keyword_id = ?",
                                            params: [req.body.id, keywordId]
                                        };
                                    })
                                    .success(function (rows) {
                                        if (rows.length > 0){
                                            /* Do Nothing */
                                        } else {
                                            if (added.indexOf(keywordId) == -1) {
                                                added.push(keywordId);
                                                pool.query(function () {
                                                    return {
                                                        query: "INSERT INTO category_keyword VALUES (?, ?)",
                                                        params: [req.body.id, keywordId]
                                                    };
                                                })
                                            }
                                        }
                                        i++;
                                        if (i < keywords.length) {
                                            fn();
                                        } else {
                                            res.send({status: 200});
                                        }
                                    })
                            });
                        })
                };
                fn();
            } else {
                res.send({status: 200});
            }
        })
        .error(function (err) {
            logger.error(err);
            if (err.message.indexOf("ER_DUP_ENTRY") >= 0){
                res.send({msg: "Duplicate SEO URL found", status: 500});
            } else {
                res.send({msg: err.message, status: 500});
            }
        }).execute({transaction: true});
};
