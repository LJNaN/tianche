<template>
  <div class="right">
    <div class="topdiv">
      <div class="zuyoutp"></div>
      <div class="youtu">

      </div>
      <p class="topp">OHB Storage Ratio</p>
      <Chart :option="option" width="100%" height="100%"></Chart>
    </div>
    <div class="inthediv">
      <div class="zuyoutp"></div>
      <div class="inttu">

      </div>
      <p class="inthep">MCBF</p>
      <Chart :option="option2" width="100%" height="100%"></Chart>
    </div>
    <div class="underdiv">
      <div class="zuyoutp"></div>
      <div class="undertu">

      </div>
      <p class="underp">MTBF</p>
      <Chart :option="option3" width="100%" height="100%"></Chart>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import * as echarts from "echarts";
import Chart from "@/components/Chart.vue";
import { get15Day } from '@/utils/get15Day'
import { OhbStorageRatio } from '@/axios/api'

const option = reactive({
  backgroundColor: "",
  grid: {
    top: "30%",
    left: "5%",
    right: "5%",
    bottom: "0%",
    containLabel: true,
  },
  tooltip: {
    trigger: "axis",
    borderWidth: 1,
    axisPointer: {
      type: "shadow",
      // label: {
      //   show: true,
      // },
    },
    formatter: function (params) {
      var str = "";
      if (params.length > 0) {
        str = params[0].name + "<br/>";
      }
      for (var i = 0; i < params.length; i++) {
        if (params[i].seriesName !== "") {
          str += params[i].seriesName + ": " + params[i].value + "<br/>";
        }
      }
      return str;
    },
    extraCssText: "z-index:2",
  },
  legend: {
    left: "center",
    top: 30,
    itemWidth: 15,
    itemHeight: 10,
    itemGap: 15,
    borderRadius: 4,
    textStyle: {
      color: "#FFF",
      fontFamily: "Alibaba PuHuiTi",
      fontSize: 14,
      fontWeight: 400,
    },
  },
  xAxis: {
    type: "category",
    data: [],
    axisLine: {
      show: true,
      lineStyle: {
        width: 2,
        color: "rgba(208, 199, 199, 0.78)",
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: "#FFF", //X轴文字颜色
        fontSize: 10
      },
      interval: 0,
      overflow: 'breakAll'
    },
  },
  yAxis: [
    {
      type: "value",
      name: "",
      nameGap: 30, // 表现为上下位置
      nameTextStyle: {
        padding: [0, 0, 0, -30],
        color: "#FFF",
        fontFamily: "Alibaba PuHuiTi",
        fontSize: 14,
        fontWeight: 600,
      },
      splitLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: "rgba(173, 162, 162, 0.25)",
        },
        opacity: 0.2,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: "rgba(208, 199, 199, 0.78)",
        },
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#FFF",
        },
      },
    },
    {
      type: "value",
      name: "",
      nameTextStyle: {
        color: "",
        padding: [0, 0, 0, 40], // 四个数字分别为上右下左与原位置距离
      },
      nameGap: 20, // 表现为上下位置
      position: "right",
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: "rgba(208, 199, 199, 0.78)",
        },
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#FFF",
        },
        formatter: "{value} %",
      },
      max: 100,
    },
  ],
  series: [
    {
      name: "Capacity",
      type: "bar",
      barWidth: 10,
      itemStyle: {
        color: {
          type: "linear",
          x: 0, //右
          y: 0, //下
          x2: 0, //左
          y2: 1, //上
          colorStops: [
            {
              offset: 0.4,
              color: "rgba(53, 128, 197, 1)", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "rgba(21, 63, 102, 1)", // 100% 处的颜色
            },
          ],
        },
        // borderWidth: 0.5,
        // borderType: "solid",
        // borderColor: "rgba(220, 214, 214, 1)",
      },
      data: [],
    },
    {
      name: "Used",
      type: "bar",
      barWidth: 10,
      itemStyle: {
        color: {
          type: "linear",
          x: 0, //右
          y: 0, //下
          x2: 0, //左
          y2: 1, //上
          colorStops: [
            {
              offset: 0.4,
              color: "rgba(15, 199, 255, 1)", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "rgba(53, 126, 194, 1)", // 100% 处的颜色
            },
          ],
        },
        // borderWidth: 0.5,
        // borderType: "solid",
        // borderColor: "rgba(220, 214, 214, 1)",
      },
      data: [],
    },
    {
      name: "OHBRatio",
      type: "line",

      yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
      showAllSymbol: true, //显示所有图形。
      symbol: "circle", //标记的图形为实心圆
      symbolSize: 0, //标记的大小
      itemStyle: {
        //折线拐点标志的样式
        color: "white",
        borderWidth: "0",
        // borderColor: "#fac858",
      },
      lineStyle: {
        width: 3,
        color: "rgba(169, 170, 76, 1)",
      },
      data: [],
    },
  ],
});

