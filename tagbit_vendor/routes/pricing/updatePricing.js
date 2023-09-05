
exports.index = function (req, res) {
    var easyDb = easydb(dbPool);
    for (var i = 0; i < req.body.card.length; i++) {
        var card_pricing = req.body.card[i];
        easyDb.query({
            query: "INSERT INTO vc_pricing (`country`, `finish`, `qty`, `premium`, `back_side`, `super_premium`, `back_side_super_premium`, `std_shipping`, `exp_shipping`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params: [card_pricing.country, card_pricing.finish, card_pricing.qty, card_pricing.premium, card_pricing.back_side, card_pricing.super_premium, card_pricing.back_side_super_premium, card_pricing.std_shipping, card_pricing.exp_shipping]
        });
    }
    for (var i = 0; i < req.body.logo.length; i++) {
        var logo_pricing = req.body.logo[i];
        easyDb.query({
            query: "INSERT INTO logo_pricing (`country`, `price`, `color_changes`) VALUES(?, ?, ?)",
            params: [logo_pricing.country, logo_pricing.price, logo_pricing.color_changes]
        });
    }
    easyDb
        .success(function (rows) {
            res.send({status: 200});
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute({transaction: true});
};