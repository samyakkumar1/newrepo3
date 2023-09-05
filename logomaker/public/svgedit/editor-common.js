var parentObj;
var baseUrl;
var gridVisible = false;
var baseLogoImage = null;
var base_color1, base_color2, base_color3;
var isSvg = false;
var actualLogoUrl;
var actualBgUrl;

function initCommon(editorType) {

    function init() {
        ignoreSaveWarning();
        $("body").on("svgChanged", function () {
            if (parentObj.handleSvgChange) {
                parentObj.handleSvgChange();
            }
        });
        $(document).on("keydown", function (e) {
            if (e.which === 8 && !$(e.target).is("input, textarea")) {
                e.preventDefault();
            }
        });
        $("#btnAddText").off().click(function (e) {
            svgCanvas.setDefaultFontSize(13);
            addTextHard("Sample Text");
            e.stopPropagation();
        });
        $("#btnUndo").off().click(function (e) {
            if (svgCanvas.undoMgr.undo() == true) {
                populateLayers();
            } else {
                showToast("No Undo available");
                e.stopPropagation();
            }
            e.preventDefault();
        });
        $("#btnRepaint").off().click(function () {
            parentObj.repaint();
        });
        $("#btnRedo").off().click(function (e) {
            if (svgCanvas.undoMgr.redo() == true) {
                populateLayers();
            } else {
                showToast("No Redo available");
                e.stopPropagation();
            }
            e.preventDefault();
        });
        $("#comboFontSize").off().change(function (e) {
            $(svgCanvas.getSelectedElems()).attr("class", "");
            svgCanvas.setFontSize(parseInt(this.value));
            e.stopPropagation();
        });
        for (var i = 5; i <= 180; i++) {
            $("#comboFontSize").append("<option>" + i + "</option>");
        }
        var fonts = parentObj.getSupportedFonts();
        $("#preview").children().remove();
        for (var i = 0; i < fonts.length; i++) {
            var name;
            var value;
            if (typeof fonts[i] == "string") {
                name = fonts[i];
                value = fonts[i];
            } else {
                name = fonts[i].name;
                value = fonts[i].value;
            }
            $("#preview").append('<tr><td style="font-family:' + value + '" data-value="' + value + '" data-alias="' + fonts[i].aliases + '">' + name + '</td></tr>');
        }
        $("#preview td").off().mousedown(function (e) {
            $("#fontPreviewList").html($(this).text() + "<span class='fontArrow'></span>");
            $(svgCanvas.getSelectedElems()).attr("class", "");
            svgCanvas.setFontFamily($(this).attr("data-value"));
        });
        $("#previewHolder").hide();
        $("#fontPreviewList").off().click(function (e) {
            $("#previewHolder").show();
        });
        $("body").mousedown(function (e) {
            if (e.target !== $("#previewHolder")[0]) { /* for chrome scrollbar fix*/
                $("#previewHolder").hide();
            }
        });
        $("#previewHolder").mousemove(function (e) {
            e.stopPropagation();
        });

        $("#btnSelect").off().click(function (e) {
            svgCanvas.setMode('select');
            e.stopPropagation();
        });
        $("#unGroupBtn").off().click(function (e) {
            e.preventDefault();
            svgCanvas.ungroupSelectedElement();
            e.stopPropagation();
        });
        $("#groupBtn").off().click(function (e) {
            e.preventDefault();
            svgCanvas.groupSelectedElements();
            e.stopPropagation();
        });
        $("#btnDelete").off().click(function (e) {
            svgCanvas.deleteSelectedElements();
            e.stopPropagation();
        });
        $("#insertImageToolBar").off().change(function (e) {
            var files = this.files; //FileList object
            var output = document.getElementById("result");
            var file = files[0];
            if (!file.type.match('image')) {
                bootbox.alert("Please select an image");
            } else {
                var picReader = new FileReader();
                picReader.addEventListener("load", function (event) {
                    var picFile = event.target;
                    var imgObj = svgCanvas.selectorManager.selectors[0].selectedElement;
                    var items = svgCanvas.getSelectedElems();
                    var imageData = picFile.result;
                    var _fn = function () {
                        var height = $(imgObj).attr("height");
                        var width = $(imgObj).attr("width");
                        svgEditor.setImageURL(imageData);
                        if (imgObj.tagName != "image") {
                            imgObj.outerHTML = imgObj.outerHTML.replace(/use/g, "image")
                        }
                        addWaitingOverlay();
                        setTimeout(function () {
                            $(imgObj).attr("height", height);
                            $(imgObj).attr("width", width);
                            svgCanvas.clearSelection();
                            svgEditor.updateCanvas();
                            removeWaitingOverlay();
                        }, 10);
                    };
                    if (file.type == "image/png" || file.type == "image/gif") {
                        var img = new Image();
                        img.src = imageData;
                        img.onload = function () {
                            $("body").append("<canvas id='canvasTmpForTrasparancyFix'></canvas>");
                            var canvas = $('#canvasTmpForTrasparancyFix');
                            var ctx = canvas[0].getContext('2d');
                            canvas[0].width = img.width;
                            canvas[0].height = img.height;
                            ctx.fillStyle = '#fff';
                            ctx.fillRect(0, 0, canvas[0].width, canvas[0].height);
                            ctx.drawImage(img, 0, 0);
                            imageData = $('#canvasTmpForTrasparancyFix')[0].toDataURL("image/jpeg", 1.0);
                            $('#canvasTmpForTrasparancyFix').remove();
                            if (items[0].id == "logo" || $(items).find("svg").length > 0) {
                                if (typeof loadCard != "undefined") {
                                    var isSvg = file.type == "image/svg+xml";
                                    loadCard(undefined, imageData, false);
                                } else {
                                    _fn();
                                }
                            } else {
                                _fn();
                            }
                            $("#insertImageToolBar").val("");
                        };
                    } else {
                        _fn();
                    }
                });
                picReader.readAsDataURL(file);
            }
            e.stopPropagation();
        });
        $("#btnAddLogo").off().click(function (e) {
            bootbox.dialog({
                title: "Insert Image",
                message: 'Select Image: <input type="file" id="insertImage">',
                buttons: {
                    success: {
                        label: "OK",
                        className: "btn-success",
                        callback: function () {
                            fillImage();
                        }
                    }
                }
            });
            e.stopPropagation();
        });
        $("#view_grid_2").off().click(function (e) {
            var clickOnGridBtn = function (interval) {
                setTimeout(function () {
                    if (gridBtn) {
                        gridBtn();
                    } else {
                        clickOnGridBtn(interval + 100);
                    }
                }, interval);
            };
            clickOnGridBtn(0);
            e.stopPropagation();
        });
        $("#btnZoomIn").off().click(function (e) {
            var current_zoom = svgCanvas.getZoom();
            changeZoom({value: current_zoom + 5});
            e.stopPropagation();
        });
        $("#btnZoomOut").off().click(function (e) {
            var current_zoom = svgCanvas.getZoom();
            e.stopPropagation();
        });
        $("#colorPicker").off().change(function () {
            changeColor(this.jscolor);
        });
        $("#btnBigPreview").off().click(function (e) {
            debugger;
            getAsJPGDataUrl(1024, function (dataURI) {
                bootbox.dialog({
                    title: "Preview",
                    message: '<div align="center" ><img id="preview_img_div" src="' + dataURI + '" style="border: 1px solid #ccc"/> <span class="flip-card-template-new" ></span></div>',
                    buttons: {
                        success: {
                            label: "OK",
                            className: "btn-success"
                        }
                    }
                });

            });
            e.stopPropagation();
        });
        setTimeout(function () {
            if (!gridVisible) {
                $("#view_grid_2").click();
                gridVisible = true;
            }
            clearUndoRedo();
        }, 1024);

        if (editorType == "PLAIN") {
            var url = decodeURIComponent(getURLParameterByName("docUrl"));
            var type = decodeURIComponent(getURLParameterByName("type"));
            if (!type || type == "null") {
                type = "Card";
            }
            $("#btnSave").removeClass("hide");
            var _orginalUrl = url;
            loadImage("/getUser" + type + "Image?id=" + url + "&random=" + new Date().getTime(), function () {
                svgCanvas.zoomChanged(window, 'canvas');
                svgEditor.updateCanvas();
                clearUndoRedo();
                if (!gridVisible) {
                    $("#view_grid_2").click();
                    gridVisible = true;
                }
            });
            $("#btnSave").off().click(function () {
                doPost("/updateUser" + type + "File", {url: _orginalUrl, content: getSvgString()}, function (resp) {
                    bootbox.alert("File successfully saved")
                }, function (err) {
                    console.log(err);
                    bootbox.alert("Error updating file.");
                });
            });
            $("#btnReset").click(function (e) {
                bootbox.confirm("<b style='color: red'>Warning!!</b><hr/>Reset will clear all modified actions. <br/>You <b>can't</b> restore these changes later with Undo button.<br/><br/>Are you sure to want to reset?", function (result) {
                    if (result) {
                        resetImage();
                    }
                });
            });
        } else {
            $(window).resize(function (e) {
                svgCanvas.clearSelection();
                svgCanvas.zoomChanged(window, 'canvas');
                if (typeof fixZoom != "undefined") {
                    fixZoom();
                }
            });
        }

        if (editorType == "LOGO" || editorType == "BC") {
            $("#btnPreview").off().click(function (e) {
                getAsJPGDataUrl(300, function (dataURI) {
                    bootbox.dialog({
                        title: "Preview",
                        message: '<div align="center" ><img id="preview_img_div" src="' + dataURI + '" style="border: 1px solid #ccc"/> <span class="flip-card-template-new" ></span></div>',
                        buttons: {
                            success: {
                                label: "OK",
                                className: "btn-success"
                            }
                        }
                    });
                });
                e.stopPropagation();
            });
        } else {
            $("#btnPreview").off().click(function (e) {
                getAsJPGDataUrl(300, function (dataURI) {
                    var dialog = bootbox.dialog({
                        title: "Preview",
                        message: '<div align="center"><iframe style="border: none" id="zoomPreviewDiv" src="/product-preview/big-preview.html"></iframe><span class="flip-card-template-new" ></span></div>',
                        buttons: {
                            success: {
                                label: "OK",
                                className: "btn-success"
                            }
                        },
                        show: false
                    });
                    dialog.on("shown.bs.modal", function() {  
                        var newWindow = $("#zoomPreviewDiv")[0].contentWindow;
                        var _fn = function (){ 
                            newWindow.initScalablePreview($, parentObj.frontImage, dataURI, parentObj.frontParams, false, undefined, window);
                        }
                        if (newWindow.initScalablePreview){ 
                            window.addEventListener("message", function (event) {
                                $("#zoomPreviewDiv").height(event.data.height);
                                $("#zoomPreviewDiv").width(event.data.width);
                            }, false);
                            _fn();
                        } else {
                            newWindow.addEventListener("load", _fn, false);
                        }
                    });
                    dialog.modal("show");
                });
                e.stopPropagation();
            });
        }
        if (editorType == "LOGO") {
            // do not write off here.
            $("#text").keyup(function (e) {
                e.preventDefault();
                changeText(true);
                e.stopPropagation();
            });
            $("#applyCompanySlogan").off().click(function (e) {
                e.preventDefault();
                $("#company-name", parentObj.document).val($("#companyName").val());
                $("#company-tagline", parentObj.document).val($("#sloganName").val());
                fillCompanyAndSloganNames($("#companyName").val(), $("#sloganName").val());
                e.stopPropagation();
            });
            $("#btnReset").off().click(function (e) {
                bootbox.confirm("<b style='color: red'>Warning!!</b><hr/>Reset will clear all modified actions. <br/>You <b>can't</b> restore these changes later with Undo button.<br/><br/>Are you sure to want to reset?", function (result) {
                    if (result) {
                        svgCanvas.clear();
                        loadImage(baseUrl, function () {
                            fillCompanyAndSloganNames($("#company-name", parentObj.document).val(), $("#company-tagline", parentObj.document).val());
                        });
                    }
                });
                e.stopPropagation();
            });
        } else if (editorType == "BC") {
            $("#btnReset").click(function (e) {
                bootbox.confirm("<b style='color: red'>Warning!!</b><hr/>Reset will clear all modified actions. <br/>You <b>can't</b> restore these changes later with Undo button.<br/><br/>Are you sure to want to reset?", function (result) {
                    if (result) {
                        resetImage();
                    }
                });
            });
            $("#text").keyup(function (e) {
                e.preventDefault();
                changeText(false);
            });
            $("#btnUndo,#btnRedo").click(function (e) {
                syncText();
                e.stopPropagation();
                e.preventDefault();
            });
        } else {
            var step = 10;
            $("#zoomIn").click(function () {
                changeZoom({value: (svgCanvas.getZoom() * 100) + step});
            });
            ;
            $("#zoomOut").click(function () {
                changeZoom({value: (svgCanvas.getZoom() * 100) - step});
            });
            $("#btnReset").click(function (e) {
                bootbox.confirm("<b style='color: red'>Warning!!</b><hr/>Reset will clear all modified actions. <br/>You <b>can't</b> restore these changes later with Undo button.<br/><br/>Are you sure to want to reset?", function (result) {
                    if (result) {
                        resetOtherProductImage();
                    }
                });
            });
        }
    }

    function resetOtherProductImage() {
        if (baseUrl) {
            loadImage(baseUrl, undefined, undefined, true);
        } else {
            loadOtherProductImage(actualLogoUrl, actualBgUrl);
        }
    }

    function fillImage(url) {
        if (window.File && window.FileList && window.FileReader) {
            var filesInput = document.getElementById("insertImage");
            var file = filesInput.files[0];
            if (file) {
                var output = document.getElementById("result");
                if (!file.type.match('image')) {
                    bootbox.alert("Please select an image");
                } else {
                    var picReader = new FileReader();
                    picReader.addEventListener("load", function (event) {
                        var picFile = event.target;
                        svgCanvas.embedImage(picFile.result, function (data) {
                            var shape = svgCanvas.addSvgElementFromJson({
                                element: 'image',
                                attr: {
                                    x: 10,
                                    y: 10,
                                    height: "100px",
                                    width: "100px",
                                    "xlink:href": data
                                }
                            });
                            svgCanvas.addCommandToHistory(new svgedit.history.InsertElementCommand(shape));
                        });
                    });
                    picReader.readAsDataURL(file);
                }
            } else {
                showToast("No files selected");
            }
        } else {
            bootbox.alert("Your browser does not support File API");
        }
    }

    function changeColor(color) {
        $(svgCanvas.getSelectedElems()).attr("class", "");
        svgCanvas.getSelectedElems().forEach(function (val, idx) {
            if (val != null) {
                removeStyles(val);
            }
        });
        svgCanvas.setColor('fill', "#" + color);
    }

    function removeStyles(el) {
        el.removeAttribute('class');

        if (el.childNodes.length > 0) {
            for (var child in el.childNodes) {
                /* filter element nodes only */
                if (el.childNodes[child].nodeType == 1)
                    removeStyles(el.childNodes[child]);
            }
        }
    }

    function clearUndoRedo() {
        svgCanvas.undoMgr.resetUndoStack()
    }

    init();
}

