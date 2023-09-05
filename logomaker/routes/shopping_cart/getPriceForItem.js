/**
 * Created by Harikrishnan on 06-01-2015.
 */

exports.index = function (req, res) {
    getPriceForItem(req.body.country, req.body.type, (typeof req.body.itemId == "string" && req.body.itemId.indexOf("card_") == 0) ? req.body.cardObj : req.body.itemId, function (msg) {
        res.send(msg);
    });
};

function getPriceForItem(country, type, item, callback) {
    if (!country) {
        country = 1;
    }
    var currency = "USD";
    easydb(dbPool)
            .query(function () {
                return {
                    query: "SELECT * FROM countries WHERE code = ?",
                    params: [country]
                };
            })
            .success(function (countryInfo) {
                var status;
                if (countryInfo.length > 0) {
                    country = countryInfo[0].id;
                    currency = countryInfo[0].currency;
                    status = 200;
                } else {
                    country = 1;
                    currency = "USD";
                    status = 201;
                }
                if (type == "LOGO") {
                    easydb(dbPool)
                            .query(function () {
                                return {
                                    query: "SELECT * FROM logo_pricing WHERE country = ?",
                                    params: [country]
                                };
                            })
                            .success(function (rows) {
                                if (rows.length > 0) {
                                    callback({price: rows[0].price, currency: currency, status: status});
                                } else {
                                    throw new Error("USD entry not found in pricing.");
                                }
                            })
                            .error(function (err) {
                                logger.error(err);
                                callback({msg: err.message, status: 500});
                            }).execute();
                }else if (type == "CUSTOM") {
                    easydb(dbPool)
                            .query(function () {
                                return {
                                    query: "SELECT * FROM user_other_products_custom WHERE id = ?",
                                    params: [item]
                                };
                            })
                            .success(function (rows) {
                                if (rows.length > 0) {
                                    var price = (rows[0].coupan_applied == 1 || rows[0].coupan_applied == '1')?rows[0].new_price:rows[0].price
                                    callback({price: price, currency: currency, status: status});
                                } else {
                                    throw new Error("USD entry not found in pricing.");
                                }
                            })
                            .error(function (err) {
                                logger.error(err);
                                callback({msg: err.message, status: 500});
                            }).execute();
                } else if (type == "BC") {
                    var getPricing = function (cardDetails) {
                        easydb(dbPool)
                                .query(function () {
                                    return {
                                        query: "SELECT * FROM vc_pricing WHERE country = ?",
                                        params: [country]
                                    };
                                })
                                .success(function (rows) {
                                    if (rows.length > 0) {
                                        callback({
                                            price: getPrice(rows, cardDetails),
                                            currency: currency,
                                            status: status
                                        });
                                    } else {
                                        status = 201;
                                        country = 1;
                                        currency = "USD";
                                        easydb(dbPool)
                                                .query(function () {
                                                    return {
                                                        query: "SELECT * FROM vc_pricing WHERE country = ?",
                                                        params: [1]
                                                    };
                                                })
                                                .success(function (rows) {
                                                    if (rows.length > 0) {
                                                        callback({
                                                            price: getPrice(rows, cardDetails),
                                                            currency: currency,
                                                            status: status
                                                        });
                                                    } else {
                                                        throw new Error("USD entry not found in pricing");
                                                    }
                                                })
                                                .error(function (err) {
                                                    logger.error(err);
                                                    callback({msg: err.message, status: 500});
                                                }).execute();
                                    }
                                })
                                .error(function (err) {
                                    logger.error(err);
                                    callback({msg: err.message, status: 500});
                                }).execute();
                    };
                    if (typeof item == "object") {
                        getPricing(item);
                    } else {
                        easydb(dbPool)
                                .query(function () {
                                    return {
                                        query: "SELECT * FROM user_cards WHERE id = ?",
                                        params: [item]
                                    };
                                })
                                .success(function (cardDetails) {
                                    if (cardDetails.length > 0) {
                                        getPricing(cardDetails[0]);
                                    } else {
                                        throw new Error("Invalid card.");
                                    }
                                })
                                .error(function (err) {
                                    logger.error(err);
                                    callback({msg: err.message, status: 500});
                                }).execute();
                    }
                } else {
                    getOtherProductPricing(country, currency, item, callback);
                }
            })
            .error(function (err) {
                logger.error(err);
                callback({msg: err.message, status: 500});
            }).execute();
}

