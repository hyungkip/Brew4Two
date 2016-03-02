var jsonParser = require('body-parser').json();

var userController = require('../controllers/userCtrl.js');
var apptController = require('../controllers/appointmentCtrl.js');

module.exports = function(app, express) {
  app.use(jsonParser);

  app.use('/', express.static(__dirname + '../../app'));

//appointments controller
  app.post('/createAppointment', jsonParser, '....');
  app.post('/getAppointments', jsonParser, '....');
  app.post('/filterAppointments', jsonParser, '...');
  app.post('/sendJoinRequest', jsonParser, '...');
  app.get('/fetchAppointmentsDashboardData', jsonParser, '...');
  app.post('/acceptAppt', jsonParser, '....');
  app.post('/denyAppt', jsonParser, '....');

//user controller
  app.post('/signup', jsonParser, userController.signup);
  app.get('/signin', jsonParser, userController.renderSignin);
  app.post('/signin', jsonParser, userController.signin);


};
