angular.module('brew.map', ['ui.bootstrap.datetimepicker'])
.controller('MapCtrl', function ($scope) {
  var map;
  var infowindow;
  var coffeeShops = [];

  $scope.coffeeShops = [];
  $scope.hasLocation = false;

  var markers = [];

  $scope.highlightMarker = function(shopId) {
    for (var i=0; i<markers.length; i++) {
      if (shopId === markers[i].id) {
        markers[i].setAnimation(google.maps.Animation.BOUNCE);
      }
    }
  }

  $scope.unHighlightMarker = function(shopId) {
    for (var i=0; i<markers.length; i++) {
      if (shopId === markers[i].id) {
        markers[i].setAnimation(null);
      }
    }
  }

  // creates markers to designate coffee shops
  function createMarker(place) {
    // console.log(place);
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      id: place.id
    });
    markers.push(marker);
    var photo;
    var openNow;

    if (place.photos) {
      photo = place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500});
    } else {
      photo = place.icon;
    }

    if (place.opening_hours) {
      if (place.opening_hours.open_now) {
        openNow = 'Open';
      } else {
        openNow = 'Closed';
      }
    } else {
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
  function listResults(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // clears the previous results
      $scope.coffeeShops = [];
      
      // clears all previous markers
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
        markers[i] = null;
      }
      markers = [];

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
        var thisLoc = {lat: thislat, lng: thislng};
        thisLoc.lng = thisLoc.lng - '.024';
        map = new google.maps.Map(document.getElementById('map'), {
          center: thisLoc,
          zoom: 14
        });

        infowindow = new google.maps.InfoWindow();

        var service = new google.maps.places.PlacesService(map);
        
        searchCoffeeShops(service, thisLoc);

        google.maps.event.addListener(map, 'dragend', function() {
          var newLng = map.center.lng() + .03;
          var newCenter = {lat: map.center.lat(), lng: newLng};
          searchCoffeeShops(service, newCenter);
        });
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
      searchCoffeeShops(service, santaMonica);

      google.maps.event.addListener(map, 'dragend', function() {
        var newLng = map.center.lng() + .03;
        var newCenter = {lat: map.center.lat(), lng: newLng};
        searchCoffeeShops(service, newCenter);
      });
    }
  }

  function searchCoffeeShops(service, location) {
    service.textSearch({
      location: location,
      radius: 2000,
      types: ['cafe', 'restaurant', 'food', 'store', 'establishment', 'meal_takeaway', 'point_of_interest'],
      query: ['coffee']
    }, listResults);
  }

// initializes the map
  initMap();
});
