// Load the menu for the game

var menuState = {
  mainLabel: '',
  startLabel: '',

  create: function() {
    mainLabel = game.add.text(80, 80, 'Start menu', {
      font: '50px Arial',
      fill: '#ffffff'
    });
    startLabel = game.add.text(80, game.world.height - 80, 'Press W to start', {
      font: '25px Arial',
      fill: '#ffffff'
    });

    var wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    wKey.onDown.addOnce(this.start, this);
  },

  start: function() {
    mainLabel.setText('Connecting to a game...');
    startLabel.setText('');
    game.state.start('connect');
  }
};
