// Load the menu for the game

var menuState = {
  create: function() {
    this.mainLabel = game.add.text(80, 80, 'Start menu', {
      font: '50px Arial',
      fill: '#ffffff'
    });
    this.startLabel = game.add.text(80, game.world.height - 80, 'Press W to start', {
      font: '25px Arial',
      fill: '#ffffff'
    });

    var wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    wKey.onDown.addOnce(this.start, this);
  },

  start: function() {
    this.mainLabel.setText('Connecting to a game...');
    this.startLabel.setText('');
    game.state.start('connect');
  }
};
