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
    var guestsArr = appointment.guests;

    //attempting to add the entire user object to the appointment, as opposed to just the username
    // if no guests in the guests array, add current user's username into the guest array
    if(!guestsArr.length){
      db.users.find(currentUserId, function(err, userData) {
        db.appointments.update({time: appointment.time}, { $set: { appointmentStatus: 'pending' }, $push: { guests: userData } }, function(){
          res.send(false);
        });
      });
    }

    // if guests array has items, loop throug hand check if user's username is in there
    else {
      for(var i = 0; i < guestsArr.length; i++){
        // if user's username is in the guest array, respond with true
        if(guestsArr[i] === username){
          res.send(true);
        }
      }


      // if user's username is not in the guest array, respond with false
      db.appointments.update({time: appointment.time}, { $set: { appointmentStatus: 'pending' }, $push: { guests: username } });
      res.send(false);
    }
  },

  fetchDashboardData: function() {
    db.appointments.find({}, function(err, appts){
      res.send(appts);
    });
  },

  acceptAppt: function() {
    db.appointments.update({time: req.body.time}, { $set: { appointmentStatus: 'scheduled', guests: [], acceptedGuest: req.body.username }}, function(err, appt){
      res.send(true);
    });
  },

  denyAppt: function() {
    db.appointments.update({time: req.body.time}, {appointmentStatus: 'pending'}, { $pullAll: { guests: [req.body.username] } }, function(err, appt){
      res.send(true);
    });
  }

};