function saveAction(containInnerSvg, callback) {
    ignoreSaveWarning();
    getAsJPGDataUrl(300, function (dataURI) {
        callback(dataURI);
    });
}

function loadSVGData(data, callback, dontResize) {
    if (!dontResize) {
        $(":eq(0)", data).attr("height", 100);
        $(":eq(0)", data).attr("width", 100);
    }
    if (typeof data != "string") {
        var serializer = new XMLSerializer();
        data = ieSVGFix(serializer.serializeToString(data));
    }
    setSVGString(data);
    if (callback != undefined) {
        callback();
    }
    svgCanvas.undoMgr.undoStack = [];
    svgCanvas.undoMgr.undoStackPointer = -1;
}

function ignoreSaveWarning() {
    svgEditor.showSaveWarning = false;
}

function setSVGString(svg) {
    $("#svg_editor").show();
    svgCanvas.clear();
    svgCanvas.setSvgString(svg);
    svgCanvas.zoomChanged(window, 'canvas');
    insertFonts();
}

function getSvgString() {
    var svg = $(svgCanvas.getSvgString());
    svg.attr("viewBox", "0 0 " + svgCanvas.getResolution().w + " " + svgCanvas.getResolution().h);
    var serializer = new XMLSerializer();
    var svgData = ieSVGFix(serializer.serializeToString(svg.get()[0]));
    return oldSafariFix(svgData);
}

