// Add here all your JS customizations
$(window).scroll(function () {
    var fromTop = $(this).scrollTop();

    var two = $('.top-page-header').outerHeight();
    var one = $('#header').outerHeight();
    var three = -20;//$('.wizard-tabs-column').outerHeight();
    var offsetTop = one + two + three + 1;
    if (fromTop > offsetTop) {
        $('.wizard-tabs-column').addClass('sticky');
        $('.create-logo-header.text-left').addClass('active');
    }
    else {
        $('.wizard-tabs-column').removeClass('sticky');
        $('.create-logo-header.text-left').removeClass('active');
    }
});

$(".toggle").on("click", function () {

    var anim = $(this);

    $("body, html").animate({
        scrollTop: $(anim).find('.toggle-content').offset().top - 200
    }, 1000);

});

$('.logomaker-menu').hide();
$('.logo-dropdown').hover(function () {
        $('.headerAccount-signin').addClass('login-off');
        $('.headerAccount-signin').removeClass('login-on');
        $('.headerAccount-dropdown').removeClass('active');
        $('.signin.logged').find('a.dropdown-toggle.disabled').toggleClass('border-active');
        $('.signin.logged').addClass('login-off');
        $('.signin.logged').removeClass('login-on');
        $(this).find('.headerAccount-signin a.dropdown-toggle').removeClass('border-active');
        $.data(this, "timer", setTimeout($.proxy(function () {
            $('.logomaker-menu').show();
            $('.logomaker-drpdwn').show();
            $('.dropdown-submenu-logo.logoMaker').addClass('comm-bg-gray');
        }, this), 400));
    },
    function () {
        clearTimeout($.data(this, "timer"));
        $('.logomaker-menu').hide();
        $('.logomaker-drpdwn').hide();
        $('.dropdown-submenu-logo.logoMaker').removeClass('comm-bg-gray');

    });


$('.logomaker-menu').hover(function () {
        $('.dropdown-submenu-logo.logoMaker').addClass('comm-bg-gray');
        $('.logomaker-menu').show();
    },
    function () {
        $('.dropdown-submenu-logo.logoMaker').removeClass('comm-bg-gray');
        $('.logomaker-menu').hide();
    });
$('.visitingCard-menu').hover(function () {
        $('.dropdown-submenu-logo.visitingCard').addClass('comm-bg-gray');
    },
    function () {
        $('.dropdown-submenu-logo.visitingCard').removeClass('comm-bg-gray');
    });
$('.visitingCard').hover(function () {
        $('.visitingCard-menu').show();
        $('.dropdown-submenu-logo.visitingCard').addClass('comm-bg-gray');
        $('.dropdown-submenu-logo.logoMaker').removeClass('comm-bg-gray');
    },
    function () {
        $('.visitingCard-menu').hide();
        $(this).removeClass('dropdown-submenu');
        $('.dropdown-submenu-logo.visitingCard').removeClass('comm-bg-gray');
        $('.dropdown-submenu-logo.tShirt').removeClass('comm-bg-gray');
    });
$('.logomaker-drpdwn').hover(function () {
    $('.logomaker-menu').show();
});
$('.logomaker-menu').hover(function () {
    $('.logomaker-menu').show();
});
$('.visitingCard-menu').hover(function () {
        $('.visitingCard-menu').show();
    },
    function () {
        $('.visitingCard-menu').hide();
    });
var hei = $('.logo-dropdown ul.dropdown-menu').height() - 7;
$('.logomaker-row').css('height', hei);

$('.tShirt').hover(function () {
        $('.tshirt-menu').show();
    },
    function () {
        $('.tshirt-menu').hide();
    });
$('.tshirt-menu').hover(function () {
        $('.dropdown-submenu-logo.tShirt').addClass('comm-bg-gray');
        $('.tshirt-menu').show();
    },
    function () {
        $('.dropdown-submenu-logo.tShirt').removeClass('comm-bg-gray');
        $('.tshirt-menu').hide();
    });

