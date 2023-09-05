var addLogoToInnerTable;
$(function () {
    var nextIndex = 0;
    var STEP = 10;
    var loadingInProgress = false;

    function init() {
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > $(document).height() - $(window).height() - 10) {
                if (!loadingInProgress){
                    loadingInProgress = true;
                    doPost("/listLogos", {start: nextIndex}, function (resp) {
                        loadingInProgress = false;
                        if (resp.status == 200) { 
                            nextIndex += STEP;
                            loadMoreLogos(resp.logos);
                        } else if (resp.status == 201) {
                            if ($(".logosContainer").children().length <= 1){
                                $(".logosContainer").append("<span class='no-logos'>No logos available.</span>");
                            }
                        } else {
                            console.log(resp);
                            bootbox.alert("Can't list logos.");
                        }
                    }, function (err){
                        console.log(err);
                        showToast("Communication Error!!")
                        loadingInProgress = false;
                    });
                }
            }
        }).scroll();
    } 
    init();
    
    function loadMoreLogos(logos) {
        for (var i = 0; i < logos.length; i++) {
            addLogoToTables(logos[i].id, logos[i].categories, logos[i].s3_logo_url, logos[i].title, logos[i].desc, logos[i].status, true);
        }
    }  
    
    function addLogoToTables(id, category, src, rtitle, rdesc, status, toBottom) {
        var title = rtitle == "" ? "No title" : rtitle;
        var desc = rdesc == "" ? "No Description" : rdesc;
        var logoItem;
        if (status == "Purchased") {
            logoItem = '<div class="col-md-4 logo' + id + '">' +
                '<ul class="business_cards">' +
                '<li class="business_cardsSection">' +
                '<div id="logo_status_div"></div>' +
                '<div id="purchased_status_div">' + status + '</div><div class="team-item thumbnail cardItems">' +
                '<div class="logoPrev' + id + '"></div>' +
                '<span class="card_category">' +
                '<b>Category : </b>' + category +
                '</span>' +
                '<span class="card_title">' +
                '<b>' + title + '</b>' +
                '</span>' +
                '<div class="card_details" style="width: 100%">' +
                '<span class="card_category">' +
                '<b>Category : </b>' + category +
                '</span>' +
                '<span class="card_title">' +
                '<b>' + title + '</b>' +
                '</span>' +
                '<p>' + desc + '</p>' +
                '<hr>' +
                '<span class="action-icons">' +
                '<span class="edit_icon editLogoFile' + id + '"><a class="action_tooltip"><i class="fa fa-pencil" data-toggle="tooltip" data-placement="bottom" data-original-title="Edit"></i></a></span>' +
                '<span class="delete_icon deleteLogoFile' + id + '"><a class="action_tooltip"><i class="fa fa-trash-o" data-toggle="tooltip" data-placement="bottom" data-original-title="Delete"></i></a></span>' +
                '</span>' +
                '</div>' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>';
        } else {
            logoItem = '<div class="col-md-4 logo' + id + '">' +
                '<ul class="business_cards">' +
                '<li class="business_cardsSection">' +
                '<div id="logo_status_div"></div><div class="team-item thumbnail cardItems">' +
                '<div class="logoPrev' + id + '"></div>' +
                '<span class="card_category">' +
                '<b>Category : </b>' + category +
                '</span>' +
                '<span class="card_title">' +
                '<b>' + title + '</b>' +
                '</span>' +
                '<div class="card_details" style="width: 100%">' +
                '<span class="card_category">' +
                '<b>Category : </b>' + category +
                '</span>' +
                '<span class="card_title">' +
                '<b>' + title + '</b>' +
                '</span>' +
                '<p>' + desc + '</p>' +
                '<hr>' +
                '<span class="action-icons">' +
                '<span class="edit_icon editLogoFile' + id + '"><a class="action_tooltip"><i class="fa fa-pencil" data-toggle="tooltip" data-placement="bottom" data-original-title="Edit"></i></a></span>' +
                '<span class="delete_icon deleteLogoFile' + id + '"><a class="action_tooltip"><i class="fa fa-trash-o" data-toggle="tooltip" data-placement="bottom" data-original-title="Delete"></i></a></span>' +
                '</span>' +
                '</div>' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>';
        } 
        if (toBottom){
            $(".logosContainer").append(logoItem); 
        } else {
            $(".logosContainer").prepend(logoItem); 
        }
        $(".editLogoFile" + id).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            _editLogoFile(id);
        });
        $(".deleteLogoFile" + id).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            deleteLogoFile(id);
        });   
        updateLogoImage(id, '/getLogoImage?id=' + src); 
    }
    
    function _editLogoFile(id) {
        doPost("/getLogoDetails", {id: id}, function (resp) {
            if (resp.status == 200) {
                var categories = resp.logo.categories.split(",");
                $("#addLogoCategoryName").select2('val', categories);
                $("#addLogoTitle").val(resp.logo.title);
                $("#addLogoDesc").val(resp.logo.desc);
                $("#addLogoUrl").val(resp.logo.url);
                $("#addLogoSeoTitle").val(resp.logo.seo_title);
                $("#addLogoSeoDescription").val(resp.logo.seo_description);
                $("#addLogoSeoKeywords").val(resp.logo.seo_keyword);
                logoId = id;
                $('#addLogoModal').modal('show');
            } else {
                bootbox.alert("Can't retrieve logo details.");
            }
        });
        return;
    }

    function deleteLogoFile(id) {
        bootbox.confirm("Do you want to remove this Logo?", function (result) {
            if (result == true) {
                addWaitingOverlay();
                doPost("/removeLogo", {id: id}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        $(".logo" + id).remove();
                    } else {
                        console.log(resp);
                        bootbox.alert("Can't remove logos.");
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    console.log(err);
                    bootbox.alert("Error: Can't add to server");
                });
            }
        });
    }
    
    addLogoToInnerTable = addLogoToTables;
});
