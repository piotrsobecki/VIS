var component_utils = {

    endpoints: function (m, angle, len) {
        var a = Math.tan(angle * (Math.PI / 180));
        var b = m.y - a * m.x;
        var x0 = m.x - (len / 2) / Math.sqrt(1 + Math.pow(a, 2));
        var x1 = m.x + (len / 2) / Math.sqrt(1 + Math.pow(a, 2));
        return [{x: x0, y: a * x0 + b}, {x: x1, y: a * x1 + b}];
    }

};


function LineComponent(x1, y1, x2, y2) {
    return {
        length: function () {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },
        update: function (context) {
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        },
        newPos: function (context) {
        }
    }
}

function CenteredLineComponent(x, y, length) {
    return {
        length: length,
        update: function (context) {
            context.beginPath();
            context.moveTo(x - this.length / 2, y);
            context.lineTo(x + this.length / 2, y);
            context.stroke();
        },
        newPos: function (context) {
            new_length = this.length + this.speed;
            if (new_length > 0) {
                this.length = new_length;
            }
        }
    }
}


function PonzoComponent(x, y, angle, width, side_len_lenth) {

    return {
        speed: 0,
        update: function (context) {
            mid = {x: x - width / 2, y: y};
            ep_left = component_utils.endpoints(mid, -angle, side_len_lenth);
            mid = {x: x + width / 2, y: y};
            ep_right = component_utils.endpoints(mid, angle, side_len_lenth);
            new LineComponent(ep_left[0].x, ep_left[0].y, ep_left[1].x, ep_left[1].y).update(context);
            new LineComponent(ep_right[0].x, ep_right[0].y, ep_right[1].x, ep_right[1].y).update(context);

        },
        newPos: function (context) {
            new_length = this.length + this.speed;
            if (new_length > 0) {
                this.length = new_length;
            }
        }
    }
}
function MultiArrowComponent(x, y, len, r, theta) {
    return {
        length: len,
        speed: 0,
        update: function (context) {

            var x1 = x - this.length / 2;
            var x2 = x + this.length / 2;
            var y1 = y;
            var y2 = y;

            new LineComponent(x1, y1, x2, y2).update(context);

            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1 + r * Math.cos(theta * Math.PI / 180), y1 + r * Math.sin(theta * Math.PI / 180));
            context.stroke();

            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1 + r * Math.cos(-theta * Math.PI / 180), y1 + r * Math.sin(-theta * Math.PI / 180));
            context.stroke();

            context.beginPath();
            context.moveTo(x2, y2);
            context.lineTo(x2 + r * Math.cos(-(180 - theta) * Math.PI / 180), y2 + r * Math.sin(-(180 - theta) * Math.PI / 180));
            context.stroke();

            context.beginPath();
            context.moveTo(x2, y2);
            context.lineTo(x2 + r * Math.cos(-(180 - theta) * Math.PI / 180), y2 + r * Math.sin((180 - theta) * Math.PI / 180));
            context.stroke();
        },
        newPos: function (context) {
            new_length = this.length + this.speed;
            if (new_length > 0) {
                this.length = new_length;
            }
        }
    }
}

function InwardMultiArrowComponent(x, y, len, r, theta) {
    return {
        length: len,
        speed: 0,
        update: function (context) {

            var x1 = x - this.length / 2;
            var x2 = x + this.length / 2;
            var y1 = y;
            var y2 = y;

            main = new LineComponent(x1, y1, x2, y2).update(context);

            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1 + r * Math.cos((180 - theta) * Math.PI / 180), y1 + r * Math.sin((180 - theta) * Math.PI / 180));
            context.stroke();

            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1 + r * Math.cos(-(180 - theta) * Math.PI / 180), y1 + r * Math.sin(-(180 - theta) * Math.PI / 180));
            context.stroke();

            context.beginPath();
            context.moveTo(x2, y2);
            context.lineTo(x2 + r * Math.cos(-theta * Math.PI / 180), y2 + r * Math.sin(-theta * Math.PI / 180));
            context.stroke();

            context.beginPath();
            context.moveTo(x2, y2);
            context.lineTo(x2 + r * Math.cos(-theta * Math.PI / 180), y2 + r * Math.sin(theta * Math.PI / 180));
            context.stroke();
        },
        newPos: function (context) {
            new_length = this.length + this.speed;
            if (new_length > 0) {
                this.length = new_length;
            }
        }
    }
}


