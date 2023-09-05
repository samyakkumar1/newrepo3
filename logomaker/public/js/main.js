(function($){
  "user strict";

  $(window).on("load", function() {
    //preloader
    $(".preloader").delay(300).animate({
      "opacity" : "0"
      }, 300, function() {
      $(".preloader").css("display","none");
    });
  });

    // Show or hide the sticky footer button
    $(window).on("scroll", function() {
      if ($(this).scrollTop() > 50) {
        $('.hero-section').addClass('active');
      }else {
        $('.hero-section').removeClass('active');
      }
    });

    $('.product-details-thumb-slider').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: true,
      asNavFor: '.product-details-slider-nav'
    });
  
    $('.product-details-slider-nav').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      asNavFor: '.product-details-thumb-slider',
      dots: false,
      centerMode: true,
      nextArrow: '<div class="next"><i class="fa fa-chevron-right"></i></div>',
      prevArrow: '<div class="prev"><i class="fa fa-chevron-left"></i></div>',
      centerPadding: '0px',
      focusOnSelect: true
    });


  // close search area when click off of container
  $(document).on('click touchstart', function (e){
    if (!$(e.target).is('.header-serch-btn, .header-serch-btn *, .header-top-search-area, .header-top-search-area *')) {
      $('.header-top-search-area').removeClass('open');
      $('.header-serch-btn').addClass('toggle-close');
    }
  });

  // mobile menu js
  $(".navbar-collapse>ul>li>a, .navbar-collapse ul.sub-menu>li>a").on("click", function() {
    const element = $(this).parent("li");
    if (element.hasClass("open")) {
      element.removeClass("open");
      element.find("li").removeClass("open");
    }
    else {
      element.addClass("open");
      element.siblings("li").removeClass("open");
      element.siblings("li").find("li").removeClass("open");
    }
  });

  //js code for menu toggle
  $(".menu-toggle").on("click", function() {
      $(this).toggleClass("is-active");
  });

  
   // menu options custom affix
   var fixed_top = $(".header-section");
   $(window).on("scroll", function(){
       if( $(window).scrollTop() > 50){  
           fixed_top.addClass("animated fadeInDown menu-fixed");
       }
       else{
           fixed_top.removeClass("animated fadeInDown menu-fixed");
       }
   });

  // lightcase plugin init
  $('a[data-rel^=lightcase]').lightcase();

  $('.login-open-btn').on('click', function(){
    $('.login-section').addClass('active');
  });

  $('.login-close').on('click', function(){
    $('.login-section').addClass('duration');
    setTimeout(RemoveClass, 2000);
    setTimeout(RemoveClass2, 2000);
  });

  function RemoveClass() {
    $('.login-section').removeClass("active");
  }
  function RemoveClass2() {
    $('.login-section').removeClass("duration");
  }

  $('.signup-open-btn, .move-signup-btn').on('click', function(){
    $('.signup-section').addClass('active');
  });

  $('.signup-close, .switch-login-page-btn').on('click', function(){
    $('.signup-section').addClass('duration');
    setTimeout(signupRemoveClass, 2000);
    setTimeout(signupRemoveClass2, 2000);
  });

  function signupRemoveClass() {
    $('.signup-section').removeClass("active");
  }
  function signupRemoveClass2() {
    $('.signup-section').removeClass("duration");
  }

  $(".error-section").on('mousemove',function(e) {
    parallaxIt(e, ".el-1", -150);
    parallaxIt(e, ".el-2", -100);
    parallaxIt(e, ".el-3", -110);
    parallaxIt(e, ".el-4", -90);
    parallaxIt(e, ".el-5", -120);
    parallaxIt(e, ".el-6", -150);
    parallaxIt(e, ".el-7", -80);
  });
  
  function parallaxIt(e, target, movement) {
    var $this = $(".error-section");
    var relX = e.pageX - $this.offset().left;
    var relY = e.pageY - $this.offset().top;
  
    TweenMax.to(target, 1, {
      x: (relX - $this.width() / 2) / $this.width() * movement,
      y: (relY - $this.height() / 2) / $this.height() * movement
    });
  }

  $('.header-cart-btn').on('click', function(){
    $('.header-cart-area').toggleClass('active');
  });

   // wow js init
  new WOW().init();

  //$('select').niceSelect();

  $('.post-share-btn').on('click', function(){
    $(this).siblings('.post-action-links').toggleClass('active')
  });

  $(document).on('click touchstart', function (e){
    if (!$(e.target).is('.post-share-btn')) {
      $('.post-action-links').removeClass('active');
    }
  });

  $('.post-share-btn').on('click', function(){
    $(this).siblings('.post-share-links').toggleClass('active')
  });

  $(document).on('click touchstart', function (e){
    if (!$(e.target).is('.post-share-btn')) {
      $('.post-share-links').removeClass('active');
    }
  });

  $("[data-paroller-factor]").paroller();

  $('.brand-slider').slick({
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    speed: 700,
    arrows: false,
    autoplay: true,
    mobileFirst:true,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 6
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 4
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 2
        }
      }
    ]
  });

  $('.product-slider').slick({
    infinite: true,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '10px',
    prevArrow: $('.product-slider-nav .prev'),
    nextArrow: $('.product-slider-nav .next'),
    mobileFirst:true,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          arrows: false
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          arrows: false
        }
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: false
        }
      }
    ]
  });

  $('.testimonial-slider').slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true
  });

  $('#tagbit-products').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    infinite: true,
    arrows:false,
    mobileFirst: true,
    responsive: [
       {
          breakpoint: 767,
          settings: "unslick"
       }
    ]
 });

 $('#service-tabs').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  infinite: true,
  arrows:false,
  mobileFirst: true,
  responsive: [
     {
        breakpoint: 767,
        settings: "unslick"
     }
  ]
});

