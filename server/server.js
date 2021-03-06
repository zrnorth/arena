// io is an initialized socket.io server with defaults from npm's http.
// Set up all the connections here and maintain state of the game.

var controls = require('../lib/controls.js');

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

    socket.on('myPlayerData', function(playerData) {
      // Check if the client exists in the connected clients. Fail otherwise, haven't connected. something went wrong
      if (!(socket.id in clients)) {
        log('error - client has not connected properly', 'error');
        socket.emit('errorMsg', 'did not connect to room before sending player coordinates');
        return;
      }
      
      // Update the player's known position, velo, facing
      playerState[socket.id] = playerData;
      log('got some player data: ' + JSON.stringify(playerData));
      // todo: do some sort of sanity check to make sure it's allowed (server has final call)
    });

    // todo: putting this off til later. server should maintain state based on button presses
    socket.on('buttonsPressed', function(buttonsPressed) {
      /*
      // Get the players id and apply the newly pressed buttons to that player's state.
      if (!(socket.id in clients)) {
        log('error - client has not connected properly', 'error');
        socket.emit('errorMsg', 'did not connect to room before sending button press');
        return;
      }
      var newPlayerState = controls.handle(buttonsPressed, playerState[socket.id]);
      playerState[socket.id] = newPlayerState;
      */
    });

    socket.on('disconnect', function(data, ack) {
      // remove the player from the room
      var room = clients[socket.id];
      delete clients[socket.id];
      delete playerState[socket.id];
      if (Object.keys(clients).length > 0) {
        io.to(room).emit('playerLeft', { playerLeft: socket.id });
      }
      log('client ' + socket.id + ' disconnected from room ' + room + ' (' + Object.keys(clients).length + ' players)');
    });

  });
}

module.exports = server;