const option2 = reactive({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      // 坐标轴指示器，坐标轴触发有效
      type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
    },
    //formatter: '{a}<br />{c}'
  },
  color: ["#5E99DA", "#1A6A74"],
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
        show: true,
        lineStyle: {
          width: 2,
          color: "rgba(208, 199, 199, 0.78)",
        },
      },
      axisLabel: {
        //坐标轴刻度标签的相关设置
        textStyle: {
          color: "#FFFFFF",
          fontSize: 12,
        },
        rotate: 60,
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
      data: get15Day()
    },
  ],
  yAxis: [
    {
      max: 100000,
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
          width: 2,
          color: "rgba(173, 162, 162, 0.25)",
        },
        opacity: 0.2,
      },
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: "rgba(208, 199, 199, 0.78)",
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
    },
  ],
  series: [
    {
      itemStyle: {
        color: {
          type: "linear",
          x: 0, //右
          y: 0, //下
          x2: 0, //左
          y2: 1, //上
          colorStops: [
            {
              offset: 0.4,
              color: "#388eff", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "#1a3760", // 100% 处的颜色
            },
          ],
        },
        borderRadius: [20, 20, 20, 20],
      },
      // name: 'xxxxx',
      type: "bar",
      stack: "搜索引擎",
      barWidth: 40,
      //barWidth: 30,
      barWidth: "30%",
      label: {
        show: false,
      },

      data: (() => {
        let arr = []
        for (let i = 0; i < 15; i++) {
          arr.push(Math.floor(Math.random() * 10000) + 60000)
        }
        return arr
      })(),
    },
  ],
});

const option3 = reactive({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      // 坐标轴指示器，坐标轴触发有效
      type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
    },
    //formatter: '{a}<br />{c}'
  },
  color: ["#5E99DA", "#1A6A74"],
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
    bottom: "-3%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: "rgba(208, 199, 199, 0.78)",
        },
      },
      axisLabel: {
        //坐标轴刻度标签的相关设置
        textStyle: {
          color: "#FFFFFF",
          fontSize: 12,
        },
        rotate: 60,
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
      data: get15Day()
    },
  ],
  yAxis: [
    {
      max: 3000,
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
          width: 2,
          color: "rgba(173, 162, 162, 0.25)",
        },
        opacity: 0.2,
      },
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: "rgba(208, 199, 199, 0.78)",
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
    },
  ],
  series: [
    {
      itemStyle: {
        color: {
          type: "linear",
          x: 0, //右
          y: 0, //下
          x2: 0, //左
          y2: 1, //上
          colorStops: [
            {
              offset: 0.4,
              color: "#388eff", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "#1a3760", // 100% 处的颜色
            },
          ],
        },
        borderRadius: [20, 20, 20, 20],
      },
      // name: 'xxxxx',
      type: "bar",
      stack: "搜索引擎",
      // barWidth: 40,
      label: {
        show: false,
      },
      barWidth: "30%",
      data: (() => {
        let arr = []
        for (let i = 0; i < 15; i++) {
          arr.push(Math.floor(Math.random() * 1000) + 2000)
        }
        return arr
      })(),
    },
  ],
});