global.getPriceForItem = getPriceForItem;

function getPrice(priceDetails, cardDetails) {
    var total = 0;
    if (cardDetails.purchase_design && cardDetails.dont_print_card) {
        if (priceDetails.length > 0) {
            total = priceDetails[0].card_design;
        }
    } else {
        priceDetails.forEach(function (val, idx) {
            if (cardDetails.qty == val.qty) {
                if (cardDetails.finish == val.finish) {
                    if (cardDetails.paper_stock == "UltraPremium") {
                        total += val.super_premium;
                    } else {
                        total += val.premium;
                    }
                    if (cardDetails.back_of_card != "Blank") {
                        total += val.back_side;
                    }
                    if (cardDetails.back_side_super_premium == 1) {
                        total += val.back_side_super_premium;
                    }
                    if (cardDetails.shipping_type == "Exp") {
                        total += val.exp_shipping;
                    } else {
                        total += val.std_shipping;
                    }
                    if (cardDetails.purchase_design) {
                        total += val.card_design;
                    }
                }
            }
        });
    }
    return total;
}

function getOtherProductPricing(country, currency, item, callback) {
    var getOtherProdcutSettingValuePrice = function (settingValueId, _priceCallback) {
        var sql = "SELECT independent_pricing, value_label, price FROM other_products_pricing INNER JOIN other_product_setting_values ON other_product_setting_values.id = other_products_pricing.setting_id INNER JOIN other_product_settings ON other_product_setting_values.setting_id = other_product_settings.id WHERE other_products_pricing.setting_id = ? AND country_id = ?  AND other_product_settings.status = 'Active' AND other_product_setting_values.status = 'Active'";
        easydb(dbPool)
                .query(function () {
                    return {
                        query: sql,
                        params: [settingValueId, country]
                    };
                })
                .success(function (price) {
                    var status = 200;
                    if (price.length > 0) {
                        _priceCallback(undefined, status, price[0].price, currency, price[0].value_label, price[0].independent_pricing == true);
                    } else { 
                        var newCountry = 1;
                        var newCurrency = "USD";
                        easydb(dbPool)
                            .query(function () {
                                return {
                                    query: sql,
                                    params: [settingValueId, newCountry]
                                };
                            })
                            .success(function (rows) {
                                if (rows.length > 0) {
                                    _priceCallback(undefined, 201, rows[0].price, newCurrency, rows[0].value_label, rows[0].independent_pricing == true);
                                } else {
                                    _priceCallback(undefined, status, 0, undefined, undefined, false/*rows[0].value_label, rows[0].independent_pricing == true*/);
                                    //throw new Error("USD entry not found in pricing");
                                }
                            })
                            .error(function (err) {
                                logger.error(err);
                                _priceCallback({msg: err.message, status: 500});
                            }).execute();
                    }
                })
                .error(function (err) {
                    logger.error(err);
                    callback({msg: err.message, status: 500});
                }).execute();
    };
    
    var getOtherProdcutsTotalPrice = function (settings, _totalPriceCallback) {
        var settingIdx = -1;
        var totalCurrency = undefined;
        var resp_status = 200;

        var qty = 0;
        var qty_base_price;
        var totalQtyCount = 0;
        var totalOtherSettingsPrice = 0;
        var totalIndependentPrice = 0;
         
        for (var i = 0; i < settings.length; i++){
            if (settings[i].control_type == "QuantityWithSize"){
                totalQtyCount ++;
            }
        }
 
        var _calculateValue = function () {
            settingIdx++;
            if (settingIdx >= settings.length) {
                _totalPriceCallback({status: resp_status, qty: qty, price: (qty * (qty_base_price + totalOtherSettingsPrice)) + totalIndependentPrice, currency: totalCurrency});
                return;
            }
            var item = settings[settingIdx]; 
            var _updateOtherProductTotalPrice = function (err, status, price, currency, label, isIndependent) {
                if (err) {
                    _totalPriceCallback(err);
                } else {
                    if (isIndependent){
                        totalIndependentPrice += price;
                    } else {
                        totalOtherSettingsPrice += price;
                    }
                    if (totalCurrency) {
                        if (currency){
                            if (currency != totalCurrency) {
                                _totalPriceCallback({status: 500, msg: "Can't calculate price for a whole currency. Please update pricing settings."});
                            }
                        }
                    } else {
                        totalCurrency = currency;
                    }
                    if (status != 200) {
                        resp_status = status;
                    }
                    _calculateValue();
                }
            };
            var _findPriceFromQty = function (qty, rows, callTotalPriceCalc){
                var settingId;
                for (var j = 0; j < rows.length; j++) {
                    var splitted = rows[j].value_label.split("-");
                    if (splitted.length > 1) {
                        var minVal = parseFloat(splitted[0]);
                        var maxVal = parseFloat(splitted[1]);
                        if (parseFloat(qty) >= minVal && parseFloat(qty) <= maxVal) {
                            settingId = rows[j].id; 
                            break;
                        }
                    } else {
                        settingId = rows[j].id;
                    }
                }
                if (callTotalPriceCalc){
                    getOtherProdcutSettingValuePrice(settingId, function (err, status, price, currency, label, isIndependent) {
                        if (err) {
                            _totalPriceCallback(err);
                        } else {
                            qty_base_price = price; 
                            //console.log(label, " - (" + qty + ")", price);
                            if (resp_status == 200){
                                resp_status = status;
                            } 
                            if (totalCurrency) {
                                if (currency != totalCurrency) {
                                    _totalPriceCallback({status: 500, msg: "Can't calculate price for a whole currency. Please update pricing settings."});
                                    return;
                                }
                                _calculateValue();
                            } else {
                                totalCurrency = currency;
                                _calculateValue();
                            }
                        }
                    });
                }
            };
            switch (item.control_type) {
                case "Quantity":
                case "QuantityWithSize":{
                    easydb(dbPool)
                        .query(function () {
                            return {
                                query: "SELECT id, value_label FROM other_product_setting_values WHERE setting_id = ? AND status = 'Active' ORDER BY id",
                                params: [item.related_setting]
                            };
                        })
                        .success(function (rows) {
                            if (rows.length > 0) {
                                if (item.control_type == "QuantityWithSize"){
                                    totalQtyCount--;
                                    qty += parseFloat(item.setting_value.split("=")[1]);
                                    if (totalQtyCount == 0){
                                        _findPriceFromQty(qty, rows, true); 
                                    } else {
                                        _calculateValue();
                                    }
                                } else {
                                    qty = item.setting_value;
                                    _findPriceFromQty(qty, rows, true);  
                                }
                            } else {
                                throw new Error("Invalid settings for " + JSON.stringify(item));
                            }
                        })
                        .error(function (err) {
                            logger.error(err);
                            _totalPriceCallback({msg: err.message, status: 500});
                        }).execute();
                    break;
                }
                default:
                { 
                    getOtherProdcutSettingValuePrice(item.setting_value, _updateOtherProductTotalPrice); 
                    break;
                }
            }
        };
        _calculateValue();
    };
    
    easydb(dbPool)
        .query(function () {
            return {
                query: "SELECT related_setting, control_type, product_settings_id, setting_value FROM user_other_product_settings INNER JOIN other_product_settings ON other_product_settings.id = user_other_product_settings.product_settings_id WHERE user_other_product_id = ? ORDER BY control_type",
                params: [item]
            };
        })
        .success(function (cardDetails) {
            if (cardDetails.length > 0) {
                getOtherProdcutsTotalPrice(cardDetails, function (data) {
                    callback(data);
                });
            } else {
                throw new Error("Invalid product.");
            }
        })
        .error(function (err) {
            logger.error(err);
            callback({msg: err.message, status: 500});
        }).execute();
}