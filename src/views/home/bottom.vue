<template>
  <div class="bottom">

    <div class="leftdiv">
      <div class="zuyoutp"></div>
      <div class="lefttu"></div>
      <p class="zdivp">Alarm Info</p>
      <div class="tablediv">
        <div class="table-title">
          <span v-for="(item, index) in title" :key="index">{{ item }}</span>
        </div>
        <el-scrollbar class="table-content">
          <div v-for="(item) in alarmList" :key="item.alarmId">
            <p :title="item.alarmCode">
              <span class="zitichaochu">{{ item.alarmCode }}</span>
            </p>
            <p :title="item.alarmData">
              <span class="zitichaochu">{{ item.alarmData }}</span>
            </p>
            <p :title="item.remark">
              <span class="zitichaochu">{{ item.remark }}</span>
            </p>
            <p :title="item.createTime">
              <span class="zitichaochu">{{ item.createTime }}</span>
            </p>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <div class="zdiv">
      <div class="zuyoutp"></div>
      <div class="ztup"></div>
      <p class="zdivp">Delivery Time</p>
      <Chart :option="option2" width="100%" height="100%"></Chart>
    </div>

    <div class="rdiv">
      <div class="zuyoutp"></div>
      <div class="rtu"></div>
      <p class="rdivp">Delivery Count</p>
      <Chart :option="option3" width="100%" height="100%"></Chart>
    </div>
    
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import * as echarts from "echarts";
import Chart from "@/components/Chart.vue";
import { STATE } from '@/ktJS/STATE.js'

const title = ["报警代码", "异常描述", "天车", "创建时间"];

// 报警列表
const alarmList = ref([])
STATE.alarmList = alarmList

// 数据格式
const mockAlarmList = [
  {
    alarmId: 0,
    alarmCode: "M20531111111111111111",
    alarmData: "2053_天车前方 障礙检知-近 ",
    alarmType: "set",
    remark: "V0015",
    createTime: "2023-05-20 14:07:32",
  },
]

// 第二个表
const option2 = reactive({
  grid: {
    top: "45%",
    left: "5%",
    right: "5%",
    bottom: "4%",
    containLabel: true,
  },
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(1, 13, 19, 0.5)",
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
          str += params[i].seriesName + ":" + params[i].value + "秒<br/>";
        }
      }
      return str;
    },
    textStyle: {
      color: "rgba(212, 232, 254, 1)",
      // fontSize: fontChart(0.24),
    },
    extraCssText: "z-index:2",
  },
  legend: {
    left: "center",
    top: 75,
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
    data: [
      "07/25",
      "07/26",
      "07/27",
      "07/28",
      "07/29",
      "07/30",
      "07/31",
      "08/01",
      "08/02",
      "08/03",
      "08/04",
      "08/05",
      "08/06",
      "08/07",
    ],
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
      rotate: 60,
      show: true,
      textStyle: {
        color: "#FFF", //X轴文字颜色
      },
    },
  },
  yAxis: [
    {
      max: 300,
      type: "value",
      nameTextStyle: {
        color: "#fff",
        fontFamily: "Alibaba PuHuiTi",
        fontSize: 14,
        fontWeight: 600,
        // padding: [0, 0, 0, 40], // 四个数字分别为上右下左与原位置距离
      },
      nameGap: 30, // 表现为上下位置
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
        color: "#fff",
        fontSize: 14,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#eeeeee",
        },
      },
    },
  ],
  series: [
    {
      name: "Delivery Time",
      type: "line",
      // showAllSymbol: true, //显示所有图形。
      symbol: "circle", //标记的图形为实心圆
      symbolSize: 8, //标记的大小
      itemStyle: {
        //折线拐点标志的样式
        color: "white",
        borderWidth: "2",
        borderColor: "#5470c6",
      },
      lineStyle: {
        color: "#5470c6",
      },
      data: [
        134, 160, 153, 121, 156, 166, 178, 135, 145, 102, 170, 143, 153, 168,142,
      ],
    },
    {
      name: "MFGTime",
      type: "line",
      showAllSymbol: true, //显示所有图形。
      symbol: "circle", //标记的图形为实心圆
      symbolSize: 8, //标记的大小
      itemStyle: {
        //折线拐点标志的样式
        color: "white",
        borderWidth: "2",
        borderColor: "#91cc75",
      },
      lineStyle: {
        color: "#91cc75",
      },
      data: [150, 120, 132, 55, 40, 68, 75, 62, 174, 61, 52, 75, 96, 41, 34],
    },
    {
      name: "CycleTime",
      type: "line",
      showAllSymbol: true, //显示所有图形。
      symbol: "circle", //标记的图形为实心圆
      symbolSize: 8, //标记的大小
      itemStyle: {
        //折线拐点标志的样式
        color: "white",
        borderWidth: "2",
        borderColor: "#f3454b",
      },
      lineStyle: {
        color: "#f3454b",
      },
      data: [
        122, 146, 128, 146, 106, 160, 140, 123, 153, 162, 142, 152, 167, 145,
        163,
      ],
    },
  ],
});

