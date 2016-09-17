//var error = false;

$(function() {
  //error = $('#joinError').val();
  //console.log(error + " " + error.length);

  var IO = {

      /**
       * This is called when the page is displayed. It connects the Socket.IO client
       * to the Socket.IO server
       */
      init: function() {
          IO.socket = io.connect();
          IO.bindEvents();
      },

      /**
       * While connected, Socket.IO will listen to the following events emitted
       * by the Socket.IO server, then run the appropriate function.
       */
      bindEvents : function() {
          IO.socket.on('connected', IO.onConnected );
          IO.socket.on('newGameCreated', IO.onNewGameCreated );
          IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
      }
  }
});


//React.render(TitleContainer(props), document.getElementById('container'));
/*var TitleContainer = React.createClass({
  getInitialState: function () {
    //console.log(this.props.create + " | " + this.props.joinError);
    return {create: false, join: error};
  },
  createClicked: function () {
    this.setState({create: true, join: false});
  },
  joinClicked: function () {
    this.setState({create: false, join: true});
  },
  backClicked: function () {
    this.setState({create: false, join: false});
  },
  render: function() {
    if(!this.state.create && !this.state.join)
    {
      return (
        <div id = "titlecontainer" className = "contentcontainer">
          <button className = "btn btn-lg btn-secondary" id="createbtn" onClick = {this.createClicked}>Create</button>
          <button className = "btn btn-lg btn-secondary" id="joinbtn" onClick = {this.joinClicked}>Join</button>
        </div>
      );
    }
    else if(this.state.create && !this.state.join)
    {

      return (
        <div id = "createUI" className = "contentcontainer">
          <form id = "createRoom" method = "post" action = "/createRoom">
            <input type = "text" className = "form-control" id="createName" name = "name" placeholder="Enter your name"></input>
            <input type = "submit" className = "btn btn-lg btn-secondary" id="submitbtn" value = "Create Room"></input>
          </form>
          <button className = "btn btn-lg btn-secondary" id="backbtn" onClick = {this.backClicked}>Back</button>
        </div>
      );
    }
    else if(!this.state.create && this.state.join)
    {
      return (
        <div id = "joinUI" className = "contentcontainer">
          <form id = "joinRoom" method = "post" action = "/joinRoom">
            <input type = "text" className = "form-control" id="accessCode" name = "roomID" placeholder="Enter 4-digit access code"></input>
            <input type = "text" className = "form-control" id="joinName" name = "name" placeholder="Enter your name"></input>
            <input type = "submit" className = "btn btn-lg btn-secondary" id="submitbtn" value = "Join Room"></input>
          </form>
          <button className = "btn btn-lg btn-secondary" id="backbtn" onClick = {this.backClicked}>Back</button>
        </div>
      );
    }
    else {
      console.log("ERROR");
      return (
        ERROR
      );
    }
  }
});

ReactDOM.render(
  <div>
    <h1 id = "title">THE RESISTANCE</h1>
    <TitleContainer />
  </div>,
  document.getElementById('container')
);*/

/*<h1 id = "title">THE RESISTANCE</h1>
<div id = "titlecontainer" class = "contentcontainer">
  <!--<h2 class = "subtitle">WELCOME</h2>-->
  <button class = "btn btn-lg btn-secondary" id="createbtn">Create</button>
  <button class = "btn btn-lg btn-secondary" id="joinbtn">Join</button>
</div>
<div id = "createUI" class = "contentcontainer">
  <!--<h2 id = "subtitle">CREATE</h2>-->
  <form id = "createRoom" method = "post" action = "/createRoom" display="inline" style="width:100% ">
    <input type = "text" class = "form-control" id="name" placeholder="Enter your name"></input>
    <input type = "submit" class = "btn btn-lg btn-secondary" id="submitbtn"></input>
    <button class = "btn btn-lg btn-secondary" id="backbtn">Back</button>
  </form>
</div>*/