$('#why-choose').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  infinite: true,
  arrows:false,
  mobileFirst: true,
  responsive: [
     {
        breakpoint: 767,
        settings: "unslick"
     }
  ]
});

  // related-product-slider
  $('.related-product-slider').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    centerMode: true,
    nextArrow: '<div class="next"><i class="fa fa-chevron-right"></i></div>',
    prevArrow: '<div class="prev"><i class="fa fa-chevron-left"></i></div>',
    centerPadding: '0px',
    focusOnSelect: true,
    mobileFirst:true,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          arrows: false,
          autoplay: true
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          arrows: false,
          autoplay: true
        }
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: false,
          autoplay: true
        }
      }
    ]
  });

  // custom design 
  $('.main-design-thumb').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.main-design-thumb-nav'
  });

  $('.main-design-thumb-nav').slick({
    slidesToShow: 6,
    slidesToScroll: 1,
    asNavFor: '.main-design-thumb',
    dots: false,
    centerMode: true,
    nextArrow: '<div class="next"><i class="fa fa-chevron-right"></i></div>',
    prevArrow: '<div class="prev"><i class="fa fa-chevron-left"></i></div>',
    centerPadding: '0px',
    focusOnSelect: true,
    mobileFirst:true,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 6
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 6
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 4
        }
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 3
        }
      }
    ]
  });

  // banner image tilt effect
  $('.custom-design-thumb').tilt({
    reset: true
  });

  $('.choose-us-thumb').tilt({
    reset: true
  });

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('.imagePreview').css('background-image', 'url('+e.target.result +')');
                $('.imagePreview').hide();
                $('.imagePreview').fadeIn(650);
                $('.avatar-edit').addClass('active');
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $(".imageUpload").change(function() {
        readURL(this);
    });

    jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up"><i class="fa fa-chevron-up"></i></div><div class="quantity-button quantity-down"><i class="fa fa-chevron-down"></i></div></div>').insertAfter('.quantity input');
      jQuery('.quantity').each(function () {
          var spinner = jQuery(this),
              input = spinner.find('input[type="number"]'),
              btnUp = spinner.find('.quantity-up'),
              btnDown = spinner.find('.quantity-down'),
              min = input.attr('min'),
              max = input.attr('max');

          btnUp.on('click', function () {
              var oldValue = parseFloat(input.val());
              if (oldValue >= max) {
                  var newVal = oldValue;
              } else {
                  var newVal = oldValue + 1;
              }
              spinner.find("input").val(newVal);
              spinner.find("input").trigger("change");
          });

          btnDown.on('click', function () {
              var oldValue = parseFloat(input.val());
              if (oldValue <= min) {
                  var newVal = oldValue;
              } else {
                  var newVal = oldValue - 1;
              }
              spinner.find("input").val(newVal);
              spinner.find("input").trigger("change");
          });

      });

    /* Remove item from cart */
    var fadeTime = 300;
    $('.delete-btn').on('click', function() {
      removeItem(this);
    });
    function removeItem(removeButton) {
      var productRow = $(removeButton).parent().parent();
      productRow.slideUp(fadeTime, function() {
        productRow.remove();
      });
    }

})(jQuery);
