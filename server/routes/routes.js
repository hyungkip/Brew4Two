var jsonParser = require('body-parser').json();

var userController = require('../controllers/userCtrl.js');
var apptController = require('../controllers/appointmentCtrl.js');

module.exports = function(app, express) {
  app.use(jsonParser);

  app.use('/', express.static(__dirname + './../../'));

//appointments controller
  app.post('/createAppointment', jsonParser, apptController.createAppt);
  app.post('/getAppointments', jsonParser, apptController.getAppts);
  app.post('/filterAppointments', jsonParser, apptController.filterAppts);
  app.post('/sendJoinRequest', jsonParser, apptController.joinAppt);
  app.get('/fetchAppointmentsDashboardData', jsonParser, apptController.fetchDashboardData);
  app.post('/acceptAppt', jsonParser, apptController.acceptAppt);
  app.post('/denyAppt', jsonParser, apptController.denyAppt);

//user controller
  app.post('/signup', jsonParser, userController.signup);
  app.get('/signin', jsonParser, userController.renderSignin);
  app.post('/signin', jsonParser, userController.signin);


};
