var dateFormat = require('dateformat');

exports.dayExpired = function () {
    logger.info("Doing daily actions: ", new Date());
    var logos, cards;
    var interval = (config.WARNING_EMAILS_INTERVAL_DAYS || [1, 3, 7]).sort(function (a, b) {
        return a < b;
    });
    easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT user_logos.s3_logo_url, TRIM(CONCAT(users.first_name, ' ', users.last_name)) AS name, user_logos.user_id, DATEDIFF(NOW(), user_logos.created_at) AS date_diff, users.email FROM user_logos INNER JOIN users ON users.id = user_logos.user_id WHERE user_logos.status <> 'Deleted' AND DATEDIFF(NOW(), created_at) IN (?)",
                    params: [interval]
                };
            })
            .success(function (rows) {
                logos = rows;
            })
            .query(function () {
                return {
                    query: "SELECT user_cards.s3_front_card_url, TRIM(CONCAT(users.first_name, ' ', users.last_name)) AS name, user_cards.user_id, DATEDIFF(NOW(), user_cards.created_at) AS date_diff, users.email FROM user_cards INNER JOIN users ON users.id = user_cards.user_id WHERE user_cards.status <> 'Deleted' AND DATEDIFF(NOW(), created_at) IN (?)",
                    params: [interval]
                };
            })
            .success(function (rows) {
                cards = rows;
                var emailContents = {};
                var discountLine = "";
                logos.forEach(function (val, idx) {
                    var key = val.user_id + "_" + val.date_diff;
                    if (!emailContents[key]) {
                        emailContents[key] = {};
                        emailContents[key].files = [];
                        emailContents[key].card_count = 0;
                        emailContents[key].logo_count = 0;
                    }
                    emailContents[key].logo_count++;
                    emailContents[key].s3_logo_url = val.s3_logo_url;
                    emailContents[key].email = val.email;
                    emailContents[key].name = val.name || val.email;
                    emailContents[key].date_diff = val.date_diff;
                    emailContents[key].files.push(
                            {
                                cid: "logo_" + val.s3_logo_url + ".jpeg",
                                contentType: 'image/jpeg',
                                path: config.APP_DOMAIN + "/generateImage?quality=100&height=75&width=100&format=jpeg&type=logo&url=" + val.s3_logo_url
                            }
                    );
                });
                cards.forEach(function (val, idx) {
                    var key = val.user_id + "_" + val.date_diff;
                    if (!emailContents[key]) {
                        emailContents[key] = {};
                        emailContents[key].files = [];
                        emailContents[key].logo_count = 0;
                        emailContents[key].card_count = 0;
                    }
                    emailContents[key].card_count++;
                    emailContents[key].email = val.email;
                    emailContents[key].s3_front_card_url = val.s3_front_card_url;
                    emailContents[key].name = val.name || val.email;
                    emailContents[key].date_diff = val.date_diff;
                    emailContents[key].files.push(
                            {
                                cid: "card_" + val.s3_front_card_url + ".jpeg",
                                contentType: 'image/jpeg',
                                path: config.APP_DOMAIN + "/generateImage?quality=100&height=115&width=200&format=jpeg&type=card&url=" + val.s3_front_card_url
                            }
                    );
                });

                if (config.FLAT_DISCOUNT_CARD == config.FLAT_DISCOUNT_LOGO) {
                    discountLine = " FLAT " + config.FLAT_DISCOUNT_CARD + "% OFF on logo and card purchases."
                } else {
                    discountLine = " FLAT " + config.FLAT_DISCOUNT_CARD + "% OFF on logo purchase and " + config.FLAT_DISCOUNT_CARD + "% OFF on card purchases.";
                }
                for (var key in emailContents) {
                    if (emailContents.hasOwnProperty(key)) {
                        var item = emailContents[key];
                        var items_desc = [];
                        if (emailContents[key].card_count > 0) {
                            items_desc.push("cards");
                        }
                        if (emailContents[key].logo_count > 0) {
                            items_desc.push("logos");
                        }
                        var date = new Date();
                        date.setDate(date.getDate() + item.date_diff);
                        item.date = dateFormat(date, "mmm dd, yyyy");
                        /*
                         sendMail("lastChance", {
                         name: item.name,
                         items: items_desc.join(" and "),
                         days: item.date_diff,
                         files: item.files,
                         date: item.date,
                         discount: discountLine
                         }, {
                         to: item.email,
                         subject: "Last chance to purchase your items from us.",
                         attachments: item.files
                         });
                         */
                        console.log(item);
                    }
                }
            })
            .query(function () {
                return {
                    query: "UPDATE user_logos SET status = 'Deleted' WHERE DATEDIFF(NOW(), created_at) > ?",
                    params: [interval[0]]
                };
            })
            .query(function () {
                return {
                    query: "UPDATE user_cards SET status = 'Deleted' WHERE DATEDIFF(NOW(), created_at) > ?",
                    params: [interval[0]]
                };
            })
            .error(function (err) {
                logger.error(err.stack);
            }).execute();
};