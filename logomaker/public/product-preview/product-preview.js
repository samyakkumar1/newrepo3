var $;
var parent;

var console = {};
console.log = function(str){
return;
}

function initMagnify(jQuery) {
    (function ($) {
        $.fn.magnify = function (oOptions) {

            var oSettings = $.extend({
                /* Default options */
                speed: 100,
                timeout: -1,
                onload: function () {}
            }, oOptions),
                    init = function (el) {
                        // Initiate
                        var $image = $(el),
                                $anchor = $image.closest('a'),
                                $container,
                                $lens,
                                oContainerOffset,
                                nContainerWidth,
                                nContainerHeight,
                                nImageWidth,
                                nImageHeight,
                                nLensWidth,
                                nLensHeight,
                                nMagnifiedWidth = 0,
                                nMagnifiedHeight = 0,
                                sImgSrc = $image.attr('data-magnify-src') || oSettings.src || $anchor.attr('href') || '',
                                hideLens = function () {
                                    if ($lens.is(':visible'))
                                        $lens.fadeOut(oSettings.speed, function () {
                                            $('html').removeClass('magnifying'); // Reset overflow
                                        });
                                };
                                console.log("sImgSrc: ",sImgSrc)
                        // Disable zooming if no valid zoom image source
                        //if (!sImgSrc)
                          //  return;

                        // Activate magnification:
                        // 1. Try to get zoom image dimensions
                        // 2. Proceed only if able to get zoom image dimensions OK

                        // [1] Calculate the native (magnified) image dimensions. The zoomed
                        // version is only shown after the native dimensions are available. To
                        // get the actual dimensions we have to create this image object.
                        function hello(){
                            alert("hi");
                        }
                        var elImage = new Image();
                        $(elImage).on({
                            load: function () {

                                
                                // [2] Got image dimensions OK

                                // Fix overlap bug at the edges during magnification
                                $image.css('display', 'block');
                                // Create container div if necessary
                                if (!$image.parent('.magnify').length) {
                                    $image.wrap('<div class="magnify" onmouseover="hello()"></div>');
                                }
                                $container = $image.parent('.magnify');
                                // Create the magnifying lens div if necessary
                                if ($image.prev('.magnify-lens').length) {
                                    $container.children('.magnify-lens').css('background-image', 'url(\'' + sImgSrc + '\')');
                                } else {
                                    $image.before('<div class="magnify-lens loading" style="background:url(\'' + sImgSrc + '\') repeat 0 0"></div>');
                                }
                                $lens = $container.children('.magnify-lens');
                                // Remove the "Loading..." text
                                $lens.removeClass('loading');
                                // This code is inside the .load() function, which is important.
                                // The width and height of the object would return 0 if accessed
                                // before the image is fully loaded.
                                nMagnifiedWidth = elImage.width;
                                nMagnifiedHeight = elImage.height;
                                // Cache offset and dimensions for improved performance
                                oContainerOffset = $container.offset();
                                nContainerWidth = $container.width();
                                nContainerHeight = $container.height();
                                nImageWidth = $image.width();
                                nImageHeight = $image.height();
                                nLensWidth = $lens.width();
                                nLensHeight = $lens.height();
                                // Store dimensions for mobile plugin
                                $image.data('zoomSize', {
                                    width: nMagnifiedWidth,
                                    height: nMagnifiedHeight
                                });
                                // Clean up
                                elImage = null;
                                // Execute callback
                                oSettings.onload();
                                // Handle mouse movements
                                setTimeout(function(){
                                    alert(1)
                                },2000)
                                $container.on('mousemove touchmove', function (e) {
                               // $container[0].on('mouseover', function (e) {
                                    alert(1)
                                    //e.preventDefault();
                                    // x/y coordinates of the mouse pointer or touch point
                                    // This is the position of .magnify relative to the document.
                                    //
                                    // We deduct the positions of .magnify from the mouse or touch
                                    // positions relative to the document to get the mouse or touch
                                    // positions relative to the container (.magnify).
                                    var nX = (e.pageX || e.originalEvent.touches[0].pageX) - oContainerOffset.left,
                                            nY = (e.pageY || e.originalEvent.touches[0].pageY) - oContainerOffset.top;
                                    // Toggle magnifying lens
                                    if (!$lens.is(':animated')) {
                                        if (nX < nContainerWidth && nY < nContainerHeight && nX > 0 && nY > 0) {
                                            if ($lens.is(':hidden')) {
                                                $('html').addClass('magnifying'); // Hide overflow while zooming
                                                $lens.fadeIn(oSettings.speed);
                                            }
                                        } else {
                                            hideLens();
                                        }
                                    }
                                    if ($lens.is(':visible')) {
                                        // Move the magnifying lens with the mouse
                                        var nPosX = nX - nLensWidth / 2,
                                                nPosY = nY - nLensHeight / 2;
                                        if (nMagnifiedWidth && nMagnifiedHeight) {
                                            // Change the background position of .magnify-lens according
                                            // to the position of the mouse over the .magnify-image image.
                                            // This allows us to get the ratio of the pixel under the
                                            // mouse pointer with respect to the image and use that to
                                            // position the large image inside the magnifying lens.
                                            var nRatioX = Math.round(nX / nImageWidth * nMagnifiedWidth - nLensWidth / 2) * -1,
                                                    nRatioY = Math.round(nY / nImageHeight * nMagnifiedHeight - nLensHeight / 2) * -1,
                                                    sBgPos = nRatioX + 'px ' + nRatioY + 'px';
                                        }
                                        // Now the lens moves with the mouse. The logic is to deduct
                                        // half of the lens's width and height from the mouse
                                        // coordinates to place it with its center at the mouse
                                        // coordinates. If you hover on the image now, you should see
                                        // the magnifying lens in action.
                                        $lens.css({
                                            top: Math.round(nPosY) + 'px',
                                            left: Math.round(nPosX) + 'px',
                                            backgroundPosition: sBgPos || ''
                                        });
                                    }
                                });

                                // Prevent magnifying lens from getting "stuck"
                                $container.mouseleave(hideLens);
                                if (oSettings.timeout >= 0) {
                                    $container.on('touchend', function () {
                                        setTimeout(hideLens, oSettings.timeout);
                                    });
                                }
                                // Ensure lens is closed when tapping outside of it
                                $('body').not($container).on('touchstart', hideLens);

                                if ($anchor.length) {
                                    // Make parent anchor inline-block to have correct dimensions
                                    $anchor.css('display', 'inline-block');
                                    // Disable parent anchor if it's sourcing the large image
                                    if ($anchor.attr('href') && !($image.attr('data-magnify-src') || oSettings.src)) {
                                        $anchor.click(function (e) {
                                            e.preventDefault();
                                        });
                                    }
                                }

                            },
                            error: function () {
                                // Clean up
                                elImage = null;
                            }
                        });

                        elImage.src = sImgSrc;
                    };

            return this.each(function () {
                init(this);
            });

        };
    }(jQuery));
    (function ($) {
        // Ensure this is loaded after jquery.magnify.js
        if (!$.fn.magnify)
            return;
        // Add required CSS
        $('<style>' +
                '.lens-mobile {' +
                'position:fixed;' +
                'top:0;' +
                'left:0;' +
                'width:100%;' +
                'height:100%;' +
                'background:#ccc;' +
                'display:none;' +
                'overflow:scroll;' +
                '-webkit-overflow-scrolling:touch;' +
                '}' +
                '.magnify-mobile>.close {' +
                'position:fixed;' +
                'top:10px;' +
                'right:10px;' +
                'width:32px;' +
                'height:32px;' +
                'background:#333;' +
                'color:#fff;' +
                'display:inline-block;' +
                'font:normal bold 20px sans-serif;' +
                'line-height:32px;' +
                'opacity:0.8;' +
                'text-align:center;' +
                '}' +
                '@media only screen and (min-device-width:320px) and (max-device-width:773px) {' +
                '/* Assume QHD (1440 x 2560) is highest mobile resolution */' +
                '.lens-mobile { display:block; }' +
                '}' +
                '</style>').appendTo('head');
        // Ensure .magnify is rendered
        $(window).load(function () {
            $('body').append('<div class="magnify-mobile"><div class="lens-mobile"></div></div>');
            var $lensMobile = $('.lens-mobile');
            // Only enable mobile zoom on smartphones
            if ($lensMobile.is(':visible') && !!('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch) || navigator.msMaxTouchPoints)) {
                var $magnify = $('.magnify'),
                        $magnifyMobile = $('.magnify-mobile');
                // Disable desktop magnifying lens
                $magnify.off();
                // Initiate mobile zoom
                // NOTE: Fixed elements inside a scrolling div have issues in iOS, so we
                // need to insert the close icon at the same level as the lens
                $magnifyMobile.hide().append('<i class="close">&times;</i>');
                // Hook up event handlers
                $magnifyMobile.children('.close').on('touchstart', function () {
                    $magnifyMobile.toggle();
                });
                $magnify.children('img').on({
                    touchend: function () {
                        // Only execute on tap
                        if ($(this).data('drag'))
                            return;
                        var oScrollOffset = $(this).data('scrollOffset');
                        $magnifyMobile.toggle();
                        // Zoom into touch point
                        $lensMobile.scrollLeft(oScrollOffset.x);
                        $lensMobile.scrollTop(oScrollOffset.y);
                    },
                    touchmove: function () {
                        // Set drag state
                        $(this).data('drag', true);
                    },
                    touchstart: function (e) {
                        // Render zoom image
                        // NOTE: In iOS background-image is url(...), not url("...")
                        $lensMobile.html('<img src="' + $(this).prev('.magnify-lens').css('background-image').replace(/url\(["']?|["']?\)/g, '') + '" alt="">');
                        // Determine zoom position
                        var $magnifyImage = $(this),
                                oZoomSize = $magnifyImage.data('zoomSize'),
                                nX = e.originalEvent.touches[0].pageX - $magnifyImage.offset().left,
                                nXPct = nX / $magnifyImage.width(),
                                nY = e.originalEvent.touches[0].pageY - $magnifyImage.offset().top,
                                nYPct = nY / $magnifyImage.height();
                        // Store scroll offsets
                        $magnifyImage.data('scrollOffset', {
                            x: (oZoomSize.width * nXPct) - (window.innerWidth / 2),
                            y: (oZoomSize.height * nYPct) - (window.innerHeight / 2)
                        });
                        // Reset drag state
                        $(this).data('drag', false);
                    }
                });
            }
        });
    }(jQuery));
}

function init(jQuery, parentObj) {
    console.log("hi")
    $ = function (selector) {
        return jQuery(selector, document);
    };
    initMagnify(jQuery);
    parent = parentObj;
    var sub_width = 0;
	var sub_height = 0;
    $(".zoom-area").mousemove(function(e){
        if(!sub_width && !sub_height)
        {
            var image_object = new Image();
            image_object.src = $(".small").attr("src");
            sub_width = image_object.width;
            sub_height = image_object.height;
        }
        else
        {
            var magnify_position = $(this).offset();

            var mx = e.pageX - magnify_position.left;
            var my = e.pageY - magnify_position.top;
            
            if(mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0)
            {
                $(".large").fadeIn(100);
            }
            else
            {
                $(".large").fadeOut(100);
            }
            if($(".large").is(":visible"))
            {
                var rx = Math.round(mx/$(".small").width()*sub_width - $(".large").width()/2)*-1;
                var ry = Math.round(my/$(".small").height()*sub_height - $(".large").height()/2)*-1;

                var bgp = rx + "px " + ry + "px";
                
                var px = mx - $(".large").width()/2;
                var py = my - $(".large").height()/2;

                $(".large").css({left: px, top: py, backgroundPosition: bgp});
            }
        }
    })
} 
function initScalablePreview($, img, logo, params, disableMagnify, outerHeight, callingWin) {
    var _generateCanvasImage = function () {
        if (!disableMagnify) {
            console.log('!disableMagnify was invoked!');
            var interval = setInterval(function () {
                if (this.$("#previewDiv").size() > 0) {
                    this.$("#previewDiv").show();
                    html2canvas(this.$("#previewDiv"), {
                        onrendered: function (canvas) {
                            document.body.appendChild(canvas);
                            window.$("#previewDiv").hide();
                            var dataUrl = canvas.toDataURL("image/png"); 
                            window.$("#img-out").attr("src", dataUrl);
                            window.$("#img-out").attr("data-magnify-src", dataUrl);
                            document.body.removeChild(canvas);
                            var actualWidth = window.$("#img-out").innerWidth();
                            var actualHeight = window.$("#img-out").innerHeight();
                            window.$('.zoom').magnify({
                                zoom: 50
                            });
                            if (callingWin){ 
                                callingWin.postMessage({height: actualHeight, width: actualWidth}, location.protocol + "//" + location.host);
                            } else {
                                window.resizeTo(actualWidth, actualHeight);
                                $(window).on('resize', function () {
                                    window.resizeTo(actualWidth, actualHeight + 50); 
                                }); 
                            }
                        },
                        width: window.$("#canvasBgFront").width(),
                        height: window.$("#canvasBgFront").height() 
                    });
                    clearInterval(interval);
                }
            }, 100);
        }
    };
    init($);
    setImage(img);
    console.log("Params",params);
    if (disableMagnify) {
        console.log('No I was invoked!');
        $("#previewDiv", document).css({height: (outerHeight || 200) + "px"});
        window.$("#img-out").hide();
    }
    generatePreview(params, logo, _generateCanvasImage);
    $("#previewDiv").resize(function () {
        generatePreview(params, logo, _generateCanvasImage);
    });







}

function generatePreview(params, logo, callback) {
    var baseHeight = 350;
    var currHeight = $("#previewDiv").height();
    var zoomFactor = currHeight / baseHeight;
    console.log('The zoom Factor is:', zoomFactor);
    draw(logo, params[0] * zoomFactor, params[1] * zoomFactor, params[2], params[3], params[4], params[5], params[6], params[7] * zoomFactor, params[8] * zoomFactor, callback);
}

function setImage(contents, callback) {
    $("#img-out").show();
    //$("#canvas").hide();
    $("#canvasBgFront").on("load", function () {
        $("#img-out").hide();
       // $("#canvas").show();
        callback ? callback() : (function () {})();
    });
    //$( "#canvasBgFront" ).before( "<p>Test</p>" );
    if (contents) {
        $("#canvasBgFront").attr("src", contents);
       // $(".large").css("background","url('" + $(".small").attr("src") + "') no-repeat");
    } else {
        $("#canvasBgFront").removeAttr("src");
    }
}

function draw(url, x, y, amplitude, crop, crop_left, crop_right, rotate, rwidth, height, callback) {
    //var magicNum = 40;
    console.log("X: " + x, "Y: " + y, "crop_left: " + crop_left, "crop_right: " + crop_right, "width: " + rwidth, "height: " + height, "amplitude: " + amplitude, "crop: " + crop, "Rotate: " + rotate);
    var canvas = document.getElementById("canvas");
    x = parseFloat(x);
    y = parseFloat(y);
    amplitude = parseFloat(amplitude);
    crop = parseFloat(crop);
    crop_left = parseFloat(crop_left);
    crop_right = parseFloat(crop_right);
    rotate = parseFloat(rotate);
    rwidth = parseFloat(rwidth);
    height = parseFloat(height);
    $(canvas).css({
        left: x,
        top: y,
        width: rwidth,
        height: height,
        "-ms-transform": "rotate(" + rotate + "deg)",
        "-webkit-transform": "rotate(" + rotate + "deg)",
        "transform": "rotate(" + rotate + "deg)"
    });
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.onload = start;
    img.src = url;
    function start() {
        var iw = img.width;
        var ih = img.height;
        canvas.height = ih;
        canvas.width = iw;

        var y_coords = [], max_y = 0;

        function calcY(yShift, t1, t2, amplitude) {
            var x = 0, y = 0;
            var duration = t2 - t1;
            var fx = function (x) {
                return x * (1 - x)
            };
            ctx.lineWidth = 1;
            for (x = t1; x < t2; x++) {
                var delta = (x - t1) / duration;
                y = yShift + amplitude * fx(delta);
                y_coords.push(y);
                if (y > max_y) {
                    max_y = y
                }
            }
        }

        calcY(crop, 0, canvas.width, amplitude);
        canvas.height += max_y;

        for (var sx = 0; sx < iw; sx++) {
            if ((sx > crop && sx < iw / 2) || (sx <= iw - crop && sx >= iw / 2)) {
                ctx.drawImage(img, sx, 0, 1, ih, sx - crop_left + crop_right, y_coords[sx], 0.8, canvas.height - max_y);
            }
        }
        callback ? callback() : (function () {})();
    }
}

function changeShirtColor(){
    
    var html = $("#previewDiv").html();
    console.log(html)
    return html;
}
