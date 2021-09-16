/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD (Register as an anonymous module)
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {},
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling $.cookie().
			cookies = document.cookie ? document.cookie.split('; ') : [],
			i = 0,
			l = cookies.length;

		for (; i < l; i++) {
			var parts = cookies[i].split('='),
				name = decode(parts.shift()),
				cookie = parts.join('=');

			if (key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));


/* Check IE */
var bcMsieVersion = {

  MsieVersion: function() {

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
    else// If another browser, return 0
    {
      return 0;
    }
  }

  ,init : function(){
    this.MsieVersion();
  }
}

jQuery.fn.extend({
  scrollToMe: function() {
    if (jQuery(this).length) {
      var top = jQuery(this).offset().top - 200;
      jQuery('html,body').animate({
        scrollTop: top
      }, 500);
    }
  },
});;

function addCart(){
  AT_Main.fixNoScroll();
  $('.cart-sb').toggleClass('opened');
  $('html,body').toggleClass('cart-opened');
}

function notifyAddCartFail($i){
  $('.boxed-wrapper').after(`<div class="cart-noti-error">
    <div class="modal fade" id="cartModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
    <div class="modal-header">
    <h4 class="modal-title">Sold Out</h4>
    <button type="button" class="close btn btn-1" data-dismiss="modal"><i class="demo-icon icon-delete"></i></button>
    </div>
    <div class="modal-body">
    ${$i}
    </div></div></div></div></div>`);
  $('#cartModal').modal('show');
  $("#cartModal").on('hidden.bs.modal', function(){
    $('.cart-noti-error').remove();
  });
}
var myVar;
/* Ajax Add To Cart */
function addToCart(e){
  if (typeof e !== 'undefined') e.preventDefault();
  var $this = $(this);
  $this.addClass('disabled');

  var form = $this.parents('form');

  let relxProductId = parseInt($('#relxProductId').val()); 
  console.log(relxProductId);
  console.log('relax :: ' + globalCartProduct.includes(relxProductId));
  if(globalCartProduct.includes(relxProductId)){
   	alert("You can only add one variant of this product ");
    location.reload();
    return false;
  }
  
  // Hide Modal
  $('.modal').modal('hide');
  $.ajax({
    type: 'POST',
    url: '/cart/add.js',
    async: true,
    data: form.serialize(),
    dataType: 'json',
    error: addToCartFail,
    success: addToCartSuccess,
    cache: false
  });
}

function addToCartSuccess (jqXHR, textStatus, errorThrown){
  $('.add-to-cart').removeClass('disabled');
  var _cartStyles = 'sidebar';
  // Get the cart show in the cart box.
  Shopify.getCart(function(cart){Shopify.updateCartInfo(cart, '#cart-info #cart-content');});
  if (_cartStyles == 'dropdown') {AT_Main.updateLayerCart(jqXHR);}

  else if (_cartStyles == 'page') { AT_Main.debounceTime(function(){window.location.href = "/cart";}, 1000); }

  else if (_cartStyles == 'checkout') { AT_Main.debounceTime(function(){window.location.href = "/checkout";}, 1000); }

  else{
    // remove by rob
    //window.location.href = "/cart";
    jQuery('a.basket.cart-toggle').click();
  }

  $.ajax({
    type: 'GET',
    url: '/cart.js',
    async: false,
    cache: false,
    dataType: 'json',
    success: updateCartDesc
  });

  if($('.cart-target a').children('.number').length == 0){
    $('.cart-target a').append('<span class="number"><span class="n-item"></span></span>');
  }
}

function addToCartFail(jqXHR, textStatus, errorThrown){
  $('.add-to-cart').removeClass('disabled');
  var response = $.parseJSON(jqXHR.responseText);
  var $i = '<div id="cart--error" class="error"><strong>'+ response.description +'</strong></div>';
  notifyAddCartFail($i);
}

function addcartModalHide(){
  $(".layer-addcart-modal").addClass("zoomOut animated").fadeOut();
  $(".layer-addcart-modal").removeClass("zoomOut animated");
}

