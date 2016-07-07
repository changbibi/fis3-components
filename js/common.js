;(function(global, F, undefined){

    function getAjaxUri(uri){
        if( location.href.indexOf('192.168') >= 0 ){
            return 'http://rap.taobao.org/mockjsdata/894' + uri.replace('api', 'v7');
        } else {
            return uri;
        }

    }

    F.getAjaxUri = getAjaxUri;

    /**
    ref
    1. http://kissygalleryteam.github.io/countdown/doc/guide/index.html
    2. http://www.lai18.com/content/1439803.html
    3. https://github.com/objectivehtml/FlipClock
    4. https://segmentfault.com/q/1010000000698541

    function Auth() {
        if (!(this instanceof Auth)) return new Auth();

        var self = this;
    }

     */


    var isSupportTouch = "ontouchend" in document ? true : false;
    F.isSupportTouch = isSupportTouch;

    // 重写alert
    // function alert(msg){
    //     var dia = $.dialog({
    //         title: msg,
    //         content: '',
    //         button: ["确认"]
    //     });
    // }
    // window.alert = alert;

    /**
     * F.emit('closeWindow', {'url': '', 'data': {}, 'name': 'publishName'});
     */


    F.redirect = function(url){
        // // https:// 协议替换
        var url = F.schema.encrypt(url);
        // if( location.protocol == 'https:' ){
        //     url = url.replace('http:', 'https:');
        // }
        location.href = url;
    }


    var dialogLoading = null;
    function loading(){
        return {
            show: function(){
                // if(dialogLoading){
                //     dialogLoading.loading("show");
                //     return;
                // }
                // dialogLoading = $.loading({
                //                     content:'加载中...'
                //                 });
            },
            hide: function(){
                // if( !dialogLoading  ){
                //     return;
                // }
                // dialogLoading.loading("hide");
            }
        }
    }

    function fetch(cfg, hasLoading){
        var self = this;
        var loadingInstance = loading();
        if( hasLoading ){
            loadingInstance.show();
        }
        var defaults = {
            type: 'GET',
            dataType: 'json',
            data: {},
            // url: F.getAjaxUri('/api/order/shopping-cart-list?#',
            url: '',
            beforeSend: function(xhr, settings){
                if( typeof CONFIG === "undefined" ){
                    CONFIG = {};
                }
                if( CONFIG && F.isEmptyObject(CONFIG['loginuser']) && cfg['type'] == 'POST' ){
                    F.showLogin();
                    return false
                }
            },
            success: function(data, status, xhr){
            },
            error: function(xhr, errorType, error){
                if( errorType == 'abort'  ){
                    return;
                }
                F.stat.log({
                    gid: 'error',
                    fid: 'error_ajax',
                    url: xhr.responseURL,
                    desc: errorType + error
                });
                /* xhr
                0 { response: "Cannot GET /shop/baud.co↵"
                responseText: "Cannot GET /shop/baud.co↵"
                responseType: ""
                responseURL: "http://192.168.240.50:8080/shop/baud.co"} 1: "error"   2: "Not Found"
                */
                // console.log('error');
                // console.log( JSON.stringify(xhr));
                // console.log(arguments);

            },
            complete: function(xhr, status){
                hasLoading && loadingInstance.hide();
                var $target = $(options['target']);
                if( $target.length ){
                    $target.attr('ajax-posting', '');
                }
            }
        }
        var options = $.extend(defaults, cfg);
        var $target = $(options['target']);
        if( $target.length ){
            if( $target.attr('ajax-posting') == '1') {
                return false;
            }
            $target.attr('ajax-posting', '1');
        }
        $.ajax(options);
    }
    F.fetch = fetch;

    // 分享提取
    F.on('bridgeSharePop', function(){
      F.bridgeReady(function(bridge){
        bridge.callHandler('sharePopWindow', {},  function(res) {});
      });
      // 微信的分享提示
      if( F.UA.weixin ){
        var $mask = $('.cm-weixin-mask');
        if( !$mask.length ){
          $mask = $('<div class="cm-weixin-mask" style="position: fixed; top: 0; bottom: 0; width: 10rem; height: 100%; background: url(//static.cosmeapp.com/Fqysa1uAjXjHemwkDA-DmWf7mI0v?imageView2/2/w/750/h/500) no-repeat 0 0 rgba(0, 0, 0, 0.6); background-size: 100% auto;  z-index: 100;"></div>').appendTo($('body'));
          $mask.click(function(){
            $mask.hide();
          })
        }
        $mask.show();
      } else if( !F.UA.cosmeapp ){
        alert('复制链接地址发送给朋友');
      }
    });

    function slider(){

        var sliders = document.querySelectorAll('.mslider');
        var indicatorsTplDefault = '<span class="cur"></span>';
        var sliderInstance = [];
        for(var i = 0, len = sliders.length; i < len; i++){
            var slider = sliders[i]
            var items = slider.querySelectorAll('.mslider-item');
            var itemLen = items.length;
            var indicatorsTpl = indicatorsTplDefault;
            if( itemLen <= 1 ){
                continue;
            }
            for(var j = 0; j < itemLen - 1; j++){
                indicatorsTpl += '<span></span>';
            }
            var $container = $(slider);
            var $indicators = $container.find('.mslider-indicators');
            $indicators.show().find('div').empty().append(indicatorsTpl);
            var $spans = $indicators.find('span');
            ;(function(i){
                sliderInstance[i] = QSlider.define(slider,{
                    mode: 'horizontal', //horizontal vertical
                    // animation: 'cover',
                    // slideActiveClass: 'cur',
                    isOverspread: false,
                    loop: true,
                    // speed: 500,
                    onSlideChanged:function(){
                        var index = this.currentIndex;
                        var action = index - 1;
                        var len = this.slides.length;
                        action = action % itemLen;
                        $spans.removeClass('cur');
                        $spans.eq(action).addClass('cur');
                    }
                });
                function nextSlider(){
                    setTimeout(function(){
                        sliderInstance[i].next();
                        nextSlider();
                    }, 5000);
                }
                nextSlider();
            })(i);
        }
    }
    function initScroll(){
        var $cmscroll = $('.cm-scroll');
        $cmscroll.each(function(){
            var $this = $(this);
            var len = $this.find('.cm-scroll-item').length;
            var width = 2.96 * len + 0.4 + 'rem';
            $this.css({
                'width': width
            });
        });
    }
    $(document).ready(function(){
        slider();
        initScroll();
    });


})(window, F);