$('.mug').hover(function () {
        $('.mug-menu').show();
    },
    function () {
        $('.mug-menu').hide();
    });
$('.mug-menu').hover(function () {
        $('.dropdown-submenu-logo.mug').addClass('comm-bg-gray');
        $('.mug-menu').show();
    },
    function () {
        $('.dropdown-submenu-logo.mug').removeClass('comm-bg-gray');
        $('.mug-menu').hide();
    });

$('.postcards').hover(function () {
        $('.postcard-menu').show();
    },
    function () {
        $('.postcard-menu').hide();
    });
$('.postcard-menu').hover(function () {
        $('.dropdown-submenu-logo.postcards').addClass('comm-bg-gray');
        $('.postcard-menu').show();
    },
    function () {
        $('.dropdown-submenu-logo.postcards').removeClass('comm-bg-gray');
        $('.postcard-menu').hide();
    });
var wizWidth = $('.container').width() - 15;
$('.wizard-tabs ul').css('width', wizWidth);

// Feedback.init();
$('#feedback-anchor').hide();
var windowH = $(window).height();
$(window).scroll(function () {
    $('#feedback-anchor').show();
});
/*
 $('.signin.logged').hover(function(){
 $.data(this, "timer-logged", setTimeout($.proxy(function() {
 $('.dropdownlogout').show();
 }, this), 400));

 },
 function(){
 clearTimeout($.data(this, "timer"));
 $('.dropdownlogout').hide();
 });*/
$('#header nav ul.nav-main li.nav-logo-dropdown').hover(function () {
        $.data(this, "timer1", setTimeout($.proxy(function () {
            $(this).find('a.dropdown-toggle').addClass('border-active');
        }, this), 400));
    },
    function () {
        clearTimeout($.data(this, "timer1"));
        $(this).find('a.dropdown-toggle').removeClass('border-active');
    });
// $('.mega-menu-signin.signin').hover(function(){
//      $.data(this, "timer2", setTimeout($.proxy(function() {
//         $(this).find('ul.dropdown-menu').show();
//         $(this).addClass('border-active');
//     }, this), 400));
// },
// function(){
//     clearTimeout($.data(this, "timer2"));
//     $(this).find('ul.dropdown-menu').hide();
//     $(this).removeClass('border-active');
// });
$("#phone_num").keypress(function (e) {
    //if the letter is not digit then display error and don't type anything
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        //display error message
        $("#errmsg").html("Please enter valid phone number").show().fadeIn("slow");
        return false;
    }
    else {
        $("#errmsg").fadeOut("slow");
    }
});
$('.home-view-more').hover(function () {
    $(this).addClass('transition');

}, function () {
    $(this).removeClass('transition');
});
$('.logo-view-more').hover(function () {
    $(this).addClass('transition');

}, function () {
    $(this).removeClass('transition');
});
$('.why-view-more').hover(function () {
    $(this).addClass('transition');

}, function () {
    $(this).removeClass('transition');
});
$('.faq-view-more').hover(function () {
    $(this).addClass('transition');

}, function () {
    $(this).removeClass('transition');
});
$('.how-works-more').hover(function () {
    $(this).addClass('transition');

}, function () {
    $(this).removeClass('transition');
});
var logoHeight = $('.why-logo-div').height();
$('.whyLogoImage').css('height', logoHeight);
/*Disabling the action of newsletter email address*/
/*$('#newsletterForm').on('click', function () {
    return false;
});*/
/*
 $('#myProducts').hover(function(){
 $.data(this, "timer2", setTimeout($.proxy(function() {
 $(this).find('ul.dropdown-menu').show();
 $(this).addClass('border-active');
 }, this), 400));
 },
 function(){
 clearTimeout($.data(this, "timer2"));
 $(this).find('ul.dropdown-menu').hide();
 $(this).removeClass('border-active');
 });
 $('ul.dropdown-menu.my-products-dropdown li > a').hover(function(){
 $(this).next('span').addClass('active');
 },
 function(){
 $(this).next('span').removeClass('active');
 });
 */
