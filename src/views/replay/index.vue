<template>
  <div class="home">
    <Header></Header>
    <Compass></Compass>
    <ExtensionBtn></ExtensionBtn>

    <div class="timepicker">
      <div class="timepicker-label">回溯时间:</div>
      <el-date-picker v-model="timePark" type="datetimerange" range-separator="-" start-placeholder="开始时间"
        end-placeholder="结束时间" :teleported="false" :disabled-date="disabledDate" />
      <div class="timepicker-confirm" @click="handleConfirm">确定</div>
    </div>

    <div class="control">
      <div class="pause" :style="{ background: `url('./assets/3d/img/${paused ? 76 : 77}.png') center / 100% 100% no-repeat` }
        " @click="handlePause"></div>

      <el-slider class="slider" v-model="progress" :max="1000" />
      <span class="progressTime">{{ progressTime }}</span>
      <el-select v-model="times" class="times" placeholder="倍速" size="small" :teleported="false"
        @visible-change="selectChange">
        <el-option v-for=" item  in  timesOptions " :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import Header from "@/components/header.vue";
import ExtensionBtn from "@/components/extensionBtn.vue";
import Compass from "@/components/compass.vue";
import { VUEDATA } from "@/VUEDATA";
import { GetReplayData } from "@/axios/api.js";

const timePark = ref([new Date(), new Date()]);

function handleConfirm() {
  GetReplayData([
    timePark.value[0].format("YYYY-MM-DD hh:mm:ss") + ".000",
    timePark.value[1].format("YYYY-MM-DD hh:mm:ss") + ".000",
  ]);
}

let progress = ref(0);
let times = ref(1);
const timesOptions = [
  {
    value: 10,
    label: "10x",
  },
  {
    value: 5,
    label: "5x",
  },
  {
    value: 2,
    label: "2x",
  },
  {
    value: 1,
    label: "1x",
  },
  {
    value: 0.5,
    label: "0.5x",
  },
];
let paused = ref(true);
let progressTime = ref('-月-日 00:00:00')

function disabledDate(date) {
  return date > new Date()
}
function handlePause() {
  paused.value = !paused.value
}
function selectChange(e) {
  if (!e) {
    const fuckingInput = document.getElementsByClassName("times");
    if (fuckingInput[0]) {
      setTimeout(() => {
        fuckingInput[0].children[0].children[0].children[0].className = 'el-input__wrapper'
      }, 0)
    }
  }
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
  bottom: 5vh;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  display: flex;
  padding: 0 1vw;
  background-color: #0002;
  align-items: center;

  .pause {
    height: 1.2vw;
    width: 1.2vw;
    pointer-events: all;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 1vw;
  }

  .slider {
    pointer-events: all;
  }

  .progressTime {
    margin-left: 1vw;
    font-size: 12px;
    width: 8vw;
    text-align: center;
    color: #FFF;
    word-break: keep-all;
  }

  .times {
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
  box-shadow: 0 0 0 1px #ffffff52 inset !important;;

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
</style>
