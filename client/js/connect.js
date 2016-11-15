// Connects to the game server

var connectState = {
  create: function() {
    // Connect to the game server
    var socket = io.connect('http://localhost:3000');
    console.log('connected');
    socket.emit('joinRoom', {}, function(data) { 
      console.log(data);
    });

    // Load the menu
    game.state.start('menu');
  }
};
