$(function () { 
    var nextIndex = 0;
    var STEP = 10;

    function init() {
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > $(document).height() - $(window).height() - 10) {
                doPost("/listLogos", {start: nextIndex}, function (resp) {
                    if (resp.status == 200) {
                        nextIndex += STEP;
                        loadMoreLogos(resp.logos);
                    } else if (resp.status == 201) {
                        if ($("#homePageLogoTbl1").children().length <= 1){
                            $("#homePageLogoTbl1").append("<span class='no-logos'>No logos available.</span>");
                        }
                    } else {
                        console.log(resp);
                        bootbox.alert("Can't list logos.");
                    }
                });
            }
        }).scroll();
    } 
    init(); 
    
    function loadMoreLogos(logos) {
        for (var i = 0; i < logos.length; i++) {
            addLogoToTables(logos[i].id, logos[i].categories, logos[i].s3_logo_url, logos[i].title, logos[i].desc, logos[i].status);
        }
    }  
    
    
    function addLogoToTables(id, category, src, rtitle, rdesc, status, toDashboardTop) {
        var title = rtitle == "" ? "No title" : rtitle;   
        var tr1 = '<tr>' +
            '<td class="col-md-3"><div style="text-align: left; overflow: visible" class="logoPrev' + id + '"></td>' +
            '<td>' +
            '   <table id="innerTbl' + id + '">' +
            '       <tr>' +
            '           <td colspan="2"><a href="#" data-id="' + id + '" class="makeCenter' + id + '">Make it center and save</a></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>Company Name: </td>' +
            '           <td><select class="cmbAlign logoRowCmp' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '           <td class="clsRow' + id + '" rowspan="2" style="visibility: hidden"><button class="form-controll btn btn-primary btnSave' + id + '">Save</button></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>TagLine: </td>' +
            '           <td><select class="cmbAlign logoRowTag' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '       </tr>' +
            '   </table>' +
            '</td>' +
            '<td>' + category + '</td>' +
            '<td>' + title + '</td>' +
            '</tr>';   
        $("#homePageLogoTbl1").append(tr1);
        updateLogoImage(id, '/getLogoImage?id=' + src + '&random=' + Math.random());
        var fn = function (e) {
            $('.clsRow' + id).attr("style", "visibility: visible");
        };
        $(".btnSave" + id).click(function (e) {
            e.preventDefault();
            addWaitingOverlay();
            $.get('/getLogoImage?id=' + src + '&random=' + Math.random(), function (data) {
                removeWaitingOverlay();
                var logoDiv = $(".logoPrev" + id);
                var x = parseFloat($("#Tagline", logoDiv).attr("x"));
                var bx = $("#Tagline", logoDiv)[0].getBBox().x;
                $("#Tagline", logoDiv).attr("text-anchor", $('.logoRowTag' + id).val());
                var bxn = $("#Tagline", logoDiv)[0].getBBox().x;
                if (bxn > bx) {
                    for (var i = x; ; i--) {
                        $("#Tagline", logoDiv).attr("x", i);
                        if ($("#Tagline", logoDiv)[0].getBBox().x <= bx) {
                            break;
                        }
                    }
                } else {
                    for (var i = x; ; i++) {
                        $("#Tagline", logoDiv).attr("x", i);
                        if ($("#Tagline", logoDiv)[0].getBBox().x >= bx) {
                            break;
                        }
                    }
                }
                x = parseFloat($("#Company_Name", logoDiv).attr("x"));
                bx = $("#Company_Name", logoDiv)[0].getBBox().x;
                $("#Company_Name", logoDiv).attr("text-anchor", $('.logoRowCmp' + id).val());
                bxn = $("#Company_Name", logoDiv)[0].getBBox().x;
                if (bxn > bx) {
                    for (var i = x; ; i--) {
                        $("#Company_Name", logoDiv).attr("x", i);
                        if ($("#Company_Name", logoDiv)[0].getBBox().x <= bx) {
                            break;
                        }
                    }
                } else {
                    for (var i = x; ; i++) {
                        $("#Company_Name", logoDiv).attr("x", i);
                        if ($("#Company_Name", logoDiv)[0].getBBox().x >= bx) {
                            break;
                        }
                    }
                }
                var serializer = new XMLSerializer();
                $("#Company_Name", data).attr("text-anchor", $('.logoRowCmp' + id).val());
                $("#Company_Name", data).attr("x", $("#Company_Name", logoDiv).attr("x"));
                $("#Tagline", data).attr("text-anchor", $('.logoRowTag' + id).val());
                $("#Tagline", data).attr("x", $("#Tagline", logoDiv).attr("x"));
                svgLogoData = serializer.serializeToString(data);
                addWaitingOverlay();
                doPost("/updateImage", {type: "logo", fileName: src, newSrc: svgLogoData}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        $('.clsRow' + id).attr("style", "visibility: hidden");
                    } else {
                        console.log(resp);
                        bootbox.alert("Error: " + resp.msg);
                    }
                }, function (err) {
                    console.log(err);
                    removeWaitingOverlay();
                });
            }).fail(function () {
                removeWaitingOverlay();
                bootbox.alert("Error retrieving file.");
            })
        })
        $('.logoRowCmp' + id).change(fn);
        $('.logoRowTag' + id).change(fn);
        $(".makeCenter" + id).click(function (e) {
            e.preventDefault();
            $('.logoRowCmp' + id).val("middle");
            $('.logoRowTag' + id).val("middle");
            $('.btnSave' + id).click();
        });
    }
});