angular.module('brew.cafelist', [])

.controller('cafeListCtrl', [
  '$scope',
  '$http',
  '$window',
  '$location',
  function($scope, $http, $window, $location) {
    $scope.newAppointment = {};
    $scope.selected = false;
    $scope.creatingAppointment = true;

    $scope.mouseOn = function(shopId) {
      // console.log('hovered over shopId: ', shopId);
      $scope.highlightMarker(shopId);
    };
    $scope.mouseOff = function(shopId) {
      // console.log('hovered over shopId: ', shopId);
      $scope.unHighlightMarker(shopId);
    };

    // shows available coffee shop appointments in the left sidebar
    $scope.toggleCoffeeShopAppointments = function(shopId) {
      $scope.selected = !$scope.selected;
      $http.post('/getAppointments', { id: shopId }).success(function(res) {
        $scope.appointmentList = res;
      });
    };

    // filter returns the appointmentStatus for everything except 'scheduled' ones
    // this is used to only show appointment statuses of null and pending handled in the ng-filter
    $scope.statusFilter = function(apptStat) {
      if(apptStat !== 'scheduled') {
        return apptStat;
      }
    };


    $scope.createNewAppointment = function(shopId) {
    if($scope.selected === false) {
      $scope.toggleCoffeeShopAppointments(shopId);
    }
  };

// checks if user is signed in
// if so, this makes a new appointment in the appointments table
  $scope.addNewAppointment = function(shop) {
    var hostId = $window.localStorage.getItem('com.brewed');
    if(!hostId) {
      $location.path('/signin');
    }

    else {
      $scope.newAppointment.id = shop.id;
      $scope.newAppointment.shop = shop;
      $scope.newAppointment.host_id = hostId;
      $scope.newAppointment.guest_id = null;
      $scope.newAppointment.guests = [];
      $scope.newAppointment.appointmentStatus = null;

      var appointmentMaker = function() {
        $http.post('/createAppointment', $scope.newAppointment).success(function(req, res){
          // $scope.newAppointment.firstName = res.firstName;
          // $scope.newAppointment.firstName = res.lastName;
          // $scope.newAppointment.profilePicture = res.profilePicture;
          // $scope.newAppointment.bio = res.bio;
          // $scope.toggleCoffeeShopAppointments();

          if(req === true){
            $http.post('/getAppointments', { id: shop.id }).success(function(res){
              $scope.appointmentList = res;
            });
          }
          else{
            alert('You already have an appointment of that date and time!');
          }

        });
      }

      var formatDateandTimeProperly = function(date) {
        //BUG - date will display as one day before, so this line fixes it
        appointmentDay.setDate(appointmentDay.getDate() + 1);


        var date = appointmentDay.toDateString();
        $scope.newAppointment.day = date;

        var time = $scope.newAppointment.timeee.toString();
        if(time.indexOf('-') !== -1){
          $scope.newAppointment.time = $scope.newAppointment.timeee.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
        }

        // var months = { "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sept", "10": "Oct", "11": "Nov", "12": "Dec" };
        // var year = date[0];
        // var month = months[date[1]];
        // var day = date[2];

        // $scope.newAppointment.day = month + ' ' + day + ', ' + year + ' ';
      };
            var currentDay = new Date();
            var currentMonth = currentDay.getMonth();
            var currentYear = currentDay.getYear();
            var currentDate = currentDay.getDate();
            var appointmentDay = new Date($scope.newAppointment.dayyy);
            var appointmentMonth = appointmentDay.getMonth();
            var appointmentYear = appointmentDay.getYear();
            var appointmentDate = appointmentDay.getDate() + 1;
            var temp_time = new Date($scope.newAppointment.timeee).setFullYear(1, 0, 1);
            var now = new Date().setFullYear(1, 0, 1);
            console.log("HELLO");
            if (appointmentMonth === currentMonth && appointmentYear === currentYear && appointmentDate === currentDate) {
              if (now >= temp_time) {
                console.log("DATE IS SAME, TIME IS INVALID");
                alert("Pick a time that is in the future, not the past");
              }
              else {
                console.log("DATE IS SAME, TIME IS VALID");
                formatDateandTimeProperly();
                appointmentMaker();
              }
            }
            else if (appointmentMonth < currentMonth || appointmentYear < currentYear || (appointmentMonth === currentMonth && appointmentDate < currentDate)) {
              alert("Pick a time that is in the future, not the past");
            }
            else {
              console.log("VALIDDD");
              formatDateandTimeProperly();
              appointmentMaker();
            }
    }
  };

  // sweetalert pop-up box when joining appointments
  $scope.requestToJoin = function(thisAppointment) {
    console.log("this is the appointment list item", $scope.appointmentList[thisAppointment]);
    var hostId = $window.localStorage.getItem('com.brewed');
    $http.post('/sendJoinRequest', { token: hostId, appointment: $scope.appointmentList[thisAppointment] })
      .success(function(joined) {
        if (!joined) {
          swal({
            title: "Are you sure you want to join?",
            type: "",
            showCancelButton: true,
            confirmButtonColor: "forestgreen",
            confirmButtonText: "Yes!",
            closeOnConfirm: false
          }, function() {
            swal("Request sent!", "The host has recieved your request to join.", "success");
          });
        } else {
          sweetAlert("Oops...", "You have already joined this appointment", "error");
        }
      });
  };
}]);
