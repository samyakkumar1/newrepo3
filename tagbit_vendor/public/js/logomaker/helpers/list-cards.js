var addCardToInnerTable;
$(function () {
    var nextIndex = 0;
    var STEP = 10;
    var loadingInProgress = false;

    function init() {
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > $(document).height() - $(window).height() - 10) {
                if (!loadingInProgress){
                    loadingInProgress = true;
                    doPost("/listCards", {start: nextIndex}, function (resp) {
                        loadingInProgress = false;
                        if (resp.status == 200) {
                            nextIndex += STEP;
                            loadMoreCards(resp.cards);
                        } else if (resp.status == 201) {
                            if ($(".cardsContainer").children().length <= 1) {
                                $(".cardsContainer").append("<span class='no-cards'>No cards available.</span>");
                            }
                        } else {
                            console.log(resp);
                            bootbox.alert("Can't list cards.");
                        }
                    }, function (err){
                        loadingInProgress = false;
                    });
                }
            }
        }).scroll();
    }

    init();

    function loadMoreCards(cards) {
        for (var i = 0; i < cards.length; i++) {
            addCardToTables(cards[i].id, cards[i].category_name, cards[i].s3_front_card_url, cards[i].s3_back_card_url, cards[i].title, cards[i].desc, true);
        }
    }

    function editCardFile(id) {
        doPost("/getCardDetails", {id: id}, function (resp) {
            if (resp.status == 200) {
                var categories = resp.card.categories.split(",");
                $("#addBCTitle").val(resp.card.title);
                $("#addBCDesc").val(resp.card.desc);
                $("#addBCUrl").val(resp.card.url);
                $("#addBCSeoTitle").val(resp.card.seo_title);
                $("#addBCSeoDescription").val(resp.card.seo_description);
                $("#addBCSeoKeyword").val(resp.card.seo_keyword);
                $("#addBCCategoryName").select2('val', categories);
                cardId = id;
                $('#addCardModal').modal('show');
            } else {
                bootbox.alert("Can't retrieve card details.");
            }
        });
    } 
    
    function addCardToTables(id, category_name, s3_front_card_url, s3_back_card_url, rtitle, rdesc, toBottom) {
        var title = rtitle == "" ? "No title" : rtitle;
        var desc = rdesc == "" ? "No Description" : rdesc;
        var cardItem =
            '<div class="col-md-4 card' + id + '">' +
            '<ul class="business_cards">' +
            '<li class="business_cardsSection">' +
            '<div class="team-item thumbnail cardItems">' +
            '<div class="cardFrontPrev' + id + '"></div>' +
            '<div class="cardBackPrev' + id + '"></div>' +
            '<span class="card_category"><b>Category : </b>' + category_name + '</span>' +
            '<span class="card_title"><b>' + title + '</b></span>' +
            '<div class="card_details" style="width: 100%">' +
            '<span class="card_category"><b>Category : </b>' + category_name + '</span>' +
            '<span class="card_title"><b>' + title + '</b></span>' +
            '<p>' + desc + '</p>' +
            '<hr>' +
            '<span class="action-icons">' +
            '<span class="edit_icon editCardFile' + id + '"><a class="action_tooltip"><i class="fa fa-pencil" data-toggle="tooltip" data-placement="bottom" data-original-title="Edit"></i></a></span>' +
            '<span class="delete_icon deleteCardFile' + id + '"><a class="action_tooltip"><i class="fa fa-trash-o" data-toggle="tooltip" data-placement="bottom" data-original-title="Delete"></i></a></span>' +
            '</span>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '</ul>' +
            '<div class="card_swap">' +
            '<span class="front_card"><a class="active">Front</a></span>' +
            '<span class="slash">|</span>' +
            '<span class="back_card"><a>Back</a></span>' +
            '</div>' +
            '</div>';
        if (toBottom){
            $(".cardsContainer").append(cardItem); 
        } else {
            $(".cardsContainer").prepend(cardItem); 
        } 
        $(".editCardFile" + id).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            editCardFile(id);
        });
        $(".deleteCardFile" + id).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            deleteCardFile(id);
        });
        $('.cardFrontPrev' + id).show();
        $('.cardBackPrev' + id).hide();
        updateCardImage(id, '/getCardImage?id=' + s3_front_card_url + '&random=' + Math.random(), "F");
        if (s3_back_card_url != null) {
            updateCardImage(id, '/getCardImage?id=' + s3_back_card_url + '&random=' + Math.random(), "B");
        }
        $('.front_card').on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).find('a').addClass("active");
            $(this).next().next().find('a').removeClass("active");
        });
        $('.back_card').on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).find('a').addClass("active");
            $(this).prev().prev().find('a').removeClass("active");
        });
        $('.card' + id + ' .back_card').on('click', function () {
            $('.cardFrontPrev' + id).hide();
            $('.cardBackPrev' + id).show();
        });
        $('.card' + id + ' .front_card').on('click', function () {
            $('.cardFrontPrev' + id).show();
            $('.cardBackPrev' + id).hide();
        });
    }

    function deleteCardFile(id) {
        bootbox.confirm("Do you want to delete this card?", function (result) {
            if (result == true) {
                addWaitingOverlay();
                doPost("/removeCard", {id: id}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        $(".card" + id).remove();
                    } else {
                        console.log(resp);
                        bootbox.alert("Can't remove cards.");
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    console.log(err);
                    bootbox.alert("Error: Can't add to server");
                });
            }
        });
    }
    
    addCardToInnerTable = addCardToTables;
});
