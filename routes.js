const React = require('react');
const ReactDomServer = require('react-dom/server');

var index = require('./routes/index');

module.exports = function (app) {
  app.get('/', function(req, res){
    console.log('hello');
    console.log(req.session.connected);
    if(req.session.connected)
      res.status(500).send("There is already an instance of Resistance: Avalon open.");
    else if(!req.session.room || req.session.room == -1000)
      res.render('new_index');
    else {
      console.log("req.session.room is " + req.session.room);
      res.render('new_index', {room: req.session.room+1000, ID: req.session.ID});
    }
  });
  app.post('/createRoom', function(req, res){
    //var io = req.app.get('socketio');
    //console.log(req.session);
    var room = req.session.room;
    /*do{
      room = Math.floor(Math.random()*9000);
      console.log(req.app.locals.rooms[room]);
    }while(req.app.locals.rooms[room]);*/
    var newRoom =
    {
      "ID": room,
      "players": [{"name":req.body.name,
      "playerID": 0,
      "IDString": "player0",
      "role": null,
      "lead": null,
      "vote": null
      }],
      "cardsPlayed": [],
      "open": true
    };
    //gameSocket.join('' + room);
    console.log('client joined room ' + room);
    req.app.locals.rooms[room] = newRoom;
    console.log(newRoom);
    req.session.host = true;
    req.session.ID = 0;

    res.render('waitingRoom', {accessCode: req.app.locals.rooms[room].ID + 1000,
      numPlayers: newRoom.players.length,
      players: newRoom.players,
      host: true,
      ID: 0
    });
    //res.render('waitingRoom', {content: })

  });

  app.post('/joinRoom', function(req, res){
    var io = req.app.get('socketio');
    var room = req.body.roomID - 1000;
    var playerID;
    if(req.app.locals.rooms[room])
    {
      playerID = req.app.locals.rooms[room].players.length;
      var player = {
        "name": req.body.name,
        "playerID": playerID,
        "IDString": "player" + playerID,
        "role": null,
        "lead": null,
        "vote": null
      };
      var i;
      for(i = 0; i < req.app.locals.rooms[room].players.length; i++)
      {
        if(player.name.trim().toUpperCase() === req.app.locals.rooms[room].players[i].name.trim().toUpperCase())
        {
          res.render('index', {joinError: 'That name is already taken.'});
          return;
        }
        else if(req.app.locals.rooms[room].players.length >= 10)
        {
          res.render('index', {joinError: 'That room is full.'});
          return;
        }
        else if(!req.app.locals.rooms[room].open)
        {
          res.render('index', {joinError: 'That room is not available.'});
          return;
        }
      }
      //gameSocket.join('' + room);
      console.log('client joined room ' + room);
      //io.to('' + room).emit('playerJoinedRoom', player.name);
      req.app.locals.rooms[room].players.push(player);
      console.log(req.app.locals.rooms[room]);

      req.session.room = room;
      req.session.ID = playerID;
      req.session.host = false;
      res.render('waitingRoom', {accessCode: req.app.locals.rooms[room].ID + 1000,
        numPlayers: req.app.locals.rooms[room].players.length,
        players: req.app.locals.rooms[room].players,
        host: false,
        ID: playerID
      });

    }
    else {
      res.render('index', {joinError: 'Please enter a valid access code.'});
    }
  });
}

/*module.exports = function (app) {
  app.post('/createRoom', (req, res) => {
    const name = req.body.name;
    res.send()
  });
}
*/
