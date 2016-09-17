var React = require('react');
var WaitingListEntry = require('./WaitingListEntry.js');

module.exports = WaitingList = React.createClass({
  getInitialState: function(props){

    props = props || this.props;

    // Set initial application state using props
    var count = props.players.length;
    return {
      players: props.players,
      numPlayers: count
    };

  },
  render: function(){
    var content = this.props.players.map(function(player){
      return (
        <WaitingListEntry name = {player.name} />
      )
    });
    return (
      <table class = "table" style="width:100%; min-width: 400px; margin-top: 30px;">
        <thead>
          <tr>
            <th>Current Players: {this.state.numPlayers}/10</th>
          </tr>
        </thead>
        {{#each players}}
        <tr>
          <td>
            {{name}}
          </td>
        </tr>
        {{/each}}
      </table>
    )

  }
});
