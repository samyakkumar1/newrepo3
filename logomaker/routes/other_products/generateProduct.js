var base64ToImage = require('base64-to-image');
//const multer = require('multer');
//const upload = multer();
//const fs = require('fs');
exports.index = function (req, res) {
   // console.log(req.body)
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var other_product_id = req.body.productid;
    var user_id = req.body.userid;
    var base64Str = req.body.front_image;
    var keyword = req.body.keyword;
    var base64Strback = req.body.logo;
    var fimage = "my_image"+new Date().getTime()+".png";
    var path = config.MY_OTHER_PRODUCTS_PATH;
    var optionalObj = {'fileName': fimage, 'type':'png'};
    var product_url;
    var productcolor = req.body.productcolor;
    var bimage = "my_logo"+new Date().getTime()+".png";
    var optionalObj2 = {'fileName': bimage, 'type':'png'};
    var coupancode = (req.body.coupancode)?req.body.coupancode:"";
    var percent = (req.body.percent)?req.body.percent:"";

    base64ToImage(base64Str,path,optionalObj); 
    base64ToImage(base64Strback,path,optionalObj2); 

    easydb(dbPool)
        .query(function () {
            return {
                query: "Insert into other_product_details (other_product_id,price,title,description,user_id,front_image,keyword,logo,color) Values(?,?,?,?,?,?,?,?,?)",
                params: [other_product_id,price,title,description,user_id,fimage,keyword,bimage,productcolor]
            };
        })
        .success(function (rows) {
            if(coupancode  && percent){
                easydb(dbPool)
                    .query(function () {
                        return {
                            query: "Insert into coupancode (code,percent,other_product_detail_id) Values(?,?,?)",
                            params: [coupancode,percent,rows.insertId]
                        };
                }).execute()
            }
            product_url = "/shop/product-details?id="+rows.insertId
            res.send({url:product_url, status: 200}); 
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};