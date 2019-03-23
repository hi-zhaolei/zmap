
import mapAPI from './index'
import {
  isChineseCoord
} from './utils'

/**
 * 初始化soda map
 * @param {String | DOM} container 地图初始化容器
 * @param {Object} options 初始化地图参数
 * @param {Function} callback 回调函数
 */
function createMap(container, options = {}, callback) {
  // logic to decide use which map service by initial option lng & lat
  if (options.lng && options.lat) {
    if (isChineseCoord(options)) {
      // domestic
      createAMap(container, options, callback)
    } else {
      // foreign
      createGoogleMaps(container, options, callback)
    }
  } else {
    // Use AMap initialization by default
		createAMap(container, options, callback)
  }
}

function createGoogleMaps(container, options, callback) {
  // 
  if (typeof container === 'string')
    container = document.getElementById(container)
  // create map by mapAPI
  mapAPI.createMap('google', container, {
    mode: options.mode,
    zoom: options.zoom || 10,
    center: {
      lng: options.lng || 120.31191,
      lat: options.lat || 31.49117,
    },
    language: options.lang || options.locale,
    libraries: options.libraries,
    clickHandle: options.clickHandle,
    rightclickHandle: options.rightclickHandle,
    dragstartHandle: options.dragstartHandle,
    dragHandle: options.dragHandle,
    dragendHandle: options.dragendHandle,
    idleHandle: options.idleHandle,
    zoom_changed: options.zoom_changed,
  }, (args) => {
    callback && callback(args.mapAPI, args)
  })
}

function createAMap(container, options, callback) {
  // 
  if (typeof container === 'string')
    container = document.getElementById(container)
  if (!container) {
    console.error("[Soda Map Error] The container doesn't exist ")
    return
  }
  let mapStyle
  if (options.mode) {
    if (options.mode === 'dark') {
      mapStyle = 'amap://styles/19251541a5b540e8869384191dc63255'
    } else {
      mapStyle = `amap://styles/${mapStyle.mode}`
    }
  } else {
    mapStyle = 'amap://styles/normal'
  }
  // create map by mapAPI
  mapAPI.createMap('amap', container, {
    mapStyle,
    zoom: options.zoom || 10,
    center: {
      lng: options.lng || 120.31191,
      lat: options.lat || 31.49117,
    },
    plugins: options.libraries,
    lang: options.lang || options.locale,
    clickHandle: options.clickHandle,
    rightclickHandle: options.rightclickHandle,
  }, (args) => {
    callback && callback(args.mapAPI, args)
  })
}

export default {
  createMap,
  createGoogleMaps,
  createAMap
}
