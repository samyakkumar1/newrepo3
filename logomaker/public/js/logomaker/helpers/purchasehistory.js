/**
 * Created by DesignerBe on 10-02-2020.
 */

$(function (){
    $("head").append($("#allFonts").html());
    if (isLoggedIn(true) == true) {
        doPost("/getPurchaseHistory", {}, function (resp) {
            if (resp.status == 200) {
                var mainDiv = $(".my-purchases-ul");
                var addLogo = function (logo_resp) {
                    console.log(logo_resp);
                    var imgSrc = "/getUserLogoImage?id=" + logo_resp.url + '&random=' + Math.random();
                    var item =
                        '<li class="col-md-4 purchaseHistoryItem myLogoItems' + logo_resp.id + '">' +
                            '<span class="my-logos-list ">' +
                                /*'<img src="' + imgSrc + '">' +*/'<div id="svgPurLogoObject' + logo_resp.id + '"></div>' +
                                '<span class="my-logo-company">' + logo_resp.company_name + '</span>' +
                                '<span class="flip-logo-template">' +
                                    '<div class="separate-one">' +
                                        '<span class="flip-logo-add"  data-toggle="tooltip" data-placement="top" data-original-title="Create Card with this Logo" >' +
                                            '' +
                                            '<span><a style="text-decoration: none" href="/design-business-card-online/use/' + logo_resp.url + '"><i class="fa fa-plus"></i></a></span>' +
                                        '</span>' +
                                        '<span class="flip-logo-edit" data-toggle="tooltip" data-placement="top" data-original-title="Edit Logo" >' +
                                            '' +
                                            '<span><a style="text-decoration: none" href="/logo-design-online/edit/' + logo_resp.id + '/purchase"><i class="fa fa-pencil-square-o"></i></a></span>' +
                                        '</span>' +
                                        '</div>' +
                                        '<div class="separate-two">'+
                                        '<span class="flip-logo-edit" data-toggle="tooltip" data-placement="top" data-original-title="Download PDF" >' + 
                                            '<span><a target="_blank" style="text-decoration: none" href="' + getWindowsPrinterLink(logo_resp.id, logo_resp.url, "logo", 1460, 1920, false, "pdf") + '" class="downloadPDF'+logo_resp.id+'"><i class="fa fa-file-pdf-o"></i></a></span>' +
                                        '</span>' +
                                        '<span class="flip-logo-edit" data-toggle="tooltip" data-placement="top" data-original-title="Download PNG" >' +
                                            '<span><a target="_blank" style="text-decoration: none" href="' + getWindowsPrinterLink(logo_resp.id, logo_resp.url, "logo", 1460, 1920, false, "png") + '" class="downloadPDF'+logo_resp.id+'"><i class="fa fa-file-image-o"></i></a></span>' +
                                        '</span>' +
                                        '</div>' +
                                    '</div>' +
                                '</span>' +
                            '</span>' +
                        '</li>';
                    mainDiv.append(item);
                    updateJQSvgImage("#svgPurLogoObject" +logo_resp.id, imgSrc);
                };
                var addCard = function (card_resp) { 
                    var name = card_resp.last_name;
                    if (name.trim().length <= 0) {
                        name = ".";
                    }
                    var imgSrc = "/getUserCardImage?id=" + card_resp.url + '&random=' + Math.random();
                    var item = '<li class="col-md-4 purchaseHistoryItem myCardItems' + card_resp.id + '">' +
                        '<span class="my-logos-list ">' +
                        /*'<img src="' + imgSrc + '"/>' +*/'<div id="svgPurCardObject' + card_resp.id + '"></div>' +
                        '<span class="my-logo-company">' + name + '</span>' +
                        '<span class="flip-logo-template">' +  
                            '<span style="position: relative; left: auto;width: 134px" data-toggle="tooltip" data-placement="left" data-original-title="Edit Card"  class="flip-card-edit" style="top: 33%;">' +
                                '<span style="width: 124px;left: 25%;"><a style="text-decoration: none" href="/design-business-card-online/edit/' + card_resp.id + '/purchase"><i class="fa fa-pencil-square-o"></i> Edit Card</a></span>' +
                            '</span>' + 
                            (card_resp.purchase_design == 0 ?
                            "" : 
                            '<br/>'+
                            '<span style="position: relative; left: auto;width: 134px" data-toggle="tooltip" data-placement="left" data-original-title="Download PDF"  class="flip-card-edit" style="top: 33%;">' +
                                '<span style="top: auto;width: auto;left: 25%;" ><a class="downloadPdf' + card_resp.id + '" target="_blank" style="text-decoration: none" href="' + getWindowsPrinterLink(card_resp.id, card_resp.url, "card", undefined, undefined, false, "pdf") + '"><i class="fa fa-download"></i> Download PDF</a></span>'+
                            '</span>') +  
                        '</span>' +
                        '</span>' +
                        '</li>';
                    mainDiv.append(item); 
                    if (card_resp.url_back != null ){ 
                        $('.downloadPdf' + card_resp.id).click(function (e){
                            window.open(getWindowsPrinterLink(card_resp.id+ "_back", card_resp.url_back, "card", undefined, undefined, false, "pdf"));
                        });
                    }
                    if (card_resp.design_type == "SystemDesign"){
                        updateJQSvgImage("#svgPurCardObject" +card_resp.id, imgSrc);
                    } else {
                        updateJQSvgImage("#svgPurCardObject" +card_resp.id, "/img/customCard.svg");
                    } 
                };
                var addOtherProduct = function (card_resp){ 
                    var name = card_resp.name;
                    if (!name || name.trim().length <= 0) {
                        name = ".";
                    }
                    var imgSrc = "/getUserOtherProductImage?id=" + card_resp.url + '&random=' + Math.random();
                    var item = '<li class="col-md-4 purchaseHistoryItem myOtherItems' + card_resp.id + '">' +
                        '<span class="my-logos-list ">' +
                        /*'<img src="' + imgSrc + '"/>' +*/'<div id="svgPurOtherObject' + card_resp.id + '"></div>' +
                        '<span class="my-logo-company">' + name + '</span>' +
                        '<span class="flip-card-template">' +
                        '<span style="width: auto;left: 28%" data-toggle="tooltip" data-placement="left" data-original-title="Edit Purchased Item" class="flip-card-edit" style="top: 33%;">' +
                        '<span><a style="text-decoration: none" href="/other/' + card_resp.seo_url + '/edit/' + card_resp.id + '/purchase"><i class="fa fa-pencil-square-o"></i> Edit Product</a></span>' +
                        '</span>' +
                        '</span>' +
                        '</span>' +
                        '</li>';
                    mainDiv.append(item);  
                    updateJQSvgImage("#svgPurOtherObject" +card_resp.id, imgSrc); 
                }
                if (resp.items.length > 0){
                    for (var i = 0; i < resp.items.length; i++) {
                        $(".hist-count").text(" (" + resp.items.length + ")");
                        if (resp.items[i].type == "LOGO") {
                            addLogo(resp.items[i]);
                        } else if (resp.items[i].type == "BC") {
                            addCard(resp.items[i]);
                        } else  { 
                            addOtherProduct(resp.items[i]);
                        }
                    }
                    $('.my-logos-list').hover(function () {
                        $(this).find('.flip-logo-template').show();
                        $(this).find('.flip-card-template').show();
                    }, function () {
                        $(this).find('.flip-logo-template').hide();
                        $(this).find('.flip-card-template').hide();
                    });
                    $('[data-toggle=tooltip]').tooltip();
                } else {
                    $(".my-purchases-ul").text("No purchases made.");
                }
            } else {
                $(".my-purchases-ul").text("No purchases made.");
                bootbox.alert("Error: " + resp.msg);
            }
        }, function (resp) {
            $(".my-purchases-ul").text("No purchases made.");
            bootbox.alert("Server Error: Communication Failed.");
        });
    } else {
        $(".my-purchases-ul").text("No purchases made.");
    }
});