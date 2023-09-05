/**
 * Created by Designerbe on 05-10-2020.
 */
var crypto = require('crypto');

exports.index = function (req, res) {
    console.log('I have been triggered!');
    if (isEmptyString(req.body.email) || isEmptyString(req.body.md5_password) || isEmptyString(req.body.salt)) {
        res.send({status: 500, msg: "Please fill all required fields"});
    } else {
        var usertype = 'DESIGNER';
        if(req.body.usertype){
            usertype = 'CUSTOMER';
        }
        var otp = Math.floor(1000 + Math.random() * 9000);
        addUser(otp,usertype,req.body.email, req.body.md5_password, req.body.salt, function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send({status: 200});
            }
        });
        
    }
};

function addUser(otp,usertype,email, md5_password, salt, callback) {
    if (validateEmail(email)){
        easydb(dbPool)
            .query(function () {
                return {
                    query: "INSERT INTO users (`otp`,`usertype`,`email`, `md5_password`, `salt`, `regd_at`, `verified`) VALUES (?, ? ,?, ?, ?, CURRENT_TIMESTAMP, 0);",
                    params: [otp,usertype,email, md5_password, salt]
                };
            })
            .success(function (rows) {
                //console.log('Inside Mail Send!');
                //console.log(email);
                //sendMail("createAccount", {name: "user_name"}, {to: email, subject: "Welcome to Tagbit!"});

                var link = config.APP_DOMAIN + "/emailverification?id="+rows.insertId+"-"+otp;
                sendMail("otpVerification", {
                    link: link,
                    name: usertype
                }, {from: config.emailConfig.auth.user, to: email, subject: 'Tagbit.co email verification'}, function (){
                    callback(undefined, rows.insertId);
                }, function (err) {
                    callback({msg: err, status: 500});
                });
            })
            .error(function (err) {
                if (err.message.indexOf("ER_DUP_ENTRY") > -1) {
                    callback({msg: "User already exists with the specified email ID.", status: 500});
                } else {
                    logger.error(err);
                    callback({msg: err.message, status: 500});
                }
            }).execute();
    } else {
        callback({status: 500, msg: "Invalid email " + email});
    }
}

global.addUser = addUser;

function addTempUser(email, md5_password, salt, callback) {
    if (validateEmail(email)){
        easydb(dbPool)
            .query(function () {
                return {
                    query: "INSERT INTO users (`email`, `md5_password`, `salt`, `regd_at`, `usertype` ,`verified`) VALUES (?, ?, ?, CURRENT_TIMESTAMP,'CUSTOMER', 1);",
                    params: [email, md5_password, salt]
                };
            })
            .success(function (rows) {
                callback(undefined, rows.insertId);
            })
            .error(function (err) {
                callback(true, err);
            }).execute();
    } else {
        callback(true,"Invalied email");
    }
}

global.addTempUser = addTempUser;

function prepareAttachements(cards, logos){
    var attachmentArray = [];
    for (var i = 0; i < 4 && i < cards.length; i++){
        attachmentArray.push({
            filename: "prev_card_" + i + '.jpg',
            cid: "prev_card_" + i + "@logomaker.com",
            contentType: "image/jpg",
            path: config.APP_DOMAIN + '/generateImage?url=' + cards[i].s3_front_card_url + '&type=card&nodownload=true&from=base&format=jpeg'
        });
    } 
    for (var i = 0; i < 3 && i < logos.length; i++){
        attachmentArray.push({
            filename: "prev_logo_" + i + '.jpg',
            cid: "prev_logo_" + i + "@logomaker.com",
            contentType: "image/jpg",
            path: config.APP_DOMAIN + '/generateImage?height=124&width=124&url=' + logos[i].s3_logo_url + '&type=logo&nodownload=true&from=base&format=jpeg'
        });
    }
    attachmentArray.push({
        filename: "static_banner.jpg",
        cid: "static_banner@logomaker.com",
        contentType: "image/jpg",
        path: config.APP_DOMAIN + '/img/email/banner01.jpg'
    });
    attachmentArray.push({
        filename: "free_logo.jpg",
        cid: "free_logo@logomaker.com",
        contentType: "image/jpg",
        path: config.APP_DOMAIN + '/img/email/online_free_logo.jpg'
    });
    attachmentArray.push({
        filename: "discount.jpg",
        cid: "discount@logomaker.com",
        contentType: "image/jpg",
        path: config.APP_DOMAIN + '/img/email/special_offer.png'
    });
    return attachmentArray;
}

function getCustomCardImages(callback) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT s3_front_card_url, url FROM cards WHERE status <> 'DELETED' AND url IS NOT NULL AND url <> '' ORDER BY RAND() LIMIT 4",
                params: []
            };
        })
        .success(function (rows) {
            callback(rows);
        })
        .error(function (err) {
            logger.error(err);
            callback();
        }).execute();
}

function getCustomLogoImages(callback) {
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT s3_logo_url, url FROM logos WHERE status <> 'DELETED' AND url IS NOT NULL AND url <> '' ORDER BY RAND() LIMIT 3",
                params: []
            };
        })
        .success(function (rows) {
            callback(rows);
        })
        .error(function (err) {
            logger.error(err);
            callback();
        }).execute();
} 

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

global.prepareAttachements_ = prepareAttachements;
global.getCustomCardImages_ = getCustomCardImages;
global.getCustomLogoImages_ = getCustomLogoImages;