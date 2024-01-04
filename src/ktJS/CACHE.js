let container = null // container
let tempCameraState = {} // 聚焦天车时的相机、控制器状态

const instanceTransformInfo = {} //  transform info
const instanceMeshInfo = {} //  instance info
const instanceNameMap = {}
const removed = {}

const goods = []


let oldClock = 0

export const CACHE = {
  container,
  instanceTransformInfo,
  instanceMeshInfo,
  instanceNameMap,
  tempCameraState,
  goods,
  oldClock,
  removed,
}