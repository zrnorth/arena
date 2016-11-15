// Gameplay

var playState = {
  create: function() {
    // todo: get this from server when room is generated
    this.winLocation = { x: 400, y: 400 }; 
    this.minInitialDistance = 150; // todo: ''
    this.otherPlayerSprites = {}; // other players, empty until synced with server
    this.keyboard = game.input.keyboard;

    // Spawn the player at a random spot
    this.player = this.randomPlayerSpawn();
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.win = game.add.sprite(this.winLocation.x, this.winLocation.y, 'win');
    game.physics.enable(this.win, Phaser.Physics.ARCADE);


    // make sure our state is synced with the server's state.
    game.connection.on('playerState', function(playerState) {
      game.serverCanonicalState = playerState;
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
  },

  winGame: function() {
    game.state.start('end');
  },

  randomPlayerSpawn: function() {
    // get a random player spawn, with min distance from the goal.
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
  }
};
