var io;
var gameSocket;
var app;

/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket, application){
    io = sio;
    gameSocket = socket;
    app = application;
    gameSocket.emit('connected', { message: "You are connected!" });
    console.log("initializing stuff");

    // Host Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('joinedWaitingRoom', joinedWaitingRoom);
    gameSocket.on('hostStartGame', hostStartGame);
    gameSocket.on('proposalSubmitted', proposalSubmitted);
    gameSocket.on('voteSubmitted', voteSubmitted);
    gameSocket.on('cardPlayed', cardPlayed);
    gameSocket.on('gameEnd', gameEnd);
    gameSocket.on('assassinate', assassinate);
    gameSocket.on('disconnect', disconnect);
    gameSocket.on('playerReconnect', playerReconnect);
    /*gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('hostNextRound', hostNextRound);

    // Player Events

    gameSocket.on('playerAnswer', playerAnswer);
    gameSocket.on('playerRestart', playerRestart);*/
}

/* *******************************
   *                             *
   *       HOST FUNCTIONS        *
   *                             *
   ******************************* */

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function hostCreateNewGame(name) {
    // Create a unique Socket.IO Room
    //console.log("new game created server side");
    var room;
    do{
      room = Math.floor(Math.random()*9000);
      console.log(app.locals.rooms[room]);
    }while(app.locals.rooms[room]);
    var newRoom =
    {
      "ID": room,
      "players": [{"name":name,
      "playerID": 0,
      "IDString": "player0",
      "role": null,
      "lead": null,
      "vote": null,
      "cardPlayed": null
      }],
      "cardsPlayed": [],
      "open": true,
      "quests": null,
      "waitingFor": "proposal",
      "playersChosen": [],
      "gameEndReason": null
    };
    //gameSocket.join('' + room);
    console.log('client joined room ' + room);
    app.locals.rooms[room] = newRoom;
    console.log(newRoom);
    this.handshake.session.host = true;
    this.handshake.session.ID = 0;
    this.handshake.session.connected = true;
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players
    this.join('' + room);
    this.handshake.session.room = room;
    this.handshake.session.save(function (err) { /* handle error */
    });
    console.log("joined room " + room);
    io.in('' + room).emit('roomCreated', {players: app.locals.rooms[room].players, room: room+1000});
    //console.log('session: ' + this.handshake.session.room);
    //console.log('socket joined room ' + room);
};
//          IO.socket.emit('playerJoinGame', {name: $('#joinName').val(), roomID: $('#accessCodeInput').val()});
function playerJoinGame(data) {
    // Create a unique Socket.IO Room
    console.log("player joined game with room " + data.roomID);
    var room = data.roomID - 1000;
    var playerID;
    if(app.locals.rooms[room])
    {
      playerID = app.locals.rooms[room].players.length;
      var player = {
        "name": data.name,
        "playerID": playerID,
        "IDString": "player" + playerID,
        "role": null,
        "lead": null,
        "vote": null,
        "cardPlayed": null
      };
      var i;
      for(i = 0; i < app.locals.rooms[room].players.length; i++)
      {
        if(player.name.trim().toUpperCase() === app.locals.rooms[room].players[i].name.trim().toUpperCase())
        {
          this.emit('joinError', 'That name is already taken.');
          //res.render('index', {joinError: 'That name is already taken.'});
          return;
        }
        else if(app.locals.rooms[room].players.length >= 10)
        {
          this.emit('joinError', 'That room is full.');
          //res.render('index', {joinError: 'That room is full.'});
          return;
        }
        else if(!app.locals.rooms[room].open)
        {
          this.emit('joinError', 'That room is not available.');
          //res.render('index', {joinError: 'That room is not available.'});
          return;
        }
      }
      //gameSocket.join('' + room);
      console.log('client joined room ' + room);
      //io.to('' + room).emit('playerJoinedRoom', player.name);
      app.locals.rooms[room].players.push(player);
      console.log(app.locals.rooms[room]);

      this.handshake.session.room = room;
      this.handshake.session.ID = playerID;
      this.handshake.session.host = false;
      this.handshake.session.connected = true;
      this.emit('joinedSuccessfully', {room: room + 1000, ID: playerID, players: app.locals.rooms[room].players});
      console.log("joinedSuccessfully emitted with room " + room + ", ID " + playerID + ", and players " + JSON.stringify(app.locals.rooms[room].players));
      this.join('' + room);
      this.handshake.session.save(function (err) { /* handle error */
      });
      io.in('' + room).emit('playerJoinedRoom', app.locals.rooms[room].players);
      console.log("playerJoinedRoom emitted with players " + JSON.stringify(app.locals.rooms[room].players));
      /*res.render('waitingRoom', {accessCode: req.app.locals.rooms[room].ID + 1000,
        numPlayers: req.app.locals.rooms[room].players.length,
        players: req.app.locals.rooms[room].players,
        host: false,
        ID: playerID
      });*/

    }
    else {
      this.emit('joinError', 'Please enter a valid access code.');
      //res.render('index', {joinError: 'Please enter a valid access code.'});
    }

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players



};

