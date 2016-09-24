// Initialize Firebase
var config = {
    apiKey: "AIzaSyASWHPr5WrC15fXp9eATC9lPr13-Jzaxlg",
    authDomain: "neighborhood-map-144303.firebaseapp.com",
    databaseURL: "https://neighborhood-map-144303.firebaseio.com",
    storageBucket: "neighborhood-map-144303.appspot.com",
    messagingSenderId: "34948729715"
};
firebase.initializeApp(config);

var dbRef = firebase.database().ref().child('DonnerList');
var locations = [];
var map;
// A blank array for all the listing markers.
var markers = [];
var initMap = function() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: {
                lat: 27.2053908,
                lng: 77.5003091
            },
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_CENTER
            },
        });
        // These are the real estate listings that will be shown to the user.
        // Normally we'd have these in a database instead.
        window.largeInfowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            var position = locations[i].location;

            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: locations[i].group,
                animation: google.maps.Animation.DROP,
                id: i
            });

            marker.info = locations[i]
                // Push the marker to our array of markers.
            markers.push(marker);

            locations[i].marker = marker
                // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
                toggleBounce(this);
            });

            bounds.extend(markers[i].position);
        }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
    }
    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
function populateInfoWindow(marker, infoWindow) {
    if (infoWindow.marker != marker) {
        infoWindow.marker = marker;
        infoWindow.setContent('<div> Name: ' + marker.info.name + '<br> Address: ' + marker.info.address +
            '<br> Blood Group: ' + marker.info.group + '<br> Mobile ' + marker.info.mobile + '</div>');
        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function() {
            //infoWindow.setMarker(null);
        });
    }
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setAnimation(null);
        }
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

var viewModel = function() {
    this.locationsList = ko.observableArray(locations);
    this.openWindow = function(location) {
        populateInfoWindow(location.marker, largeInfowindow);
        toggleBounce(location.marker);
    }

    this.query = ko.observable('');
    this.filteredList = ko.computed(function() {
        var filter = this.query().toLowerCase();
        if (!filter) {
            return this.locationsList();
        } else {
            return ko.utils.arrayFilter(this.locationsList(), function(item) {
                var match = item.address.toLowerCase().indexOf(filter) >= 0;
                item.marker.setVisible(match); // maps API hide call
                return match;
            });
        }
    }, this);

    filterMarkers = function(category) {
        for (i = 0; i < markers.length; i++) {
            marker = markers[i];
            // If is same category or category not picked
            if (marker.title == category || category.length === 0) {
                marker.setVisible(true);
            }
            // Categories don't match
            else {
                marker.setVisible(false);
            }
        }
    }
}

dbRef.once('value').then(function(data) {
    locations = data.val();
    initMap();
    ko.applyBindings(new viewModel());
});

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
