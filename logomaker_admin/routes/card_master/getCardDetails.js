/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT cards.*, GROUP_CONCAT(card_categories.category_id) as categories FROM cards INNER JOIN card_categories ON card_categories.card_id = cards.id WHERE id=? GROUP BY card_categories.card_id",
                params: [req.body.id]
            };
        })
        .success(function (rows) {
            if (rows.length > 0) {
                res.send({card: rows[0], status: 200});
            } else {
                res.send({msg: "Invalid Card id", status: 500});
            }
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};