import { API } from './API.js'
import { CACHE } from './CACHE.js'

const PUBLIC_PATH = './assets/3d'
const initialState = {
  position: { x: -214.4319879534815, y: 342.06312822340584, z: 198.64756405470266 },
  target: { x: 8.11, y: 0, z: -7.93 }
}
const sceneScale = 10 // 场景放大10倍

const sceneList = {
  shelvesList: [], // 货架状态表
  kaxiaList: new Bol3D.Group(), // 卡匣状态表
  linePosition: {}
}

const clock = new Bol3D.Clock()

// 搜索框对应三维动画是否跳出
let searchAnimateDesdory = false

// 二维的报警列表
let alarmList = null

// 当前弹窗(除了天车)
const currentPopup = null



export const STATE = {
  initialState,
  sceneList,
  sceneScale,
  clock,
  searchAnimateDesdory,
  alarmList,
  currentPopup,
  PUBLIC_PATH
}