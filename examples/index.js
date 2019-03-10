
// import SodaMap from '../src/helper';
import SodaMap from '../src/helper';

console.log(SodaMap)

// const defaultMapOptions = {
//   zoom: 5,
//   lng: 116.397428,
//   lat: 39.90923,
//   libraries: 'drawing',
// }

const defaultMapOptions = {
  zoom: 6,
  lat: -34.397,
  lng: 150.644,
  locale: 'en-US',
  libraries: 'drawing',
  dblclickHandle: () => {
    console.log(1)
  },
  rightclickHandle:() => {
    console.log(2)
  },
  dragstartHandle: () => {
    console.log(777)
  },
  dragHandle:() => {
    console.log(666)
  },
  dragendHandle: () => {
    console.log(555)
  },
  idleHandle: () => {
    console.log('idleHandle')
  },
  zoom_changed: () => {
    console.log('zoom_changed')
  }
}
SodaMap.createMap(document.getElementById('map'), defaultMapOptions, function (map) {
  map.startDrawing('polygon')
  document.querySelector('#close').onclick = function () {
    console.log(map.stopDrawing())
  }

  // const instance = map.createPolygon({
  //   dblclickHandle () {
  //     instance.setEditable(true)
  //   }
  // })
})