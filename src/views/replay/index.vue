<template>
  <div class="home">
    <Header></Header>
    <Compass></Compass>
    <ExtensionBtn></ExtensionBtn>

    <div class="timepicker">
      <div class="timepicker-label">回溯时间:</div>
      <el-date-picker v-model="timePark" type="datetimerange" range-separator="-" start-placeholder="开始时间"
        end-placeholder="结束时间" :teleported="false" :disabled-date="disabledDate" @change="datePickerChange" />
      <div class="timepicker-confirm" @click="handleConfirm">确定</div>
    </div>

    <div class="control">
      <div class="pause" :style="{ background: `url('./assets/3d/img/${VUEDATA.replayPaused.value ? 76 : 77}.png') center / 100% 100% no-repeat` }
        " @click="handlePause"></div>

      <div class="stop" @click="handleStop"></div>

      <el-slider class="slider" v-model="VUEDATA.replaySlider.value" :max="1000" :format-tooltip="sliderFormat"
        :disabled=!sliderTimePark.length @input="sliderChange" />

      <span class="progressTime">{{ replayProgressTime }}</span>
      <el-select v-model="times" class="times" placeholder="倍速" size="small" :teleported="false"
        @visible-change="selectChange">
        <el-option v-for=" item  in  timesOptions " :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import * as echarts from "echarts";
import Header from "@/components/header.vue";
import ExtensionBtn from "@/components/extensionBtn.vue";
import Compass from "@/components/compass.vue";
import { VUEDATA } from "@/VUEDATA";
import { GetReplayData } from "@/axios/api.js";
import { API } from "@/ktJS/API.js";
import drive from '@/ktJS/js/drive.js'
import { ElMessage } from 'element-plus'
import replayData1 from '@/ktJS/js/mockReplayData1.js'
// import mock2 from '@/ktJS/js/mock2.js'
import { stampTommss } from '@/utils/stampTommss.js'
import { STATE } from "@/ktJS/STATE";

const timePark = ref([new Date(new Date() * 1 - 3600000), new Date()]);
const timeLone = computed(() => {
  return timePark.value[1] * 1 - timePark.value[0] * 1
})
const replayProgressTime = computed(() => {
  let frontTime = null
  if (STATE.getData.currentReplayData.value.length) {
    frontTime = stampTommss(VUEDATA.replayIndex.value / STATE.getData.currentReplayData.value.length * timeLone.value)
  } else {
    frontTime = '00:00'
  }
  return `${frontTime} / ${stampTommss(timeLone.value)}`
})

async function handleConfirm() {
  handleStop()
  const long = Math.floor((timePark.value[1] * 1 - timePark.value[0] * 1) / 3600000 * 10800)
  const res = await GetReplayData([
    timePark.value[0].format("YYYY-MM-DD hh:mm:ss") + ".000",
    timePark.value[1].format("YYYY-MM-DD hh:mm:ss") + ".000",
  ], long);
  // const res = replayData1

  const res2 = res?.hits?.hits
  if (!res2) return

  const res3 = res2.map(e => e?._source?.data)
  const replayData = []
  for (let i = 0; i < res3.length; i++) {
    res3[i] = JSON.parse(res3[i].replaceAll(' ', '').replace('\r\n天车实时信息:-', ''))
    replayData.push({ VehicleInfo: [res3[i]] })
  }


  // const dataTime = mock2.map(e => e.VehicleInfo[0].lastTime)
  const dataTime = replayData.map(e => e.VehicleInfo[0].lastTime)
  let minTime = 0
  let maxTime = 0
  for (let i = 0; i < dataTime.length; i++) {
    dataTime[i] = dataTime[i].slice(0, 10) + ' ' + dataTime[i].slice(10)
    const time = new Date(dataTime[i])
    // mock2[i].VehicleInfo[0].timeStamp = time * 1
    replayData[i].VehicleInfo[0].timeStamp = time * 1
    if (minTime === 0 || time * 1 < minTime) {
      minTime = time * 1
    }
    if (maxTime === 0 || time * 1 > maxTime) {
      maxTime = time * 1
    }
  }
  sliderTimePark.value = [minTime, maxTime]

  // STATE.getData.currentReplayData.value = mock2
  STATE.getData.currentReplayData.value = replayData
  STATE.getData.run(replayData)
  // STATE.getData.run(STATE.getData.currentReplayData.value)

  VUEDATA.replayPaused.value = false
  VUEDATA.replayIndex.value = 0
  VUEDATA.replaySlider.value = 0
}