function joinedWaitingRoom(roomID) {
  var room = roomID - 1000;
  this.join('' + room);
  this.handshake.session.room = room;
  this.handshake.session.save(function (err) { /* handle error */
    console.log("error: " + err);
  });
}

function hostStartGame(roomID, goodGuysList, badGuysList) {
  var room = roomID - 1000;
  if(this.handshake.session.room == room)
  {
    //console.log("stuff");
    if(this.handshake.session.host)
    {
      app.locals.rooms[room].open = false;
      var players = app.locals.rooms[room].players;
      var data = assignRolesAndQuests(players.length, goodGuysList, badGuysList);
      var roles = data.roles;
      app.locals.rooms[room].quests = data.quests;
      var firstLead = Math.floor(Math.random() * players.length);
      var i;
      for(i = 0; i < players.length; i++)
      {
        if(i == firstLead)
          players[i].lead = true;
        else
          players[i].lead = false;
        players[i].role = roles[i];
      }
      console.log(players);
      console.log(app.locals.rooms[room].quests);
      //console.log(roles);

      io.to('' + room).emit('gameStarted', {players: players, quests: app.locals.rooms[room].quests});
    }
  }
}

//IO.socket.emit('proposalSubmitted', {"accessCode": accessCode, "lead": ID, "playersChosen": playersChosen, "quests": quests, "currentQuest": currentQuest});
function proposalSubmitted(data) {
  var room = data.accessCode - 1000;
  var stuff = data;
  if(this.handshake.session.room == room)
  {
    for(var k = 0; k < app.locals.rooms[room].players.length; k++)
      app.locals.rooms[room].players[k].vote = null;
    console.log(data.currentQuest);
    console.log(app.locals.rooms[room].quests);
    app.locals.rooms[room].waitingFor = "vote";
    app.locals.rooms[room].playersChosen = stuff.playersChosen;
    console.log('questProposed submitted with playersChosen ' + stuff.playersChosen);
    io.to('' + room).emit('questProposed', {playersChosen: stuff.playersChosen,
      players: app.locals.rooms[room].players,
      quests: app.locals.rooms[room].quests,
      lead: stuff.lead,
      currentQuest: stuff.currentQuest
    });

  }
}

