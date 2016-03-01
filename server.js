var express     = require('express');
var mongojs     = require('mongojs');
var bodyParser     = require('body-parser');
var partial = require('express-partials');
var jwt = require('jwt-simple');
var _ = require('underscore');

// mongo database (database name = brewfortwo, tables = users, appointments)
if (process.env.MONGOLAB_URI) {
  var db = mongojs(process.env.MONGOLAB_URI, ['users', 'appointments']);
} else {
  // use local mongodb
  var db = mongojs('brewfortwo', ['users', 'appointments']);
}


var app = express();

app.use(express.static(__dirname+'/'));
app.use(bodyParser.json());


// posts appointment to appointments database
app.post('/createAppointment', function(req, res){
  // decodes user token and fetches user first and last name in users table
  var token = req.body.host_id;
  var secret = "brewed";
  var decoded = jwt.decode(token, secret);

  // adds the below properties onto the request to post to appointments table
  db.users.find(decoded, function(err, appt){
    req.body.firstName = appt[0].first;
    req.body.lastName = appt[0].last;
    req.body.email = decoded.email;
    req.body.profilePicture = appt[0].profilePicture;
    req.body.bio = appt[0].bio;
    db.appointments.insert(req.body, function(err, doc){
      res.send(true);
    });
  });
});

// finds appointments for a specific store by shopId
app.post('/getAppointments', function(req, res){
  // shopId is in the request
  var shopId = {
    id: req.body.id
  };

  db.appointments.find(shopId, function(err, appts){
    res.send(appts);
  });
});

// filters appointments by taking user token and checking if he/she is a host or guest and verifies appointment status
app.post('/filterAppointments', function(req, res){
  var currentUserId = req.body.token;
  var secret = "brewed";
  var email = jwt.decode(currentUserId, secret).email;

  // stores appointments in an object to send to controller
  var filteredAppointments = {
    confirmed: [],
    hosting: [],
    requested: []
  };


  db.appointments.find({}, function(err, doc){
    for( var i = 0; i < doc.length; i++ ){
      // if user's email is in the appointments' "email" property, user is the host
      // case: user is a host or a guest and appointment status is scheduled = confirmed appointment
      if ( (doc[i].email === email || _.contains(doc[i].guests, email) === true ) && doc[i].appointmentStatus === 'scheduled' || doc[i].acceptedGuest === email){
        filteredAppointments.confirmed.push(doc[i]);
      }

      // case: user is the host
      if(doc[i].email === email && doc[i].guests.length >= 0 && doc[i].appointmentStatus !== 'scheduled'){
        filteredAppointments.hosting.push(doc[i]);
      }

      // case: user is not the host, and is a guest, and appointment status is pending = requested appointment
      if(doc[i].email !== email && _.contains(doc[i].guests, email) === true && doc[i].appointmentStatus === 'pending'){
        filteredAppointments.requested.push(doc[i]);
      }
    }

    res.send(filteredAppointments);
  });
});


// creates a request to join an appointment (changes appointment status to "pending" and puts the current user in the appointment's "guest" array)
app.post('/sendJoinRequest', function(req, res){
  var currentUserId = req.body.token;
  var secret = "brewed";
  var email = jwt.decode(currentUserId, secret).email;
  var appointment = req.body.appointment;
  var guestsArr = appointment.guests;

// if no guests in the guests array, add current user's email into the guest array
  if(!guestsArr.length){
    db.appointments.update({time: appointment.time}, { $set: { appointmentStatus: 'pending' }, $push: { guests: email } }, function(){
      res.send(false);
    });
  }

// if guests array has items, loop throug hand check if user's email is in there
  else {
    for(var i = 0; i < guestsArr.length; i++){
      // if user's email is in the guest array, respond with true
      if(guestsArr[i] === email){
        res.send(true);
      }
    }

    // if user's email is not in the guest array, respond with false
    db.appointments.update({time: appointment.time}, { $set: { appointmentStatus: 'pending' }, $push: { guests: email } });
    res.send(false);
  }
});

// fetches all appointments and sends back to the controller
app.get('/fetchAppointmentsDashboardData', function(req, res){
  db.appointments.find({}, function(err, appts){
    res.send(appts);
  });
});

// posts the user's info in the users table
app.post('/signup', function(req,res){
  db.users.insert(req.body, function(err, doc){
    if(err){
      console.log(err);
    }
  });

  res.send('/signin');
});

// renders sign in
app.get('/signin', function(req, res){
  res.render('/signin');
});

// authenticates user's email in the database and assigns token if exists
// access to "appointments" page is handled in the controller
app.post('/signin', function(req, res){
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
});

// accepts a guest and adds the guest's email onto the appointment
app.post('/acceptAppt', function(req, res){
  db.appointments.update({time: req.body.time}, { $set: { appointmentStatus: 'scheduled', guests: [], acceptedGuest: req.body.email }}, function(err, appt){
    res.send(true);
  });
});

// denies a guest's request, and removes guest's email from the guests array
app.post('/denyAppt', function(req, res){
  db.appointments.update({time: req.body.time}, {appointmentStatus: 'pending'}, { $pullAll: { guests: [req.body.email] } }, function(err, appt){
    res.send(true);
  });
});


// sets up server on the process environment port or port 8000
app.listen(process.env.PORT || 8000);
console.log('server running on port 8000');
