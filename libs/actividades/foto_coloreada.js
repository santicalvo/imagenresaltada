 window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();
/*global document: false, $:false, Kinetic:false, Image:false */
( function() {"use strict";
		var sources = {
			bn : 'img/parla_b_n.png',
			color : 'img/parla_col.png'
		}, hit_areas = [], debugable = false, debugdiv;

		function loadImages(sources, callback) {
			var images = {}, loadedImages = 0, numImages = 0, checkLoad = function() {
				loadedImages += 1;
				if (loadedImages >= numImages) {
					callback(images);
				}
			}, src;
			// get num of sources
			for (src in sources) {
				numImages += 1;
			}
			for (src in sources) {
				images[src] = new Image();
				images[src].onload = checkLoad;
				images[src].src = sources[src];
			}
		}

		function debug(txt) {
		    if(debugable){
		        debugdiv.html("<p>" + txt + "</p>");
		    }
		}

		function addCircle(radio, pos, strokeW) {
			var p = pos || {
				x : 100,
				y : 100
			}, circle = new Kinetic.Circle({
				x : p.x,
				y : p.y,
				radius : radio || 100
			});
			if (strokeW > 0) {
				circle.setAttrs({
					stroke : 'black',
					strokeWidth : strokeW,
					opacity: 0.8
				})
			}
			return circle;
		}
		
		function getMousePosition(ev){
		    
		}

		function getStageMousePosition(stage) {
			var mouse = stage.getMousePosition(), touch = stage.getTouchPosition();
			if (touch) {
				if (touch.x >= 0 && touch.y >= 0) {
					return touch;
				}
			}
			if (mouse) {
				if (mouse.x >= 0 && mouse.y >= 0) {
					return mouse;
				}
			}
			return {
				x : 0,
				y : 0
			};
		}

		function createImage(imgData, dimension, position) {
			var pos = position || {
				x : 0,
				y : 0
			}, size = dimension || {
				w : 1024,
				h : 483
			};
			return new Kinetic.Image({
				x : pos.x,
				y : pos.y,
				image : imgData,
				width : size.w,
				heigth : size.h
			});
		}

		var Areas = {
			init : function() {

			}
		}

		function HitArea(layer, name, fillImage) {
			var nom = name;
			this.layer = layer;
			this.circle = null;
			this.fill = fillImage;
			this.getName = function() {
				return nom;
			}
		}

		
		HitArea.HITTED = "hitted";
		HitArea.prototype = {
			drawHitArea : function(radio, position) {
				this.circle = addCircle(radio, position, 0);
				this.hit_area = addCircle(radio / 3, position, 1)
				this.layer.add(this.circle);
				this.layer.add(this.hit_area);

				//this.hit_area.setVisible(false);
				this.onHit();
				this.layer.draw();
				this.hide();
				var that = this;
				
			},
			enable : function(){
				var that = this
				this.hit_area.on("mousedown touchstart", function() {
					//that.fire(HitArea.HITTED)
					//that.show();
				})
				this.hit_area.on("mousemove touchmove", function(event) {
				    var curr_event = event;
				    curr_event.current_target = that;
					that.fire(HitArea.HITTED, curr_event)
					that.disable();
				})
			},
			disable : function(){
				this.hit_area.off("mousedown touchstart");
				this.hit_area.off("mousemove touchmove");
			},
			onHit : function() {
				this.circle.setFillPatternImage(this.fill);
				this.circle.setFillPatternOffset(this.circle.getX(), this.circle.getY());
				//this.circle.draw();
			},
			hide : function() {
				this.circle.hide();
				this.layer.draw();
			},
			show : function() {
				this.circle.show();
				this.circle.draw();
			},
			// Envolvemos los eventos personalizados de Kinetic

			fire : function(eventType, evt, bubble) {
				this.circle.fire(eventType, evt, bubble);
			},
			on : function(typesStr, handler) {
				this.circle.on(typesStr, handler);
			},
			off : function(typesStr) {
				this.circle.off(typesStr)
			}
		}

		/**
		 * Aquí marcamos todas las áreas activas. Esto se puede reescribir o leer por json o similar
		 */

		function getHitBoundaries() {
			return [{ name : "zona_residencial",	radio : 130, centro : { x : 151, y : 350 }}, 
					{ name : "afores", radio : 130, centro : { x : 303, y : 132 } }, 
					{ name : "barri",radio : 130, centro : { x : 499,	y : 350	} }, 
					{ name : "centre", radio : 130,	centro : { x : 726, y : 276 } }];

		}

		function startHitAreas(layer, fillImage) {
			var boundaries = getHitBoundaries(), i = 0, hitted;
			for (; i < boundaries.length; i++) {
				hitted = boundaries[i];
				hit_areas[i] = new HitArea(layer, hitted.name, fillImage);
				hit_areas[i].drawHitArea(hitted.radio, hitted.centro);
			}
		}
		function enableHitAreas(event, handler){
			var i = 0;
			for (; i<hit_areas.length; i++ ){
				hit_areas[i].enable();
				if( event ){
					hit_areas[i].on(event, handler);
				}
			}
		}
		function disableHitAreas(event){
			var i = 0;
			for (; i<hit_areas.length; i++ ){
				hit_areas[i].disable();
				if(event){
					hit_areas[i].off(event);
				}
			}
		}
		function test(){
			var toggle = false;
			
			var t = (new Date()).getTime(), des = 0;
			
			var fx = function(){
				var des = (new Date()).getTime() -t;
     			debug("frames: "+des);
			}
			
			var anim = new Anim(null, fx);
			
			$(document).on("click", function(){
				toggle = !toggle;
				if(toggle){
					anim.start();
				}else {
					anim.stop();
				}
			});
		}
		
		function Anim(funcion){
			var run = false;
			var callback = funcion;
			
			function animate(){
				callback();
     			if (!run){
     				return;
     			}
     			requestAnimFrame(function(){
     				animate();
     			})
			};
			this.start = function(){
				run = true;
				animate();
			};
			this.stop = function(){
				run = false;
			};
		}
		
		function startAudio(name){
			var audio = document.getElementById(name);
			audio.play();
		}
		function showTag(name, pos){
			var tooltip = $("#tooltip") ;
			name = name.toString();
			name = name.replace("_", " ");
			name = name.charAt(0).toUpperCase() + name.slice(1);
			tooltip.html(name);
			tooltip.css("top", pos.y);
			tooltip.css("left", pos.x+20);
			tooltip.css("visibility", "visible");
		}
		function hideTag(){
		    var tooltip = $("#tooltip") ;
		   tooltip.css("visibility", "hidden");
		}
		
		//draw on frames
		function drawAnim(images){
			var stage = new Kinetic.Stage({
				container : 'container',
				width : 1024,
				height : 483
			}), bn_layer = new Kinetic.Layer(), 
			hitareas_layer = new Kinetic.Layer(), 
			circle_layer = new Kinetic.Layer(), 
			bn = createImage(images.bn), 
			tmp_circle = null, hitted = null,
			movable = false, 
			
			c = 0,
			i = 0,
			colorArea = function() {
				if (movable) {
					
					var pos = getStageMousePosition(stage);
					debug("posicion: "+pos.x+" "+pos.y+" " +c+ " " +tmp_circle.getX()+ " "+tmp_circle.getY());
					if(pos.x !== tmp_circle.getX() || pos.y !== tmp_circle.getY()){
						c++;
						circle_layer.draw();
						tmp_circle.remove();
	
						tmp_circle.setPosition(pos.x, pos.y);
						tmp_circle.setFillPatternImage(images.color);
						tmp_circle.setFillPatternOffset(pos.x, pos.y);
						circle_layer.add(tmp_circle);
					}
					
					
				}
			},
			anim = new Anim(colorArea),
			onHittedArea = function( ev ){
				var self = ev.current_target;
				    name = self.getName();
			 	movable = false;
			 	anim.stop();
			 	self.show();
			 	disableHitAreas(HitArea.HITTED);
			 	circle_layer.draw();
				tmp_circle.remove();
				circle_layer.hide();
			 	hitted = self;
			 	startAudio(name);
			 	showTag(name, {x: ev.pageX, y: ev.pageY} );
			 	
			},
			onPress = function() {
				if(hitted){
					hitted.hide();
					hitted = null;
					hideTag();
				}
				
				enableHitAreas(HitArea.HITTED, onHittedArea);
				circle_layer.show();
				movable = true;
				colorArea();
				circle_layer.draw();
				anim.start();
			}, onRelease = function() {
				disableHitAreas(HitArea.HITTED);
				anim.stop();
				circle_layer.draw();
				tmp_circle.remove();
				circle_layer.hide();
				movable = false;
				c=0;
			};
			startHitAreas(hitareas_layer, images.color)
			bn_layer.add(bn);
			tmp_circle = addCircle(100, {
				x : 50,
				y : 50
			});

			stage.on("mousedown touchstart", onPress);
			stage.on("mouseup touchend", onRelease);

			stage.add(bn_layer);

			stage.add(circle_layer);
			stage.add(hitareas_layer);
			circle_layer.hide();
		}


		$(document).ready(function() {
			debugdiv = $("#debug");
			loadImages(sources, function(images) {
				//draw(images);
				drawAnim(images);
				//test()
			});
		});
	}());
