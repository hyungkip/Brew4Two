angular.module('brew.auth', [])

.controller('AuthCtrl', function($scope, $window, $location, $http){

  // authenticates by checking if there is a token
  $scope.isAuth = function(){
    return Boolean($window.localStorage.getItem('com.brewed'));
  };

  // post request to server and sends user info taken from the signup page's ng-model
  $scope.signup = function(){
    $http.post('/signup', $scope.newUser).success(function(response){
      $location.path('/signin');
    });
  };

  // post request to server and sends over user info taken from the singin page's ng-model
  $scope.signin = function(){
    console.log($scope.user);
    $http.post('/signin', $scope.user).success(function(response){
      // if a token comes back, redirect to home
      if(response){
        $window.localStorage.setItem('com.brewed', response);
        $location.path('/home');
      }
      // if no token, redirect to signin
      else {
        sweetAlert("Oops...", "Email or password is incorrect", "error");
      }
    });
  };

  // removes token when logout is clicked
  $scope.signout = function(){
    $window.localStorage.removeItem('com.brewed');
    $location.path('/home');
  };
});
