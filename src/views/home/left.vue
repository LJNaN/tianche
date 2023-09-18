<template>
  <div class="left" :style="{ background: `url('/assets/3d/img/${bgImg}.png') center / 100% 100% no-repeat` }">
    <div v-if="VUEDATA.selectedItem.value.includes(7)" class="cmd">
      <div class="cmd-content">
        <p class="cmd-title">实时指令</p>


        <div class="cmd-table-wrap">
          <div class="table-title">
            <span>任务 ID</span>
            <span>执行小车</span>
            <span>取货点</span>
            <span>放货点</span>
            <span>创建时间</span>
          </div>

          <el-scrollbar class="table-content">
            <div v-for="(item) in cmdList" :key="item.commandid" style="cursor: pointer;">
              <p :title="item.commandid">
                <span>{{ item.commandid || '--' }}</span>
              </p>
              <p :title="item.vehicle">
                <span>{{ item.vehicle || '--' }}</span>
              </p>
              <p :title="item.sourceport">
                <span>{{ item.sourceport || '--' }}</span>
              </p>
              <p :title="item.destport">
                <span>{{ item.destport || '--' }}</span>
              </p>
              <p :title="item.create_time">
                <span>{{ item.create_time || '--' }}</span>
              </p>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <div v-if="VUEDATA.selectedItem.value.includes(8)" class="state">
      <div class="state-content">
        <p class="state-title">实时设备状态</p>

        <div class="state-table-wrap">
          <div class="table-title">
            <span>设备编号</span>
            <span>启用状态</span>
            <span>设备类型</span>
            <span>在线状态</span>
          </div>

          <el-scrollbar class="table-content">
            <div v-for="(item) in stateList" :key="item.equipment_id" style="cursor: pointer;">
              <p :title="item.equipmentId">
                <span>{{ item.equipmentId || '--' }}</span>
              </p>
              <p :title="item.enable">
                <span>{{ item.enable || '--' }}</span>
              </p>
              <p :title="item.equipmentType">
                <span>{{ item.equipmentType || '--' }}</span>
              </p>
              <p :title="item.isOnlineState">
                <span>{{ item.isOnlineState || '--' }}</span>
              </p>
            </div>
          </el-scrollbar>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { GetRealTimeCmd, GetRealTimeEqpState } from '@/axios/api'
import { VUEDATA } from '@/VUEDATA'

const bgImg = computed(() => {
  let imgUrl = ''
  const targetElements = [7, 8]
  const matchingElements = VUEDATA.selectedItem.value.filter(e => targetElements.includes(e))
  if (matchingElements.length === 0) imgUrl = '64'
  else if (matchingElements.length === 1) imgUrl = '63'
  else if (matchingElements.length === 2) imgUrl = '64'

  return imgUrl
})


let cmdList = ref([])
let stateList = ref([])


getData()
function getData() {
  GetRealTimeCmd().then(res => {
    if (res?.data?.length) {
      let list = []
      res.data.forEach(e => {
        list.push({
          commandid: e.commandid || '--',
          vehicle: e.vehicle || '--',
          sourceport: e.sourceport || '--',
          destport: e.destport || '--',
          create_time: e.create_time || '--'
        })
      })
      cmdList.value = list
    }
  })

  GetRealTimeEqpState().then(res => {
    if (res?.data?.length) {
      let list = []
      res.data.forEach(e => {
        list.push({
          equipmentId: e.equipmentId || '--',
          enable: e.enable == 0 ? '禁用' : e.enable == 1 ? '启用' : '--',
          equipmentType: e.equipmentType == 0 ? 'VEHICLE' : e.equipmentType == 1 ? 'EQP' : e.equipmentType == 2 ? 'STC' : e.equipmentType == 3 ? 'OLUS' : '--',
          isOnlineState: e.isOnlineState == 0 ? '离线' : e.isOnlineState == 1 ? '在线' : '--'
        })
      })
      stateList.value = list
    }
  })
}


setInterval(() => {
  getData()
}, 30 * 1000);

onMounted(() => { });
</script>

<style lang="less" scoped>
.left {
  word-break: break-all;
  position: absolute;
  left: 0.5%;
  top: 19%;
  width: 24.8%;
  z-index: 2;
  height: 48%;

  .cmd,
  .state {
    height: 24vh;
    width: 100%;
    position: relative;
  }

  .state {
    margin-top: -2%;
  }


  .cmd::before,
  .state::before {
    content: '';
    position: absolute;
    width: 1.2%;
    height: 40%;
    left: 2%;
    top: 5%;
    background-color: #fff;
  }

  .cmd::before {
    background-color: #f64c3f;
  }

  .state::before {
    background-color: #f99004;
  }


  .cmd-content,
  .state-content {
    position: absolute;
    width: 96%;
    height: 100%;
    left: 2%;
    top: 0;
    background: url('/assets/3d/img/26.png') bottom / 100% 78%;
  }


  .cmd-title,
  .state-title {
    position: absolute;
    top: 10%;
    left: 15%;
    font-weight: bold;

  }

  .cmd-title {
    color: #f64c3f;
  }

  .state-title {
    color: #f99004;
  }

  .cmd-table-wrap,
  .state-table-wrap {
    position: absolute;
    top: 32%;
    left: 5%;
    width: 90%;
    height: 62%;
    background: linear-gradient(to right,
        rgba(29, 138, 255) -400%,
        rgba(29, 138, 255, 0));
  }

  .state-table-wrap {
    top: 30%;
  }

  .table-content {
    pointer-events: all;
    width: 100%;
    height: calc(100% - 36px);
    margin-top: 36px;


    div {
      display: flex;
      align-items: center;
      height: 36px;
      color: #ffffff;
      font-size: 0.4vw;
      border-right: 1px solid #aaa;
      overflow: hidden;

      p {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 2%;
        width: 25%;
        border-left: 1px solid #aaa;
        border-bottom: 1px solid #aaa;
        height: 100%;
      }
    }
  }

  .table-title {
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    height: 36px;
    color: #ffffff;
    font-size: 0.8vw;
    border-top: 1px solid #aaa;
    border-right: 1px solid #aaa;

    span {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      border-left: 1px solid #aaa;
      border-bottom: 1px solid #aaa;
    }
  }
}
</style>