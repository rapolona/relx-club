var AT_Filter = window.AT_Filter || {};

(function($) {
	AT_Filter = {

		init: function () {
			this.filterElem = $(".grid-uniform");
			this.isLoading = false;
			this.updateURL = false;
			this.requestAgain = false;
      this.title;
      this.addEvent();

      if( this.filterElem.length > 0 ) {
				// Bind to StateChange Event
			    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
			        var State = History.getState(); // Note: We are using History.getState() instead of event.state;
			        AT_Filter.updateURL = false;
			        if(AT_Filter.requestAgain)
			        	AT_Filter.requestPage(State.data.url);
			       	AT_Filter.requestAgain = true;
			    });
			}
		},

		addEvent: function() {
			//prevent li clicked
			AT_Filter.filterElem.on("click", ".advanced-filter", function(event){
				return false;
			});

			AT_Filter.filterElem.on("click", ".advanced-filter a", function(e){
				if (AT_Filter.isLoading) {
					return;
				}
        if ($(this).attr('href') == 'javascript:void(0);') {return}
				var target = $(e.currentTarget), href;

				href = target.attr("href");
				//Set active or remove active for filter
				if(!target.parent().hasClass("active-filter")) {
					target.parent().addClass("active-filter");
          target.parents('.sb-filter').addClass("active");
				}else{
          target.parents('.sbw-filter.select.active').length && target.parents('.sbw-filter.select.active').removeClass("active");
        }
        jQuery(this).parents('.sbw-filter').first().addClass('waiting');
				AT_Filter.updateURL = true;
				AT_Filter.requestPage(href);
				// jQuery("#page-body").trigger('click');
				return false;

			});
          //Click on pager
      $(document).on('click', '.srp-filter-wrapper .advanced-filter a', function(e){
      	if (AT_Filter.isLoading) {
          return;
        }

        var target = $(e.currentTarget), href;
        if( target.parent().hasClass('active') )
        	return;

        href = target.attr("href");
        AT_Filter.updateURL = true;
        AT_Filter.requestPage(href);
        return false;
      });

      $(document).on('click','.sort-by li.sort-action',function(e){
        $('#cata_sort_by').addClass('waiting');
        if (AT_Filter.isLoading) {
         return;
       }

			$('.sort-action').removeClass('active');
        var href;
        $('.sort-by .name').html($(this).html());

        if(!$(this).hasClass('active')){
        	$(this).addClass('active');
          var value = jQuery(this).attr('data-sort');

          jQuery('.select-sort option').each(function(){
            jQuery(this).val() == value && jQuery(this).prop('selected',true);
          })

          Shopify.queryParams.sort_by = value;
          delete Shopify.queryParams.page;
          href = '?'+jQuery.param(Shopify.queryParams);
          //location.search = jQuery.param(Shopify.queryParams);
          AT_Filter.updateURL = true;
          AT_Filter.requestPage(href);
        }
      });

      $('.select-sort').on('change', function(e) {
      	let value = $(this).val();

      	$('#sort_by_box li').removeClass('active');
        $('#sort_by_box li[data-sort='+value+']').addClass('active');
        $('.sort-by .name').html($('#sort_by_box li[data-sort='+value+']').html());

        Shopify.queryParams.sort_by = value;
        delete Shopify.queryParams.page;
        href = '?'+jQuery.param(Shopify.queryParams)
        AT_Filter.updateURL = true;
        AT_Filter.requestPage(href);
      })
		},

		requestPage: function(href) {
			$('.new-loading').addClass('loading');
			if (history.pushState) {
				this.getPage(href);
			} else {
				location.assign(href);
			}
		},

		filterPage: function(href){
			var splitArr = [],  param;
            if(String(href).indexOf("/") != -1) {
              splitArr = href.split("/");
              param = splitArr[splitArr.length - 1];
            }
            else
              param = href;
			// console.log(param)
			return param;
		},

		getPage: function(href) {
			this.isLoading = true;
			jQuery.ajax({
        url: href,
        complete:function(){
          jQuery('.sbw-filter,#cata_sort_by').removeClass('waiting');
        },
        success: function (response)
        {
          var _obj = $(response);
          AT_Filter.title = _obj[25];

          if(AT_Filter.updateURL) {
           var params = AT_Filter.filterPage(href);
           AT_Filter.updateURL = false;
           AT_Filter.requestAgain = false;

           History.pushState( {url: href}, AT_Filter.title.innerHTML,  href );

          }
          AT_Filter.isLoading = false;

          $("#col-main").empty().append(_obj.find("#col-main").children());
          $("#prod-show").empty().append(_obj.find("#prod-show").html());
          $(".pagination-holder").empty().append(_obj.find(".pagination-holder").html());

          if (_obj.find(".load_more").length) {
          $(".load_more").empty().append(_obj.find(".load_more").html());
          $(".load_more").show();
          }else{
          $(".load_more").hide();
          }
          AT_Filter.filterElem.each(function(){
          	var sel = ".sb-filter." + $(this).data('prefix')
              ,filter_list = _obj.find(sel);
          	$(this).empty().append(filter_list);
          });
          _obj.find('.active-filter').length == 0 && $('#clear-all-filter').addClass('hidden');
          $('.new-loading').removeClass('loading');
          AT_Main.filterCatalog();
          AT_Main.fixButton();
          AT_Main.fixTitle();
          AT_Main.handleReviews();
          AT_Main.switchImgProduct();
          AT_Main.handleGridList();
          AT_Main.init_CountDown();
          
        },
        error: function(e) {
          $('.new-loading').removeClass('loading');
          console.log(e);
        },

			});


		},

	}
})(jQuery);

$(document).ready(function(){
	AT_Filter.init();
});