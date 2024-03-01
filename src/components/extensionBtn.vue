
<template>
  <div class="chartShow" @click="clickDrawer()" :style="{
    background: `url(./assets/3d/img/${VUEDATA.selectedItem.value.length === drawerList.length ? 54 : 53}.png) center / 100% 100% no-repeat`,
    cursor: `${VUEDATA.isReplayMode.value ? 'no-drop' : 'pointer'}`
  }
    ">

    <div v-show="drawerActive" class="chartShow-list">
      <div class="chartShow-list-item" v-for="item in drawerList" :key="item.id" @click.stop="handleDrawerItem(item.id)"
        :style="{ color: item.color, textShadow: '0 3px 4px #444' }">

        <div class="chartShow-list-item-circular"
          :style="{ background: `url(./assets/3d/img/${VUEDATA.selectedItem.value.includes(item.id) ? 58 : 57}.png) center / 100% 100% no-repeat` }">
        </div>

        {{ item.name }}
      </div>
    </div>
  </div>

  <div class="deviceShow" @click="handleDeviceShow()"
    :style="{ background: `url(./assets/3d/img/${VUEDATA.deviceShow.value ? 55 : 56}.png) center / 100% 100% no-repeat` }">
  </div>


  <div class="replay" @click="handleReplay()"
    :style="{ background: `url(./assets/3d/img/${VUEDATA.isReplayMode.value ? 79 : 78}.png) center / 100% 100% no-repeat` }">
  </div>
</template>

<script setup>
import { VUEDATA } from '@/VUEDATA'
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
VUEDATA.selectedItem.value = []
// VUEDATA.selectedItem.value = drawerList.map(e => e.id)


function handleDeviceShow() {
  VUEDATA.deviceShow.value = !VUEDATA.deviceShow.value;
  API.deviceShow(VUEDATA.deviceShow.value)
}

function clickDrawer() {
  if (!VUEDATA.isReplayMode.value) {
    drawerActive.value = !drawerActive.value
  }
}

function handleDrawerItem(id) {
  if (id === 0) {
    // 取消全选
    if (VUEDATA.selectedItem.value.length === drawerList.length) {
      VUEDATA.selectedItem.value = []
    } else {
      VUEDATA.selectedItem.value = drawerList.map(e => e.id)
    }

  } else {
    const itemIndex = VUEDATA.selectedItem.value.findIndex(e => e === id)
    if (itemIndex >= 0) {
      VUEDATA.selectedItem.value.splice(itemIndex, 1)
    } else {
      VUEDATA.selectedItem.value.push(id)
    }

    for (let i = 1; i < drawerList.length; i++) {
      if (!VUEDATA.selectedItem.value.includes(drawerList[i].id)) {
        const itemIndex = VUEDATA.selectedItem.value.findIndex(e => e === 0)
        if (itemIndex >= 0) {
          VUEDATA.selectedItem.value.splice(itemIndex, 1)
        }
        break;
      }

      if (i === drawerList.length - 1) {
        const itemIndex = VUEDATA.selectedItem.value.findIndex(e => e === 0)
        if (itemIndex < 0) {
          VUEDATA.selectedItem.value.push(0)
        }
      }
    }
  }



}


function handleReplay() {
  STATE.getData.reset()
  VUEDATA.replayPaused.value = true // 时间回溯暂停
  VUEDATA.replayTimes.value = 1 // 时间回溯倍率
  VUEDATA.replayIndex.value = 0 // 时间回溯当前索引
  VUEDATA.replaySlider.value = 0 // 回溯进度条的千分比

  if (VUEDATA.isReplayMode.value) {
    VUEDATA.isReplayMode.value = false
    STATE.getData.reset()
    router.push('/')
    STATE.getData.run()

  } else {
    VUEDATA.isReplayMode.value = true
    STATE.getData.closeLink()
    STATE.getData.reset()
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
  top: 10%;
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
  top: 14%;
  left: 0.9%;
}

.replay {
  cursor: pointer;
  pointer-events: all;
  position: absolute;
  width: 26px;
  height: 26px;
  top: 18%;
  left: 0.9%;
}
</style>
