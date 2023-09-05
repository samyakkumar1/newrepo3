$(function () {
    var nextIndex = 0;
    var STEP = 10;

    function init() {
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > $(document).height() - $(window).height() - 10) {
                doPost("/listCards", {start: nextIndex}, function (resp) {
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
                });
            }
        }).scroll();
    }
    
    init(); 
    
    function fixTransforms(node) {
        var x = node.attr("x");
        if (x == undefined) {
            var transform = node.attr("transform");
            if (transform != undefined) {
                if (transform.indexOf("matrix") >= 0) {
                    var pdata = transform.slice(transform.indexOf('(') + 1, transform.indexOf(')')).match(/([^\s,]+)/g);
                    if (pdata != null) {
                        node.attr("x", pdata[4]);
                        node.attr("y", pdata[5]);
                        node.attr("transform", "");
                        return;
                    }
                } else {
                    var parse = function (a) {
                        var b = {};
                        for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*,?)+\))+/g)) {
                            var c = a[i].match(/[\w\.\-]+/g);
                            b[c.shift()] = c;
                        }
                        return b;
                    }
                    var pdata = parse(transform);
                    if (pdata != null) {
                        if (pdata.translate != null) {
                            node.attr("x", pdata.translate[0]);
                            node.attr("y", pdata.translate[1]);
                            node.attr("transform", "");
                            return;
                        }
                    }
                }
            }
            node.attr("x", 0);
        }
        if (node.attr("y") == undefined) {
            node.attr("y", 0);
        }
    }

    function alignFn(cardDiv, id, align) {
        fixTransforms($(id, cardDiv));
        var x = $(id, cardDiv).attr("x");
        var bx = $(id, cardDiv)[0].getBBox().x;
        $(id, cardDiv).attr("text-anchor", align);
        var bxn = $(id, cardDiv)[0].getBBox().x;
        if (bxn > bx) {
            for (var i = x; ; i--) {
                $(id, cardDiv).attr("x", i);
                if ($(id, cardDiv)[0].getBBox().x <= bx) {
                    break;
                }
            }
        } else {
            for (var i = x; ; i++) {
                $(id, cardDiv).attr("x", i);
                if ($(id, cardDiv)[0].getBBox().x >= bx) {
                    break;
                }
            }
        }
    }

    function saveCard(id, url, frontChar) {
        addWaitingOverlay();
        $.get('/getCardImage?id=' + url + '&random=' + Math.random(), function (data) {
            removeWaitingOverlay();
            addWaitingOverlay();
            var cardDiv;
            if (frontChar == "F") {
                cardDiv = $(".cardFrontPrev" + id);
            } else {
                cardDiv = $(".cardBackPrev" + id);
            }
            alignFn(cardDiv, "#name", $(".cardRow" + frontChar + "Name" + id).val());
            alignFn(cardDiv, "#designation", $(".cardRow" + frontChar + "Desig" + id).val());
            alignFn(cardDiv, "#mobile", $(".cardRow" + frontChar + "Phone" + id).val());
            alignFn(cardDiv, "#email", $(".cardRow" + frontChar + "Email" + id).val());
            alignFn(cardDiv, "#website", $(".cardRow" + frontChar + "Web" + id).val());
            alignFn(cardDiv, "#address1", $(".cardRow" + frontChar + "Ad1" + id).val());
            alignFn(cardDiv, "#address2", $(".cardRow" + frontChar + "Ad2" + id).val());
            $("#name", data).attr("x", $("#name", cardDiv).attr("x"));
            $("#designation", data).attr("x", $("#designation", cardDiv).attr("x"));
            $("#mobile", data).attr("x", $("#mobile", cardDiv).attr("x"));
            $("#email", data).attr("x", $("#email", cardDiv).attr("x"));
            $("#website", data).attr("x", $("#website", cardDiv).attr("x"));
            $("#address1", data).attr("x", $("#address1", cardDiv).attr("x"));
            $("#address2", data).attr("x", $("#address2", cardDiv).attr("x"));

            $("#name", data).attr("y", $("#name", cardDiv).attr("y"));
            $("#designation", data).attr("y", $("#designation", cardDiv).attr("y"));
            $("#mobile", data).attr("y", $("#mobile", cardDiv).attr("y"));
            $("#email", data).attr("y", $("#email", cardDiv).attr("y"));
            $("#website", data).attr("y", $("#website", cardDiv).attr("y"));
            $("#address1", data).attr("y", $("#address1", cardDiv).attr("y"));
            $("#address2", data).attr("y", $("#address2", cardDiv).attr("y"));

            $("#name", data).attr("transform", $("#name", cardDiv).attr("transform"));
            $("#designation", data).attr("transform", $("#designation", cardDiv).attr("transform"));
            $("#mobile", data).attr("transform", $("#mobile", cardDiv).attr("transform"));
            $("#email", data).attr("transform", $("#email", cardDiv).attr("transform"));
            $("#website", data).attr("transform", $("#website", cardDiv).attr("transform"));
            $("#address1", data).attr("transform", $("#address1", cardDiv).attr("transform"));
            $("#address2", data).attr("transform", $("#address2", cardDiv).attr("transform"));

            $("#name", data).attr("text-anchor", $("#name", cardDiv).attr("text-anchor"));
            $("#designation", data).attr("text-anchor", $("#designation", cardDiv).attr("text-anchor"));
            $("#mobile", data).attr("text-anchor", $("#mobile", cardDiv).attr("text-anchor"));
            $("#email", data).attr("text-anchor", $("#email", cardDiv).attr("text-anchor"));
            $("#website", data).attr("text-anchor", $("#website", cardDiv).attr("text-anchor"));
            $("#address1", data).attr("text-anchor", $("#address1", cardDiv).attr("text-anchor"));
            $("#address2", data).attr("text-anchor", $("#address2", cardDiv).attr("text-anchor"));

            var serializer = new XMLSerializer();
            svgCardData = serializer.serializeToString(data);
            removeWaitingOverlay();
            addWaitingOverlay();
            doPost("/updateImage", {type: "card", fileName: url, newSrc: svgCardData}, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    $('.clsRow' + frontChar + id).attr("style", "visibility: hidden");
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
    }

    function loadMoreCards(cards) {
        for (var i = 0; i < cards.length; i++) {
            addCardToTables(cards[i].id, cards[i].category_name, cards[i].s3_front_card_url, cards[i].s3_back_card_url);
        }
    }

    function addCardToTables(id, category_name, s3_front_card_url, s3_back_card_url) {
        var tr1 = '<tr>' +
            '<td class="col-md-3"><div style="text-align: left; overflow: visible" class="cardFrontPrev' + id + '"></td>' +
            '<td>' +
            '   <table id="innerTbl' + id + '">' +
            '       <tr>' +
            '           <td>Name: </td>' +
            '           <td><select class="cmbAlign cardRowFName' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '           <td class="clsRow' + id + '"><button class="btnFDef' + id + '">Same for rest</button></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>Designation: </td>' +
            '           <td><select class="cmbAlign cardRowFDesig' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>Phone: </td>' +
            '           <td><select class="cmbAlign cardRowFPhone' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>Email: </td>' +
            '           <td><select class="cmbAlign cardRowFEmail' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>Website: </td>' +
            '           <td><select class="cmbAlign cardRowFWeb' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>Adderess 1: </td>' +
            '           <td><select class="cmbAlign cardRowFAd1' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <td>Adderess 2: </td>' +
            '           <td><select class="cmbAlign cardRowFAd2' + id + '">' +
            '               <option value="start">Left</option>' +
            '               <option value="middle">Center</option>' +
            '               <option value="end">Right</option>' +
            '           </select></td>' +
            '           <td class="clsRowF' + id + '" rowspan="2" style="visibility: hidden"><button class="btnFSave' + id + '">Save</button></td>' +
            '       </tr>' +
            '   </table>' +
            '</td>';
        if (s3_back_card_url == null) {
            tr1 += "<td></td><td></td></tr>";
        } else {
            tr1 += '<td class="col-md-3"><div style="text-align: left; overflow: visible" class="cardBackPrev' + id + '"></td>' +
                '<td>' +
                '   <table id="innerTbl' + id + '">' +
                '       <tr>' +
                '           <td>Name: </td>' +
                '           <td><select class="cmbAlign cardRowBName' + id + '">' +
                '               <option value="start">Left</option>' +
                '               <option value="middle">Center</option>' +
                '               <option value="end">Right</option>' +
                '           </select></td>' +
                '           <td class="clsRow' + id + '"><button class="btnBDef' + id + '">Same for rest</button></td>' +
                '       </tr>' +
                '       <tr>' +
                '           <td>Designation: </td>' +
                '           <td><select class="cmbAlign cardRowBDesig' + id + '">' +
                '               <option value="start">Left</option>' +
                '               <option value="middle">Center</option>' +
                '               <option value="end">Right</option>' +
                '           </select></td>' +
                '       </tr>' +
                '       <tr>' +
                '           <td>Phone: </td>' +
                '           <td><select class="cmbAlign cardRowBPhone' + id + '">' +
                '               <option value="start">Left</option>' +
                '               <option value="middle">Center</option>' +
                '               <option value="end">Right</option>' +
                '           </select></td>' +
                '       </tr>' +
                '       <tr>' +
                '           <td>Email: </td>' +
                '           <td><select class="cmbAlign cardRowBEmail' + id + '">' +
                '               <option value="start">Left</option>' +
                '               <option value="middle">Center</option>' +
                '               <option value="end">Right</option>' +
                '           </select></td>' +
                '       </tr>' +
                '       <tr>' +
                '           <td>Website: </td>' +
                '           <td><select class="cmbAlign cardRowBWeb' + id + '">' +
                '               <option value="start">Left</option>' +
                '               <option value="middle">Center</option>' +
                '               <option value="end">Right</option>' +
                '           </select></td>' +
                '       </tr>' +
                '       <tr>' +
                '           <td>Adderess 1: </td>' +
                '           <td><select class="cmbAlign cardRowBAd1' + id + '">' +
                '               <option value="start">Left</option>' +
                '               <option value="middle">Center</option>' +
                '               <option value="end">Right</option>' +
                '           </select></td>' +
                '       </tr>' +
                '       <tr>' +
                '           <td>Adderess 2: </td>' +
                '           <td><select class="cmbAlign cardRowBAd2' + id + '">' +
                '               <option value="start">Left</option>' +
                '               <option value="middle">Center</option>' +
                '               <option value="end">Right</option>' +
                '           </select></td>' +
                '           <td class="clsRowB' + id + '" rowspan="2" style="visibility: hidden"><button class="btnBSave' + id + '">Save</button></td>' +
                '       </tr>' +
                '   </table>' +
                '</td>' +
                '</tr>';
        }
        $("#homePageCardTbl1").append(tr1);
        $('.cardFrontPrev' + id).show();
        $('.cardBackPrev' + id).hide();
        updateCardImage(id, '/getCardImage?id=' + s3_front_card_url + '&random=' + Math.random(), "F");
        if (s3_back_card_url != null) {
            updateCardImage(id, '/getCardImage?id=' + s3_back_card_url + '&random=' + Math.random(), "B");
        }
        var fn1 = function (e) {
            $('.clsRowF' + id).attr("style", "visibility: visible");
        };
        $(".btnFDef" + id).click(function (e) {
            e.preventDefault();
            var aln = $(".cardRowFName" + id).val();
            $(".cardRowFDesig" + id).val(aln);
            $(".cardRowFPhone" + id).val(aln);
            $(".cardRowFEmail" + id).val(aln);
            $(".cardRowFWeb" + id).val(aln);
            $(".cardRowFAd1" + id).val(aln);
            $(".cardRowFAd2" + id).val(aln);
            fn1();
        });
        $('.clsRowF' + id).click(function (e) {
            e.preventDefault();
            saveCard(id, s3_front_card_url, "F");
        });
        $('.cardRowFName' + id).change(fn1);
        $('.cardRowFDesig' + id).change(fn1);
        $('.cardRowFPhone' + id).change(fn1);
        $('.cardRowFEmail' + id).change(fn1);
        $('.cardRowFWeb' + id).change(fn1);
        $('.cardRowFAd1' + id).change(fn1);
        $('.cardRowFAd2' + id).change(fn1);
        var fn2 = function (e) {
            $('.clsRowB' + id).attr("style", "visibility: visible");
        }
        $(".btnBDef" + id).click(function (e) {
            e.preventDefault();
            var aln = $(".cardRowBName" + id).val();
            $(".cardRowBDesig" + id).val(aln);
            $(".cardRowBPhone" + id).val(aln);
            $(".cardRowBEmail" + id).val(aln);
            $(".cardRowBWeb" + id).val(aln);
            $(".cardRowBAd1" + id).val(aln);
            $(".cardRowBAd2" + id).val(aln);
            fn2();
        });
        $('.clsRowB' + id).click(function (e) {
            e.preventDefault();
            saveCard(id, s3_back_card_url, "B");
        });
        $('.cardRowBName' + id).change(fn2);
        $('.cardRowBDesig' + id).change(fn2);
        $('.cardRowBPhone' + id).change(fn2);
        $('.cardRowBEmail' + id).change(fn2);
        $('.cardRowBWeb' + id).change(fn2);
        $('.cardRowBAd1' + id).change(fn2);
        $('.cardRowBAd2' + id).change(fn2);
    }
});