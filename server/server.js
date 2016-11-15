// io is an initialized socket.io server with defaults from npm's http.
// Set up all the connections here and maintain state of the game.
function server(io) {
  // consts
  var DEBUG = true;
  var PLAYERS_PER_ROOM = 2;

  // maintain server state here
  var clients = {};
  var playerState = {};

  function log(msg, type) {
    if (type == undefined) {
      type = 'log';
    }
    if (type === 'error') {
      console.error(msg);
    }
    else if (type === 'warn') {
      console.warn(msg);
    }
    else {
      if (DEBUG) {
        console.log(msg);
      }
    }
  }

  // Handle player data broadcasts.
  setInterval(function() {
    io.sockets.emit('playerState', playerState);
  }, 500 /* 2x a second */);

  // Handle a client connecting to the game.
  io.on('connection', function(socket) {
    // Reset this player's game state
    clients[socket.id] = null;

    socket.on('error', function(data) {
      log('onError', 'error');
      log(data, 'error');
    });

    socket.on('joinRoom', function(data, ack) {
      // todo: one room to start.
      var room = 0;
      socket.join(room, function(err) {
        if (!err) {
          clients[socket.id] = room;
          var playersInRoom = Object.keys(clients).length;
          ack({ socketId: socket.id });
          log('client ' + socket.id + ' connected to room ' + room + ' (' + playersInRoom + ' players)');
          io.to(room).emit('joined', { client: socket.id });
        }
        else {
          log(err, 'error');
          socket.emit('errorMsg', err);
        }
      });
    });

    socket.on('myPosAndVelo', function(posVelo) {
      // Check if the client exists in the connected clients. Fail otherwise, haven't connected. something went wrong
      if (!(socket.id in clients)) {
        log('error - client has not connected properly', 'error');
        socket.emit('errorMsg', 'did not connect to room before sending player coordinates');
        return;
      }
      
      // Update the player's known position
      playerState[socket.id] = posVelo;
      console.log('got this: ' + JSON.stringify(posVelo));
      // todo: do some sort of sanity check to make sure it's allowed (server has final call)
    });

    socket.on('disconnect', function(data, ack) {
      // remove the player from the room
      var room = clients[socket.id];
      delete clients[socket.id];
      delete playerState[socket.id];
      if (Object.keys(clients).length > 0) {
        io.to(room).emit('playerLeft', { playerLeft: socket.id, playersInRoom: Object.keys(clients).length });
      }
      log('client ' + socket.id + ' disconnected from room ' + room + ' (' + Object.keys(clients).length + ' players)');
    });

  });
}

module.exports = server;
