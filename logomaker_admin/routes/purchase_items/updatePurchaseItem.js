var request = require('request');
var FormData = require('form-data');
var http = require('http');


exports.index = function (req, res) {
    postNimbusAutoShip(req,function(error,success){
        if(error){
            res.send({msg: "Something went wrong Please try again latter", status: 500});
        }else{
            easydb(dbPool)
            .query(function () {
                return {
                    query: "UPDATE purchased_items SET status = ? WHERE id = ?",
                    params: [req.body.status, req.body.id]
                };
            })
            .success(function (rows) {
                res.send({status: 200});
            })
            .error(function (err) {
                logger.error(err);
                res.send({msg: err.message, status: 500});
            }).execute();
        }
    })
};

function postNimbusAutoShip(req,callback){
    if(req.body.status == "PRINTED"){
        var authtoken = "";
        easydb(dbPool)
        .query(function(){
            return {
                query:"Select * from nimbus_token where 1 order by id desc",
                params:[]
            }
        }).success(function(rows){
            if(rows.length > 0){
                authtoken = rows[0]["token"];
                postShipment(req,authtoken,function(error,success){
                    if(error){
                        callback(true);
                    }else{
                        callback(undefined,true)
                    }
                })
            }else{
                getToken(function(error , body){
                    console.log("Body :",body.data);
                    if(error){
                        res.status(500).send(error)
                    }else{
                        if(body.status == false){
                            res.status(500).send(body.data)
                        }else{
                            authtoken =  body.data;
                        postShipment(req,authtoken,function(error,success){
                            if(error){
                                callback(true);
                            }else{
                                callback(undefined,true)
                            }
                            })
                            easydb(dbPool)
                            .query(function(){
                                return {
                                    query:"Insert into nimbus_token (token) Value(?)",
                                    params:[authtoken]
                                }
                            })                
                            .execute();
                        }
                    }
                })
            }
        }).execute();
    }else{
        callback(undefined,true)
    }
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
        console.log("Response "+JSON.stringify(response));
        if (error) {
            console.log("Error ",error);
          callback(error,false)
        }else{
          var response = JSON.parse(response.body);  
          console.log("Success :",response);
          callback(false,response);          
        }
      });
}

