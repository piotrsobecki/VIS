function LineComponent(x1,y1,x2,y2){
	return {
		update: function(context){
		  context.beginPath();
		  context.moveTo(x1, y1);
		  context.lineTo(x2, y2);
		  context.stroke();
		},
		newPos: function(context){
		}
	}
}

function PonzoComponent(x,y,angle,len_line,width,len_reference,len){
	
	function endpoints(m,angle,len){
		var a = Math.tan(angle* (Math.PI/180));
		var b = m.y - a * m.x;
		var x0 = m.x - (len/2) / Math.sqrt(1 + Math.pow(a,2));
		var x1 = m.x + (len/2) / Math.sqrt(1 + Math.pow(a,2));
		return [{x:x0,y:a*x0+b},{x:x1,y:a*x1+b}];
	}
		
	return {
		length:len,
		length_reference:len_reference,
		speed:0,
		update: function(context){
							
			mid = {x:x-width/2,y:y}
			ep_left = endpoints(mid,-angle,len_line);
			
			mid = {x:x+width/2,y:y}
			ep_right = endpoints(mid,angle,len_line);
					
			
			new LineComponent(ep_left[0].x,ep_left[0].y,ep_left[1].x,ep_left[1].y).update(context);
			new LineComponent(ep_right[0].x,ep_right[0].y,ep_right[1].x,ep_right[1].y).update(context);
			
			//Reference
			x11 = x - this.length_reference /2;
			x21 = x + this.length_reference /2;
			
			y11 = y - width/4;
			y21 = y - width/4;
			
			// Test
			x12 = x - this.length /2;
			x22 = x + this.length /2;
			
			y12 = y + width/4;
			y22 = y + width/4;
			
			new LineComponent(x11,y11,x21,y21).update(context);
			new LineComponent(x12,y12,x22,y22).update(context);	
		},
		newPos: function(context){
			new_length = this.length + this.speed;
			if (new_length > 0){
				this.length = new_length;
			}
		}
	}
}
function InwardMultiArrowComponent(x,y,len,r,theta){
	return {
		length:len,
		speed:0,
		update: function(context){
				
			var x1 = x - this.length/2;
			var x2 = x + this.length/2;
			var y1 = y;
			var y2 = y;
			
			new LineComponent(x1,y1,x2,y2).update(context);
			
			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x1 + r * Math.cos(theta/2), y1 + r * Math.sin(theta));
			context.stroke();
						
			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x1 + r * Math.cos(-theta/2), y1 + r * Math.sin(-theta));
			context.stroke();
						
			context.beginPath();
			context.moveTo(x2, y2);
			context.lineTo(x2 + r * Math.cos(-theta), y2 + r * Math.sin(-theta));
			context.stroke();
						
			context.beginPath();
			context.moveTo(x2, y2);
			context.lineTo(x2 + r * Math.cos(-theta), y2 + r * Math.sin(theta));
			context.stroke();
		},
		newPos: function(context){
			new_length = this.length + this.speed;
			if (new_length > 0){
				this.length = new_length;
			}
		}
	}
}

function MultiArrowComponent(x,y,len,r,theta){
	return {
		length:len,
		speed:0,
		update: function(context){
		
			var x1 = x - this.length/2;
			var x2 = x + this.length/2;
			var y1 = y;
			var y2 = y;
			
			main = new LineComponent(x1,y1,x2,y2).update(context);
				
			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x1 + r * Math.cos(theta), y1 + r * Math.sin(theta));
			context.stroke();
						
			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x1 + r * Math.cos(-theta), y1 + r * Math.sin(-theta));
			context.stroke();
						
			context.beginPath();
			context.moveTo(x2, y2);
			context.lineTo(x2 + r * Math.cos(-theta/2), y2 + r * Math.sin(-theta));
			context.stroke();
						
			context.beginPath();
			context.moveTo(x2, y2);
			context.lineTo(x2 + r * Math.cos(-theta/2), y2 + r * Math.sin(theta));
			context.stroke();
		},
		newPos: function(context){
			new_length = this.length + this.speed;
			if (new_length > 0){
				this.length = new_length;
			}
		}
	}
}


function CircleComponent(x,y,radius){
	return {
		x: x,
		y:y,
		radius: radius,
		radius_speed: 0,
		update: function(ctx){
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
			ctx.stroke();
		},
		newPos: function(){
			new_radius = this.radius + this.radius_speed;
			if (new_radius > 1){
				this.radius = new_radius;
			}
			
		}
	}
}


