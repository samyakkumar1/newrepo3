/**
 * Created by DesignerBe on 05-10-2020.
 */

exports.index = function (req, res) {
    if (req.user) {
        var card;
        easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM user_cards WHERE id = ? AND user_id = ?",
                    params: [req.body.id, req.user.id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    card = rows[0];
                } else {
                    throw new Error("Invalid Card id");
                }
            })
            .query(function () {
                return {
                    query: "SELECT url FROM cards WHERE id = ?",
                    params: [card.base_card_id]
                };
            })
            .success(function (rows) {
                if (rows.length > 0){
                    card.base_card_url = rows[0].url;
                }
                res.send({card: card, status: 200});
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
    } else {
        res.send(403);
    }
};