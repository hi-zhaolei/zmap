import amapApi from './map/amap'
import googleApi from './map/googlemaps'

const COMMONE_OPEN_APIS = [
  'setCenter',
  'setZoom',
  'getZoom',
  'setLang',
  'lngLat',
  'fitView',
  'fitBounds',
  'getBounds',
  'createMarker',
  'createCircle',
  'createPolyline',
  'createPolygon',
  'startDrawing',
  'stopDrawing',
  'clear',
  'adaptiveView',
  'destroy'
]

export default {
  map: null,
  layer: null,
  params: {},
  renderQueue: [],
  createMap: function (type, container, options, callback) {
    this.params.container = container
    this.params.options = options
    this.params.type = type
    if (type === 'amap') {
      this.api = amapApi
    } else if (type === 'google') {
      this.api = googleApi
    }
    // initialize common map api
    for (let i = 0; i < COMMONE_OPEN_APIS.length; i++) {
      const ename = COMMONE_OPEN_APIS[i]
      if (!this.api || !this.api[ename]) {
        console.error(`[Soda Map Error] ${type} api missing ${ename} method.`)
        continue
      }
      this[ename] = this.api[ename].bind(this.api)
    }

    this.api.createMap(container, options, (options) => {
      this.map = options.map
      options.mapAPI = this
      callback(options)
    })
  },

  setCenter(lat) {
    if (typeof lat === 'object') {
      lng = lat.lng
      lat = lat.lat
    }
    return this.api.setCenter(lat, lng)
  },

  zoomIn () {
    this.api.setZoom(this.api.getZoom() + 1)
  },

  zoomOut() {
    this.api.setZoom(this.api.getZoom() - 1)
  },

  lngLatToContainer (lat, lng) {
    if (typeof lat === 'object') {
      lng = lat.lng
      lat = lat.lat
    }
    return this.api.lngLatToContainer(lat, lng)
  },
} 
