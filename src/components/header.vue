<script setup>
import { onMounted, reactive, ref } from "vue";
import * as echarts from "echarts";
import Dropdown from "@/components/Dropdown.vue";

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

// let selectedOption = ref("天车");
const options = reactive(["天车", "轨道", "OHB", "卡匣", "设备", "指令"]);
</script>

<template>
  <div class="header">
    <div class="xlk">
      <Dropdown :options="['天车', '轨道', 'OHB', '卡匣', '设备', '指令']" />

      <!-- <select v-model="selectedOption" class="my-dropdown">
        <option value="天车">天车</option>
        <option value="轨道">轨道</option>
        <option value="OHB">OHB</option>
        <option value="卡匣">卡匣</option>
        <option value="设备">设备</option>
        <option value="指令">指令</option>
      </select> -->
    </div>
    <div class="my-p">
      <input type="text" name="" id="" placeholder="请输出设备id..."/>
    </div>

    <div class="right">
      <div class="right-weather">
        <img :src="urlyun" />
        <p>多云 23-34℃</p>
      </div>
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
  </div>
</template>

<style scoped lang='less'>
.my-p {
  // border: 1px solid red;
  word-break: break-all;
  position: absolute;
  font-size: 14px;
  width: 13.5%;
  height: 53%;
  z-index: 2;
  left: 6.5%;
  bottom: 1%;
  input {
    word-break: break-all;
    position: absolute;
    border: none;
    font-size: 14px;
    top: 27.5%;
    background: transparent;
    &:focus {
      border: none;
      outline: none;
      background: none;
    }
    &::placeholder {
      color: #a39696;
    }
  }
}
.my-dropdown {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  width: 100px;
  height: 30px;
  border-color: transparent;
  background-color: transparent;
  appearance: none;
  margin-left: 15px;
  // color: #FFFF;
}
select option {
  background-color: transparent;
}
select option[value="天车"],
select option[value="轨道"],
select option[value="OHB"],
select option[value="卡匣"],
select option[value="设备"],
select option[value="指令"] {
  background-color: transparent;
}

.xlk {
  background: url("/assets/3d/img/20.png") center / 100% 100% no-repeat;
  word-break: break-all;
  position: absolute;
  width: 19%;
  height: 53%;
  z-index: 2;
  bottom: 1%;
  left: 1%;
  pointer-events: all;
}
p {
  color: #ffff;
}
.header {
  // border: 1px solid red;
  background: url("/assets/3d/img/4.png") center / 134% 100% no-repeat;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 8%;
  z-index: 2;
  pointer-events: all;

  .right {
    // border: 1px solid red;
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
      img {
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
      // border: 1px solid red;
      flex: 1;
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
</style>