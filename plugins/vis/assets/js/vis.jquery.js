function GameManager(){

	function get_attr($canvas,attr){
			return $canvas.attr('data-vis-'+attr);
	}
	
	function add_attrs(opt,$canvas,attrs,factor){
		for (i = 0; i < attrs.length; i++) { 
			attr = get_attr($canvas,attrs[i]);
			if (typeof attr !== typeof undefined && attr !== false) {
				opt[attrs[i]] = attr * factor;	
			}
		}
		return opt;
	}
	
	
	
	function calc_dpi(diagonal_in){
		var w = window.innerWidth;
		var h = window.innerHeight;
		var dp = Math.sqrt( Math.pow(w, 2) + Math.pow(h, 2) );
		return dp / diagonal_in;
	}
	
	function get_state_key(states,proposed,i){
		var new_proposed = proposed+1;
		if (states[new_proposed] != undefined){
			return get_state_key(states,proposed,i+1);
		} 
		return new_proposed;
	}
	
	return {
		current:undefined,
		current_fn:undefined,
		states:{},
		metadata:{},
		i:0,
		n:0,
		games: {
			ebbinghaus: function (ppi,$canvas){
				var opt = {
					canvasID: $canvas.attr('id'),
					ppi: ppi
				};
				add_attrs(opt,$canvas,['spacing','radius','lri','lro','rri','rro','rr'],ppi);
				add_attrs(opt,$canvas,['speed','nc'],1);
				return new EbinghouseGame(opt);
			},
			ml: function (ppi,$canvas){
				var opt = {
					canvasID: $canvas.attr('id'),
					ppi: ppi
				};
				add_attrs(opt,$canvas,['spacing','tl','bl','rr'],ppi);
				add_attrs(opt,$canvas,['speed','theta'],1);
				return new MullerLyerGame(opt);
			},
			ponzo: function (ppi,$canvas){
				var opt = {
					canvasID: $canvas.attr('id'),
					ppi: ppi
				};
				add_attrs(opt,$canvas,['spacing','height','rr','tl','bl','side_line_length'],ppi);
				add_attrs(opt,$canvas,['speed','angle'],1);
				return new PonzoGame(opt);
			},
			poggendorff: function(ppi,$canvas){
				var opt = {
					canvasID: $canvas.attr('id'),
					ppi: ppi
				};
				add_attrs(opt,$canvas,['spacing','height','rr'],ppi);
				add_attrs(opt,$canvas,['speed'],1);
				return new PoggendorffGame(opt);
			},
			zollner: function(ppi,$canvas){
				var opt = {
					canvasID: $canvas.attr('id'),
					ppi: ppi
				};		
				add_attrs(opt,$canvas,['spacing','spacings','len'],ppi);
				add_attrs(opt,$canvas,['speed','rotangle','rr'],1);
				return new ZollnerGame(opt);
			}
		},
		start: function(){
			this.current.start();
		},
		stop: function(){
			this.current.stop();
		},
		clear_game: function(){
			if (this.current !== undefined){
				this.current.stop();
			}
			this.i = 0;
			this.current = undefined;
			this.current_fn = undefined;
		},
		new_game: function($canvas){
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
			if (this.states[this.state_key] != undefined){
				this.state_key = get_state_key(this.states,this.state_key,1);
			}
			
			this.states[this.state_key] = [];
			this.current = this.games[this.current_fn](ppi,$canvas);
			this.current.start();
		},	
		log: function(){
			this.states[this.state_key].push(this.current.state())
		}
	}
}


(function($){
	
	function uid() {
		return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
	}
	
	function calc_diagonal(){
		var dpi_x = document.getElementById('dpi').offsetWidth;
		var dpi_y = document.getElementById('dpi').offsetHeight;
		var w = window.innerWidth / dpi_x;
		var h = window.innerHeight / dpi_y;
		return Math.sqrt( Math.pow(w, 2) + Math.pow(h, 2) );
	}
	
	var util = {
		post: function(url, fields) {
			var $form = $('<form>', {
				action: url,
				method: 'post'
			});
			$.each(fields, function(key, val) {
				 $('<input>').attr({
					 type: "hidden",
					 name: key,
					 value: val
				 }).appendTo($form);
			});
			$form.appendTo('body').submit();
		}
	};



	var gm = new GameManager();
	function _init_deck(deck_params={}){
		$.deck.defaults = {
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

		$.extend(true, $.deck.defaults, deck_params);
		$.deck('.slide');	
	
	} 
	
	//Ex. form to object
	$.fn.serializeObject = function(){
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
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
	};
	
	$.vis_form_submit = function(form){
		if ($(form).parsley().validate()){
			$.vis('metadata',$(form).serializeObject()); 
			$.vis('next');  
			$(form).remove();
		};
		return false;
	}

	$.vis = function( action, options = {}) {
		
		if ( action === "init") {
			_init_deck(options);
			
			var $canvas = $.deck('getSlide').find('canvas');
			if ($canvas.length){
				gm.new_game($canvas);
			}
			
			$(document).bind('deck.change', function(event, from, to) {
			   $canvas = $.deck('getSlide',to).find('canvas');
			   if ($canvas.length){
					gm.new_game($canvas);
			   }
			});
			
			
			KEY_ENTER = 13;
			window.addEventListener('keydown', function (e) {
				if (e.keyCode == KEY_ENTER && gm.current !== undefined){
					e.preventDefault();
					gm.i = gm.i + 1;
					gm.log();
					gm.stop();
					console.log(gm.states);
					if (gm.i > gm.n){
						gm.clear_game();
						$.vis('next');
					} else {
						alert("Próba "+gm.i+" z "+gm.n);
						gm.start();
					}
				}
			})
			gm.metadata.userid = uid(); 
			gm.metadata.diagonal = calc_diagonal();
			$( "input[name='userid']" ).val( gm.metadata.userid ); 
			$( "input[name='diagonal']" ).val( gm.metadata.diagonal );  
		}
		
		if ( action === "save") {
			console.log(gm.states);
			console.log(gm.metadata);
			util.post(options.url,{
				'action':'survey_submit',
				'survey_id':options.survey_id,
				'metadata':JSON.stringify(gm.metadata),
				'data':JSON.stringify(gm.states)
			});
		}
		
		if (action === "metadata"){
			$.extend(true, gm.metadata, options);
		}
		
		if (action === "extend-gm"){
			$.extend(true, gm, options);
		}
		
	 	if (action === "next"){
			$.deck('next');
		}
	 
    };

	//Disable scaling
	$(document).keydown(function(event) {
		if (event.ctrlKey==true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'  ) ) {
				event.preventDefault();
			 }
		}
	);

	$(window).bind('mousewheel DOMMouseScroll', function (event) {
	   if (event.ctrlKey == true) {
			event.preventDefault();
	   }
	});
})(jQuery);