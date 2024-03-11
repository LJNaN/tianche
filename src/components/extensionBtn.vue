<template>
  <div class="chartShow" @click="clickDrawer()" :style="{
    background: `url(./assets/3d/img/${GLOBAL.selectedItem.value.length === drawerList.length ? 54 : 53}.png) center / 100% 100% no-repeat`,
    cursor: `${STATE.mainBus?.isReplayMode.value ? 'no-drop' : 'pointer'}`
  }
    ">

    <div v-show="drawerActive" class="chartShow-list">
      <div class="chartShow-list-item" v-for="item in drawerList" :key="item.id" @click.stop="handleDrawerItem(item.id)"
        :style="{ color: item.color, textShadow: '0 3px 4px #444' }">

        <div class="chartShow-list-item-circular"
          :style="{ background: `url(./assets/3d/img/${GLOBAL.selectedItem.value.includes(item.id) ? 58 : 57}.png) center / 100% 100% no-repeat` }">
        </div>

        {{ item.name }}
      </div>
    </div>
  </div>

  <div class="deviceShow" @click="handleDeviceShow()"
    :style="{ background: `url(./assets/3d/img/${GLOBAL.deviceShow.value ? 55 : 56}.png) center / 100% 100% no-repeat` }">
  </div>


  <div class="replay" @click="handleReplay()"
    :style="{ background: `url(./assets/3d/img/${STATE.mainBus?.isReplayMode.value ? 79 : 78}.png) center / 100% 100% no-repeat` }">
  </div>
</template>

<script setup>
import { GLOBAL } from '@/GLOBAL'
import { ref } from 'vue'
import { API } from '@/ktJS/API'
import router from '@/router/index'
import { STATE } from '@/ktJS/STATE'

let drawerActive = ref(false)
const drawerList = [
  { id: 0, name: '全部', color: '#FFFFFF' },
  { id: 1, name: 'Alarm Info', color: '#5aac2a' },
  { id: 2, name: 'Delivery Time', color: '#ce4239' },
  { id: 3, name: 'Delivery Count', color: '#f99004' },
  { id: 4, name: 'MTBF', color: '#5aac2a' },
  { id: 5, name: 'OHB Storage Ratio', color: '#ce4239' },
  { id: 6, name: 'MCBF', color: '#f99004' },
  { id: 7, name: '实时指令', color: '#ce4239' },
  { id: 8, name: '实时设备状态', color: '#f99004' }
]

// 二维界面图表部分显隐
GLOBAL.selectedItem.value = []
// GLOBAL.selectedItem.value = drawerList.map(e => e.id)


function handleDeviceShow() {
  GLOBAL.deviceShow.value = !GLOBAL.deviceShow.value;
  API.deviceShow(GLOBAL.deviceShow.value)
}

function clickDrawer() {
  if (!STATE.mainBus.isReplayMode.value) {
    drawerActive.value = !drawerActive.value
  }
}

function handleDrawerItem(id) {
  if (id === 0) {
    // 取消全选
    if (GLOBAL.selectedItem.value.length === drawerList.length) {
      GLOBAL.selectedItem.value = []
    } else {
      GLOBAL.selectedItem.value = drawerList.map(e => e.id)
    }

  } else {
    const itemIndex = GLOBAL.selectedItem.value.findIndex(e => e === id)
    if (itemIndex >= 0) {
      GLOBAL.selectedItem.value.splice(itemIndex, 1)
    } else {
      GLOBAL.selectedItem.value.push(id)
    }

    for (let i = 1; i < drawerList.length; i++) {
      if (!GLOBAL.selectedItem.value.includes(drawerList[i].id)) {
        const itemIndex = GLOBAL.selectedItem.value.findIndex(e => e === 0)
        if (itemIndex >= 0) {
          GLOBAL.selectedItem.value.splice(itemIndex, 1)
        }
        break;
      }

      if (i === drawerList.length - 1) {
        const itemIndex = GLOBAL.selectedItem.value.findIndex(e => e === 0)
        if (itemIndex < 0) {
          GLOBAL.selectedItem.value.push(0)
        }
      }
    }
  }



}


function handleReplay() {
  STATE.mainBus.reset()
  STATE.sceneList.lineList.forEach(e => {
    e.material.uniforms.next.value = 0
    e.material.uniforms.pass.value = 0
    e.material.uniforms.currentFocusLineStartPoint.value = -1
    e.material.uniforms.currentFocusLineEndPoint.value = -1
    e.material.uniforms.isEndLine.value = 0
    e.material.uniforms.endLineProgress.value = 0.0
    e.material.uniforms.isStartLine.value = 0
    e.material.uniforms.startLineProgress.value = 0.0
  })
  STATE.mainBus.replayPaused.value = true // 时间回溯暂停
  STATE.mainBus.replayTimes.value = 1 // 时间回溯倍率
  STATE.mainBus.replayIndex.value = 0 // 时间回溯当前索引
  STATE.mainBus.replaySlider.value = 0 // 回溯进度条的千分比

  if (STATE.mainBus.isReplayMode.value) {
    STATE.mainBus.isReplayMode.value = false
    STATE.mainBus.reset()
    router.push('/')
    STATE.mainBus.run()

  } else {
    STATE.mainBus.isReplayMode.value = true
    STATE.mainBus.closeLink()
    STATE.mainBus.reset()
    router.push('/replay')
  }
}
</script>

<style lang="less" scoped>
.chartShow {
  cursor: pointer;
  pointer-events: all;
  position: absolute;
  width: 26px;
  height: 26px;
  top: 9%;
  left: 0.9%;

  &-list {
    position: absolute;
    left: 0;
    margin-left: 150%;
    width: 14vw;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    background-color: #0009;

    &-item {
      display: flex;
      align-items: center;
      color: #FFF;
      width: 100%;
      height: 20%;
      min-height: 20px;
      font-weight: bold;
      font-family: Arial, Helvetica, sans-serif;
      letter-spacing: 2px;
      font-size: 14px;

      &-circular {
        width: 14px;
        height: 14px;
        margin-right: 6px;
      }
    }
  }
}

.deviceShow {
  cursor: pointer;
  pointer-events: all;
  position: absolute;
  width: 26px;
  height: 26px;
  top: 12.5%;
  left: 0.9%;
}

.replay {
  cursor: pointer;
  pointer-events: all;
  position: absolute;
  width: 26px;
  height: 26px;
  top: 16%;
  left: 0.9%;
}
</style>
