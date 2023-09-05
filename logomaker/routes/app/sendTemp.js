/**
 * Created by DesignerBe on 27-01-2020.
 */

exports.index = function (req, res) {
    sendMail("lastChance", {}, {to: "naina@printbindaas.com", subject: "Last chance to buy your logo!"}, function (){
        res.status(200).end();
    }, function (err){
        res.status(500).end();
    });
};