function CircleComponent(x, y, radius) {
    return {
        x: x,
        y: y,
        radius: radius,
        radius_speed: 0,
        update: function (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
        },
        newPos: function () {
            new_radius = this.radius + this.radius_speed;
            if (new_radius > 1) {
                this.radius = new_radius;
            }

        }
    }
}

function FixationComponent(x, y, radius, color) {
    return {
        update: function (ctx) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        },
        newPos: function (context) {
        }
    }
}

function EbinghouseComponent(x, y, radius, radius_central, n_components, radius_component, color) {
    var central_elem = new CircleComponent(x, y, radius_central);
    var component_elems = [];
    for (i = 0; i < n_components; i++) {
        angle = i * 360 / n_components;
        coords = angle_mapper(x, y, radius, angle, 1);
        component_elems.push(new CircleComponent(coords.x, coords.y, radius_component));
    }
    function angle_mapper(center_x, center_y, radius, angle, distance) {
        return {
            x: center_x + radius * Math.cos(-angle * Math.PI / 180) * distance,
            y: center_y + radius * Math.sin(-angle * Math.PI / 180) * distance
        }
    }

    this.central = central_elem;

    this.update = function (ctx) {
        ctx.fillStyle = color;
        central_elem.update(ctx);
        component_elems.forEach(function (elem) {
            elem.update(ctx);
        });
    },
        this.newPos = function () {
            central_elem.newPos();
            component_elems.forEach(function (elem) {
                elem.newPos();
            });
        }
}


function StripedLineComponent(x1, x2, y, angle, stripe_spacing, stripe_angle, stripe_len) {
    return {
        angle: angle,
        update: function (context) {
            context.save();
            context.translate((x1 + x2) / 2, y);
            context.rotate(this.angle * Math.PI / 180);
            context.translate(-(x1 + x2) / 2, -y);
            new LineComponent(x1, y, x2, y).update(context);
            context.restore();
            len = (x2 - x1) / stripe_spacing;
            running_x = x1;
            for (i = 0; i < len -1 ; i++) {
                running_x += stripe_spacing;
                var eps = component_utils.endpoints({x:running_x,y:y},stripe_angle,stripe_len);
                new LineComponent(eps[0].x, eps[0].y, eps[1].x, eps[1].y).update(context);
            }
        },
        newPos: function (context) {
        }
    }
}

function ZollnerComponent(x, y, width, height, stripe_spacing, rotation_angle, angle_reference, angle, stripe_angle, stripe_len) {
    return {
        angle: angle,
        angle_reference: angle_reference,
        speed: 0,
        update: function (context) {
            context.save();
            context.translate(x, y);
            context.rotate(rotation_angle * Math.PI / 180);
            context.translate(-x, -y);

            new StripedLineComponent(x - width / 2, x + width / 2, y - height / 3, this.angle_reference, stripe_spacing, stripe_angle,stripe_len).update(context);
            new StripedLineComponent(x - width / 2, x + width / 2, y, this.angle, stripe_spacing, -stripe_angle,stripe_len).update(context);
            new StripedLineComponent(x - width / 2, x + width / 2, y + height / 3, this.angle_reference, stripe_spacing, stripe_angle,stripe_len).update(context);
            context.restore();
        },
        newPos: function (context) {
            this.angle = this.angle + this.speed;
        }
    }
}


function PoggendorffComponent(x, y, width, height, offset_reference, offset) {


    function intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        return {
            x: ( (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4) ) / ( (x1 - x2) * (y3 - y4 ) - (y1 - y2) * (x3 - x4) ),
            y: ( (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4) ) / ( (x1 - x2) * (y3 - y4 ) - (y1 - y2) * (x3 - x4) )
        }

    }

    return {
        offset: offset,
        offset_reference: offset_reference,
        speed: 0,
        update: function (context) {

            var x11 = x - width / 2;
            var x12 = x - width / 2;

            var y11 = y - height / 2;
            var y12 = y + height / 2;

            var x21 = x + width / 2;
            var x22 = x + width / 2;

            var y21 = y - height / 2;
            var y22 = y + height / 2;


            new LineComponent(x11, y11, x12, y12).update(context);
            new LineComponent(x21, y21, x22, y22).update(context);

            //Reference
            x11a = x - width;
            x21a = x12;

            y11a = y + height / 2 - this.offset_reference;
            y21a = y + height / 4 - this.offset_reference;


            new LineComponent(x11a, y11a, x21a, y21a).update(context);


            p1 = intersection(x11a, y11a, x21a, y21a, x21, y21, x22, y22);


            // Test
            x12 = p1.x;
            x22 = p1.x + width / 2;

            y12 = p1.y - this.offset;
            y22 = p1.y - height / 4 - this.offset;

            new LineComponent(x12, y12, x22, y22).update(context);
        },
        newPos: function (context) {
            this.offset = this.offset + this.speed;
        }
    }
}

