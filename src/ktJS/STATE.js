import { API } from './API.js'
import { CACHE } from './CACHE.js'

const PUBLIC_PATH = './assets/3d'
const initialState = {
  position: { x: -214.4319879534815, y: 342.06312822340584, z: 198.64756405470266 },
  target: { x: 8.11, y: 0, z: -7.93 }
}
const sceneScale = 10 // 场景放大10倍

const sceneList = {}

const clock = new Bol3D.Clock()

// 搜索框对应三维动画是否跳出
let searchAnimateDesdory = false


export const STATE = {
  initialState,
  sceneList,
  sceneScale,
  clock,
  searchAnimateDesdory,
  PUBLIC_PATH
}
