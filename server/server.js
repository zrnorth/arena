// assuming io is an initialized socket.io server with defaults from npm's http.
function server(io) {
  // maintain server state here
  var debug = false;

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
      if (debug) {
        console.log(msg);
      }
    }
  }
  // Handle a client connecting to the game
  io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('ping', function() {
      socket.emit('pong');
    });
  });
}

module.exports = server;
