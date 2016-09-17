var React = require('react');
//var DefaultLayout = require('../layouts/default');

class TitleContainer extends React.Component{
  /*getInitialState () {
    return {create: false, join: false};
  },
  createClicked () {
    this.setState({create: true, join: false});
  },
  joinClicked () {
    this.setState({create: false, join: true});
  },
  backClicked () {
    this.setState({create: false, join: false});
  },*/
  render () {
    if(!this.state.create && !this.state.join)
    {
      return (
        <DefaultLayout>
          <div id = "titlecontainer" className = "contentcontainer">
            <button className = "btn btn-lg btn-secondary" id="createbtn" onClick = {this.createClicked}>Create</button>
            <button className = "btn btn-lg btn-secondary" id="joinbtn" onClick = {this.joinClicked}>Join</button>
          </div>
        </DefaultLayout>
      );
    }
    else if(this.state.create && !this.state.join)
    {

      return (
        <DefaultLayout>
          <div id = "createUI" className = "contentcontainer">
            <form id = "createRoom" method = "post" action = "/createRoom">
              <input type = "text" className = "form-control" id="createName" name = "name" placeholder="Enter your name"></input>
              <input type = "submit" className = "btn btn-lg btn-secondary" id="submitbtn" value = "Create Room"></input>
            </form>
            <button className = "btn btn-lg btn-secondary" id="backbtn" onClick = {this.backClicked}>Back</button>
          </div>
        </DefaultLayout>
      );
    }
    else if(!this.state.create && this.state.join)
    {
      return (
        <DefaultLayout>
          <div id = "joinUI" className = "contentcontainer">
            <form id = "joinRoom" method = "post" action = "/joinRoom">
              <input type = "text" className = "form-control" id="accessCode" placeholder="Enter your access code"></input>
              <input type = "text" className = "form-control" id="joinName" placeholder="Enter your name"></input>
              <input type = "submit" className = "btn btn-lg btn-secondary" id="submitbtn" value = "Join Room"></input>
            </form>
            <button className = "btn btn-lg btn-secondary" id="backbtn" onClick = {this.backClicked}>Back</button>
          </div>
        </DefaultLayout>
      );
    }
    else {
      console.log("ERROR");
      return (
        ERROR
      );
    }
  }
}

/*ReactDOM.render(
  <div>
    <h1 id = "title">THE RESISTANCE</h1>
    <TitleContainer />
  </div>,
  document.getElementById('container')
);*/
