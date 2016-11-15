// Gameplay

var playState = {
  WIN_LOCATION: {
    x: 400, 
    y: 400
  }, // todo: get this from server when room is generated
  MIN_INITIAL_DISTANCE: 150, // todo: ''

  create: function() {
    this.keyboard = game.input.keyboard;
    // Spawn the player at a random spot
    this.player = this.randomPlayerSpawn();
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.win = game.add.sprite(this.WIN_LOCATION.x, this.WIN_LOCATION.y, 'win');
    game.physics.enable(this.win, Phaser.Physics.ARCADE);

    //todo: move this
    // handle player data updates from the server
    game.connection.on('playerState', function(playerState) {
      console.log('server says: ' + JSON.stringify(playerState));
    });
  },
  update: function() {
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
  winGame: function() {
    game.state.start('end');
  },

  randomPlayerSpawn: function() {
    // get a random player spawn, with min distance from the goal.
    var playerX = Math.floor(Math.random() * (game.width - 16 /* sprite width */));
    if (Math.abs(this.WIN_LOCATION.x - playerX) < this.MIN_INITIAL_DISTANCE) {
      if (playerX < this.WIN_LOCATION.x) { // pin to the left
          playerX = this.WIN_LOCATION.x - this.MIN_INITIAL_DISTANCE;
      }
      else {
          playerX = this.WIN_LOCATION.x + this.MIN_INITIAL_DISTANCE;
      }
    }

    var playerY = Math.floor(Math.random() * (game.height - 16 /* sprite width */));
    if (Math.abs(this.WIN_LOCATION.y - playerY) < this.MIN_INITIAL_DISTANCE) {
      if (playerY < this.WIN_LOCATION.y) { // pin to the left
          playerY = this.WIN_LOCATION.y - this.MIN_INITIAL_DISTANCE;
      }
      else {
          playerY = this.WIN_LOCATION.y + this.MIN_INITIAL_DISTANCE;
      }
    }

    return game.add.sprite(playerX, playerY, 'player');
  }
};
