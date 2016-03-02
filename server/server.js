var express = require('express');

var app = express();

require('./routes/routes.js')(app, express);

var port = process.env.PORT || 8000;

app.listen(port, function() {
  console.log('http://localhost:' + port);
});

module.exports = app;
