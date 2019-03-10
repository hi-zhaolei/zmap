# zmap
A common map API library that supports a variety of basic map services at home and abroad

用于针对国内和国外的地图使用需求，将对应的地图服务api进行封装，统一对外调用方式，并根据所需要的使用场景自动调用对应的地图服务，做到无缝切换。

## 安装

安装 npm package.

```bash
npm install @didi/soda-map-lite --save --registry=http://npm.intra.xiaojukeji.com/
```

## 创建地图

```javascript
import {
  createMap,
  createAMap,
  createGoogleMaps,
} from '../src/helper';
const initialOptions = {
  zoom: 5,
  lng: 116.397428,
  lat: 39.90923,
  libraries: 'drawing',
}
// 自动根据经纬度自动选择地图服务进行初始化
createMap('map', initialOptions, callback)
// 使用高德地图初始化
createAMap('map', initialOptions, callback)
// 使用谷歌地图初始化
createGoogleMaps('map', initialOptions, callback)
```

参数 | 描述 | 类型 | 可选值
----|------|------|------
container | 地图初始化容器 | String / DOM | id name / DOM
initialOptions | 地图初始化配置 | Object | 详见 map options
callback | 地图初始化成功后回调函数 | Function | 无，回调参数为api集合

### map initial options

参数 | 描述 | 类型 | 默认值
----|------|------|------
mode | 地图服务颜色模式 | String | 默认值为空，可选 dark
lng | 中心点经度 | Number | 116.3956
lat | 中心点纬度 | Number | 39.92998
zoom | 地图缩放值 | Number | 10
lang | 地图语言 | String | 'zh-CN'
libraries | 加载非基础库 | String / Array | Default: ''. 可选值: drawing[图形绘制功能]

## 回调map api

### setCenter

设置中心点

参数 | 描述 | 类型 | 默认值
----|------|------|------
lat | 中心点纬度 | Number | 无
lng | 中心点经度 | Number | 无

### setZoom

设置zoom级别

参数 | 描述 | 类型 | 默认值
----|------|------|------
zoom | zoom级别 | Number | 无

### getZoom

获取当前zoom级别

### setLang

设置地图展示语言

参数 | 描述 | 类型 | 默认值
----|------|------|------
locale | 外卖国际化标准locale格式 | String | zh-CN

### lngLat

通过对应地图服务接口，封装经纬度

参数 | 描述 | 类型 | 默认值
----|------|------|------
coord | 经纬度对象，eg. { lat, lng } | Object | 无

### fitView/fitBounds

移动地图视窗到图形最佳观看范围

参数 | 描述 | 类型 | 默认值
----|------|------|------
bounds | 需要适应的地图视窗范围，或者一个图形实例 | Object / Instance | 无

### getBounds

获取当前地图视窗经纬度

### createMarker

创建覆盖物

参数为options，配置项如下:

参数 | 描述 | 类型 | 默认值
----|------|------|------
position | 点标记在地图上显示的位置，默认为地图中心点 eg. { lat, lng } | Object | 无
offset | 点标记显示位置偏移量, 默认以marker左上角位置为基准点 eg: {x, y} | Object | 无
icon | 需在点标记中显示的图标，不和content共存 | String | 无
content | 点标记显示内容 | String | 无
draggable | 设置点标记是否可拖拽移动 | Boolean | false
clickHandle | 点击事件回调，移动端触摸事件回调 | Function | 无

返回值为一个新封装对象，方法如下:

方法名 | 描述 | 参数 | 类型 | 默认值
----|----|------|------|------
getPosition | 获取点经纬度 | 无 | 无 | 无
setPosition | 设置点经纬度 | latlng | Object eg. { lat, lng } | 无
remove | 从地图移除该图形 | 无 | 无 | 无

### createPolyline

创建线

参数为options，配置项如下:

参数 | 描述 | 类型 | 默认值
----|------|------|------
path | 点标记在地图上显示的位置，默认为地图中心点 eg: [{ lat, lng }...] | Array | 无
strokeColor | 线条颜色， 使用16进制颜色代码赋值。 | String | #006600
strokeOpacity | 轮廓线透明度， 取值范围[0, 1]， 0 表示完全透明， 1 表示不透明 | Number | 1
strokeStyle | 轮廓线样式， 实线: solid， 虚线: dashed | Array | solid
showDir | 是否显示箭头 | Boolean | false
clickHandle | 点击事件回调，移动端触摸事件回调 | Function | 无

返回值为一个新封装对象，方法如下:

方法名 | 描述 | 参数 | 类型 | 默认值
----|----|------|------|------
getPath | 获取线经纬度path | 无 | 无 | 无
remove | 从地图移除该图形 | 无 | 无 | 无
setEditable | 设置是否可编辑 | bool | Boolean | false

### createPolygon

创建多边形

参数为options，配置项如下:

参数 | 描述 | 类型 | 默认值
----|------|------|------
path | 点标记在地图上显示的位置，默认为地图中心点 eg: [{ lat, lng }...] | Array | 无
strokeColor | 线条颜色， 使用16进制颜色代码赋值。 | String | #006600
strokeOpacity | 轮廓线透明度， 取值范围[0, 1]， 0 表示完全透明， 1 表示不透明 | Number | 1
strokeStyle | 轮廓线样式， 实线: solid， 虚线: dashed | Array | solid
fillColor | 多边形填充颜色， 使用16进制颜色代码赋值， 如：# FFAA00 | Array | 无
fillOpacity | 多边形填充透明度， 取值范围[0, 1]， 0 表示完全透明， 1 表示不透明。 默认为0 .9 | Array | 无
showDir | 是否显示箭头 | Boolean | false
clickHandle | 点击事件回调，移动端触摸事件回调 | Function | 无

返回值为一个新封装对象，方法如下:

方法名 | 描述 | 参数 | 类型 | 默认值
----|----|------|------|------
getPath | 获取线经纬度path | 无 | 无 | 无
remove | 从地图移除该图形 | 无 | 无 | 无
setEditable | 设置是否可编辑 | bool | Boolean | false

### startDrawing

开启绘图模式

参数 | 描述 | 类型 | 默认值
----|------|------|------
type | 想要开启所绘制的图形类型 | String | 无，可选: polygon,polyline,marker,rule
options | 所绘制图形类型的样式配置 | Object | 无

options配置如下:

参数 | 描述 | 类型 | 默认值
----|------|------|------
fillColor | 内部填充色 | String |'#ffff00',
fillOpacity | 内部填充透明度 | Number |1,
strokeColor | 外部线颜色 | String |'red',
strokeOpacity | 外部线透明度 | Number |1,
strokeWeight | 外部线宽度 | Number |3,
editable | 是否可编辑(目前只谷歌支持) | Boolean |true,

### stopDrawing

关闭绘图模式

返回值为所有用户所绘制的图形实例接口，Array

### clear

清空地图所有图形

