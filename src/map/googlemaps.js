import {
  loadScript,
  upperFirstLetter,
  pick
} from '../utils'
const URL = '//maps.googleapis.com/maps/api/js'
const BACKUP_URL = '//maps.google.cn/maps/api/js'
const LANGUAGE_MAP = [
  'en-Au',
  'en-GB',
  'pt-BR',
  'pt-PT',
  'zh-CN',
  'zh-TW',
];
const styles = [{
    "elementType": "geometry",
    "stylers": [{
      "color": "#242f3e"
    }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#746855"
    }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{
      "color": "#242f3e"
    }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#d59563"
    }]
  },
  {
    "featureType": "poi",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#d59563"
    }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{
      "color": "#263c3f"
    }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#6b9a76"
    }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{
      "color": "#38414e"
    }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{
      "color": "#212a37"
    }]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#9ca5b3"
    }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{
      "color": "#746855"
    }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{
      "color": "#1f2835"
    }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#f3d19c"
    }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "transit",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{
      "color": "#2f3948"
    }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#d59563"
    }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{
      "color": "#17263c"
    }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#515c6d"
    }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{
      "color": "#17263c"
    }]
  }
]

export function getLang(locale) {
  let language
  if (LANGUAGE_MAP.includes(locale)) {
    language = locale
  } else {
    language = locale.split('-')[0]
  }
  if (!language) return ''
  return language
}
function initGMap (container, options = {}, callback) {
  const GMap = window.google.maps
  _expandApi()
  if (options.mode === 'dark') {
    options.styles = styles
    delete options.mode
  }
  let mapOptions = Object.assign({
    zoom: 10,
    // 默认坐标（北京）
    center: {
      lat: 39.92998,
      lng: 116.3956
    },
    zoomControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  }, options)
  const map = new GMap.Map(container, mapOptions, callback)
  apis.map = map
  // 事件
  GMap.event.addListenerOnce(map, 'tilesloaded', function () {
    callback && callback({
      map,
      container,
    })
  })
  apis._eventHandler(map, options)
}