let times = ref(1);
const timesOptions = [
  {
    value: 16,
    label: "16x",
  },
  {
    value: 8,
    label: "8x",
  },
  {
    value: 4,
    label: "4x",
  },
  {
    value: 2,
    label: "2x",
  },
  {
    value: 1,
    label: "1x",
  }
];
let sliderTimePark = ref([])

function sliderFormat(e) {
  if (sliderTimePark.value.length && STATE.getData.currentReplayData.value.length) {
    // const long = sliderTimePark.value[1] - sliderTimePark.value[0]
    // const progress = e / 1000
    // const time = new Date(Math.floor(long * progress) + sliderTimePark.value[0])
    // return time.format('YYYY-MM-DD hh:mm:ss')
    const format = new Date(STATE.getData.currentReplayData.value[VUEDATA.replayIndex.value].VehicleInfo[0].timeStamp).format('YYYY-MM-DD hh:mm:ss')
    return format

  } else {
    return "无数据"
  }
}
function disabledDate(date) {
  return date > new Date()
}
function handlePause() {
  VUEDATA.replayPaused.value = !VUEDATA.replayPaused.value
  STATE.sceneList.skyCarList.forEach(e => {
    e.replayRun = !VUEDATA.replayPaused.value
  })

  if (VUEDATA.replayPaused.value) {
    STATE.getData.pause()

  } else {
    if (VUEDATA.replayIndex.value === STATE.getData.currentReplayData.value.length - 1) {
      STATE.getData.reset()
      VUEDATA.replayIndex.value = 0
      VUEDATA.replaySlider.value = 0
    }
    VUEDATA.replayPaused.value = false
    STATE.getData.run(STATE.getData.currentReplayData.value)
  }
}
function selectChange(e) {
  if (!e) {
    const fuckingInput = document.getElementsByClassName("times");
    if (fuckingInput[0]) {
      setTimeout(() => {
        fuckingInput[0].children[0].children[0].children[0].className = 'el-input__wrapper'
      }, 0)
    }

    VUEDATA.replayTimes.value = times.value
    if (STATE.getData.currentReplayData.value.length) {
      STATE.getData.run(STATE.getData.currentReplayData.value)
    }
  }
}
function sliderChange(e) {
  if (sliderTimePark.value.length) {
    const progress = e / 1000
    VUEDATA.replayIndex.value = Math.floor(progress * STATE.getData.currentReplayData.value.length)
    if (VUEDATA.replayIndex.value >= STATE.getData.currentReplayData.value.length) {
      VUEDATA.replayIndex.value = STATE.getData.currentReplayData.value.length - 1
    }
    VUEDATA.replayPaused.value = true
    STATE.getData.pause()

    const currentData = STATE.getData.currentReplayData.value[VUEDATA.replayIndex.value]
    const car = STATE.sceneList.skyCarList.find(e => e.id === currentData.VehicleInfo[0].ohtID)

    car.history = []
    car.nextLine = []
    for (let i = 0; i < VUEDATA.messageLen; i++) {
      if ((VUEDATA.replayIndex.value - i) > 0) {
        car.history.push(STATE.getData.currentReplayData.value[VUEDATA.replayIndex.value - (VUEDATA.messageLen - 1 - i)].VehicleInfo[0])
      }
    }
    drive(STATE.getData.currentReplayData.value[VUEDATA.replayIndex.value])

    const coordinate = Number(currentData.VehicleInfo[0].position)
    const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < coordinate && e.endCoordinate > coordinate)
    car.line = map.name.replace('_', '-')
    const lineMap = STATE.sceneList.linePosition[car.line]
    const lineProgress = (coordinate - map.startCoordinate) / (map.endCoordinate - map.startCoordinate)
    const index = Math.floor(lineMap.length * lineProgress)
    car.animationOver = true
    car.run = true
    car.isAnimationSoon = false
    car.lineIndex = index
    car.replayRun = true
    car.fastRun = false
    VUEDATA.replayPaused.value = false
    STATE.getData.run(STATE.getData.currentReplayData.value)
  }
}
function datePickerChange(e) {
  if (e[1] * 1 - e[0] * 1 > 3600000) {
    ElMessage.warning('时间范围不能超过1小时')
    timePark.value[0] = new Date(e[1] * 1 - 3600000)
  }
}
function handleStop() {
  STATE.getData.pause()
  STATE.getData.reset()
  STATE.getData.closeLink()
  sliderTimePark.value = []
  VUEDATA.replayPaused.value = true
  VUEDATA.replayIndex.value = 0
  VUEDATA.replaySlider.value = 0
}


