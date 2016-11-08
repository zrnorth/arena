var app = require('./app.js');
var port = 3000;
app.set('port', port);

// Create the http server
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// start'er up
server.listen(port);
