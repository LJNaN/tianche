<template>
  <div class="home">
    <Header></Header>
    <Compass></Compass>
    <ExtensionBtn></ExtensionBtn>

    <div class="timepicker">
      <div class="timepicker-label">回溯时间:</div>
      <el-date-picker v-model="timePark" type="datetimerange" range-separator="-" start-placeholder="开始时间"
        end-placeholder="结束时间" :teleported="false" :disabled-date="disabledDate" @change="datePickerChange"
        :clearable="false" />
      <div class="timepicker-confirm" @click="handleConfirm" :style="{ cursor: loading ? 'wait' : 'pointer' }">确定</div>
    </div>

    <div class="control">
      <div class="pause" :style="{
        background: `url('./assets/3d/img/${STATE.mainBus.replayPaused.value ? 76 : 77
          }.png') center / 100% 100% no-repeat`,
        cursor: loading ? 'wait' : 'pointer'
      }" @click="handlePause"></div>

      <div class="stop" :style="{ cursor: loading ? 'wait' : 'pointer' }" @click="handleStop"></div>

      <el-slider class="slider" v-model="STATE.mainBus.replaySlider.value" :max="1000" :format-tooltip="sliderFormat"
        :disabled="!sliderTimePark.length || stop" @input="sliderChange" />

      <span class="progressTime">{{ replayProgressTime }}</span>
      <el-select v-model="times" class="times" placeholder="倍速" size="small" :teleported="false"
        @visible-change="selectChange">
        <el-option v-for="item in timesOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <el-progress v-if="loading" class="progress" :percentage="100" :indeterminate="true" :duration="1"
      :show-text="false" :stroke-width="3" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Header from "@/components/header.vue";
import ExtensionBtn from "@/components/extensionBtn.vue";
import Compass from "@/components/compass.vue";
import { GLOBAL } from "@/GLOBAL";
import { GetReplayData } from "@/axios/api.js";
import { ElMessage } from "element-plus";
import replayData1 from "@/ktJS/js/mockReplayData1.js";
// import mock2 from '@/ktJS/js/mock2.js'
import { stampTommss } from "@/utils/stampTommss.js";
import { STATE } from "@/ktJS/STATE";

const loading = ref(false)

const timePark = ref([new Date(new Date() * 1 - 3600000), new Date()]);
const timeLone = computed(() => {
  return timePark.value[1] * 1 - timePark.value[0] * 1;
});
const replayProgressTime = computed(() => {
  let frontTime = null;
  if (STATE.mainBus.currentReplayData.value.length) {
    frontTime = stampTommss(
      (STATE.mainBus.replayIndex.value /
        STATE.mainBus.currentReplayData.value.length) *
      timeLone.value
    );
  } else {
    frontTime = "00:00";
  }
  return `${frontTime} / ${stampTommss(timeLone.value)}`;
});

async function handleConfirm() {
  if (loading.value) {
    return
  }

  handleStop();
  loading.value = true
  stop.value = false;
  let long = Math.floor(
    ((timePark.value[1] * 1 - timePark.value[0] * 1) / 3600000) * 10800
  );
  if (long > 10000) long = 10000;

  const res = await GetReplayData(
    [
      timePark.value[0].format("YYYY-MM-DD hh:mm:ss") + ".000",
      timePark.value[1].format("YYYY-MM-DD hh:mm:ss") + ".000",
    ],
    long
  );
  // const res = replayData1;
  loading.value = false

  const res2 = res?.hits?.hits;
  if (!res2) return;

  const res3 = res2.map((e) => e?._source?.data);
  const replayData = [];
  for (let i = 0; i < res3.length; i++) {
    if (res3[i].includes("失败")) {
      continue;
    }
    res3[i] = JSON.parse(
      res3[i].replaceAll(" ", "").replace("\r\n天车实时信息:-", "")
    );
    replayData.push({ VehicleInfo: [res3[i]] });
  }

  const dataTime = replayData.map((e) => e.VehicleInfo[0].lastTime);
  let minTime = 0;
  let maxTime = 0;
  for (let i = 0; i < dataTime.length; i++) {
    dataTime[i] = dataTime[i].slice(0, 10) + " " + dataTime[i].slice(10);
    const time = new Date(dataTime[i]);
    replayData[i].VehicleInfo[0].timeStamp = time * 1;
    if (minTime === 0 || time * 1 < minTime) {
      minTime = time * 1;
    }
    if (maxTime === 0 || time * 1 > maxTime) {
      maxTime = time * 1;
    }
  }
  sliderTimePark.value = [minTime, maxTime];

  STATE.mainBus.currentReplayData.value = replayData;
  STATE.mainBus.run(replayData);

  STATE.mainBus.replayPaused.value = false;
  STATE.mainBus.replayIndex.value = 0;
  STATE.mainBus.replaySlider.value = 0;
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
  },
];
let sliderTimePark = ref([]);
const stop = ref(true);

