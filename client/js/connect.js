// Connects to the game server

var connectState = {
  create: function() {
    // get a connection to the game server
    var connection = io.connect('http://localhost:3000');

    // join the game server, and store our connection in the game object
    connection.emit('joinRoom', {}, function(data) { 
      game.connection = connection;
      game.socketId = data.socketId;
      console.log('connected');

      // Now that we have connected, load the game
      game.state.start('play');
    });
  }
};
