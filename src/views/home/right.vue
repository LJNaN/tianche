<template>
  <div class="right">
    homerighthomerighthomerighthomerighthomerighthomerighthomerighthomeright
    <Chart :option="option" width="100%" height="30vh"></Chart>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import * as echarts from "echarts";
import Chart from "@/components/Chart.vue";

const option = reactive({
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "5%",
    left: "center",
  },
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 1048, name: "Search Engine" },
        { value: 735, name: "Direct" },
        { value: 580, name: "Email" },
        { value: 484, name: "Union Ads" },
        { value: 300, name: "Video Ads" },
      ],
    },
  ],
});

setInterval(() => {
  option.series.forEach((e) => {
    let randomDataArr = [];
    for (let i = 0; i < 7; i++) {
      randomDataArr.push({
        value: Math.floor(Math.random() * 500) + 500,
        name: i,
      });
    }
    e.data = randomDataArr;
  });
}, 6000);

onMounted(() => {});
</script>


<style lang="less" scoped>
.right {
  border: 1px solid red;
  word-break: break-all;
  position: absolute;
  right: 0;
  top: 0;
  width: 30%;
  height: 100%;
  z-index: 2;

  .echart1 {
    pointer-events: all;
    height: 50%;
    width: 100%;
  }
}
</style>
