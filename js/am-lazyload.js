// https://g.alicdn.com/mui/datalazyload/3.1.9/index.js
// https://github.com/kissygalleryteam/datalazyload/blob/master/2.0.1/src/index.js
// https://github.com/sorrycc/webp-support/blob/master/lib/webp.js
/**
 * @fileOverview WebP Support Detect.
 * @author ChenCheng<sorrycc@gmail.com>
 */
;(function() {
    if (this.WebP) return;
    this.WebP = {};

    WebP._cb = function(isSupport, _cb) {
        this.isSupport = function(cb) {
            cb(isSupport);
        };
        _cb(isSupport);
        if (window.chrome || window.opera && window.localStorage) {
            window.localStorage.setItem("webpsupport", isSupport);
        }
    };

    WebP.isSupport = function(cb) {
        if (!cb) return;
        if (!window.chrome && !window.opera) return WebP._cb(false, cb);
        if (window.localStorage && window.localStorage.getItem("webpsupport") !== null) {
            var val = window.localStorage.getItem("webpsupport");
            WebP._cb(val === "true", cb);
            return;
        }
        var img = new Image();
        img.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        img.onload = img.onerror = function() {
            WebP._cb(img.width === 2 && img.height === 2, cb);
        };
    };

    WebP.run = function(cb) {
        this.isSupport(function(isSupport) {
            if (isSupport) cb();
        });
    };

})();

/**
 *
 * AW lazyload 图片懒加载
 * @namespace AW
 *
 * @author 雷骏 <leijun.wulj@alipay.com>
 * @version 1.0.0
 *
 * */
