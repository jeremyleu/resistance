var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var React = require('react');
var ReactDomServer = require('react-dom/server');
var hbs = require('hbs');
var exphbs = require('express-handlebars');
var resgame = require('./newresgame');
var session = require('express-session');
var sharedsession = require("express-socket.io-session");

var routes = require('./routes');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.set('views', __dirname + '/views');
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');
//app.engine('jsx', require('express-react-views').createEngine());
app.set('port', process.env.PORT || 3000);


app.use(express.static(path.join(__dirname,'public')));

var sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
})

app.use(sessionMiddleware);
app.locals.rooms = new Array(9000);
for(var i = 0; i < app.locals.rooms.length; i++)
  app.locals.rooms[i] = false;

require('./routes')(app);

var server = require('http').createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/*http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/

var io = require('socket.io').listen(server);
io.use(sharedsession(sessionMiddleware));
app.set('socketio', io);
//io.set('log level',1);

io.sockets.on('connection', function (socket) {
  /*var room;
  do{
    room = Math.floor(Math.random()*9000);
    console.log(app.locals.rooms[room]);
  }while(app.locals.rooms[room]);
  var newRoom =
  {
    "ID": room,
    "players": [{"name": null,
    "playerID": 0,
    "role": null
    }]
  };
  //gameSocket.join('' + room);
  console.log('client joined room ' + room);
  app.locals.rooms[room] = newRoom;*/
  console.log('client connected');
  socket.handshake.session.connected = true;
  socket.handshake.session.save(function (err) { /* handle error */
    console.log("error: " + err);
  });
  resgame.initGame(io, socket, app);
    //require('./routes')(app, socket);
});

//require('./routes')(app, socket);
