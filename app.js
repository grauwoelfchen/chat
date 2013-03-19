
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/foo/:id', routes.sample1);
app.get('/mongo', routes.showMongo);
app.post('/mongo', routes.saveMongo);

// socket.io
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
var chats = [];
var sockets = {};

function broadcast(method, message) {
  for(var n in sockets) {
    sockets[n].emit(method, message);
  }
};

io
.of('/chat')
.on('connection', function(socket) {
  sockets[socket.id] = socket;
  socket.emit('chat.list', chats);
  socket.on('chat.add', function(data) {
    data.time = Date.now();
    chats.push(data);
    broadcast('chat.add', data);
  });
  socket.on('disconnect', function() {
    delete sockets[socket.id];
  });
});

app.get('/socket', function(req, res) {
  res.render('socket', {title:'Chat'});
});
