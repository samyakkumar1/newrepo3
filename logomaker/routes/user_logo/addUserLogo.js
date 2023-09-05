/**
 * Created by DesignerBe on 05-10-2020.
 */

var fs = require('fs');

exports.index = function (req, res) {
    if (req.user) {
        saveLogoFile(req.body.url, function (err, filename) {
            if (err) {
                res.send({msg: "Can't save logo file", status: 500});
            } else {
                var sendRegMail = false;
                easydb(dbPool)
                    .query(function () {
                        return {
                            query: "SELECT 1 FROM `user_logos` WHERE `user_id` = ?",
                            params: [req.user.id]
                        };
                    })
                    .success(function (rows) {
                        if (rows.length == 0) {
                            sendRegMail = true;
                        }
                    })
                    .query(function () {
                        return {
                            query: "INSERT INTO `user_logos` (`user_id`, `base_logo_id`, `company_name`, `slogan`, `s3_logo_url`, `created_at`) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);",
                            params: [req.user.id, req.body.base_item_id, req.body.company_name, req.body.slogan, filename]
                        };
                    })
                    .success(function (rows) {
                        if (sendRegMail) {
                            var email = req.user.email;
                            var emailName = email.substring(0, email.indexOf("@"));
                            emailName = emailName.slice(0,1).toUpperCase() + emailName.substring(1);
                            getCustomCardImages(function (cardImage) {
                                sendMail("register_from_logomaker", {
                                    base: config.APP_DOMAIN,
                                    name: emailName,
                                    cardImage: cardImage,
                                    logoImage: {id: rows.insertId, url: filename},
                                    companyName: req.body.company_name
                                }, {attachments: prepareAttachements(cardImage, {id: rows.insertId, url: filename}), from: config.emailConfig.auth.user, to: email, subject: emailName + ", buy " + req.body.company_name + " logo before anyone else takes it!"});
                            });
                        }
                        res.send({status: 200, insertId: rows.insertId, url: filename});
                    })
                    .error(function (err) {
                        logger.error(err);
                        res.send({msg: err.message, status: 500});
                    }).execute();
            }
        });
    } else {
        res.send(403);
    }
};

function prepareAttachements(cards, logo){
    var attachmentArray = [];
    for (var i = 0; i < 4; i++){
        attachmentArray.push({
            filename: "prev" + i + '.jpg',
            cid: "prev" + i + "@logomaker.com",
            contentType: "image/jpg",
            path: config.APP_DOMAIN + '/generateImageWithLogo?url=' + cards[i].path + '&width=348&height=204&type=card&logoUrl=' + logo.url + '&nodownload=true'
        });
    }
    attachmentArray.push({
        filename: 'logo.jpg',
        cid: "logo@logomaker.com",
        contentType: "image/jpg",
        path: config.APP_DOMAIN + '/generateImage?nodownload=true&format=jpg&width=200&height=200&type=logo&url=' + logo.url
    });
    attachmentArray.push({
        filename: 'banner.jpg',
        cid: "banner@logomaker.com",  
        contentType: "image/jpg",
        path: config.APP_DOMAIN + '/generateImageWithLogo?quality=100&width=600&height=350&url=1.svg&type=banner&logoUrl=' + logo.url + '&nodownload=true'
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
    fs.readFile(global.appRoot + "/public/img/cards/list.json", function (err, data) {
        if (err) {
            console.error(err);
            callback();
        } else { 
            callback(shuffle(JSON.parse(data)));
        }
    }); 
}

function saveLogoFile(contents, callback) {
    var fileName = Date.now() + ".svg";
    contents = contents.replace(/ArialMT/g, "Arial");
    contents = contents.replace(/Arial-BoldMT/g, "Arial");
    fs.writeFile(config.USER_LOGO_PATH + "/" + fileName, contents, function (err) {
        if (err) {
            logger.error(err);
            callback(err);
        } else {
            callback(undefined, fileName);
        }
    });
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex; 
    while (0 !== currentIndex) { 
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1; 
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    } 
    return array;
}