/**
 * Created by DesignerBe on 10-12-2020.
 */
$(function () {
    //var noProductsHtml = "No %PRODUCT_NAME%s found! Click <a href='/other/%SEO_URL%'><b>here</b></a> to create one.";

    function draw(frame, base_url, url, attrs, base) {
        var x = parseFloat(attrs[0]),
                y = parseFloat(attrs[1]),
                amplitude = parseFloat(attrs[2]),
                crop = parseFloat(attrs[3]),
                crop_left = parseFloat(attrs[4]),
                crop_right = parseFloat(attrs[5]),
                rotate = parseFloat(attrs[6]),
                width = parseFloat(attrs[7]),
                height = parseFloat(attrs[8]);
        frame.window.initScalablePreview($, "/getOtherProductImage?id=" + base_url, "/getUserOtherProductImage?id=" + url, attrs, true, 150);
        /*frame.window.init($);
        frame.window.setImage("/getOtherProductImage?id=" + base_url, function () {
            frame.window.draw("/getUserOtherProductImage?id=" + url, x, y, amplitude, crop, crop_left, crop_right, rotate, width, height);
        });*/
    }

    function init() {
        var counts = {};
        $('.tooltip1').tooltip();
        var addOtherProduct = function (logo_resp) {
            var imgSrc = "";
            if (typeof logo_resp.id == "string" && logo_resp.id.indexOf("other_") == 0) {
                imgSrc = "data:image/svg+xml;base64," + Base64.encode(logo_resp.url);
            } else {
                imgSrc = "/getUserOtherProductImage?id=" + logo_resp.image_url + '&random=' + Math.random();
            }
            var item = '<li class="col-md-4 myOtherProductItems' + logo_resp.id + '">' +
                    '<span class="my-other-products-list">' +
                    '<div id="svgOtherProductObject' + logo_resp.id + '"><iframe id="designProductItem' + logo_resp.id + '" class="my-designs-preview-iframe" data-url="' + logo_resp.image_url + '" id="cartProductItem' +logo_resp.id + '" name="designProductItem' +logo_resp.id + '" data-id="' +logo_resp.id + '" data-base-url="' + logo_resp.base_image_url + '" data-base-params-front="' + logo_resp.base_params_front + '" data-front-logo-params="' + logo_resp.front_logo_params + '" src="/product-preview/big-preview.html"></iframe></div><span class="my-product-name">' + logo_resp.product_name + '</span>' +
                    '<span class="flip-logo-template">' +
                    '<div class="separate-one">' +
                    '<span class="flip-logo-buy">' +
                    '<span><a class="tooltip1" data-toggle="tooltip" data-placement="top" data-original-title="Duplicate this product" style="text-decoration: none" href="/duplicate-other-product?id=' + logo_resp.id + '"><i class="fa fa-plus"></i></a></span>' + '</span>' +
                    '<span class="flip-logo-remove">' +
                    '<span><a class="tooltip1 buyOtherProductBtn' + logo_resp.id + '" data-toggle="tooltip" data-placement="right" data-original-title="Buy this product" style="text-decoration: none" href="#"><i class="fa fa-shopping-cart"></i></a></span>' +
                    '</span>' +
                    '</div>' +
                    '<div class="separate-two">' +
                    '<span class="flip-logo-edit">' +
                    '<span><a href="/other/' + logo_resp.seo_url + '/edit/' + logo_resp.id + '/mydesigns" class="tooltip1" data-toggle="tooltip" data-placement="left" data-original-title="Edit" style="text-decoration: none"><i class="fa fa-pencil-square-o"></i></a></span>' +
                    '</span>' +
                    '<span class="flip-logo-remove">' +
                    '<span><a class="tooltip1 removeOtherProductBtn' + logo_resp.id + '" data-toggle="tooltip" data-placement="right" data-original-title="Remove this product"style="text-decoration: none" href="#"><i class="fa fa-trash"></i></a></span>' +
                    '</span>' +
                    '</div>' +
                    '</span>' +
                    '</span>' +
                    '</li>';
            $("#product" + logo_resp.seo_url).remove();
            $(".my-" + logo_resp.seo_url + "-ul").append(item);
            //updateJQSvgImage("#svgOtherProductObject" + logo_resp.id, imgSrc);
            
            $('#designProductItem' +logo_resp.id).on("load", function (){ 
                draw(window['designProductItem' +logo_resp.id], $(this).attr("data-base-url"), $(this).attr("data-url"), $(this).attr("data-front-logo-params").split(";"), $(this).attr("data-base-params-front").split(";")); 
            });
            $('.tooltip1').tooltip();
            $(".buyOtherProductBtn" + logo_resp.id).click(function (e) {
                e.preventDefault();
                buyOtherProduct(logo_resp.id + "");
            });
            $(".removeOtherProductBtn" + logo_resp.id).click(function (e) {
                e.preventDefault();
                removeFromUserOtherProducts(logo_resp.id + "");
            });
            $("." + logo_resp.seo_url + "-count").text("(" + counts[logo_resp.seo_url] + ")");
        };
        if (isLoggedIn(true) == true) {
            doGet("/listUserOtherProducts", {}, function (resp) {
                if (resp.status == 200) {
                    for (var i = 0; i < resp.products.length; i++) {
                        var cnt = counts[resp.products[i].seo_url] || 0;
                        cnt++;
                        counts[resp.products[i].seo_url] = cnt;
                        addOtherProduct(resp.products[i]);
                    }
                    $('.my-other-products-list').hover(function () {
                        $(this).find('.flip-logo-template').show();
                    }, function () {
                        $(this).find('.flip-logo-template').hide();
                    });
                } else if (resp.status == 201) {
                    //$(".my-other-products-ul").html(noProductsHtml.replace("%PRODUCT_NAME%", "product").replace("%SEO_URL", "list"));
                } else {
                    //$(".my-other-products-ul").html(noProductsHtml);
                    bootbox.alert("Error: " + resp.msg);
                }
            });
        } else {
            var localOtherProducts = retrieveJson("others");
            if (localOtherProducts != null) {
                $(".other-products-count").text(" (" + localOtherProducts.length + ")");
                if (localOtherProducts.length > 0) {
                    localOtherProducts.forEach(function (val, idx) {
                        var value = retrieveJson(val);
                        value.id = val;
                        value.s3_logo_url = val;
                        addOtherProduct(value);
                    });
                } else {
                    //$(".my-other-products-ul").html(noProductsHtml);
                }
                $('.my-other-products-list').hover(function () {
                    $(this).find('.flip-logo-template').show();
                }, function () {
                    $(this).find('.flip-logo-template').hide();
                });
            } else {
                //$(".my-other-products-ul").html(noProductsHtml);
            }
        }
    }

    function buyOtherProduct(logoId) {
        addOtherProductToShoppingCart(logoId, function () {
            updateCartCount(isLoggedIn());
            bootbox.alert("This product is added to shopping cart.");
        })
    }

    function removeFromUserOtherProducts(id) {
        id = id + "";
        bootbox.confirm("Are you sure to delete this product?", function (result) {
            if (result == true) {
                var updateEmptyText = function (logoId, local) {
                    $(".myOtherProductItems" + logoId).remove();
                    $(".other-products-count").text("(" + $(".my-other-products-ul").children().length + ")");
                    $(".hist-count").text("(" + $(".purchaseHistoryItem").length + ")");
                    if ($(".my-other-products-ul").children().length < 1) {
                        //$(".my-other-products-ul").html(noProductsHtml);
                    }
                    updateCartCount(local);
                }
                addWaitingOverlay();
                doPost("/removeUserOtherProduct", {id: id}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        updateEmptyText(id, true);
                    } else if (resp.status == 201) {
                        console.log(resp);
                        updateEmptyText(id, true);
                    } else {
                        bootbox.alert("Error: " + resp.msg);
                    }
                }, function (err) {
                    console.log(err);
                    removeWaitingOverlay();
                });
            }
        });
    }

    init();
});
