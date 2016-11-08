var app = require('./app.js');
var port = 3000;
app.set('port', port);

// Create the http server
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// start'er up
server.listen(port);

// Handle game connections here
io.on('connection', function(socket) {
  console.log('hello dere');
  socket.emit('news', { hello: 'world' });
  socket.on('hello', function(data) {
    console.log(data);
  });
});
