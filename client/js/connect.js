// Connects to the game server

var connectState = {
  create: function() {
    // Connect to the game server
    var connection = io.connect('http://localhost:3000');
    connection.emit('joinRoom', {}, function(data) { 
      //now that we have connected, store our connection in the game object
      game.connection = connection;
      console.log('connected');

      // Now that we have connected, load the game
      game.state.start('play');
    });
  }
};