;
(function() {


    // 更新：
    // 05.27: 1、保证回调执行顺序：error > ready > load；2、回调函数this指向img本身
    // 04-02: 1、增加图片完全加载后的回调 2、提高性能

    /**
     * 图片头数据加载就绪事件 - 更快获取图片尺寸
     * @version  2011.05.27
     * @author  TangBin
     * @see    http://www.planeart.cn/?p=1121
     * @param  {String}  图片路径
     * @param  {Function}  尺寸就绪
     * @param  {Function}  加载完毕 (可选)
     * @param  {Function}  加载错误 (可选)
     * @example imgReady('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', function () {
        alert('size ready: width=' + this.width + '; height=' + this.height);
      });

      http://www.sosuo8.com/article-2011/javascript-image-pre-loaded-talk-about-technology.htm
      http://www.oschina.net/question/54371_35740
      http://developer.51cto.com/art/201103/249624.htm
     */
    var imgReady = (function() {
        var list = [],
            intervalId = null,

            // 用来执行队列
            tick = function() {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },

            // 停止所有定时器队列
            stop = function() {
                clearInterval(intervalId);
                intervalId = null;
            };

        return function(url, ready, load, error) {
            var onready, width, height, newWidth, newHeight,
                img = new Image();

            img.src = url;

            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                ready.call(img);
                load && load.call(img);
                return;
            };

            width = img.width;
            height = img.height;

            // 加载错误后的事件
            img.onerror = function() {
                error && error.call(img);
                onready.end = true;
                img = img.onload = img.onerror = null;
            };

            // 图片尺寸就绪
            onready = function() {
                newWidth = img.width;
                newHeight = img.height;
                if (newWidth !== width || newHeight !== height ||
                    // 如果图片已经在其他地方加载可使用面积检测
                    newWidth * newHeight > 1024
                ) {
                    ready.call(img);
                    onready.end = true;
                };
            };
            onready();

            // 完全加载完毕的事件
            img.onload = function() {
                // onload在定时器时间差范围内可能比onready快
                // 这里进行检查并保证onready优先执行
                !onready.end && onready();

                load && load.call(img);

                // IE gif动画会循环执行onload，置空onload即可
                img = img.onload = img.onerror = null;
            };

            // 加入队列中定期执行
            if (!onready.end) {
                list.push(onready);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 40);
            };
        };
    })();

    'use strict';
    var lazyload = {
        /**
         * 默认配置参数
         *
         * @memberof AW.lazyload
         * @param {!Boolean} auto - 是否自动执行
         * @param {!Number} offsetPre - 懒加载提前偏移量，使体验更好
         * @param {!String} lazyAttr - 懒加载替换图片放置路径
         * @param {!Boolean} overget - 加载在加载位置之前的图片（当前屏幕之外的上方或者左方）
         * @param {!Boolean} log - 对没有高宽的图片打出log提醒
         *
         * @desc 默认配置参数
         *
         */
        options: {
            auto: true,
            offsetPre: 40, //预加载偏移量，默认10，提升懒加载体验
            lazyAttr: 'data-lazyload',
            overget: false,
            log: true
        },
        //lazyload资源池
        matchStack: [],
        /**
         * 初始化方法
         *
         * @memberof AW.lazyload
         *
         * @param {?Object} options - 配置参数
         *
         * @desc 初始化方法(可供外部调用)
         *
         * @example
         * AW.lazyload.init();
         * AW.lazyload.init({offsetPre:20});
         */
        init: function(options) {
            var lazyOption = document.querySelector('body').getAttribute('data-lazy');
            lazyOption = parseObj(lazyOption);
            this.options = simpleExtend(this.options, lazyOption);
            this.options = simpleExtend(this.options, options);
            this.runLock = true;
            if (this.options.auto) {
                var initStack = document.querySelectorAll('img[' + this.options.lazyAttr + ']');
                this.load(initStack);
            }
        },
        /**
         * 资源池新增图片并触发加载监控
         *
         * @memberof AW.lazyload
         * @param {?String|?Object} addStack - 可以为选择器，可以为节点数据集，可以为节点
         *
         * @desc 资源池新增图片并触发加载监控
         *
         * @example
         * AW.lazyload.load('.lazy img');//选择器
         * AW.lazyload.load([Nodelist]);//节点Nodelist（伪数组）
         * AW.lazyload.load([Array]);//节点Array
         * AW.lazyload.load(ImageElement);//图片节点
         * AW.lazyload.load(OtherElement);//除图片外其它节点，找寻内部图片节点
         * AW.lazyload.load(jQueryObject);//jQuery节点集（伪数组）
         * AW.lazyload.load(ZeptoObject);//Zepto节点集（伪数组）
         *
         */
        load: function(addStack) {
            var self = this;
            loadItems = function() {
                self.run();
                // setTimeout(function(){
                //     self.run();
                // }, 500);
            }

            this.add(addStack);
            this._runFn = buffer(loadItems, 150, self);
            this.addLoadListener();
            this.run();
        },
        /**
         * 资源池新增图片
         *
         * @memberof AW.lazyload
         * @param {?String|?Object} addStack - 可以为选择器，可以为节点数据集，可以为节点
         *
         * @desc 资源池新增图片
         *
         * @example
         * AW.lazyload.add('.lazy img');//选择器
         * AW.lazyload.add([Nodelist]);//节点Nodelist（伪数组）
         * AW.lazyload.add([Array]);//节点Array
         * AW.lazyload.add(ImageElement);//图片节点
         * AW.lazyload.add(OtherElement);//除图片外其它节点，找寻内部图片节点
         * AW.lazyload.add(jQueryObject);//jQuery节点集（伪数组）
         * AW.lazyload.add(ZeptoObject);//Zepto节点集（伪数组）
         *
         */
        add: function(addStack) {
            //将addStack进行处理，获得指定节点集。
            switch (isElement(addStack)) {
                case 'element':
                    //如果是对象，首先判断是否element节点
                    if (type(addStack) === 'htmlimageelement') {
                        //如果是img节点，添加进栈，如果其它节点，找寻子节点中是否有满足的img节点
                        addStack = [addStack];
                    } else {
                        addStack = addStack.querySelectorAll(this.options.lazyAttr);
                    }
                    break;
                    //如果是字符串，姑且认为是选择器
                case 'string':
                    addStack = document.querySelectorAll(addStack);
                    break;
            }
            //将伪数组转为数组
            if (addStack.length && addStack.length > 0) {
                addStack = Array.prototype.slice.call(addStack);
            } else {
                return;
            }
            addStack = filter(addStack, this);
            this.matchStack = this.matchStack.concat(addStack);
        },
        /**
         * 对资源池添加懒加载监听，同一时间内有限运行仅一次
         *
         * @memberof AW.lazyload
         *
         * @desc 对资源池添加懒加载监听，同一时间内有限运行仅一次
         *
         * @example
         * AW.lazyload.addLoadListener();
         */
        addLoadListener: function() {
            var _runFn = this._runFn;
            if (this.runLock) {
                // https://jdc.jd.com/archives/321
                // scroll、touchmove、resize事件会触发大量的计算，在低版本Andorid版本浏览器中卡顿甚至崩溃，我们可以简单做一些事件节流的操作。
                this.runLock = false;
                // https://github.com/tgideas/motion/blob/master/component/src/main/lazyLoad/lazyLoad.js#L62
                window.addEventListener('scroll', _runFn, false);
                window.addEventListener('touchmove', _runFn, false);
                // window.addEventListener('touchcancel', _runFn, false);
                window.addEventListener('pageshow', _runFn, false);
                // https://developer.mozilla.org/zh-CN/docs/Web/Events/pageshow
                // http://javascript.ruanyifeng.com/dom/event.html#toc46
                // https://github.com/tgideas/motion/blob/master/component/src/main/lazyLoad/lazyLoad.js#L62
                window.addEventListener('resize', _runFn, false);
                window.addEventListener('orientchange', _runFn, false);

                // document.getElementById('J_Scroll').addEventListener('touchmove', this.run, false);
                // document.documentElement.addEventListener('touchcancel', this.run, false);
                // document.documentElement.addEventListener('touchend', this.run, false);
            }
        },
        /**
         * 对资源池移除懒加载监听
         *
         * @memberof AW.lazyload
         *
         * @desc 对资源池移除懒加载监听
         *
         * @example
         * AW.lazyload.addLoadListener();
         */
        removeLoadListener: function() {
            var _runFn = this._runFn;
            window.removeEventListener('scroll', _runFn, false);
            window.removeEventListener('touchmove', _runFn, false);
            window.removeEventListener('pageshow', _runFn, false);
            window.removeEventListener('resize', _runFn, false);
            window.removeEventListener('orientchange', _runFn, false);
            this.runLock = true;
        },
        /**
         * 当前时机，执行一次懒加载遍历尝试
         *
         * @memberof AW.lazyload
         *
         * @desc 当前时机，执行一次懒加载遍历尝试
         *
         */
        run: function() {
            // console.table(arguments);
            var matchStack = lazyload.matchStack;
            if (matchStack.length === 0) {
                lazyload.removeLoadListener();
                return;
            }
            for (var index = 0; index < matchStack.length; index++) {
                var elem = matchStack[index];
                (function(elem) {
                    if (isNeedLoad(elem, lazyload)) {
                        lazyimgReplace(elem, lazyload);
                        //实时从堆栈中删除懒加载已完成节点
                        matchStack.splice(index, 1);
                        index--;
                    }
                })(elem);
            }
            // fixed 快速向左滑动，部分图片不加载
            if (matchStack.length > 0) {
                (function() {
                    setTimeout(function() {
                        lazyload.run();
                        // timer && clearTimeout(timer);
                    }, 500);
                })();
            }
        }
    };

    /*类型判断*/
    function type(obj) {
        return Object.prototype.toString.call(obj).replace(/\[object (\w+)\]/, '$1').toLowerCase();
    }

    function isElement(obj) {
        return (type(obj).indexOf('element') === -1) ? type(obj) : 'element';

    }



    function loaderImg(url, callback) {
        var URLLength = 8190;
        if (!callback) {
            callback = function() {};
        }
        // 忽略超长 url 请求，避免资源异常。
        if (url.length > URLLength) {
            return callback();
        }

        // @see http://www.javascriptkit.com/jsref/image.shtml
        var img = new Image(1, 1);
        // 不知为何有图片没有加载处理?
        var timer = setTimeout(function() {
            callback.call(img);
        }, 2000);
        img.onload = img.onerror = img.onabort = function() {
            // callback();
            callback.call(img);
            img.onload = img.onerror = img.onabort = null;
            timer && clearTimeout(timer);
            img = null;
        };
        /**
         * http://www.jb51.net/article/26531.htm
         */

        img.src = url;
    }

    /*图片节点执行懒加载时属性变换*/
    function lazyimgReplace(elem, lazyObj) {
        var lazyAttr = lazyObj.options.lazyAttr;
        if (elem.getAttribute(lazyAttr)) {
            var src = elem.getAttribute(lazyAttr);
            // var setSrcTimer = setTimeout(function(){
            //     if(!elem.getAttribute(src)){
            //         elem.src = src;
            //         elem.removeAttribute(lazyAttr);
            //     }
            // }, 2000);
            WebP.isSupport(function(isSupport) {
                if (isSupport) {
                    src = getWebpUrl(src);
                }
                // @todo 资源多是否不会触发imgonload??
                imgReady(src, function() {
                    // setSrcTimer && clearTimeout(setSrcTimer);
                    elem.src = src;
                    elem.setAttribute(lazyAttr, '');
                }, function() {
                    // alert(333)
                    // setSrcTimer && clearTimeout(setSrcTimer);
                    if (!elem.getAttribute(src)) {
                        elem.src = src;
                        elem.setAttribute(lazyAttr, '');
                        // elem.removeAttribute(lazyAttr);
                    }
                }, function() {
                    // setSrcTimer && clearTimeout(setSrcTimer);
                    if (src.indexOf('_avatar_big') >= 0) {
                        elem.src = '//static.cosmeapp.com/top/201503/18/15/16/5509264fd1a14242.png';
                        elem.setAttribute(lazyAttr, '');
                    } else {

                    }

                    if (!elem.getAttribute(src)) {
                        // alert(src)

                        // elem.removeAttribute(lazyAttr);
                    }
                });
                // loaderImg(src, function(){
                //     elem.src = src;
                //     elem.removeAttribute(lazyAttr);
                // });
            });

            // var timer = setTimeout(function(){
            //     timer && clearTimeout(timer);
            // }, 500);

        }
    }
    /*过滤重复节点或者无效节点*/
    function filter(addStack, lazyObj) {
        for (var i = addStack.length; i--;) {
            if (lazyObj.matchStack.indexOf(addStack[i]) !== -1) {
                //重复节点删除
                addStack.splice(i, 1);
            } else {
                if (typeof addStack[i].getAttribute(lazyObj.options.lazyAttr) === 'undefined' || addStack[i].getAttribute(lazyObj.options.lazyAttr) === '') {
                    //无效节点删除
                    addStack.splice(i, 1);
                }
            }
        }
        return addStack;
    }
    /*判断当前时机，指定节点是否需要加载*/
    function isNeedLoad(elem, lazyObj) {
        var viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            top: document.body.scrollTop | document.documentElement.scrollTop,
            left: document.body.scrollLeft | document.documentElement.scrollLeft
        };
        //F.log(viewport, 'info', 'isNeedLoad');
        var offsetPre = lazyObj.options.offsetPre;
        var elAxis = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        };
        if (typeof elem.getBoundingClientRect !== "undefined") {
            //此处如果图片未定宽高，那么domready时获取出来的top可能不准确，但不妨碍大局：）
            elAxis = elem.getBoundingClientRect();
            if (lazyObj.options.log) {
                if (elAxis.top === elAxis.bottom) {
                    console.warn(elem, 'need height');
                }
                if (elAxis.left === elAxis.right) {
                    console.warn(elem, 'need width');
                }
            }
        }
        if (lazyObj.options.overget) {
            return ((elAxis.top - offsetPre < viewport.height) && (elAxis.left - offsetPre < viewport.width))
        } else {
            return ((elAxis.bottom + offsetPre >= 0 && elAxis.top - offsetPre < viewport.height) && (elAxis.right + offsetPre >= 0 && elAxis.left - offsetPre < viewport.width))
        }
    }
    /*继承实现*/
    function simpleExtend(target, source) {
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                target[p] = source[p];
            }
        }
        return target;
    }
    /*字符串转对象*/
    function parseObj(data) {
        try {
            return (new Function("return " + data))();
        } catch (e) {
            return {};
        }
    }

    function getWebpUrl(src) {
        if (src.indexOf('.gif') >= 0) {
            return src;
        }
        var reg = /format\/JPG/i;
        if (src.match(reg)) {
            return src.replace(reg, 'format/webp');
        }
        if (src.indexOf('static.cosmeapp.com') >= 0) {
            if ((src.indexOf('?imageView2') >= 0 || src.indexOf('?imageMogr2') >= 0) && src.indexOf('/format/') < 0) {
                return src + '/format/webp';
            }
        }
        return src;
    }

    // https://github.com/kissygalleryteam/lazyload/blob/master/2.0.0%2Fbuild%2Findex.js

    // http://docs.kissyui.com/1.4/docs/html/api/lang/buffer.html
    function buffer(fn, ms, context) {
        ms = ms || 150;

        if (ms === -1) {
            return function() {
                fn.apply(context || this, arguments);
            };
        }
        var bufferTimer = null;

        function f() {
            f.stop();
            bufferTimer = later(fn, ms, 0, context || this, arguments);
        }

        f.stop = function() {
            if (bufferTimer) {
                bufferTimer.cancel();
                bufferTimer = 0;
            }
        };

        return f;
    }

    function later(fn, when, periodic, context, data) {
        when = when || 0;
        var m = fn,
            d = F.makeArray(data),
            f,
            r;

        if (typeof fn === 'string') {
            m = context[fn];
        }

        if (!m) {
            F.error('method undefined');
        }

        f = function() {
            m.apply(context, d);
        };

        r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

        return {
            id: r,
            interval: periodic,
            cancel: function() {
                if (this.interval) {
                    clearInterval(r);
                } else {
                    clearTimeout(r);
                }
            }
        };
    };


    /**
     * 内部DOMReady后懒加载函数自执行部分功能
     *
     * @desc 内部DOMReady后懒加载函数自执行部分功能
     *
     */
    // 文档初始化完成后监听
    if (document.readyState === 'complete') {
        lazyload.init();
    } else {
        document.addEventListener('DOMContentLoaded', function(e) {
            lazyload.init();
        }, false);
    }

    window.lazyload = lazyload;
    /**
     * <img src="http://static.cosmeapp.com/top/201501/12/10/32/54b3323b470da636.gif " data-lazyload="">
     */

})();
// module.exports = lazyload;
/**
 * @todo
 *
 * 1. 添加textarea支持
 * 2. http://static.cosmeapp.com/activity/201505/29/17/43/556834c069a90818.jpg webp支持
 * 3. http://static.cosmeapp.com/activity/201505/29/17/43/556834c069a90818.jpg?imageView2/2/format/WEBP
 * 4. http://developer.qiniu.com/code/v6/api/kodo-api/image/imageview2.html
 *
 * 2016-03-31 huixisheng
 * 1. 修改不能访问的头像为默认头像
 *
 */
