// Loads assets

var loadState = {
  preload: function() {
    var loadingLabel = game.add.text(80, 150, 'Loading...', {
      font: '10px Courier',
      fill: '#ffffff'
    });
    game.load.image('player', 'assets/player.png');
    game.load.image('win', 'assets/win.png');
  },
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('menu');
  }
};
