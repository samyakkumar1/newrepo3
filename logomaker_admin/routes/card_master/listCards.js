/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT cards.id AS id, title, cards.desc, s3_front_card_url, s3_back_card_url, GROUP_CONCAT(categories.category_name) AS category_name FROM cards INNER JOIN categories INNER JOIN card_categories ON card_categories.card_id = cards.id AND categories.id = card_categories.category_id WHERE cards.status <> 'Deleted' GROUP BY cards.id ORDER BY id DESC LIMIT ?, ?",
                params: [req.body.start ? parseInt(req.body.start) : 0, 10]
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
};