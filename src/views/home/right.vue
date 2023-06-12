<template>
  <div class="right">
    homerighthomerighthomerighthomerighthomerighthomerighthomerighthomeright
    <Chart :option="option" width="100%" height="50%"></Chart>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import * as echarts from "echarts";
import Chart from '@/components/Chart.vue'

const option = reactive({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      // 坐标轴指示器，坐标轴触发有效
      type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
    },
    //formatter: '{a}<br />{c}'
  },
  backgroundColor: "#0c2d55",
  color: ["#18f0fd", "#00c4fd", "#3f90ff"],
  legend: {
    show: true,
    top: "2%",
    icon: "rect",
    itemWidth: 15, // 图例标记的图形宽度。
    itemHeight: 15, //  图例标记的图形高度。
    textStyle: {
      color: "#fff",
      fontSize: 14,
      padding: [0, 8, 0, 8],
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      axisLine: {
        //坐标轴轴线相关设置。数学上的x轴
        show: true,
        lineStyle: {
          color: "rgb(41,188,245)",
        },
      },
      axisLabel: {
        //坐标轴刻度标签的相关设置
        textStyle: {
          color: "#FFFFFF",
          fontSize: 12,
        },
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#233653",
        },
      },
      axisTick: {
        show: false,
      },
      data: [
        "2022年12月",
        "2023年1月",
        "2023年2月",
        "2023年3月",
        "2023年4月",
        "2023年5月",
      ],
    },
  ],
  yAxis: [
    {
      name: "t",
      nameTextStyle: {
        color: "#fff",
        fontSize: 12,
        padding: [0, 60, 0, 0],
      },
      // minInterval: 1,
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          color: "#1160a0",
          type: "dashed",
        },
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#008de7",
        },
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#fff",
          fontSize: 14,
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: false,
    },
  ],
  series: [
    {
      name: "1",
      type: "bar",
      stack: "搜索引擎",
      barWidth: 40,
      label: {
        show: false,
      },
      data: [620, 732, 701, 734, 1090, 1130, 1120],
    },
    {
      name: "2",
      type: "bar",
      label: {
        show: false,
      },
      stack: "搜索引擎",
      data: [120, 132, 101, 134, 290, 230, 220],
    },
    {
      name: "3",
      type: "bar",

      label: {
        show: false,
      },
      stack: "搜索引擎",
      data: [120, 132, 101, 134, 290, 230, 220],
    },
  ],
})

setInterval(() => {
  option.series.forEach(e => {
    let randomDataArr = []
    for (let i = 0; i < 7; i++) {
      randomDataArr.push(Math.floor(Math.random() * 500) + 500)
    }
    e.data = randomDataArr
  })
}, 6000)

onMounted(() => {
});
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
