var styleArray = [{
  "featureType": "administrative",
  "elementType": "labels.text.fill",
  "stylers": [{
    "color": "#cd50ff"
  }]
},
{
  "featureType": "landscape",
  "elementType": "all",
  "stylers": [{
    "color": "#fcf4ff"
  }]
},
{
  "featureType": "poi",
  "elementType": "all",
  "stylers": [{
    "visibility": "off"
  }]
},
{
  "featureType": "road",
  "elementType": "all",
  "stylers": [{
      "saturation": -100
    },
    {
      "lightness": 45
    }
  ]
},
{
  "featureType": "road.highway",
  "elementType": "all",
  "stylers": [{
    "visibility": "simplified"
  }]
},
{
  "featureType": "road.arterial",
  "elementType": "labels.icon",
  "stylers": [{
    "visibility": "off"
  }]
},
{
  "featureType": "transit",
  "elementType": "all",
  "stylers": [{
    "visibility": "off"
  }]
},
{
  "featureType": "water",
  "elementType": "all",
  "stylers": [{
      "color": "#f7e5ff"
    },
    {
      "visibility": "on"
    }
  ]
}
]

var mapOptions = {
  center: new google.maps.LatLng(40.7128, 74.0060),
  zoom: 7,
  styles: styleArray,
  scrollwheel: false,
  backgroundColor: '#e5ecff',
  mapTypeControl: false,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map = new google.maps.Map(document.getElementsByClassName("map")[0],
mapOptions);
var myLatlng = new google.maps.LatLng(40.7128, 74.0060);
var focusplace = {lat: 40.7128, lng: 74.0060};
