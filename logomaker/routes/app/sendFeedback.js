exports.index = function (req, res) {
    if (validateEmail(req.body.email)) {
        var mailOptions = {
            from: config.emailConfig.auth.user,
            replyTo: req.body.email,
            to: config.emailConfig.auth.user,
            subject: 'Feedback: ' + req.body.name,
            text: req.body.message
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                logger.error(err);
                res.status(500).send({status: 500, msg: err.code});
            } else {
                res.send({status: 200});
            }
        });
        sendMail("feedbackAck", {name: req.body.name, feedback: req.body.message}, {to: req.body.email, subject: "Thank you for your feedback"});
    } else { 
        res.send({msg: "Invalid email specified", status: 500});
    }
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
