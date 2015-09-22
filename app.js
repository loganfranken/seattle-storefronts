var L = window.L
var fs = require('fs')
var Handlebars = require('handlebars')
var eve = require('dom-events')
require('fastclick')(document.body)

L.mapbox.accessToken = 'pk.eyJ1Ijoic2V0aHZpbmNlbnQiLCJhIjoiSXZZXzZnUSJ9.Nr_zKa-4Ztcmc1Ypl0k5nw'
// Replace 'mapbox.streets' with your map id.
var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
  attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
})

var infoEl = document.getElementById('info')
var infoBoxEl = document.getElementById('infobox')
var mapEl = document.getElementById('map')
var pageEl = document.getElementById('page')

/* pull in template for showing info about a location */
var templates = {
  location: Handlebars.compile(fs.readFileSync('templates/location.html')),
  info: Handlebars.compile(fs.readFileSync('templates/info.html')),
  shunpike: fs.readFileSync('templates/shunpike.html')
}

var infodata = require('./info.json')[0]
infoBoxEl.innerHTML = templates.info(infodata)

var map = window.map = L.map(mapEl)
map.addLayer(mapboxTiles)
map.setView([47.6224, -122.337], 16)
if (window.innerWidth >= 700) resizeMap()

var locations = require('./locations.json')
var geojson = createGeoJSON(locations)
var markerLayer = L.mapbox.featureLayer().addTo(map)
markerLayer.setGeoJSON(geojson)

markerLayer.on('click', function (e) {
  var item = e.layer.feature.properties
  var modal = document.createElement('div')
  modal.className = 'modal'
  modal.innerHTML = templates.location(item)
  if (window.innerWidth >= 700) {
    modal.style.height = window.innerHeight - 150 + 'px'
  } else {
    modal.style.height = window.innerHeight - 220 + 'px'
  }
  
  pageEl.appendChild(modal)
  var close = document.getElementById('close-modal')

  eve.on(close, 'click', function (e) {
    pageEl.removeChild(modal)
    e.preventDefault()
  })
})

function createGeoJSON (locations) {
  var geojson = []
  var l = locations.length
  var i = 0

  for (i; i < l; i++) {
    var item = locations[i]
    if (item.latitude && item.longitude) {
      var point = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(item.longitude), Number(item.latitude)]
        },
        properties: item
      }

      point.properties['marker-size'] = 'medium'
      point.properties['marker-line-color'] = '#004990'
      point.properties['marker-line-opacity'] = 1
      point.properties['marker-color'] = '#004990'

      geojson.push(point)
    }
  }

  return geojson
}

function resizeMap () {
  if (window.innerWidth >= 700) {
    mapEl.style.width = (window.innerWidth - infoEl.offsetWidth) + 'px'
  } else {
    if (mapEl.style.width !== '100%') {
      mapEl.style.width = '100%'
    }
  }
  map.setView([47.6224, -122.337])
}

window.onresize = resizeMap
