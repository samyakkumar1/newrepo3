/**
 * Created by DesignerBe on 08-12-2020.
 */

$(function () {
    var totalItems = 0;
    var loadedItems = 0;
    var totalPrice = 0;
    var refiral_cart_items = [];
    var all_address;
    function init() {
        updateCarts();
        $("#proceedToPayment").click(function (e) {-
            e.preventDefault();
            e.stopPropagation();
            if($("#editProfileForm").valid()) {
                var proccedToPayment = function () {
                    addWaitingOverlay();
                    var data = {
                        email_id: $("#emailId", $("#editProfileForm")).val(),
                        phone_num: $("#phone_num", $("#editProfileForm")).val(),
                        first_name: $("#first_name", $("#editProfileForm")).val(),
                        last_name: $("#last_name", $("#editProfileForm")).val(),
                        address_1: $("#address1", $("#editProfileForm")).val(),
                        address_2: $("#address2", $("#editProfileForm")).val(),
                        country: "IN",
                        state: $("#state", $("#editProfileForm")).val(),
                        city: $("#city", $("#editProfileForm")).val(),
                        postal_code: $("#postal_code", $("#editProfileForm")).val(),
                        password: $("#current_password", $("#editProfileForm")).val(),
                        show_in_list: $("#save_addr", $("#editProfileForm")).is(":checked")
                    };
                    data.salt = getNewRandomNumber(1000, 9999);
                    data.md5_password = MD5(data.salt + ":" + data.password);
                    delete data.password;
                    var endpointurl;
                    var savedAddress = $("#savedAddress").val();
                    if(all_address.length == 0 && savedAddress == null){
                        endpointurl = "/updateCheckoutDetails";
                        console.log("all_address ",all_address);
                        console.log("savedAddress ",savedAddress);
                    }else{
                        var temp_addr = all_address.filter(function(el){
                            return el.address1 == data.address_1
                        })
                        if(temp_addr.length > 0){
                            endpointurl = "/updateDetailsWithAddress";
                            data.selected_shipping_id = temp_addr[0]["id"];
                        }else{
                            endpointurl = "/updateCheckoutDetails";
                        }
                    }

                    //console.log("endpointurl",endpointurl);
                    //alert(JSON.stringify(data));
                    //return false;
                    if(isLoggedIn(true) == true){
                        doPost(endpointurl, data, function (resp) {
                            removeWaitingOverlay();
                            if (resp.status == 200) {
                                doPayment();                            
                            } else {
                                bootbox.alert("Error: " + resp.msg);
                            }
                        }, function (err) {
                            removeWaitingOverlay();
                            bootbox.alert("Server error: communication failure.");
                        });
                    }else{
                        data.cartDetails = JSON.parse(localStorage.getItem("cartDetails"));
                        doPost("/updateExpressCheckout",data,function(resp){
                            if(resp.status == 200){
                                doPayment(resp.msg);
                            }else{
                                bootbox.alert(resp.msg)
                            }
                        },function(err){

                        })
                    }
                    
                };
                proccedToPayment();
            }
        });
    }

    init();
    function shippingForm(){
        $("#editProfileForm").validate({
            debug: true,
            messages: {
                terms: "<b>You must accept the Terms and Conditions</b>",
                emailId: "Email ID is required.",
                first_name: "First name is required",
                phone_num: "Phone number is required",
                last_name: "Last name is required",
                address1: "Address Line 1 is required",
                city: "City is required",
                state: "State is required",
                country: "Country is required",
                postal_code: "Postal Code is required",
                current_password: "Password is reqired",
                confirm_password: "You must confirm the password"
            },
            showErrors: function (errorMap, errorList) {
                if (submitted) {
                    if (errorList.length > 0) {
                        var summary = "<b>Pleae fix the following errors: </b><br/><br/><ul>";
                        $.each(errorList, function () {
                            summary += "<li>" + this.message + "</li>";
                        });
                        summary += "</ul>";
                        //$("#validationError").show();
                        //$("#validationError").html(summary);
                    } else {
                        $("#validationError").hide();
                    }
                    submitted = false;
                }
                this.defaultShowErrors();
            },
            invalidHandler: function (form, validator) {
                submitted = true;
            }
        });
            var submitted;
            $(".mainContainer").hide();
            $(".details").show();
            var addrList = $("#savedAddress");
            var user = getUser();
            addrList.children().remove();
            //$(".checkoutCountrySelector").val($(".top-countries-list").val());
            if (user != undefined) {
                doPost("/listAddresses", {}, function (resp) {
                    if (resp.status == 200) {
                        all_address = resp.addresses;
                        if (resp.addresses.length == 0) {
                            $("#editProfileForm #emailId").val(user.email);
                            $("#editProfileForm #phone_num").val(user.phone_num);
                            $("#editProfileForm #first_name").val(user.first_name);
                            $("#editProfileForm #last_name").val(user.last_name);
                            $("#editProfileForm #address1").val(user.address == null ? "" : user.address.split("\n")[0]);
                            $("#editProfileForm #address2").val(user.address == null ? "" : user.address.split("\n")[1]);
                            $("#editProfileForm #country").val($(".top-countries-list").val());
                            $("#editProfileForm #state").val(user.state);
                            $("#editProfileForm #city").val(user.city);
                            $("#editProfileForm #postal_code").val(user.postal_code);
                            $("#editProfileForm .pwd").hide();
                            $("#editProfileForm #savedAddresses").hide();
                        } else {
                            for (var i = 0; i < resp.addresses.length; i++) {
                                var addr = resp.addresses[i];
                                addrList.append('<option value="' + addr.id + '" data-email="' + addr.email_address + '" data-ph="' + addr.phone_number + '" data-fname="' + addr.first_name + '" data-lname="' + addr.last_name + '" data-addr1="' + addr.address1 + '" data-addr2="' + addr.address2 + '" data-city="' + addr.city + '" data-state="' + addr.state + '" data-country="' + addr.country + '" data-postal_code="' + addr.postal_code + '">' +
                                addr.email_address + ', ' + addr.phone_number + ', ' + addr.first_name + ', ' + addr.last_name + ', ' + addr.address1 + ', ' + addr.address2 + ', '+ addr.country + ', ' + addr.postal_code +
                                '</option>');
                            }
                            $("#editProfileForm #emailId").val(resp.addresses[resp.addresses.length - 1].email_address);
                            $("#editProfileForm #phone_num").val(resp.addresses[resp.addresses.length - 1].phone_number);
                            $("#editProfileForm #first_name").val(resp.addresses[resp.addresses.length - 1].first_name);
                            $("#editProfileForm #last_name").val(resp.addresses[resp.addresses.length - 1].last_name);
                            $("#editProfileForm #address1").val(resp.addresses[resp.addresses.length - 1].address1);
                            $("#editProfileForm #address2").val(resp.addresses[resp.addresses.length - 1].address2);
                            $("#editProfileForm #country").val($(".top-countries-list").val());
                            $("#editProfileForm #state").val(resp.addresses[resp.addresses.length - 1].state);
                            $("#editProfileForm #city").val(resp.addresses[resp.addresses.length - 1].city);
                            $("#editProfileForm #postal_code").val(resp.addresses[resp.addresses.length - 1].postal_code);
                            $("#editProfileForm #savedAddresses").show();
                        }
                    } else {
                        bootbox.alert("Can't list saved addresses.");
                    }
                });
            } else {
                all_address = [];
                $("#savedAddresses").hide();
                $("#sa_div").hide();
                $("#sai_div").hide();
                $(".pwd").show();
            }
            addrList.select2({
                formatResult: function (state) {
                    var originalOption = state.element;
                    if (!state.id) {
                        return state.text;
                    }
                    return $(originalOption).data("email") + " (Ph: " + $(originalOption).data("ph") + ") <br/>" + $(originalOption).data("fname") + " " + $(originalOption).data("lname") + ", " + $(originalOption).data("addr1") + ", " + $(originalOption).data("addr2") + ", " + $(originalOption).data("country") + ", PIN: " + $(originalOption).data("postal_code");
                },
                escapeMarkup: function (m) {
                    return m;
                }
            }).on("select2-selecting", function (e) {
                var obj = $(e.choice.element);
                $("#emailId").val(obj.data("email"));
                $("#phone_num").val(obj.data("ph"));
                $("#first_name").val(obj.data("fname"));
                $("#last_name").val(obj.data("lname"));
                $("#address1").val(obj.data("addr1"));
                $("#address2").val(obj.data("addr2"));
                $("#city").val(obj.data("city"));
                $("#state").val(obj.data("state"));
                $("#postal_code").val(obj.data("postal_code"));
            });
    }


    function updateCarts()
    {   
        var total_product_price = 0;
        var shipping_charge = 49;
        var addOtherCustomProduct = function (card_resp){
        var quantity = (parseInt(card_resp.product.small)+parseInt(card_resp.product.medium)+parseInt(card_resp.product.large)+parseInt(card_resp.product.xl)+parseInt(card_resp.product.doublexl));
        var size = (card_resp.product.medium > 0)?'M : '+card_resp.product.medium:'';
            size += (card_resp.product.xl > 0)?' XL : '+card_resp.product.xl:'';
            size += (card_resp.product.large > 0)?' L : '+card_resp.product.large:'';
            size += (card_resp.product.small > 0)?' S : '+card_resp.product.small:'';
            size += (card_resp.product.doublexl > 0)?' XXL : '+card_resp.product.doublexl:'';
        var item = '<tr class="shoppingCartItems' + card_resp.product.id + ' customProductItem">' +
        '  <td>' +
        '  <div class="product">'+
        '  <div class="product-thumb">'+
        '  <img  src="/getMyOtherProductImage?id='+card_resp.product.front_image+'"/>'+
        '  </div>'+
        '  <div>'+
        '  <span class="product-name">'+card_resp.product.title+'</span><br/>'+
        '  <span class="product-type"></span>'+
        '  </div></div>' +
        '  </td>'+
        '  <td>'+
        '  <span class="price">'+size+'</span>'+
        '  </td>';
        if(card_resp.product.coupan_applied == 1){
         item +='  <td><span class="price"> Rs <b style="text-decoration: line-through;">'+card_resp.product.price/quantity+'</b><br><b id="price_'+card_resp.product.id+'" style="color:green;margin-left:41%">'+Math.floor(card_resp.product.new_price/quantity)+'</b></span></td>';
        }else{
         item += '  <td><span class="price"> Rs <b id="price_'+card_resp.product.id+'">'+card_resp.product.price/quantity+'</b></span></td>';
        }
        if(card_resp.product.coupan_applied == 1){
            total_product_price = total_product_price + parseInt(card_resp.product.new_price);
            item +='  <td><span class="total-price"> Rs <b style="text-decoration: line-through;">'+card_resp.product.price+'</b><br><b id="total_price_'+card_resp.product.id+'" style="color:green;margin-left:41%">'+card_resp.product.new_price+'</b></span></td>';
        }else{
            total_product_price = total_product_price + parseInt(card_resp.product.price);
            item +='  <td><span class="total-price"> Rs <b id="total_price_'+card_resp.product.id+'">'+card_resp.product.price+'</b></span></td>';
        }
        
        item +='  <td><button type="button" class="delete-btn removeCustomProduct' + card_resp.product.id +'"><i class="fa fa-trash"></i></button></td>'+
        '  </tr>';
            $("#checkoutList").append(item);
            $(".removeCustomProduct" + card_resp.product.id).click(function (e){
                e.preventDefault();
                if(isLoggedIn(true) == true) {
                    removeFromShoppingCart(card_resp.product.id + "", "CUSTOM");
                }else{
                    removeFromLocalStorage(card_resp.product.id);

                }
            });

            loadedItems++;
            if (loadedItems == totalItems){
                var total_cart_detail =  '<h3 class="title">Cart Total</h3><table class="cart-total-table">';
                    total_cart_detail += '<thead><tr><th>Cart Total</th><th>Shipping and Handling</th><th>Oder Tottal</th></tr></thead>';
                    total_cart_detail += '<tbody><tr><td> Rs '+parseInt(total_product_price)+'</td><td>Rs.'+parseInt(shipping_charge)+' shipping + No handling charges</td>';
                    total_cart_detail += '<td>Rs '+(parseInt(shipping_charge)+parseInt(total_product_price))+'</td></tr></tbody></table>';
                    $("#total_cart_detail").append(total_cart_detail);  
                    totalPrice = parseInt(shipping_charge)+parseInt(total_product_price);
            }

        

        }
        if(isLoggedIn(true) == true) {
                addWaitingOverlay();
                doPost("/listCartItems", {}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        totalItems = resp.items.length;

                        if(totalItems > 0){
                            shippingForm();
                        }
                        
                        for (var i = 0; i < resp.items.length; i++) {
                            refiral_cart_items.push({
                                product_id: resp.items[i].item_id, // Product ID
                                quantity: "1", // Quantity
                                name: "Item "+resp.items[i].item_id // Name of product
                            });
                            (function (){
                                var itemid = resp.items[i].item_id;
                                if(resp.items[i].item_type == "CUSTOM"){
                                    doGet("/getUserOtherCustomProductDetails", {id: resp.items[i].item_id, from: "mydesigns"}, function (card_resp) {
                                        removeWaitingOverlay();
                                        if (card_resp.status == 200) {
                                            card_resp.item_id = itemid;
                                            console.log("card_resp",card_resp);
                                            addOtherCustomProduct(card_resp);
                                        } else {
                                            console.log("Hello world");
                                            bootbox.alert(card_resp.msg);
                                        }
                                    }, function (err) {
                                        removeWaitingOverlay();
                                        console.log(err);
                                        bootbox.alert("Error contacting server");
                                    });
                                }
                            })()
                        }

                    } else if (resp.status == 201) {
                        $("#checkoutList").append("<tr><td colspan='5'><h5 style='padding: 20px;text-align: center;'>No items has been added to the cart yet.</h5></td></tr>");
                        $("#coupanhide").remove();
                        $("#checkoutbody").remove();
                    } else {
                        bootbox.alert("Error: " + resp.msg);
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    bootbox.alert("Error contacting server.");
                });
        }else{
            if(localStorage.getItem('cartDetails') != undefined){
                var cartdata = JSON.parse(localStorage.getItem('cartDetails'));
                totalItems = cartdata.length;
                if(totalItems > 0){
                    shippingForm();
                }
                if(totalItems.length < 1){
                    $("#checkoutList").append("<tr><td colspan='5'><h5 style='padding: 20px;text-align: center;'>No items has been added to the cart yet.</h5></td></tr>");
                    $("#coupanhide").remove();
                    $("#checkoutbody").remove();
                }else{
                    cartdata.forEach(function(item){
                        addOtherCustomProduct(item);
                    })
                }
                
            }else{
                $("#checkoutList").append("<tr><td colspan='5'><h5 style='padding: 20px;text-align: center;'>No items has been added to the cart yet.</h5></td></tr>");
                $("#coupanhide").remove();
                $("#checkoutbody").remove();
            }
        }
    }
  
   
    function doPayment(data=0){
        //var type = $('.top-countries-list').val() == "IN" ? "PayTM" : "Paypal";
        var type = "PayTM";
        if (type == "PayTM") {
            if(data == 0){
                var reqObj = {country: "IN", paymentType: "paytm", amt: totalPrice, currency: "INR"}
            }else{
               var reqObj = {userid : data.userid,email:data.email,country: "IN", paymentType: "paytm", amt: totalPrice, currency: "INR"}
            }
            addWaitingOverlay();            
            doPost("/payment", reqObj, function (resp){
                if (resp.status == 200){
                    console.log(resp)
                    var myWindow = window.open("", "_self");
                    myWindow.document.write(resp.html);                   
                } else if (resp.status == 500){
                    removeWaitingOverlay();
                    bootbox.alert(resp.msg);
                }
            }, function (err){
                removeWaitingOverlay();
                bootbox.alert("Server Error: Communication Failure");
            });
        } else {
            addWaitingOverlay();
            var form = $('<form />', {action: '/payment', method: 'POST'});
            form.append($('<input name="amt" value="' + $(".totalPrice:first").text() + '"/>'));
            form.append($('<input name="currency" value="' + $(".currencyField:first").text() + '"/>'));
            form.append($('<input name="country" value="' + $('.top-countries-list').val() + '"/>')); 
            form.append($('<input name="paymentType" value="paypal"/>'));
            form.hide().appendTo('body');
            form.submit();
        }
    }

    function removeFromShoppingCart(itemId, type) {
        bootbox.confirm("Are you sure to delete this item?", function (result) {
            if (result == true) {
                var fn = function () {
                    $(".shoppingCartItems" + itemId + ".customProductItem").remove();
                    if ($(".customProductItem").length < 1) {
                        $("#coupanhide").remove();
                        $("#checkoutbody").remove();
                        $("#checkoutList").append("<tr><td colspan='5'><h5 style='padding: 20px;text-align: center;'>No items has been added to the cart yet.</h5></td></tr>");
                    }
                    $(".cart-order").text($(".shoppingCartItem").length);
                    for (var i = 0; i < refiral_cart_items.length; i++){
                        if (refiral_cart_items[i].product_id == itemId){
                            refiral_cart_items.splice(i, 1);
                            break;
                        }
                    }
                };
                doPost("/removeItem", {item_id: itemId, type: type}, function (resp) {
                    if (resp.status == 200) {
                        fn();
                        location.reload();
                    } else if (resp.status == 201) {
                        console.log(resp);
                        fn();
                    } else {
                        console.log(resp);
                        bootbox.alert("Error: " + resp.msg);
                    }
                });
            }
        });
    }

    function removeFromLocalStorage(itemId){
        bootbox.confirm("Are you sure to delete this item?", function (result) {
            if (result == true) {
                var temp_item = JSON.parse(localStorage.getItem("cartDetails"));
                var temp_filter_item = temp_item.filter(function(item){
                    return parseInt(item.product.id) != parseInt(itemId);
                })
                localStorage.removeItem("cartDetails");
                if(temp_filter_item.length > 0){
                    localStorage.setItem("cartDetails",JSON.stringify(temp_filter_item))
                }
                location.reload();
            }
        })
    }
});