</script>

<style lang="less" scoped>
.home {
  background: url("/assets/3d/img/1.png") center / 100% 100% no-repeat;
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
}

.timepicker {
  position: absolute;
  left: 50%;
  top: 8.5%;
  transform: translate(-50%, -50%);
  pointer-events: all;
  display: flex;
  align-items: center;
  color: #fff;

  &-label,
  &-confirm {
    width: 4vw;
    height: 3.2vh;
    font-size: 0.7vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-label {
    background: url("/assets/3d/img/75.png") center / 100% 100% no-repeat;
  }

  &-confirm {
    cursor: pointer;
    background: url("/assets/3d/img/72.png") center / 100% 100% no-repeat;
  }
}

:deep(.el-date-editor) {
  margin: 0 0.6vw;
  height: 3vh !important;
  background: url("/assets/3d/img/74.png") center / 100% 100% no-repeat;
  border: none !important;
  border-radius: 0;
  box-shadow: none !important;

  input,
  span,
  i,
  input:hover span:hover i:hover {
    color: #fff;
  }
}

:deep(.el-date-table td.in-range .el-date-table-cell) {
  background-color: #f1692a17;
}

.control {
  position: absolute;
  bottom: 3vh;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  display: flex;
  padding: 0.5vh 1vw;
  background-color: #0002;
  align-items: center;

  .pause {
    height: 1vw;
    width: 1.3vw;
    pointer-events: all;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 1vw;
  }

  .stop {
    height: 0.8vw;
    width: 1.1vw;
    pointer-events: all;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 1.5vw;
    background: #FFF;
    border-radius: 20%;
  }

  .slider {
    pointer-events: all;
  }

  .progressTime {
    width: 10vw;
    margin-left: 0.5vw;
    margin-right: 0.5vw;
    font-size: 12px;
    text-align: center;
    color: #FFF;
    word-break: keep-all;
  }

  .times {
    width: 5vw;
    user-select: none;
    pointer-events: all;
  }
}

:deep(.el-slider__button) {
  width: 0.8vw;
  height: 0.8vw;
}

:deep(.el-slider__runway) {
  height: 0.4vh;
}

:deep(.el-slider__bar) {
  height: 0.4vh;
}

:deep(.el-slider__button-wrapper) {
  top: -17px;
}

:deep(.control .el-input__wrapper) {
  background: none;
  width: 2vw;
  border: none;
  box-shadow: 0 0 0 1px #ffffff52 inset !important;
  ;

  input {
    color: #FFF;
    text-align: center;
  }

  .el-input__suffix {
    display: none;
  }
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #FFF inset !important;
}

.el-select-dropdown__item {
  text-align: center;
  padding: 0;
}
</style>
