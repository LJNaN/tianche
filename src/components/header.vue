<template>
  <div class="header">
    <p class="title">{{ title }}</p>

    <Dropdown v-if="!VUEDATA.isEditorMode.value"></Dropdown>

    <div class="right">
      <!-- <div class="right-weather">
        <img :src="urlyun" />
        <p>多云 20-24℃</p>
      </div> -->

      <div class="right-time">
        <div>
          <p>{{ currentDateStr }}</p>
        </div>
        <div>
          <p>{{ "星期" + num }}</p>
        </div>
      </div>

      <div class="right-fill" @click="handleFillScreen">
        <img :src="qb" />
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref } from "vue";
import Dropdown from "@/components/Dropdown.vue";
import { VUEDATA } from "@/VUEDATA";

const title = window.title

function handleFillScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function convertWeekToChinese(day) {
  const digits = ["日", "一", "二", "三", "四", "五", "六"];
  return digits[day];
}
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;
const day = currentDate.getDate();
const week = currentDate.getDay();
const weekStr = convertWeekToChinese(week);
const num = `${weekStr}`;
const currentDateStr = `${year}/${month}/${day}`;
let qb = ref("./assets/3d/img/5.png");
</script>

<style scoped lang="less">
p {
  color: #ffff;
}

.header {
  background: url("/assets/3d/img/4.png") center / 134% 100% no-repeat;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 8%;
  z-index: 2;
  pointer-events: all;

  .title {
    position: absolute;
    color: #ffffff;
    font-size: 1.5vw;
    width: 100%;
    text-align: center;
    font-weight: normal;
    font-family: Microsoft YaHei;
    letter-spacing: 2px;
    text-shadow: 0 4px 2px #0005;
  }

  .right {
    position: absolute;
    right: 1%;
    top: 16%;
    width: 21.5%;
    height: 65%;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &-weather {
      display: flex;
      flex-direction: row;
      flex: 3;
      height: 60%;
      align-items: center;
      justify-content: center;

      img {
        width: 21px;
        height: 17px;
        margin-right: 10px;
        align-items: center;
        justify-content: center;
      }
    }

    &-time {
      height: 60%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    &-fill {
      margin-left: 5%;
      height: 60%;
      align-items: center;
      display: flex;
      justify-content: start;
      align-items: center;
      cursor: pointer;

      img {
        top: 10%;
        width: 18px;
        height: 18px;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.xy {
  position: absolute;
  width: 6%;
  height: 35%;
  bottom: -30%;
  right: 1%;
}

.xs {
  pointer-events: all;
  background: url("/assets/3d/img/53.png") center / 100% 100% no-repeat;
  position: absolute;
  width: 50%;
  height: 100%;
  top: 0%;
  left: 5%;
}

.yc {
  pointer-events: all;
  background: url("/assets/3d/img/54.png") center / 100% 100% no-repeat;
  cursor: pointer;
  position: absolute;
  width: 50%;
  height: 100%;
  top: 5%;
  left: 5%;
}

.xsyc {
  position: absolute;
  width: 20%;
  cursor: pointer;
  height: 89%;
  top: 3%;
  right: -20%;
}

.istrue {
  position: absolute;
  background: url("/assets/3d/img/53.png") center / 100% 100% no-repeat;
  width: 50%;
  height: 100%;
  bottom: 0%;
  right: 0%;
}

.isfalse {
  position: absolute;
  background: url("/assets/3d/img/54.png") center / 75% 75% no-repeat;
  width: 50%;
  height: 100%;
  right: 0%;
}
</style>
