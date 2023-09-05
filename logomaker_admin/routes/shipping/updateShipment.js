var request = require('request');
var async = require("async");
var len = 0;
exports.index = function () {
    getShipmentDetails(function(error,success){
        console.log("Error : ",error)
        var len=0;
        if(!error){
            q.push(success, success.length, function(err) {
                len++;
                if(len == success.length){
                    console.log('Finished processing item');
                    console.log(len + " - "+success.length);

                }
            });
        }
    })
};
exports.changeStatus = function () {
    getAwbNumber('pending pickup',function(error,success){
        if(!error){
            q.push(success, 1, function(err) {
                console.log('Finished processing item');
            });
        }
    })
};


exports.updateShipments = function(){
    updateShipment();
};
var token = '';
var q = async.priorityQueue(function(task, callback) {
    var options = {
        method: 'GET',
        url: global.config.nimbusApiDetails.trackshipment+task.awb_number,
        headers: {
          'content-type' : 'application/json'
        }
      };
    if(token == ''){
        getToken(function(err,resp){
            if(!err){
                token = 'Bearer '+resp.data;
                options.headers["Authorization"] = token;
            }
            trackshipment(options,task,function(){
                callback();
            })
        })
    }else{
        options.headers["Authorization"] = token;
        trackshipment(options,task,function(){
            callback();
        })
    }
}, 1);


function trackshipment(options,task,callback){
    request(options, function (error, response) {
        if (error) {
            callback()
        }else{
            var response = JSON.parse(response.body);
            if(response.status == true){
                var status = response["data"]["status"];
                if(status == 'in transit'){
                    getUserDetails(function(rows){
                        mailsend(rows,task,status);
                        updateShipmentStatus(response,task,function(){
                            callback();
                        })
                    })
                }else{
                    updateShipmentStatus(response,task,function(){
                        callback();
                    })
                }
            }else{
                getToken(function(err,resp){
                    if(!err){
                        token = 'Bearer '+resp.data;
                        options.headers["Authorization"] = token;
                    }
                    request(options, function (error, response) {
                        if(error){
                            callback()
                        }else{
                            var response = JSON.parse(response.body);
                            var status = response["data"]["status"];
                            if(response.status == true){
                                if(status == 'in transit'){
                                    getUserDetails(function(rows){
                                        mailsend(rows,task,status);
                                        updateShipmentStatus(response,task,function(){
                                            callback();
                                        })
                                    })
                                }else{
                                    updateShipmentStatus(response,task,function(){
                                        callback();
                                    })
                                }
                                
                            }
                        }
                    })
                })
            }
        }
    })
}
  
function getShipmentDetails(callback){
    easydb(dbPool)
    .query(function () {
        return {
            query: "SELECT awb_number FROM shipping_status WHERE shipment_status != 'delivered_freeze' AND shipment_status != 'cancelled'",
            params: []
        };
    })
    .success(function (rows) {
        console.log("Rows :",rows);
        if(rows.length > 0){
            callback(undefined,rows)
        }else{
            callback(true)
        }
    }).execute();
}

function getAwbNumber(status,callback){
    easydb(dbPool)
    .query(function () {
        return {
            query: "SELECT awb_number FROM shipping_status WHERE shipment_status = ?",
            params: [status]
        };
    })
    .success(function (rows) {
        if(rows.length > 0){
            callback(undefined,rows)
        }else{
            callback(true)
        }
    }).execute();
}


function getToken(callback){
    var options = {
        method: 'POST',
        url: global.config.nimbusApiDetails.login,
        headers: {
          'content-type' : 'application/json'
        },
        body: JSON.stringify(global.config.nimbusApiDetails.credentials)
      };
      //console.log("options "+options);
      request(options, function (error, response) {
        if (error) {
          callback(error,false)
        }else{
          var response = JSON.parse(response.body);  
          callback(false,response);          
        }
      });
}

function updateShipmentStatus(response,task,callback){
    var status = response["data"]["status"];
    var rto_status = response["data"]["rto_status"];

    easydb(dbPool)
    .query(function () {
        return {
            query: "select shipment_status, rto_status from shipping_status where awb_number = ?",
            params: [task.awb_number]
        };
    })
    .success(function (rows) {
            if(rows[0]["shipment_status"] == status){
                callback()
            }else{
                easydb(dbPool)
                .query(function () {
                    return {
                        query: "update shipping_status set shipment_status = ? , rto_status = ? , updated = now() where awb_number = ?",
                        params: [status,rto_status,task.awb_number]
                    };
                })
                .success(function (rows) {
                        callback()
                }).execute();
            }
    }).execute();
}


function mailsend(rows,task,status){
    sendMail("statusChange", {
        name: rows[0].first_name + " " + rows[0].last_name,
        awb_number: task.awb_number,
        status: status
    }, {
        to: rows[0].email_address,
        subject: "Your order status has changed."
    }, function () {
    }, function (err) {
    });
}

function getUserDetails(awb_number,callback){
    easydb(dbPool)
    .query(function () {
        return {
            query: "SELECT u.first_name,u.last_name,u.email_address FROM shipping_status AS s LEFT JOIN purchased_items AS p_i ON s.purchased_id = p_i.id LEFT JOIN shopping_carts AS s_c ON s_c.id = p_i.shopping_cart_id LEFT JOIN shipping_address u ON u.id = s_c.shipping_address_id where s.awb_number = ?",
            params: [awb_number]
        };
    })
    .success(function (rows) {
            callback(rows)
    }).execute(); 
}

function updateShipment(){
    easydb(dbPool)
    .query(function () {
        return {
            query: "update shipping_status set shipment_status = 'delivered_freeze'  where updated >= CURRENT_DATE - INTERVAL 3 DAY AND shipment_status = 'delivered' And rto_status = ''",
            params: []
        };
    })
    .success(function (rows) {
            callback()
    }).execute();
}
