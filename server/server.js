// io is an initialized socket.io server with defaults from npm's http.
// Set up all the connections here and maintain state of the game.
function server(io) {
  // consts
  var DEBUG = true;
  var PLAYERS_PER_ROOM = 2;

  // maintain server state here
  var clients = {};
  var rooms = [];

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
    
  function getARoom() {
    // temp: just enter the first room
    if (rooms.length === 0) {
        rooms.push('0');
    }
    return 0;
  }

  // Handle a client connecting to the game
  io.on('connection', function(socket) {
    // Reset this player's game state
    clients[socket.id] = null;

    socket.on('error', function(data) {
        log('onError', 'error');
        log(data, 'error');
    });

    socket.on('joinRoom', function(data, ack) {
      // create the room if it doesn't exist
      var room = getARoom();
      socket.join(room, function(err) {
        if (!err) {
          clients[socket.id] = room;
          var playersInRoom = Object.keys(clients).length;
          ack({ playersInRoom: playersInRoom });
          log('client ' + socket.id + ' connected to room ' + room + ' (' + playersInRoom + ' players)');
          io.to(room).emit('joined', { client: socket.id });
        }
        else {
          log(err, 'error');
          socket.emit('errorMsg', err);
        }
      });
    });

    socket.on('disconnect', function(data, ack) {
      // remove the player from the room
      var room = clients[socket.id];
      clients[socket.id] = null;
      delete clients[socket.id];
      if (Object.keys(clients).length > 0) {
        io.to(room).emit('playerLeft', { playerLeft: socket.id, playersInRoom: Object.keys(clients).length });
      }
      log('client ' + socket.id + ' disconnected from room ' + room + ' (' + Object.keys(clients).length + ' players)');
    });

  });
}

module.exports = server;
