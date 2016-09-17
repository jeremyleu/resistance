var React = require('react');

module.exports = WaitingListEntry = React.createClass({
  render: function(){
    var name = this.props.name;
    return (
      <tr>
        <td>
          {name}
        </td>
      </tr>  
    )
  }
});
