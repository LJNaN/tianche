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
    <div class="yyyy">

    </div>
    <div class="xlk">
      <Dropdown :options="['天车', '轨道', 'OHB', '卡匣', '设备', '指令']" />
    </div>

    <div class="my-p">
      <input type="text" class="my-p-input" placeholder="请输入设备id..." />
      <div class="search"></div>
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
.yyyy{
  border: 1px solid red;
  position: absolute;
  width: 10%;
  height: 10%;
}
.my-p {
  word-break: break-all;
  position: absolute;
  font-size: 14px;
  width: 13.5%;
  height: 53%;
  z-index: 2;
  left: 6.5%;
  bottom: 1%;

  &-input {
    word-break: break-all;
    position: absolute;
    border: none;
    font-size: 14px;
    top: 27.5%;
    background: transparent;
    color: #FFF;

    &:focus {
      border: none;
      outline: none;
      background: none;
    }

    &::placeholder {
      color: #aaaaaa;
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
}

select option {
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

.search {
  position: absolute;
  top: 10%;
  left: 10%;
  z-index: 2;
  width: 10%;
  height: 10%;
  border: 1px solid rgb(231, 16, 63);
}
</style>