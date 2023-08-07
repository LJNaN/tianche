<template>
  <div class="header">
    <Dropdown></Dropdown>

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

      <div class="right-fill">
        <img :src="qb" />
      </div>
    </div>

    <!-- <div class="xy"> -->
      <!-- <div class="istrue" @click="isshow()"></div> -->
      <!-- <div class="isfalse" @click="isnotshow()"></div> -->
    <!-- </div> -->
  </div>
</template>

<script setup>
import { ref } from "vue";
import Dropdown from "@/components/Dropdown.vue";
import store from "../store";

function isshow() {
  // console.log(state,"state")
  store.state.isShowButton = !store.state.isShowButton;
}

function isnotshow() {
  // console.log(state,"state")
  store.state.isShowButton = false;
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

let url = ref("./assets/3d/img/4.png");
let urlyun = ref("./assets/3d/img/29.png");
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
  // border: 1px solid red;
  position: absolute;
  width: 4%;
  height: 35%;
  bottom: -30%;
  right: 1%;
}
.istrue {
  position: absolute;
  background: url("/assets/3d/img/49.png") center / 100% 100% no-repeat;
  // border: 1px solid red;
  width: 50%;
  height: 100%;
  bottom: 0%;
  right: 0%;
}
.isfalse {
  position: absolute;
  background: url("/assets/3d/img/50.png") center / 75% 75% no-repeat;
  // border: 1px solid red;
  width: 50%;
  height: 100%;
  // bottom: 0%;
  right: 0%;
}
</style>
