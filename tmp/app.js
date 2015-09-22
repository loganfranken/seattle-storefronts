var fs = require('fs')
require('fastclick')(document.body)
var Handlebars = require('handlebars')
var eve = require('dom-events')
var elClass = require('element-class')
var L = window.L = require('leaflet')
L.mapbox = require('mapbox.js')

var infoEl = document.getElementById('info')
var mapEl = document.getElementById('map')
var pageEl = document.getElementById('page')

/* pull in template for showing info about a location */
var template = Handlebars.compile(fs.readFileSync('templates/location.html'))
var info = Handlebars.compile(fs.readFileSync('templates/info.html'))
var shunpike = fs.readFileSync('templates/shunpike.html')

/* set image path and mapbox access token */
L.Icon.Default.imagePath = 'img/leaflet'
L.mapbox.accessToken = 'pk.eyJ1Ijoic2V0aHZpbmNlbnQiLCJhIjoiSXZZXzZnUSJ9.Nr_zKa-4Ztcmc1Ypl0k5nw';

var map = L.mapbox.map('map', 'mapbox.streets')
    .setView([0, 0], 3);
    
/*

var map = L.map(mapEl, {
  accessToken: 'pk.eyJ1Ijoic2V0aHZpbmNlbnQiLCJhIjoiSXZZXzZnUSJ9.Nr_zKa-4Ztcmc1Ypl0k5nw',
})

var tiles = 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken
var tileLayer = L.mapbox.tileLayer(tiles, {
  attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
})

tileLayer.addTo(map)
map.setView([47.6224, -122.336], 16)
*/
/* Pull in locations from json file */
var locations = require('./locations.json')
var l = locations.length
var i = 0

/* add locations to map */
for (i; i < l; i++) {
  addMarker(locations[i])
}

/* add a marker to map from json data */
function addMarker (row) {
  var latlng = { lat: row['latitude'], lng: row['longitude'] }
  var html = template(row)

  var marker = L.marker(latlng)
  marker.addTo(map)

  marker.on('click', function (e) {
    var modal = document.createElement('div')
    modal.className = 'modal'
    modal.innerHTML = html
    pageEl.appendChild(modal)
    var inner = document.querySelector('.location-info')

    if (window.innerWidth < 700) inner.style.height = window.innerHeight - 120 + 'px'
    else inner.style.height = window.innerHeight - 40 + 'px'

    var close = document.getElementById('close-modal')
    eve.on(close, 'click', function (e) {
      pageEl.removeChild(modal)
      e.preventDefault()
    })
  })
}

/* The Shunpike pin */
var marker = L.mapbox.marker({ lat: '47.600482', lng: '-122.331237' })
marker.addTo(map)

marker.on('click', function (e) {
  var modal = document.createElement('div')
  modal.className = 'modal'
  modal.innerHTML = shunpike
  pageEl.appendChild(modal)
  var close = document.getElementById('close-modal')

  eve.on(close, 'click', function (e) {
    pageEl.removeChild(modal)
    e.preventDefault()
  })
})

/* create infobox toggle for mobile */
var infobox = document.getElementById('infobox')
var toggle = document.getElementById('infobox-toggle')

eve.on(toggle, 'click', function (e) {
  if (elClass(toggle).has('active')) {
    elClass(toggle).remove('active')
    elClass(infobox).remove('active')
    toggle.innerHTML = '+ open'
  } else {
    elClass(toggle).add('active')
    elClass(infobox).add('active')
    toggle.innerHTML = 'x close'
  }
  e.preventDefault()
})

window.onresize = function (e) {
  resizeMap()
}

function resizeMap () {
  if (window.innerWidth >= 700) {
    mapEl.style.width = (window.innerWidth - infoEl.offsetWidth) + 'px'
  } else {
    if (mapEl.style.width !== '100%') {
      mapEl.style.width = '100%'
    }
  }
}

resizeMap()