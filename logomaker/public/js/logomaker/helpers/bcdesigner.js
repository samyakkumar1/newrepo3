/**
 * Created by DesignerBe on 07-10-2020.
 */

$(function () {
    var backDesignFile;
    var frontDesignFile;
    var baseCardId;
    var savedCardId;
    var currentPricingInfo = [];
    var lastCountry;
    var editFrom;
    var selectedLogo;
    var savedCardSettings = {};
    var logoCache = {};
    var listCardReqPending = false;

    var editingBackCard = false;
    var isCardEdit = false;
    var parentObj = {
        changeTextOfThis: function (id, val) {
            if (id == "#cardWebSite" && val == "") {
                val = "www.example.com";
                window.editorFrameBack.setCardWebSite(val);
            }
            $(id).val(val);
        },
        getSupportedFonts: getSupportedFonts,
        document: document,
        executeKeyUps: function () {
            $("#cardTitle").keyup();
            $("#cardName").keyup();
            $("#cardAL1").keyup();
            $("#cardAL2").keyup();
            $("#cardPhone").keyup();
            $("#cardEmail").keyup();
            $("#cardWebSite").keyup();
        }
    };
    var isHashEvent = false;

    $(window).on("hashAdding", function (evt) {
        isHashEvent = true;
    });

    $(window).on("hashRemoving", function (evt) {
        isHashEvent = false;
    });

    function urlChanged() {
        if (!location.hash && isHashEvent) {
            isHashEvent = false;
        }
        if (!isHashEvent) {
            if (history.state == null) {
                var urls = window.location.pathname.split("/").splice(2).join("/");
                pushState(urls, "design-business-card-online/" + urls);
                urlChanged();
            } else {
                var listCards = function (callback) {
                    if ($(".cards-list").children().length == 1) {
                        getLogo(function (imageUrl) {
                            if (!listCardReqPending) {
                                addWaitingOverlay();
                                listCardReqPending = true;
                                doPost("/listCards", {}, function (resp) {
                                    listCardReqPending = false;
                                    if (resp.status == 200) {
                                        for (var i = 0; i < resp.cards.length; i++) {
                                            var backURL = (resp.cards[i].s3_back_card_url == null ? null : "\'/getCardImage?id=" + resp.cards[i].s3_back_card_url + "\'");
                                            var card = $('<li class="col-md-3 cards-li">' +
                                                '<div class="cardPreview" id="cardPrev' + resp.cards[i].id + '" data-front-url="' + resp.cards[i].s3_front_card_url + '" data-back-url="' + backURL + '" data-id="' + resp.cards[i].id + '" data-url="' + formatUrl(resp.cards[i].url, resp.cards[i].id) + '" data-seo-title="' + resp.cards[i].seo_title + '" data-seo-description="' + resp.cards[i].seo_description + '" data-seo-keyword="' + resp.cards[i].seo_keyword + '"></div>' +
                                                '</li>');
                                            $(".cards-list").append(card);
                                            updateCardImage("#cardPrev" + resp.cards[i].id, '/getCardImage?id=' + resp.cards[i].s3_front_card_url, imageUrl);
                                            $('#cardPrev' + resp.cards[i].id).click(function (e) {
                                                e.preventDefault();
                                                $(".wiz-one").html("<a href='/design-business-card-online' class='text-center' aria-expanded='false'><span class='badge hidden-xs'>1</span>Choose template</a>");

                                                if ($("#svgedit").is(":visible")) {
                                                    if (window.location.pathname.split("/")[2] == $(this).attr("data-url")) {
                                                        showToast("Click reset button in editor to reset the card!");
                                                    } else {
                                                        var url = $(this).attr("data-url");
                                                        bootbox.confirm("The current modifications will be <b>erased</b>.<br/>Do you want to continue?", function (result) {
                                                            if (result == true) {
                                                                changeUrl(url);
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    changeUrl($(this).attr("data-url"));
                                                }
                                            });
                                        }
                                    } else if (resp.status == 201) {
                                        bootbox.alert("No cards available");
                                    } else {
                                        bootbox.alert("Error: " + resp.msg);
                                    }
                                    callback ? callback() : $.noop();
                                    removeWaitingOverlay();
                                }, function (err) {
                                    listCardReqPending = false;
                                    callback ? callback() : $.noop();
                                    removeWaitingOverlay();
                                    console.log(err);
                                    bootbox.alert("Server Error.");
                                });
                            }
                        });
                    } else {
                        callback ? callback() : $.noop();
                    }
                };
                var states = history.state.name.split("/");
                if (states[1] == "go-back") {
                    history.back();
                } else if (states[0] == "") {
                    $(".panel-two").hide();
                    $('html, body').animate({
                        scrollTop: 0
                    }, 1000);
                    $(".panel-four").hide();

                    $('.wizard-steps li').removeClass('active');
                    $('.wiz-one').addClass('active');
                    listCards();
                } else {
                    var _editCardTemplate = function (id, callback) {
                        addWaitingOverlay();
                        doPost("/getCardDetails", {id: id}, function (resp) {
                            removeWaitingOverlay();
                            if (resp.status == 200) {
                                var back_card = resp.card.s3_back_card_url;
                                if (back_card != null && back_card != "null") {
                                    back_card = '/getCardImage?id=' + back_card + "&type=" + encodeURIComponent("text/plain")
                                } else {
                                    back_card = '/getCardImage?id=backCardPreview.svg' + "&type=" + encodeURIComponent("text/plain")
                                }
                                editThisCard(states, '/getCardImage?id=' + resp.card.s3_front_card_url + "&type=" + encodeURIComponent("text/plain"), back_card, id, function () {
                                    callback ? callback() : $.noop();
                                });
                            } else {
                                bootbox.alert(resp.msg);
                            }
                        }, function (err) {
                            removeWaitingOverlay();
                            console.log(err);
                            bootbox.alert((typeof err == "string" ? err : "Server Error."));
                        });
                    };
                    var _finalWizardStep = function (callback) {
                        if (states[1] == "quantity" && states[0] != "upload-card-design") {
                            window.editorFrame.saveAction(true, function (data) {
                                $("#bCardPreview").attr("src", data);
                            });
                        }
                        $("#bfhCountryBcard").val($(".top-countries-list").val());
                        $('.panel-three').slideDown();
                        $('.wizard-steps li').removeClass('active');

                        if (states[1] == "delivery") {
                            $('.wiz-four').addClass('active');
                        } else {
                            $('.wiz-three').addClass('active');
                        }

                        $('#accordionThree').slideDown();
                        $('#accordionThree').addClass('in');
                        $('.create-card-main').css('min-height', '1500px');
                        setupCountryChangeHandler();
                        updatePricingWithCountry();
                        $('.contents').hide();
                        $('#quantity').hide();
                        $('#finish').hide();
                        $('#stock').hide();
                        $('#delivery').hide();
                        $('#back-of-card').hide();
                        $('.panel-body .tabs .nav li').removeClass('active');
                        $('.panel-body .tabs .nav li.li-' + states[1]).addClass('active');
                        setupFinishWizardLinks(states);
                        $('html, body').animate({
                            scrollTop: $(".panel-three").offset().top - 50
                        }, 1000).promise().then(function () {
                            callback ? callback() : $.noop();
                        });
                        $('#' + states[1]).show();
                    };

                    if (states[0] == "use") {
                        if (states[1] != "any") {
                            selectedLogo = states[1];
                        }
                        if (states[2] && states[2] != "any") {
                            var obj = $("[data-id=" + states[2] + "]");
                            changeUrl(states[2]);
                        } else {
                            changeUrl("");
                        }
                    } else {
                        listCards(function () {
                            if (states[0] == "edit") {
                                initiateEditCardProcedure(states[1], states[2]);
                            } else {
                                var obj = $("[data-url=" + states[0] + "]");
                                if (obj.attr("data-id")) {
                                    if (obj.attr("data-seo-keyword")) {
                                        $("meta[name=keywords]").attr("content", obj.attr("data-seo-keyword"));
                                    }
                                    if (obj.attr("data-seo-description")) {
                                        $("meta[name=description]").attr("content", obj.attr("data-seo-description"));
                                    }
                                    if (obj.attr("data-seo-title")) {
                                        $("title").text(obj.attr("data-seo-title"));
                                    }
                                }
                                if (!states[1]) {
                                    $(".panel-three").hide();
                                }
                                switch (states[1]) {
                                    case "finish":
                                    case "stock":
                                    case "back-of-card":
                                    case "delivery":
                                    case "quantity":
                                    {
                                        if (states[0] == "upload-card-design" || (window.editorFrame && window.editorFrame.saveAction)) {
                                            if (states[0] == "upload-card-design") {
                                                if (!savedCardSettings) {
                                                    savedCardSettings = {};
                                                }
                                                savedCardSettings.purchase_design = false;
                                                savedCardSettings.dont_print_card = false;
                                                $("[name=optionsPurchaseCardDesign]").parent().parent().parent().hide();
                                                $(".goto-edit-card").hide();
                                                if (!$(".panel-four").is(":visible")) {
                                                    $(".panel-four").show();
                                                }
                                            } else {
                                                $(".goto-edit-card").show();
                                                $("[name=optionsPurchaseCardDesign]").parent().parent().parent().show();
                                            }
                                            _finalWizardStep();
                                        } else {
                                            _editCardTemplate(obj.attr("data-id"), _finalWizardStep);
                                        }
                                        if (states[1] == "quantity") {
                                            if (savedCardSettings) {
                                                if (savedCardSettings.back_of_card == "Custom") {
                                                    $("[name=optionsBackOfCard][value=Custom]").prop("checked", true);
                                                } else {
                                                    $("[name=optionsBackOfCard][value=Blank]").prop("checked", true);
                                                    savedCardSettings.back_of_card = "Blank";
                                                }

                                                if (savedCardSettings.qty > 1000) {
                                                    $("#moreQtysRadio").prop("checked", true);
                                                    $("#more-quantity").val(savedCardSettings.qty);
                                                } else {
                                                    if (savedCardSettings.qty) {
                                                        $("[name=optionsCount][value=" + savedCardSettings.qty + "]").prop("checked", true);
                                                    } else {
                                                        $("[name=optionsCount][value='500']").prop("checked", true);
                                                        savedCardSettings.qty = 500;
                                                    }
                                                }
                                                if (savedCardSettings.finish == "GLOSS") {
                                                    $("[name=optionsFinish][value=GLOSS]").prop("checked", true);
                                                } else {
                                                    $("[name=optionsFinish][value=MATT]").prop("checked", true);
                                                    savedCardSettings.finish = "MATT";
                                                }
                                                if (savedCardSettings.paper_stock == "UltraPremium") {
                                                    $("[name=optionsPaper][value=UltraPremium]").prop("checked", true);
                                                } else {
                                                    $("[name=optionsPaper][value=Premium]").prop("checked", true);
                                                    savedCardSettings.paper_stock = "Premium";
                                                }
                                                if (savedCardSettings.shipping_type == "Exp") {
                                                    $("[name=optionsShipping][value=Exp]").prop("checked", true);
                                                } else {
                                                    $("[name=optionsShipping][value=Std]").prop("checked", true);
                                                    savedCardSettings.shipping_type = "Std";
                                                }
                                                if (savedCardSettings.purchase_design == true) {
                                                    $("[name=optionsPurchaseCardDesign]").prop("checked", true);
                                                } else {
                                                    $("[name=optionsPurchaseCardDesign]").prop("checked", false);
                                                    savedCardSettings.purchase_design = false;
                                                }
                                                if (savedCardSettings.dont_print_card == true) {
                                                    $("[name=optionsDontWantPrintedCard]").prop("checked", true);
                                                } else {
                                                    $("[name=optionsDontWantPrintedCard]").prop("checked", false);
                                                    savedCardSettings.dont_print_card = false;
                                                }
                                            } else {
                                                $("[name=optionsBackOfCard][value=Blank]").prop("checked", true);
                                                $("[name=optionsCount][value='500']").prop("checked", true);
                                                $("[name=optionsFinish][value=MATT]").prop("checked", true);
                                                $("[name=optionsPaper][value=Premium]").prop("checked", true);
                                                $("[name=optionsShipping][value=Std]").prop("checked", true);
                                                $("[name=optionsPurchaseCardDesign]").prop("checked", false);
                                                $("[name=optionsDontWantPrintedCard]").prop("checked", false);
                                                savedCardSettings = {};
                                                savedCardSettings.shipping_type = "Std";
                                                savedCardSettings.paper_stock = "Premium";
                                                savedCardSettings.finish = "MATT";
                                                savedCardSettings.qty = 500;
                                                savedCardSettings.back_of_card = "Blank";
                                                savedCardSettings.purchase_design = false;
                                                savedCardSettings.dont_print_card = false;
                                            }

                                            if (editFrom == "purchase") {
                                                $("[name=optionsBackOfCard][value=Blank]").attr("disabled", true);
                                                $("[name=optionsBackOfCard][value=Custom]").attr("disabled", true);
                                                $("#moreQtysRadio").attr("disabled", true);
                                                $("#more-quantity").attr("disabled", true);
                                                $("[name=optionsCount]").attr("disabled", true);
                                                $("[name=optionsFinish][value=GLOSS]").attr("disabled", true);
                                                $("[name=optionsFinish][value=MATT]").attr("disabled", true);
                                                $("[name=optionsPaper][value=UltraPremium]").attr("disabled", true);
                                                $("[name=optionsPaper][value=Premium]").attr("disabled", true);
                                                $("[name=optionsShipping][value=Std]").attr("disabled", true);
                                                $("[name=optionsShipping][value=Exp]").attr("disabled", true);
                                                $("[name=optionsPurchaseCardDesign]").attr("disabled", true);
                                                $("[name=optionsDontWantPrintedCard]").attr("disabled", true);
                                            }
                                        }
                                        if (savedCardSettings.dont_print_card == true) {
                                            $("#noCardPrintOut").removeClass("hidden");
                                            $("[name=optionsDontWantPrintedCard]").change();
                                        } else {
                                            $("[name=optionsPurchaseCardDesign]").change();
                                        }
                                        break;
                                    }
                                    case "save-card":
                                    {
                                        saveCard(states[0] == "upload-card-design");
                                        break;
                                    }
                                    default:
                                    {
                                        if (states[0] == "upload-card-design") {
                                            if (!$(".panel-four").is(":visible")) {
                                                backDesignFile = undefined;
                                                frontDesignFile = undefined;
                                                $(".panel-four").slideDown();
                                                $(".panel-two").hide();
                                                $('html, body').animate({
                                                    scrollTop: $(".panel-four").offset().top - 100
                                                }, 1000);
                                                $(".wiz-two").html("   <a href='" + window.location + "' class='text-center' aria-expanded='false'><span class='badge hidden-xs'>2</span>Upload Custom Card</a>");
                                                $(".wizard-steps .wiz-two a").css("cursor", "pointer");
                                                $('.wizard-steps li').removeClass('active');
                                                $('.wiz-two').addClass('active');
                                                if (states[1] == "edit") {
                                                    $(".downloadFrontCardFile").show();
                                                    $(".downloadFrontCardFile").attr("href", savedCardSettings.s3_front_card_url);
                                                    if (savedCardSettings.s3_back_card_url) {
                                                        $(".downloadBackCardFile").show();
                                                        $(".removeBackCardFile").show();
                                                        $(".downloadBackCardFile").attr("href", savedCardSettings.s3_back_card_url);
                                                    } else {
                                                        $(".downloadBackCardFile").hide();
                                                        $(".removeBackCardFile").hide();
                                                    }
                                                } else {
                                                    $(".downloadFrontCardFile").hide();
                                                    $(".downloadBackCardFile").hide();
                                                    $(".removeBackCardFile").hide();
                                                }
                                            }
                                        } else {
                                            $(".wiz-two").html("   <a href='" + window.location + "' class='text-center' aria-expanded='false'><span class='badge hidden-xs'>2</span>Design Business Card</a>");
                                            if (states[3] != "edit") {
                                                if (states[1] == "edit") {
                                                    editThisCard(states, savedCardSettings.s3_front_card_url, savedCardSettings.s3_back_card_url, baseCardId, function () {

                                                    });
                                                } else {
                                                    _editCardTemplate(obj.attr("data-id"));
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    }

    function init() {
        $("head").append($("#allFonts").html());
        //updateMoneyJs();
        $('#footer').addClass('create-card-footer');
        var windowH = $(window).height();
        $(window).scroll(function () {
            $('.create-card-footer').show();
        });
        $("#savedLogosList").select2({
            formatResult: format,
            formatSelection: formatSel,
            escapeMarkup: function (m) {
                return m;
            }
        });
        $("#uploadDesignLink").click(function () {
            changeUrl("upload-card-design")
        });
        $("#savedLogosList").on("select2-close", function (e) {
            e.preventDefault();
            var fn = function (data) {
                if (editingBackCard) {
                    window.editorFrameBack.loadCard(undefined, data, true);
                } else {
                    window.editorFrame.loadCard(undefined, data, true);
                }
            };
            var src = $(e.target).find(":selected").data("src");
            if (src) {
                if (src.indexOf("logo_") >= 0) {
                    var logo = retrieveJson(src);
                    src = logo.url;
                }
                if (src.indexOf("/getUserLogoImage") >= 0) {
                    $.get(src, {}, function (data) {
                        fn(data);
                    }, "text");
                } else {
                    fn(src);
                }
            }
        });
        if (isLoggedIn()) {
            doPost("/listUserLogos", {}, function (resp) {
                if (resp.status == 200) {
                    for (var i = 0; i < resp.logos.length; i++) {
                        var logo_resp = resp.logos[i];
                        var item = $('<option value="' + i + '" data-src="/getUserLogoImage?id=' + logo_resp.s3_logo_url + '&type=' + encodeURIComponent("text/plain") + '">' + logo_resp.company_name + '</option>');
                        $("#savedLogosList").append(item);
                    }
                }
            });
        } else {
            var logos = retrieveJson("logos");
            if (logos != null) {
                for (var i = 0; i < logos.length; i++) {
                    var logo_resp = retrieveJson(logos[i]);
                    var item = $('<option value="' + i + '" data-src="' + logos[i] + '">' + logo_resp.company_name + '</option>');
                    $("#savedLogosList").append(item);
                }
            }
        }
        $('#accordion .panel-heading').on("click", function () {
            $('#accordion .panel-heading').find('.panel-title a i.fa-caret-right').show();
            $('#accordion .panel-heading').find('.panel-title a i.fa-caret-down').hide();
            if ($('#accordion .panel-heading').next().hasClass('in')) {
                $(this).find('.panel-title a i.fa-caret-right').hide();
                $(this).find('.panel-title a i.fa-caret-down').show();
            } else {
                $(this).find('.panel-title a i.fa-caret-right').show();
                $(this).find('.panel-title a i.fa-caret-down').hide();
            }
        });

        $('.add-new-line').on("click", function (e) {
            e.preventDefault();
            addHardText();
        });
        $(".displayFront").click(function (e) {
            isCardEdit = false;
            e.preventDefault();
            displayFront();
        });
        $(".displayBack").click(function (e) {
            displayBack();
            e.preventDefault();
        });
        $(".goto-edit-card").click(function (e) {
            isCardEdit = false;
            e.preventDefault();
            gotoEditCard();
        });
        $("#back-to-card-lists").click(function (e) {
            changeUrl("");
        });

        $(".removeBackCardFile").click(function (e) {
            e.preventDefault();
            bootbox.confirm("Are you sure?", function (result) {
                if (result) {
                    delete savedCardSettings.back_of_card;
                    delete savedCardSettings.s3_back_card_url;
                    backDesignFile = undefined;
                    $(".downloadBackCardFile").hide();
                    $(".removeBackCardFile").hide();
                    $("#customBackDesignUploader").val(undefined);
                }
            });
        });
        $("#next-to-card-params").click(function (e) {
            if (savedCardId) {
                if (!savedCardSettings.s3_back_card_url) {
                    bootbox.confirm("Do you want to continue without uploading the back of card?", function (result) {
                        if (result) {
                            gotoCardParametersStep();
                        }
                    });
                } else {
                    gotoCardParametersStep();
                }
            } else {
                if (frontDesignFile) {
                    if (backDesignFile) {
                        savedCardSettings.back_of_card = savedCardSettings.back_of_card || "Custom";
                        gotoCardParametersStep();
                    } else {
                        bootbox.confirm("Do you want to continue without uploading the back of card?", function (result) {
                            if (result) {
                                gotoCardParametersStep();
                            }
                        });
                    }
                } else {
                    bootbox.alert("Please upload file for atleast front of the card!")
                }
            }
        });


        $("#customFrontDesignUploader").change(function () {
            readFile.call(this, function (file, ext) {
                frontDesignFile = {
                    content: file,
                    type: ext
                };
            });
        });
        $("#customBackDesignUploader").change(function () {
            readFile.call(this, function (file, ext) {
                $(".removeBackCardFile").show();
                backDesignFile = {
                    content: file,
                    type: ext
                };
            });
        });

        $("#fileUpload").change(function () {
            var files = this.files; //FileList object
            var file = files[0];
            if (!file.type.match('image')) {
                bootbox.alert("Please select an image");
            } else {
                var picReader = new FileReader();
                picReader.addEventListener("load", function (event) {
                    var picFile = event.target;
                    if (editingBackCard) {
                        window.editorFrameBack.loadCard(undefined, picFile.result, false);
                    } else {
                        window.editorFrame.loadCard(undefined, picFile.result, false);
                    }
                });
                picReader.readAsDataURL(file);
            }
        });
        $("#cardName").keyup(function () {
            if (window.editorFrame && window.editorFrame.setCardTitle != undefined) {
                window.editorFrame.setCardName($("#cardName").val());
            }
            if (window.editorFrameBack && window.editorFrameBack.setCardTitle != undefined) {
                window.editorFrameBack.setCardName($("#cardName").val());
            }
        });
        $("#cardTitle").keyup(function () {
            if (window.editorFrame && window.editorFrame.setCardTitle != undefined) {
                window.editorFrame.setCardTitle($("#cardTitle").val());
            }
            if (window.editorFrameBack && window.editorFrameBack.setCardTitle) {
                window.editorFrameBack.setCardTitle($("#cardTitle").val());
            }
        });
        $("#cardWebSite").keyup(function () {
            if (window.editorFrame && window.editorFrame.setCardTitle != undefined) {
                window.editorFrame.setCardWebSite($("#cardWebSite").val());
            }
            if (window.editorFrameBack && window.editorFrameBack.setCardTitle != undefined) {
                window.editorFrameBack.setCardWebSite($("#cardWebSite").val());
            }
        });
        $("#cardEmail").keyup(function () {
            if (window.editorFrame && window.editorFrame.setCardTitle != undefined) {
                window.editorFrame.setCardEmail($("#cardEmail").val());
            }
            if (window.editorFrameBack && window.editorFrameBack.setCardTitle != undefined) {
                window.editorFrameBack.setCardEmail($("#cardEmail").val());
            }
        });
        $("#cardPhone").keyup(function () {
            if (window.editorFrame && window.editorFrame.setCardTitle != undefined) {
                window.editorFrame.setCardPhone($("#cardPhone").val());
            }
            if (window.editorFrameBack && window.editorFrameBack.setCardTitle != undefined) {
                window.editorFrameBack.setCardPhone($("#cardPhone").val());
            }
        });
        $("#cardAL1").keyup(function () {
            if (window.editorFrame && window.editorFrame.setCardTitle != undefined) {
                window.editorFrame.setCardAL1($("#cardAL1").val());
            }
            if (window.editorFrameBack && window.editorFrameBack.setCardTitle != undefined) {
                window.editorFrameBack.setCardAL1($("#cardAL1").val());
            }
        });
        $("#cardAL2").keyup(function () {
            if (window.editorFrame && window.editorFrame.setCardTitle != undefined) {
                window.editorFrame.setCardAL2($("#cardAL2").val());
            }
            if (window.editorFrameBack && window.editorFrameBack.setCardTitle != undefined) {
                window.editorFrameBack.setCardAL2($("#cardAL2").val());
            }
        });
        $(".card-save").click(function (e) {
            e.preventDefault();
            if (savedCardSettings.back_of_card != "Custom") {
                bootbox.confirm("Do you want to continue without editing the back of card?", function (result) {
                    if (result) {
                        gotoCardParametersStep();
                    }
                });
            } else {
                gotoCardParametersStep();
            }
        });
        $(".wiz-two").click(function (e) {
            $(".panel-three").hide();
        });
        $('#footer').addClass('create-card-footer');
        $('.cards-list .cards-li').hover(function () {
            $(this).addClass('active');
        }, function () {
            $(this).removeClass('active');
        });
        $('.card-back').on('click', function () {
            $('.wizard-steps li').removeClass('active');
            $('.wiz-one').addClass('active');
            $('#accordionOne').slideDown();
            $('html, body').animate({
                scrollTop: $("#accordionOne").prev('.panel-heading').offset().top - 100
            }, 1000).promise().done(function () {
                changeUrl("");
            });
        });
        $('#more-quantity').select2();
        if ($(this).next().hasClass('in')) {
            $(this).find('.panel-title a i.fa-caret-right').hide();
            $(this).find('.panel-title a i.fa-caret-down').show();
        } else {
            $(this).find('.panel-title a i.fa-caret-right').show();
            $(this).find('.panel-title a i.fa-caret-down').hide();
        }
        $(document).on("cardSavedFromLogin", function (evt) {
            if (savedCardId == evt.localId) {
                savedCardId = evt.id;
            }
        });
        $('.logo-card').hover(function () {
            $(this).find('.flip-card-template-new').show();
        }, function () {
            $(this).find('.flip-card-template-new').hide();
        });
        $(".top-countries-list").on("change.bfhselectbox", function (e) {
            e.preventDefault();
            $("#bfhCountryBcard").val($(".top-countries-list").val());
            $('#bfhCountryBcard').trigger("change.bfhselectbox");
        });
        setupCountryChangeHandler();
        urlChanged();
        addPopState(urlChanged);
    }

    function gotoCardParametersStep() {
        $(".wiz-two").html("   <a href='" + window.location + "' class='text-center' aria-expanded='false'><span class='badge hidden-xs'>2</span>Design Business Card</a>");
        $(".wizard-steps .wiz-two a").css("cursor", "pointer");
        var newUrl = window.location.pathname.split("/").splice(2);
        newUrl[1] = "quantity";
        changeUrl(newUrl.join("/"));
    }

    function setupCountryChangeHandler() {
        $('#bfhCountryBcard').unbind("change.bfhselectbox").on('change.bfhselectbox', function () {
            if (lastCountry != $(this).val()) {
                addWaitingOverlay();
                lastCountry = $(this).val();
                doPost("/getPricingDetails", {type: "BC", country: $(this).val()}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200 || resp.status == 201) {
                        currentPricingInfo = resp;
                        updateTotalPrice();
                    } else {
                        bootbox.alert("Error: " + resp.msg);
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    bootbox.alert("Error contacting server.");
                    console.log(err);
                });
            }
        });
    }

    function editThisCard(states, url, url_back, id, callback) {
        baseCardId = id;
        if (url_back == null || url_back == undefined) {
            url_back = "/img/blank-card.svg";
        }
        showCardEditor(function () {
            var user = getUser();
            var fn = function () {
                if (user != undefined) {
                    if (!$("#cardName").val()) {
                        if (user.first_name != null) {
                            if (user.last_name != null) {
                                $("#cardName").val(user.first_name + user.last_name);
                            } else {
                                $("#cardName").val(user.first_name);
                            }
                        }
                    }
                    $("#cardAL1").val($("#cardAL1").val() ? $("#cardAL1").val() : user.address == null ? "" : user.address.replace("\n", ", "));
                    $("#cardAL2").val($("#cardAL2").val() ? $("#cardAL2").val() : user.postal_code);
                    $("#cardPhone").val($("#cardPhone").val() ? $("#cardPhone").val() : user.phone_num);
                    $("#cardEmail").val($("#cardEmail").val() ? $("#cardEmail").val() : user.email);
                }
            };
            //$('.create-card-main').css('min-height', '1800px');
            createIframes(function () {
                setupFrame(states, window.editorFrame, url, id, function (url, id) {
                    parentObj.executeKeyUps();
                }, false);
                fn();
            }, function () {
                if (url_back != null && url_back != "null") {
                    setupFrame(states, window.editorFrameBack, url_back, id, function (url, id) {
                        parentObj.executeKeyUps();
                    }, true);
                    fn();
                }
            }, callback);
        });
    }

    function format(state) {
        var updateLogoImage = function (id, url) {
            var timeoutFn = function (interval) {
                setTimeout(function () {
                    if ($(id).length > 0) {
                        updateJQSvgImage(id, url);
                    } else {
                        timeoutFn(interval + 100);
                    }
                }, interval);
            };
            timeoutFn(0);
        };
        var originalOption = state.element;
        if (!state.id) {
            return state.text;
        } // optgroup
        var src = $(originalOption).data('src');
        var tag;
        if (src.indexOf("logo_") >= 0) {
            updateLogoImage("#cmbLogoPreview" + state.id, "data:image/svg+xml;base64," + Base64.encode(retrieveJson(src).url));
        } else {
            if (logoCache[src]) {
                updateLogoImage("#cmbLogoPreview" + state.id, logoCache[src]);
            } else {
                /*
                 doGet(src, {}, function (result) {
                 if (result.error) {
                 console.log(result);
                 } else {
                 logoCache[src] = "data:image/svg+xml;base64," + Base64.encode(result);
                 updateLogoImage("#cmbLogoPreview" + state.id, logoCache[src]);
                 }
                 });
                 */
                updateLogoImage("#cmbLogoPreview" + state.id, src);
            }
        }
        tag = '<div id="cmbLogoPreview' + state.id + '" style="height: 100px"></div><span style="display: block;text-align: center;">' + state.text + '</span>';
        return tag;
    }

    function formatSel(state) {
        var originalOption = state.element;
        if (!state.id) {
            return state.text;
        } // optgroup
        return state.text;
    }

    function setupFrame(states, editorFrame, url, id, callback, makeVisible) {
        editorFrame.setParent(parentObj);
        editorFrame.initCommon("BC");
        var _card_loaded = function () {
            if (makeVisible) {
                $("#svgedit").css("visibility", "visible");
            }
            callback ? callback(url, id) : $.noop();
        };
        if (states[1] == "edit") {
            addWaitingOverlay();
            editorFrame.loadCard(url, undefined, undefined, function () {
                editorFrame.resetImage();
                removeWaitingOverlay();
                _card_loaded();
            });
        } else {
            addWaitingOverlay();
            getLogo(function (logoImage) {
                editorFrame.loadCard(url, logoImage, true, function () {
                    _card_loaded();
                    removeWaitingOverlay();
                });
            });
        }
    }

    function initiateEditCardProcedure(id, from) {
        savedCardId = id;
        editFrom = from;
        var editCardFn = function (card, purchased) {
            $("#cardTitle").val(card.first_name);
            $("#cardName").val(card.last_name);
            $("#cardAL1").val(card.address_line_1);
            $("#cardAL2").val(card.address_line_2);
            $("#cardPhone").val(card.phone_no);
            $("#cardEmail").val(card.email);
            $("#cardWebSite").val(card.website);
            baseCardId = card.base_card_id || card.base_item_id;
            savedCardSettings = card;
            var back = card.url_back || card.s3_back_card_url;
            if (card.id.toString().indexOf("card_") > -1) {
                savedCardSettings.s3_front_card_url = card.url;
            } else {
                if (back) {
                    back = "/getUserCardImage?id=" + back + "&random=" + Math.random();
                }
                savedCardSettings.s3_front_card_url = "/getUserCardImage?id=" + (purchased ? card.url : card.s3_front_card_url) + "&random=" + Math.random();
            }
            savedCardSettings.s3_back_card_url = back;

            changeState("/go-back", "/go-back"); // to prevent back button
            if (savedCardSettings.design_type == "SystemDesign") {
                changeUrl(formatUrl(card.base_card_url, baseCardId) + "/edit");
            } else {
                changeUrl("upload-card-design/edit");
            }
        };

        if (id.toString().indexOf("card_") == 0) {
            var card = retrieveJson(id);
            card.id = id;
            doPost("/getCardDetails", {id: card.base_item_id}, function (resp) {
                if (resp.status == 200) {
                    card.base_card_url = resp.card.url;
                    editCardFn(card, false);
                } else {
                    console.log(resp);
                    bootbox.alert("Can't get base logo: " + resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });

        } else {
            addWaitingOverlay();
            var url;
            var purchase = (editFrom == "purchase");
            if (purchase == true) {
                url = "/getPurchasedItemDetails";
            } else {
                url = "/getUserCardDetails";
            }
            doPost(url, {id: id}, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    editCardFn(resp.card, purchase);
                } else {
                    bootbox.alert(resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });
        }
    }

    function createIframes(frontCallback, backCallBack, allCallBack) {
        addWaitingOverlay();
        $("#svgedit").remove();
        $("#svgedit_back").remove();
        var iframe1 = '<iframe src="/svgedit/bceditor_frame.html?v=' + version + '" name="editorFrame" style="margin: 0px; width: 100%; height: 100%; border: none; min-height: 200px; position: absolute; top: 0px; left: 0px" id="svgedit"></iframe>';
        var iframe2 = '<iframe src="/svgedit/bceditor_frame.html?v=' + version + '" name="editorFrameBack" style="margin: 0px; width: 100%; height: 100%; border: none; min-height: 200px; position: absolute; top: 0px; left: 0px" id="svgedit_back"></iframe>'
        $(".visiting-cards-temp").append(iframe1);
        $(".visiting-cards-temp").append(iframe2);
        removeWaitingOverlay();
        var frame = 0;
        var allFn = function () {
            frame++;
            if (frame == 2) {
                if (allCallBack != undefined) {
                    allCallBack();
                }
            }
        };
        $('#svgedit').load(function () {
            var fn2 = function () {
                removeWaitingOverlay();
                frontCallback();
                allFn();
                displayFront(false);
            };
            addWaitingOverlay();
            var _fn3 = function () {
                if (window.editorFrame) {
                    if (window.editorFrame.svgedit.browser.isGecko() || window.editorFrame.svgedit.browser.isIE()) {
                        setTimeout(fn2, 2048);
                    } else {
                        fn2();
                    }
                } else {
                    setTimeout(_fn3, 1024);
                }
            };
            _fn3();
        });
        $('#svgedit_back').load(function () {
            var fn2 = function () {
                removeWaitingOverlay();
                backCallBack();
                allFn();
            };
            addWaitingOverlay();
            var _fn3 = function () {
                if (window.editorFrameBack) {
                    if (window.editorFrameBack.svgedit.browser.isGecko() || window.editorFrameBack.svgedit.browser.isIE()) {
                        setTimeout(fn2, 2048);
                    } else {
                        fn2();
                    }
                } else {
                    setTimeout(_fn3, 1024);
                }
            };
            _fn3();
        });
    }

    function getLogo(callback) {
        if (!selectedLogo) {
            if (isLoggedIn() == false) {
                var logos = retrieveJson("logos");
                if (logos != null) {
                    selectedLogo = logos[logos.length - 1];
                }
                callback(selectedLogo);
            } else {
                doPost("/getLastLogo", {}, function (resp) {
                    if (resp.status == 200) {
                        selectedLogo = resp.url;
                    } else if (resp.status == 201) {
                        /* Do nothing */
                    } else {
                        console.log(resp);
                        bootbox.alert("Error: " + resp.msg);
                    }
                    callback(selectedLogo);
                }, function (err) {
                    callback(null);
                    console.log(err);
                    bootbox.alert("Server Error: Communication failure.");
                });
            }
        } else {
            callback(selectedLogo);
        }
    }

    function saveCard(isCustomDesign) {
        var count = $('input[type=radio][name=optionsCount]:checked').val();
        if (count == "More") {
            count = $("#more-quantity").val();
        }

        var cardBackContentVar = null;
        var finish = $('input[type=radio][name=optionsFinish]:checked').val();
        var back = $('input[type=radio][name=optionsBackOfCard]:checked').val();
        var paper = $('input[type=radio][name=optionsPaper]:checked').val();
        var shipping = $('input[type=radio][name=optionsShipping]:checked').val();
        var purchaseDesign = $("[name=optionsPurchaseCardDesign]").is(":checked");
        var noPrinting = $("[name=optionsDontWantPrintedCard]").is(":checked");
        if (!isCustomDesign) {
            if (back == "Blank" && isCardEdit == false) {
                cardBackContentVar = "<svg width='255.118' height='141.732' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg' xmlns:html='http://www.w3.org/1999/xhtml' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 255.118 141.732'>"
                    + "<metadata id='metadata3300'>image/svg+xml</metadata></svg>"
            } else {
                cardBackContentVar = window.editorFrameBack.getSvgString();
            }
        }
        var params = {
            design_type: isCustomDesign,
            first_name: $("#cardTitle").val(),
            last_name: $("#cardName").val(),
            base_item_id: baseCardId,
            address_line_1: $("#cardAL1").val(),
            address_line_2: $("#cardAL2").val(),
            phone_no: $("#cardPhone").val(),
            email: $("#cardEmail").val(),
            website: $("#cardWebSite").val(),
            qty: count,
            finish: finish,
            paper_stock: paper,
            back_of_card: back,
            back_side_super_premium: $("#backSidePremium").is(":checked"),
            shipping_type: shipping,
            purchase_design: purchaseDesign,
            dont_print_card: noPrinting
        };
        if (isCustomDesign) {
            params.url = frontDesignFile;
            params.url_back = backDesignFile;
        } else {
            params.url = window.editorFrame.getSvgString();
            params.url_back = cardBackContentVar;
        }
        var afterSave = function (newId, purchased) {
            savedCardId = newId;
            if (purchased != true) {
                addCardToShoppingCart(savedCardId, function () {
                    if (!isCustomDesign) {
                        window.editorFrame.ignoreSaveWarning();
                        window.editorFrameBack.ignoreSaveWarning();
                    }
                    window.location = "/design-business-card-online/checkout";
                });
            } else {
                bootbox.alert("Your modification to this purchased item is finished.", function (result) {
                    window.location = "/my-designs";
                });
            }
        };
        if (isLoggedIn(true) == true) {
            var address;
            var purchased = editFrom == "purchase";
            if (savedCardId) {
                params.id = savedCardId;
                if (purchased == false) {
                    address = "/updateUserCard";
                } else {
                    address = "/updatePurchasedItem";
                }
            } else {
                address = "/addUserCard";
            }
            addWaitingOverlay(true);
            doPost(address, params, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    afterSave(resp.insertId || savedCardId, purchased);
                } else {
                    bootbox.alert(resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });
        } else {
            var currentId;
            var fileName;
            if (savedCardId) {
                currentId = savedCardId;
                fileName = currentId;
            } else {
                currentId = new Date().getTime();
                fileName = "card_" + currentId;
            }
            saveItemLocally("cards", fileName, params);
            afterSave(currentId);
        }
    }

    function updatePricingWithCountry() {
        var country = $(".top-countries-list").val();
        var as = $("#bfhCountryBcard a");
        for (var i = 0; i < as.length; i++) {
            if ($(as[i]).data("option") == country) {
                $(as[i]).click();
                break;
            }
        }
    }

    function updateTotalPrice() {
        if (currentPricingInfo && currentPricingInfo.pricing) {
            var count = $('input[type=radio][name=optionsCount]:checked').val();
            if (count == "More") {
                count = $("#more-quantity").val();
            }
            var finish = $('input[type=radio][name=optionsFinish]:checked').val();
            var back = $('input[type=radio][name=optionsBackOfCard]:checked').val();
            var paper = $('input[type=radio][name=optionsPaper]:checked').val();
            var shipping = $('input[type=radio][name=optionsShipping]:checked').val();
            var backOfCard = $('input[type=radio][name=optionsBackOfCard]:checked').val();
            $(".order-list").text(count);
            $("#cardFinishLabel").text(finish == "GLOSS" ? "Glossy Paper" : "Matte Paper");
            $("#backOfCardLabel").text(backOfCard == "Blank" ? "Blank" : "Custom");
            $(".stock-list").text(paper == "UltraPremium" ? "Superior" : "Executive");
            $(".back-card").text(back);
            $(".delivery").text(shipping == "Exp" ? "Express" : "Standard");
            var sum = 0;
            var purchaseDesign = $("[name=optionsPurchaseCardDesign]").is(":checked");
            var noPrinting = $("[name=optionsDontWantPrintedCard]").is(":checked");
            if (purchaseDesign && noPrinting) {
                sum = currentPricingInfo.pricing[0].card_design;
            } else {
                if (purchaseDesign && currentPricingInfo.pricing.length > 0) {
                    sum += currentPricingInfo.pricing[0].card_design;
                }
                currentPricingInfo.pricing.forEach(function (val, idx) {
                    if (val.finish == finish) {
                        if (val.qty == count) {
                            if (paper == "UltraPremium") {
                                sum += val.super_premium;
                            } else {
                                sum += val.premium;
                            }
                            if (back == "Custom") {
                                sum += val.back_side;
                            } else if (back == "Appointment") {
                                sum += val.back_side;
                            } else {
                                sum += 0;
                            }
                            if ($("#backSidePremium").is(":checked") == true) {
                                sum += val.back_side_super_premium;
                            }
                            if (shipping == "Exp") {
                                sum += val.exp_shipping;
                            } else {
                                sum += val.std_shipping;
                            }
                        }
                    }
                });
            }
            $(".buss-grand-total").text(convertCurrency(sum));
            $(".buss-discount-total").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
            updatePricing(currentPricingInfo);
        }
    }

    function updatePricing(resp) {
        var finish = $("input[type='radio'][name='optionsFinish']:checked").val();
        var paper = $("input[type='radio'][name='optionsPaper']:checked").val();
        var count = $("input[type='radio'][name='optionsCount']:checked").val();
        if (!count) {
            count = 500;
        } else if (count == "More") {
            count = $("#more-quantity").val();
        }
        var sum = 0;
        var updatedPrinting = false;

        resp.pricing.forEach(function (val, idx) {
            if (val.finish == finish) {
                switch (val.qty) {
                    case 100:
                    {
                        if (paper == "UltraPremium") {
                            sum = val.super_premium;
                            $("#priceFor100").text(convertCurrency(val.super_premium));
                            $("#discountPriceFor100").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        } else {
                            sum = val.premium;
                            $("#priceFor100").text(convertCurrency(val.premium));
                            $("#discountPriceFor100").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        }
                        break;
                    }
                    case 250:
                    {
                        if (paper == "UltraPremium") {
                            sum = val.super_premium;
                            $("#priceFor250").text(convertCurrency(val.super_premium));
                            $("#discountPriceFor250").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        } else {
                            sum = val.premium;
                            $("#priceFor250").text(convertCurrency(val.premium));
                            $("#discountPriceFor250").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        }
                        break;
                    }
                    case 500:
                    {
                        if (paper == "UltraPremium") {
                            sum = val.super_premium;
                            $("#priceFor500").text(convertCurrency(val.super_premium));
                            $("#discountPriceFor500").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        } else {
                            sum = val.premium;
                            $("#priceFor500").text(convertCurrency(val.premium));
                            $("#discountPriceFor500").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        }
                        break;
                    }
                    case 1000:
                    {
                        if (paper == "UltraPremium") {
                            sum = val.super_premium;
                            $("#priceFor1000").text(convertCurrency(val.super_premium));
                            $("#discountPriceFor1000").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        } else {
                            sum = val.premium;
                            $("#priceFor1000").text(convertCurrency(val.premium));
                            $("#discountPriceFor1000").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                        }
                        break;
                    }
                    default:
                    {
                        if ($("#more-quantity").val() == val.qty) {
                            if (paper == "UltraPremium") {
                                sum = val.super_premium;
                                $("#priceForMore").text(convertCurrency(val.super_premium));
                                $("#discountPriceForMore").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                            } else {
                                sum = val.premium;
                                $("#priceForMore").text(convertCurrency(val.premium));
                                $("#discountPriceForMore").text(convertCurrency(discountAmt(flatDiscountPercentageCard, sum)));
                            }
                        }
                        break;
                    }
                }
            }
            if (val.qty == count) {
                $("#paperUltraPremium").text(convertCurrency(val.super_premium - val.premium));
                $("#paperUltraPremiumDiscounted").text(convertCurrency(discountAmt(flatDiscountPercentageCard, val.super_premium - val.premium)));

                $("#paperPremium").text("");
                $("#paperPremiumDiscounted").text(convertCurrency(0, "Included"));
                //$("#paperPremium").text(convertCurrency(val.premium - val.premium));
                //$("#paperPremiumDiscounted").text(convertCurrency(val.premium - val.premium));
                //$("#paperPremiumDiscounted").text(convertCurrency(discountAmt(flatDiscountPercentageCard, val.premium));

                $("#customCardPricing").text(convertCurrency(val.back_side));
                $("#customCardPricingDiscounted").text(convertCurrency(discountAmt(flatDiscountPercentageCard, val.back_side)));

                //$("#appoinmentPricing").text(convertCurrency(val.back_side));

                $("#blankPricing").text("");
                $("#blankPricingDiscounted").text(convertCurrency(0, "Included"));
                //$("#blankPricingDiscounted").text(discountAmt(flatDiscountPercentageCard, convertCurrency(0)));

                $("#stdShippingPrice").text("");
                $("#expShippingPrice").text(convertCurrency(val.exp_shipping));
                $("#stdShippingPriceDiscounted").text(convertCurrency(discountAmt(flatDiscountPercentageCard, val.std_shipping), "Free!!"));
                $("#expShippingPriceDiscounted").text(convertCurrency(discountAmt(flatDiscountPercentageCard, val.exp_shipping), "Free!!"));
            }
            if (updatedPrinting == false) {
                updatedPrinting = true;
                $("#priceForCardDesign").text(convertCurrency(val.card_design));
                $("#discountPriceForCardDesign").text(convertCurrency(discountAmt(flatDiscountPercentageCard, val.card_design)));
            }
        });
    }

    function convertCurrency(money, freeText) {
        var currency = currentPricingInfo.currency;
        money = parseFloat(money);
        if (money == 0) {
            return freeText || currency + " 0.00";
        } else {
            return currency + " " + Number(money).toFixed(2);
        }
    }

    function addHardText() {
        var frame;
        if ($("#svgedit_back").css("visibility") == "hidden") {
            frame = window.editorFrame;
        } else {
            frame = window.editorFrameBack;
        }
        frame.addTextHard("Sample Text", function (id) {
            $('.customTexts').append('<div class="form-group">' +
                '<div class="col-md-12">' +
                '<input id="' + id + '" type=text class="input form-control" placeholder="Sample Text" value=""/>' +
                '</div>' +
                '</div>');
            $("#" + id).keyup(function (e) {
                e.preventDefault();
                changeText(id, this.value);
            });
        });

    }

    function initiateEditNewCardProcedure(id, callback) {
        addWaitingOverlay();
        doPost("/getCardDetails", {id: id}, function (resp) {
            removeWaitingOverlay();
            if (resp.status == 200) {
                $("#cardPrev" + id).click();
                callback == undefined ? $.noop() : callback(true, id);
            } else {
                bootbox.alert(resp.msg);
            }
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
            bootbox.alert((typeof err == "string" ? err : "Server Error."));
        });
    }

    function showCardEditor(animationCallback) {
        $('.wizard-steps li').removeClass('active');
        $('.wiz-two').addClass('active');
        $(".panel-four").hide();
        $('.panel-two').slideDown();
        $('#accordionTwo').slideDown();
        $('#accordionTwo').addClass('in');
        $('html, body').animate({
            scrollTop: $(".panel-two").offset().top - 125
        }, 1000).promise().then(function () {
            animationCallback();
        });
    }

    function displayBack() {
        editingBackCard = true;
        savedCardSettings.back_of_card = savedCardSettings.back_of_card || "Custom";
        $('.arrow-box_active').show();
        $('.arrow-box').hide();
        $('.arrow_box').addClass('active');
        $("#svgedit").css("visibility", "hidden");
        $("#svgedit_back").css("visibility", "visible");
        window.editorFrameBack.setCardWebSite($("#cardWebSite").val() || "www.example.com");
        window.editorFrameBack.setCardName($("#cardName").val());
        window.editorFrameBack.setCardTitle($("#cardTitle").val());
        window.editorFrameBack.setCardEmail($("#cardEmail").val());
        window.editorFrameBack.setCardAL1($("#cardAL1").val());
        window.editorFrameBack.setCardAL2($("#cardAL2").val());
        //var img = window.editorFrame.getLogoImage();
        //window.editorFrameBack.loadCard(undefined, img.image, img.isSvg);
        fillCustomTexts(window.editorFrameBack);
    }

    function displayFront(updateLogo) {
        editingBackCard = false;
        $('.arrow_box').removeClass('active');
        $("#svgedit").css("visibility", "visible");
        $("#svgedit_back").css("visibility", "hidden");
        fillCustomTexts(window.editorFrame);
    }

    function fillCustomTexts(frame) {
        $('.customTexts').children().remove();
        var fn = function () {
            var texts = frame.getCustomTexts();
            for (var i = 0; i < texts.length; i++) {
                $('.customTexts').append('<div class="form-group">' +
                    '<div class="col-md-12">' +
                    '<input id="' + $(texts[i]).attr("id") + '" type=text class="input form-control" value="' + $(texts[i]).text() + '"/>' +
                    '</div>' +
                    '</div>');
                $($(texts[i]).attr("id")).keyup(function (e) {
                    e.preventDefault();
                    changeText($(texts[i]).attr("id"), this.value);
                });
            }
        };
        if (frame.getCustomTexts != undefined) {
            fn();
        } else {
            $(frame).load(function () {
                fn();
            });
        }
    }

    function gotoEditCard() {
        $('html, body').animate({
            scrollTop: $(".panel-two").offset().top - 50
        }, 1000);
        $('.create-card-main').css('min-height', '1500px');
    }

    function changeText(id, val) {
        var frame;
        if ($("#svgedit_back").css("visibility") == "hidden") {
            frame = window.editorFrame;
        } else {
            frame = window.editorFrameBack;
        }
        frame.replaceText(id, val);
    }

    function changeUrl(url) {
        pushState(url, "/design-business-card-online" + "/" + url);
        urlChanged();
    }

    function setupFinishWizardLinks(states) {
        $('.qty-next-span').unbind('click').click(function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/back-of-card");
        });
        $(".finish-span").unbind('click').click(function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/save-card");
        });
        $('.blank-next-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/finish");
        });
        $('.finish-next-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/stock");
        });
        $('.delivery-next-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/delivery");
        });
        $('.stock-next-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/delivery");
        });
        $('.stock-prev-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/finish");
        });
        $('.finish-prev-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/back-of-card");
        });
        $('.blank-prev-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/quantity");
        });
        $('.delivery-prev-span').unbind('click').on('click', function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/stock");
        });
        $('#change-qty,.li-quantity').unbind('click').on("click", function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/quantity");
        });
        $('#change-finish,.li-finish').unbind('click').on("click", function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/finish");
        });
        $('#change-back-card,#change-card,.li-back-of-card').unbind('click').on("click", function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/back-of-card");
        });
        $('#change-shipping,.li-delivery').unbind('click').on("click", function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/delivery");
        });
        $('#change-stock,.li-stock').unbind('click').on("click", function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/stock");
        });
        $('.li-delivery').unbind('click').on("click", function (e) {
            e.stopPropagation();
            changeUrl(states[0] + "/delivery");
        });
        if (!savedCardSettings) {
            savedCardSettings = {};
        }
        $("[name=optionsCount], #more-quantity").off().change(function (e) {
            if (this.value == "More") {
                savedCardSettings.qty = $("#more-quantity").val();
            } else {
                savedCardSettings.qty = this.value;
            }
        });
        $("[name=optionsBackOfCard]").off().change(function (e) {
            savedCardSettings.back_of_card = this.value;
        });
        $("[name=optionsFinish]").off().change(function (e) {
            savedCardSettings.finish = this.value;
        });
        $("[name=optionsPaper]").off().change(function (e) {
            savedCardSettings.paper_stock = this.value;
        });
        $("[name=optionsShipping]").off().change(function (e) {
            savedCardSettings.shipping_type = this.value;
        });
        $('input[type=radio][name=optionsCount],[name=optionsFinish],[name=optionsPaper],[name=optionsBackOfCard],[name=optionsShipping],#backSidePremium').change(function () {
            updateTotalPrice();
        });
        $("#more-quantity").change(function () {
            $("#moreQtysRadio").prop("checked", true);
            updateTotalPrice();
        });
        $("[name=optionsPurchaseCardDesign]").off().change(function () {
            savedCardSettings.purchase_design = $("[name=optionsPurchaseCardDesign]").is(":checked");
            if (savedCardSettings.purchase_design) {
                $("#noCardPrintOut").removeClass("hidden");
            } else {
                $("#noCardPrintOut").addClass("hidden");
            }
            $("[name=optionsDontWantPrintedCard]").prop('checked', false);
            $("[name=optionsDontWantPrintedCard]").change();
            updateTotalPrice();
        });
        $("[name=optionsDontWantPrintedCard]").off().change(function () {
            savedCardSettings.dont_print_card = $("[name=optionsDontWantPrintedCard]").is(":checked");
            if (savedCardSettings.dont_print_card) {
                $(".qty-next-span").hide();
                $(".li-back-of-card").hide();
                $(".li-finish").hide();
                $(".li-stock").hide();
                $(".li-delivery").hide();
                $(".only-printing").hide();
            } else {
                $(".qty-next-span").show();
                $(".li-back-of-card").show();
                $(".li-finish").show();
                $(".li-stock").show();
                $(".li-delivery").show();
                $(".only-printing").show();
            }
            updateTotalPrice();
        });
    }

    function readFile(callBack) {
        var files = this.files;
        var file = files[0];
        if (!file.type.match('application/pdf') && !file.type.match('application/postscript') && file.name.indexOf(".cdr") < 0 && file.name.indexOf(".pdf") < 0) {
            bootbox.alert("The file format choosed is not supported.<br />Please select a PDF or CDR or EPS or AI file.");
            $(this).val(undefined);
        } else {
            var picReader = new FileReader();
            picReader.addEventListener("load", function (event) {
                var picFile = event.target;
                var extension = file.name.split('.');
                if (extension.length == 0) {
                    if (file.type.match('application/pdf')) {
                        extension = "pdf";
                    }
                    if (file.type.match('application/postscript')) {
                        extension = "eps";
                    }
                } else {
                    extension = extension.pop();
                }
                callBack(picFile.result, extension);
            });
            picReader.readAsDataURL(file);
        }
    }

    init();
});
