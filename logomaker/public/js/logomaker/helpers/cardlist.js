/**
 * Created by DesignerBe on 10-12-2020.
 */
$(function () {
    function init() {
        var addCard = function (card_resp) {
            var name = card_resp.last_name;
            if (name != null) {
                if (name.trim().length <= 0) {
                    name = ".";
                }
            }

            var imgSrc = "";
            if (typeof card_resp.id == "string" && card_resp.id.indexOf("card_") == 0) {
                if (typeof card_resp.url == "string"){
                    imgSrc = "data:image/svg+xml;base64," + Base64.encode(card_resp.url);
                } else {
                    
                }
            } else {
                imgSrc = "/getUserCardImage?id=" + card_resp.s3_front_card_url + '&random=' + Math.random();
            }
            var item = '<li class=" col-md-4 myCardItems' + card_resp.id + '">' +
                '<span class="my-cards-list">' +
                /*'<img src="' + imgSrc + '"/>' +*/
                '<div id="svgCardObject' + card_resp.id + '"></div>' +
                '<span class="my-card-company">' + name + '</span>' +
                '<span class="flip-card-template">' +
                '<div class="separate-one">' +
                '<span class="flip-card-edit">' +
                '<span><a class="tooltip1" data-toggle="tooltip" data-placement="top" data-original-title="Duplicate Card" style="text-decoration: none" href="/duplicate-card?id=' +card_resp.id+ '"><i class="fa fa-plus"></i></a></span>' +
                '</span>' +
                '<span class="flip-card-buy">' +
                '<span><a class="tooltip1 buyBtn' + card_resp.id + '" data-toggle="tooltip" data-placement="top" data-original-title="Buy Card" style="text-decoration: none" href="#"><i class="fa fa-shopping-cart"></i></a></span>' +
                '</span>' +
                '</div>' +
                '<div class="separate-two">' +
                '<span class="flip-card-edit">' +
                '<span><a class="tooltip1" data-toggle="tooltip" data-placement="top" data-original-title="Edit Card" style="text-decoration: none" href="/design-business-card-online/edit/' + card_resp.id + '/mydesigns"><i class="fa fa-pencil-square-o"></i></a></span>' +
                '</span>' +
                '<span class="flip-card-remove">' +
                '<span><a class="tooltip1 removeCardBtn' + card_resp.id + '" data-toggle="tooltip" data-placement="top" data-original-title="Remove Card" style="text-decoration: none" href="#"><i class="fa fa-trash"></i></a></span>' +
                '</span>' +
                '</div>' +
                '</div>' +
                '</span>' +
                '</li>';
            $(".my-cards-ul").append(item); 
            
            if (card_resp.design_type == "SystemDesign"){
                updateJQSvgImage("#svgCardObject" +card_resp.id, imgSrc);
            } else { 
                updateJQSvgImage("#svgCardObject" +card_resp.id, "/img/customCard.svg"); 
            }
            $(".removeCardBtn" + card_resp.id).click(function (e) {
                e.preventDefault();
                removeFromUserCards(card_resp.id)
            });
            $(".buyBtn" + card_resp.id).click(function (e) {
                e.preventDefault();
                buyCard(card_resp.id)
            });
            $('.tooltip1').tooltip();
        };
        if (isLoggedIn(true) == true) {
            doPost("/listUserCards", {}, function (resp) {
                if (resp.status == 200) {
                    $(".card-count").text("(" + resp.cards.length + ")");
                    if (resp.cards.length > 0) {
                        for (var i = 0; i < resp.cards.length; i++) {
                            //var card_resp = resp.cards[i];
                            addCard(resp.cards[i]);
                        }
                    } else {
                        $(".my-cards-ul").text("No cards created.");
                    }
                    $('.my-cards-list').hover(function () {
                        $(this).find('.flip-card-template').show();
                    }, function () {
                        $(this).find('.flip-card-template').hide();
                    });
                } else if (resp.status == 201) {
                    $(".my-cards-ul").html("No Cards found! Click <a href='/design-business-card-online'><b>here</b></a> to create one.");
                } else {
                    $(".my-cards-ul").html("No Cards found! Click <a href='/design-business-card-online'><b>here</b></a> to create one.");
                    bootbox.alert("Error: " + resp.msg);
                }
            });
        } else {
            var localCards = retrieveJson("cards");
            if (localCards != null) {
                if (localCards.length > 0) {
                    $(".card-count").text("(" + localCards.length + ")");
                    localCards.forEach(function (val, idx) {
                        var value = retrieveJson(val);
                        value.id = val;
                        addCard(value);
                    });
                } else {
                    $(".my-cards-ul").html("No Cards found! Click <a href='/design-business-card-online'><b>here</b></a> to create one.");
                }
            } else {
                $(".my-cards-ul").html("No Cards found! Click <a href='/design-business-card-online'><b>here</b></a> to create one.");
            }
            $('.my-cards-list').hover(function () {
                $(this).find('.flip-card-template').show();
            }, function () {
                $(this).find('.flip-card-template').hide();
            });
        }
    }

    function buyCard(cardId) {
        addCardToShoppingCart(cardId, function () {
            updateCartCount(isLoggedIn());
            bootbox.alert("Card added to shopping cart.");
        });
    }

    function removeFromUserCards(id) {
        id = id + "";
        bootbox.confirm("Are you sure to delete this card?", function (result) {
            if (result == true) {
                var updateEmptyText = function (cardId, local) {
                    $(".myCardItems" + cardId).remove();
                    $(".card-count").text("(" + $(".my-cards-ul").children().length + ")");
                    $(".hist-count").text("(" + $(".purchaseHistoryItem").length + ")");
                    if ($(".my-cards-ul").children().length < 1) {
                        $(".my-cards-ul").text("No cards created.");
                    }
                    updateCartCount(local);
                }
                if (id.toString().indexOf("card_") == 0) {
                    removeItemLocally("cards", id);
                    updateEmptyText(id, false);
                } else {
                    addWaitingOverlay();
                    doPost("/removeUserCard", {id: id}, function (resp) {
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
