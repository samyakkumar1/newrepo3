/**
 * Created by DesignerBe on 10-12-2020.
 */
$(function () {
    function init() {
        $('.tooltip1').tooltip();
        var addLogo = function (logo_resp) {
            var imgSrc = "";
            if (typeof logo_resp.id == "string" && logo_resp.id.indexOf("logo_") == 0) {
                imgSrc = "data:image/svg+xml;base64," + Base64.encode(logo_resp.url);
            } else {
                imgSrc = "/getUserLogoImage?id=" + logo_resp.s3_logo_url + '&random=' + Math.random();
            }
            var user = getUser();
            var item;
            var svgObj = "";
            console.log();
            if (logo_resp.status == "Purchased" && logo_resp.owner != user.id){
                item = '<li class="col-md-4 myLogoItems' + logo_resp.id + '">' +
                    '<span class="my-logos-list">' +
                    /*'<img src="' + imgSrc + '">*/
                    /*'<object id="svgObject' +logo_resp.id+ '" type="image/svg+xml" data="' + imgSrc + '"></object><span class="my-logo-company">' + logo_resp.company_name + '</span>' +*/
                    '<div id="svgLogoObject' +logo_resp.id+ '" ></div><span class="my-logo-company">' + logo_resp.company_name + '</span>' +
                    '<span class="flip-logo-template">' +
                    '<div class="separate-one">' +
                    '</div>' +
                    '<div class="separate-two purchased">' +
                    '<span class="flip-logo-remove">' +
                    '<span><a class="tooltip1 removeLogoBtn' + logo_resp.id + '" data-toggle="tooltip" data-placement="right" data-original-title="Remove Logo"style="text-decoration: none;" href="#"><i class="fa fa-trash"></i></a></span>' +
                    '</span>' +
                    '<label>Somebody purchased this logo,<br/> Please try out other logos.</label>'+
                    '</div>' +
                    '</span>' +
                    '</span>' +
                    '</li>';
            } else {
                item = '<li class="col-md-4 myLogoItems' + logo_resp.id + '">' +
                    '<span class="my-logos-list">' +
                        //'<img src="' + imgSrc + '">' +
                    /*'<object id="svgObject' +logo_resp.id+ '" type="image/svg+xml" data="' + imgSrc + '"></object><span class="my-logo-company">' + logo_resp.company_name + '</span>'+*/
                    '<div id="svgLogoObject' +logo_resp.id+ '"></div><span class="my-logo-company">' + logo_resp.company_name + '</span>' +
                    '<span class="flip-logo-template">' +
                    '<div class="separate-one">' +
                    '<span class="flip-logo-add">' +
                    '<span><a class="tooltip1" data-toggle="tooltip" data-placement="left" data-original-title="Create Card" style="text-decoration: none" href="/design-business-card-online/use/' + logo_resp.s3_logo_url + '"><i class="fa fa-plus"></i></a></span>' +
                    '</span>' +
                    '<span class="flip-logo-buy">' +
                    '<span><a class="tooltip1 buyLogoBtn' + logo_resp.id + '" data-toggle="tooltip" data-placement="right" data-original-title="Buy Logo" style="text-decoration: none" href="#"><i class="fa fa-shopping-cart"></i></a></span>' +
                    '</span>' +
                    '</div>' +
                    '<div class="separate-two">' +
                    '<span class="flip-logo-edit">' +
                    '<span><a href="/logo-designer/edit/' + logo_resp.id + '/mydesigns" class="tooltip1" data-toggle="tooltip" data-placement="left" data-original-title="Edit Logo" style="text-decoration: none"><i class="fa fa-pencil-square-o"></i></a></span>' +
                    '</span>' +
                    '<span class="flip-logo-remove">' +
                    '<span><a class="tooltip1 removeLogoBtn' + logo_resp.id + '" data-toggle="tooltip" data-placement="right" data-original-title="Remove Logo"style="text-decoration: none;" href="#"><i class="fa fa-trash"></i></a></span>' +
                    '</span>' +
                    '</div>' +
                    '</span>' +
                    '</span>' +
                    '</li>';
            }
            $(".my-logos-ul").append(item);
            updateJQSvgImage("#svgLogoObject" +logo_resp.id, imgSrc);


            $('.tooltip1').tooltip();
            $(".buyLogoBtn" + logo_resp.id).click(function (e) {
                e.preventDefault();
                buyLogo(logo_resp.id + "");
            });
            $(".removeLogoBtn" + logo_resp.id).click(function (e) {
                e.preventDefault();
                removeFromUserLogos(logo_resp.id + "");
            });
        };
        if (isLoggedIn(true) == true) {
            doPost("/listUserLogos", {}, function (resp) {
                if (resp.status == 200) {
                    $(".logo-count").text("(" + resp.logos.length + ")");
                    for (var i = 0; i < resp.logos.length; i++) {
                        addLogo(resp.logos[i]);
                    }
                    $('.my-logos-list').hover(function () {

                        $(this).find('.flip-logo-template').show();
                    }, function () {
                        $(this).find('.flip-logo-template').hide();
                    });
                } else if (resp.status == 201) {
                    $(".my-logos-ul").html("No Logos found! Click <a href='/logo-designer'><b>here</b></a> to create one.");
                } else {
                    $(".my-logos-ul").html("No Logos found! Click <a href='/logo-designer'><b>here</b></a> to create one.");
                    bootbox.alert("Error: " + resp.msg);
                }
            });
        } else {
            var localLogos = retrieveJson("logos");
            if (localLogos != null) {
                $(".logo-count").text("(" + localLogos.length + ")");
                if (localLogos.length > 0) {
                    localLogos.forEach(function (val, idx) {
                        var value = retrieveJson(val);
                        value.id = val;
                        value.s3_logo_url = val;
                        addLogo(value);
                    });
                } else {
                    $(".my-logos-ul").html("No Logos found! Click <a href='/logo-designer'><b>here</b></a> to create one.");
                }
                $('.my-logos-list').hover(function () {
                    $(this).find('.flip-logo-template').show();
                }, function () {
                    $(this).find('.flip-logo-template').hide();
                });
            } else {
                $(".my-logos-ul").html("No Logos found! Click <a href='/logo-designer'><b>here</b></a> to create one.");
            }
        }
    }

    function buyLogo(logoId) {
        addLogoToShoppingCart(logoId, function () {
            updateCartCount(isLoggedIn());
            bootbox.alert("Logo added to shopping cart.");
        })
    }

    function removeFromUserLogos(id) {
        id = id + "";
        bootbox.confirm("Are you sure to delete this logo?", function (result) {
            if (result == true) {
                var updateEmptyText = function (logoId, local) {
                    $(".myLogoItems" + logoId).remove();
                    $(".logo-count").text("(" + $(".my-logos-ul").children().length + ")");
                    $(".hist-count").text("(" + $(".purchaseHistoryItem").length + ")");
                    if ($(".my-logos-ul").children().length < 1) {
                        $(".my-logos-ul").text("No logos created.");
                    }
                    updateCartCount(local);
                }
                if (id.toString().indexOf("logo_") == 0) {
                    removeItemLocally("logos", id);
                    updateEmptyText(id, false);
                } else {
                    addWaitingOverlay();
                    doPost("/removeUserLogo", {id: id}, function (resp) {
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
            }
        });
    }

    init();
});
