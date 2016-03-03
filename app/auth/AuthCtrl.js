angular.module('brew.auth', [])

.controller('AuthCtrl', function($scope, $window, $location, $http, Auth){

// authenticates by checking if there is a token
$scope.isAuth = function(){
  return Boolean($window.localStorage.getItem('com.brewed'));
};

// post request to server and sends user info taken from the signup page's ng-model
$scope.signup = function(){
  $scope.newUser.profilePicture = $scope.newUser.profilePicture || 'http://www.catnipcamera.com/wp-content/uploads/2012/03/DSCN7973-L.jpg';
  $http.post('/signup', $scope.newUser).success(function(response){
    if (response === false) {
      swal('Username exists', 'Please choose another username.','error');
    } else {
      $location.path('/signin');
    }
  });
};

// post request to server and sends over user info taken from the singin page's ng-model
$scope.signin = function(){

  $http.post('/signin', $scope.user).success(function(response){
// if a token comes back, redirect to home
if(response){
  $window.localStorage.setItem('com.brewed', response);
  $location.path('/home');
}
else {
  swal("Oops...", "Username or password is incorrect", "error");
}
});
};

// removes token when logout is clicked
$scope.signout = function(){
  $window.localStorage.removeItem('com.brewed');
  $location.path('/home');
};
});
