var async = require("async");
var md5 = require('md5');

var filterdata = {};

exports.index = function (req, res) {
    var  userid = 0;
    easydb(dbPool)
        .query(function () {
            return {
                query: "select * from users where email = ?",
                params: [req.body.email_id]
            };
        })
        .success(function (rows) {
            console.log(rows)
            if(rows.length > 0){
                userid = rows[0]["id"];
                setCartDetails(req,userid,function(err,results){
                    console.log(" results :",results);
                    console.log("req.body.cartDetails :",req.body.cartDetails)
                    if(results[userid].length == req.body.cartDetails.length){
                        console.log("Hello")
                        saveAllDetails(req,userid,results[userid],function(err,susc){
                        if(err){
                            console.log("Error",err);
                            deleteRecords(susc,userid);
                            res.send({status: 500,msg:"Something went wrong . Please try again latter"});
                        }else{
                            res.send({status: 200,msg:{userid:userid,email:req.body.email_id}});
                        } 
                        })      
                    }else{
                        res.send({status:500,msg:"Some manipulation is done in client side"});
                    }
                })
            }else{
                var password = generatePassword();
                var salt = getNewRandomNumber(1000, 9999);
                var md5_password = md5(salt + ":" + password);
                console.log("md5Password",md5_password);
                sendMail("accountCreated", {
                    password: password,
                    email: req.body.email_id
                }, {from: config.emailConfig.auth.user, to: req.body.email_id, subject: 'Tagbit.co Account Created'}, function (){
                    console.log("Email sent");
                }, function (err) {
                    console.log("Email sent error ", err);
                });

                addTempUser(req.body.email_id, md5_password, salt, function (err, userId) {
                    console.log(req.body);
                    console.log("Err :",err)
                    if (err) {
                        res.send(err);
                    } else {
                        userid = userId
                        // updateUser(req.body.first_name, req.body.last_name, req.body.phone_num, req.body.address_1 + "\n" + req.body.address_2, req.body.country, req.body.city, req.body.state, req.body.postal_code, userId, req.body.email_id, req.body.md5_password, function (err) {
                        //     if (err) {
                        //         res.send(err);
                        //     }
                        // });
                        setCartDetails(req,userid,function(err,results){
                            if(results[userid].length == req.body.cartDetails.length){
                                saveAllDetails(req,userid,results[userid],function(err,susc){
                                if(err){
                                    deleteRecords(susc,userid);
                                    res.send({status: 500,msg:"Something went wrong . Please try again latter"});
                                }else{
                                    res.send({status: 200,msg:{userid:userid,email:req.body.email_id}});
                                } 
                                })
                            }else{
                                    easydb(dbPool)
                                    .query(function () {
                                        return {
                                            query: "delete from users where id = ?",
                                            params: [userid]
                                        };
                                    }).execute();
                                res.send({status:500,msg:"Some manipulation is done in client side"});
                            }
                        })
                    }
                }, true)
            }
        })
        .error(function (err) {
console.log("Error",err);        })
        .execute();
};

function getNewRandomNumber(min, max) {
    return Math.round((Math.random() * (max - min)) + min);
}

function setCartDetails(req,userid,callback){
    var cartDetails = req.body.cartDetails;
    cartDetails.map(function(item,i){
        cartDetails[i].product.userid = userid;
    })
    var a=0;
    filterdata[userid] = [];
    q.push(cartDetails, 1, function(err) {
        a++;
        console.log("A :",a)
        console.log("cartDetails.length :",cartDetails.length)
        if(a == cartDetails.length){
            callback(undefined,filterdata);
            a=0;
            console.log('Finished processing item');
        }
    });
    
}

function get_product_details(prIds,callback){
    easydb(dbPool)
        .query(function () {
            return {
                query: "select * from other_product_details where id = ?",
                params: [prIds]
            };
        }).success(function(rows){
            callback(undefined,rows);
        }).execute();
}

function get_coupan_details(cpncode,prid,callback){
    easydb(dbPool)
        .query(function () {
            return {
                query: "select * from coupancode where code = ? And other_product_detail_id = ?",
                params: [cpncode,prid]
            };
        }).success(function(rows){
            callback(undefined,rows);
        }).execute();

}

