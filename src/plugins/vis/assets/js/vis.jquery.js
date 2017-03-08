
(function ($) {

    function GameManager() {
        function get_attr($canvas, attr) {
            return $canvas.attr('data-vis-' + attr);
        }

        function add_attrs(opt, $canvas, attrs, factor) {
            for (i = 0; i < attrs.length; i++) {
                attr = get_attr($canvas, attrs[i]);
                if (typeof attr !== typeof undefined && attr !== false) {
                    opt[attrs[i]] = attr * factor;
                }
            }
            return opt;
        }

        function add_str_attrs(opt, $canvas, attrs) {
            for (i = 0; i < attrs.length; i++) {
                attr = get_attr($canvas, attrs[i]);
                if (typeof attr !== typeof undefined && attr !== false) {
                    opt[attrs[i]] = attr ;
                }
            }
            return opt;
        }

        function calc_dpi(diagonal_in) {
            var w = window.innerWidth;
            var h = window.innerHeight;
            var dp = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
            return dp / diagonal_in;
        }

        function get_state_key(states, proposed, i) {
            var new_proposed = proposed + '_'+i;
            if (states[new_proposed] != undefined) {
                return get_state_key(states, proposed, i + 1);
            }
            return new_proposed;
        }

        return {
            canvas: function(){
                return this.current.arena.canvas;
            },
            current: undefined,
            current_fn: undefined,
            states: {},
            metadata: {},
            formmetadata: {},
            i: 0,
            n: 0,
            games: {
                ebbinghaus: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'radius', 'lri', 'lro', 'rri', 'rro', 'rr'], ppi);
                    add_attrs(opt, $canvas, ['speed', 'nc'], 1);
                    add_str_attrs(opt,$canvas,['test']);
                    return new EbinghouseGame(opt);
                },
                ml: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'tl', 'bl', 'bal', 'tal', 'rr'], ppi);
                    add_attrs(opt, $canvas, ['speed', 'theta'], 1);
                    add_str_attrs(opt,$canvas,['test']);
                    return new MullerLyerGame(opt);
                },
                ponzo: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'height', 'rr', 'tl', 'bl', 'side_line_length'], ppi);
                    add_attrs(opt, $canvas, ['speed', 'angle'], 1);
                    add_str_attrs(opt,$canvas,['test']);
                    return new PonzoGame(opt);
                },
                poggendorff: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'height', 'rr'], ppi);
                    add_attrs(opt, $canvas, ['speed'], 1);
                    add_str_attrs(opt,$canvas,['test']);
                    return new PoggendorffGame(opt);
                },
                zollner: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'spacings', 'len','stripe_len'], ppi);
                    add_attrs(opt, $canvas, ['speed', 'rotangle', 'rr','rr_reference','stripe_angle'], 1);
                    add_str_attrs(opt,$canvas,['test']);
                    return new ZollnerGame(opt);
                }
            },
            can_submit: function(){
                return typeof this.current !== 'undefined' && !this.current_$canvas.is('[timeout-wait]');
            },
            fixation:function(radius,color){
                new FixationComponent(window.innerWidth/2,window.innerHeight/2,radius,color).update(this.canvas().getContext('2d'));
            },
            submit: function(){
                if ( this.can_submit()){
                    var self = this;
                    this.i = this.i + 1;
                    this.log();
                    this.stop();
                    console.log(this.states);
                    $('.vis-exposition-number').text(this.i  + ' / ' + this.n);
                    if (this.i > this.n) {
                        this.clear_game();
                        $.vis('next');
                    } else {
                        this.current.clear();
                        this.current_$canvas.attr("timeout-wait","true");
                        this.fixation(4,'#000000');
                        setTimeout(function(){
                            self.current.clear();
                            self.start();
                            self.current_$canvas.removeAttr("timeout-wait");
                        }, 1000);
                    }

                }
            },
            start: function () {
                this.current.start();
            },
            stop: function () {
                this.current.stop();
            },
            log: function () {
                this.states[this.state_key].push(this.current.state())
            },
            clear_game: function () {
                if (this.current !== undefined) {
                    this.current.stop();
                    this.current.cleanup();
                }
                this.i = 0;
                this.current = undefined;
                this.current_fn = undefined;
                this.current_$canvas = undefined;
            },
            new_game: function ($canvas) {
                if (typeof this.current_$canvas == 'undefined' || !$canvas.is(this.current_$canvas)){
                    this.clear_game();
                    this.i = 1;
                    this.n = $canvas.attr('data-vis-n');
                    ppi = 100;
                    if (typeof this.metadata.diagonal !== 'undefined') {
                        ppi = calc_dpi(this.metadata.diagonal);
                    }

                    this.current_fn = $canvas.attr('data-vis-game');

                    //First available key when multiple experiments of the same kind
                    this.state_key = this.current_fn;
                    if (this.states[this.state_key] != undefined) {
                        this.state_key = get_state_key(this.states, this.state_key, 1);
                    }

                    this.states[this.state_key] = [];
                    this.current = this.games[this.current_fn](ppi, $canvas);
                    this.current_$canvas = $canvas;
                    this.current.start();
                    $('.vis-exposition-number').text(this.i  + ' / ' + this.n);
                    return true;
                }
                return false;

            }
        }
    }

    var context = {
        gm: new GameManager(),
        functions: {
            post: function (url, fields) {
                var $form = $('<form>', {
                    action: url,
                    method: 'post'
                });
                $.each(fields, function (key, val) {
                    $('<input>').attr({
                        type: "hidden",
                        name: key,
                        value: val
                    }).appendTo($form);
                });
                $form.appendTo('body').submit();
            },
            uid: function() {
                return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
            },
            calc_diagonal: function() {
                var dpi_x = document.getElementById('dpi').offsetWidth;
                var dpi_y = document.getElementById('dpi').offsetHeight;
                var w = window.innerWidth / dpi_x;
                var h = window.innerHeight / dpi_y;
                return Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
            },
            serializeObject: function(that) {
                var o = {};
                var a = $(that).serializeArray();
                $.each(a, function () {
                    if (o[this.name] !== undefined) {
                        if (!o[this.name].push) {
                            o[this.name] = [o[this.name]];
                        }
                        o[this.name].push(this.value || '');
                    } else {
                        o[this.name] = this.value || '';
                    }
                });
                return o;
            },
            // Find the right method, call on correct element
            launchIntoFullscreen: function(element) {
                if(element.requestFullscreen) {
                    element.requestFullscreen();
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if(element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if(element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            },
            // Whack fullscreen
            exitFullscreen:function() {
                if(document.exitFullscreen) {
                    document.exitFullscreen();
                } else if(document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if(document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            },
            set_zindex: function (val){
                jQuery('*').filter(function(){
                    var position = jQuery(this).css('position');
                    return position === 'absolute';
                }).each(function(){
                    $(this).attr('zindex',$(this).css('z-index'));
                    $(this).css('z-index',val);
                });
            },
            restore_zindex: function () {
                $('*[zindex]').each(function(){
                    var zindex = $(this).attr('zindex');
                    $(this).css('z-index',zindex);
                    $(this).removeAttr('zindex')
                });
            },
            set_dims: function (selector, nh,nw){
                $(selector).css('margin','0').css('height',nh).css('width',nw);
            },
            set_style_css_attr: function (selector,attr,val){
                $(selector).css(attr,val);
            },
            save_style_attr:function(selector){
                var $sel = $(selector);
                var style = $sel.attr('style');
                if (typeof style == typeof undefined || style !== false) {
                    style = '';
                }
                $sel.attr('saved-style', style);
            },
            restore_style_attr:function(selector){
                var $sel = $(selector+'[saved-style]');
                $sel.attr('style',$sel.attr('saved-style'));
                $sel.removeAttr('saved-style');
            }
        },
        options:{
            deck: {
                classes: {
                    after: 'deck-after',
                    before: 'deck-before',
                    childCurrent: 'deck-child-current',
                    current: 'deck-current',
                    loading: 'deck-loading',
                    next: 'deck-next',
                    onPrefix: 'on-slide-',
                    previous: 'deck-previous'
                },

                selectors: {
                    container: '.deck-container',
                    slides: '.slide'
                },

                keys: {
                    next: [],
                    previous: []
                },

                touch: {
                    swipeDirection: 'horizontal',
                    swipeTolerance: 60
                },

                initLockTimeout: 10000,
                hashPrefix: 'slide',
                preventFragmentScroll: true,
                setAriaHiddens: true
            }
        }
    };

    $.fn.bindFirst = function(name, fn) {
        this.on(name, fn);
        this.each(function() {
            var handlers = $._data(this, 'events')[name.split('.')[0]];
            var handler = handlers.pop();
            handlers.splice(0, 0, handler);
        });
    };

    $.vis = function (action, arg) {


        var param={};
        if (typeof arg !== 'undefined'){
            param = arg;
        }

        function set_diagonal(){
            if (typeof context.gm.formmetadata.diagonal == 'undefined'){
                context.gm.metadata.diagonal = context.functions.calc_diagonal();
                $("input[name='diagonal']").val(context.gm.metadata.diagonal);
            }
        }

        function set_userid(){
            if (typeof context.gm.formmetadata.userid == 'undefined'){
                context.gm.metadata.userid = context.functions.uid();
                $("input[name='userid']").val(context.gm.metadata.userid);
            }
        }

        if (action === "init-slide"){
            var $canvas = param.slide.find('canvas');
            if ($canvas.length && context.gm.new_game($canvas) ) {
                context.gm.canvas().getContext("2d").lineWidth = 2;
                context.functions.set_zindex(0);
                context.functions.restore_style_attr('html');
                context.functions.save_style_attr('html');
                context.functions.set_dims('html', window.innerHeight, window.innerWidth);
                context.functions.set_style_css_attr('html', 'overflow', 'hidden');
            } else {
                context.functions.restore_zindex();
                context.functions.restore_style_attr('html');
                context.functions.save_style_attr('html');
            }
        }

        if (action === "full-screen"){
            context.functions.launchIntoFullscreen(document.documentElement);
            //context.functions.restore_style_attr('html');
            //context.functions.save_style_attr('html');
            context.functions.set_dims('html',window.innerHeight,window.innerWidth);
            set_diagonal();
        }

        if (action === "full-screen-exit"){
            context.functions.exitFullscreen();
            context.functions.set_dims('html',window.innerHeight,window.innerWidth);
            set_diagonal();
        }

        if (action === "submit") {
            context.gm.submit();
        }

        if (action === "init") {
            $.extend(true, context.options, param);
            $.deck.defaults = context.options.deck;
            $.deck('.slide');
            $.vis( 'init-slide', {slide: $.deck('getSlide') } );
            set_userid();
            set_diagonal();



            $('.site-content').addClass('site-content--survey');
            context.functions.save_style_attr('.site-content--survey > div');
            $c_div = $('.site-content--survey > div');
            $c_div.css('margin-top',$c_div.height()/2);




            $(document).bind('deck.change', function (event, from, to) {
                $.vis( 'init-slide', {slide: $.deck('getSlide', to) } );
            });

            KEY_ENTER = 13;
            window.addEventListener('keydown', function (e) {
                if (e.keyCode == KEY_ENTER && context.gm.current !== undefined) {
                    e.preventDefault();
                    $.vis( 'submit');
                }
            });
        }

        if (action === "save") {
            $(param).off('click');
            console.log(context.gm.states);
            $.extend(true, context.gm.metadata, context.gm.formmetadata);
            console.log(context.gm.metadata);
            context.functions.post(context.options.post_url, {
                'action': 'survey_submit',
                'survey_id': context.options.survey_id,
                'metadata': JSON.stringify(context.gm.metadata),
                'data': JSON.stringify(context.gm.states)
            });

            var save_event = jQuery.Event( "vis-save" );
            save_event.source  = param;
            $(document).trigger(save_event);

            $('.site-content').removeClass('site-content--survey');
            context.functions.restore_style_attr('.site-content--survey > div');
        }

        if (action === "metadata") {
            $.extend(true, context.gm.formmetadata, param);
            $.extend(true, context.gm.metadata, param);
        }

        if (action === "extend-gm") {
            $.extend(true, context.gm, param);
        }

        if (action === "next") {
            $.deck('next');
            var next_event = jQuery.Event( "vis-next" );
            next_event.source  = param;
            $(document).trigger(next_event);
        }

    };

    $(function() {

        $(window).bind('mousewheel DOMMouseScroll', function (event) {
            if (event.ctrlKey == true) {
                event.preventDefault();
            }
        });

        //Disable scaling
        $(document).keydown(function (event) {
                if (event.ctrlKey == true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189'  )) {
                    event.preventDefault();
                }
            }
        );

        $(document).bind('fullscreenchange', function(e) {
            console.log("fullscreenchange event! ", e);
        });

        $(document).bind('mozfullscreenchange', function(e) {
            console.log("mozfullscreenchange event! ", e);
        });

        $(document).bind('webkitfullscreenchange', function(e) {
            console.log("webkitfullscreenchange event! ", e);
        });

        $(document).bind('msfullscreenchange', function(e) {
            console.log("msfullscreenchange event! ", e);
        });

        $(document).bind( "vis-next vis-save", function(e){
            var $source = $(e.source);
            if ($source.hasClass('vis-full-screen')){
                $.vis('full-screen',this);
            } else if ($source.hasClass('vis-full-screen-exit')){
                $.vis('full-screen-exit',this);
            }
        });

        $(".vis-next").bindFirst('click',function(event){
            $.vis('next',this);
        });

        $(".vis-save").bindFirst('click',function(){
            $.vis('save',this);
        });

        $(".vis-form").bindFirst('submit',function(event){
            event.preventDefault();
            if ($(this).parsley().validate()) {
                $.vis('metadata', context.functions.serializeObject(this));
                $.vis('next',this);
                $(this).remove();
            }
        });

    });

})(jQuery);