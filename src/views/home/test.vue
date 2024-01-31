<template>
  <div class="slider">
    <span class="demonstration">小车坐标</span>
    <el-slider v-model="value1" :min="10" :max="100000" show-input @input="sliderChange" />
  </div>
</template>

<script setup>
import { STATE } from '@/ktJS/STATE';
import { ref } from 'vue'

let car = null


setTimeout(() => {
  aaa({ "VehicleInfo": [{ "currentSpeed": "400", "distance": "4999", "lastTime": new Date().format('YYYY-MM-DD hh:mm:ss'), "loadE84Error": "0", "loadFoupEmpty": "0", "location": "0", "ohtID": "V0001", "ohtIP": "192.168.150.133", "ohtStatus_AlarmSet": "0", "ohtStatus_ErrSet": "0", "ohtStatus_Fanghuoda": "0", "ohtStatus_Fanghuoxing": "0", "ohtStatus_Idle": "0", "ohtStatus_IsHaveFoup": "0", "ohtStatus_LoadEnable": "0", "ohtStatus_Loading": "0", "ohtStatus_LocalControl": "0", "ohtStatus_ManualControl": "0", "ohtStatus_MoveEnable": "0", "ohtStatus_Moving": "0", "ohtStatus_OnlineControl": "1", "ohtStatus_Pausing": "0", "ohtStatus_Prohibit": "0", "ohtStatus_Quhuoda": "0", "ohtStatus_Quhuoxing": "0", "ohtStatus_Rfidove": "0", "ohtStatus_Roaming": "1", "ohtStatus_Scanove": "0", "ohtStatus_Scanxing": "0", "ohtStatus_UnLoadEnable": "0", "ohtStatus_UnLoading": "0", "pauseTime": "0", "port": "8085", "position": -1, "rfidMisMatch": "0", "rfidReadError": "1", "switchGuideDirLeft": "1", "switchGuideDirRight": "1", "therfidFoup": "845 8334 6466 5D66 F", "totalExceptionStopCnt": "871", "totalExceptionTime": "155987", "totalMile": "0", "totalPowerOnCnt": "459", "totalPowerOnTime": "9962041", "totalTaskCnt": "64249", "unLoadE84Error": "0", "unLoadFoupFull": "0" }] })
  car = STATE.sceneList.skyCarList[0]
  car.run = false



  car.line = '26-22'
  car.lineIndex = 0
}, 7000);

function sliderChange(val) {

  if (!car) {
    return
  }

  // 查找起始点、起始坐标
  car.coordinate = val
  const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < val && e.endCoordinate > val)
  if (!map) {
    car.acceptData = true
    return
  }

  // 坐标区间
  const mapLong = map.endCoordinate - map.startCoordinate
  // 查找对应线段

  const line = CACHE.container.sceneList.guidao.children.find(e => {
    if (e.name.includes('-')) {
      const split = e.name.split('-')
      const start = split[0]
      const end = split[1]
      if (start == map.startPoint && end == map.endPoint) {
        return e
      }
    }
  })

  if (!line) {
    car.acceptData = true
    return
  }

  const linePosition = STATE.sceneList.linePosition[line.name]

  if (!linePosition) return

  const longToStart = car.coordinate - map.startCoordinate
  const process = longToStart / mapLong

  const currentPositionArray = linePosition[Math.floor(linePosition.length * process)]
  const currentPosition = new Bol3D.Vector3(currentPositionArray[0] * STATE.sceneScale, 28.3, currentPositionArray[2] * STATE.sceneScale)
  const lookAtPosition = new Bol3D.Vector3(0, 0, 0)

  lookAtPosition.x = currentPosition.x
  lookAtPosition.y = currentPosition.y
  lookAtPosition.z = currentPosition.z


  // 车子在当前轨道上走了多少进度
  const progress = (val - 137560) / 22060
  const thisLineMesh = STATE.sceneList.lineList.find(e => e.name === car.line)
  if (progress && thisLineMesh) {
    thisLineMesh.material.uniforms.progress.value = progress
  }

  car.skyCarMesh.lookAt(lookAtPosition)

  if (car.animation) {
    car.animation.stop()
    car.animation = null
  }

  car.skyCarMesh.position.set(currentPosition.x, currentPosition.y, currentPosition.z)
}

const value1 = ref(0)
</script>

<style lang="less" scoped>
.slider {
  position: absolute;
  left: 25%;
  top: 5%;
  z-index: 4;
  pointer-events: all;
  width: 60%;

  .demonstration {
    color: white;
  }
}
</style>