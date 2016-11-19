// Gameplay

var playState = {
  create: function() {
    this.otherPlayerSprites = {}; // other players, empty until synced with server

    // Get the map data and get ready to display it
    this.map = game.add.tilemap('init');
    // reminder: first param = name in Tiled, second = name in Phaser
    this.map.addTilesetImage('tiles', 'gameTiles');

    // create the layers
    this.backgroundLayer = this.map.createLayer('backgroundLayer');
    this.blockingLayer = this.map.createLayer('blockingLayer');
    this.map.setCollisionBetween(1, 100, true, 'blockingLayer');
    // Resize to match layer dimensions
    this.backgroundLayer.resizeWorld();

    // Create items
    this.items = game.add.group();
    this.items.enableBody = true;
    var item;
    var result = this.findObjectsByTiledType('item', this.map, 'objectsLayer');
    result.forEach(function(element) {
      this.createFromTiledObject(element, this.items);
    }, this);


    // Spawn the player at a random spot
    this.randomPlayerSpawn();
    game.physics.enable(this.player, Phaser.Physics.ARCADE);

    // enable keyboard
    this.keyboard = game.input.keyboard;

    // make sure our state is synced with the server's state.
    game.connection.on('playerState', function(playerState) {
      game.serverCanonicalState = playerState;
    });

    game.connection.on('playerLeft', function(data) {
      delete game.serverCanonicalState[data.playerLeft];
    });
  },

  update: function() {
    this.syncWithCanonicalState();

    // Movement
    var animationIsPlaying = false;
    this.player.body.velocity.x = this.player.body.velocity.y = 0;
    // Left
    if (this.keyboard.isDown(Phaser.Keyboard.A)) {
      this.player.body.velocity.x -= 175;
      if (!animationIsPlaying) {
        this.player.animations.play('left');
        animationIsPlaying = true;
      }
    }
    // Right
    if (this.keyboard.isDown(Phaser.Keyboard.D)) {
      this.player.body.velocity.x += 175;
      if (!animationIsPlaying) {
        this.player.animations.play('right');
        animationIsPlaying = true;
      }
    }
    // Up
    if (this.keyboard.isDown(Phaser.Keyboard.W)) {
      this.player.body.velocity.y -= 175;
      if (!animationIsPlaying) {
        this.player.animations.play('up');
        animationIsPlaying = true;
      }
    }
    // Down
    if (this.keyboard.isDown(Phaser.Keyboard.S)) {
      this.player.body.velocity.y += 175;
      if (!animationIsPlaying) {
        this.player.animations.play('down');
        animationIsPlaying = true;
      }
    } 
    // if no velocity, stop animations.
    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      this.player.animations.stop();
    }

    // Handle collision
    game.physics.arcade.collide(this.player, this.blockingLayer);
    game.physics.arcade.collide(this.player, Object.values(this.otherPlayerSprites));

    // broadcast our movement to the game server
    game.connection.emit('myPosAndVelo', {
      position: this.player.body.position,
      velocity: this.player.body.velocity
    });
  }, 

  syncWithCanonicalState: function() {
    // update all the sprites to match the state of the canonical state
    for (playerSocketId in game.serverCanonicalState) {
      if (playerSocketId === game.socketId) { // that's us!
        // this is going to be slightly delayed because we are updating every frame,
        // and the server needs to do a roundtrip.
        // so, need to have some logic to only update player's position to the
        // canonical value when the player does something illegal.
        // otherwise just use the local value because it makes the game snappier.
        // todo: just doing nothing atm.
      }
      else { // update the other player's position
        var playerData = game.serverCanonicalState[playerSocketId];
        // if a new player has joined, add them
        if (!(playerSocketId in this.otherPlayerSprites)) {
          var newEnemySprite = this.spawnKnight(playerData.position.x, playerData.position.y, false);
          this.otherPlayerSprites[playerSocketId] = newEnemySprite;
          console.log('new');
        }
        // update the velocity and position to the canonical values
        var playerSprite = this.otherPlayerSprites[playerSocketId];
        playerSprite.position = playerData.position;
        playerSprite.velocity = playerData.velocity;
      }
    }
    // Now clear out all the players who left
    for (playerSocketId in this.otherPlayerSprites) {
      if (!(playerSocketId in game.serverCanonicalState)) {
        this.otherPlayerSprites[playerSocketId].destroy();
        delete this.otherPlayerSprites[playerSocketId];
      }
    }
  },

  // Todo: can't reach this atm.
  winGame: function() {
    game.state.start('end');
  },

  // Helper function to spawn a player. Get a random player spawn, with min distance from the goal.
  randomPlayerSpawn: function() {
    var playerX = Math.floor(Math.random() * ( 16 + (game.width - 32 /* walls are 16px */ )));
    var playerY = Math.floor(Math.random() * ( 16 + (game.height -32)));

    this.player = this.spawnKnight(playerX, playerY, true);
  },

  // Helper function to spawn an animated knight, either player or enemy
  spawnKnight: function(x, y, isHero) {
    var sprite = game.add.sprite(x, y, 'knight', 0);
    // Add animations
    sprite.animations.add('down', [0, 1, 2], 10);
    sprite.animations.add('up', [9, 10, 11], 10);
    sprite.animations.add('right', [3, 4, 5], 10);
    sprite.animations.add('left', [15, 16, 17], 10);
    // Change color if it's an evil knight
    if (!isHero) {
      sprite.tint = 0x9BC1FF;
    }
    return sprite;
  },

  // Helper function to find objects in a Tiled layer that contain a "type" property.
  findObjectsByTiledType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        // Phaser uses top left, Tiled bottom left so we have to adjust the y position
        // todo: might be able to fix this using different Tiled settings
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },
  // Helper function to create a sprite from a Tiled object and put it in the group specified.
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);
    //copy all properties to the sprite
    Object.keys(element.properties).forEach(function(key){
      sprite[key] = element.properties[key];
    });
  }
};