$('.get-started a.btn-get-started').hover(function () {
    $(this).addClass('transition');

}, function () {
    $(this).removeClass('transition');
});
var widthSidebar = $('.sidebar-related-links').width();
$('.related-links-right-column').removeClass('sticky');
$(window).scroll(function () {
    var fromTop_side = $(this).scrollTop();
    if ($('.related-links-right-column').position() != undefined) {
        var offsetTop_side = $('.related-links-right-column').position().top - 70;
        var footer_side = $('.about-us-left').outerHeight() - 200;
        var rightSticky = (($('body').width() - $('.container').width()) / 2) - 5;
        var removeright = 0;
        if (fromTop_side > offsetTop_side) {
            $('.related-links-right-column').addClass('sticky');
            $('.related-links-right-column.sticky').css('right', rightSticky);
            $('.related-links-right-column.sticky').css('width', widthSidebar);
        }
        else {
            $('.related-links-right-column').removeClass('sticky');
            $('.related-links-right-column').css('right', removeright);
            $('.related-links-right-column').css('width', widthSidebar);
        }
        if (fromTop_side > footer_side) {
            $('.related-links-right-column').removeClass('sticky');
            $('.related-links-right-column').css('right', removeright);
            $('.related-links-right-column').css('width', widthSidebar);
        }

    }
});
/*    var widthPurchase = $('.purchase-list-header').width();
 if (document.documentElement.clientWidth > 736) {
 $(window).scroll(function () {
 var fromTop_side1 = $(this).scrollTop();
 if ($('.check-billing-left').position() != undefined){
 var purchase_pos=$('.check-billing-left').position().top-70;
 var footer1=$('.check-billing-left').outerHeight()
 var footer2=$('.billing-information').outerHeight()
 var footer_side = $('#footer').position().top-250;
 var rightSticky1=(($('body').width()-$('.container').width())/2)-5;
 var removeright1=0;
 var checkoutOff = $('.main.checkout-main').offset().top;
 if(fromTop_side1>purchase_pos){
 $('.purchase-list-header').addClass('stick');
 $('.purchase-list-header.stick').css('right',rightSticky1);
 $('.purchase-list-header.stick').css('width',widthPurchase);
 }
 else{
 $('.purchase-list-header').removeClass('stick');
 $('.purchase-list-header').css('right',removeright1);
 $('.purchase-list-header').css('width',widthPurchase);
 }
 if(fromTop_side1>footer_side){
 $('.purchase-list-header').removeClass('stick');
 $('.purchase-list-header').css('right',removeright1);
 $('.purchase-list-header').css('width',widthPurchase);
 }
 if(fromTop_side1<checkoutOff){
 $('.purchase-list-header').removeClass('stick');
 $('.purchase-list-header').css('right',removeright1);
 $('.purchase-list-header').css('width',widthPurchase);
 }

 }
 });
 }*/

$(document).on('click', '.headerAccount-signin', function (e) {
    if ($(e.target).attr("data-href")) {
        $.event.trigger({
            type: "hashAdding",
            message: "hashAdding.",
            time: new Date()
        });
        window.location.hash = $(e.target).attr("data-href");
    }
    e.stopPropagation();
    e.preventDefault();
});

$(document).on('click', function (e) {
    if (window.location.hash) {
        var oldScrollTop = $(window).scrollTop();
        window.location.hash = "";
        $.event.trigger({
            type:    "hashRemoving",
            message: "hashRemoving.",
            time:    new Date()
        });
        $(window).scrollTop(oldScrollTop);
    }
    e.stopPropagation();
});

