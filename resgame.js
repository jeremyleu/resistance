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
function hostCreateNewGame() {
    // Create a unique Socket.IO Room
    //console.log("new game created server side");
    var room;
    do{
      room = Math.floor(Math.random()*9000);
      console.log(app.locals.rooms[room]);
    }while(app.locals.rooms[room]);

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players
    this.join('' + room);
    this.handshake.session.room = room;
    this.handshake.session.save(function (err) { /* handle error */
    });
    //console.log('session: ' + this.handshake.session.room);
    //console.log('socket joined room ' + room);
};

function playerJoinGame(data) {
    // Create a unique Socket.IO Room
    console.log("player joined game");
    var room = data.roomID - 1000;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players

    for(var i = 0; i < app.locals.rooms[room].players.length; i++)
    {
      if(app.locals.rooms[room].players[i].name.toUpperCase() == data.name.toUpperCase())
      {
        console.log('same name');
        return;
      }
    }
    if(!app.locals.rooms[room].open)
    {
      console.log('room unavailable');
      return;
    }
    this.join('' + room);
    this.handshake.session.room = room;
    this.handshake.session.save(function (err) { /* handle error */
    });
    this.broadcast.to('' + room).emit('playerJoinedRoom', data.name);
};

function joinedWaitingRoom(roomID) {
  var room = roomID - 1000;
  this.join('' + room);
  this.handshake.session.room = room;
  this.handshake.session.save(function (err) { /* handle error */
  });
}

function hostStartGame(roomID) {
  var room = roomID - 1000;
  if(this.handshake.session.room == room)
  {
    //console.log("stuff");
    if(this.handshake.session.host)
    {
      app.locals.rooms[room].open = false;
      var players = app.locals.rooms[room].players;
      var data = assignRolesAndQuests(players.length);
      var roles = data.roles;
      var quests = data.quests;
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
      console.log(quests);
      //console.log(roles);

      io.to('' + room).emit('gameStarted', {players: players, quests: quests});
    }
  }
}

//IO.socket.emit('proposalSubmitted', {"accessCode": accessCode, "lead": ID, "playersChosen": playersChosen, "quests": quests, "currentQuest": currentQuest});
function proposalSubmitted(data) {
  var room = data.accessCode - 1000;
  var stuff = data;
  if(this.handshake.session.room == room)
  {
    console.log(data.currentQuest);
    console.log(data.quests);
    console.log('questProposed submitted with playersChosen ' + stuff.playersChosen);
    io.to('' + room).emit('questProposed', {playersChosen: stuff.playersChosen,
      quests: stuff.quests,
      lead: stuff.lead,
      currentQuest: stuff.currentQuest
    });

  }
}

