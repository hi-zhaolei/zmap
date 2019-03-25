import { loadScript, pick, upperFirstLetter } from '../utils'
const URL = '//webapi.amap.com/maps'

function initAMap(container, options, callback) {
  const AMap = window.AMap
  if (options.center) {
    options.center = new AMap.LngLat(
      options.center.lng,
      options.center.lat
    )
  }
  let mapOptions = Object.assign({
    isHotspot: false,
    zoom: 14,
    // 默认坐标（北京）
    center: [
      116.3956,
      39.92998
    ]
  }, options)
  const map = new AMap.Map(container, mapOptions)
  apis.map = map
  if(mapOptions.rightclickHandle) {
    AMap.event.addListener(map, 'rightclick', function () {
      mapOptions.rightclickHandle(event, apis)
    })
  }
  AMap.event.addListener(map, 'complete', function () {
    callback && callback({
      map,
      container,
    })
  })
}

const apis = {
  map: null,
  container: null,
  callback: null,
  options: {},
  drawingManager: null,
  drawingQueue: [], //正在绘制图形队列(目前只有多边形)
  overlays: {
    polygon: [],
    polyline: [],
    circle: [],
    marker: [],
  }, // 所有的覆盖物数据队列(考虑后期分类)
  createMap (container, options = {}, callback) {
    this.container = container
    this.options = options
    this.callback = callback
    if (window.AMap) {
      // amap js library already loaded. only initial it
      initAMap(container, options, callback)
      return
    }
    // first initial map
    // TODO: 根据edit和type判断加载的libraries
    loadScript(URL, {
      v: '1.4.6',
      key: options.key,
      callback: 'init',
      plugin: [
        options.plugins === 'drawing' ? 'AMap.MouseTool' : '',
        "AMap.PolyEditor"
      ],
    })
    window.init = function () {
      initAMap(container, options, callback)
    }
  },
  setCenter (lat, lng) {
    this.map.setCenter([lng, lat])
  },

  setZoom (zoom) {
    this.map.setZoom(+zoom)
  },

  getZoom () {
    return this.map.getZoom()
  },

  setLang(locale) {
    const language = locale.split('-')[0]
    if (!language) return
    this.map.setLang(language)
  },
  
  fitView(shape) {
    if (shape.fitView) {
      shape.fitView()
      return
    }
    this.map.setFitView([shape])
  },

  fitBounds(bounds) {
    if (bounds.getBounds) {
      this.map.setBounds(bounds.getBounds())
      return
    }
    if( bounds.getPosition ) {
      this.map.setFitView([ bounds ])
      return
    }
    const ne = new AMap.LngLat(bounds.ne.lng, bounds.ne.lat)
    const sw = new AMap.LngLat(bounds.sw.lng, bounds.sw.lat)
    const amapBounds = new AMap.Bounds(sw, ne)
    this.map.setBounds(amapBounds)
  },

  getBounds () {
    return this.map.getBounds()
  },

  lngLat (coord) {
    return new AMap.LngLat(coord.lng, coord.lat)
  },

  lngLatToContainer(lat, lng) {
    const latlng = new AMap.LngLat(lng, lat)
    const point = this.map.lngLatToContainer(latlng)
    const size = this.map.getSize()
    point.x += size.width / 2
    point.y += size.height / 2
    return point
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
   * touchHandle: 移动端触摸事件回调
   */
  createMarker (opt) {
    const options = {
      draggable: opt.draggable || false,
    }
    if (opt.icon) {
      if(typeof opt.icon === 'string') {
        options.icon = opt.icon
      } else {
        opt.icon.size = new AMap.Size(...opt.icon.size)
        opt.icon.imageSize = new AMap.Size(...opt.icon.imageSize)
        options.icon = new AMap.Icon(opt.icon)
      }
    }
    if (opt.position) {
      options.position = this.lngLat(opt.position)
    } else {
      console.error('[Soda Map Error] maker need position for require')
      return;
    }
    if (opt.offset) {
      options.offset = new AMap.Pixel(opt.offset.x, opt.offset.y)
    }
    if (opt.content) {
      options.content = opt.content
    }
    if (opt.label) {
      options.label = opt.label
    }
    options.map = this.map

    const marker = new AMap.Marker(options)
    // bind event handlers
    this._eventHandler(marker, opt)
    
    this.overlays.marker.push(marker)
    return {
      fitView: () => this.fitView(marker),
      getPosition: () => marker.getPosition(),
      setPosition: (latlng) => marker.setPosition(this.lngLat(latlng)),
      remove: () => {
        console.log(marker)
        marker.setMap(null)
      },
      fitBounds: () => this.fitBounds(marker),
      on: (eventType, callback) => marker.on(eventType, callback),
      off: (eventType, callback) => marker.off(eventType, callback),
      hide: () => marker.hide(),
      show: () => marker.show(),
      setContent: (content) => marker.setContent(content),
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
    if (opt instanceof AMap.Circle) {
      circle = opt
    } else {
      if (!opt.center || !opt.radius) {
        console.error('[Soda Map Error] Circle need center and radius')
        return;
      }
      const options = pick(opt, [
        'cursor',
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
      circle = new AMap.Circle(options)
      // bind event handlers
      this._eventHandler(circle, opt)
    }
    const polyEditor = new AMap.PolyEditor(this.map, circle)
    this.overlays.circle.push(circle)
    return {
      fitView: () => this.fitView(circle),
      getCenter: () => circle.getCenter(),
      getRadius: () => circle.getRadius(),
      setCenter (lnglat) { circle.setCenter(lnglat) },
      setRadius (radius) { circle.setRadius(radius) },
      remove() {
        circle.setMap(null)
        // polyEditor.setMap(null)
      },
      setEditable(bool) {
        if (bool) {
          polyEditor.open()
        } else {
          polyEditor.close()
        }
      }
    }
  },
  /**
   * 覆盖线， 线
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
    if (opt instanceof AMap.Polyline) {
      polyline = opt
    } else {
      if (!opt.path) {
        console.error('[Soda Map Error] polyline need position')
        return;
      }
      const options = pick(opt, [
        'strokeColor',
        'strokeOpacity',
        'strokeStyle',
        'showDir',
      ])
      options.path = opt.path.map(pos => this.lngLat(pos))
      options.map = this.map
      polyline = new AMap.Polyline(options)
      // bind event handlers
      this._eventHandler(polyline, opt)
    }
    this.map.plugin(["AMap.PolyEditor"])
    
    const polyEditor = new AMap.PolyEditor(this.map, polyline)
    this.overlays.polyline.push(polyline)
    return {
      fitView: () => this.fitView(polyline),
      getPath: () => polyline.getPath(),
      remove() {
        console.log(polyEditor)
        polyline.setMap(null)
      },
      setEditable(bool) {
        if (bool) {
          polyEditor.open()
        } else {
          polyEditor.close()
        }
      },
      on: (eventType, callback) => polyline.on(eventType, callback),
      off: (eventType, callback) => polyline.off(eventType, callback),
      hide: () => polyline.hide(),
      show: () => polyline.show(),
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
    if (opt instanceof AMap.Polygon) {
      polygon = opt
    } else {
      if (!opt.path) {
        console.error('[Soda Map Error] polygon need position')
        return;
      }
      const options = pick(opt, [
        'strokeColor',
        'strokeOpacity',
        'fillColor',
        'fillOpacity',
        'strokeStyle',
      ])
      options.path = opt.path.map(pos => this.lngLat(pos))
      options.map = this.map
      polygon = new AMap.Polygon(options)
      // bind event handlers
      this._eventHandler(polygon, opt)
    }
    const polyEditor = new AMap.PolyEditor(this.map, polygon)
    this.overlays.polygon.push(polygon)
    console.log('polyEditor', polyEditor)
    return {
      fitPolygonBounds: () => this.fitView(polygon),
      getPath: () => polygon.getPath(),
      remove () {
        polygon.setMap(null)
        // polyEditor.setMap(null)
      },
      getEditable () {
        return polygon.isEditable
      },
      setEditable (bool) {
        if (bool) {
          polyEditor.open()
        } else {
          polyEditor.close()
        }
        polygon.isEditable = bool
      }
    }
  },
  /**
   * 开启绘制模式
   * type support in ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
   * 
   * @param {String} type
   * @param {object} options
   */
  startDrawing(type = 'null', options = {
    strokeColor: "#FF33FF",
    strokeWeight: 2,
    strokeOpacity: 0.2,
    fillColor: '#1791fc',
    fillOpacity: 0.4
  }) {
    if (!AMap.MouseTool) {
      console.error(`[Soda Map Error] Drawing mode requires that the drawing library be loaded. Set the library parameters in the map initialization options`)
      return false
    }
    this.drawingQueue = []
    this.mouseTool = new AMap.MouseTool(this.map);
    const drawingMode = this.mouseTool[type]
    if (!drawingMode) {
      console.error(`[Soda Map Error] soda map not support ${type} draw mode.`)
      return false;
    }
    drawingMode.call(this.mouseTool, options)
    AMap.event.addListener(this.mouseTool, 'draw', ({ obj }) => {
      this[`create${upperFirstLetter(type)}`](obj)
    })
    console.log('%c[Soda Map] Drawing mode on!', 'color:green')
  },

  stopDrawing () {
    this.mouseTool.close()
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
  adaptiveView() {
    console.log('this.map.setFitView()')
    this.map.setFitView()
  },
  destroy () {
    this.map.destroy()
  },
  _eventHandler(shape, opt) {
    const event = AMap.event
    // bind event handlers
    if (opt.clickHandle) {
      event.addListener(shape, 'click', opt.clickHandle)
      event.addListener(shape, 'touchend', opt.clickHandle)
    }
    if (opt.dblclickHandle) {
      event.addListener(shape, 'dblclick', opt.dblclickHandle)
    }
  }
}

export default apis
