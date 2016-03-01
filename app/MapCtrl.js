angular.module('brew.map', ['ui.bootstrap.datetimepicker'])
.controller('MapCtrl', function ($scope) {
  var map;
  var infowindow;
  var coffeeShops = [];

  $scope.coffeeShops = [];
  $scope.hasLocation = false;

// creates markers to designate coffee shops
  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
    var photo;
    var openNow;

    if(place.photos){
      photo = place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500});
    } else {
      photo = place.icon;
    }

    if(place.opening_hours){
      if(place.opening_hours.open_now) {
        openNow = 'Open';
      } else {
        openNow = 'Closed';
      }
    }else{
      openNow = 'Unsure';
    }

// creates html element in infowindow
    var content = '<img class="showhover"src="'+photo+'">' + '<h2>' + place.name + '</h2>'+ '<p>' + place.formatted_address + '</p>' + '<p class="opening-hours">' + openNow + '</p>' + '<p>' + 'Rating: ' + place.rating + '</p>';

// infowindow shows on click
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(content);
      infowindow.open(map, marker);
    });

    if(place.photos !== undefined){
      coffeeShops.push(place);
    }
  }

// callback that is passed to the map in order to generate markers on coffee shops
  function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {

      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
        if(results[i].photos){
          results[i]. shopImage = results[i].photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500});
        }else{
          results[i]. shopImage = results[i].icon;
        }
        $scope.coffeeShops.push(results[i]);
        $scope.$apply();
      }
    }
  }

// creates the coffee shop map
  function initMap() {
    if (navigator.geolocation) {
      var thislat;
      var thislng;
      navigator.geolocation.getCurrentPosition(function(position) {
        thislat = position.coords.latitude;
        thislng = position.coords.longitude;
        $scope.hasLocation = true;
        if(thislat === undefined){
          thislat = 43.8833;
        }
        if(thislng === undefined){
          thislng = -79.2500;
        }

        $scope.noLocation = false;
        var santaMonica = {lat: thislat, lng: thislng};
        santaMonica.lng = santaMonica.lng - '.024';
        map = new google.maps.Map(document.getElementById('map'), {
          center: santaMonica,
          zoom: 14
        });

        infowindow = new google.maps.InfoWindow();

        var service = new google.maps.places.PlacesService(map);
        service.textSearch({
          location: santaMonica,
          radius: 2000,
          types: ['cafe', 'restaurant', 'food', 'store', 'establishment', 'meal_takeaway', 'point_of_interest'],
          query: ['coffee']
        }, callback);
      });
    } else {
      var santaMonica = {lat: 43.8833, lng: -79.2500};

      map = new google.maps.Map(document.getElementById('map'), {
        center: santaMonica,
        zoom: 14
      });

      infowindow = new google.maps.InfoWindow();
      var service = new google.maps.places.PlacesService(map);

// filters out only coffee shops
      service.textSearch({
        location: santaMonica,
        radius: 3000,
        types: ['cafe', 'restaurant', 'food', 'store', 'establishment', 'meal_takeaway', 'point_of_interest'],
        query: ['coffee']
      }, callback);
    }
  }

// initializes the map
  initMap();
});
