// Gameplay

var playState = {
  create: function() {
    // todo: refactor this stuff, don't need a win location
    this.winLocation = { x: 200, y: 200 }; 
    this.minInitialDistance = 100; // todo: ''
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
    this.player = this.randomPlayerSpawn();
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.win = game.add.sprite(this.winLocation.x, this.winLocation.y, 'win');

    // enable physics and keyboard
    game.physics.enable(this.win, Phaser.Physics.ARCADE);
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

    // when player touches win sprite, he wins!
    game.physics.arcade.overlap(this.player, this.win, this.winGame, null, this);

    // Movement
    if (this.keyboard.isDown(Phaser.Keyboard.A)) {
      this.player.body.velocity.x = -175;
    }
    else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
      this.player.body.velocity.x = 175;
    }
    else {
      this.player.body.velocity.x = 0;
    }
    if (this.keyboard.isDown(Phaser.Keyboard.W)) {
      this.player.body.velocity.y = -175;
    }
    else if (this.keyboard.isDown(Phaser.Keyboard.S)) {
      this.player.body.velocity.y = 175;
    } 
    else {
      this.player.body.velocity.y = 0;
    } 
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
        // t)is is going to be slightly delayed because we are updating every frame,
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
          var newEnemySprite = game.add.sprite(playerData.position.x, playerData.position.y, 'player');
          this.otherPlayerSprites[playerSocketId] = newEnemySprite;
          console.log("new");
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

  winGame: function() {
    game.state.start('end');
  },

  // Helper function to spawn a player. Get a random player spawn, with min distance from the goal.
  randomPlayerSpawn: function() {
    var playerX = Math.floor(Math.random() * (game.width - 16 /* sprite width */));
    if (Math.abs(this.winLocation.x - playerX) < this.minInitialDistance) {
      if (playerX < this.winLocation.x) { // pin to the left
        playerX = this.winLocation.x - this.minInitialDistance;
      }
      else {
        playerX = this.winLocation.x + this.minInitialDistance;
      }
    }

    var playerY = Math.floor(Math.random() * (game.height - 16 /* sprite width */));
    if (Math.abs(this.winLocation.y - playerY) < this.minInitialDistance) {
      if (playerY < this.winLocation.y) { // pin to the left
        playerY = this.winLocation.y - this.minInitialDistance;
      }
      else {
        playerY = this.winLocation.y + this.minInitialDistance;
      }
    }

    return game.add.sprite(playerX, playerY, 'player');
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
