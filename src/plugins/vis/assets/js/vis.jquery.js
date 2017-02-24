
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
            current: undefined,
            current_fn: undefined,
            states: {},
            metadata: {},
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
                    return new EbinghouseGame(opt);
                },
                ml: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'tl', 'bl', 'rr'], ppi);
                    add_attrs(opt, $canvas, ['speed', 'theta'], 1);
                    return new MullerLyerGame(opt);
                },
                ponzo: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'height', 'rr', 'tl', 'bl', 'side_line_length'], ppi);
                    add_attrs(opt, $canvas, ['speed', 'angle'], 1);
                    return new PonzoGame(opt);
                },
                poggendorff: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'height', 'rr'], ppi);
                    add_attrs(opt, $canvas, ['speed'], 1);
                    return new PoggendorffGame(opt);
                },
                zollner: function (ppi, $canvas) {
                    var opt = {
                        canvasID: $canvas.attr('id'),
                        ppi: ppi
                    };
                    add_attrs(opt, $canvas, ['spacing', 'spacings', 'len'], ppi);
                    add_attrs(opt, $canvas, ['speed', 'rotangle', 'rr'], 1);
                    return new ZollnerGame(opt);
                }
            },
            can_submit: function(){
                return typeof this.current !== 'undefined' && !this.current_$canvas.is('[timeout-wait]');
            },
            submit: function(){
                if ( this.can_submit()){
                    var self = this;
                    this.i = this.i + 1;
                    this.log();
                    this.stop();
                    console.log(this.states);
                    if (this.i > this.n) {
                        this.clear_game();
                        $.vis('next');
                    } else {
                        this.current.clear();
                        this.current_$canvas.attr("timeout-wait","true");
                        setTimeout(function(){
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
                $html = $(selector);
                var h = $html.height();
                var w = $html.width();
                $html.attr('saved-h',h);
                $html.attr('saved-w',w);
                $html.attr('saved-margin',$html.css('margin'));
                $html.height(nh);
                $html.width(nw);
                $html.attr('style', function(i,s) { return s + 'margin: 0 !important;' });
            },
            restore_dims: function (selector) {
                $html = $(selector);
                $html.height($html.attr('saved-h'));
                $html.width($html.attr('saved-w'));
                $html.css('margin',$html.attr('saved-margin'));
                $html.removeAttr('saved-h');
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

    $.vis = function (action, options = {}) {

        function init_slide($slide){

        }

        if (action === "init-slide"){
            var $canvas = options.slide.find('canvas');
            if ($canvas.length && context.gm.new_game($canvas) ) {
                context.functions.set_zindex(0);
                context.functions.set_dims('html',window.innerHeight,window.innerWidth);
            } else {
                context.functions.restore_zindex();
                context.functions.restore_dims('html[saved-h]');
            }
        }

        if (action === "init") {
            $.extend(true, context.options, options);
            $.deck.defaults = context.options.deck;
            $.deck('.slide');
            $.vis( 'init-slide', {slide: $.deck('getSlide') } );

            $(document).bind('deck.change', function (event, from, to) {
                $.vis( 'init-slide', {slide: $.deck('getSlide', to) } );
            });

            KEY_ENTER = 13;
            window.addEventListener('keydown', function (e) {
                if (e.keyCode == KEY_ENTER && context.gm.current !== undefined) {
                    e.preventDefault();
                    context.gm.submit();
                }
            });

            context.gm.metadata.userid = context.functions.uid();
            context.gm.metadata.diagonal = context.functions.calc_diagonal();
            $("input[name='userid']").val(context.gm.metadata.userid);
            $("input[name='diagonal']").val(context.gm.metadata.diagonal);
        }

        if (action === "save") {
            console.log(context.gm.states);
            console.log(context.gm.metadata);
            context.functions.post(context.options.post_url, {
                'action': 'survey_submit',
                'survey_id': context.options.survey_id,
                'metadata': JSON.stringify(context.gm.metadata),
                'data': JSON.stringify(context.gm.states)
            });
        }

        if (action === "metadata") {
            $.extend(true, context.gm.metadata, options);
        }

        if (action === "extend-gm") {
            $.extend(true, context.gm, options);
        }

        if (action === "next") {
            $.deck('next');
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


        $(".vis-full-screen").click(function(){
            context.functions.launchIntoFullscreen(document.documentElement);
        });

        $(".vis-full-screen-exit").click(function(){
            context.functions.exitFullscreen();
        });

        $(".vis-next").click(function(event){
            $.vis('next');
        });

        $(".vis-save").click(function(){
            $.vis('save');
        });

        $(".vis-form").submit(function(event){
            event.preventDefault();
            if ($(this).parsley().validate()) {
                $.vis('metadata', context.functions.serializeObject(this));
                $.vis('next');
                $(this).remove();
            }
        });
    });

})(jQuery);