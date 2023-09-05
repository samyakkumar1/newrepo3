/**
 * Created by DesignerBe on 07-10-2020.
 */

$(function () {
    var editFrom;
    var selectedImageId;
    var savedLogoId;
    var editingLogo = false;
    var savedLogoFile;
    var loadedCategories = [];
    var wizardClickCount = 0;
    var originalCategory = "";
    var isHashEvent = false;

    $(window).on("hashAdding", function (evt) {
        isHashEvent = true;
    });
    $(window).on("hashRemoving", function (evt) {
        isHashEvent = false;
    });
    $(document).on("logoSavedFromLogin", function (evt) {
        if (savedLogoId == evt.localId) {
            savedLogoId = evt.id;
        }
    });
    function urlChanged() {
        if (!isHashEvent) {
            if (history.state == null) {
                var urls = window.location.pathname.split("/").splice(2).join("/");
                changeState(urls, "logo-design-online/" + urls);
                urlChanged();
            } else {
                var states = history.state.name.split("/");
                var step2 = function (animComplete) {
                    if ($("#company-name").val().trim().length == 0) {
                        $("#company-name").val("Your company");
                    }
                    if (!states[0]) {
                        $(".panel-two").hide();
                        $(".panel-three").hide();
                        $(".panel-four").hide();
                        $("#nextBtnStep1").show();
                    } else {
                        if (!states[1]) {
                            $(".panel-three").hide();
                            $(".panel-four").hide();
                        }
                    }
                    if ($(".keyword-lists").children().length == 0) {
                        fillCategories(function () {
                            gotoStep2(animComplete, states)
                        });
                    } else {
                        gotoStep2(animComplete, states);
                    }
                };
                if (states[1] == "go-back") {
                    history.back();
                } else if (states[0] == "") {
                    /* do nothing */
                } else if (states[0] == "choose-your-industry") {
                    step2();
                } else if (states[0] == "edit") {
                    initiateEditLogoProcedure(states[1], states[2]);
                    if (states[2] == "purchase") {
                        $(".template-back").remove();
                        $("#nextBtnStep1").remove();
                    }
                } else {
                    step2(function () {
                        var obj = $("[data-url='" + states[0] + "']") || $("[data-id='" + states[0] + "']");

                        if (obj.attr("data-id")) {
                            if (states[3] != "edit") {
                                if (obj.attr("data-seo-keyword")) {
                                    $("meta[name=keywords]").attr("content", obj.attr("data-seo-keyword"));
                                }
                                if (obj.attr("data-seo-description")) {
                                    $("meta[name=description]").attr("content", obj.attr("data-seo-description"));
                                }
                                if (obj.attr("data-seo-title")) {
                                    $("title").text(obj.attr("data-seo-title"));
                                }
                                $("#e1").select2("val", obj.attr("data-url"));
                                chooseCategory(obj.attr("data-id"), function () {
                                    if (states[2] == "edit") {
                                        showPanelThree(function () {
                                            if (savedLogoId.indexOf("logo_") == 0) {
                                                addWaitingOverlay();
                                                editThisLogo(states, savedLogoId, function () {
                                                    removeWaitingOverlay();
                                                });
                                            } else {
                                                addWaitingOverlay();
                                                editThisLogo(states, "/getUserLogoImage?id=" + savedLogoFile + "&rand=" + Math.random(), function () {
                                                    removeWaitingOverlay();
                                                });
                                            }
                                        })
                                    } else if (states[1]) {
                                        var obj = $("[data-seo-url='" + states[1] + "']") || $("[data-id='" + states[1] + "']");
                                        addWaitingOverlay();
                                        doPost("/getLogoDetails", {id: obj.attr("data-id")}, function (resp) {
                                            removeWaitingOverlay();
                                            if (obj.attr("data-seo-keyword")) {
                                                $("meta[name=keywords]").attr("content", obj.attr("data-seo-keyword"));
                                            }
                                            if (obj.attr("data-seo-description")) {
                                                $("meta[name=description]").attr("content", obj.attr("data-seo-description"));
                                            }
                                            if (obj.attr("data-seo-title")) {
                                                $("title").text(obj.attr("data-seo-title"));
                                            }
                                            if (resp.status == 200) {
                                                showPanelThree(function () {
                                                    selectedImageId = resp.logo.id;
                                                    editThisLogo(states, '/getLogoImage?id=' + resp.logo.s3_logo_url);
                                                })
                                            } else {
                                                bootbox.alert(resp.msg);
                                            }
                                        }, function (err) {
                                            removeWaitingOverlay();
                                            console.log(err);
                                            bootbox.alert((typeof err == "string" ? err : "Server Error."));
                                        });
                                    } else {
                                        $("#actualLogoEditorPanelBody").hide();
                                        $("#logoListerPanelBody").show();
                                        showPanelThree(function () {

                                        });
                                    }
                                });
                            }
                            if (states[2] == "save") {
                                showLogin("#accordionThree", function () {
                                    if (window.editorFrame) {
                                        saveLogo(function (url) {
                                            $(".logo-card").find('.flip-card-template').hide();
                                            var hash = window.location.hash.split("/");
                                            $(".wiz-three").html("  <a class='text-center' href='" + window.location + "' aria-expanded='true'><span class='badge hidden-xs'>3</span>Choose/Edit Template</a>");
                                            $(".wizard-steps .wiz-three a").css("cursor", "pointer");

                                            $(".wiz-four").html("    <a class='text-center' href='" + window.location + "' aria-expanded='true'><span class='badge hidden-xs'>4</span>Save & Download</a>");
                                            $(".wizard-steps .wiz-four a").css("cursor", "pointer");
                                            $('#signinModal').modal('hide');
                                            showToast("Your logo is saved in “My Designs.", "success");
                                            window.editorFrame.ignoreSaveWarning();
                                            window.editorFrame.saveAction(false, function (data) {
                                                if (editFrom == "purchase") {
                                                    window.location = "/my-designs";
                                                } else {
                                                    gotoFinalStep(data);
                                                }
                                            });
                                        }, undefined, function () {
                                            // window.location = window.location.hash.replace("/save", "");
                                        });
                                    } else {
                                        // window.location = window.location.hash.replace("/save", "");
                                    }
                                }, function () {
                                    // window.location = window.location.hash.replace("/save", "");
                                });
                            }
                        }
                    })
                }
            }
        }
    }

    function init() {
        $("head").append($("#allFonts").html());
        //updateMoneyJs();
        $('.tooltip1').tooltip();
        $('#footer').addClass('create-logo-footer');
        var windowH = $(window).height();
        $(window).scroll(function () {
            $('.create-logo-footer').show();
        });
        $('#company-name').focus();
        $("#hidePurchasedLogoCheckBox").change(function (){
            if($("#hidePurchasedLogoCheckBox").is(":checked")) {
                $('[data-status="Purchased"]').hide();
            } else {
                $('[data-status="Purchased"]').show();
            }
        });
        $(document).on('keyup', '#company-name', function () {
            if ($('#company-name').val().trim() == "") {
                $('.identity-next').slideUp();
                $('.identity-save').fadeIn();
            }
            else {
                if ($('#accordionOne').prev().find('.panel-title-active').is(':visible')) {
                    $('.identity-next').slideUp();
                    $('.identity-save').slideDown();
                }
                else {
                    $("#nextBtnStep1").show();
                    $('.identity-next').slideDown();
                    $('.identity-save').slideUp();
                }
            }
        });
        $("#backToChooseCategory").click(function (){
            changeUrl("choose-your-industry");
        });

        $('#btnNextStep1').on('click',function(e){
            e.preventDefault();
            var $carouselItems = $(".carousel-item"),
            $carouselIndicators = $(".carousel-indicators > li");

            var currentSlide = $(this).find($(".active")),
                currentSlideNo = $carouselItems.index(currentSlide) + 1;
            if (currentSlideNo > $carouselItems.length){
                currentSlideNo = 0;
            }
            $carouselIndicators.removeClass("active");

            var newItem = $(".carousel-indicators > li[data-slide-to='" + currentSlideNo + "']");
            newItem.addClass("active");
            });

        $('#nextBtnStep1').on('click', function (e) {
            e.preventDefault();
            wizardClickCount = 0;
            $(".wizard-steps .wiz-one a").css("cursor", "pointer");
            loadedCategories = [];
            changeUrl("choose-your-industry");
        });
        $(".wiz-one").click(function (e) {
            if (wizardClickCount != 0) {
                bootbox.confirm("The progress of the Logo will be discarded.<br/> Do you want to continue?", function (result) {
                    if (result) {
                        window.location = "#";
                        $(".panel-three").hide();
                        $(".panel-two").hide();
                        $("#company-name").val("");
                        $("#company-tagline").val("");
                        $("#nextBtnStep1").hide();
                    }
                });
            }
            else {
                window.location = "/logo-design-online";
            }
        });
        $("#templateBack").click(function (e) {
            e.preventDefault();
            bootbox.confirm("The current modifications will be <b>erased</b>.<br/>Do you want to continue?", function (result) {
                if (result == true) {
                    $('html,body').animate({
                        scrollTop: $("#accordionThree").prev('.panel-heading').offset().top
                    }, 1000);
                    $('#accordionTwo').addClass('in');
                    $('.panel-four').hide();
                    $("#actualLogoEditorPanelBody").hide();
                    $("#logoListerPanelBody").show();
                    changeUrl(originalCategory);
                }
            });
        });
        $("#loadMoreLogosBtn,#loadMoreLogosBtn2").click(function (e) {
            e.preventDefault();
            addWaitingOverlay();
            doPost("/getMoreLogos", {excluded: loadedCategories}, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    if (loadedCategories.indexOf(resp.category.category_id) == -1) {
                        loadedCategories.push(resp.category.category_id);
                    }
                    addLogoToList(resp);
                } else {
                    bootbox.alert(resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });
        });
        $("#templateSave").click(function (e) {
            var thisObj = $(".editLogoItem");
            var data;
            if (history.state ){
                data = history.state.name;
            } else if (History) {
                data = History.getState().data;
            } else {
                console.log("Error: Please update your browser!!");
                data = "";
            }
            var newUrl = data.split("/");
            if (newUrl[2] == "edit"){
                newUrl[3] = "edit";
            }
            newUrl[2] = "save";
            changeUrl(newUrl.join("/"));
            $('.unlimited-use-download').hide();
            $('.unlimited-use').show();
            e.preventDefault();
        });
        $('.identity-save').on('click', function (e) {
            e.preventDefault();
            $('#accordionOne').slideUp();
            $('#nextBtnStep1').click();
            if (window.editorFrame.fillCompanyAndSloganNames != undefined) {
                window.editorFrame.fillCompanyAndSloganNames($("#company-name").val(), $("#company-tagline").val());
            }
        });
        $("#downloadNow").click(function () {
            var fn = function () {
                showLogin("#accordionFour", function () {
                    var user = getUser();
                    addWaitingOverlay();
                    doPost("/downloadLogo", {
                        id: savedLogoId,
                        data: $("#logoPreviewImg").attr("src"),
                        company: $("#company-name").val(),
                        name: (user == undefined || user.first_name == undefined || user.first_name == null) ? "" : user.first_name
                    }, function (resp) {
                        removeWaitingOverlay();
                        if (resp.status == 200) {
                            bootbox.alert("We will sent the logo to your email account.");
                        } else {
                            bootbox.alert("Error: " + resp.msg);
                        }
                    }, function (err) {
                        removeWaitingOverlay();
                        console.log(err);
                        bootbox.alert((typeof err == "string" ? err : "Server Error."));
                    });
                });
            };
            if (isLoggedIn()) {
                fn();
            } else {
                bootbox.alert("Sign in and the logo will be sent to your email address instantly.", function (result) {
                    fn();
                });
            }
        });
        $("#checkoutNow").click(function () {
            window.location = "/logo-design-online/checkout";
        });
        $("#buyLogo").click(function (e) {
            e.preventDefault();
            if (editFrom == "purchase") {
                bootbox.alert("Your modification to this purchased item is finished.", function (resp) {
                    listCardsForPreview(false);
                });
            } else {
                addLogoToShoppingCart(savedLogoId, function () {
                    listCardsForPreview(false);
                });
            }
        });
        $("#createBusinessCardOnBottom").click(function (e) {
            window.location = "/design-business-card-online/use/" + savedLogoFile;
            e.preventDefault();
        });
        addPopState(urlChanged);
        urlChanged();
    }

    function gotoStep2(animationcomplete, states) {
        //$('.create-logo').css('min-height', '1400px');
        if (!$('.panel-two').is(":visible") || (states[0] == "choose-your-industry")) {
            $('.panel-two').show();
            $('.wizard-steps li').removeClass('active');
            $('.wiz-two').addClass('active');
            $('html,body').animate({
                scrollTop: $("#accordionTwo").prev('.panel-heading').offset().top - 150
            }, 1000).promise().done(function () {
                animationcomplete ? animationcomplete() : $.noop();
            });
            $('#accordionTwo').addClass('in');
            $('#industry-key-search').focus();
        } else {
            animationcomplete ? animationcomplete() : $.noop();
        }
        updateCompanyAndSloganName();
    }

    function initiateEditLogoProcedure(id, from, finishedCallBack) {
        editingLogo = true;
        editFrom = from;
        savedLogoId = id;

        var editLogoFn = function (resp, purchased) {
            $("#company-name").val(resp.logo.company_name);
            $("#company-tagline").val(resp.logo.slogan);
            selectedImageId = resp.logo.base_logo_id;
            savedLogoFile = resp.logo.s3_logo_url || resp.logo.url;
            changeState("/go-back", "/go-back"); // to prevent back button
            changeUrl(formatUrl(resp.category.url, resp.category.id) + "/" + formatUrl(resp.logo.base_logo_url, selectedImageId) + "/edit");
        };
        if (isLoggedIn(true) == true) {
            addWaitingOverlay();
            var url;
            var purchased = from == "purchase";
            if (purchased == true) {
                url = "/getPurchasedItemDetails";
            } else {
                url = "/getUserLogoDetails";
            }
            doPost(url, {id: id}, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    editLogoFn(resp, purchased);
                } else {
                    bootbox.alert(resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });
        } else {
            var obj = {logo: retrieveJson(id)};
            doPost("/getCategory", {id: obj.logo.base_item_id}, function (resp) {
                if (resp.status == 200){
                    obj.category = resp.category;
                    doPost("/getLogoDetails", {id: obj.logo.base_item_id}, function (resp) {
                        if (resp.status == 200) {
                            obj.logo.base_logo_url = resp.logo.url;
                            editLogoFn(obj);
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
                    console.log(resp);
                    bootbox.alert("Can't get category: " + resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });
        }
    }

    function showLogin(id, onsuccess, onclosed) {
        if (isLoggedIn(true) == true) {
            onsuccess();
            return undefined;
        } else {
            var successCalled = false;
            var div = $("<div/>").appendTo($(id).css("position", "relative"));
            var template = $("#newLoginModal").text();
            var html = Mustache.render(template, {});
            div.append(html);
            div.find(".close").click(function () {
                $('#signinModal').modal('hide');
            });
            $('#signinModal').modal({
                backdrop: 'static',
                keyboard: false
            });
            $('#signinModal').on('hidden.bs.modal', function (e) {
                div.remove();
                if (!successCalled) {
                    onclosed ? onclosed() : $.noop();
                }
            });
            div.find('#signupForm1').validate();
            div.find("#loginBtn").click(function (e) {
                e.preventDefault();
                addWaitingOverlay();
                signin($("#popupSignInUsername").val(), $("#popupSignPassword").val(), function (resp) {
                    removeWaitingOverlay();
                    showLogoutOptions();
                    updateMyDesignsCount(true);
                    updateCartCount(true);
                    successCalled = true;
                    if (onsuccess != undefined) {
                        onsuccess();
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    console.log(err);
                    bootbox.alert(typeof err == "string" ? err : "Server Error: " + err.error);
                });
            });
            div.find("#headerRecover2").click(function (e) {
                e.preventDefault();
                $(".modal-content-signup").hide();
                $(".modal-content-signin").hide();
                $(".modal-content-forgot").show();
                $('.signin-form').hide();
                $('.recover-form').show();
            });
            div.find("#popupSendRecoveryBtn").click(function (e) {
                e.preventDefault();
                addWaitingOverlay();
                doPost("/forgotPassword", {email: $("#popupForgotUsername").val()}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        bootbox.alert("A link has been sent to the email to reset your password");
                        $('.modal-content-signin').show();
                        $('.modal-content-signup').hide();
                        $(".modal-content-forgot").hide();
                    } else {
                        console.log(resp);
                        bootbox.alert(resp.msg);
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    console.log(err);
                    bootbox.alert(typeof err == "string" ? err : "Server Error: " + err.error);
                });
            });
            div.find(".createAccountBtn").click(function (e) {
                e.preventDefault();
                if ($("#signupForm1").valid()) {
                    addWaitingOverlay();
                    signup({
                        email: $("#popupSignUpUsername").val(),
                        password: $("#popupSignPasswordConfirm").val()
                    }, function () {
                        removeWaitingOverlay();
                        //$('#myTab li:eq(0) a').tab('show');
                        $(".modal-content-signin").show();
                        $(".modal-content-signup").hide();
                        $("#popupSignInUsername").val($("#popupSignUpUsername").val());
                        $("#popupSignPassword").val($("#popupSignPasswordConfirm").val());
                        $("#signinModal #loginBtn").click();
                        //bootbox.alert("Please login to download/purchase.");
                    }, function (err) {
                        removeWaitingOverlay();
                        bootbox.alert(err);
                    }, false);
                }
            });
            div.find("#headerSignIn1").click(function (e) {
                e.preventDefault();
                $(".modal-content-signin").show();
                $(".modal-content-signup").hide();
                $(".modal-content-forgot").hide();
            });
            div.find("#headerSignUp2").click(function (e) {
                e.preventDefault();
                $(".modal-content-signin").hide();
                $(".modal-content-signup").show();
                $(".modal-content-forgot").hide();
            });
            div.find("#headerSignIn3").click(function (e) {
                e.preventDefault();
                $(".modal-content-signin").show();
                $(".modal-content-signup").hide();
                $(".modal-content-forgot").hide();
            });

            return div;
        }
    }

    $("#industry-key-search").on("keyup", function () {
        if ($(this).val() != null && $(this).val() != '') {
            doPost("/searchCategories", {name: "%" + $(this).val() + "%"}, function (resp) {
                if (resp.status == 200) {
                    $(".keyword-lists li").hide();
                    for (var i = 0; i < resp.categories.length; i++) {
                        $(".keyword-lists li").each(function () {
                            var s = $(this).find('a').text();

                            if (s.indexOf(resp.categories[i].category_name) !== -1) {
                                $(this).show();
                            }
                        });
                    }

                } else {
                    console.log(resp);
                    $(".keyword-lists li").hide();
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);

            });
        }
        else {
            $(".keyword-lists li").show();
        }
    });
    $("#industry-sub-key-search").on("keyup", function () {
        console.log($(this).val());
        if ($(this).val() != null && $(this).val() != '') {
            doPost("/searchSubCategories", {name: "%" + $(this).val() + "%"}, function (resp) {
                if (resp.status == 200) {
                    $(".keyword-lists li").hide();
                    for (var i = 0; i < resp.categories.length; i++) {
                        $(".keyword-lists li").each(function () {
                            var s = $(this).find('a').text();

                            if (s.indexOf(resp.categories[i].category_name) !== -1) {
                                $(this).show();
                            }
                        });
                    }

                } else {
                    console.log(resp);
                    $(".keyword-lists li").hide();
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);

            });
        }
        else {
            $(".keyword-lists li").show();
        }
    });
    function updateCompanyAndSloganName() {
        if (window.editorFrame != undefined) {
            if (window.editorFrame.fillCompanyAndSloganNames != undefined) {
                window.editorFrame.fillCompanyAndSloganNames($("#company-name").val(), $("#company-tagline").val());
                if ($(".panel-four").is(":visible")) {
                    // adding this will cause recursion $("#templateSave").click();
                }
            }
        }
    }

    function fillCategories(finishedCallBack, errorCallback) {
        doPost("/listCategories", {type: "LOGO"}, function (resp) {
            if (resp.status == 200) {
                $(".keyword-lists").children().remove();
                resp.categories.forEach(function (val, idx) {
                    console.log(val)
                    $(".keyword-lists").append('<li data-seo-title="' + val.seo_title + '" data-seo-description="' + val.seo_description + '" data-seo-keyword="' + val.seo_keyword + '" class="key-list col-md-4 col-sm-4 col-xs-6 categoryItem" data-id="' + val.id + '" data-name="' + val.category_name + '" data-url="' + formatUrl(val.url, val.id) + '"><a href="#"><h1>' + val.category_name + '</h1></a></li>');
                    $("#e1").append('<option value="' + formatUrl(val.url, val.id) + '">' + val.category_name + '</option>');
                });
                $(".categoryItem").click(function (e) {
                    e.preventDefault();
                    if (editFrom == "purchase"){
                        showToast("You can't change the category for purchased items.");
                    } else {
                        var thisObj = this;
                        var fn = function () {
                            $(".wiz-two").html(" <a class='text-center' href='" + window.location + "' target='_self' aria-expanded='false'><span class='badge hidden-xs'>2</span>Choose your Industry</a>");
                            $(".wizard-steps .wiz-two a").css("cursor", "pointer");
                            originalCategory = $(thisObj).attr("data-url");
                            changeUrl($(thisObj).attr("data-url"));
                        };
                        if (window.editorFrame) {
                            bootbox.confirm("The current modifications will be <b>erased</b>.<br/>Do you want to continue?", function (result) {
                                if (result == true) {
                                    fn();
                                }
                            });
                        } else {
                            fn();
                        }
                    }
                });
                $("#e1").select2();
                $("#e1").on("change", function (item) {
                    changeUrl(item.val);
                });
                finishedCallBack == undefined ? $.noop() : finishedCallBack(resp);
            } else if (resp.status == 200) { 
                /* Nothing to do */
            } else {
                bootbox.alert(resp.msg);
            }
        }, function (err) {
            errorCallback(err);
            console.log(err);
            bootbox.alert((typeof err == "string" ? err : "Server Error."));
        });
    }

    function listCardsForPreview(isDownload) {
        addWaitingOverlay();
        doPost("/listCards", {count: 6}, function (resp) {
            if (resp.status == 200) {
                $('#bcardListModel').modal('show');
                $('#bcardListModel').on('shown.bs.modal', function (){
                    var div = $("#cards-list");
                    div.empty();
                    for (var i = 0; i < resp.cards.length; i++) {
                        var card = $('<a href="/design-business-card-online/use/' + savedLogoFile + '/' + formatUrl(resp.cards[i].url, resp.cards[i].id) + '" style="text-decoration: none"><div class="col-md-4 download-hover-card" id="cardPrev' + resp.cards[i].id + '">' +
                            '<span class="flip-template-buy">' +
                            '           <span class="flip-edit-buy flip-edit-buy-download">' +
                            '               <button class="click-custom">Click to Customize</button>' +
                            '           </span>' +
                            '        </span>' +
                            '</div></a>');
                        $(div).append(card);
                        $('.download-hover-card').hover(function () {
                            $(this).find('.flip-template-buy').fadeIn(300);
                            var buyWidth = $(this).width() + 4;
                            $(this).find('.flip-template-buy').css('width', buyWidth);
                        }, function () {
                            $(this).find('.flip-template-buy').fadeOut(100);
                        });
                        updateCardImage("#cardPrev" + resp.cards[i].id, '/getCardImage?id=' + resp.cards[i].s3_front_card_url, savedLogoFile);
                    }
                    window.editorFrame.ignoreSaveWarning();
                    if (isDownload) {
                        $("#downloadNow").show();
                        $("#checkoutNow").hide();
                    } else {
                        $("#checkoutNow").show();
                        $("#downloadNow").hide();
                    }
                    if (editFrom == "purchase"){
                        $("#checkoutNow").hide();
                    }
                });
            } else if (resp.status == 201) {
                bootbox.alert("No cards available");
            } else {
                bootbox.alert("Error: " + resp.msg);
            }
            removeWaitingOverlay();
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
            bootbox.alert("Server Error.");
        });
    }

    function gotoFinalStep(data) {
        $("#logoPreviewImg").attr("src", data);
        $("#logoPreviewImg2").attr("src", data);
        $(".card-company-name").text($("#company-name").val());
        $('.wizard-steps li').removeClass('active');
        $('.wiz-four').addClass('active');
        $('#accordionFour').addClass('in');
        $('.panel-four').show();
        updateCardImage(".buss-card-image", "/img/cardPreview.svg", savedLogoFile);
        $('.business-card-logo').slideDown();
        $('.create-logo').css('min-height', '600px');
        $('html,body').animate({
            scrollTop: $(".panel-four").offset().top - 65
        }, 1000);
        addWaitingOverlay();

        doPost("/getPriceForItem", {
            type: "LOGO",
            itemId: savedLogoId,
            country: $('.top-countries-list').val()
        }, function (resp) {
            removeWaitingOverlay();
            if (resp.status == 200) {
                var price = Number(parseFloat(resp.price)).toFixed(2) + " " + resp.currency;
                $(".purchase-limit").text(price);
                $(".purchase-discount-limit").text(resp.currency + " " + Number(discountAmt(flatDiscountPercentageLogo, resp.price)).toFixed(2));
            } else if (resp.status == 201) { 
                var actualAmt = Number(resp.price).toFixed(2);
                var price = actualAmt + " " + resp.currency;
                $(".purchase-limit").text(price);
                $(".purchase-discount-limit").text(resp.currency + " " + Number(discountAmt(flatDiscountPercentageLogo, resp.price)).toFixed(2));
            } else {
                console.log(resp);
                bootbox.alert("Error: This country is not supported at the moment.");
            }
        }, function (err) {
            $(".purchase-limit").text("0");
            $(".logoAmt").text("0");
            removeWaitingOverlay();
            console.log(err);
        });
    }

    function addLogoToList(resp) {
        var currentDiv;
        var comp = $("#company-name").val();
        var slogan = $("#company-tagline").val();
        for (var i = 0; i < resp.logos.length; i++) {
            if (editFrom != "purchase") {
                if (resp.logos[i].status == "Active") {
                    currentDiv = $('<div class="col-md-3 layoutList link" data-status="' + resp.logos[i].status + '" data-id="' + resp.logos[i].id + '" data-category-id="' + resp.logos[i].category_id + '" data-url="' + resp.logos[i].s3_logo_url + '" data-seo-url="' + formatUrl(resp.logos[i].url, resp.logos[i].id) + '" data-category-url="' + formatUrl(resp.logos[i].category_url, resp.logos[i].category_id) + '">' +
                        '<ul class="template-list">' +
                        '       <li class="">  ' +
                        '           <div class="col-md-3 template_logos"><div class="layoutLogos"><div class="logoPrevInList' + resp.logos[i].id + '"></div>' + '</div></div>' +
                        '                <span class="flip-template" style="display: none;">      ' +
                        '                    <span class="flip-edit editLogoItem edit_logo_item_' + resp.logos[i].id + '" data-id="' + resp.logos[i].id + '" data-category-id="' + resp.logos[i].category_id + '" data-category-url="' + formatUrl(resp.logos[i].category_url, resp.logos[i].category_id) + '" data-url="' + resp.logos[i].s3_logo_url + '" data-seo-url="' + formatUrl(resp.logos[i].url, resp.logos[i].id) + '"' +
                        '                           data-seo-title="' + resp.logos[i].seo_title + '" data-seo-description="' + resp.logos[i].seo_description + '" data-seo-keyword="' + resp.logos[i].seo_keyword + '">' +
                        '                           <i class="fa fa-pencil-square-o"></i>  ' +
                        '                            <span>Edit</span>    ' +
                        '                      </span>        ' +
                        '                    <span class="flip-buy buyLogoItem" data-url="' + resp.logos[i].s3_logo_url + '" data-category-id="' + resp.logos[i].category_id + '" data-id="' + resp.logos[i].id + '">      ' +
                        '                         <i class="fa fa-shopping-cart"></i>      ' +
                        '                          <span>Buy</span>      ' +
                        '                     </span>    ' +
                        '               </span>  ' +
                        '      </li>' +
                        '   </ul>' +
                        '</div>' +
                        '</div>');
                } else {
                    currentDiv = $(
                        '<div class="col-md-3 layoutList link" data-status="' + resp.logos[i].status + '" data-id="' + resp.logos[i].id + '" data-category-id="' + resp.logos[i].category_id + '" data-url="' + resp.logos[i].s3_logo_url + '">' +
                        '<ul class="template-list">' +
                        '       <li>  ' +
                        '       <span class="purchasedLabel">Purchased</span>'+
                        '           <div class="col-md-3 template_logos"><div class="layoutLogos"><div class="logoPrevInList' + resp.logos[i].id + '"></div>' + '</div></div>' +
                        '           <span class="flip-template" style="display: none;">      ' +
                        '               <label>This logo is already purchased.</label>' +
                        '           </span>  ' +
                        '      </li>' +
                        '   </ul>' +
                        '</div>' +
                        '</div>');
                }
            } else {
                currentDiv = $(
                    '<div class="col-md-3 layoutList link" data-status="Purchased" data-id="' + resp.logos[i].id + '" data-category-id="' + resp.logos[i].category_id + '" data-url="' + resp.logos[i].s3_logo_url + '">' +
                    '<ul class="template-list">' +
                    '       <li class="">  ' +
                    '           <div class="col-md-3 template_logos"><div class="layoutLogos"><div class="logoPrevInList' + resp.logos[i].id + '"></div>' + '</div></div>' +
                    '           <span class="flip-template" style="display: none;">      ' +
                    '               <label>You can\'t change design after purchase.</label>' +
                    '           </span>  ' +
                    '      </li>' +
                    '   </ul>' +
                    '</div>' +
                    '</div>');
            }
            $(".logos").append(currentDiv);
            updateLogoImage(resp.logos[i].id, '/getLogoImage?id=' + resp.logos[i].s3_logo_url, comp, slogan);
        }
        $(".leftPanecontents [data-status=Active] .flip-template").remove();
        var _editLogoFn = function (){
            wizardClickCount++;
            var thisObj = this;
            var newUrl = window.location.pathname.replace("/logo-design-online/", "").split("/");
            var _updateLogo = function () {
                if (newUrl[1] != $(thisObj).attr("data-seo-url")) {
                    newUrl[1] = $(thisObj).attr("data-seo-url");
                    newUrl[0] = $(thisObj).attr("data-category-url");
                    newUrl.splice(2);
                    changeUrl(newUrl.join("/"));
                } else {
                    showToast("You can reset the logo by clicking reset button in editor", "info");
                }
            };
            if ($("#svgedit").is(":visible") && newUrl[1] != $(thisObj).attr("data-seo-url")) {
                bootbox.confirm("The current modifications will be <b>erased</b>.<br/>Do you want to continue?", function (result) {
                    if (result == true) {
                        $('html,body').animate({
                            scrollTop: $("#accordionThree").prev('.panel-heading').offset().top
                        }, 1000);
                        $('#accordionTwo').addClass('in');
                        _updateLogo();
                    }
                });
            } else {
                _updateLogo();
            }
        };
        $(".layoutList[data-status=Active]").click(function (e){
            _editLogoFn.call(this);
            e.preventDefault();
            e.stopPropagation();
        });
        $("#actualLogoEditorPanelBody .editorLayout .layoutList").removeClass("col-md-3").addClass("col-md-6");

        $(".editLogoItem").click(function (e) {
            _editLogoFn.call(this);
            e.preventDefault();
            e.stopPropagation();
        });
        $(".buyLogoItem").click(function (e) {
            e.preventDefault();
            buyCurrentLogo($(this).attr("data-id"));
        });
        $('.template-list li').hover(function () {
            $(this).addClass('active');
            $(this).find('.flip-template').fadeIn(300);
        }, function () {
            $(this).find('.flip-template').fadeOut(100);
            $(this).removeClass('active');
        });
        $('.template-filter-li').on('click', function () {
            $('.template-filter-li').removeClass('active');
            $(this).addClass('active');
        });
        $("#step1NextBtn").click(function () {
            $("#logoMakerStep2").click();
        });
        $("#hidePurchasedLogoCheckBox").change();
    }

    $("#createAnotherLogo").click(function (e) {
        var splitterVal = window.location.hash.split("/");
        var newUrl = window.location.pathname.replace("/logo-design-online/", "").split("/");
        selectedImageId = "";
        savedLogoId = "";
        editingLogo = false;
        savedLogoFile = "";
        loadedCategories = [];
        changeUrl(newUrl[0]);
    });

    function chooseCategory(id, callback) {
        if (loadedCategories.indexOf(id) < 0) {
            addWaitingOverlay();
            doPost("/listLogos", {category_id: id}, function (resp) {
                $(".logos").empty();
                loadedCategories = [id];
                if (resp.status == 200) {
                    addLogoToList(resp);
                } else if (resp.status == 201) {
                    /* Empty category*/
                } else {
                    console.log(resp.msg);
                }
                removeWaitingOverlay();
                callback ? callback() : $.noop();
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });
        } else {
            callback ? callback() : $.noop();
        }
    }
    /*
    function updateCardPreviewImage(id, url, image) {
        $(id).svg();
        var svg = $(id).svg('get');
        svg.load(url, {
            onLoad: function (svg, error) {
                $(svg.root()).attr("width", "300px");
                $(svg.root()).attr("height", "173px");
                if (image != null) {
                    var logoFn = function (data, isString) {
                        addWaitingOverlay();
                        setTimeout(function () {
                            var svgLogoData;
                            if (isString == false) {
                                var serializer = new XMLSerializer();
                                svgLogoData = ieSVGFix(serializer.serializeToString(data));
                            } else {
                                svgLogoData = data;
                            }
                            var original = $("#logo", svg.root());
                            var img;
                            var pos;
                            var color;
                            try {
                                pos = $(original)[0].getBBox();
                                img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                                img.setAttributeNS(null, 'height', pos.height);
                                img.setAttributeNS(null, 'width', pos.width);
                                img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "data:image/svg+xml;base64," + Base64.encode(svgLogoData));
                                img.setAttributeNS(null, 'x', pos.x);
                                img.setAttributeNS(null, 'y', pos.y);
                                img.setAttributeNS(null, 'visibility', 'visible');
                                img.setAttributeNS(null, 'id', 'logo');
                                if (original.attr("transform") != null) {
                                    img.setAttributeNS(null, 'transform', original.attr("transform"));
                                }
                                original.replaceWith(img);
                                if ($("#color1", svg.root()).length > 0) {
                                    setFillColor($("#color1", svg.root()), $("#Color1", data));
                                }
                                if ($("#color2", svg.root()).length > 0) {
                                    setFillColor($("#color2", svg.root()), $("#Color2", data));
                                }
                                if ($("#color3", svg.root()).length > 0) {
                                    setFillColor($("#color3", svg.root()), $("#Color3", data));
                                }
                            } catch (err) {
                                console.log(err);
                            }
                            removeWaitingOverlay();
                        }, 1024);
                    };
                    logoFn(image, true);
                }
            }, changeSize: true
        });
    }
    */
    function updateLogoImage(id, url, comp, slogan) {
        var _loadSVG = {
            onLoad: function (svg, error) {
                if (error) {
                    console.log(error);
                } else {
                    $(svg.root()).attr("height", "100%");
                    $(svg.root()).attr("width", "100%");
                    $("#Company_Name", svg.root()).text(comp);
                    $("#Tagline", svg.root()).text(slogan);
                    $("font", svg.root()).remove();
                    $("style", svg.root()).after($("#allFonts").html());
                }
            }, changeSize: true
        };
        $(".logoPrevInList" + id).svg();
        $(".logoPrevInList" + id+":first").svg('get').load(url, _loadSVG);
        $(".logoPrevInList" + id+":last").svg('get').load(url, _loadSVG);
    }

    function editThisLogo(states, url, callback) {
        $("#actualLogoEditorPanelBody").show();
        $("#logoListerPanelBody").hide();
        var reloadImage = states[2] != "save";
        addWaitingOverlay();
        if (!window.editorFrame) {
            $("#iframeHolder").prepend('<iframe src="/svgedit/logo_editor_frame.html?v=' + version + '" name="editorFrame" style="margin: 0px; width: 100%; border: none; min-height: 475px" id="svgedit"></iframe>');
            reloadImage = true;
        }
        var fn = function () {
            removeWaitingOverlay();
            var fn = function () {
                removeWaitingOverlay();
                if (reloadImage) {
                    addWaitingOverlay();
                    window.editorFrame.setParent(window);
                    window.editorFrame.initCommon("LOGO");
                    window.editorFrame.loadImage(url, function () {
                        window.editorFrame.fillCompanyAndSloganNames($("#company-name").val(), $("#company-tagline").val());
                        callback ? callback(url) : $.noop();
                    }, function () {
                        removeWaitingOverlay();
                    });
                } else {
                    callback ? callback(url) : $.noop();
                }
            };
            addWaitingOverlay();
            if (window.editorFrame.svgedit.browser.isGecko() || window.editorFrame.svgedit.browser.isIE()) {
                setTimeout(fn, 2048);
            } else {
                fn();
            }
        };
        if (window.editorFrame.loadImage) {
            fn();
        } else {
            $('#svgedit').load(fn);
        }
    }

    function buyCurrentLogo(id) {
        selectedImageId = id;
        var svgDom = $(".logoPrevInList" + id).children();
        $(svgDom).attr("xmlns:sodipodi", "http://www.w3.org/1999/xlink");
        $(svgDom).attr("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
        saveLogo(function () {
            addLogoToShoppingCart(savedLogoId, function () {
                window.location = "/checkout";
            });
        }, $(".logoPrevInList" + id).svg('get').toSVG());
    }

    function saveLogo(fn, svgString, saveError) {
        var afterSave = function () {
            editingLogo = true;
            fn(savedLogoFile);
        };
        var params = {
            url: svgString == undefined ? window.editorFrame.getSvgString() : svgString,
            base_item_id: selectedImageId,
            company_name: $("#company-name").val(),
            slogan: $("#company-tagline").val()
        };
        if (isLoggedIn(true) == true) {
            addWaitingOverlay(true);
            var address;
            var purchased = editFrom == "purchase";
            if (editingLogo == true) {
                params.id = savedLogoId;
                if (purchased == false) {
                    address = "/updateUserLogo";
                } else {
                    address = "/updatePurchasedItem";
                }
            } else {
                address = "/addUserLogo";
            }
            doPost(address, params, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    if (editingLogo == false) {
                        savedLogoId = resp.insertId;
                    }
                    savedLogoFile = resp.url;
                    updateCartCount(true);
                    updateMyDesignsCount(true);
                    afterSave();
                } else {
                    bootbox.alert(resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                saveError ? saveError() : $.noop();
                bootbox.alert((typeof err == "string" ? err : "Server Error."));
            });
        } else {
            var currentId;
            var fileName;
            if (editingLogo == true) {
                fileName = savedLogoFile;
            } else {
                currentId = new Date().getTime();
                savedLogoId = currentId;
                fileName = "logo_" + currentId;
                savedLogoFile = fileName;
            }
            saveItemLocally("logos", fileName, params);
            updateCartCount(false);
            updateMydesignsCount(false);
            afterSave();
        }
    }

    function changeUrl(url) {
        pushState(url, "/logo-design-online/" + url);
        urlChanged();
    }

    function showPanelThree(animation_complete) {
        if ($('.panel-three').is(":visible")) {
            $('html,body').scrollTop($("#accordionThree").prev('.panel-heading').offset().top - 10);
            animation_complete ? animation_complete() : $.noop();
        } else {
            $('.wizard-steps li').removeClass('active');
            $('.wiz-three').addClass('active');
            $('#accordionThree').addClass('in');
            $('.panel-three').show();
            $('#s2id_e1').focus();
            $('html,body').animate({
                scrollTop: $("#accordionThree").prev('.panel-heading').offset().top - 65
            }, 1000).promise().done(function () {
                animation_complete ? animation_complete() : $.noop();
            });
        }
    }

    $('.logo-card').hover(function () {
        $(this).find('.flip-card-template').show();
    }, function () {
        $(this).find('.flip-card-template').hide();
    });
    init();
});