function postShipment(req,token,callback){
    var vendors;
    easydb(dbPool)
    .query(function () {
        return {
            query: "SELECT * from vendors where id = ?",
            params: [req.body.vendor]
        };
    })
    .success(function (vendor) {
        vendors = vendor;
    }).
    query(function () {
        return {
            query :"SELECT shopping_carts.id AS order_number,IFNULL((user_other_products_custom.price - user_other_products_custom.new_price),0) AS discount,IFNULL(user_other_products_custom.new_price , user_other_products_custom.price) AS order_amount, JSON_ARRAY(JSON_OBJECT('sku',CONCAT('TGB',other_product_details.id) ,'name',other_product_details.title,'qty',user_other_products_custom.small+user_other_products_custom.medium+user_other_products_custom.large+user_other_products_custom.xl+user_other_products_custom.doublexl,'price',(user_other_products_custom.price/(user_other_products_custom.small+user_other_products_custom.medium+user_other_products_custom.large+user_other_products_custom.xl+user_other_products_custom.doublexl)))) AS order_items,JSON_OBJECT('pincode',shipping_address.postal_code,'country', shipping_address.country,'city',CASE WHEN shipping_address.city = '' THEN 'NA' ELSE shipping_address.city END,'state',case when shipping_address.state = '' then 'NA' else shipping_address.state END,'address',shipping_address.address1,'address_2',shipping_address.address2,'phone',shipping_address.phone_number,'name',CONCAT(shipping_address.first_name,' ',shipping_address.last_name)) AS consignee FROM shipping_address INNER JOIN shopping_carts ON shopping_carts.shipping_address_id = shipping_address.id INNER JOIN purchased_items ON purchased_items.shopping_cart_id = shopping_carts.id INNER JOIN user_other_products_custom ON user_other_products_custom.id = purchased_items.base_item_id INNER JOIN other_product_details ON other_product_details.id = user_other_products_custom.base_product_id INNER JOIN shipping ON purchased_items.shipping_info_id = shipping.id WHERE purchased_items.type = 'CUSTOM' AND purchased_items.id = ? ORDER BY purchased_items.created_at DESC",
            params: [req.body.id]
        };
    }).success(function(rows){
        var dataRes;
        var data = {};
        console.log("Rows Length ",rows.length)
        if(rows.length > 0){
            data["package_weight"] = 300;
            data["package_length"] = 10;
            data["package_breadth"] = 10;
            data["package_height"] = 10;
            data["request_auto_pickup"] = "yes";
            data["payment_type"] = "prepaid";
            data["shipping_charges"] = global.config.SHIPPING_CHARGE;
            data["code_charges"] = 0;
            var pickup = {};
            pickup["name"] = vendors[0]["contactname"];
            pickup["address_2"] = vendors[0]["address2"];
            pickup["address"] = vendors[0]["address"];
            pickup["city"] = vendors[0]["city"];
            pickup["warehouse_name"] = vendors[0]["companyname"];
            pickup["state"] = vendors[0]["state"];
            pickup["pincode"] = vendors[0]["pincode"];
            pickup["phone"] = vendors[0]["phone"];
            data["pickup"] = pickup;
            dataRes = rows[0];
            data["order_number"] = dataRes["order_number"];
            data["discount"] = dataRes["discount"];
            data["order_amount"] = (parseInt(dataRes["order_amount"])+parseInt(global.config.SHIPPING_CHARGE));
            data["order_items"] = JSON.parse(dataRes["order_items"]);
            data["consignee"] = JSON.parse(dataRes["consignee"]);
            console.log("Data :",data);
            var Btoken = "Bearer "+token;
            var tokenerr = "Missing or invalid Token in request";
            var options = {
                method: 'POST',
                url: global.config.nimbusApiDetails.shipment,
                headers: {
                  'content-type' : 'application/json',
                  'Authorization': Btoken
                },
                body: JSON.stringify(data)
              };
            request(options, function (error, response) {
            if (error) {
                console.log("Error Response ",error);
                callback(true,error)
            }else{
                console.log("Shipment Response ",response.body);
                var response = JSON.parse(response.body);
                if(response["status"] == true){
                    callback(undefined,response);
                    updateShipment(req.body.id,response.data);
                }else{
                    if(response["message"].trim() == tokenerr.trim()){
                        getToken(function(error,body){
                            if(error){
                                res.status(500).send(error)
                            }else{
                                if(body.status == false){
                                    res.status(500).send(body.data)
                                }else{
                                    var Btoken = "Bearer "+body.data;
                                    options["headers"]["Authorization"] = Btoken;
                                    console.log(options);
                                    request(options, function (error, response) {
                                        var response = JSON.parse(response.body);
                                        if(response.status == true){
                                            callback(undefined,response)
                                            updateShipment(req.body.id,response.data);
                                        }else{
                                            console.log("Error ",response);
                                            callback(true,error)
                                        }
                                    })
                                    easydb(dbPool)
                                    .query(function(){
                                        return {
                                            query:"Insert into nimbus_token (token) Value(?)",
                                            params:[authtoken]
                                        }
                                    })                   
                                    .execute();
                                }
                            }
                            
                        })
                    }else{
                        callback(true,error);
                    }
                }
            }
            });

        }else{

        }
    }).execute();
    
}

function updateShipment(id,data){
    easydb(dbPool)
            .query(function () {
                return {
                    query: "Insert into shipping_status (purchased_id,shipment_id,awb_number,courier_id,courier_name,status,payment_type,additional_info,label,shipment_status) Value(?,?,?,?,?,?,?,?,?,?)",
                    params: [id, data.shipment_id,data.awb_number,data.courier_id,data.courier_name,data.status,data.payment_type,data.additional_info,data.label,'pending pickup']
                };
            }).execute();
}