//UTILS

function EnhancedCanvas(canvas) {

    canvas.maximize = function () {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        return this;
    }

    canvas.minimize = function () {
        this.width = 0;
        this.height = 0;
        return this;
    }


    canvas.hide = function () {
        this.style.display = 'none';
        return this;
    }

    canvas.show = function () {
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
function merge_options(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
}

var vis_utils = {
    random_change: function (val, rr) {
        return val + (rr * Math.random() - rr / 2);
    }
}


//GAMES
KEY_UP = 38;
KEY_DOWN = 40;
KEY_LEFT = 37;
KEY_RIGHT = 39;


//PROTOTYPE
function AbstractGame(opt) {
    var that = this;
    this.o = merge_options({
        canvasID: 'canvas', //HTML ID
        ppi: 96, //PPI
        speed: 60, //Update speed
        handlers: {}
    }, opt);
    this.keys = {};
    this.arena = {
        canvas: new EnhancedCanvas(document.getElementById(that.o.canvasID)).maximize(),
        start: function () {
            this.context = this.canvas.getContext("2d");
            window.addEventListener('keydown', function (e) {
                that.keys = (that.keys || []);
                that.keys[e.keyCode] = true;
            });
            window.addEventListener('keyup', function (e) {
                that.keys[e.keyCode] = false;
            });
        },
        clear: function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    };
}
AbstractGame.prototype.start = function () {
    var self = this;
    this.arena.start();
    this.arena.canvas.show();
    this.time_start = Date.now();
    this.interval = setInterval(function () {
        self.update();
    }, this.o.speed);
};
AbstractGame.prototype.stop = function () {
    clearInterval(this.interval);
    this.clear();
};
AbstractGame.prototype.clear = function () {
    this.arena.clear();
};
AbstractGame.prototype.cleanup = function () {
    this.stop();
    this.arena.clear();
    this.arena.canvas.hide();
};
AbstractGame.prototype.update = function () {
    this.arena.clear();
    if (this.keys[KEY_RIGHT] && typeof this.o.handlers.right !== 'undefined') this.o.handlers.right();
    if (this.keys[KEY_LEFT] && typeof this.o.handlers.left !== 'undefined') this.o.handlers.left();
    if (this.keys[KEY_UP] && typeof this.o.handlers.up !== 'undefined') this.o.handlers.up();
    if (this.keys[KEY_DOWN] && typeof this.o.handlers.down !== 'undefined') this.o.handlers.down();
};
AbstractGame.prototype.state = function () {
    return {
        time_msec: Date.now() - this.time_start
    }
};

///Poggendorff
function PoggendorffGame(opt) {

    var self = this;

    var opts = merge_options({
        spacing: 200, //Spacing between components,
        height: 600, //Spacing between components,
        rr: 90, //Random modifier
        test: 'lower'
    }, opt);

    opts.handlers = {
        up: function () {
            self.elem_test.speed = 1;
        },
        down: function () {
            self.elem_test.speed = -1;
        }
    };

    AbstractGame.call(this, opts);

    this.start = function () {
        const w = this.arena.canvas.width;
        const h = this.arena.canvas.height;

        var rc = -this.o.rr * Math.random()
        if (this.o.test == 'upper') {
            rc = -rc;
        }
        this.elem_test = new PoggendorffComponent(w / 2, h / 2, this.o.spacing, this.o.height, 0, rc);
        AbstractGame.prototype.start.apply(this);
    };
    this.update = function () {
        this.elem_test.speed = 0;
        AbstractGame.prototype.update.apply(this);
        this.elem_test.newPos();
        this.elem_test.update(this.arena.context);
    };
    this.state = function () {
        var data = {
            test: this.elem_test.offset / this.o.ppi,
            reference: this.elem_test.offset_reference / this.o.ppi
        };
        data['underestimation']= Math.max(0,data.reference-data.test);
        data['overestimation']= Math.max(0,data.test-data.reference);
        return merge_options(AbstractGame.prototype.state.apply(this),data);
    };
}
PoggendorffGame.prototype = Object.create(AbstractGame.prototype);

///Zollner
function ZollnerGame(opt) {
    var self = this;
    var opts = merge_options({
        spacing: 200, // Spacing between top and bottom component
        spacings: 20, // Spacing between top and bottom component
        len: 500, //Length of the  lines
        rotangle: -45, //Default rotation angle
        rr: 10, //Random modifier,
        rr_reference: 0, //Random modifier,
        stripe_angle:45,
        stripe_len:50
    }, opt);
    opts.handlers = {
        up: function () {
            self.elem_test.speed = 1;
        },
        down: function () {
            self.elem_test.speed = -1;
        }
    };
    AbstractGame.call(this, opts);

    this.start = function () {
        const w = this.arena.canvas.width;
        const h = this.arena.canvas.height;
        var rot_angle = vis_utils.random_change(this.o.rotangle, this.o.rr);
        var reference_angle = vis_utils.random_change(0, this.o.rr_reference);
        var angle = vis_utils.random_change(0, this.o.rr);
        this.elem_test = new ZollnerComponent(w / 2, h / 2, this.o.len, this.o.spacing * 3, this.o.spacings, rot_angle, reference_angle, angle,this.o.stripe_angle,this.o.stripe_len);
        AbstractGame.prototype.start.apply(this);
    };

    this.update = function () {
        this.elem_test.speed = 0;
        AbstractGame.prototype.update.apply(this);
        this.elem_test.newPos();
        this.elem_test.update(this.arena.context);
    };
    this.state = function () {
        var data = {
            test: this.elem_test.angle,
            reference: this.elem_test.angle_reference
        };
        data['underestimation']= Math.max(0,data.reference-data.test);
        data['overestimation']= Math.max(0,data.test-data.reference);
        return merge_options(AbstractGame.prototype.state.apply(this),data);
    };
}
ZollnerGame.prototype = Object.create(AbstractGame.prototype);

///Ebinghouse
function EbinghouseGame(opt) {

    var self = this;

    var opts = merge_options({
        spacing: 100, //Spacing between components
        radius: 100, //Radius of components
        lri: 10, //Radius of left inner circle
        lro: 20, //Radius of left outer circle
        rri: 20, //Radius of right inner circle
        rro: 10, //Radius of right outer circle
        rr: 5,	//Random modifier
        nc: 8, 	//Number of outer circles
        test: 'left'
    }, opt);

    opts.handlers = {
        up: function () {
            self.elem_test.central.radius_speed = 1;
        },
        down: function () {
            self.elem_test.central.radius_speed = -1;
        }
    };

    AbstractGame.call(this, opts);

    this.start = function () {
        var c_x = this.arena.canvas.width / 2;
        var c_y = this.arena.canvas.height / 2;

        var elem_left = new EbinghouseComponent(c_x - this.o.spacing / 2, c_y, this.o.radius, vis_utils.random_change(this.o.lri, this.o.rr), this.o.nc, this.o.lro, "red");
        var elem_right = new EbinghouseComponent(c_x + this.o.spacing / 2, c_y, this.o.radius, vis_utils.random_change(this.o.rri, this.o.rr), this.o.nc, this.o.rro, "red");

        if (this.o.test == 'left') {
            this.elem_test = elem_left;
            this.elem_ref = elem_right;
        } else {
            this.elem_test = elem_right;
            this.elem_ref = elem_left;
        }

        AbstractGame.prototype.start.apply(this);
    };
    this.update = function () {
        this.elem_test.central.radius_speed = 0;
        AbstractGame.prototype.update.apply(this);

        this.elem_test.newPos();
        this.elem_ref.newPos();

        this.elem_test.update(this.arena.context);
        this.elem_ref.update(this.arena.context);
    };
    this.state = function () {
        var data = {
            test: this.elem_test.central.radius / this.o.ppi,
            reference: this.elem_ref.central.radius / this.o.ppi
        };
        data['underestimation']= Math.max(0,data.reference-data.test);
        data['overestimation']= Math.max(0,data.test-data.reference);
        return merge_options(AbstractGame.prototype.state.apply(this),data);
    };
}
EbinghouseGame.prototype = Object.create(AbstractGame.prototype);


///Ponzo
function PonzoGame(opt) {

    var self = this;

    var opts = merge_options({
        spacing: 300, // Spacing between top and bottom component
        inner_spacing: 200,
        side_line_length: 300, // Side lines length
        tl: 200, //Length of the top line
        bl: 200, //Length of the bottom line
        rr: 50, //Random modifier
        angle: 60, //Angle of side lines,
        test: 'lower'
    }, opt);

    opts.handlers = {
        up: function () {
            self.elem_test.speed = 1;
        },
        down: function () {
            self.elem_test.speed = -1;
        }
    };

    AbstractGame.call(this, opts);
    this.start = function () {
        var w = this.arena.canvas.width;
        var h = this.arena.canvas.height;
        var tl = this.o.tl;//vis_utils.random_change(o.tl,o.rr);
        var bl = vis_utils.random_change(this.o.bl, this.o.rr);
        var elem_upper = new CenteredLineComponent(w / 2, h / 2 - this.o.inner_spacing / 2, this.o.tl);
        var elem_lower = new CenteredLineComponent(w / 2, h / 2 + this.o.inner_spacing / 2, this.o.bl);
        this.elem_main = new PonzoComponent(w / 2, h / 2, this.o.angle, this.o.spacing, this.o.side_line_length);

        if (this.o.test == 'upper') {
            this.elem_test = elem_upper;
            this.elem_ref = elem_lower;
        } else {
            this.elem_test = elem_lower;
            this.elem_ref = elem_upper;
        }

        AbstractGame.prototype.start.apply(this);
    };
    this.update = function () {
        this.elem_test.speed = 0;
        AbstractGame.prototype.update.apply(this);
        this.elem_test.newPos();
        this.elem_test.update(this.arena.context);
        this.elem_ref.update(this.arena.context);
        this.elem_main.update(this.arena.context);
    };
    this.state = function () {
        var data = {
            test: this.elem_test.length / this.o.ppi,
            reference: this.elem_ref.length / this.o.ppi
        };
        data['underestimation']= Math.max(0,data.reference-data.test);
        data['overestimation']= Math.max(0,data.test-data.reference);
        return merge_options(AbstractGame.prototype.state.apply(this),data );
    };
}
PonzoGame.prototype = Object.create(AbstractGame.prototype);


///MullerLyer
function MullerLyerGame(opt) {

    var self = this;

    var opts = merge_options({
        spacing: 100, // Spacing between top and bottom component
        tl: 300, //Top component Length
        bl: 300, //Bottom component Length
        theta: 90, //Arrow angle
        rr: 100,	//Random modifier
        test: 'lower'
    }, opt);

    opts = merge_options({
        tal: opts.tl / 4, //Top arrows length
        bal: opts.bl / 4 //Bottom arrows length
    }, opts);

    opts.handlers = {
        up: function () {
            self.elem_test.speed = 1;
        },
        down: function () {
            self.elem_test.speed = -1;
        }
    };

    AbstractGame.call(this, opts);

    this.start = function () {
        var w = this.arena.canvas.width;
        var h = this.arena.canvas.height;
        if (this.o.test == 'upper') {
            this.elem_ref = new MultiArrowComponent(w / 2, h / 2 + this.o.spacing / 2, this.o.bl, this.o.bal, this.o.theta);
            this.elem_test = new InwardMultiArrowComponent(w / 2, h / 2 - this.o.spacing / 2, vis_utils.random_change(this.o.tl, this.o.rr), this.o.tal, this.o.theta);
        } else {

            this.elem_ref = new InwardMultiArrowComponent(w / 2, h / 2 - this.o.spacing / 2, this.o.tl, this.o.tal, this.o.theta);
            this.elem_test = new MultiArrowComponent(w / 2, h / 2 + this.o.spacing / 2, vis_utils.random_change(this.o.bl, this.o.rr), this.o.bal, this.o.theta);
        }
        AbstractGame.prototype.start.apply(this);
    };
    this.update = function () {
        this.elem_test.speed = 0;
        AbstractGame.prototype.update.apply(this);
        this.elem_test.newPos();
        this.elem_test.update(this.arena.context);
        this.elem_ref.newPos();
        this.elem_ref.update(this.arena.context);
    };
    this.state = function () {
        var data = {
            test: this.elem_test.length / this.o.ppi,
            reference: this.elem_ref.length / this.o.ppi
        };
        data['underestimation']= Math.max(0,data.reference-data.test);
        data['overestimation']= Math.max(0,data.test-data.reference);
        return merge_options(AbstractGame.prototype.state.apply(this),data);
    };
}
MullerLyerGame.prototype = Object.create(AbstractGame.prototype);



