module.exports = function(grunt) {

    var logomaker_header_css = ["public/js/thirdparty/toast/jquery.toast.css", "public/vendor/bootstrap/bootstrap.css", "public/vendor/fontawesome/css/font-awesome.css", "public/vendor/owlcarousel/owl.carousel.css", "public/vendor/owlcarousel/owl.theme.css", "public/vendor/magnific-popup/magnific-popup.css", "public/css/theme.css", "public/css/theme-elements.css", "public/css/theme-blog.css", "public/css/theme-shop.css", "public/css/theme-animate.css", "public/vendor/rs-plugin/css/settings.css", "public/vendor/circle-flip-slideshow/css/component.css", "public/css/skins/blue.css", "public/css/custom.css", "public/css/jquery.fancybox.css", "public/css/jquery.fancybox-buttons.css", "public/css/jquery.fancybox-thumbs.css", "public/css/select2.css", "public/css/bootstrap-formhelpers.css", "public/css/jquery.feedback_me.css", "public/css/jquery.accordion.css", "public/css/theme-admin-extension.css", "public/css/animate.min.css", "public/css/style.css", "public/css/sprite.css"];
    var logomaker_footer_js = ["public/js/thirdparty/html5.js"/*, "public/js/thirdparty/jquery.history.js"(*/, "public/js/select2.min.js", "public/js/jquery.fancybox.js", "public/js/jquery.fancybox.pack.js", "public/js/jquery.fancybox-buttons.js", "public/js/jquery.fancybox-media.js", "public/js/jquery.fancybox-thumbs.js", "public/vendor/modernizr/modernizr.js", "public/js/thirdparty/jquery.cookie.js", "public/js/thirdparty/mustache.js", "public/js/thirdparty/bootbox.js", "public/js/thirdparty/jquery-validate/jquery.validate.js", "public/js/thirdparty/toast/jquery.toast.min.js", "public/js/thirdparty/md5.js", "public/vendor/jquery.appear/jquery.appear.js", "public/vendor/jquery.easing/jquery.easing.js", "public/vendor/jquery-cookie/jquery-cookie.js", "public/vendor/bootstrap/bootstrap.js", "public/vendor/jquery.validation/jquery.validation.js", "public/vendor/jquery.stellar/jquery.stellar.js", "public/vendor/jquery.easy-pie-chart/jquery.easy-pie-chart.js", "public/vendor/jquery.gmap/jquery.gmap.js", "public/vendor/twitterjs/twitter.js", "public/vendor/isotope/jquery.isotope.js", "public/vendor/owlcarousel/owl.carousel.js", "public/vendor/jflickrfeed/jflickrfeed.js", "public/vendor/magnific-popup/jquery.magnific-popup.js", "public/vendor/vide/vide.js", "public/js/bootstrap-formhelpers.js", "public/js/jquery.feedback_me.js", "public/js/bootstrap-formhelpers-colorpicker.js", "public/vendor/rs-plugin/js/jquery.themepunch.tools.min.js", "public/vendor/rs-plugin/js/jquery.themepunch.revolution.min.js", "public/vendor/circle-flip-slideshow/js/jquery.flipshow.js", "public/js/views/view.home.js", "public/js/jquery.cycle2.js", "public/js/jquery.cycle2.shuffle.js", "public/js/thirdparty/jquery.svg/jquery.svg.js", "public/js/thirdparty/jquery.svg/jquery.svgdom.js", "public/js/thirdparty/jquery.sticky.js"/*, "public/js/thirdparty/money.js"*/, "public/js/expand.js", "public/js/theme.js", "public/js/theme.init.js", "public/js/custom.js", "public/js/logomaker/Base64.js", "public/js/logomaker/authenticate.js", "public/js/logomaker/helpers/header.js", "public/js/logomaker/helpers/footer.js"];
    var bcdesigner_js = ["public/js/logomaker/helpers/bcdesigner.js"];
    var checkout_js = ["public/js/logomaker/helpers/checkout.js"];
    var editprofile_js = ["public/js/logomaker/helpers/editprofile.js"];
    var logomaker_js = ["public/js/logomaker/helpers/logomaker.js"];
    var other_products_js = ["public/js/logomaker/helpers/other-products.js"];
    var common_js = ["public/js/logomaker/common.js"];
    var mydesigns_js = ["public/js/logomaker/helpers/logolist.js","public/js/logomaker/helpers/cardlist.js","public/js/logomaker/helpers/purchasehistory.js","public/js/logomaker/helpers/my-other-products-list.js"];
    var svg_editor = ["public/js/thirdparty/pathseg.js", "public/js/thirdparty/toast/jquery.toast.min.js", "public/js/thirdparty/bootstrap/js/bootstrap.min.js", "public/svgedit/jquery-migrate.min.js", "public/svgedit/js-hotkeys/jquery.hotkeys.min.js", "public/svgedit/jquerybbq/jquery.bbq.min.js", "public/svgedit/svgicons/jquery.svgicons.js", "public/svgedit/jgraduate/jquery.jgraduate.min.js", "public/svgedit/touch.js", "public/svgedit/canvg/rgbcolor.js", "public/svgedit/canvg/canvg.js", "public/js/thirdparty/bootbox.js", "public/svgedit/svgedit.js", "public/svgedit/jquery-svg.js", "public/svgedit/browser.js", "public/svgedit/svgtransformlist.js", "public/svgedit/math.js", "public/svgedit/units.js", "public/svgedit/svgutils.js", "public/svgedit/sanitize.js", "public/svgedit/history.js", "public/svgedit/coords.js", "public/svgedit/recalculate.js", "public/svgedit/select.js", "public/svgedit/draw.js", "public/svgedit/path.js", "public/svgedit/svgcanvas.js", "public/svgedit/svg-editor.js", "public/svgedit/locale/locale.js", "public/js/thirdparty/jquery-ui-1.11.1/jquery-ui.js", "public/svgedit/jscolor/jscolor.js", "public/svgedit/config.js", "public/svgedit/jgraduate/jpicker.js", "public/svgedit/jquery-ui/jquery-ui-1.8.17.custom.min.js", "public/svgedit/editor-common.js" ];
    var svg_editor_css = ["public/svgedit/jgraduate/css/jPicker.css", "public/svgedit/jgraduate/css/jgraduate.css", "public/js/thirdparty/bootstrap/css/bootstrap.min.css", "public/svgedit/svg-editor-custom.css"];
    grunt.initConfig({
        uglify: {
            options: {
                sourceMap: false,
                compress: true
            },
            all: {
                files: {
                    'public/js/lm-footer-scripts.min.js': logomaker_footer_js,
                    'public/js/bcdesigner.min.js': bcdesigner_js,
                    'public/js/checkout.min.js': checkout_js,
                    'public/js/editprofile.min.js': editprofile_js,
                    'public/js/logomaker.min.js': logomaker_js,
                    'public/js/other-products.min.js': other_products_js,
                    'public/js/mydesigns.min.js': mydesigns_js,
                    'public/js/common.min.js': common_js,
                    'public/svgedit/svgedit.min.js': svg_editor
                }
            },
            editor: {
                files: {
                    'public/js/bcdesigner.min.js': bcdesigner_js,
                    'public/js/logomaker.min.js': logomaker_js,
                    'public/js/other-products.min.js': other_products_js,
                    'public/js/common.min.js': common_js,
                    'public/svgedit/svgedit.min.js': svg_editor
                }
            },
            other_editor: {
                files: {
                    'public/js/other-products.min.js': other_products_js,
                    'public/svgedit/svgedit.min.js': svg_editor,
                    'public/js/common.min.js': common_js
                }
            }
        },
        cssmin: {
            options: {
                sourceMap: true,
                report: "gzip",
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            header_files: {
                files: {
                    'public/css/header.min.css': logomaker_header_css,
                    'public/svgedit/svgedit.min.css': svg_editor_css
                }
            },
            editor_css: {
                files: {
                    'public/svgedit/svgedit.min.css': svg_editor_css
                }
            }
        },
        clean: {
            js: [
                'public/js/lm-footer-scripts.min.js', 'public/js/lm-footer-scripts.min.js.map',
                'public/js/bcdesigner.min.js', 'public/js/bcdesigner.min.js.map',
                'public/js/checkout.min.js', 'public/js/checkout.min.js.map',
                'public/js/editprofile.min.js', 'public/js/editprofile.min.js.map',
                'public/js/logomaker.min.js', 'public/js/logomaker.min.js.map',
                'public/js/mydesigns.min.js', 'public/js/mydesigns.min.js.map',
                'public/js/other-products.min.js', 'public/js/other-products.min.js.map',
                'public/js/common.min.js', 'public/js/common.min.js.map',
                'public/svgedit/svgedit.min.js', 'public/svgedit/svgedit.min.js.map',
                'public/svgedit/other-editor.min.js', 'public/svgedit/other-editor.min.js.map'
            ],
            css: [
                'public/css/header.min.css', 'public/css/header.min.css.map',
                'public/svgedit/svgedit.min.css', 'public/svgedit/svgedit.min.css.map'
            ]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-processhtml');
	grunt.registerTask('build', ['clean', 'uglify:all', 'cssmin']);
	grunt.registerTask('build-editor', ['uglify:editor', "uglify:other_editor", 'cssmin:editor_css']);
    grunt.registerTask('default', ['jshint']);
};