//IO.socket.emit('voteSubmitted', {"accessCode": accessCode, "players": players, "playersChosen": playersChosen});
function voteSubmitted(data) {
  var room = data.accessCode - 1000;
  var stuff = data;
  var previousLead;
  if(this.handshake.session.room == room)
  {
    //var players = stuff.players;
    console.log(app.locals.rooms[room].players);
    for(var j = 0; j < app.locals.rooms[room].players.length; j++)
    {
      if(stuff.voter === j)
      {
        app.locals.rooms[room].players[j].vote = stuff.vote;
      }
    }
    console.log(stuff.playersChosen);
    var approve = 0;
    var voteComplete = true;
    var votePassed = null;
    for(var i = 0; i < app.locals.rooms[room].players.length; i++)
    {
      if(app.locals.rooms[room].players[i].vote == null)
      {
        voteComplete = false;
        break;
      }
      approve += (app.locals.rooms[room].players[i].vote === true) ? 1 : -1;
      console.log(approve);
    }

    if(voteComplete)
    {

      app.locals.rooms[room].players[data.leadPlayer].lead = false;
      previousLead = data.leadPlayer;
      if(data.leadPlayer == app.locals.rooms[room].players.length - 1)
        data.leadPlayer = 0;
      else {
        data.leadPlayer++;
      }
      app.locals.rooms[room].players[data.leadPlayer].lead = true;
      votePassed = (approve > 0);
      if(!votePassed)
      {
        app.locals.rooms[room].waitingFor = "proposal";
        app.locals.rooms[room].quests[data.currentQuest - 1].votingTrack++;
        if(app.locals.rooms[room].quests[data.currentQuest - 1].votingTrack == 5)
        {
          io.to('' + room).emit('votingTrackGameEnd');
        }
      }
      else {
        for(var i = 0; i < stuff.playersChosen.length; i++)
          app.locals.rooms[room].players[stuff.playersChosen[i]].cardPlayed = 0;
        app.locals.rooms[room].waitingFor = "quest";
      }
    }

    console.log('voteCounted submitted with playersChosen ' + stuff.playersChosen);
    io.to('' + room).emit('voteCounted', {playersChosen: stuff.playersChosen,
      players: app.locals.rooms[room].players,
      votePassed: votePassed,
      quests: app.locals.rooms[room].quests,
      leadPlayer: data.leadPlayer,
      previousLead: previousLead
    });
    /*if(votePassed != null)
    {
      for(var k = 0; k < app.locals.rooms[room].players.length; k++)
        app.locals.rooms[room].players[k].vote = null;
    }*/
  }
}
//IO.socket.emit('cardPlayed', {"accessCode": accessCode, "cardsPlayed": cardsPlayed, "playersChosen": playersChosen, "quests": quests, "currentQuest": currentQuest});

  function cardPlayed(data) {
    var room = data.accessCode - 1000;
    var stuff = data;
    var gameEndReason = null;
    if(this.handshake.session.room == room)
    {
      app.locals.rooms[room].cardsPlayed.push(data.cardPlayed);
      app.locals.rooms[room].players[data.player].cardPlayed = 1;
      console.log(stuff.currentQuest);
      var failCount = 0;
      var allCardsReceived = app.locals.rooms[room].cardsPlayed.length == data.playersChosen.length;

      if(allCardsReceived)
      {
        for(var i = 0; i < app.locals.rooms[room].players.length; i++)
        {
          app.locals.rooms[room].players[i].cardPlayed = null;
        }
        app.locals.rooms[room].waitingFor = "proposal";
        for(var i = 0; i < app.locals.rooms[room].cardsPlayed.length; i++)
        {
          if(app.locals.rooms[room].cardsPlayed[i] === false)
            failCount++;
        }
        app.locals.rooms[room].quests[data.currentQuest - 1].success = (failCount < app.locals.rooms[room].quests[data.currentQuest - 1].failsRequired);
        //data.cardsPlayed = [];
        var success = 0;
        var fail = 0;
        for(var j = 0; j < app.locals.rooms[room].quests.length && app.locals.rooms[room].quests[j].success != null; j ++)
        {
          if(app.locals.rooms[room].quests[j].success)
            success++;
          else if(!app.locals.rooms[room].quests[j].success)
            fail++;
        }
        if(success >= 3 && data.isMerlinGame)
        {
          app.locals.rooms[room].waitingFor = "end";
          app.locals.rooms[room].gameEndReason = "Three quests have succeeded. Waiting for Assassin to guess Merlin...";
        }
        else if(success >= 3 && !data.isMerlinGame)
        {
          app.locals.rooms[room].waitingFor = "end";
          app.locals.rooms[room].gameEndReason = "Three quests have succeeded.";
        }
        else if(fail >= 3)
        {
          app.locals.rooms[room].waitingFor = "end";
          app.locals.rooms[room].gameEndReason = "Three quests have failed. Bad guys win!";
        }
      }

      console.log('cardCounted submitted with cardsPlayed ' + app.locals.rooms[room].cardsPlayed);
      io.to('' + room).emit('cardCounted', {
        allCardsReceived: allCardsReceived,
        cardsPlayed: app.locals.rooms[room].cardsPlayed,
        player: data.player,
        quests: app.locals.rooms[room].quests,
        currentQuest: data.currentQuest,
        gameEndReason: app.locals.rooms[room].gameEndReason
      });

      if(allCardsReceived)
        app.locals.rooms[room].cardsPlayed = [];

    }
  }

  function assassinate(data) {
    var room = data.accessCode - 1000;
    var goodGuysWin;
    var players = data.players;
    if(this.handshake.session.room == room)
    {
      goodGuysWin = (players[data.assassinSelected].role != 'merlin');
      console.log("Do good guys win? " + goodGuysWin);
      io.to('' + room).emit('assassinationComplete', {target: data.assassinSelected, goodGuysWin: goodGuysWin});
    }
  }


  function gameEnd(accessCode, player) {
    var room = accessCode - 1000;
    if(player != null)
    {
      console.log("playerLeft emitted with player " + player );
      io.to('' + room).emit('playerLeft', app.locals.rooms[room].players[player].name);
    }
    app.locals.rooms[room] = null;
    if(this.handshake.session)
    {
      this.handshake.session.room = null;
      this.handshake.session.ID = null;
      this.handshake.session.host = null;
      this.handshake.session.destroy();
    }
  }

  function disconnect() {
    console.log("disconnected");
    if(this.handshake.session)
    {
      this.handshake.session.connected = false;
      this.handshake.session.save(function (err) { /* handle error */
        console.log("error: " + err);
      });
      if(this.handshake.session && this.handshake.session.room != null && this.handshake.session.ID != null)
      {
        var room = this.handshake.session.room;

        console.log('stuff ' + this.handshake.session.room + ' ' + this.handshake.session.ID);
        io.to('' + room).emit('playerDisconnected', this.handshake.session.ID);
      }
    }
  }

  function playerReconnect(data) {
    console.log("reconnectedID: " + this.handshake.session.ID);
    var room = data.room - 1000;
    this.handshake.session.room = room;
    this.handshake.session.ID = parseInt(data.ID);
    console.log("reconnectedID after change: " + this.handshake.session.ID);
    this.handshake.session.host = (this.handshake.session.ID == 0);
    this.handshake.session.save(function (err) { /* handle error */
      console.log("error: " + err);
    });
    console.log("reconnectedRoom: " + this.handshake.session.room);
    this.join('' + room);
    console.log("reconnectInfo emitted with players " + app.locals.rooms[room].players + ", quests " + app.locals.rooms[room].quests);
    if(app.locals.rooms[room].waitingFor == "proposal")
      this.emit('reconnectInfo', {players: app.locals.rooms[room].players, quests: app.locals.rooms[room].quests, open: app.locals.rooms[room].open, waitingFor: app.locals.rooms[room].waitingFor});
    else if(app.locals.rooms[room].waitingFor == "vote")
      this.emit('reconnectInfo', {players: app.locals.rooms[room].players, quests: app.locals.rooms[room].quests, waitingFor: app.locals.rooms[room].waitingFor, playersChosen: app.locals.rooms[room].playersChosen});
    else if(app.locals.rooms[room].waitingFor == "quest")
      this.emit('reconnectInfo', {players: app.locals.rooms[room].players, quests: app.locals.rooms[room].quests, waitingFor: app.locals.rooms[room].waitingFor, playersChosen: app.locals.rooms[room].playersChosen});
    else if(app.locals.rooms[room].waitingFor == "end")
      this.emit('reconnectInfo', {players: app.locals.rooms[room].players, quests: app.locals.rooms[room].quests, waitingFor: app.locals.rooms[room].waitingFor, gameEndReason: app.locals.rooms[room].gameEndReason});

    io.to('' + room).emit('playerReconnected', this.handshake.session.ID);
  }


