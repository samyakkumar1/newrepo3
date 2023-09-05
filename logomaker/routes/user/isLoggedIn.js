/**
 * Created by DesignerBe on 13-11-2020.
 */

exports.index = function (req, res) {
    if (req.user){
        res.send({status: true, user: req.user});
    } else {
        res.send({status: false});
    }


};



