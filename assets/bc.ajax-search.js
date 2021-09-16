var AT_AjaxSearch = {
  ajaxProductItems : function( input_element, result_wrapper, result_element ){
    var search_url  = '/search'
        ,result     = new Array()
        ,_keyword   = input_element.val();

    jQuery.ajax({
        type: 'GET',
        data: {
            q: "*" + _keyword + "*",
            type: "",
            view: "json",
        },
        dataType: "json",
        url: search_url,
        complete:function(){
            jQuery('.searchbox').removeClass("s-loading");
            result_element.removeClass('fake-search');
        },
        success: function ( json_reponse ) {
          
          if( json_reponse.length > 0 ){
            result_element.empty();
            for (var i = 0; i < json_reponse.length; i++) {
              if (i >= 5) {break;}
              var item           = json_reponse[i]
                  ,title         = item.title
                  ,price         = item.price
                  ,handle        = item.handle
                  ,image         = item.featured_image
                  ,compare_class = "price"
                  ,price_class   = item.available ? "" : item.item_type == "product" ? " sold-out " : " hide"
                  ,price         = item.available ? item.price : item.out_stock_nofication
                  ,markedString  = title.replace(new RegExp('(' + _keyword + ')', 'gi'), '<span class="marked">$1</span>')
                  ,template      = `<li class="result-item just-added">
                                      <a href="${handle}">
                                        <span class="search-item-img">
                                          <img src="${image}" />
                                        </span>
                                        <span class="search-item-title">${markedString}</span>
                                        <span class="${compare_class} ${price_class}">${price}</span>
                                      </a>
                                    </li>`;
                 result_element.append(template);
                 setTimeout(function() {
                    result_element.children('li.result-item.just-added').removeClass('just-added').show();
                 },300);
            }
            if(jQuery('.result-ajax-search .search-results li').length){
              jQuery('.result-ajax-search').show();
              jQuery('li.fake-result').remove();
              currenciesCallbackSpecial('.result-ajax-search span.money');
            }
          }else{
            result_element.html('<li class="result-item"><p>No result found for your search.</p></li>');
            jQuery('.result-ajax-search').show();
            jQuery('.search-quick-menu').hide();
          }
       }
    });

  }

  ,ajaxSearch : function( bc_search_config  ){

    var ajax_timeout
        ,ajax_lost_focus
        ,ajax_search     = this
        ,search_input_id = bc_search_config.search_input.length   > 0 ? bc_search_config.search_input   : '#bc-product-search'
        ,wrapper_id      = bc_search_config.result_wrapper.length > 0 ? bc_search_config.result_wrapper : '.result-ajax-search'
        ,result_id       = bc_search_config.result_element.length > 0 ? bc_search_config.result_element : '.search-results' ;

    $(document).on('keyup',search_input_id, AT_Main.debounceTime(function(event){
      var _keyword        = jQuery(this).val()
          ,search_element = jQuery(this)
          ,result_wrapper = jQuery(search_input_id).parents('form').parent().find(wrapper_id)
          ,result_element = result_wrapper.children( result_id );          

      jQuery('.search-quick-menu').hide();
      jQuery('.result-ajax-search').show();
      event.keyCode != 8 && result_element.addClass('fake-search').html('<li class="fake-result"></li><li class="fake-result"></li><li class="fake-result"></li>');

      if( _keyword.length < 1 ){
        jQuery('#searchModal .result-ajax-search').hide();
        result_element.empty();
        jQuery('.search-quick-menu,.mobile-searchbox .result-ajax-search').show();
        jQuery('.header-desktop .result-ajax-search').hide();
      }
      else if( _keyword.length >= 2 ){
          jQuery(this).removeClass('error warning valid').addClass('valid');
          jQuery('.searchbox').addClass("s-loading");
          !jQuery(search_input_id).hasClass('snize-input-style') && ajax_search.ajaxProductItems( search_element ,result_wrapper, result_element );
      }else{
          jQuery(this).removeClass('error warning valid').addClass('error');
          result_element.html('<li><p>You must enter at least 2 characters.</p></li>');
        	jQuery('.result-ajax-search').show();
      }
    },500)
    ).on( 'blur','.navbar-form.search' , AT_Main.debounceTime(function(event){

      var _search_block = jQuery(this);
      jQuery('#bc-product-search').val('');
      jQuery('.searchbox.mobile-searchbox').children('*:not(.navbar-form.search)').hide();
      jQuery('.mobile-searchbox .search-results').empty();
      AT_Main.getWidthBrowser() > 991 && jQuery('.result-ajax-search').hide();
    },500))

    jQuery(document).on('click','.search-drawer',function(){
      jQuery('.search-drawer-target').toggleClass('show');
      jQuery('#bc-product-search').focus();
      AT_Main.fixNoScroll();
    });
    jQuery(document).on('click','.search-drawer-content .close',function(){
      jQuery('.search-drawer-target').removeClass('show');
      AT_Main.fixReturnScroll();
    });

    jQuery(document).on('click','.mobile-searchbox .close',function(){
      jQuery('.searchbox.mobile-searchbox').removeClass('active').children('*:not(.navbar-form.search)').hide();
      setTimeout(()=>{jQuery('.mobile-searchbox .result-ajax-search ul.search-results').empty();},500);
    });

    jQuery(document).on('focus','.mobile-searchbox #bc-product-search',function(){
      jQuery('.mobile-searchbox .result-ajax-search').show();
      jQuery('.searchbox.mobile-searchbox').addClass('active');
    });
    jQuery(document).on('focusout','.mobile-searchbox',function(){
      setTimeout(()=>jQuery('.searchbox.mobile-searchbox').removeClass('active'),500);
    });

    jQuery(document).on('focus','.mobile-searchbox .navbar-form.search',function(){
      jQuery('.searchbox.mobile-searchbox').children('*:not(.navbar-form.search)').show();
    });

    jQuery(document).on('focus','.header-desktop #bc-product-search',function(){
      jQuery(this).parents('.searchbox').addClass('is-focus');
      jQuery('.header-desktop .search-quick-menu').show();
    });
    jQuery(document).on('blur','.header-desktop #bc-product-search',function(){
      jQuery(this).parents('.searchbox').removeClass('is-focus');
      jQuery('.header-desktop .search-quick-menu').hide();
    });
  }

  ,init : function( bc_search_config ){
    this.ajaxSearch( bc_search_config );
  }

}

jQuery(document).ready(function($) {
  AT_AjaxSearch.init({
    "search_input"      :   "#bc-product-search"
    ,"result_wrapper"   :   ".result-ajax-search"
    ,"result_element"   :   ".search-results"
    ,"strictly_mode"    :   0
  });
})