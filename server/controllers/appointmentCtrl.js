var jwt = require('jwt-simple');
var db = require('../db/database.js');
var _ = require('underscore');

module.exports = {

  createAppt: function(req, res) {
    // decodes user token and fetches user first and last name in users table
    var token = req.body.host_id;
    var secret = "brewed";
    var decoded = jwt.decode(token, secret);

    // adds the below properties onto the request to post to appointments table
    db.users.find( {username: decoded.username}, function(err, appt){
      req.body.firstName = appt[0].first;
      req.body.lastName = appt[0].last;
      req.body.username = decoded.username;
      req.body.profilePicture = appt[0].profilePicture;
      req.body.bio = appt[0].bio;
      db.appointments.insert(req.body, function(err, doc){
        res.send(true);
      });
    });
  },

  getAppts: function(req, res) {
    // shopId is in the request
    var shopId = {
      id: req.body.id
    };

    db.appointments.find(shopId, function(err, appts){
      res.send(appts);
    });
  },

  filterAppts: function(req, res) {
    var currentUserId = req.body.token;
    var secret = "brewed";
    var username = jwt.decode(currentUserId, secret).username;

    // stores appointments in an object to send to controller
    var filteredAppointments = {
      confirmed: [],
      hosting: [],
      requested: []
    };


    db.appointments.find({}, function(err, doc){
      console.log(doc);
      for( var i = 0; i < doc.length; i++ ){
        // if user's username is in the appointments' "username" property, user is the host
        // case: user is a host or a guest and appointment status is scheduled = confirmed appointment
        if ( (doc[i].username === username || _.contains(doc[i].guests, username) === true ) && doc[i].appointmentStatus === 'scheduled' || doc[i].acceptedGuest === username){
          filteredAppointments.confirmed.push(doc[i]);
        }

        // case: user is the host
        if(doc[i].username === username && doc[i].guests.length >= 0 && doc[i].appointmentStatus !== 'scheduled'){
          filteredAppointments.hosting.push(doc[i]);
        }

        // case: user is not the host, and is a guest, and appointment status is pending = requested appointment
        if(doc[i].username !== username && _.contains(doc[i].guests, username) === true && doc[i].appointmentStatus === 'pending'){
          filteredAppointments.requested.push(doc[i]);
        }
      }

      res.send(filteredAppointments);
    });
  },

  joinAppt: function(req, res) {
    var currentUserId = req.body.token;
    var secret = "brewed";
    var username = jwt.decode(currentUserId, secret).username;
    var appointment = req.body.appointment;
    // var guestsArr = appointment.guests;

    // if(_.indexOf(username, guestsArr) === -1) {
    //   res.send(true);
    // } else {
      db.users.find({username: username}, function(err, userData) {

        db.appointments.update({time: appointment.time}, { $set: { appointmentStatus: 'pending' }, $pushAll: { guests: userData } }, function(){
          res.send(false);
        });
      });
    // }
  },

  fetchDashboardData: function() {
    db.appointments.find({}, function(err, appts){
      res.send(appts);
    });
  },

  acceptAppt: function(req, res) {
    db.appointments.update({time: req.body.time}, { $set: { appointmentStatus: 'scheduled', guests: [], acceptedGuest: req.body.username }}, function(err, appt){
      res.send(true);
    });
  },

  denyAppt: function(req, res) {
    db.appointments.update({time: req.body.time}, {appointmentStatus: 'pending'}, { $pullAll: { guests: [req.body.username] } }, function(err, appt){
      res.send(true);
    });
  }

};