function assignRolesAndQuests(numPlayers, goodGuysList, badGuysList) {
  var quest1, quest2, quest3, quest4, quest5;
  var roles = [];
  if(numPlayers == 5)
  {
    quest1 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    for(var i = goodGuysList.length; i < 3; i++)
      roles.push("generic good guy");
    for(var i = badGuysList.length; i < 2; i++)
      roles.push("generic bad guy");
    roles.push.apply(roles, goodGuysList);
    roles.push.apply(roles, badGuysList);
    console.log(roles);
    //roles = ["Merlin", "Percival", "generic good guy", "Assassin", "Morgana"];
  }
  else if(numPlayers == 6)
  {
    quest1 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    //roles = ["Merlin", "Percival", "generic good guy", "Assassin", "Morgana", "generic good guy"];
    for(var i = goodGuysList.length; i < 4; i++)
      roles.push("generic good guy");
    for(var i = badGuysList.length; i < 2; i++)
      roles.push("generic bad guy");
    roles.push.apply(roles, goodGuysList);
    roles.push.apply(roles, badGuysList);
  }
  else if(numPlayers == 7)
  {
    quest1 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 4, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    //roles = ["Merlin", "Percival", "generic good guy", "Assassin", "Morgana", "generic good guy", "generic bad guy"];
    for(var i = goodGuysList.length; i < 4; i++)
      roles.push("generic good guy");
    for(var i = badGuysList.length; i < 3; i++)
      roles.push("generic bad guy");
    roles.push.apply(roles, goodGuysList);
    roles.push.apply(roles, badGuysList);
  }
  else if(numPlayers == 8)
  {
    quest1 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 5, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 5, "failsRequired": 1, "votingTrack": 0, "success": null};
    //roles = ["Merlin", "Percival", "generic good guy", "Assassin", "Morgana", "generic good guy", "generic bad guy", "generic good guy"];
    for(var i = goodGuysList.length; i < 5; i++)
      roles.push("generic good guy");
    for(var i = badGuysList.length; i < 3; i++)
      roles.push("generic bad guy");
    roles.push.apply(roles, goodGuysList);
    roles.push.apply(roles, badGuysList);
  }
  else if(numPlayers == 9)
  {
    quest1 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 5, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 5, "failsRequired": 1, "votingTrack": 0, "success": null};
    //roles = ["Merlin", "Percival", "generic good guy", "Assassin", "Morgana", "generic good guy", "generic bad guy", "generic good guy", "generic good guy"];
    for(var i = goodGuysList.length; i < 6; i++)
      roles.push("generic good guy");
    for(var i = badGuysList.length; i < 3; i++)
      roles.push("generic bad guy");
    roles.push.apply(roles, goodGuysList);
    roles.push.apply(roles, badGuysList);
  }
  else
  {
    quest1 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 5, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 5, "failsRequired": 1, "votingTrack": 0, "success": null};
    //roles = ["Merlin", "Percival", "generic good guy", "Assassin", "Morgana", "generic good guy", "generic bad guy", "generic good guy", "generic good guy", "generic bad guy"];
    for(var i = goodGuysList.length; i < 6; i++)
      roles.push("generic good guy");
    for(var i = badGuysList.length; i < 4; i++)
      roles.push("generic bad guy");
    roles.push.apply(roles, goodGuysList);
    roles.push.apply(roles, badGuysList);
  }
  var quests = [quest1, quest2, quest3, quest4, quest5];
  roles = shuffle(roles);
  var data = {
    "quests": quests,
    "roles": roles
  }
  return data;
}

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

/*
 * Two players have joined. Alert the host!
 * @param gameId The game ID / room ID
 */