function sliderFormat(e) {
  if (
    sliderTimePark.value.length &&
    STATE.mainBus.currentReplayData.value.length
  ) {
    // const long = sliderTimePark.value[1] - sliderTimePark.value[0]
    // const progress = e / 1000
    // const time = new Date(Math.floor(long * progress) + sliderTimePark.value[0])
    // return time.format('YYYY-MM-DD hh:mm:ss')
    const format = new Date(
      STATE.mainBus.currentReplayData.value[
        STATE.mainBus.replayIndex.value
      ].VehicleInfo[0].timeStamp
    ).format("YYYY-MM-DD hh:mm:ss");
    return format;
  } else {
    return "无数据";
  }
}
function disabledDate(date) {
  return date > new Date();
}
function handlePause() {
  if(loading.value) return
  if (!STATE.mainBus.currentReplayData.value.length) {
    return;
  }
  STATE.mainBus.replayPaused.value = !STATE.mainBus.replayPaused.value;
  STATE.sceneList.skyCarList.forEach((e) => {
    e.replayRun = !STATE.mainBus.replayPaused.value;
  });

  if (STATE.mainBus.replayPaused.value) {
    STATE.mainBus.pause();
  } else {
    if (
      STATE.mainBus.replayIndex.value ===
      STATE.mainBus.currentReplayData.value.length - 1
    ) {
      STATE.mainBus.reset();
      STATE.mainBus.replayIndex.value = 0;
      STATE.mainBus.replaySlider.value = 0;
    }
    stop.value = false;
    STATE.mainBus.replayPaused.value = false;
    STATE.mainBus.run(STATE.mainBus.currentReplayData.value);
  }
}
function selectChange(e) {
  if (!e) {
    const fuckingInput = document.getElementsByClassName("times");
    if (fuckingInput[0]) {
      setTimeout(() => {
        fuckingInput[0].children[0].children[0].children[0].className =
          "el-input__wrapper";
      }, 0);
    }

    STATE.mainBus.replayTimes.value = times.value;
    if (STATE.mainBus.currentReplayData.value.length) {
      STATE.mainBus.run(STATE.mainBus.currentReplayData.value);
    }
  }
}
function sliderChange(e) {
  if (sliderTimePark.value.length) {
    const progress = e / 1000;
    STATE.mainBus.replayIndex.value = Math.floor(
      progress * STATE.mainBus.currentReplayData.value.length
    );
    if (
      STATE.mainBus.replayIndex.value >=
      STATE.mainBus.currentReplayData.value.length
    ) {
      STATE.mainBus.replayIndex.value =
        STATE.mainBus.currentReplayData.value.length - 1;
    }
    const currentData =
      STATE.mainBus.currentReplayData.value[STATE.mainBus.replayIndex.value];
    const car = STATE.sceneList.skyCarList.find(
      (e) => e.id === currentData.VehicleInfo[0].ohtID
    );

    if (!car) return;

    car.history = [];
    car.nextLine = [];
    for (let i = 0; i < GLOBAL.messageLen; i++) {
      if (STATE.mainBus.replayIndex.value - i > 0) {
        car.history.push(
          STATE.mainBus.currentReplayData.value[
            STATE.mainBus.replayIndex.value - (GLOBAL.messageLen - 1 - i)
          ].VehicleInfo[0]
        );
      }
    }

    STATE.mainBus.currentReplayData.value[STATE.mainBus.replayIndex.value].VehicleInfo.forEach((info) => {
      if (!info?.ohtID) return;
      const skyCar = STATE.sceneList.skyCarList.find(
        (car) => car.id === info.ohtID
      );


      if (skyCar) {
        skyCar.handleSkyCar(info);
      } else {
        const newCar = new SkyCar({
          id: info.ohtID,
          coordinate: info.position,
        });
        newCar.handleSkyCar(info);
      }
    });

    const coordinate = Number(currentData.VehicleInfo[0].position);
    const map = DATA.pointCoordinateMap.find(
      (e) => e.startCoordinate < coordinate && e.endCoordinate > coordinate
    );
    if (!map) return;
    car.line = map.name.replace("_", "-");
    const lineMap = STATE.sceneList.linePosition[car.line];
    const lineProgress =
      (coordinate - map.startCoordinate) /
      (map.endCoordinate - map.startCoordinate);
    const index = Math.floor(lineMap.length * lineProgress);
    car.animationOver = true;
    car.run = true;
    car.isAnimationSoon = false;
    car.lineIndex = index;
    car.replayRun = true;
    car.fastRun = false;

    const pause = STATE.mainBus.replayPaused.value;
    STATE.mainBus.run(STATE.mainBus.currentReplayData.value);
    if (pause) {
      STATE.mainBus.replayPaused.value = true;
      STATE.mainBus.pause();
    }
  }
}
function datePickerChange(e) {
  if (e[1] * 1 - e[0] * 1 > 3600000) {
    ElMessage.warning("时间范围不能超过1小时");
    timePark.value[0] = new Date(e[1] * 1 - 3600000);
  }
}
function handleStop() {
  if(loading.value) return
  stop.value = true;
  STATE.mainBus.pause();
  STATE.mainBus.reset();
  STATE.mainBus.replayIndex.value = 0;
  STATE.mainBus.replaySlider.value = 0;
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
    background: #fff;
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
    color: #fff;
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

:deep(.times .el-tooltip__trigger) {
  background: none;
  width: 5vw;
  border: none;
  box-shadow: 0 0 0 1px #ffffff52 inset !important;

  input {
    color: #fff;
    text-align: center;
  }

  .el-input__suffix {
    display: none;
  }
}

:deep(.control .el-input__wrapper) {
  background: none;
  border: none !important;
  box-shadow: none;
}

:deep(.control .el-select__selected-item) {
  color: #fff;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #fff inset !important;
}

.el-select-dropdown__item {
  text-align: center;
  padding: 0;
}

.progress {
  position: absolute;
  top: 11%;
  left: 35%;
  width: 30%;
}
</style>
