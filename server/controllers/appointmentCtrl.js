var jwt = require('jwt-simple');
var db = require('../db/database.js');
var _ = require('underscore');

module.exports = {

  createAppt: function(req, res) {
    // decodes user token and fetches user first and last name in users table
    var token = req.body.host_id;
    var secret = "brewed";
    var decoded = jwt.decode(token, secret);

    db.appointments.find( { username: decoded.username, id: req.body.id, time: req.body.time, day: req.body.day }, function(err, found) {
      if (found.length) {
        res.send(false);
      } else {
        db.users.find( {username: decoded.username}, function(err, appt){
          req.body.firstName = appt[0].first;
          req.body.lastName = appt[0].last;
          req.body.email = appt[0].email;
          req.body.username = decoded.username;
          req.body.profilePicture = appt[0].profilePicture;
          req.body.bio = appt[0].bio;
          db.appointments.insert(req.body, function(err, doc){
            res.send(true);
          });
        });
      }
    });
  },

  getAppts: function(req, res) {
    // shopId is in the request
    var shopId = {
      id: req.body.id
    };

    db.appointments.find(shopId, function(err, appts) {
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
      requested: [],
      username: username
    };


    db.appointments.find({}, function(err, doc) {
      // console.log(doc);
      for (var i=0; i<doc.length; i++) {
        // if user's username is in the appointments' "username" property, user is the host
        // case: user is a host or a guest and appointment status is scheduled = confirmed appointment

        if(doc[i].username === username) {
          if(doc[i].appointmentStatus === 'scheduled') {
            filteredAppointments.confirmed.push(doc[i]);
          } else {
            filteredAppointments.hosting.push(doc[i]);
          }
        } else if(doc[i].appointmentStatus === 'scheduled' || doc[i].appointmentStatus === 'pending'){
          filteredAppointments.requested.push(doc[i]);
        }
      }

      // console.log(filteredAppointments.requested);
      res.send(filteredAppointments);
    });
  },

  joinAppt: function(req, res) {
    var currentUserId = req.body.token;
    var secret = "brewed";
    var username = jwt.decode(currentUserId, secret).username;
    var appointment = req.body.appointment;
    var guestsArr = appointment.guests;

    var isFound = false;

    // check if the event's guestList includes the one who is trying to join
    _.each(guestsArr, function(element) {
      if (element.username === username) {
        isFound = true;
      }
    });

    if(!isFound) {
      db.users.find({ username: username }, function(err, userData) {
        db.appointments.update({ id: appointment.id}, { $set: { appointmentStatus: 'pending' }, $pushAll: { guests: userData } }, function() {
          res.send(false);
        });
      });
    } else {
      res.send(true);
    }
  },

  fetchDashboardData: function() {
    db.appointments.find({}, function(err, appts){
      res.send(appts);
    });
  },

  acceptAppt: function(req, res) {
    console.log(req.body);
    db.appointments.update({id: req.body.id}, { $set: { appointmentStatus: 'scheduled', guests: [], acceptedGuest: req.body.username }}, function(err, appt) {
      res.send(true);
    });
  },

  denyAppt: function(req, res) {
    db.appointments.update({id: req.body.id}, {appointmentStatus: 'denied'}, { $pullAll: { guests: [req.body.username] } }, function(err, appt){
      res.send(true);
    });
  }

};
