// Win state

var winState = {
  create: function() {
    var winLabel = game.add.text(80, 80, "You win!!!", {
      font: '50px Arial', 
      fill: '#00FF00'
    });
    var startLabel = game.add.text(80, game.world.height-80, "Press W to restart.",{
      font: '25px Arial', 
      fill: '#ffffff'
    });
    var wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    wKey.onDown.addOnce(this.restart, this);
  },
  restart: function() {
    game.state.start('menu');
  },
};
