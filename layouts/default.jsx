var React = require('react');

class DefaultLayout extends React.Component {
  render () {
    return (
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
        <link href="https://fonts.googleapis.com/css?family=Raleway:200,300,400" rel="stylesheet">
        <script src="https://code.jquery.com/jquery.js"></script>
        <script src="https://unpkg.com/react@15.3.1/dist/react.js"></script>
        <script src="https://unpkg.com/react-dom@15.3.1/dist/react-dom.js"></script>
        <script src="https://unpkg.com/babel-core@5.8.38/browser.min.js"></script>
        <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
        <link href="css/entry.css" rel="stylesheet">

        <script type="text/javascript" src="js/bootstrap.min.js"></script>
        <title>THE RESISTANCE</title>
      </head>
      <body>
        <center>
          <div id = "container">
            <h1 id = "title">THE RESISTANCE</h1>
            {this.props.children}
          </div>
        </center>


        <!-- app.js is where all the client-side Anagrammatix game logic -->
      </body>
      </html>

    );
  }
}

module.exports = DefaultLayout;