function EbinghouseComponent(x, y, radius,  radius_central, n_components, radius_component,  color) {
	var central_elem = new CircleComponent(x,y,radius_central);
	var component_elems = [];
	for (i =0; i< n_components; i++){
		angle = i * 360 / n_components;
		coords = angle_mapper(x,y,radius,angle,1);
		component_elems.push(new CircleComponent(coords.x,coords.y,radius_component));
	}
	function angle_mapper(center_x,center_y,radius,angle,distance){
		return {
			x: center_x + radius * Math.cos(-angle*Math.PI/180) * distance,
			y: center_y + radius * Math.sin(-angle*Math.PI/180) * distance
		}
	}
	
	this.central = central_elem;
	
    this.update = function(ctx) {
        ctx.fillStyle = color;
		central_elem.update(ctx);
		component_elems.forEach(function(elem) {
			elem.update(ctx);
		});		
    },
    this.newPos = function() {
		central_elem.newPos();
		component_elems.forEach(function(elem) {
			elem.newPos();
		});		
    } 
}


function StripedLineComponent(x1,x2,y,angle,spacing, inverse){
		
	return {
		angle:angle,
		update: function(context){
		
			context.save();
			context.translate((x1+x2)/2,y);
			context.rotate(this.angle*Math.PI/180);
			context.translate(-(x1+x2)/2,-y);
			new LineComponent(x1,y,x2,y).update(context);
			context.restore();		
			
			stripe_len = 3*spacing;
			len = (x2 - x1)/spacing;
			running_x = x1 - spacing;
			for (i =0; i< len; i++){
				if (inverse){
					x2 = running_x + spacing;
					x1 = running_x + 2*spacing;
				} else {
					x1 = running_x + spacing;
					x2 = running_x + 2*spacing;
				}
				new LineComponent(x1,y+stripe_len/2,x2,y-stripe_len/2).update(context);
				running_x += spacing;
			}
		},
		newPos: function(context){
		}
	}
}

function ZollnerComponent(x,y,width, height, spacings, rotation_angle,angle_reference,angle){
	return {
		angle:angle,
		angle_reference:angle_reference,
		speed:0,
		update: function(context){
			context.save();
			context.translate(x,y);
			context.rotate(rotation_angle*Math.PI/180);
			context.translate(-x,-y);
			new StripedLineComponent( x - width/2, x + width/2, y - height/3, this.angle_reference, spacings,false).update(context);

			new StripedLineComponent( x - width/2, x + width/2, y, this.angle,spacings ,true).update(context);

			new StripedLineComponent( x - width/2, x + width/2, y + height/3, this.angle_reference, spacings,false ).update(context);
			context.restore();			
		},
		newPos: function(context){
			this.angle = this.angle + this.speed;
		}
	}
}



function PoggendorffComponent(x,y,width,height,offset_reference,offset){


	function intersection(x1,y1,x2,y2,x3,y3,x4,y4){
		return {
			x: ( (x1*y2 - y1*x2) * (x3-x4) - (x1-x2) * (x3*y4-y3*x4) ) / ( (x1 - x2) * (y3 - y4 ) - (y1 - y2)*(x3 - x4) ),
			y: ( (x1*y2 - y1*x2) * (y3-y4) - (y1-y2) * (x3*y4-y3*x4) ) / ( (x1 - x2) * (y3 - y4 ) - (y1 - y2)*(x3 - x4) )
		}
		
	}

	return {
		offset:offset,
		offset_reference:offset_reference,
		speed:0,
		update: function(context){
				
			var x11 = x - width/2;
			var x12 = x - width/2;
			
			var y11 = y - height/2;
			var y12 = y + height/2;
			
			var x21 = x + width/2;
			var x22 = x + width/2;
			
			var y21 = y - height/2;
			var y22 = y + height/2;
			
					
			
			new LineComponent(x11,y11,x12,y12).update(context);
			new LineComponent(x21,y21,x22,y22).update(context);
			
			//Reference
			x11a = x - width;
			x21a = x12;
			
			y11a = y + height/2 - this.offset_reference;
			y21a = y + height/4 - this.offset_reference;
			
			
			new LineComponent(x11a,y11a,x21a,y21a).update(context);
				
				
			p1 = intersection(x11a,y11a,x21a,y21a,x21,y21,x22,y22);


			
			// Test
			x12 = p1.x;
			x22 = p1.x + width/2;
			
			y12 = p1.y - this.offset;
			y22 = p1.y - height/4 - this.offset;
			
			new LineComponent(x12,y12,x22,y22).update(context);	
		},
		newPos: function(context){
			this.offset = this.offset + this.speed;
		}
	}
}