function setParent(parent_win) {
    parentObj = parent_win;
}

function setBaseImageUrl(url) {
    baseUrl = url;
}

function addTextHard(text, callback) {
    var id = svgCanvas.getNextId();
    var sum = 0;
    var i = 1;
    $('text').each(function (idx, val) {
        var num = parseFloat($(val).attr("font-size"));
        if ($.isNumeric(num)) {
            sum += num;
            i++;
        }
    });
    var fontSixe = (sum / i);
    if (fontSixe <= 9) {
        fontSixe = 9;
    }
    var shape = svgCanvas.addSvgElementFromJson({
        element: 'text',
        attr: {
            x: 20,
            y: 20,
            id: id,
            "font-family": "Times",
            class: "customText",
            "font-size": fontSixe + "px",
            style: 'pointer-events:inherit'
        }
    });
    svgCanvas.addCommandToHistory(new svgedit.history.InsertElementCommand(shape));
    $("#" + id).text(text);
    if (callback != undefined) {
        callback(id);
    }
}

function insertFonts() {
    $("font", "#svgcontent").remove();
    $("#fonts", "#svgcontent").remove();
    $("style[type='text/css']", "#svgcontent").remove();
    /*
     if ($("defs", "#svgcontent").length > 0) {
     $("defs", "#svgcontent").append("<style></style>");//$("#allFonts", parentObj.document).html());
     } else {
     $("#svgcontent").append("<defs>" + $("#allFonts", parentObj.document).html() + "</defs>");
     }
     */
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "style");
    svg.innerHTML = $("#allFonts", parentObj.document).html();
    var node;
    var childs = svg.childNodes;
    for (var i = 0; i < childs.length; i++) {
        if (childs[i].tagName == "style") {
            node = childs[i];
            break;
        }
    }
    if ($("defs", "#svgcontent").length > 0) {
        $("defs", "#svgcontent").append(node);
    } else {
        var def = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        def.appendChild(node);
        $("#svgcontent").append(def);
    }
}

