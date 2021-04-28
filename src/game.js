var game = function() {

var Q = window.Q = Quintus()
		.include(["Sprites", "Scenes", "Input", "2D", "UI", "Anim", "TMX", "Touch", "Audio"])
        .setup("myGame", {
			width: 800,
			height: 600,
			scaleToFit: true
		})
        .controls().enableSound().touch();


	Q.Sprite.extend("Mario", {
	    
	    init: function(p) {
	      this._super(p,{
	        sheet: "mario",
			sprite: "mario_anim",
	        x: 100,
	        y: 450,
	        frame: 0,
	        scale: 1,
			died: false
	      });
		  this.add("2d, platformerControls, animation, tween");
	    },
		step: function(dt){
			
			if(this.p.y > 600){
				this.die();
			}
			
			if(this.p.died){
				this.p.vx = 0;
			}
			if(this.p.vx > 0){
				this.play("walk_right");
			} else if(this.p.vx < 0){
				this.play("walk_left");
			}
			
			//alert(this.p.landed);
			if(this.p.vy < 0){
				if(this.p.direction == 'left')
					this.play("jump_left");
				else if(this.p.direction == 'right')
					this.play("jump_right");
			}
			
		},
		die: function(){
			this.p.died = true;
			Q.audio.stop();
			Q.audio.play("music_die.mp3");
			this.play("morir");
			this.animate({y: this.p.y-30}, 1/2, Q.Easing.Linear, 
				{callback: function(){
			this.animate({y: this.p.y+60}, 1/2, Q.Easing.Linear,
						{callback: function(){
			Q.stage().pause();
			Q.stageScene("endGame",1, {
				label: "You lose"
			})}})}});
		},
		respawn : function(){
			this.p.x = 100;
			this.p.y = 450;
		}
	  });

	Q.Sprite.extend("OneUp", {
	    init: function(p) {
	      this._super(p,{
	        asset: "1up.png",
	        scale: 1,
	     	x: 20,
	     	y: -10,
			sensor: true,
			taken: false
	      });
		  this.on("sensor", this, "hit");
		  this.add("tween");
	    },
		hit: function(collision){
			if(this.taken) return;
			if(!collision.isA("Mario")) return;
			
			this.taken = true;
			Q.state.inc("lives",1);
			console.log(Q.state.get("lives"));
			//collision.p.vy = -400;
			
			Q.audio.play("1up.mp3");
			//this.animate({y: this.p.y-100, angle: 360}, 1, Q.Easing.Quadratic.InOut,
			//			{callback: function(){this.destroy()}});
			this.destroy();
		}
	  });
	  
	  Q.Sprite.extend("Coin", {
	    init: function(p) {
	      this._super(p,{
	        sheet: "coin",
			sprite: "coin_anim",
	        scale: 1,
	     	x: 20,
	     	y: -10,
			sensor: true,
			taken: false
	      });
		  this.on("sensor", this, "hit");
		  this.add("tween, animation");
	    },
		
		step: function(dt){
			this.play("shine");
		},
		
		hit: function(collision){
			if(this.taken) return;
			if(!collision.isA("Mario")) return;
		
			this.taken = true;
			Q.state.inc("coins",1);
			console.log(Q.state.get("coins"));
			//collision.p.vy = -400;
			
			Q.audio.play("coin.mp3");
			this.animate({y: this.p.y-100}, 1/2, Q.Easing.Linear,
						{callback: function(){this.destroy()}});
		}
	  });

	Q.Component.extend("defaultEnemy", {
		kill: function(collision){
			if(this.killed) return;
			if(!collision.obj.isA("Mario")) return;
			
			Q.state.dec("lives",1);
			console.log(Q.state.get("lives"));
			if(Q.state.get("lives") < 0)
				collision.obj.die();
			else{
				collision.obj.p.vy = -200;
				collision.obj.p.vx = collision.normalX*-500;
				collision.obj.p.x = 100;
				collision.obj.p.direction = "right";
			}
		}
	});
	
	Q.Sprite.extend("Goomba", {
		init: function(p) {
			this._super(p, {
				sheet:"goomba",
				sprite: "goomba_anim",
				frame:0,
				scale: 1,
				vx:100,
				//sensor: true,
				killed: false
			});
			//this.on("sensor", this, "onTop");
			this.add('2d, aiBounce, tween, animation, defaultEnemy');
			this.on("bump.top", this, "onTop");
			this.on("bump.bottom, bump.left, bump.right", this, "kill");
			/*this.on("bump.top",function(collision) {
				if(collision.obj.isA("Mario")) { 
				  this.destroy();
				  collision.obj.p.vy = -300;
				}
			});

			this.on("bump.left,bump.right,bump.bottom",function(collision) {
				if(collision.obj.isA("Mario")) { 
					collision.obj.die();
				}
			});*/
		},
		onTop: function(collision){
			if(this.killed) return;
			if(!collision.obj.isA("Mario")) return;
			if(collision.obj.p.died) return;
			
			this.killed = true;
			collision.obj.p.vy = -200;
			Q.audio.play("kill_enemy.mp3");
			console.log("Goomba dies");
			
			this.animate({y: this.p.y+100, x: this.p.x}, 1, Q.Easing.Linear,
						{callback: function(){this.destroy()}});
			//this.destroy();
		},
		kill: function(collision){
			if(this.killed) return;
			if(!collision.obj.isA("Mario")) return;
			if(collision.obj.p.died) return;
			
			Q.state.dec("lives",1);
			console.log(Q.state.get("lives"));
			if(Q.state.get("lives") < 0)
				collision.obj.die();
			else{
				collision.obj.p.vy = -200;
				collision.obj.p.vx = collision.normalX*-500;
				collision.obj.p.x = 100;
				collision.obj.p.direction = "right";
			}
		},
		step: function(dt){	
			if(!this.killed)
				this.play("walk");
			else
				this.play("die");
		}
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p) {
			this._super(p, {
				sheet:"bloopa",
				sprite: "bloopa_anim",
				frame:0,
				scale: 1,
				//sensor: true,
				gravity: 0.3,
				killed: false
			});
			this.add('2d, aiBounce, tween, animation');
			
			this.on("bump.top",function(collision) {
				if(collision.obj.isA("Mario")) { 
					Q.audio.play("kill_enemy.mp3");
					this.destroy();
					collision.obj.p.vy = -300;
				}
			});

			this.on("bump.left,bump.right,bump.bottom",function(collision) {				
				if(collision.obj.isA("Mario")) { 
					collision.obj.p.vy = -200;
					collision.obj.p.vx = collision.normalX*-500;
					collision.obj.p.x = 100;
					collision.obj.p.direction = "right";
					Q.state.dec("lives",1);
					console.log(Q.state.get("lives"));
					if(Q.state.get("lives") < 0)
					collision.obj.die();
				}else{
					this.p.vy = -200;
				}
			});

		},
		step: function(dt){
			if(!this.killed)
				if(this.p.y < 510)
					this.play("up");
				else if (this.p.y > 510)
					this.play("down");
			else
				this.play("die");
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
				Q.audio.play("music_level_complete.mp3");
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
		"bloopa.json", "coin.json", "title-screen.png",
		"music_main.mp3", "kill_enemy.mp3", "1up.mp3",
		"coin.mp3", "jump_small.mp3", "music_level_complete.mp3",
		"music_die.mp3"], function() {
	 
	  Q.compileSheets("mario_small.png","mario_small.json");
	  Q.compileSheets("goomba.png", "goomba.json");
	  Q.compileSheets("bloopa.png", "bloopa.json");
	  Q.compileSheets("coin.png", "coin.json");

		Q.animations("mario_anim",{
			walk_right: {frames: [1,2,3],rate: 1/6, next: "parado_r" },
			walk_left: {frames: [15,16,17],rate: 1/6, next: "parado_l" },
			jump_right: {frames: [4],rate: 1/6, next: "parado_r" },
			jump_left: {frames: [18],rate: 1/6, next: "parado_l" },
			parado_r: {frames: [0] },
			parado_l: {frames: [14] },
			morir:{frames: [12], loop:false,rate:1}
		});
		Q.animations("goomba_anim",{
			walk: {frames: [0,1],rate: 1},
			die: {frames: [2],rate: 1}
		});
		Q.animations("bloopa_anim",{
			up: {frames: [0],rate: 1},
			down: {frames: [1],rate: 1},
			die: {frames: [2],rate: 1}
		});
		Q.animations("coin_anim",{
			shine: {frames: [0,1,2],rate: 1/3}
		});
		
		
	   Q.scene("level1", function(stage) {
		 	/*
	   		stage.insert(
	   			new Q.Repeater({asset: "bg.png", speedX: 0.5, speedY: 0.5})
	   		);
	   		*/
	   		Q.stageTMX("Practica3.tmx", stage);

		 	mario = new Q.Mario();
		 	stage.insert(mario);
		 	Q.state.set({lives: 0, coins: 0});
			
			var container = stage.insert(new Q.UI.Container({
				x: Q.width/2, y:0, fill: "rgba(0,0,0,0.5)"
			}));
			var labelL = container.insert(new Q.UI.Text({
				x:0, y: 0, label: ("Lives: " + Q.state.get("lives"))
			}));
			var labelC = container.insert(new Q.UI.Text({
				x:labelL.p.w+30, y: 0, label: ("Coins: " + Q.state.get("lives"))
			}));
			
			
			Q.audio.play("music_main.mp3",{loop: true});
			//Q.audio.stop();
			
		 	stage.add("viewport").follow(mario,{x:true, y:false});
		 	stage.viewport.scale = 1;
		 	stage.viewport.offsetX = -150;
		    stage.on("destroy",function() {
		        mario.destroy();
		    });
			//container.fit(200);
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
			
			//Q.audio.stop();
			//Q.audio.play("music_die.mp3");
			/*Q.input.on("confirm",this, function(){
				Q.stageScene('level1');
			});*/

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