getData()
function getData() {
  OhbStorageRatio().then(res => {
    const xAxis = []
    const used = []
    const ohbRatio = []
    const capacity = []

    res.data.forEach(e => {
      xAxis.push(e.ohbId)
      used.push(e.used || '0')
      ohbRatio.push((e.ohbRatio * 100) || '0')
      capacity.push(e.capacity || '0')
    })

    option.xAxis.data = xAxis
    option.series[0].data = capacity
    option.series[1].data = used
    option.series[2].data = ohbRatio
    console.log(option)
  })
}


setInterval(() => {
  getData()

  option2.series[0].data = (() => {
    let arr = []
    for (let i = 0; i < 15; i++) {
      arr.push(Math.floor(Math.random() * 10000) + 60000)
    }
    return arr
  })()

  option3.series[0].data = (() => {
    let arr = []
    for (let i = 0; i < 15; i++) {
      arr.push(Math.floor(Math.random() * 1000) + 2000)
    }
    return arr
  })()
}, 60 * 1000 * 10);

onMounted(() => { });
</script>

<style lang="less" scoped>
.right {
  background: url("/assets/3d/img/28.png") center / 100% 100% no-repeat;
  word-break: break-all;
  position: absolute;
  right: 0.5%;
  bottom: 1.5%;
  width: 24.8%;
  height: 87.5%;
  z-index: 2;

  .topdiv {
    word-break: break-all;
    position: absolute;
    top: 10%;
    width: 100%;
    height: 25%;
    z-index: 2;

    .zuyoutp {
      // border: 1px solid red;
      word-break: break-all;
      position: absolute;
      width: 97%;
      height: 100%;
      left: 1%;
      z-index: 2;
      background: url("/assets/3d/img/26.png") center / 100% 100% no-repeat;
    }

    .topp {
      word-break: break-all;
      position: absolute;
      right: 10%;
      top: -12%;
      z-index: 2;
      color: #f64c3f;
    }
  }

  .inthediv {
    word-break: break-all;
    position: absolute;
    top: 42%;
    width: 100%;
    height: 25%;
    z-index: 2;

    .zuyoutp {
      // border: 1px solid red;
      word-break: break-all;
      position: absolute;
      width: 97%;
      height: 100%;
      left: 1%;
      z-index: 2;
      background: url("/assets/3d/img/26.png") center / 100% 100% no-repeat;
    }

    .inthep {
      word-break: break-all;
      position: absolute;
      right: 10%;
      top: -12%;
      z-index: 2;
      color: #f99004;
    }
  }

  .underdiv {
    word-break: break-all;
    position: absolute;
    width: 100%;
    height: 25%;
    bottom: 3.5%;
    z-index: 2;

    .zuyoutp {
      // border: 1px solid red;
      word-break: break-all;
      position: absolute;
      width: 97%;
      height: 100%;
      left: 1%;
      z-index: 2;
      background: url("/assets/3d/img/26.png") center / 100% 100% no-repeat;
    }

    .underp {
      word-break: break-all;
      position: absolute;
      right: 10%;
      top: -12%;
      z-index: 2;
      color: #5bae2a;
    }
  }

  .youtu {
    word-break: break-all;
    position: absolute;
    width: 1%;
    height: 43%;
    right: 2%;
    top: -26%;
    background: url("/assets/3d/img/7.png") center / 100% 100% no-repeat;
  }

  .inttu {
    word-break: break-all;
    position: absolute;
    width: 1%;
    height: 43%;
    right: 2%;
    top: -26%;
    background: url("/assets/3d/img/9.png") center / 100% 100% no-repeat;
  }

  .undertu {
    word-break: break-all;
    position: absolute;
    width: 1%;
    height: 43%;
    right: 2%;
    top: -26%;
    background: url("/assets/3d/img/8.png") center / 100% 100% no-repeat;
  }

  .echart1 {
    width: 100%;
    height: 100%;
  }
}
</style>