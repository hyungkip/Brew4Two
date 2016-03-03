var jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');
var db = require('../db/database.js');


module.exports = {
  signup: function(req, res) {
    var password = req.body.password;
    var username = req.body.username;

    var salt = bcrypt.genSaltSync(10);
    req.body.password = bcrypt.hashSync(password, salt)

    db.users.find({username: username}, function(err, exists) {
      if(!exists.length){
        db.users.insert(req.body, function(err, doc) {
          console.log('++line 17 inside userCtrl.js upon user insertion', req.body);
          // if(err){
          //   console.log('++line 19 inside userCtrl.js !exists.length',err);
          // }
        });
          res.send('/signin');
      }
      else {
        console.log('++line 25 inside userCtrl.js else');
        res.send(false);
      }
    });

  },

  renderSignin: function(req, res) {
    res.render('/signin');
  },

  signin: function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    db.users.find({username: username}, function(err, exists) {
      if(!exists.length) {
        res.send(false);
      }

      else {
        if(bcrypt.compareSync( password, exists[0].password)) {
          var payload = {username: username, password: password};
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