//UTILS

function EnhancedCanvas(canvas){
	
	canvas.maximize = function (){
			this.width  = window.innerWidth;
			this.height = window.innerHeight;
			return this;
	}
	
	canvas.minimize = function(){
		this.width = 0;
		this.height = 0;
		return this;
	}
	
	
	canvas.hide = function(){
		this.style.display = 'none';
		return this;
	}
	
	canvas.show = function(){
		this.style.display = 'block';
		return this;
	}
	
	return canvas;
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

var vis_utils = {
	random_change: function (val,rr){
		return val + (rr * Math.random() - rr/2);
	}
}


//GAMES
KEY_UP = 38;
KEY_DOWN = 40;
KEY_LEFT = 37;
KEY_RIGHT = 39;

//tl, bl, tal, bal, rr
function MullerLyerGame(opt){

	var o = merge_options({
		canvasID:'canvas', //ID of canvas in html
		ppi:96, //PPI
		speed:60, //Change speed
		spacing: 100, // Spacing between top and bottom component
		tl:300, //Top component Length
		bl:300, //Bottom component Length
		theta:90, //Arrow angle
		rr:100	//Random modifier
	},opt);
	
	o =  merge_options({
		tal:o.tl/4, //Top arrows length 
		bal:o.bl/4 //Bottom arrows length 
	},o);
		
	var keys = {}
	
	var area = {
		canvas : new EnhancedCanvas(document.getElementById(o.canvasID)).maximize(),
		start : function() {
			this.canvas.show();
			this.context = this.canvas.getContext("2d");
			window.addEventListener('keydown', function (e) {
				keys = (keys || []);
				keys[e.keyCode] = true;
			})
			window.addEventListener('keyup', function (e) {
				keys[e.keyCode] = false; 
			})
		}, 
		clear : function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}
	
	var handlers = {	
		up: function(){
			elem_test.speed = 1;
		},
		down: function(){
			elem_test.speed = -1;
		},
		left: function(){
		
		},
		right: function(){
		
		}
	}
	
	return {
		start: function() {
			area.start();
			w = area.canvas.width;
			h = area.canvas.height;
		
			elem_test = new InwardMultiArrowComponent(w/2,h/2-o.spacing/2,vis_utils.random_change(o.tl,o.rr),o.tal,o.theta);
			elem_ref  = new MultiArrowComponent(w/2,h/2+o.spacing/2,vis_utils.random_change(o.tl,o.rr),o.bal,o.theta);
			
			time_start = Date.now();
			
			this.interval = setInterval(this.update,  o.speed);
		},  
		stop: function(){
			clearInterval(this.interval);
			this.clear();
			area.canvas.hide();
		},
		clear: function() {
			area.clear();
		},
		update: function(){
			area.clear();
			elem_test.speed = 0;
			
			if (keys[KEY_RIGHT]) handlers.right();
			if (keys[KEY_LEFT])  handlers.left(); 
			if (keys[KEY_UP])    handlers.up();
			if (keys[KEY_DOWN])  handlers.down();
			
			elem_test.newPos(); 
			elem_ref.newPos(); 
			
			elem_test.update(area.context);
			elem_ref.update(area.context);
		},
		state: function(){
			return {
				time_msec: Date.now() - time_start,
				test: elem_test.length/o.ppi,
				reference: elem_ref.length/o.ppi
			}
		}
	}
} 

//spacing, line_length, angle, tl, bl, rr
function PonzoGame(opt){
	
	var o = merge_options({
		canvasID:'canvas', //ID of canvas in html
		ppi:96, //PPI
		speed:60, //Change speed
		spacing: 300, // Spacing between top and bottom component
		side_line_length: 300, // Side lines length
		tl: 200, //Length of the top line
		bl: 200, //Length of the bottom line
		rr:50, //Random modifier
		angle:60 //Angle of side lines
	},opt);
	
	var keys = {}
	
	var area = {
		canvas : new EnhancedCanvas(document.getElementById(o.canvasID)).maximize(),
		start : function() {
			this.canvas = this.canvas.show();
			this.context = this.canvas.getContext("2d");
			window.addEventListener('keydown', function (e) {
				keys = (keys || []);
				keys[e.keyCode] = true;
			})
			window.addEventListener('keyup', function (e) {
				keys[e.keyCode] = false; 
			})
		}, 
		clear : function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}
	
	var handlers = {	
		up: function(){
			elem_test.speed = 1;
		},
		down: function(){
			elem_test.speed = -1;
		},
		left: function(){
		
		},
		right: function(){
		
		}
	}
	
	return {
		start: function() {
			area.start();
			w = area.canvas.width;
			h = area.canvas.height;
			
			tl = o.tl;//vis_utils.random_change(o.tl,o.rr);
			bl = vis_utils.random_change(o.bl,o.rr);
			
			elem_test = new PonzoComponent(w/2,h/2,o.angle,o.side_line_length,o.spacing,tl,bl);
			
			time_start = Date.now();
			
			this.interval = setInterval(this.update,  o.speed);
		}, 
		clear: function() {
			area.clear();
		}, 
		stop: function(){
			clearInterval(this.interval);
			this.clear();
			area.canvas.hide();
		},
		update: function(){
			area.clear();
			elem_test.speed = 0;
			
			if (keys[KEY_RIGHT]) handlers.right();
			if (keys[KEY_LEFT])  handlers.left(); 
			if (keys[KEY_UP])    handlers.up();
			if (keys[KEY_DOWN])  handlers.down();
			
			elem_test.newPos(); 
			elem_test.update(area.context);
		},
		state: function(){
			return {
				time_msec: Date.now() - time_start,
				test: elem_test.length/o.ppi,
				reference: elem_test.length_reference/o.ppi
			}
		}
	}
} 



//R, LRO, LRI, RRI, RRO, NC, RR, speed
function EbinghouseGame(opt){
	
	var o = merge_options({
		canvasID:'canvas', //HTML ID 
		ppi:96, //PPI
		speed:60, //Update speed 
		spacing:100, //Spacing between components
		radius:100, //Radius of components
		lri:10, //Radius of left inner circle
		lro:20, //Radius of left outer circle
		rri:20, //Radius of right inner circle
		rro:10, //Radius of right outer circle
		rr:5,	//Random modifier
		nc: 8 	//Number of outer circles
	},opt);
	
	var keys = {}
	
	var area = {
		canvas : new EnhancedCanvas(document.getElementById(o.canvasID)).maximize(),
		start : function() {
			this.canvas.show();
			this.context = this.canvas.getContext("2d");
			window.addEventListener('keydown', function (e) {
				keys = (keys || []);
				keys[e.keyCode] = true;
			})
			window.addEventListener('keyup', function (e) {
				keys[e.keyCode] = false; 
			})
		}, 
		clear : function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}
	
	var handlers = {	
		up: function(){
			elem_left.central.radius_speed = 1;
		},
		down: function(){
			elem_left.central.radius_speed = -1;
		},
		left: function(){
		
		},
		right: function(){
		
		}
	}
	
	return {
		start: function() {
			area.start();
			c_x = area.canvas.width / 2;
			c_y = area.canvas.height / 2;
			
			
			elem_left = new EbinghouseComponent(c_x-o.spacing/2, c_y, o.radius, vis_utils.random_change(o.lri,o.rr), o.nc, o.lro, "red");
			elem_right = new EbinghouseComponent(c_x+o.spacing/2, c_y, o.radius, vis_utils.random_change(o.rri,o.rr), o.nc, o.rro, "red");
			
			time_start = Date.now();
			
			this.interval = setInterval(this.update,  o.speed);
		},  
		stop: function(){
			clearInterval(this.interval);
			area.canvas.hide();
			this.clear();
		},
		clear: function() {
			area.clear();
		},
		update: function(){
			area.clear();
			elem_left.central.radius_speed = 0;
			
			if (keys[KEY_RIGHT]) handlers.right();
			if (keys[KEY_LEFT])  handlers.left(); 
			if (keys[KEY_UP])    handlers.up();
			if (keys[KEY_DOWN])  handlers.down();
			
			elem_left.newPos(); 
			elem_right.newPos(); 
			
			elem_left.update(area.context);
			elem_right.update(area.context);
		},
		state: function(){
			return {
				time_msec: Date.now() - time_start,
				test: elem_left.central.radius/o.ppi,
				reference: elem_right.central.radius/o.ppi
			}
		}
	}
} 

//len, rr, spacing, spacings, 
function ZollnerGame(opt){

	var o = merge_options({
		canvasID:'canvas', //ID of canvas in html
		ppi:96, //PPI
		speed:60, //Change speed
		spacing: 200, // Spacing between top and bottom component
		spacings: 20, // Spacing between top and bottom component
		len: 500, //Length of the  lines
		rotangle: -45, //Default rotation angle
		rr:10 //Random modifier
	},opt);
	
	var keys = {}
	
	var area = {
		canvas : new EnhancedCanvas(document.getElementById(o.canvasID)).maximize(),
		start : function() {
			this.canvas.show();
			this.context = this.canvas.getContext("2d");
			window.addEventListener('keydown', function (e) {
				keys = (keys || []);
				keys[e.keyCode] = true;
			})
			window.addEventListener('keyup', function (e) {
				keys[e.keyCode] = false; 
			})
		}, 
		clear : function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}
	
	var handlers = {	
		up: function(){
			elem_test.speed = 1;
		},
		down: function(){
			elem_test.speed = -1;
		},
		left: function(){
		
		},
		right: function(){
		
		}
	}
	
	return {
		start: function() {
			area.start();
			w = area.canvas.width;
			h = area.canvas.height;
			
			rot_angle = vis_utils.random_change(o.rotangle,o.rr);
			angle = vis_utils.random_change(0,o.rr);
			reference_angle = vis_utils.random_change(0,o.rr);
			
			
			elem_test = new ZollnerComponent(w/2,h/2,o.len,o.spacing*3,o.spacings,rot_angle,reference_angle,angle);
			
			time_start = Date.now();
			
			this.interval = setInterval(this.update,  o.speed);
		},  
		stop: function(){
			clearInterval(this.interval);
			this.clear();
			
			area.canvas.hide();
		},
		clear: function() {
			area.clear();
		},
		update: function(){
			area.clear();
			elem_test.speed = 0;
			if (keys[KEY_RIGHT]) handlers.right();
			if (keys[KEY_LEFT])  handlers.left(); 
			if (keys[KEY_UP])    handlers.up();
			if (keys[KEY_DOWN])  handlers.down();
			
			elem_test.newPos(); 
			elem_test.update(area.context);
		},
		state: function(){
			return {
				time_msec: Date.now() - time_start,
				test: elem_test.angle,
				reference: elem_test.angle_reference
			}
		}
	}
} 


//spacing, height, rr
function PoggendorffGame(opt){

	var o = merge_options({
		canvasID:'canvas', //HTML ID 
		ppi:96, //PPI
		speed:60, //Update speed 
		spacing:200, //Spacing between components,
		height:600, //Spacing between components,
		rr:200 //Random modifier
	},opt);
	
	var keys = {}
	
	var area = {
		canvas : new EnhancedCanvas(document.getElementById(o.canvasID)).maximize(),
		start : function() {
			this.canvas.show();
			this.context = this.canvas.getContext("2d");
			window.addEventListener('keydown', function (e) {
				keys = (keys || []);
				keys[e.keyCode] = true;
			})
			window.addEventListener('keyup', function (e) {
				keys[e.keyCode] = false; 
			})
		}, 
		clear : function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}
	
	var handlers = {	
		up: function(){
			elem_test.speed = 1;
		},
		down: function(){
			elem_test.speed = -1;
		},
		left: function(){
		
		},
		right: function(){
		
		}
	}
	
	return {
		start: function() {
			area.start();
			w = area.canvas.width;
			h = area.canvas.height;	
			
			elem_test = new PoggendorffComponent(w/2,h/2,o.spacing,o.height,0,vis_utils.random_change(0,o.rr));
			
			time_start = Date.now();
			
			this.interval = setInterval(this.update,  o.speed);
		}, 
		stop: function(){
			clearInterval(this.interval);
			this.clear();
			
			area.canvas.hide();
		},
		clear: function() {
			area.clear();
		},
		update: function(){
			area.clear();
			elem_test.speed = 0;
			
			if (keys[KEY_RIGHT]) handlers.right();
			if (keys[KEY_LEFT])  handlers.left(); 
			if (keys[KEY_UP])    handlers.up();
			if (keys[KEY_DOWN])  handlers.down();
			
			elem_test.newPos(); 
			elem_test.update(area.context);
		},
		state: function(){
			return {
				time_msec: Date.now() - time_start,
				test: elem_test.offset/o.ppi,
				reference: elem_test.offset_reference/o.ppi
			}
		}
	}
} 