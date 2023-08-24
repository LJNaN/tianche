
<template>
  <div class="chartShow" @click="clickDrawer()"
    :style="{ background: `url(/assets/3d/img/${VUEDATA.selectedItem.value.length === drawerList.length ? 54 : 53}.png) center / 100% 100% no-repeat` }">

    <div v-show="drawerActive" class="chartShow-list">
      <div class="chartShow-list-item" v-for="item in drawerList" :key="item.id" @click.stop="handleDrawerItem(item.id)"
        :style="{ color: item.color, textShadow: '0 3px 4px #444' }">

        <div class="chartShow-list-item-circular"
          :style="{ background: `url(/assets/3d/img/${VUEDATA.selectedItem.value.includes(item.id) ? 58 : 57}.png) center / 100% 100% no-repeat` }">
        </div>

        {{ item.name }}
      </div>
    </div>
  </div>

  <div class="deviceShow" @click="handleDeviceShow()"
    :style="{ background: `url(/assets/3d/img/${VUEDATA.deviceShow.value ? 55 : 56}.png) center / 100% 100% no-repeat` }">


  </div>
</template>

<script setup>
import { VUEDATA } from '@/VUEDATA'
import { ref } from 'vue'
import { API } from '@/ktJS/API'

let drawerActive = ref(false)
const drawerList = [
  { id: 0, name: '全部', color: '#FFFFFF' },
  { id: 1, name: 'Alarm Info', color: '#5aac2a' },
  { id: 2, name: 'Delivery Time', color: '#ce4239' },
  { id: 3, name: 'Delivery Count', color: '#f99004' },
  { id: 4, name: 'MTBF', color: '#5aac2a' },
  { id: 5, name: 'OHB Storage Ratio', color: '#ce4239' },
  { id: 6, name: 'MCBF', color: '#f99004' },
]

// 二维界面图表部分显隐
VUEDATA.selectedItem.value = drawerList.map(e => e.id)


function handleDeviceShow() {
  VUEDATA.deviceShow.value = !VUEDATA.deviceShow.value;
  API.deviceShow(VUEDATA.deviceShow.value)
}

function clickDrawer() {
  drawerActive.value = !drawerActive.value
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
    height: 20vh;
    display: flex;
    flex-direction: column;

    &-item {
      display: flex;
      align-items: center;
      color: #FFF;
      width: 100%;
      height: 20%;
      min-height: 24px;
      font-weight: bold;
      font-family: Arial, Helvetica, sans-serif;
      letter-spacing: 2px;

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
</style>
