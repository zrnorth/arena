var app = require('./app.js');
var port = 3000;
app.set('port', port);

// Create the http server
var httpServer = require('http').createServer(app);
var io = require('socket.io')(httpServer);

// Initialize the game server.
// This will modify the io object.
var gameServer = require('./server.js')(io);

// start'er up
httpServer.listen(port);
console.log('Server started, listening on port ' + port);