$(document).on('click', '#headerSignUp', function () {
    $('.headerAccount-signin').find('a.dropdown-toggle .fa-angle-up').removeClass('inactive');
    $('.headerAccount-signin').find('a.dropdown-toggle .fa-angle-down').addClass('inactive');
    if ($('.signin.headerAccount-signin ul.headerAccount-dropdown').is(':visible'));
});
$(document).on('click', function () {
    // $('.dropdown-menu.dropdownlogout').css('display','none');
    $('.headerAccount-signin').addClass('login-off');
    $('.headerAccount-signin').removeClass('login-on');
    $('.headerAccount-dropdown').removeClass('active');
    $('.signin.logged').find('a.dropdown-toggle.disabled').toggleClass('border-active');
    $('.signin.logged').addClass('login-off');
    $('.signin.logged').removeClass('login-on');
    $(this).find('.headerAccount-signin a.dropdown-toggle').removeClass('border-active');
    $('#emailid-error').hide();
    $('.error-signin').hide();
    /*if (!isLoggedIn()) {
        $('#loginFormOnTop')[0].reset();
        $('#signupForm')[0].reset();
    } */
    $('.headerAccount-signin').find('a.dropdown-toggle .fa-angle-up').addClass('inactive');
    $('.headerAccount-signin').find('a.dropdown-toggle .fa-angle-down').removeClass('inactive');
});
$('.signin.logged').on('click', function (e) {
    // $.data(this, "timer-logged", setTimeout($.proxy(function() {
    e.stopPropagation();
    $(this).removeClass('login-off');
    $(this).toggleClass('login-on');
    $('.dropdown-menu .dropdownlogout').show();
    $(this).find('a.dropdown-toggle.disabled').toggleClass('border-active');
    // }, this), 400));
});
$('.business-card-button a').hover(function () {
    $(this).addClass('transition');
}, function () {
    $(this).removeClass('transition');
});
$('.business-card-button a').hover(function () {
        $(this).addClass('active');
        $(this).find('a').addClass('active');
    },
    function () {
        $(this).removeClass('active');
        $(this).find('a').removeClass('active');
    });
$('#downloadLogo').mouseenter(function () {
    $('.unlimited-use').hide();
    $('.unlimited-use-download').show();//fadeIn(700);
});
$('#buyLogo').mouseenter(function () {
    $('.unlimited-use-download').hide();
    $('.unlimited-use').show();//fadeIn(700);
});
$('#downloadLogo i').on('click', function (e) {
    e.stopPropagation();
    $('.unlimited-use').hide();
    $('.unlimited-use-download').fadeIn(700);
});
$('#buyLogo i').on('click', function (e) {
    e.stopPropagation();
    $('.unlimited-use-download').hide();
    $('.unlimited-use').fadeIn(700);
});
var logWidth = $('.dropdown.signin.logged').width() - 6;
$('ul.user-profile-details').css('width', logWidth);
$('.tooltip2').tooltip();
if (document.documentElement.clientWidth < 736) {
    $('.logoMaker a').on('click', function (e) {
        e.preventDefault();
        $('.logomaker-menu-mobile').toggleClass('active');
    });
    $('.visitingCard a').on('click', function (e) {
        e.preventDefault();
        $('.visitingCard-menu-mobile').toggleClass('active');
    });
    $('.tShirt a').on('click', function (e) {
        e.preventDefault();
        $('.tshirt-menu-mobile').toggleClass('active');
    });
    $('.mug a').on('click', function (e) {
        e.preventDefault();
        $('.mug-menu-mobile').toggleClass('active');
    });
    $('.postcards a').on('click', function (e) {
        e.preventDefault();
        $('.postcards-menu-mobile').toggleClass('active');
    });
    $('.whyLogoImage').css('height', '150px !important');
    // scripts
}
$('#get-in-touch').on('click', function () {
    window.location = "/contact-us";
});
$('.signout-mobile').on('click', function () {
    $(this).find('ul.dropdown-menu').toggleClass('active');
});
$('#createAnotherLogo').mouseenter(function () {
    $('.unlimited-use').hide();
    $('.unlimited-use-download').show();//fadeIn(700);
});