function getAsJPGDataUrl(width, callback) {
    var svgStr = $(svgCanvas.getSvgString());
    var resolution = svgCanvas.getResolution();
    var ratio = resolution.w / resolution.h;
    if (ratio < 1) {
        svgStr.attr("height", width * ratio);
    } else {
        svgStr.attr("height", width / ratio);
    }
    svgStr.attr("width", width);
    svgStr.attr("viewBox", "0 0 " + resolution.w + " " + resolution.h);
    svgStr.attr("style", 'stroke-width: 0px; background-color: blue;');

    var serializer = new XMLSerializer();
    var svgData = oldSafariFix(ieSVGFix(serializer.serializeToString(svgStr[0])));
    if ($('#export_canvas').length) {
        $('#export_canvas').remove();
    }
    $('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
    var c = $('#export_canvas')[0];
    try {
        canvg(c, svgData, {
            renderCallback: function () {
                var datauri = c.toDataURL('image/png');
                callback(datauri);
            }
        });
    } catch (err) {
        console.log(err);
        addWaitingOverlay();
        doPost("/generateImage", {
            type: "card",
            width: 200,
            height: 100,
            quality: 50,
            format: "jpeg",
            data: svgData
        }, function (resp) {
            removeWaitingOverlay();
            callback(resp);
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
            showToast("Image preview is not supported in this browser.");
            callback();
        });
    }
}

function oldSafariFix(svgData) {
    while (svgData.indexOf(" href=") > -1) {
        svgData = svgData.replace(' href=', ' xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href=');
    }
    return svgData;
}

function updateLogoColors(logoDom) {
    var color1 = $("#Color1", logoDom);
    var color2 = $("#Color2", logoDom);
    var color3 = $("#Color3", logoDom);
    if (color1) {
        setFillColor("#color1", color1);
        base_color1 = color1;
    } else {
        base_color1 = undefined;
    }
    if (color2) {
        setFillColor("#color2", color2);
        base_color2 = color2;
    } else {
        base_color2 = undefined;
    }
    if (color3) {
        setFillColor("#color3", color3);
        base_color3 = color3;
    } else {
        base_color3 = undefined;
    }
}

function loadCard(url, logoUrl, isSvgFormat, callback) {
    if (url) {
        setBaseImageUrl(url);
    }
    isSvg = isSvgFormat;
    baseLogoImage = logoUrl;
    var _logoLoaded = function (logo) {
        var _loadCard = function (card) {
            var _cardLoaded = function () {
                if (logo) {
                    var original = $("#svgcontent #logo");
                    var pos = {
                        x: original.attr("x"),
                        y: original.attr("y"),
                        height: original.attr("height"),
                        width: original.attr("width")
                    };
                    if (!pos.x) {
                        pos = original[0].getBBox();
                    }
                    if (original.length > 0) {
                        original.remove();
                        svgCanvas.removeUnusedDefElems();
                        var transform = original.attr("transform");
                        if (isSvgFormat) {
                            svgCanvas.importSvgString(logo, {
                                id: "logo",
                                pos: pos,
                                transform: transform
                            }, pos);
                            updateLogoColors(logo);
                        } else {
                            var obj = {
                                x: pos.x,
                                y: pos.y,
                                width: pos.width,
                                height: pos.height,
                                id: 'logo',
                                "xlink:href": logo
                            };
                            if (transform) {
                                obj.transform = transform;
                            }
                            var shape = svgCanvas.addSvgElementFromJson({
                                element: 'image',
                                attr: obj
                            });
                            svgCanvas.addCommandToHistory(new svgedit.history.InsertElementCommand(shape));
                        }
                        svgedit.transformlist.resetListMap();
                    }
                }
                callback ? callback() : $.noop();
            };
            if (card) {
                loadSVGData(card, function () {
                    fixZoom();
                    _cardLoaded();
                });
            } else {
                _cardLoaded();
            }
        };
        if (url) {
            if (url.indexOf("<svg") == 0) {
                _loadCard($(url)[0]);
            } else {
                doGet(url, {}, function (data) {
                    _loadCard(data);
                }, function (err) {
                    console.log(err);
                    showToast("Connection Error: Can't load card");
                }, "text/plain");
            }
        } else {
            _loadCard(undefined);
        }
    };
    if (logoUrl && isSvgFormat) {
        if (logoUrl.indexOf("logo_") >= 0) {
            _logoLoaded(retrieveJson(logoUrl));
        } else if (logoUrl.indexOf("<svg") >= 0) {
            _logoLoaded(logoUrl);
        } else {
            doGet("/getUserLogoImage?id=" + logoUrl + "&type=" + encodeURIComponent("text/plain"), undefined, function (data) {
                _logoLoaded(data);
            }, function (err) {
                _logoLoaded(undefined);
                console.log(err);
                showToast("Connection Error: Can't load logo for card");
            });
        }
    } else {
        _logoLoaded(logoUrl);
    }
}

function resetImage() {
    loadCard(baseUrl, baseLogoImage, isSvg, function () {
        parentObj.executeKeyUps();
    });
}

function syncText() {
    if (parentObj.changeTextOfThis) {
        parentObj.changeTextOfThis("#cardAL2", $("#address2").text());
        parentObj.changeTextOfThis("#cardAL1", $("#address1").text());
        parentObj.changeTextOfThis("#cardPhone", $("#mobile").text());
        parentObj.changeTextOfThis("#cardEmail", $("#email").text());
        parentObj.changeTextOfThis("#cardWebSite", $("#website").text());
        parentObj.changeTextOfThis("#cardTitle", $("#designation").text());
        parentObj.changeTextOfThis("#cardName", $("#name").text());
    }
}

function fixZoom() {
    changeZoom({value: 220});
}

function changeText(isLogoEditor) {
    if (isLogoEditor) {
        var selected = $(svgCanvas.getSelectedElems()[0]);
        switch (selected.attr("id")) {
            case "Company_Name" :
            {
                $("#company-name", parentObj.document).val($("#text").val());
                break;
            }
            case "Tagline" :
            {
                $("#company-tagline", parentObj.document).val($("#text").val());
                break;
            }
        }
    } else if (parentObj.changeTextOfThis) {
        var id;
        var selected = $(svgCanvas.getSelectedElems()[0]);
        switch (selected.attr("id")) {
            case "name" :
            {
                id = "#cardName";
                break;
            }
            case "designation" :
            {
                id = "#cardTitle";
                break;
            }
            case "website" :
            {
                id = "#cardWebSite";
                break;
            }
            case "email" :
            {
                id = "#cardEmail";
                break;
            }
            case "mobile" :
            {
                id = "#cardPhone";
                break;
            }
            case "address1" :
            {
                id = "#cardAL1";
                break;
            }
            case "address2" :
            {
                id = "#cardAL2";
                break;
            }
            default :
            {
                console.log(selected_id);
                id = "#" + selected.attr("id");
                break;
            }
        }
        parentObj.changeTextOfThis(id, $("#text").val());
    }
}

function setFillColor(id, srcElement) {
    if (srcElement.length > 0 && $(id).length > 0) {
        var color = getColor(srcElement[0]);
        if (color != null) {
            if ($(id)[0].nodeName == "g") {
                $(id).each(function (idx, val) {
                    if (val.nodeName == "g") {
                        applyColorToGroupElement($(val).children(), color)
                    } else {
                        $(id).attr("fill", color);
                        $(id).removeAttr("class");
                        $(id).css("fill", $(id).attr("fill"));
                    }
                });
            } else {
                $(id).attr("fill", color);
                $(id).removeAttr("class");
                $(id).css("fill", $(id).attr("fill"));
            }
        }
    }
}

function getLogoImage() {
    return {
        image: baseLogoImage,
        isSvg: isSvg
    };
}

function updateText(id, new_val, def_val) {
    if (new_val.length <= 0) {
        new_val = def_val;
    }
    if ($("#" + id).text() != new_val) {
        if (svgCanvas.getElem(id) != null) {
            var cmd = new svgedit.history.ChangeElementCommand(svgCanvas.getElem(id), {"#text": $("#" + id).text()}, {"#text": new_val});
            svgCanvas.undoMgr.addCommandToHistory(cmd);
        }
        $("#" + id).text(new_val);
        svgCanvas.clearSelection();
        svgCanvas.setMode("select");
    }
}

function setCardName(val) {
    updateText("name", val, "Name");
}

function setCardTitle(val) {
    updateText("designation", val, "Designation");
}
function setCardWebSite(val) {
    updateText("website", val, "Website");
}
function setCardEmail(val) {
    updateText("email", val, "Email");
}
function setCardPhone(val) {
    updateText("mobile", val, "Phone Number");
}
function setCardAL1(val) {
    updateText("address1", val, "Address Line 1");
}
function setCardAL2(val) {
    updateText("address2", val, "Address Line 2");
}
function addText(val) {
    $("#btnAddText").click();
}
function replaceText(id, text) {
    $("#" + id).text(text);
}
function getCustomTexts() {
    var texts = $(".customText");
    return texts;
}

function fillCompanyAndSloganNames(comp, slogan) {
    $("#companyName").val(comp);
    $("#sloganName").val(slogan);
    $("#Company_Name").text(comp);
    $("#Tagline").text(slogan);
}

function loadImage(url, callback, always, dontResize) {
    setBaseImageUrl(url);
    if (url.indexOf("logo_") == 0) {
        loadSVGData($(retrieveJson(url).url)[0], callback, dontResize);
        if (always != undefined) {
            always();
        }
    } else {
        $.get(url, function (data, resp) {
            loadSVGData(data, callback, dontResize);
        }).always(function () {
            if (always != undefined) {
                always();
            }
        });
    }
}

function loadOtherProductImage(logoUrl, backgroundUrl) {
    actualLogoUrl = logoUrl;
    actualBgUrl = backgroundUrl;
    var _logoLoaded = function (logo) {
        $.get("/img/blank-other-product.svg", function (resp) {
            svgCanvas.setSvgString(resp);
            setTimeout(function () {
                var _addLogo = function (hasDesign) { 
                    var res = svgCanvas.getResolution();
                    var step = (res.w > res.h ? res.h : res.w);
                    var pos, transform;
                    if (hasDesign){ 
                        pos = {
                            x: -470,
                            y: 165,
                            /*width: 100,
                            height: 100*/
                        };
                        transform = "matrix(0.4689016632777691,0,0,0.4689016632777691,281.0022308026677,207.2893102990534) ";
                    } else {
                        pos = {
                            x: (res.w / 2) - (step / 2),
                            y: (res.h / 2) - (step / 2),
                            width: step,
                            height: step
                        };
                    }
                    svgCanvas.removeUnusedDefElems();
                    if (logo.indexOf("data:") == 0) {
                        svgCanvas.addSvgElementFromJson({
                            element: 'image',
                            attr: {
                                id: "logo",
                                x: pos.x,
                                y: pos.y,
                                height: pos.height,
                                width: pos.width,
                                transform: transform,
                                "xlink:href": logo
                            }
                        });
                    } else {
                        svgCanvas.importSvgString(logo, {
                            id: "logo",
                            transform: transform,
                            pos: pos
                        });
                    }
                }
                if (backgroundUrl) {
                    svgCanvas.embedImage(backgroundUrl, function (data, img) {
                        svgCanvas.setResolution(img.width, img.height);
                        _addLogo(true);
                        var elem = svgCanvas.addSvgElementFromJson({
                            element: 'image',
                            attr: {
                                id: "product-design",
                                x: 0,
                                y: 0,
                                height: img.height,
                                width: img.width,
                                "xlink:href": data
                            }
                        });
                        $(elem).insertBefore("#logo");//"#svgcontent>defs");
                        setTimeout(function () {
                            $("body").trigger("svgChanged");
                            svgCanvas.zoomChanged(window, 'canvas');
                            svgEditor.updateCanvas();
                            insertFonts();
                        }, 100);
                    });
                } else {
                    setTimeout(function () {
                        $("body").trigger("svgChanged");
                        parentObj.getDesignSize(function (height, width){
                            if (height){
                                svgCanvas.setResolution(width, height);
                            } else { 
                                var res = svgCanvas.getResolution();
                                var step = (res.w > res.h ? res.h : res.w); 
                                svgCanvas.setResolution(step, step);
                            }
                            svgCanvas.zoomChanged(window, 'canvas');
                            svgEditor.updateCanvas();
                            _addLogo(false);
                            insertFonts();
                        });
                    }, 100);
                }
            }, 1000);
        }, "text");
    };
    if (logoUrl) {
        if (logoUrl.indexOf("logo_") >= 0) {
            _logoLoaded(retrieveJson(logoUrl));
        } else if (logoUrl.indexOf("data:") == 0) {
            _logoLoaded(logoUrl);
        } else if (logoUrl.indexOf("<svg") >= 0) {
            _logoLoaded(logoUrl);
        } else {
            doGet(logoUrl + "&type=" + encodeURIComponent("text/plain"), undefined, function (data) {
                _logoLoaded(data);
            }, function (err) {
                _logoLoaded(undefined);
                showToast("Connection Error: Can't load logo for this product");
                console.log(err);
            });
        }
    } else {
        showToast("No logos selected. Please go back and choose a logo.");
    }
}