jQuery(document).ready(function($) {$('body').on( 'click','.add-to-cart',addToCart);});
var AT_Main = {

  getWidthBrowser : function() { // Get width browser
    var myWidth;

    if( typeof( window.innerWidth ) == 'number' ) {
      //Non-IE
      myWidth = window.innerWidth;
    }
    else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
      //IE 6+ in 'standards compliant mode'
      myWidth = document.documentElement.clientWidth;
    }
    else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
      //IE 4 compatible
      myWidth = document.body.clientWidth;
    }

    return myWidth;
  }
  ,debounceTime : function(func, time){
    var timeout;
    return function(){
      var context = this, args = arguments;
      var excuteFn = function(){
        func.apply(context, args);
      }

      clearTimeout(timeout);
      timeout = setTimeout(excuteFn,time);
    };
  }

  ,checkLayout : function() { // Function to check level of layout
    if(jQuery("#checkLayout .d-sm-block").css("display") == "block")
      return 1; //mobile layout
    else if(jQuery("#checkLayout .d-md-block").css("display") == "block")
      return 2; //tablet potrait layout
    else if(jQuery("#checkLayout .d-lg-block").css("display") == "block")
      return 3; //tablet landscape/medium desktop layout
    else if(jQuery("#checkLayout .d-xl-block").css("display") == "block")
      return 4; //desktop layout
  }
  ,checkScrollbar : function(){
    let t = document.body.getBoundingClientRect();
    if (t.left + t.right < window.innerWidth)
      return window.innerWidth - (t.left + t.right);
    return 0;
  }

  ,homeSlideshow : function(){
    jQuery('.slideshow-catalog-wrapper').each(function(){
      var id = jQuery(this).data('section-id');
      var swiper_container = '.swiper-container-'+id;
      var _delay_time = jQuery(swiper_container).data('time');
      if (jQuery(swiper_container).find('.swiper-slide').length) {

        var swiper = new Swiper(swiper_container, {
          autoplay: {delay: _delay_time,disableOnInteraction: false}
          // ,loop: true
          ,touchEventsTarget: 'container'
          ,simulateTouch: true
          ,updateOnImagesReady: false
          ,pagination: {
            el: '.slideshow-'+id+' .swiper-pagination',
            type: jQuery(swiper_container).data('style') != '4' && jQuery(swiper_container).data('style') != '6' ? 'bullets': 'fraction',
            clickable: true
          }
          ,navigation: {
            nextEl: '.slideshow-'+id+' .swiper-button-next',
            prevEl: '.slideshow-'+id+' .swiper-button-prev',
          }
          ,thumbs: {
            swiper: {
              el: '.swiper-gallery-thumb-'+id,
              slidesPerView: 4,
            }
          }
          ,effect: jQuery(swiper_container).data('animation')
          ,fadeEffect: {crossFade: true}
          ,cubeEffect: {slideShadows: false}
          ,setWrapperSize: false

          ,on :{
            imagesReady: function(){
              // jQuery(swiper_container).find('.swiper-slide .slider-layer img').css('visibility','visible');
              jQuery(swiper_container).find('.swiper-slide').each(function(){
                var _this = jQuery(this);
                _this.find('.video-slide').show();
                if (!_this.find('.video-slide').data('full-height')) {
                  _this.find('.video-slide video').css({
                    position: 'relative',
                    width: '100%'
                  });
                }
                else{
                  _this.find('.video-slide video').css({
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  });
                }
              });

              jQuery(swiper_container).data('parallax') && AT_Main.parallaxScroll(jQuery(swiper_container),jQuery(swiper_container).find('.slider-layer img'));
            }
          }
        });
        jQuery(swiper_container).data('autoplay') ? swiper.autoplay.start() : swiper.autoplay.stop();
      }
    })
  }

  ,homeIE : function(){
    console.log('slideshow IE');
    jQuery('.slideshow-catalog-wrapper').each(function(){
      var id = jQuery(this).data('section-id');
      var swiper_container = '.swiper-container-'+id;
      var _delay_time = jQuery(swiper_container).data('time');

      var swiper = new Swiper(swiper_container, {
        autoplay: {delay: _delay_time,disableOnInteraction: false}
        ,loop: true
        ,simulateTouch: true
        ,updateOnImagesReady: true
        ,pagination: {
          el: '.slideshow-'+id+' .swiper-pagination',
          type: 'bullets',
          clickable: true
        }
        ,navigation: {
          nextEl: '.slideshow-'+id+' .swiper-button-next',
          prevEl: '.slideshow-'+id+' .swiper-button-prev',
        }
        ,effect: 'fade'
        ,fadeEffect: {crossFade: true}
        ,setWrapperSize: false
        ,on :{
          imagesReady: function(){
            jQuery(swiper_container).find('.swiper-slide .slider-layer img').css('visibility','visible');
            jQuery(swiper_container).find('.swiper-slide').each(function(){
              var _this = jQuery(this);
              _this.find('.video-slide').show();
              if (!_this.find('.video-slide').data('full-height')) {
                _this.find('.video-slide video').css({
                  position: 'relative',
                  width: '100%'
                });
              }
              else{
                _this.find('.video-slide video').css({
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                });
              }
            });


            var el = jQuery('.slideshow-'+id);
            if(el.data('adapt')){
              var min_height = el.width() / el.data('min-aspect-ratio');
              el.height(min_height);
              jQuery(swiper_container).height(min_height);
              jQuery(window).resize(function(){
                var min_height = el.width() / el.data('min-aspect-ratio');
                el.height(min_height);
                jQuery(swiper_container).height(min_height);
              });
            }
          }
        }
      });
      jQuery(swiper_container).data('parallax') ? AT_Main.parallaxScroll(jQuery(swiper_container),jQuery(swiper_container).find('.swiper-slide')) : null;
      jQuery(swiper_container).data('autoplay') ? swiper.autoplay.start() : swiper.autoplay.stop();

    })
  }

  ,stickAddToCart : function() {
    if ($('#add-to-cart').length && $('.add-to-cart-sticky').length) {
      $(window).on( 'scroll' , function() {
        var ps            = jQuery(this).scrollTop();
        var _show_sticky  = ($('#add-to-cart').offset().top);
        var pos_sticky    = $('.add-to-cart-sticky').data('pos');
        if ( _show_sticky < ps ) {
          $('.add-to-cart-sticky').addClass('show');
          if (pos_sticky == 'top') {
            if (AT_Main.getWidthBrowser() > 991) {
              $('.header-desktop').data('sticky') && $('.add-to-cart-sticky').css('top', $('.header-desktop')[0].clientHeight);
            }else{
              $('.header-mobile').data('sticky') && $('.add-to-cart-sticky').css('top', $('.header-mobile')[0].clientHeight);
            }
          }

          pos_sticky == 'bottom' && $('.boxed-wrapper').css('margin-bottom', $('.add-to-cart-sticky')[0].clientHeight);
        }
        else {
          $('.add-to-cart-sticky').removeClass('show');
          pos_sticky == 'bottom' && $('.boxed-wrapper').removeAttr('style');
        }
      });
    }
    $(document).on('click','.add-to-cart-sticky .qty-inner .qty-up', function() {
      var oldValue = $("#sticky-quantity").val(),
      newVal = 1;
      newVal = parseInt(oldValue) + 1;
      $("#sticky-quantity").val(newVal);

    }).on('click','.add-to-cart-sticky .qty-inner .qty-down', function() {
      var oldValue = $("#sticky-quantity").val();
      if (oldValue > 1) {
        newVal = 1;
        newVal = parseInt(oldValue) - 1;
        $("#sticky-quantity").val(newVal);
      }
    });

    jQuery(document).on('change','.add-to-cart-sticky .sticky-select',function(){
      var optionSelect = $(this).find('option:selected');
      var price = optionSelect.data('price');
      $('.sticky-price').html('Price: <span class="money">'+Shopify.formatMoney(price, '') + '</span>');
      if( _bc_config.show_multiple_currencies == 'true' ){currenciesCallbackSpecial('.sticky-price span.money');}
    });
    jQuery(document).on('change','.add-to-cart-sticky .sticky-select-option',function(){
      var selected_val = '';
      $('.add-to-cart-sticky .sticky-select-option').each(function(){
        selected_val += $(this).val().toLowerCase()+'/';
      })
      selected_val = selected_val.substring(0,selected_val.length-1);
      var optionSelect = $('.sticky-select option[data-check="'+selected_val+'"]')
      ,v = optionSelect.val()
      ,add_cart_btn = $('.add-to-cart-sticky .add-to-cart');

      if (typeof v == 'undefined') {
        add_cart_btn.attr('disabled', 'disabled');
      }
      else{
        add_cart_btn.removeAttr('disabled');
        optionSelect.prop('selected',true);
      }
      var price = optionSelect.data('price');
      if (price)
        $('.sticky-price').html('Price: <span class="money">'+Shopify.formatMoney(price, '') + '</span>');
      else
        $('.sticky-price').html('<b>Sold Out</b>');

      if( _bc_config.show_multiple_currencies == 'true' ){currenciesCallbackSpecial('.sticky-price span.money');}

    });
  }

  ,handleGridList : function(){
    AT_Main.handleGridList_Remove();

    let num = $('.cata-toolbar').data('grid-col'),
    el = $(".templateCollection .mode-view-item");
    if($.cookie('mode-view') == 'list'){
      el.addClass("products-list-item").addClass('number-1');
      $(".grid-list .list").addClass("active");
      el.find('.product-content').addClass('hide');
      el.find('.product-list-content').removeClass('hide');
    }else{
      num = $.cookie('mode-view') == null ? $('.cata-toolbar').data('grid-col') : $.cookie('mode-view');

      el.addClass("products-grid-item").addClass('number-'+num);
      el.find('.product-list-content').addClass('hide');
      el.find('.product-content').removeClass('hide');
      $(".grid-list").children('div').removeClass('active')
      $(".grid-list").length && $(".grid-list .grid[data-grid="+num+"]").addClass("active");
    }
    setTimeout(function(){
      $(".mode-view-item").removeClass('loading');
    },500);

    jQuery(document).on("click", ".grid", function() {
      AT_Main.handleGridList_Remove();
      let num = jQuery(this).data('grid');
      $.cookie('mode-view', num, {expires: 1, path: '/'});

      jQuery(this).parent().children('div').removeClass('active');
      jQuery(this).addClass('active');
      el.addClass('products-grid-item number-'+num);
      el.find('.product-content').removeClass('hide');
      el.find('.product-list-content').addClass('hide');
      $(".grid-list").children('div').removeClass('active')
      $(".mobile-layout-bar .grid-list .grid, .grid-list .grid[data-grid="+num+"]").addClass("active");
    })

    jQuery(document).on("click", ".list", function() {
      AT_Main.handleGridList_Remove();
      $.cookie('mode-view','list',  {expires: 1, path: '/'});
      jQuery(this).parent().children('div').removeClass('active');
      jQuery(this).addClass('active');
      el.addClass("products-list-item number-1");
      el.find('.product-content').addClass('hide');
      el.find('.product-list-content').removeClass('hide');
      $(".grid-list .list").addClass("active");
    })
  }

  ,handleGridList_Remove : function(){
    jQuery('.mode-view-item').removeClass('number-1 number-2 number-3 number-4 number-5 products-grid-item products-list-item');
    $(".grid-list .grid, .grid-list .list").removeClass("active");
  }

  ,handleOrderFormQty : function(){
    jQuery("body").on("click",".global-product-info-qty-plus",function(){
      q = $(this).prev();
      var value = parseInt(q.val(), 10);
      value = isNaN(value) ? 0 : value;
      value++;
      q.val(value);
    });

    jQuery("body").on("click",".global-product-info-qty-minus",function(){
      q = $(this).next();
      var value = parseInt(q.val(), 10);
      value = isNaN(value) ? 1 : value;
      if(value > 0){
        value--;
        q.val(value);
      }
    });

    jQuery(document).on('click','.show-variants',function(e){
      e.preventDefault();
      var parent = jQuery(this).parents('.product-parent-item');
      var id = parent.data('id');
      parent.parents('.cata-product').find('.product-child-item[data-id='+id+']').slideToggle();
    });
  }

  ,effectNavigation : function(){ // Make hover effect of navigation

    jQuery(".top-account-holder").hover(function(e){
      jQuery(this).find('>.dropdown-menu').addClass("fadeInUp animated");
    },function(e){
      jQuery(this).find('>.dropdown-menu').removeClass("fadeInUp animated");
    });

    jQuery(".currency-block").hover(function(e){
      jQuery(this).find('>.dropdown-menu').addClass("fadeInUp animated");
    },function(e){
      jQuery(this).find('>.dropdown-menu').removeClass("fadeInUp animated");
    });

    jQuery(document).on('click','.searchbox>a',function(e){
      $(this).parents().find('.searchbox').toggleClass('open');
      $('#page-body').trigger('click');
    });
  }

  ,fixNoScroll : function() { // body-scroll-lock fix touch event in mobile
    AT_Main.checkScrollbar() > 0 && jQuery('body').css('padding-right', AT_Main.checkScrollbar()+'px');
    jQuery('body').addClass('popup-is-showing');
  }

  ,fixReturnScroll : function() {
    jQuery('#page-body, .header-content,#page-body .mobile-version,.h-desk-sticky .header-desktop').attr('style', '');
    let body = jQuery('body');
    body.removeClass('popup-is-showing menu-opened').css('padding-right',0).attr('style', body.attr('style').replace('padding-right: 0px;', ''));
    body.attr('style').length == 0 && body.removeAttr('style');
  }

  ,fixButton : function(){
    jQuery(".product-wrapper .product-head").each(function(e){
      if($(this).children().hasClass('wrapper-countdown')){
        $(this).find('.product-button').addClass('fix');
      }
    });
  }

  ,handleReviews: function() {
    if (typeof SPR != 'undefined')
      SPR.registerCallbacks(), SPR.initRatingHandler(), SPR.initDomEls(), SPR.loadProducts(), SPR.loadBadges();
  }

  ,menuOnMobile : function(){
    jQuery(document).on('click','.bc-toggle',function(){
      let e = jQuery(this);
      e.hasClass("opened") ? e.removeClass("opened") : e.addClass("opened");
    });
  }

  ,handleMenuMultiLine : function() {
    var outItem = "";
    var down = false;

    var top = 0;

    jQuery(".navbar-collapse .main-nav > li").on("mousemove", function(e){
      var target = jQuery(e.currentTarget);

      if( down && outItem != "") {
        outItem.addClass("hold");
        setTimeout(function(){
          if(outItem != "")
            outItem.removeClass("hold");
          down = false;
          outItem = "";
        },500);

        if( (outItem[0] == target[0]) || (outItem.offset().top == target.offset().top) )
        {
          outItem.removeClass("hold");
          down = false;
          outItem = "";
        }
      }
      else {
        outItem = "";
      }

    });

    jQuery(".navbar-collapse .main-nav >li").on("mouseout", function(e){

      var target = jQuery(e.currentTarget);

      if( e.pageY >= target.offset().top + 50 ) { //move down
        down = true;
      }

      if( target.hasClass("dropdown") ) { //target has child

        if(outItem == "")
          outItem = target;
      }

    });
  }

  ,fixTitle : function(){ // fix title a in filter & swatch size in detail product page
    jQuery(".rt a").attr("data-title", function() { return jQuery(this).attr("title"); });
    jQuery(".rt a, .tags-prd").removeAttr("title");
  }
  ,toTopButton : function(){
    var to_top_btn = $("#scroll-to-top");
    if( 1 > to_top_btn.length ){
      return;
    }
    $(window).on( 'scroll' , function() {
      var b = jQuery(this).scrollTop();
      var c = jQuery(this).height();
      if (b > 100) {
        var d = b + c / 2;
      }
      else {
        var d = 1 ;
      }

      if (d < 1000 && d < c) {
        jQuery("#scroll-to-top").removeClass('on off').addClass('off');
      } else {
        jQuery("#scroll-to-top").removeClass('on off').addClass('on');
      }
    });

    to_top_btn.on( 'click',function (e) {
      e.preventDefault();
      jQuery('body,html').animate({scrollTop:0},800,'swing');
    });
  }

  ,toggleFilterSidebar : function(){
    jQuery(document).on('click','.filter-icon.toggle',function (e) {
      jQuery('.filter-component').slideToggle("slow");
    });
    jQuery(document).on('click','.filter-icon.drawer',function (e) {
      e.stopPropagation();
      AT_Main.fixNoScroll();
      jQuery('body').toggleClass('sidebar-opened');
    });

    jQuery('#page-body').on('click',function(e) {
      if (jQuery('html,body').hasClass('order-sidebar-opened')) {
        jQuery('html,body').removeClass('sidebar-opened order-sidebar-opened');
        AT_Main.fixReturnScroll();
      }
      if (jQuery('html,body').hasClass('sidebar-opened') && !$(e.target).parents('.filter-component').length) {
        jQuery('html,body').removeClass('sidebar-opened order-sidebar-opened');
        AT_Main.fixReturnScroll();
      }
    });

    jQuery('.f-close').on('click',function () {
      jQuery('#sidebar').removeClass('opened');
      jQuery('html,body').removeClass('sidebar-opened');
      AT_Main.fixReturnScroll();
    });
  }

  ,filterCatalogReplace : function(collectionUrl, filter_id){

    var value = collectionUrl.substring(collectionUrl.lastIndexOf('/') + 1);
    var val = value.substring(value.lastIndexOf('?'));

    collectionUrl = collectionUrl.replace(value, '');

    value = value.replace(val, '');
    value = value.replace('#', '');

    var value_arr = value.split('+');

    var current_arr = [];
    jQuery('#'+filter_id+' li.active-filter').each( function() {
      current_arr.push(jQuery(this).attr('data-handle'));
    });

    jQuery('#'+filter_id+' li.active-filter').find('a').attr('title', '');
    jQuery('#'+filter_id+' li').removeClass('active-filter');

    for(jQueryi = 0; jQueryi<current_arr.length; jQueryi++) {
      value_arr = jQuery.grep(value_arr, function( n, i ) { return ( n !== current_arr[jQueryi]  ); });
    }

    var new_data = value_arr.join('+')

    var new_url = collectionUrl+new_data+val;

    if( typeof AT_Filter != 'undefined' && AT_Filter ){
      AT_Filter.updateURL = true;
      AT_Filter.requestPage(new_url);
    }else{
      window.location = new_url;
    }
  }

  ,filterCatalog_AccordionHandle : function(){
    let filters = jQuery('.advanced-filter');
    if(filters.parents('.accordion').length > 0){
      $('.advanced-filters').each(function () {
        let parent = $(this);

        let active = false;
        parent.children('.advanced-filter').each(function(){
          if ($(this).hasClass('active-filter')) {
            active = true;
          }
        })

        if (active) {
          parent.parent().addClass('active del-before');
        }else{
          parent.parent().removeClass('active del-before');
        }
      })
    }
  }

  ,filterCatalog : function(){
    var currentTags = ''
    ,filters  = jQuery('.advanced-filter');

    filters.each(function() {
      var el = jQuery(this)
      ,group = el.data('group');

      if ( el.hasClass('active-filter') ) { //Remove class hidden
        el.parents('.sb-filter').find('a.clear-filter').removeClass('hidden');
        jQuery('#clear-all-filter').removeClass('hidden');

        el.parents('.sbw-filter.select').addClass('has-active').find('.advanced-filters').addClass('has-active');
      }
    });
    $('.advanced-tag-filter').each(function() {
      var el = jQuery(this)
      ,group = el.data('group');

      if ( el.hasClass('active-filter') ) { //Remove class hidden
        el.parents('.sb-filter').find('a.clear-filter').removeClass('hidden');
        jQuery('#clear-all-filter').removeClass('hidden');
      }
    });
    AT_Main.filterCatalog_AccordionHandle();

    filters.on('click', function(e) {
      var el = $(this)
      ,group = el.data('group')
      ,url = el.find('a').attr('href')
      if(url == 'javascript:void(0);'){return;}
        // Continue as normal if we're clicking on the active link
        if ( el.hasClass('active-filter') ) {
          return;
        }
        jQuery(this).parents('.sbw-filter').first().addClass('waiting');
        AT_Main.filterCatalog_AccordionHandle();

        var _logic = jQuery(".page-cata").data('logic');
        if( _logic ){
            // Get active group link (unidentified if there isn't one)
            activeTag = $('.active-filter[data-group="'+ group +'"]');
            // If a tag from this group is already selected, remove it from the new tag's URL and continue
            if ( activeTag && activeTag.data('group') === group ) {
              e.preventDefault();
              activeHandle = activeTag.data('handle') + '+';

              // Create new URL without the currently active handle
              url = url.replace(activeHandle, '');

              // window.location = url;
              AT_Filter.updateURL = true;
              AT_Filter.requestPage(url);
            }
          }
        });

    jQuery('.sb-filter').on('click', '.clear-filter', function(n){ // Handle button clear
      n.preventDefault();
      var filter_id = jQuery(this).attr('id');
      filter_id = filter_id.replace('clear-', '');
      jQuery(this).parents('.sbw-filter').first().addClass('waiting');
      jQuery(this).parents('.sbw-filter.select').removeClass('has-active').find('.advanced-filters').removeClass('has-active');
      var collectionUrl = window.location.href;
      if(collectionUrl.match(/\?/)){
        var string = collectionUrl.substring(collectionUrl.lastIndexOf('?') - 1);

        if(string.match(/\//)){
          var str_replace = string.replace(/\//, '');
          collectionUrl = collectionUrl.replace(string, '');
          collectionUrl = collectionUrl+str_replace;
          AT_Main.filterCatalogReplace(collectionUrl, filter_id);
        }
        else{
          AT_Main.filterCatalogReplace(collectionUrl, filter_id);
        }
      }
      else{
        var value = collectionUrl.substring(collectionUrl.lastIndexOf('/') + 1);
        collectionUrl = collectionUrl.substring(0,collectionUrl.lastIndexOf('/') + 1);
        value = value.replace('#', '');

        var value_arr = value.split('+');
        var current_arr = [];
        jQuery('#'+filter_id+' li.active-filter').each( function() {
          current_arr.push(jQuery(this).attr('data-handle'));
        });

        jQuery('#'+filter_id+' li.active-filter').find('a').attr('title', '');
        jQuery('#'+filter_id+' li').removeClass('active-filter');

        for(jQueryi = 0; jQueryi<current_arr.length; jQueryi++) {
          value_arr = jQuery.grep(value_arr, function( n, i ) { return ( n !== current_arr[jQueryi]  ); });
        }

        var new_data = value_arr.join('+')
        if ($(this).parents('.sb-filter').hasClass('tag')) {
          window.location.href = collectionUrl;
        }else{
          var new_url = collectionUrl+new_data;
          if( typeof AT_Filter != 'undefined' && AT_Filter ){
            AT_Filter.updateURL = true;
            AT_Filter.requestPage(new_url);
          }else{
            window.location = new_url;
          }
        }

      }

    });
    jQuery('.filter-component').on('click', '#clear-all-filter', function(n){
      var new_url = location.protocol + '//' + location.host + (location.pathname).substring(0,location.pathname.lastIndexOf('/')+1);
      AT_Filter.updateURL = true;
      AT_Filter.requestPage(new_url);
    });
  }

  ,sidebar_menu_handle : function(){// Handle menu sidebar
    $(document).on('click','.categories-menu .dropdown .expand, .sidebar-column .sb-filter',function(e){
      if ($(this).hasClass('active') && !$(this).hasClass('del-before')){
        $(this).removeClass('active');
        $(this).parent().removeClass('active');
      }else{
        $(this).parent().children().each(function(){
          if (!$(this).hasClass('del-before')) {
            $(this).removeClass('active');
          }
        })
        $(this).addClass('active');
        $(this).parent().addClass('active');
      }
    })

    $('.grid-uniform').length && $('.grid-uniform').each(function(){
      $(this).find('.advanced-filters').children().length == 0 && $(this).parents('.sb-widget').remove();
    });

    $(document).on('click','.sb-accordion',function(e){
      $(this).toggleClass('active').parent().find('.sb-content-accordion').toggleClass('hide');
    });
    $(document).on('mouseover','.sbw-filter.select',function(e){
      $(this).addClass('active').find('.advanced-filters').addClass('active');
    }).on('mouseleave','.sbw-filter.select',function(e){
      $(this).removeClass('active').find('.advanced-filters').removeClass('active');
    });
  }

  ,swatch : function(){
    jQuery('.swatch :radio').change(function() {
      var optionIndex = jQuery(this).closest('.swatch').attr('data-option-index');
      var optionValue = jQuery(this).val();
      jQuery(this)
      .closest('form')
      .find('.single-option-selector')
      .eq(optionIndex)
      .val(optionValue)
      .trigger('change');

    });
  }

  ,switchImgProduct: function() {
    $(document).on('click','.product-wrapper .swatch-element',function(){
      $(this).parents('.swatch').find('.swatch-element[data-value]').removeClass('active');
      $(this).addClass('active');
      var elem = $(this).find('label').first();
      var imgUrl = elem.data("swatch-image"),
      parent = elem.parents('.product-wrapper'),
      imgElem = parent.find('.product-image img').first();
      var _v = elem;
      if(imgElem.hasClass('lazyloaded')){
        var _img = _v.parent().find('.img-swt-temp');
        imgElem.attr('data-srcset',_img.attr('data-srcset'));
        imgElem.attr('srcset',_img.attr('srcset'));
      }else{
        imgElem.attr('src', imgUrl);
      };
    });

    $('.product-wrapper .swatch-element').hover(function(e){
      $(this).trigger('click');
    });
  }

  ,init_slick : function(type,selector,navfor = null){
    if (selector) {
      switch (type) {
        case 'gallery':
        selector.slick({
          slidesToShow: 1
          ,slidesToScroll: 1
          ,arrows: false
          ,fade: true
          ,useTransform: false
          ,asNavFor: navfor
        });
        break;
        case 'thumbnail':
        selector.slick({
          infinite: true
          ,slidesToShow: 5
          ,slidesToScroll: 1
          ,asNavFor: navfor
          ,focusOnSelect: true
          ,arrows: false
        });
        break;
        default:
          // statements_def
          break;
        }
      }
    }

    ,slickProductPage: function(){
      let _rtl = _bc_config.enable_rtl == 'true' ? true : false;
      jQuery('.slider-for-03').length && !jQuery('.slider-for-03').hasClass('slick-initialized') && jQuery('.slider-for-03').slick({
        slidesToShow: 1
        ,slidesToScroll: 1
        ,rtl:_rtl
        ,arrows: false
        ,fade: true
        ,useTransform: false
        ,asNavFor: '.slider-thumbs-03'
      });

      jQuery('.slider-thumbs-03').length && !jQuery('.slider-thumbs-03').hasClass('slick-initialized') &&jQuery('.slider-thumbs-03').slick({
       infinite: false
       ,slidesToShow: 5
       ,slidesToScroll: 1
       ,rtl:_rtl
       ,focusOnSelect: true
       ,arrows: true
       ,asNavFor: '.slider-for-03'
       ,prevArrow: $('.slick-thumb-btn-03 .btn-prev')
       ,nextArrow: $('.slick-thumb-btn-03 .btn-next')

     });

      jQuery('.slider-for-06').length && jQuery('.slider-for-06').slick({
        infinite: false
        ,slidesToShow: 1
        ,slidesToScroll: 1
        ,vertical: true
        ,verticalSwiping: true
        ,arrows: false
        ,asNavFor: '.slider-thumbs-06'
      });
      jQuery('.slider-thumbs-06').length && jQuery('.slider-thumbs-06').fadeIn() && jQuery('.slider-thumbs-06').slick({
        infinite : false
        ,slidesToShow : 5
        ,slidesToScroll : 1
        ,asNavFor : '.slider-for-06'
        ,vertical : true
        ,verticalSwiping : true
        ,dots : false
        ,arrows : false
        ,focusOnSelect : true

      });
      jQuery('.slider-thumbs-03, .slider-thumbs-06').removeClass('opacity-0');
    }
    ,productPage_variantFilter : function(groupImage){
      jQuery('#slide--thumbs').hasClass('slider-thumbs-06') && jQuery('#slide--thumbs .slick-list').addClass('full-height');
      jQuery('#slide--main').attr('data-filter',groupImage);
      if (jQuery('.slider-filter').hasClass('slick-initialized')) {
        jQuery('.slider-filter .slick-slide').each(function() {
          let _group_class = jQuery(this).find('.slick-item').attr('data-match');
          jQuery(this).addClass(_group_class);
        });
        if (groupImage == 'none-group') {
          jQuery('.slider-filter').slick('slickUnfilter');

        }else{
          jQuery('.slider-filter').slick('slickUnfilter');
          jQuery('.slider-filter').slick('slickFilter','.'+groupImage+',.group-all');
          jQuery('.slider-filter').attr('data-filter','.'+groupImage);
        }
      }
    }
    ,productPage_handle : function(){

      if ($('.page-product').length && !$('#product-image').hasClass('thumbnail-position-bottom')&& !$('.page-product').hasClass('product-slider')) {
        let main = $('#slide--main')
        ,thumb = $('#slide--thumbs');

        jQuery('.slider-filter').hasClass('slick-initialized') && jQuery('.slider-filter').slick('slickUnfilter');

        if (AT_Main.getWidthBrowser() > 767) {
          if (!main.hasClass('slick-gallery-image') && main.hasClass('slider-for-03')) {
            $('.slider-for-03,.slider-thumbs-03').slick('unslick');

            main.toggleClass('slider-for-03 slider-for-06');
            thumb.toggleClass('slider-thumbs-03 slider-thumbs-06 opacity-0');
            $('.slick-btn-03').addClass('hide');
            $('.slick-btn-06').removeClass('hide');
            AT_Main.slickProductPage();
          }

          if(main.hasClass('slick-gallery-image') && main.hasClass('slider-for-03')){
            $('.slider-for-03').slick('unslick');
            $('.slider-thumbs-03').length && $('.slider-thumbs-03').slick('unslick');
            main.removeClass('slider-for-03');
            main.children('.item').removeClass('slick-item');
            thumb.removeClass('slider-thumbs-03').addClass('hide');
            $('.slick-btn-03').addClass('hide');
          }
          $('#slide--main').data('zoom') && AT_Main.init_zoom_img();
        }
        else {
          if (main.hasClass('slider-for-06')) {
            $('.slider-for-06,.slider-thumbs-06').slick('unslick');
            main.toggleClass('slider-for-03 slider-for-06');
            thumb.toggleClass('slider-thumbs-03 slider-thumbs-06 opacity-0');
            $('.slick-btn-03').removeClass('hide');
            $('.slick-btn-06').addClass('hide');
            AT_Main.slickProductPage();
          }
          if(main.hasClass('slick-gallery-image') && !main.hasClass('slider-for-03')){
            main.addClass('slider-for-03');
            main.children('.item').addClass('slick-item');
            thumb.removeClass('hide').addClass('slider-thumbs-03');
            $('.slick-btn-03').removeClass('hide');
            AT_Main.slickProductPage();
          }
        }
        jQuery(".fancybox").length && jQuery(".fancybox").jqPhotoSwipe();
        let a = jQuery('#slide--main').attr('data-filter');
        if (a) {
          AT_Main.productPage_variantFilter(a);
          thumb.find('.slick-slide').first().trigger('click');
        }
      }
    }

    ,scareName : function(){
      var _name_height = 0;
      jQuery('.product-wrapper').find('h5.product-name').each(function( index,value ){
        _name_height = jQuery(value).outerHeight() > _name_height ? jQuery(value).outerHeight() : _name_height;
      });
      jQuery('.product-wrapper').find('h5.product-name').css('height',_name_height);
    }

    ,scareScreen : function(){
      if( typeof _bc_config == "undefined" ){
        return;
      }
      var _current = this;

      if( _bc_config.enable_title_blance == "true" ){
        this.scareName();
      }

      jQuery( document ).ajaxComplete(function( event,request, settings ) {
        if( _bc_config.enable_title_blance == "true" ){
          _current.scareName();
        }
      });
    }

    ,parallaxScroll : function(elem,param){
      if (typeof elem != 'undefined' || typeof param != 'undefined') {
        jQuery(window).on('scroll', function(){
          var pos = jQuery(window).scrollTop()
          ,top = elem.offset().top
          ,elemH = elem.height()
          ,windowH = jQuery(window).height();

          if ( pos < top || top > pos + windowH) {
            param.each(function(){param.css('transform', 'translateY(0px)');})
            return;
          }
          param.each(function(){param.css('transform', 'translateY(' + Math.round((pos-top) * 0.35) + 'px)');})
        });
      }
    }
    ,menuOnMobile_handle : function(){

      if($('.mobile-version .mega-menu .mega_columns').length > 0 ){
        $('.mobile-version .mega-menu .mega_columns').attr('style','');

        $('.mobile-version .mega-menu .mega-col').each(function(){
          $(this).parents('.row').first().before($(this).children());
        })
        $('.mobile-version .mega-menu .row').remove();
      }

      if($('.mobile-version .mega-menu .menu-proudct-carousel').length > 0){
        setTimeout(function(){
          $('.mobile-version .mega-menu .menu-proudct-carousel').prepend('<div class="back-prev-menu"><span class="expand"></span></div>');
        },500);
      }

      jQuery(document).on('click','.mobile-version .menu-mobile .main-nav .expand',function(event){
        let title = $(this).parent().find('a').first().text().trim().split('\n')[0];
        let e = $(this).parents('.dropdown').first();

        if(e.parent().hasClass('col-item')){
          e.parent().addClass('active');
          e.parents('.dropdown-menu').first().addClass('sub-open');
        }
        else{
          e.addClass('active');
          e.parent().addClass('sub-open');
        }
        if (e.hasClass('dropdown') ) {
          let child = e.children('.dropdown-menu');
          if(child.length > 0){
            if (child.hasClass('menu-mobile-open') == false) {
              if(child.find('.banners').length > 0){
                child.find('.banners').each(function(){
                  let el = $(this);
                  if (el.hasClass('no-title-2')) {
                    let img = el.children('.dropdown-menu').find('img');

                    let temp = el.children('.dropdown-menu').find('img').parents('li').first().html();
                    el.append(el.html(temp).removeClass('dropdown'));

                    if (img.length > 0 && !img.hasClass('lazyloaded')) {
                      el.addClass('hide')
                    }else{
                      el.removeClass('hide')
                    }

                  }
                })
              }
              child.addClass('menu-mobile-open');
              if (title.length > 0) {
                child.children('.back-prev-menu').find('.expand').html(title);
              }
              return false;
            }
          }
        }

        if ($(this).parent().hasClass('back-prev-menu')) {
          let e = $(this).parent();
          e.parents('.dropdown-menu').first().removeClass('menu-mobile-open');

          if(e.parents('.dropdown').first().parent().hasClass('col-item')){
            e.parents('.dropdown').first().parent().removeClass('active');
            e.parents('.sub-open').first().removeClass('sub-open');
          }
          else{
            e.parents('.dropdown').first().removeClass('active');
            e.parents('.dropdown').first().parent().removeClass('sub-open');
          }
        }

      });
    }

    ,megamenuWithTabs : function(){
      jQuery(".tab-title .title-item").hover(function(e){
        $('.title-item').removeClass('active is-hover');
        $('.tab-content-inner').removeClass('active is-hover');

        var _class = $(this).attr('data-id');
        var idclass = "." + _class;
        var e = jQuery(this);

        e.addClass('active is-hover');
        $(idclass).addClass('active is-hover').parents('.mm-tab-col-content').first().addClass('mega-hover-element');
      });

      jQuery(".mega-menu").mouseleave(function(){
        $('.title-item').removeClass('active is-hover');$('.title-item-1').addClass('active');
        $('.tab-content-inner').removeClass('active is-hover').parents('.mm-tab-col-content').first().removeClass('mega-hover-element');
        $('.mm-tabs-1').addClass('active');
      });
    }

    ,resizeCollection : function(){
      if ($('body').hasClass('templateCollection')) {
        let sb = $('.sidebar-column'),filter_height = $('.mobile-layout-bar')[0].clientHeight;
        if (AT_Main.getWidthBrowser() < 992 ){
          $('#footer-content').css('margin-bottom', filter_height);
          $('.filter-component').attr('style','').removeClass('accordion toggle full select hide').addClass('drawer');
          if (sb.length > 0) {
            $('.sb-widget .sbw-filter').each(function(){
              $(this).removeClass('accordion');
              $('.filter-component.drawer').append($(this));
            })
          }
        }else{
          $('#footer-content').css('margin-bottom', 0);
          $('.filter-component').removeClass('drawer').addClass($('.cata-toolbar').data('filter'));
          if (sb.length > 0) {
            $('.sb-widget').each(function(index,val){
              if ($(this).data('prefix')) {
                $(this).append($('.filter-component').find('.sb-filter.'+$(this).data('prefix')).parents('.sbw-filter'));
                $(this).data('filter') == 'accordion' && $(this).find('.sbw-filter').addClass('accordion');
              }
            })
            jQuery("#page-body").trigger('click');
          }
        }
      }
    }

    ,quickShop_drawerHandle : function(){
      $('#page-body').on('click',function(){
        if ($('body').hasClass('qs-opened')) {
          $('body').removeClass('qs-opened');
          $('.qs-drawer').removeClass('show');
          AT_Main.fixReturnScroll();
        }
        jQuery('.layer-addcart-modal').length && jQuery('.layer-addcart-modal').removeClass('show');
      })
    }

    ,updateLayerCart : function(obj){
      $('.cart-img').empty();
      $('.cart-info > p').empty();
      if (typeof obj == 'object') {
        let img = '<img class="lazyload" data-src="'+obj.image+'">';
        if ( obj.image == '' ){$('.cart-img').css('display', 'none');}
        else{$('.cart-img').html(img);}

        obj.variant_title ? $('.layer-addcart-modal .prod-subtitle').empty().html(obj.variant_title).show() : $('.layer-addcart-modal .prod-subtitle').hide();
        $('.layer-addcart-modal').wrap('<div class="layer-addcart-wrapper"></div>')
        $('.layer-addcart-modal .prod-title').empty().html(`<a href="${obj.url}" target="blank" rel="noopener">${obj.product_title}</a>`);
        $('.layer-addcart-modal .prod-price').empty().html('<span class="money">'+Shopify.formatMoney(obj.price, '')+"</span>");

        Shopify.getCart(function(cart) {
          $('.cart-count').html('('+cart.item_count + (cart.item_count > 1 ? ' items)' : ' item)'))
          $('#layer-cart-total').empty().html('<span class="money">'+Shopify.formatMoney(cart.total_price, '')+"</span>");
          if( _bc_config.show_multiple_currencies == 'true' ){currenciesCallbackSpecial('#layer-cart-total span.money');}
        });

        AT_Main.add_cart_related_product(obj);

        setTimeout(function(){
          let e, top;
          if (AT_Main.getWidthBrowser() >= 768) {
            e   = $('#header-style .header-desktop');
            top = !e.data('sticky') ? 0 : $(window).scrollTop() > 0 ? e.outerHeight() : e.outerHeight()+ $('#topbar').outerHeight();
            $('.layer-addcart-modal').css('top', top+'px');
          }
          AT_Main.fixNoScroll();
          $('.layer-addcart-modal').addClass('show');
          $('.add-to-cart-sticky').hasClass('show') && $('.add-to-cart-sticky').addClass('hide');
        },500)
      }
      else {
        $('.layer-addcart-modal').after(`<div class="modal fade" id="bundled_cart">
          <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
          <div class="modal-header">
          <button type="button" class="close btn btn-1" data-dismiss="modal"><i class="demo-icon icon-delete"></i></button>
          </div>
          <div class="modal-body">
          <p><span class="h5">All Bundled has been add to your cart</span></p>
          <p><a href="/cart">View cart</a></p>
          </div>
          </div>
          </div>
          </div>`);
        $("#bundled_cart").modal('show');
        $("#bundled_cart").on('hidden.bs.modal',()=>$('#bundled_cart').remove());
      }
    }
    ,add_cart_related_product : function(obj){
      let layer_related = '#layer-addcart-related';
      let url_recommend = '/recommendations/products.json?product_id=' + obj.product_id + '&limit=4';

      jQuery(layer_related).length && jQuery(layer_related).remove();
      jQuery('.layer-related-wrapper').append('<div id="layer-addcart-related" class="owl-carousel" data-owl-md="4" data-owl-xs="2" data-padding-md="30" data-padding-xs="15"></div>')
      jQuery(layer_related).empty().parent().hide();

      jQuery.ajax({
        type: 'GET',
        url: url_recommend,
        success: function ( json_reponse ) {
          let products = json_reponse.products, have_product = false, pt='';
          jQuery.each(products, function(i) {
            let product = products[i];
            if (product.available) {
            //<img class="lazyload img-lazy" data-src="${Shopify.Products.resizeImage(product.featured_image, "390x")}" />
            var temp = `<div class="product-wrapper">
            <div class="product-head">
            <div class="product-image">
            <div class="featured-img">
            <a href="${product.url}">
            <span class="image--style">
            <img class="img-lazy" src="${product.featured_image}" />
            </span>
            </a>
            </div>
            </div>
            </div>
            <div class="product-content text-left">
            <div class="pc-inner">
            <div class="prod-name">
            <h5 class="product-name">
            <a href="${product.url}" title="${product.title}">${product.title}</a>
            </h5>
            </div>
            <div class="product-price notranslate">
            <span class="price-sale">${Shopify.formatMoney(product.price, '')}</span>
            </div>
            </div>
            </div>
            </div>`;
            have_product = true;
            jQuery(layer_related).append(temp);

          }
        })
          if (have_product) {
            jQuery(layer_related).parent().fadeIn();
            AT_Main.init_carousel(jQuery(layer_related));
          }
        }
      });
    }

    ,toggleCartSidebar : function(){
      jQuery('.cart-toggle').on('click',function (e) {
        if (!jQuery('body').hasClass('templateCart')) {
          e.stopPropagation();
          AT_Main.fixNoScroll();
          jQuery('.cart-sb').toggleClass('opened');
          jQuery('body').toggleClass('cart-opened');
        }
      });

      jQuery('#page-body, .c-close').on('click',function () {
        if (jQuery('.cart-sb').hasClass('opened')||jQuery('html,body').hasClass('cart-opened')||jQuery(".dropdown").hasClass('menu-mobile-open')) {
          jQuery('.cart-sb').removeClass('opened');
          jQuery('html,body').removeClass('cart-opened');
          jQuery(".dropdown").removeClass("menu-mobile-open");
          AT_Main.fixReturnScroll();
        }
      });

      jQuery('.am-close').on('click',function (e) {
        jQuery('.layer-addcart-modal').removeClass('show').unwrap('<div class="layer-addcart-wrapper"></div>');
        AT_Main.fixReturnScroll();
        $('.add-to-cart-sticky').hasClass('show') && $('.add-to-cart-sticky').removeClass('hide');
      });
    }

    ,cart_event_handle : function(){
      AT_Main.cartMobile();

      if (jQuery('body').hasClass('templateCart') && AT_Main.getWidthBrowser() < 768 && jQuery('.mobile-fixed').length) {
        let e = jQuery('.mobile-fixed'),h = e[0].clientHeight;
        if (h == 0) {
          e = jQuery('.mobile-fixed.sticky');
          h = e[0].clientHeight;
        }
        e.length && e[0].clientHeight > 0 && e.parent().css('min-height', e[0].clientHeight+'px');
      }

      jQuery(document).on('click','.layer-addcart-wrapper',function(e){
        let c = e.target.className;
        if (c == 'layer-addcart-modal show' || c == 'layer-addcart-wrapper'){
          jQuery('.am-close').trigger('click');
        }
      });
    }
    ,cartMobile : function(){
      if (jQuery('body').hasClass('templateCart') && AT_Main.getWidthBrowser() < 768 && jQuery('.mobile-fixed').length) {
        let e = jQuery('.mobile-fixed'), top = e.offset().top;
        if (typeof e != 'undefined') {
          jQuery(window).on('scroll' , function() {jQuery(window).scrollTop() < top ? e.removeClass('sticky') : e.addClass('sticky')})
        }
      }
    }
    ,fixedHeader : function(){
      var elem
      ,parent_elem = $('#header-style')
      ,_topbar     = $('#topbar')
      ,scroll      =  parent_elem.offset().top + parent_elem[0].clientHeight;

      if (AT_Main.getWidthBrowser() > 991) {
        elem = $('.header-desktop');
        if (elem.data('sticky')){$(window).scrollTop() < scroll ? parent_elem.removeClass('h-desk-sticky') : parent_elem.addClass('h-desk-sticky');}
      }
      else {
        elem = $('.header-mobile');
        if (elem.data('sticky')) {$(window).scrollTop() < scroll ? parent_elem.removeClass('h-mobi-sticky') : parent_elem.addClass('h-mobi-sticky');}
      }
    }
    ,header_event_handle : function(){
      jQuery(document).on('click','.m-customer-account span',function(){
        jQuery(this).parent().find('.popup-icons').toggleClass('open op-click');
      });

      jQuery(document).on('click','.topbar-popup',function(e){
        jQuery(this).parents('.menu-mobile').length && jQuery('#page-body').trigger('click');
        var elem = jQuery('#topbar-popup');
        elem.toggleClass('open');
        jQuery('.popup-wrapper').length ? elem.unwrap('<div class="popup-wrapper"></div>') : elem.wrap('<div class="popup-wrapper"></div>');
        AT_Main.fixNoScroll();
      });

      jQuery(document).on('click','.topbar-popup-close',function(e){
        if (jQuery(this).parents('#topbar-popup').length || jQuery(this).parents('.popup-icons-mobile').length) {
          jQuery(this).parents('.popup-icons-mobile').length && jQuery('.popup-wrapper .popup-icons-mobile').length && jQuery('.popup-icons-mobile').addClass('hide').unwrap('<div class="popup-wrapper"></div>');

          if (jQuery(this).parents('#topbar-popup').length && jQuery('.popup-wrapper #topbar-popup').length) {
            jQuery('#topbar-popup').removeClass('open').unwrap('<div class="popup-wrapper"></div>');
            jQuery('#topbar-popup .f-select').find('a').removeClass('active');
            jQuery('#topbar-popup .f-select').find('ul').removeClass('open');
          }
          AT_Main.fixReturnScroll();
        }
      });

      jQuery(document).on('click','.popup-wrapper',function(e){
        e.target.className == 'popup-wrapper' && jQuery('.topbar-popup-close').trigger('click');
      });

      jQuery(document).on('click','.f-select > a',function(e){
        e.preventDefault();
        jQuery(this).toggleClass('active').parents('.f-select').children('ul').toggleClass('open');
      });

      jQuery('.mm-block-icons .wishlist-target, .mm-block-icons .compare-target, .m-close').on('click',function () {
        jQuery(".menu-mobile").removeClass("opened");
        AT_Main.fixReturnScroll();
      });

      jQuery(document).on('click','.responsive-menu-mobile',function(e){
        jQuery(".menu-mobile").hasClass("opened") ? AT_Main.fixReturnScroll() : AT_Main.fixNoScroll();
        jQuery(".menu-mobile").toggleClass("opened");
        jQuery('body').addClass('menu-opened');
        if (jQuery('.mobile-version').hasClass('mobile-style-1')) {
          let top   = jQuery('.header-mobile')[0].clientHeight - jQuery('.mobile-searchbox')[0].clientHeight
          ,menu = jQuery('.mobile-version .menu-mobile');

          if (jQuery(window).scrollTop() == 0 && jQuery('#topbar').length) {
            top = top + jQuery('#topbar')[0].clientHeight;
          }

          menu.css('top', top+'px').css('height', 'calc(100% - '+top+'px');
        }
      });

      jQuery(document).on('click','.header-mobile .m-customer-account:not(.no-popup)',()=>{
        let e = jQuery('.popup-icons-mobile');
        e.removeClass('hide');
        e.wrap('<div class="popup-wrapper"></div>');
        AT_Main.fixNoScroll();
      });

      jQuery('#page-body').on('click',function (e) {
        if (jQuery(".menu-mobile").hasClass('opened') && e.target.className != 'responsive-menu-mobile responsive-menu' && e.target.className != 'bar'){
          jQuery(".menu-mobile").removeClass("opened");
          AT_Main.fixReturnScroll();
        }
      });

      jQuery(document).on('click','.top-cart-holder.hover-dropdown .cart-target',function(){
        var e=jQuery(this);
        e.hasClass("opened") ? e.removeClass("opened") : e.addClass("opened");
      });

    }
    ,header_handle : function(){
      let header       = $('.header-desktop');
      let bg_color_ori = header.data('color');
      let bg_color     = bg_color_ori.replace(header.data('opacity'), 1);

      if (!$('body').hasClass('templateIndex')){ $('#header-style').removeClass('h-desk-absolute'); }

      var elem_height = AT_Main.getWidthBrowser() >= 992 ? $('.header-desktop') : $('.header-mobile');
      $('#header-style').css('min-height',elem_height[0].clientHeight);
      AT_Main.fixedHeader();
      $(window).on('scroll' , function() {
        let ps = $(window).scrollTop(), topbar = $('#header-style .topbar');

        if ($('.header-desktop').data('sticky') && AT_Main.getWidthBrowser() > 991 && $('header').hasClass('h-desk-color')) {
          if (ps > 0) {
            $('body').hasClass('templateIndex') && header.css('background', bg_color);
          }else{
            $('body').hasClass('templateIndex') && header.css('background', bg_color_ori);
          }
        }
        AT_Main.fixedHeader();
      })

    }
    ,search_event : function(){
      jQuery(document).on('click','.header-mobile .search-popup',()=>{
        jQuery('.header-mobile .searchbox.mobile-searchbox').slideToggle();
      })

    }
    ,search_handle : function(){
      let s = jQuery('#header-style').data('style')
      ,_header_style = false
      ,_search_type = _bc_config.search_type;

      if (s == 2 || s == 5 || s == 6 ) {
        _header_style = true;
      }

      if (AT_Main.getWidthBrowser() > 991) {
        jQuery('.mobile-searchbox form > input[type="text"]').removeAttr('id');
        jQuery('#searchModal form > input[type="text"]').attr('id', 'bc-product-search');

        if (_header_style ) {
         jQuery('#searchModal form > input[type="text"]').removeAttr('id');
         jQuery('#header-search form > input[type="text"]').attr('id', 'bc-product-search');
       }
     }
     else if (_search_type == 'drawer'){
      jQuery('#searchModal form > input[type="text"]').attr('id', 'bc-product-search');
      jQuery('.mobile-searchbox form > input[type="text"]').removeAttr('id');
      if (_header_style) {
        jQuery('#header-search form > input[type="text"]').removeAttr('id');
      }
    }
    else {
      jQuery('#searchModal form > input[type="text"]').removeAttr('id');
      jQuery('.mobile-searchbox form > input[type="text"]').attr('id', 'bc-product-search');
      if (_header_style) {
        jQuery('#header-search form > input[type="text"]').removeAttr('id');
      }
    }
  }

  ,deadLine_time : function(){
    var _deadline_time = parseInt($('.shipping-time').attr('data-deadline'));
    var _currentDate = new Date();

    var _dueDate = new Date( _currentDate.getFullYear(), _currentDate.getMonth(), _currentDate.getDate());
    _dueDate.setHours(_deadline_time);

    switch(_currentDate.getDay()) {
      case 0: // Sunday
      _dueDate.setDate(_dueDate.getDate() + 1);
      break;

      case 5: // Friday
      if(_currentDate >= _dueDate){
        _dueDate.setDate(_dueDate.getDate() + 3);
      }
      break;

      case 6: // Saturday
      _dueDate.setDate(_dueDate.getDate() + 2);
      break;

      default:
      if(_currentDate >= _dueDate){
        _dueDate.setDate(_dueDate.getDate() + 1);
      }
    }
    var newDate = new Date(_dueDate).getTime() / 1000;
    var nowSecond = new Date().getTime() / 1000
    ,secondTime = newDate > nowSecond ? newDate - nowSecond : 0;

    secondTime > 0 && AT_Main.init_EasyTimer($('.countdown_deadline'),secondTime) && $('.shipping-time').removeClass('hide');
  }
  ,delivery_time : function(){
    var today = new Date();
    var business_days = parseInt($('.shipping-time').attr('data-deliverytime'));
        var deliveryDate = today; //will be incremented by the for loop
        var total_days = business_days; //will be used by the for loop

        for(var days=1; days <= total_days; days++) {
          deliveryDate = new Date(today.getTime() + (days *24*60*60*1000));
          if(deliveryDate.getDay() == 0 || deliveryDate.getDay() == 6) {
            //it's a weekend day so we increase the total_days of 1
            total_days++
          }
        }

        var weekday = new Array(7);
        weekday[0] =  "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thurday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        var _day = weekday[deliveryDate.getDay()];

        var month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March ";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        var _month = month[deliveryDate.getMonth()];

        $('.delivery-time').html('Want it delivered by' + '&nbsp;' + '<strong>' + _day + ',' + '&nbsp;' + deliveryDate.getDate() + '&nbsp;' + _month + '?' + '</strong>');
        $('.shipping-time').removeClass('hide');
      }

  ,addEvent : function(obj, evt, fn){ // Exit intent
    if (obj.addEventListener) {
      obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
      obj.attachEvent("on" + evt, fn);
    }
  }

  ,exitIntent : function(){  // Exit intent trigger
    AT_Main.addEvent(document, 'mouseout', function(evt) {

      if (evt.toElement == null && evt.relatedTarget == null ) {
        AT_Main.newsletterPopupAction();
      };

    });
  }

  ,newsletterPopupAction : function(){ // Action newsletter popup
    let expire = jQuery("#newsletter-popup").data('expires');

    if (jQuery.cookie('mycookie')) {
      //it hasn't been one days yet
    }
    else {
      $('#newsletter_popup').modal('show');
    }
    jQuery.cookie('mycookie', 'true', { expires: expire });
  }

  ,newsletterPopupDelayAction : function(){ // Action newsletter popup with delay time
    let delay  = jQuery("#newsletter-popup").data('delay');
    let expire = jQuery("#newsletter-popup").data('expires');
    if (jQuery.cookie('mycookie')) {
      //it hasn't been one days yet
    }
    else {
      setTimeout(function(){
        $('#newsletter_popup').modal('show');
      }, delay);
    }
    jQuery.cookie('mycookie', 'true', { expires: expire });
  }

  ,newsletterPopup : function(){ // Show newsletter popup
    let style = jQuery("#newsletter-popup").data('style');

    if ($('.newsletter-popup-content').length > 0){
      if (style == 'delay'){
        AT_Main.newsletterPopupDelayAction();
      }

      else if (style == 'exit-intent'){
        AT_Main.exitIntent();
      }

      else{
        jQuery(window).scroll(function() {
          let scroll_position = jQuery("#newsletter-popup").data('scroll');
          let newsletter_st = jQuery(this).scrollTop();

          if (newsletter_st > scroll_position ) {
            AT_Main.newsletterPopupAction();
          }
        });
      }

      jQuery('.np-close').on('click',function (e) {
        $('#newsletter_popup').modal('hide');
      })
    }
    else {return ;}
  }

  ,newsletterCoupon: function(){ // Show coupon code when subscribe newsletter

    jQuery('#mc-button').on('click', function (event) {
      if (event) event.preventDefault()
        let $form = $('#mc-form');

      jQuery.ajax({
        type: 'POST',
        url: $form.attr('action'),
        data: $form.serialize(),
        cache: false,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        error: function (err) { alert('Could not connect to the registration server. Please try again later.') },
        success: function (data) {
          jQuery('.text-box-image').hide();
          jQuery('.subscribe-result').show();
          jQuery('.newsletter-popup-content').removeClass('block-image-true').addClass('block-image-false');
        }
      })
    })

    jQuery('.btn-copy').on('click',function (e) {
      var _temp = $('<input>');
      $("body").append($temp);
      _temp.val($('#mycode').text()).select();
      document.execCommand("copy");
      _temp.remove();
    })
  }

  ,init_zoom_img : function(){
    $('.image-zoom').parent().trigger('zoom.destroy');
    if (AT_Main.getWidthBrowser() > 767 ) {
      $('.image-zoom').each(function(index, el) {
        let largeImg = $(this).parents('.image-zoom-parent').data('zoom-size');
        if(typeof largeImg != 'undefined'){
          $(this).parents('.image-zoom-parent').zoom({
            url: largeImg,
            on:'mouseover',
            touch:false
          });
        }

      });
    }
  }
  ,init_CountDown : function(){
    $('.block-countdown').length && $('.block-countdown').each(function(){
      if ($(this).data('date') != '') {
        var $this   = $(this)
        ,id         = $this.find('.wrapper-countdown').data('id')
        ,newTime    = $this.find('.wrapper-countdown').data('date').toString().split('/')
        ,newSecond  = new Date(newTime[2], Number(newTime[0])-1, newTime[1]).getTime() / 1000
        ,nowSecond  = new Date().getTime() / 1000
        ,secondTime = newSecond > nowSecond ? newSecond - nowSecond : 0;

        if (secondTime > 0) {
          AT_Main.init_EasyTimer($('.countdown_'+id),secondTime);
          setTimeout(()=>$this.removeClass('hide'),100);
        }
      }
    });
  }
  ,init_EasyTimer : function(selector,time_second){
    var timer = new easytimer.Timer(), s_max = 0;
    timer.start({countdown: true, startValues: {seconds: time_second}});
    selector.html(`<span class="count-day hide">    <span class="date-number"></span><span class="text-date">Day</span></span>
     <span class="count-hours hide">  <span class="date-number"></span><span class="text-date">Hrs</span></span>
     <span class="count-minutes hide"><span class="date-number"></span><span class="text-date">Min</span></span>
     <span class="count-seconds hide"><span class="date-number"></span><span class="text-date">Sec</span></span>`);

    timer.addEventListener('secondsUpdated', function (e) {
      timer.getTimeValues().days > 0  && selector.find('.count-day').removeClass('hide').children('.date-number').html(timer.getTimeValues().days);
      timer.getTimeValues().hours > 0 && selector.find('.count-hours').removeClass('hide').children('.date-number').html(timer.getTimeValues().hours);
      selector.find('.count-minutes').removeClass('hide').children('.date-number').html(timer.getTimeValues().minutes);
      selector.find('.count-seconds').removeClass('hide').children('.date-number').html(timer.getTimeValues().seconds);
      let n_smax = selector.innerWidth();
      if (n_smax > s_max) {
        s_max = n_smax;
        selector.css('min-width', s_max+'px');
      }
    });
    timer.addEventListener('targetAchieved', function (e) {selector.remove();});
  }
  ,init_carousel : function(el){
    el.length && el.each(function(index, value) {
      var e = $(this);
      if (!e.hasClass('owl-loaded')) {
        var _rtl      = _bc_config.enable_rtl == 'true' ? true    : false
        ,_owl_xs      = e.data('owl-xs') ? e.data('owl-xs')  : 1
        ,_owl_xxs     = e.data('owl-xxs')? e.data('owl-xxs') : _owl_xs
        ,_owl_sm      = e.data('owl-sm') ? e.data('owl-sm')  : _owl_xs
        ,_owl_md      = e.data('owl-md') ? e.data('owl-md')  : _owl_sm
        ,_owl_lg      = e.data('owl-lg') ? e.data('owl-lg')  : _owl_md
        ,_owl_xl      = e.data('owl-xl') ? e.data('owl-xl')  : _owl_lg
        ,_loop        = e.data('loop')        ? e.data('loop')        : false
        ,_nav         = e.data('nav')         ? e.data('nav')         : false
        ,_dot         = e.data('dot')         ? e.data('dot')         : false
        ,_autoplay    = e.data('autoplay')    ? e.data('autoplay')    : false
        ,_thumbs      = e.data('thumbs')      ? e.data('thumbs')      : false
        ,_padding_md  = e.data('padding-md')  ? e.data('padding-md')  : 0
        ,_padding_xs  = e.data('padding-xs')  ? e.data('padding-xs')  : 0
        ,_center      = e.data('center')      ? e.data('center')      : false
        ,_duration    = e.data('duration')    ? e.data('duration')    : 3000
        ,_effectIn    = e.data('effect-in')   ? e.data('effect-in')   : false
        ,_effectOut   = e.data('effect-out')  ? e.data('effect-out')  : false;


        !e.hasClass('owl-carousel') && e.addClass('owl-carousel');
        !e.hasClass('owl-loaded') && e.owlCarousel({
          rtl                : _rtl
          ,autoplay           : _autoplay
          ,autoplayTimeout    : _duration
          ,center             : _center
          ,nav                : _nav
          ,dots               : _dot
          ,thumbs             : _thumbs
          ,thumbsPrerendered  : _thumbs
          ,animateIn          : _effectIn
          ,animateOut         : _effectOut
          ,responsive : {
            0:{
              items   : _owl_xs
              ,margin : _padding_xs
              ,loop: !Number.isInteger(_owl_xs) && e.children().length >= _owl_xs ? true :  _loop
            }
            ,375:{
              items   : _owl_xxs
              ,margin : _padding_xs
              ,loop: !Number.isInteger(_owl_xxs) && e.children().length >= _owl_xxs ? true :  _loop
            }
            ,576:{
              items   : _owl_sm
              ,margin : _padding_xs
              ,loop: !Number.isInteger(_owl_sm) && e.children().length >= _owl_sm ? true :  _loop
            }
            ,768:{
              items   : _owl_md
              ,margin : _padding_md
              ,loop: !Number.isInteger(_owl_md) && e.children().length >= _owl_md ? true :  _loop
            }
            ,992:{
              items   : _owl_lg
              ,margin : _padding_md
              ,loop: !Number.isInteger(_owl_lg) && e.children().length >= _owl_lg ? true :  _loop
            }
            ,1200:{
              items   : _owl_xl
              ,margin : _padding_md
              ,loop: !Number.isInteger(_owl_xl) && e.children().length >= _owl_xl ? true :  _loop
            }
          }
          ,navText  : ['<span class="button-prev"></span>', '<span class="button-next"></span>']
        });
      }
    })
    AT_Main.init_CountDown();
  }
  ,init_masonry : function(){
    jQuery('.home-banner-items').length && jQuery('.home-banner-items').each(function(){
      if (jQuery(this).find('.home-banner-carousel').length) {
        AT_Main.init_carousel(jQuery('.home-banner-carousel'));
      }

      if (jQuery(this).find('.home-banner-masonry').length) {
        let i_masonry = function(e,grid){
          e = new Muuri(grid, {
            items: '.banner-item'
            ,layoutOnResize: true
            ,visibleStyles: {}
            ,layout: {
              fillGaps: false,
              rounding: false
            }
          });
        }

        let _class = '.' + jQuery(this).find('.home-banner-masonry').attr('class').replace(' ','.') + ' .bc-masonry';
        jQuery(this).find('.bc-masonry').each(function(){
          let $module = jQuery(this);
          this.addEventListener('load', i_masonry($module,_class), true);
          i_masonry($module,'.bc-masonry');
          jQuery(window).resize(function() {i_masonry($module,'.bc-masonry')});
        });

      }
    });
    AT_Main.init_CountDown();
  }
  ,resize_handle : function(){
    AT_Main.fixReturnScroll();/*Reset Page when fixNoScroll had called before*/
    AT_Main.resizeCollection();
    AT_Main.header_handle();
    AT_Main.productPage_handle();
    AT_Main.search_handle();
    AT_Main.fixedHeader();
    AT_Main.cartMobile();
    if(AT_Main.checkLayout() != 1 && jQuery('.menu-mobile').hasClass('opened')){
      jQuery("#page-body").trigger('click');
    }
  }
  ,init_onload : function(){
    AT_Main.scareScreen();
  }
  ,init_handle : function(){
    jQuery('.new-loading').after(jQuery('.mobile-version'));

    jQuery('.rating-links a').click(function() {
      jQuery('.product-simple-tab ul li a').removeClass('active');
      jQuery('#tab_review_tabbed a').addClass('active');
      jQuery('.product-simple-tab .tab-content .tab-pane').removeClass('show active');
      jQuery('#tab-review').addClass('show active');
      jQuery('#tab_review_tabbed').scrollToMe();
      return false;
    });

    !jQuery('.description-product li:first-child').hasClass('active') && jQuery('.description-product ul').find('li').first().children('a').trigger('click');

    jQuery(document)
    .on('click', '[name="checkout"], [name="goto_pp"], [name="goto_gc"]', function() {
      if (jQuery(this).data('term')) {
        if (jQuery('#agree').is(':checked')) {jQuery(this).submit();}
        else {
          alert("You must AGREE with Terms and Conditions.");
          return false;
        }
      }
    })
    .on('click','#agree-mobile', function(){
      jQuery('#agree-mobile').is(':checked') ? jQuery('#agree').prop('checked', true) : jQuery('#agree').prop('checked', false);
    })
    .on('click','.nav-ver-2 a.nav-link',function(event){
      event.preventDefault();
      let e = $(this).parent();

      if (e.hasClass('active')) {
        e.removeClass('active').find('.tab-pane').slideUp().removeClass('show active');
      }else{
        e.addClass('active').find('.tab-pane').slideDown().addClass('show active');
      }
      if (AT_Main.getWidthBrowser() < 991) {
        if (e.hasClass('active')) {
          let top = e.offset().top - 150;
          jQuery('body,html').animate({scrollTop:top},800,'swing');
        }
      }
    })
    .on('click','.search-icon[data-toggle="modal"]' , function(e) {
      if (jQuery(window).scrollTop() == 0) {
        let layer_search = jQuery('.header-desktop').offset().top + jQuery('.header-desktop')[0].clientHeight;
        jQuery('#searchModal').css('top',layer_search+'px');
      }
    });

    jQuery('#share-post').on('click',function(){jQuery('#share-post-cotent').slideToggle();});
    jQuery('#searchModal').on( 'hidden.bs.modal', function () {jQuery(this).removeAttr('style').hide();});

    if (jQuery('.sbw-filter').length) {
      jQuery('.sbw-filter').each(function(){
        let _this = jQuery(this);
        _this.find('.advanced-filters li').length == 0 && _this.remove();
      })
    }
  }

  ,init : function(){
    if( typeof _bc_config == 'undefined' ){
     console.log( " _bc_config is undefined " );
     return ;
   }

   this.effectNavigation();
   this.filterCatalog();
   this.fixButton();
   this.fixTitle();
   this.handleGridList();
   this.handleMenuMultiLine();
   this.init_CountDown();
   this.init_handle();
   this.menuOnMobile_handle();
   this.menuOnMobile();
   this.quickShop_drawerHandle();
   this.resizeCollection();
   this.search_handle();
   this.swatch();
   this.switchImgProduct();
   this.toTopButton();
   this.toggleCartSidebar();
   this.toggleFilterSidebar();
   this.sidebar_menu_handle();
   this.productPage_handle();
   this.header_event_handle();
   this.cart_event_handle();
   this.search_event();
 }
}


/* Handle when window resize */
jQuery(window).resize(AT_Main.resize_handle);

jQuery(window).on('load', AT_Main.init_onload)

jQuery(document).ready(function($) {
  
  AT_Main.init();
  var i_sections = new theme.Sections();
  i_sections.register('slideshow',      function(){if ( bcMsieVersion.MsieVersion() == 0 ){AT_Main.homeSlideshow();}else{AT_Main.homeIE();}});
  i_sections.register('partner',        function(){AT_Main.init_carousel(jQuery('.widget-partner-carousel'))});
  i_sections.register('product-grid',   function(){AT_Main.init_carousel(jQuery('.ps-list'))});
  i_sections.register('product-listing',function(){AT_Main.init_carousel(jQuery('.listing-block-carousel'))});
  i_sections.register('product-tabs',   function(){AT_Main.init_carousel(jQuery('.tabs-list-carousel'))});
  i_sections.register('blog-section',   function(){AT_Main.init_carousel(jQuery('.blog-carousel'))});
  i_sections.register('image-gallery',  function(){AT_Main.init_masonry()});
  i_sections.register('blog',           function(){AT_Main.init_masonry()});
  i_sections.register('topbar',         function(){AT_Main.init_CountDown()});
  i_sections.register('collection-list', function(){AT_Main.init_carousel(jQuery('.collection-cs-list'))});
  i_sections.register('customer',        function(){AT_Main.init_carousel(jQuery('.customer-carousel'))});
  i_sections.register('header',         function(){
    AT_Main.header_handle();
    AT_Main.megamenuWithTabs();
    AT_Main.init_carousel(jQuery(".menu-proudct-carousel"));

    $('.shopify-block-mega-element').on('shopify:block:select', function(){
      $(this).addClass('mega-hover--active hover');
    }).on('shopify:block:deselect', function(){
      $(this).removeClass('mega-hover--active hover');
    })
    $('.shopify-block-mega-element li.title-item').on('shopify:block:select', function(){
      $(this).addClass('mega-hover--active hover').parents('ul.tab-title').first().addClass('block-shopify--hover');
      $('#'+$(this).attr('data-id')).addClass('mega-hover--active hover').parents('.mm-tab-col-content').first().addClass('block-shopify--hover');

    }).on('shopify:block:deselect', function(){
      $(this).removeClass('mega-hover--active hover');
      $('#'+$(this).attr('data-id')).removeClass('mega-hover--active hover').parents('ul.tab-title').first().removeClass('block-shopify--hover');
    })

  });
  i_sections.register('home-left',      function(){
    AT_Main.init_carousel(jQuery(".sb-product-carousel"));
    AT_Main.init_carousel(jQuery(".sb-banner-list"));
  });
  i_sections.register('collectionPage', function(){
    AT_Main.init_carousel(jQuery(".sb-product-carousel"));
    AT_Main.init_carousel(jQuery(".sb-banner-list"));
    AT_Main.handleGridList();
    let collectionItem = jQuery('.page-cata');
    if (collectionItem.find('.home-banner-masonry').length) {
      let i_masonry = function(e,grid){
        e = new Muuri(grid, {
          items: '.banner-item'
          ,layoutOnResize: true
          ,visibleStyles: {}
          ,layout: {
            fillGaps: false,
            rounding: false
          }
        })
      }

      let _class = '.' + collectionItem.find('.home-banner-masonry').attr('class').replace(' ','.') + ' .bc-masonry';
      collectionItem.find('.bc-masonry').each(function(){
        let $module = $(this);
        this.addEventListener('load', i_masonry($module,_class), true);
        i_masonry($module,'.bc-masonry');

        collectionItem.find('.bc-masonry').length && $(window).resize(function(event) {i_masonry($module,'.bc-masonry')});
      });
    }
  })

  i_sections.register('single-product',  function(){
    jQuery('.single-product-section').each(function(){
      let id = jQuery(this).data('section-id');
      jQuery(this).data('parallax') && AT_Main.parallaxScroll(jQuery('#single-product-'+id),jQuery('#single-product-'+id+' .bg-image'));
    });
  });
  i_sections.register('newsletter-popup',function(){
    AT_Main.newsletterPopup();
    AT_Main.newsletterCoupon();
    AT_Main.init_CountDown();
    $("#newsletter-popup").on('shopify:block:select', function(){$('#newsletter_popup').modal('show');});
    $("#newsletter-popup").on('shopify:block:deselect', function(){$('#newsletter_popup').modal('hide');});
  });
  i_sections.register('product-page', function(){
    $('#discount-modal').on('shopify:block:select',function(){$(this).show();}).on('shopify:block:deselect',function(){$(this).hide();})
    if ($('.nav-ver-2').length) {
      $('.nav-ver-2 li').removeClass('active').find('.tab-pane').removeClass('show active');
      $('.nav-ver-2 li').first().addClass('active').find('.tab-pane').addClass('show active');
    }
  });
  
});
      

      
  
