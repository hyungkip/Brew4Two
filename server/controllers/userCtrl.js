var jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');
var db = require('../db/database.js');


module.exports = {
  signup: function(req, res) {
    console.log('inside userCtrl.signup');
    db.users.insert(req.body, function(err, doc) {
      if(err) {
        console.log(err);
      }
    });
    res.send('/signin');
  },

  renderSignin: function(req, res) {
    res.render('/signin');
  },

  signin: function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    db.users.find({email:email, password: password}, function(err, exists){
      if(!exists.length){
        res.send(false);
      }

      else {
        var payload = { email: email, password: password};
        var secret = 'brewed';

        // encode token
        var token = jwt.encode(payload, secret);

        res.send(token);
      }
    });
  }
};
