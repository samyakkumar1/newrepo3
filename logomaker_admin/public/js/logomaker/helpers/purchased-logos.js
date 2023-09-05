$(function () {
    function init() {
        $("#categories").select2();
        doPost("/listCategories", {}, function (resp) {
            if (resp.status == 200) {
                for (var i = 0; i < resp.categories.length; i++) {
                    $("#categories").append("<option value='" + resp.categories[i].id + "'>" + resp.categories[i].category_name + "</option>");
                }
                $("#categories").val(resp.categories[0].id).trigger("change");
            }
        });
        $("#categories").change(function () {
            listPurchasedItems($("#categories").val());
        })
    }

    function updateLogoImage(selector, url) {
        $(selector).svg();
        var svg = $(selector).svg('get');
        if (svg != undefined) {
            svg.load("/getUserLogoImage?id=" + url, {
                onLoad: function (svg, error) {
                    if (error) {
                        console.log(error);
                    } else {
                        $(svg.root()).attr("width", "100%");
                        $(svg.root()).attr("height", "100%");
                        $("font", svg.root()).remove();
                        $("#fonts", svg.root()).remove();
                        /*
                         if ($("style", svg.root()).length == 0) {
                         $("defs", svg.root()).after($("#allFonts").text());
                         } else {
                         $("style", svg.root()).after($("#allFonts").text());
                         }
                         */
                    }
                }, changeSize: true
            });
        }
    }

    function listPurchasedItems(categoryId) {
        doPost("/listPurchasedLogos", {categoryId: $("#categories").val()}, function (resp) {
            if (resp.status == 200) {
                var tbl = $("#tblPurchasedLogos tbody");
                tbl.empty();
                if (resp.logos.length > 0) {
                    for (var i = 0; i < resp.logos.length; i++) {
                        tbl.append("<tr>" +
                                "<td class='col-md-2'><div class='logoPreview" + resp.logos[i].purchased_item_id + "'></div></td>" +
                                "<td class='col-md-8'>" + resp.logos[i].email + "</td>" +
                                "<td class='col-md-2'><input class='toggleVisible' data-id='" + resp.logos[i].id + "' type='checkbox' " + (resp.logos[i].visible ? " checked " : "") + "/></td>" +
                                "</tr>");
                        updateLogoImage(".logoPreview" + resp.logos[i].purchased_item_id, resp.logos[i].url);
                    }
                    $(".toggleVisible").change(function (e) {
                        var status = $(this).is(":checked");
                        var id = $(this).attr("data-id");
                        doPost("/updateLogoVisibilityStatus", {visible: status, id: id}, function (resp) {
                            if (resp.status == 200) {
                                showToast("Status updated.", "success");
                            } else {
                                console.log(resp);
                                showToast("Error: " + resp.msg);
                            }
                        }, function (err) {
                            console.log(err);
                            showToast("Communication Failure!!!")
                        });
                        e.stopPropagation();
                    });
                } else {
                    tbl.append("<tr><td colspan='3'>No logos purchased from this category!!</td></tr>");
                }
            } else {
                console.log(resp);
                showToast("Error: " + resp.msg);
            }
        }, function (err) {
            console.log(err);
            showToast("Connection Error!!")
        });
    }

    init();
});