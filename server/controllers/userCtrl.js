var jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');
var db = require('../db/database.js');


module.exports = {
  signup: function(req, res) {
    var password = req.body.password;
    var username = req.body.username;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    req.body.password = hash;

    db.users.find({username: username}, function(err, exists) {
      if(!exists.length){
        db.users.insert(req.body, function(err, doc) {
          if(err){
            console.log(err);
          }
        });
      }
      else {
        console.log(err);
      }
    });

    res.send('/signin');
  },

  renderSignin: function(req, res) {
    res.render('/signin');
  },

  signin: function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    db.users.find({username: username}, function(err, exists) {
      if(!exists.length){
        res.send(false);
      }

      else {
        if(bcrypt.compareSync( password, exists[0].password)){
          var payload = { username: username, password: password};
          var secret = 'brewed';

          // encode token
          var token = jwt.encode(payload, secret);

          res.send(token);
        }
        else{
          res.send(false);
        }

      }
    });
  }
};