// Start the various systems and then call the load state

var bootState = {
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('load');
  }
};
