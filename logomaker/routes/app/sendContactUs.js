/**
 * Created by HS on 12-06-2020.
 */

exports.index = function (req, res) {
    //res.send({msg: "Returning ....", status: 200});
    if (validateEmail(req.body.email)) {
        var mailOptions = {
            from: global.config.emailConfig.auth.user, //req.body.name + " <" + req.body.email +">",
            sender: req.body.name + " <" + global.config.emailConfig.auth.user + ">",
            replyTo: req.body.email,
            to: config.emailConfig.auth.user,
            subject: "Enquiry: " + req.body.subject,
            html: req.body.message
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                logger.error(err);console.log(err);
                res.send({status: 500, msg: err.code});
            } else {
                res.send({status: 200});              
            }
        });
        sendMail("contactUsAck", {name: req.body.name, subject: req.body.subject, message: req.body.message}, {to: req.body.email, subject: "Thank you for contacting us"});
    } else { 
        res.send({msg: "Invalid email specified", status: 500});
    }
};


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
