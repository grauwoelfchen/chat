
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
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
  app.use(express.cookieParser(process.env.COOKIE_SECRET || ':)'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

// routes
app.get('/', routes.index);
app.get('/login',  routes.auth.login);
app.get('/logout', routes.auth.logout);
app.get('/auth/twitter/callback', routes.auth.callback);

// db
var mongo = require('mongodb');
var db = new mongo.Db(
    process.env.MONGO_NAME || 'chat',
    new mongo.Server(
      process.env.MONGO_HOST || 'localhost',
      process.env.MONGO_PORT || 27017
    ),
    {safe:true}
  );
db.open(function(err, db) {
  if (process.env.NODE_ENV == 'production') {
    db.authenticate(
      process.env.MONGO_USER,
      process.env.MONGO_PASS,
      function(err, res) {
        if (err) {
          throw err;
        }
      }
    );
  }
  if (err) {
    console.log(err);
  } else {
    console.log('connected to mongodb');
  }
});
app.set('db', db);

// socket.io
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
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
  socket.on('connected', function() {
    db.collection('messages', function(err, collection) {
      if (err) {
        throw err;
      }
      collection.find().sort({time: -1}).limit(5).toArray(function(err, results) {
        if (err) {
          throw err;
        }
        socket.emit('message.list', results.reverse());
      });
    });
  });
  socket.on('message.add', function(data) {
    data.time = Date.now();
    db.collection('messages', function(err, collection) {
      if (err) {
        throw err;
      }
      var message = {name:data.name, message:data.message, time:data.time};
      collection.save(message, function(err) {
        if (err) {
          throw err;
        }
      });
    });
    broadcast('message.add', data);
  });
  socket.on('disconnect', function() {
    delete sockets[socket.id];
  });
});
