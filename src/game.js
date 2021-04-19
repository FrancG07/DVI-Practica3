var game = function() {

var Q = window.Q = Quintus()
		.include(["Sprites", "Scenes", "Input", "2D", "UI", "Anim", "TMX", "Touch"])
        .setup("myGame", {
			width: 800,
			height: 600,
			scaleToFit: true
		})
        .controls().touch();


	Q.Sprite.extend("Mario", {
	    
	    init: function(p) {
	      this._super(p,{
	        sheet: "marioR",
	        x: 100,
	        y: 450,
	        frame: 0,
	        scale: 1
	      });
		  this.add("2d, platformerControls");
	    },
		step: function(){			
			if(this.p.y > 600){
				this.respawn();	
			}
		},
		die : function(){
			Q.stage().pause();
			Q.stageScene("endGame",1, {
				label: "You lose"
			});
		},
		respawn : function(){
			this.p.x = 100;
			this.p.y = 450;
		}
	  });

	/*Q.Sprite.extend("OneUp", {
	    init: function(p) {
	      this._super(p,{
	        asset: "1up.png",
	        scale: 1,
	     	x: 20,
	     	y: -10,
			sensor: true
	      });
	    }
	  });*/

	Q.Sprite.extend("Goomba", {
		init: function(p) {
			this._super(p, {
				sheet:"goomba",
				frame:0,
				scale: 1,
				vx:100,
				sensor: true
			});
			this.add('2d, aiBounce');
			
			this.on("bump.top",function(collision) {
				if(collision.obj.isA("Mario")) { 
				  this.destroy();
				  collision.obj.p.vy = -300;
				}
			});

			this.on("bump.left,bump.right,bump.bottom",function(collision) {
				if(collision.obj.isA("Mario")) { 
					collision.obj.die();
				}
			});
		}
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p) {
			this._super(p, {
				sheet:"bloopa",
				frame:0,
				scale: 1,
				sensor: true,
				gravity: 0.3
			});
			this.add('2d, aiBounce');
			
			this.on("bump.top",function(collision) {
				if(collision.obj.isA("Mario")) { 
				  this.destroy();
				  collision.obj.p.vy = -300;
				}
			});

			this.on("bump.left,bump.right,bump.bottom",function(collision) {				
				if(collision.obj.isA("Mario")) { 
					collision.obj.die();
				}else{
					this.p.vy = -200;
				}
			});

		},
		step: function(){
			
		}
	});

	Q.Sprite.extend("Peach", {
		init: function(p){
			this._super(p, {
				asset: "princess.png",
				scale: 1,
	     		x: 20,
	     		y: -10,
				sensor: true
			})
			this.on("hit", this, "collision");
		},
		collision: function(col){
			if(col.obj.isA("Mario")){
				Q.stage().pause();
				Q.stageScene("endGame",1, {
					label: "You win!"
				});
			}
		}
	});

	Q.load([ "mario_small.png","mario_small.json", 
		"1up.png", "bg.png", "Practica3.tmx", 
		"tiles32.png", "goomba.png", "bloopa.png",
		"princess.png", "coin.png", "goomba.json",
		"bloopa.json", "princess.png", "title-screen.png" ], function() {
	 
	  Q.compileSheets("mario_small.png","mario_small.json");
	  Q.compileSheets("goomba.png", "goomba.json");
	  Q.compileSheets("bloopa.png", "bloopa.json");

	   Q.scene("level1", function(stage) {
		 	/*
	   		stage.insert(
	   			new Q.Repeater({asset: "bg.png", speedX: 0.5, speedY: 0.5})
	   		);
	   		*/
	   		Q.stageTMX("Practica3.tmx", stage);

		 	mario = new Q.Mario();
		 	stage.insert(mario);
		 	 
		 	stage.add("viewport").follow(mario,{x:true, y:false});
		 	stage.viewport.scale = 1;
		 	stage.viewport.offsetX = -150;
		    stage.on("destroy",function() {
		        mario.destroy();
		    });
	   });

	   Q.scene('endGame',function(stage) {
			var container = stage.insert(new Q.UI.Container({
				x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
			}));
			var button = container.insert(new Q.UI.Button({
				x: 0, y: 0, fill: "#CCCCCC", label: "Play Again"
			}));
			var label = container.insert(new Q.UI.Text({
				x:10, y: -10 - button.p.h, label: stage.options.label
			}));
			// When the button is clicked, clear all the stages
			// and restart the game.
			button.on("click",function() {
				Q.clearStages();
				Q.stageScene('mainTitle');
			});

			// Expand the container to visibly fit it's contents
			// (with a padding of 20 pixels)
			container.fit(20);
		});

		Q.scene('mainTitle', function(stage){
			var container = stage.insert(new Q.UI.Container({
				x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
			}));
			var button = container.insert(new Q.UI.Button({
				x: 0, y: 0, fill: "#CCCCCC", asset: "title-screen.png"
			}));

			button.on("click", function(){
				Q.stageScene('level1');
			});

			container.fit(20);
		});

	   Q.stageScene("mainTitle");

	});
}