// 第三个表
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
    top: "25%",
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
    top: "45%",
    left: "3%",
    right: "4%",
    bottom: "5%",
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
        rotate: 60,
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
        "07/25",
      "07/26",
      "07/27",
      "07/28",
      "07/29",
      "07/30",
      "07/31",
      "08/01",
      "08/02",
      "08/03",
      "08/04",
      "08/05",
      "08/06",
      "08/07",
      ],
    },
  ],
  yAxis: [
    {
      max: 12000,
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
              color: "#296DC4", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "#1a3760", // 100% 处的颜色
            },
          ],
        },
        borderRadius: [20, 20, 20, 20],
      },
      name: "CycleCount",
      type: "bar",
      stack: "搜索引擎",
      // barWidth: 40,
      barWidth: "20%",
      label: {
        show: false,
      },
      data: [
        5620, 4732, 6701, 3734, 8090, 6130, 4120, 3652, 4987, 8231, 4654, 5513, 10135, 6963,4752,
      ],
    },
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
              color: "#29AD9B", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "#1D4365", // 100% 处的颜色
            },
          ],
        },
        borderRadius: [20, 20, 20, 20],
      },
      name: "MFGCount",
      type: "bar",
      barWidth: "20%",
      label: {
        show: false,
      },
      stack: "搜索引擎",
      data: [
        3132, 5101, 2134, 6290, 1230, 1220, 1721, 5692, 2432, 4521, 2687, 1653, 2715, 2145,2963,
      ],
    },
  ],
});
</script>

<style lang='less' scoped>
.bottom {
  background: url("/assets/3d/img/3.png") center / 100% 100% no-repeat;
  word-break: break-all;
  position: absolute;
  left: 0.5%;
  bottom: 1.5%;
  width: 74%;
  height: 30%;
  z-index: 2;

  .leftdiv {
    word-break: break-all;
    position: absolute;
    left: 0.5%;
    bottom: 1.5%;
    width: 32%;
    height: 100%;
    z-index: 2;

    .zuyoutp {
      word-break: break-all;
      position: absolute;
      width: 100%;
      height: 70%;
      z-index: 2;
      top: 18%;
      background: url("/assets/3d/img/26.png") center / 100% 100% no-repeat;
    }

    .tablediv {
      background: linear-gradient(to right,
          rgba(29, 138, 255) -400%,
          rgba(29, 138, 255, 0));
      word-break: break-all;
      position: absolute;
      left: 5%;
      bottom: 15%;
      width: 90%;
      height: 55%;
      z-index: 2;
      overflow: hidden;
    }

    .zdivp {
      word-break: break-all;
      position: absolute;
      left: 15%;
      top: 10%;
      z-index: 2;
      color: #65e019;
    }

    .table-title {
      display: flex;
      align-items: center;
      height: 40px;
      color: #ffffff;
      font-size: 0.8vw;
      border-top: 1px solid #aaa;
      border-right: 1px solid #aaa;

      span {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        border-left: 1px solid #aaa;
        border-bottom: 1px solid #aaa;
      }
    }
  }

  .zdiv {
    word-break: break-all;
    position: absolute;
    left: 34%;
    bottom: 1.5%;
    width: 32%;
    height: 100%;
    z-index: 2;

    .zuyoutp {
      // border: 1px solid red;
      word-break: break-all;
      position: absolute;
      width: 100%;
      height: 70%;
      z-index: 2;
      top: 18%;
      background: url("/assets/3d/img/26.png") center / 100% 100% no-repeat;
    }

    .zdivp {
      word-break: break-all;
      position: absolute;
      left: 15%;
      top: 10%;
      z-index: 2;
      color: #f64c3f;
    }
  }

  .rdiv {
    word-break: break-all;
    position: absolute;
    right: 0.5%;
    bottom: 1.5%;
    width: 32%;
    height: 100%;
    z-index: 2;

    .zuyoutp {
      word-break: break-all;
      position: absolute;
      width: 100%;
      height: 70%;
      z-index: 2;
      top: 18%;
      background: url("/assets/3d/img/26.png") center / 100% 100% no-repeat;
    }

    .rdivp {
      word-break: break-all;
      position: absolute;
      left: 15%;
      top: 10%;
      z-index: 2;
      color: #f99004;
    }
  }

  .table-content {
    pointer-events: all;
    

    div {
      display: flex;
      height: 40px;
      align-items: center;
      height: 40px;
      color: #ffffff;
      font-size: 0.4vw;
      border-right: 1px solid #aaa;

      p {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 2%;
        width: 25%;
        border-left: 1px solid #aaa;
        border-bottom: 1px solid #aaa;
        height: 100%;
      }

      p:first-child {
        color: red;
      }
    }
  }

  .lefttu {
    word-break: break-all;
    position: absolute;
    width: 1%;
    height: 33%;
    left: 0%;
    top: 6%;
    background: url("/assets/3d/img/8.png") center / 100% 100% no-repeat;
  }

  .ztup {
    word-break: break-all;
    position: absolute;
    width: 1%;
    height: 33%;
    left: 0%;
    top: 6%;
    background: url("/assets/3d/img/7.png") center / 100% 100% no-repeat;
  }

  .rtu {
    word-break: break-all;
    position: absolute;
    width: 1%;
    height: 33%;
    left: 0%;
    top: 6%;
    background: url("/assets/3d/img/9.png") center / 100% 100% no-repeat;
  }

  .echart1 {
    width: 100%;
    height: 100%;
  }
}
</style>
