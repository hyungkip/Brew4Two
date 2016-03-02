var mongojs = require('mongojs');
var db = mongojs('brewfortwo', ['users', 'appointments']);

if (process.env.MONGOLAB_URI) {
  db = mongojs(process.env.MONGOLAB_URI, ['users', 'appointments']);
}

module.exports = db;