const apis = {
  map: null,
  container: null,
  options: {},
  callback: null,
  drawingManager: null,
  drawingQueue: [], //正在绘制图形队列(目前只有多边形)
  overlays: {
    polygon: [],
    polyline: [],
    circle: [],
    markers: []
  },
  createMap (container, options = {}, callback) {
    this.container = container
    this.options = options
    this.callback = callback
    if (window.google && window.google.maps) {
      initGMap(container, options, callback)
      return
    }
    if (this.script) document.body.removeChild(this.script)
    this.script = loadScript(URL, {
      key: 'AIzaSyBdPOvDhhGUnP7Rvfa4-Pf-T6wSV0eYKgc',
      callback: 'init',
      language: getLang(options.language),
      libraries: options.libraries
    }, BACKUP_URL)
    window.init = function () {
      initGMap(container, options, callback)
    }
  },
  /**
   * 设置中心点
   * 
   * @param {number} lat 
   * @param {number} lng 
   */
  setCenter (lat, lng) {
    this.map.setCenter({
      lat: +lat,
      lng: +lng
    })
  },
  /**
   * 设置zoom
   * 
   * @param {number} zoom 
   */
  setZoom (zoom) {
    if (!zoom) return
    this.map.setZoom(+zoom)
  },
  /**
   * 获取zoom
   * 
   * @param {number} zoom 
   */
  getZoom() {
    return this.map.getZoom()
  },
  /**
   * 多语言设置
   * 
   * @param {string} locale 
   */
  setLang (locale) {
    const language = getLang(locale)
    if (!language) return
    if (language === this.options.language) return
    delete window.google.maps
    this.options.language = language
    this.createMap(this.container, this.options, this.callback)
  },
  /**
   * 经纬度类封装
   * 
   * @param {object} coord 
   */
  lngLat(coord) {
    return new google.maps.LatLng(coord.lat, coord.lng)
  },
  /**
   * convert lnglat to pixel position
   * 
   * @param {number} lat 
   * @param {number} lng 
   */
  lngLatToContainer(lat, lng) {
    const latlng = new google.maps.LatLng(lat, lng)
    const overlayProjection = this.layer.getProjection();
    if (!overlayProjection) return { x: 0, y: 0 }
    const point = overlayProjection.fromLatLngToContainerPixel(latlng)
    point.x += this.offset.x
    point.y += this.offset.y
    return point
  },
  /**
   * fit map to bast perspective by input
   * 
   * @param {object or instance} bounds 
   */
  fitView (shape) {
    if (shape.fitView) {
      shape.fitView()
      return
    }
    this.fitBounds(shape)
  },

  fitBounds(bounds) {
    if (bounds.getBounds) {
      this.map.fitBounds(bounds.getBounds())
      return
    }
    if (bounds.getPosition) {
      this.map.fitBounds(bounds.getBounds())
      return
    }
    const gmapBounds = new google.maps.LatLngBounds([bounds.sw, bounds.ne])
    this.map.fitBounds(gmapBounds)
  },

  /**
   * return current map perspective
   */
  getBounds() {
    return this.map.getBounds()
  },

  /**
   * 点标记
   * @param {Object} options 
   * position: 点标记在地图上显示的位置，默认为地图中心点 eg: { lat, lng }
   * offset: 点标记显示位置偏移量, 默认以marker左上角位置为基准点 eg: {x, y}
   * icon: 需在点标记中显示的图标，不和content共存
   * content: 点标记显示内容
   * draggable: 设置点标记是否可拖拽移动， 默认为false
   * clickHandle: 点击事件回调
   */
  createMarker (opt) {
    if (!opt.position) {
      console.error('[Soda Map Error] marker need path')
      return;
    }
    if (opt.offset) {
      opt.anchorPoint = new AMap.Pixel(opt.offset.x, opt.offset.y)
    }
    
    if (opt.g_label) {
      // console.log(opt.g_label)
      // if (opt.g_label.anchor) {
      //   opt.g_label.anchor = new google.maps.Point(...opt.g_label.anchor)
      // }
      opt.label = opt.g_label
    }

    if (opt.g_icon) {
      opt.icon = {
        url: opt.g_icon.image,
        size: new google.maps.Size(...opt.g_icon.size),
        scaledSize: new google.maps.Size(...opt.g_icon.imageSize)
      }
      if (opt.g_icon.labelOrigin) {
        opt.icon.labelOrigin = new google.maps.Point(...opt.g_icon.labelOrigin)
      }
    }

    const options = pick(opt, [
      'position',
      'anchorPoint',
      'icon',
      'label',
      'draggable',
      'content'
    ])
    options.map = this.map
    const marker = new google.maps.Marker(options);
    // bind event handlers
    
    this._eventHandler(marker, opt)
    return {
      fitView: () => this.map.setCenter(marker.getPosition()),
      getPosition: () => marker.getPosition().toJSON(),
      setPosition: (latlng) => marker.setPosition(latlng),
      remove: () => marker.setMap(null),
      fitBounds: () => this.fitBounds(marker),
      remove: () => marker.setMap(null),
      on: (eventType, callback) => marker.addListener(eventType, callback),
      off: (eventType, callback) => marker.removeListener(eventType, callback),
      hide: () =>marker.setVisible(false),
      show: () => marker.setVisible(true),
      setIcon: (iconStructure) => {
        var filedMap = {
          image: 'url',
          size: 'size',
          imageSize: 'scaledSize'
        }
        let icon = {}
        for (var i in filedMap) {
          if (iconStructure[i]) {
            if (i === 'image') {
              icon[filedMap[i]] = iconStructure[i]
            } else {
              icon[filedMap[i]] = new google.maps.Size(iconStructure[i])
            }
          }
        }
        marker.setIcon(Object.assign(marker.getIcon(), icon))
      },
      setLabel: (labelStructure) => {
        marker.setLabel(Object.assign(marker.getLabel(), labelStructure))
      },
      setzIndex: (zIndex) => marker.setzIndex(zIndex)
      
    }
  },
  /**
   * 覆盖物， 圆
   * @param {Object} opt 
   * center: 圆标记在地图上的中心点，默认为地图中心点 eg: [{ lat, lng }...]
   * radius: 圆半径
   * strokeColor: 线条颜色， 使用16进制颜色代码赋值。 默认值为 #006600
   * strokeOpacity: 轮廓线透明度， 取值范围[0, 1]， 0 表示完全透明， 1 表示不透明。 默认为0 .9
   * strokeStyle: 轮廓线样式， 实线: solid， 虚线: dashed
   * strokeWeight: 轮廓线宽度
   * fillColor: 内部填充色
   * fillOpacity: 内部填充色透明度
   * clickHandle: 点击事件回调
   * touchHandle: 移动端触摸事件回调
   */
  createCircle(opt) {
    let circle
    if (opt instanceof google.maps.Circle) {
      circle = opt
    } else {
      if (!opt.center || !opt.radius) {
        console.error('[Soda Map Error] Circle need center and radius')
        return;
      }
      const options = pick(opt, [
        'radius',
        'strokeColor',
        'strokeOpacity',
        'strokeStyle',
        'strokeWeight',
        'fillColor',
        'fillOpacity',
      ])
      options.center = this.lngLat(opt.center)
      options.map = this.map
      circle = new google.maps.Circle(options)
      // bind event handlers
      this._eventHandler(circle, opt)
    }
    this.overlays.circle.push(circle)
    return {
      fitView: () => this.map.fitBounds(circle.getBounds()),
      getCenter: () => circle.getCenter(),
      getRadius: () => circle.getRadius(),
      setCenter(lnglat) {
        circle.setCenter(lnglat)
      },
      setRadius(radius) {
        circle.setRadius(radius)
      },
      remove() {
        circle.setMap(null)
      },
      setEditable(bool) {
        circle.setEditable(bool)
      }
    }
  },
  /**
   * 覆盖物， 线
   * @param {Object} opt 
   * path: 点标记在地图上显示的位置，默认为地图中心点 eg: [{ lat, lng }...]
   * strokeColor: 线条颜色， 使用16进制颜色代码赋值。 默认值为 #006600
   * strokeOpacity: 轮廓线透明度， 取值范围[0, 1]， 0 表示完全透明， 1 表示不透明。 默认为0 .9
   * strokeStyle: 轮廓线样式， 实线: solid， 虚线: dashed
   * showDir: 是否显示箭头
   * clickHandle: 点击事件回调
   * touchHandle: 移动端触摸事件回调
   */
  createPolyline(opt) {
    let polyline
    if (opt instanceof google.maps.Polyline) {
      polyline = opt
    } else {
      if (!opt.path) {
        console.error('[Soda Map Error] polyline need path')
        return;
      }
      // const path = opt.path.map(pos => this.lngLat(pos))
      const options = {
        ...opt,
        map: this.map,
        icons: opt.showDir ? [{
          icon: {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            scale: 1.5,
            strokeColor: '#ffffff',
            strokeWeight: 1.5
          },
          offset: '100%',
          repeat: '20px'
        }] : void 0,
      }
      polyline = new google.maps.Polyline(options);
      // bind event handlers
      this._eventHandler(polyline, opt)
    }
    // 加入队列之中
    this.overlays['polyline'].push(polyline)
    return {
      fitView: () => this.map.fitBounds(polyline.getBounds()),
      getPath: () => polyline.getPath().getArray().map(path => path.toJSON()),
      remove: () => polyline.setMap(null),
      setEditable: (bool) => polyline.setEditable(bool),
      on: (eventType, callback) => {
        polyline[eventType] = callback
      },
      off: (eventType) => {
        polyline[eventType] = function () {return false}
      },
      hide: () => polyline.setVisible(false),
      show: () => polyline.setVisible(true),
      setOptions: (options) => polyline.setOptions(options)
    }
  },
  /**
   * 覆盖物， 多边形
   * @param {Object} opt 
   * path: 点标记在地图上显示的位置，默认为地图中心点 eg: [{ lat, lng }...]
   * strokeColor: 线条颜色， 使用16进制颜色代码赋值。 默认值为 #006600
   * strokeOpacity: 轮廓线透明度， 取值范围[0, 1]， 0 表示完全透明， 1 表示不透明。 默认为0 .9
   * fillColor: 多边形填充颜色， 使用16进制颜色代码赋值， 如：# FFAA00
   * fillOpacity: 多边形填充透明度， 取值范围[0, 1]， 0 表示完全透明， 1 表示不透明。 默认为0 .9
   * strokeStyle: 轮廓线样式， 实线: solid， 虚线: dashed
   * clickHandle: 点击事件回调
   * touchHandle: 移动端触摸事件回调
   */
  createPolygon (opt) {
    let polygon
    if (opt instanceof google.maps.Polygon) {
      polygon = opt
    } else {
      if (!opt.path) {
        console.error('[Soda Map Error] polygon need path for require')
        return;
      }
      const paths = opt.path.map(pos => this.lngLat(pos))
      const options = {
        ...opt,
        paths: paths,
        map: this.map
      }
      polygon = new google.maps.Polygon(options);
      this._eventHandler(polygon, opt)
    }
    // 加入队列之中
    this.overlays['polygon'].push(polygon)
    return {
      fitView: () => this.map.fitBounds(polygon.getBounds()),
      getPath: () => polygon.getPath().getArray().map(path => path.toJSON()),
      remove: () => polygon.setMap(null),
      getEditable: () => polygon.getEditable(),
      setEditable: (bool) => polygon.setEditable(bool),
      setOptions: options => polygon.setOptions(options)
    }
  },

  /**
   * 开启绘制模式
   * type support in ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
   * 
   * @param {String} type
   * @param {object} options
   * fillColor: '#ffff00',
   * fillOpacity: 1,
   * strokeColor: 'red',
   * strokeWeight: 3,
   * strokeOpacity: 1,
   * editable: true,
   */
  startDrawing(type = 'null', options = {
    strokeColor: "#FF33FF",
    strokeWeight: 6,
    strokeOpacity: 0.2,
    fillColor: '#1791fc',
    fillOpacity: 0.4,
  }) {
    const drawing = google.maps.drawing
    if (!drawing) {
      console.error(`[Soda Map Error] Drawing mode requires that the drawing library be loaded. Set the library parameters in the map initialization options`)
      return false
    }
    const drawingMode = drawing.OverlayType[type.toUpperCase()]
    if (!drawingMode) {
      console.error(`[Soda Map Error] soda map not support ${type} draw mode.`)
      return
    }
    this.drawingQueue = []
    this.drawingManager = new drawing.DrawingManager({
      map: this.map,
      drawingMode,
      drawingControl: false,
      [`${type}Options`]: options,
    })
    // 监听绘制完毕
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', ({ overlay }) => {
      // 维护到队列中
      this.drawingQueue.push(this[`create${upperFirstLetter(type)}`](overlay))
    })
    console.log('%c[Soda Map] Drawing mode on!', 'color:green')
  },

  /**
   * 关闭绘制模式
   * @param {*} callback 
   */
  stopDrawing () {
    if(!this.drawingManager) return
    this.drawingManager.setMap(null)
    console.log('%c[Soda Map] Drawing mode off!', 'color:gray')
    return this.drawingQueue
  },

  /**
   * 删除所有的覆盖物
   */
  clear() {
    Object.keys(this.overlays).forEach((type) => {
      this.overlays[type].forEach(function (overlay) {
        overlay.setMap(null)
      })
      this.overlays[type] = []
    })
  },
  adaptiveView(points) {
    let bounds = new google.maps.LatLngBounds()
    points.forEach((point) => {
      bounds.extend(new google.maps.LatLng(point))
    })
   this.map.fitBounds(bounds)
  },
  destroy () {
    this.map.getDiv().innerHTML = ""
  },

  _eventHandler (shape, opt) {
    const event = google.maps.event
    // bind event handlers
    if (opt.clickHandle) {
      event.addListener(shape, 'click', opt.clickHandle)
      event.addListener(shape, 'touchend', opt.clickHandle)
    }
    if (opt.dblclickHandle) {
      event.addListener(shape, 'dblclick', opt.dblclickHandle)
    }
    if (opt.rightclickHandle) {
      event.addListener(shape, 'rightclick', opt.rightclickHandle)
    }
    if (opt.dragstartHandle) {
      event.addListener(shape, 'dragstart', opt.dragstartHandle)
    }
    if (opt.dragHandle) {
      event.addListener(shape, 'drag', opt.dragHandle)
    }
    if (opt.dragendHandle) {
      event.addListener(shape, 'dragend', opt.dragendHandle)
    }
    if (opt.idleHandle) {
      event.addListener(shape, 'idle', opt.idleHandle)
    }
    if (opt.zoom_changed) {
      event.addListener(shape, 'zoom_changed', opt.zoom_changed)
    }
    if (opt.mousemoveHandle) {
      event.addListener(shape, 'mousemove', opt.mousemoveHandle)
    }
  }
} 

//扩展google api
function _expandApi() {
  if (!google.maps.Polygon.prototype.getBounds) {
    function getBounds() {
      var bounds = new google.maps.LatLngBounds();
      this.getPath().forEach(function (element, index) {
        bounds.extend(element);
      });
      return bounds;
    }
    google.maps.Polyline.prototype.getBounds = getBounds
    google.maps.Polygon.prototype.getBounds = getBounds
  }
}

export default apis
