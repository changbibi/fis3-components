// Usage: $(element).scrollToTop([position])

;(function($){
  // only allow one scroll to top operation to be in progress at a time,
  // which is probably what you want
  var scrollToTopInProgress = false

  $.fn.scrollToTop = function(position){
    var $this = this,
      targetY = position || 0,
      initialY = $this.scrollTop(),
      lastY = initialY,
      delta = targetY - initialY,
      // duration in ms, make it a bit shorter for short distances
      // this is not scientific and you might want to adjust this for
      // your preferences
      speed = Math.min(750, Math.min(1500, Math.abs(initialY-targetY))),
      // temp variables (t will be a position between 0 and 1, y is the calculated scrollTop)
      start, t, y,
      // use requestAnimationFrame or polyfill
      frame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback){ setTimeout(callback,15) },
      cancelScroll = function(){ abort() }
      speed = 1500;
    // abort if already in progress or nothing to scroll
    if (scrollToTopInProgress) return
    if (delta == 0) return

    // quint ease-in-out smoothing, from
    // https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js#L127-L136
    function smooth(pos){
      if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5)
      return 0.5 * (Math.pow((pos-2),5) + 2)
    }

    function abort(){
      $this.off('touchstart', cancelScroll)
      scrollToTopInProgress = false
    }

    // when there's a touch detected while scrolling is in progress, abort
    // the scrolling (emulates native scrolling behavior)
    $this.on('touchstart', cancelScroll)
    scrollToTopInProgress = true

    // start rendering away! note the function given to frame
    // is named "render" so we can reference it again further down
    frame(function render(now){
      if (!scrollToTopInProgress) return
      if (!start) start = now
      // calculate t, position of animation in [0..1]
      t = Math.min(1, Math.max((now - start)/speed, 0))
      // calculate the new scrollTop position (don't forget to smooth)
      y = Math.round(initialY + delta * smooth(t))
      // bracket scrollTop so we're never over-scrolling
      if (delta > 0 && y > targetY) y = targetY
      if (delta < 0 && y < targetY) y = targetY
      // only actually set scrollTop if there was a change fromt he last frame
      if (lastY != y) $this.scrollTop(y)
      lastY = y
      // if we're not done yet, queue up an other frame to render,
      // or clean up
      if (y !== targetY) frame(render)
        else abort()
    })
  }
})(Zepto);
// http://mir.aculo.us/2014/01/19/scrolling-dom-elements-to-the-top-a-zepto-plugin/

;(function(global, F, undefined){

    function ajax(){

    }

    $.fn.cajax = ajax;

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
    // 简单小时分秒倒计时
    function Countdown(options){
        var config = {
            'timestamp': '',
            'runCallback': function(){},
            'endCallback': function(){}
        };
        this.config = $.extend(config, options)
        this._countTimer = null;
    }

    Countdown.prototype = {
        addZero: function(num){
            if( num.toString().length === 1 ){
                return "0" + num;
            } else {
                return num;
            }
        },
        run: function(){
            var self = this;
            var config = self.config;
            if( !config ){
                return;
            }
            self._countTimer && clearTimeout(self._countTimer);
            var timestamp = self.config['timestamp'];
            if( timestamp > 0 ){
                var day = parseInt(timestamp/3600/24);
                var hour = this.addZero(parseInt( (timestamp / 3600) % 24) + day * 24);
                var minutes = this.addZero(parseInt((timestamp / 60) % 60));
                var seconds = this.addZero(parseInt(timestamp % 60));
                self.config['timestamp']--;
                var args = [{'h': hour, 'm': minutes, 's': seconds}]
                if( $.isFunction(config['runCallback']) ){
                    config['runCallback'].apply(this, args);
                }
            } else {
                if( $.isFunction(config['endCallback']) ){
                    config['endCallback'].apply(this, []);
                    self.destroy();
                }
            }
            self._countTimer = setTimeout(function(){
                self.run();
            }, 1000);
        },
        destroy: function(){
            this._countTimer && clearTimeout(this._countTimer);
            this.config = null;
            this._countTimer = null;
        }
    }
    F.Countdown = Countdown;

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
    F.on('closeWindow', function(event, cfg){
        if( F.UA.cosmeapp ){
            F.bridgeReady(function(bridge){
                if( cfg['name'] ){
                    var data = cfg['data'] || {};
                    F.emit('bridgeEmit', {
                        'name': cfg['name'],
                        'data': data
                    });
                }
                bridge.callHandler('closeWindow', {}, function(res){});
            });
        } else {
            location.href = cfg['url'];
        }
    });

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
            type: 'POST',
            dataType: 'json',
            data: {},
            // url: F.getAjaxUri('/api/order/shopping-cart-list?#',
            url: '',
            beforeSend: function(xhr, settings){
            },
            success: function(data, status, xhr){
            },
            error: function(xhr, errorType, error){
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
            }
        }
        var options = $.extend(defaults, cfg);
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

    function mscrollTop(){
        var mtoptpl = '<div class="mgotop"></div>';
        var $mgotop = $('.mgotop');
        var $w = $(window);
        if( !$mgotop.length ){
            $mgotop = $(mtoptpl).appendTo($('body'));
            $mgotop.on('click', function(){
                $w.scrollToTop(0);
            })
        }
        $w.on('scroll', function(){
            if( $w.scrollTop() > 200 ){
                $mgotop.show();
            } else {
                $mgotop.hide();
            }
        });
    }

    function dataHref(){
        var $body = $('body');
        $body.on('click', '[data-href]', function(){
            var $this = $(this);
            var href = $this.attr('data-href');
            if( href ){
                F.redirect(href);
            }
        });
    }

    $(document).ready(function(){
        mscrollTop();
        dataHref();
    });

})(window, F);