var game = function() {

var Q = window.Q = Quintus()
		.include(["Sprites", "Scenes", "Input", "2D", "UI", "Anim", "TMX"])
        .setup("myGame", {
			width: 800,
			height: 600,
			scaleToFit: true
		})
        .controls();


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
					collision.obj.respawn();
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
					collision.obj.respawn();
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
				// Mostrar victoria
				Q.stageScene("level1");
			}
		}
	});

	Q.load([ "mario_small.png","mario_small.json", 
		"1up.png", "bg.png", "Practica3.tmx", 
		"tiles32.png", "goomba.png", "bloopa.png",
		"princess.png", "coin.png", "goomba.json",
		"bloopa.json", "princess.png" ], function() {
	 
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

	   Q.stageScene("level1");

	});
}