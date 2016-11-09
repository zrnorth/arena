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
    // Connect to the game server
    var socket = io.connect('http://localhost:3000');
    console.log('connected');
    socket.emit('joinRoom', {}, function(data) { 
      console.log(data);
    });

    game.state.start('menu');
  }
};