function saveAllDetails(req,userid,info,callback){
    var deleteIds = {};
    var insertId;
    var shopping_cart_id;
    var other_product_id;
    var cond3 = "";
    var custom_query = "Insert into user_other_products_custom (user_id,base_product_id,price,small,medium,large,xl,doublexl,new_price,coupan_applied,is_login) Values ";
    var shopping_cart_item_query = "Insert into shopping_cart_items (shopping_cart_id,item_id,item_type,is_login) Values ";
    console.log("Req :",req);
    console.log("userid :",userid);
    console.log("info :",info) 
    easydb(dbPool)
            .query(function () {
                return {
                    query: "INSERT INTO  `shipping_address` (`user_id`, `email_address` ,`phone_number` ,`first_name` ,`last_name` ,`address1` ,`address2` ,`city` ,`state` ,`country` ,`postal_code` ,`show_in_list`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                    params: [userid, req.body.email_id, req.body.phone_num, req.body.first_name, req.body.last_name, req.body.address_1, req.body.address_2, req.body.city, req.body.state, req.body.country, req.body.postal_code, req.body.show_in_list]
                };
            }).success(function(rows){
                insertId = rows.insertId;
            }).query(function(){
                return{
                    query:"Insert into shopping_carts (user_id,status,shipping_type,currency,shipping_address_id,is_login) Values(?,?,?,?,?,0)",
                    params:[userid,"PENDING","FREE","INR",insertId]
                }
            })
            .success(function (rows) {
                shopping_cart_id = rows.insertId;
                var cond1 = "";
                info.forEach((element,index) => {
                    var new_price = element.product.new_price ? element.product.new_price: 0;
                    var coupan_applied = element.product.coupan_applied ? element.product.coupan_applied:0;
                    if(index > 0){
                        cond1 += ",";
                    }
                    cond1 += "( ";
                    cond1 += element.product.userid+" , "+element.product.product_id+" , "+element.product.price+" , "+element.product.small+" , "+element.product.medium+" , "+element.product.large+" , "+element.product.xl+" , "+element.product.doublexl+" , "+new_price+" , "+coupan_applied+" , 0";
                    cond1 += " )";
                });
                custom_query += cond1;
            }).error(function (err) {
                logger.error(err);
                deleteIds["shipping_id"] = shopping_cart_id;
                callback(true,deleteIds);
            })
            .query(function(){
                return {
                    query: custom_query,
                    params: []
                };
            })
            .error(function (err) {
                logger.error(err);
                deleteIds["shipping_id"] = insertId;
                deleteIds["other_product_id"] = other_product_id;
                callback(true,deleteIds);
            })
            .query(function(){
                return {
                    query: "Select id from user_other_products_custom where user_id = ? And is_login = 0",
                    params: [userid]
                };
            }).success(function(rows){
                other_product_ids = rows;
                rows.forEach((element,index) => {
                    if(index > 0){
                        cond3 += ",";
                    }
                    cond3 += "("+shopping_cart_id+" , "+element.id+" , 'CUSTOM' , 0 ) ";
                })
            })
            .query(function(){
                return {
                    query:shopping_cart_item_query+cond3,
                    params:[]
                };
            })
            .success(function (rows) {
                callback(undefined)
            })
            .error(function (err) {
                logger.error(err);
                deleteIds["shipping_id"] = insertId;
                deleteIds["other_product_id"] = other_product_id;
                deleteIds["shopping_cart_id"] = shopping_cart_id;
                callback(true,deleteIds);
            })
            .execute();
}


var q = async.priorityQueue(function(task, callback) {
    if(task.product.coupan_applied == 1){
        get_product_details(task.product.product_id, function(err,resp){
            if(!err){
                get_coupan_details(task.product.coupancode,task.product.product_id,function(err,data){
                    if(!err){
                        if(data.length > 0){
                            var qty = parseInt(task.product.small) + parseInt(task.product.large) + parseInt(task.product.medium) + parseInt(task.product.xl) + parseInt(task.product.doublexl);
                            var price = parseInt(resp[0]["price"]) * qty;
                            var new_price = Math.floor(price - (price * parseInt(data[0]["percent"])/100));
                            task.product.new_price = new_price;
                            task.product.price = price;
                            filterdata[task.product.userid].push(task);
                            console.log("filterdata",filterdata)
                            callback();
                        }
                    }else{
                        console.log("Error :",err);
                        callback();
                    }
                })
            }else{
                console.log("Error :",err);
                callback();
            }
        })
    }else{
        get_product_details(task.product.product_id, function(err,resp){
            if(!err){
                var qty = parseInt(task.product.small) + parseInt(task.product.large) + parseInt(task.product.medium) + parseInt(task.product.xl) + parseInt(task.product.doublexl);
                var price = parseInt(resp[0]["price"]) * qty;
                task.product.price = price;
                task.product.new_price = '';
                task.product.coupan_applied = 0;
                filterdata[task.product.userid].push(task);
                callback();
            }else{
                console.log("Error :",err)
                callback();

            }
        })
    }
}, 1);

 function deleteRecords(deleteIds,userid){
     if(deleteIds["shopping_cart_id"]){
        easydb(dbPool)
        .query(function () {
            return {
                 query : "Delete from shopping_carts where userid = ? AND is_login = 0",
                 params: [userid]
            };
        })
        .query(function () {
            return {
                 query : "Delete from user_other_products_custom where userid = ? AND is_login = 0",
                 params: [userid]
            };
        })
        .query(function(){
            return {
                query:"Delete from shipping_address where id = ?",
                params:[deleteIds["shipping_id"]]
            }
        })
        .execute();
    
     }else if(deleteIds["other_product_id"]){
        easydb(dbPool)
        .query(function () {
            return {
                 query : "Delete from user_other_products_custom where userid = ? AND is_login = 0",
                 params: [userid]
            };
        })
        .query(function(){
            return {
                query:"Delete from shipping_address where id = ?",
                params:[deleteIds["shipping_id"]]
            }
        })
        .execute();
     }else{
        easydb(dbPool)
        .query(function(){
            return {
                query:"Delete from shipping_address where id = ?",
                params:[deleteIds["shipping_id"]]
            }
        })
        .execute();
     }
 }

 function generatePassword(){
        var length = 9;
        var result           = [];
        var characters       = '!@#$%&*abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
        }
        var password = result.join('');
        return password;
}