//IO.socket.emit('voteSubmitted', {"accessCode": accessCode, "players": players, "playersChosen": playersChosen});
function voteSubmitted(data) {
  var room = data.accessCode - 1000;
  var stuff = data;
  if(this.handshake.session.room == room)
  {
    var players = stuff.players;
    console.log(stuff.players);
    console.log(stuff.playersChosen);
    var approve = 0;
    var voteComplete = true;
    var votePassed = null;
    for(var i = 0; i < players.length; i++)
    {
      if(players[i].vote == null)
      {
        voteComplete = false;
        break;
      }
      approve += (players[i].vote === true) ? 1 : -1;
      console.log(approve);
    }

    if(voteComplete)
    {
      votePassed = (approve > 0);
      if(!votePassed)
      {
        data.quests[data.currentQuest - 1].votingTrack++;
        if(data.quests[data.currentQuest - 1].votingTrack == 5)
        {
          io.to('' + room).emit('votingTrackGameEnd');
        }
      }
    }

    console.log('voteCounted submitted with playersChosen ' + stuff.playersChosen);
    io.to('' + room).emit('voteCounted', {playersChosen: stuff.playersChosen,
      players: players,
      votePassed: votePassed,
      quests: data.quests
    });

  }
}
//IO.socket.emit('cardPlayed', {"accessCode": accessCode, "cardsPlayed": cardsPlayed, "playersChosen": playersChosen, "quests": quests, "currentQuest": currentQuest});

  function cardPlayed(data) {
    var room = data.accessCode - 1000;
    var stuff = data;
    var gameEndReason = null;
    if(this.handshake.session.room == room)
    {

      console.log(stuff.currentQuest);
      var failCount = 0;
      var allCardsReceived = data.cardsPlayed.length == data.playersChosen.length;

      if(allCardsReceived)
      {
        for(var i = 0; i < data.cardsPlayed.length; i++)
        {
          if(data.cardsPlayed[i] === false)
            failCount++;
        }
        data.quests[data.currentQuest - 1].success = (failCount < data.quests[data.currentQuest - 1].failsRequired);
        //data.cardsPlayed = [];
        var success = 0;
        var fail = 0;
        for(var j = 0; j < data.quests.length && data.quests[j].success != null; j ++)
        {
          if(data.quests[j].success)
            success++;
          else if(!data.quests[j].success)
            fail++;
        }
        if(success >= 3)
        {
          gameEndReason = "Three quests have succeeded. Waiting on Assassin to guess Merlin...";
        }
        else if(fail >= 3)
          gameEndReason = "Three quests have failed. Bad guys win!";
      }

      console.log('cardCounted submitted with cardsPlayed ' + data.cardsPlayed);
      io.to('' + room).emit('cardCounted', {
        allCardsReceived: allCardsReceived,
        cardsPlayed: data.cardsPlayed,
        quests: data.quests,
        currentQuest: data.currentQuest,
        gameEndReason: gameEndReason
      });

    }
  }

  function assassinate(data) {
    var room = data.accessCode - 1000;
    var goodGuysWin;
    var players = data.players;
    if(this.handshake.session.room == room)
    {
      goodGuysWin = (players[data.assassinSelected].role != 'Merlin');
      console.log("Do good guys win? " + goodGuysWin);
      io.to('' + room).emit('assassinationComplete', {target: data.assassinSelected, goodGuysWin: goodGuysWin});
    }
  }

  function gameEnd(accessCode) {
    var room = accessCode - 1000;
    app.locals.rooms[room] = null;
  }


function assignRolesAndQuests(numPlayers) {
  var roles, quest1, quest2, quest3, quest4, quest5;
  if(numPlayers == 5)
  {
    quest1 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    roles = ["Merlin", "Percival", "Generic Good Guy", "Assassin", "Morgana"];
  }
  else if(numPlayers == 6)
  {
    quest1 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    roles = ["Merlin", "Percival", "Generic Good Guy", "Assassin", "Morgana", "Generic Good Guy"];
  }
  else if(numPlayers == 7)
  {
    quest1 = {"numberOfPlayers": 2, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 4, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    roles = ["Merlin", "Percival", "Generic Good Guy", "Assassin", "Morgana", "Generic Good Guy", "Generic Bad Guy"];
  }
  else if(numPlayers == 8)
  {
    quest1 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 5, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 5, "failsRequired": 1, "votingTrack": 0, "success": null};
    roles = ["Merlin", "Percival", "Generic Good Guy", "Assassin", "Morgana", "Generic Good Guy", "Generic Bad Guy", "Generic Good Guy"];
  }
  else if(numPlayers == 9)
  {
    quest1 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 5, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 5, "failsRequired": 1, "votingTrack": 0, "success": null};
    roles = ["Merlin", "Percival", "Generic Good Guy", "Assassin", "Morgana", "Generic Good Guy", "Generic Bad Guy", "Generic Good Guy", "Generic Good Guy"];
  }
  else
  {
    quest1 = {"numberOfPlayers": 3, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest2 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest3 = {"numberOfPlayers": 4, "failsRequired": 1, "votingTrack": 0, "success": null};
    quest4 = {"numberOfPlayers": 5, "failsRequired": 2, "votingTrack": 0, "success": null};
    quest5 = {"numberOfPlayers": 5, "failsRequired": 1, "votingTrack": 0, "success": null};
    roles = ["Merlin", "Percival", "Generic Good Guy", "Assassin", "Morgana", "Generic Good Guy", "Generic Bad Guy", "Generic Good Guy", "Generic Good Guy", "Generic Bad Guy"];
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
