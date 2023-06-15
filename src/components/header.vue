<script setup>
import { onMounted, ref } from "vue";
import * as echarts from "echarts";

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

<template>
  <div class="header">
    <div class="right">
      <div class="right-weather">
        <img :src="urlyun"/>
        <p>多云 23-34℃</p>
      </div>
      <div class="right-time">
        <div>{{ currentDateStr }}</div>
        <div>{{"星期" + num}}</div>
      </div>
      
      <div class="right-fill">
        <img :src="qb">
      </div>
    </div>
    <!-- <img :src="url" /> -->
  </div>
</template>

<style scoped lang='less'>
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
    right: 0;
    top: 16%;
    width: 21.5%;
    height: 65%;
    display: flex;
    align-items: center;

    &-weather {
      display: flex;
      flex-direction: row;
      flex: 3;
      height: 60%;
      align-items: center;
      justify-content: center;
      img{
        width: 21px;
        height: 17px;
        margin-right: 10px;
        align-items: center;
        justify-content: center;
      }
    }
    &-time {
      flex: 3;
      height: 60%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    &-fill {
      flex: 1;
      height: 60%;
      align-items: center;
      display: flex;
      justify-content: start;
      align-items: center;
      img{
        top: 10%;
        width: 18px;
        height: 18px;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
