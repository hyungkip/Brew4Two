var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

require('./routes/routes.js')(app, express);

app.listen(port, function() {
  console.log('http://localhost:' + port);
});

module.exports = app;
