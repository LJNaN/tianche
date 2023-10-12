<template>
  <div class="bottom" :style="{ background: `url('./assets/3d/img/${bgImg}.png') center / 100% 100% no-repeat` }">

    <div v-if="VUEDATA.selectedItem.value.includes(1)" class="leftdiv">
      <div class="zuyoutp"></div>
      <div class="lefttu"></div>
      <p class="zdivp">Alarm Info</p>
      <div class="tablediv">
        <div class="table-title">
          <span v-for="(item, index) in title" :key="index">{{ item }}</span>
        </div>
        <el-scrollbar class="table-content">
          <div v-for="(item) in alarmList" :key="item.alarmId" @click="handleAlertSkyCar(item.remark)"
            style="cursor: pointer;">
            <p :title="item.alarmCode + '     ' + item.alarmData + '     ' + item.remark + '     ' + item.createTime">
              <span class="zitichaochu">{{ item.alarmCode || '--' }}</span>
            </p>
            <p :title="item.alarmCode + '     ' + item.alarmData + '     ' + item.remark + '     ' + item.createTime">
              <span class="zitichaochu">{{ item.alarmData || '--' }}</span>
            </p>
            <p :title="item.alarmCode + '     ' + item.alarmData + '     ' + item.remark + '     ' + item.createTime">
              <span class="zitichaochu">{{ item.remark || '--' }}</span>
            </p>
            <p :title="item.alarmCode + '     ' + item.alarmData + '     ' + item.remark + '     ' + item.createTime">
              <span class="zitichaochu">{{ item.createTime || '--' }}</span>
            </p>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <div v-if="VUEDATA.selectedItem.value.includes(2)" class="zdiv">
      <div class="zuyoutp"></div>
      <div class="ztup"></div>
      <p class="zdivp">Delivery Time</p>
      <Chart :option="option2" width="100%" height="100%"></Chart>
    </div>

    <div v-if="VUEDATA.selectedItem.value.includes(3)" class="rdiv">
      <div class="zuyoutp"></div>
      <div class="rtu"></div>
      <p class="rdivp">Delivery Count</p>
      <Chart :option="option3" width="100%" height="100%"></Chart>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import * as echarts from "echarts";
import Chart from "@/components/Chart.vue";
import { STATE } from '@/ktJS/STATE.js'
import { API } from '@/ktJS/API.js'
import { get15Day } from '@/utils/get15Day'
import { McsDeliveryInfo } from '@/axios/api'
import { VUEDATA } from '@/VUEDATA'

const bgImg = computed(() => {
  let imgUrl = ''
  const targetElements = [1, 2, 3]
  const matchingElements = VUEDATA.selectedItem.value.filter(e => targetElements.includes(e))
  if (matchingElements.length === 0) imgUrl = '3'
  else if (matchingElements.length === 1) imgUrl = '61'
  else if (matchingElements.length === 2) imgUrl = '62'
  else if (matchingElements.length === 3) imgUrl = '3'

  return imgUrl
})

const title = ["报警代码", "异常描述", "天车", "创建时间"];

// 报警列表
const alarmList = ref([])
STATE.alarmList = alarmList

// 点击天车报警 跳转
function handleAlertSkyCar(id) {

  const skyCar = STATE.sceneList.skyCarList.find(e => e.id === id)
  if (skyCar) {
    skyCar.setAlert(true)
    setTimeout(() => {
      skyCar.setAlert(false)
    }, 60000)

    API.search('天车', id)
    const element = skyCar.popup.element
    const event = new MouseEvent('dblclick', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
}

// 数据格式
const mockAlarmList = [{
  alarmId: 0,
  alarmCode: "M2322",
  alarmData: "2322_天车前方障碍感知-远",
  remark: "V0015",
  createTime: "07-14 14:07:32",
}, {
  alarmId: 1,
  alarmCode: "M2321",
  alarmData: "2322_天车前方障碍感知-中",
  remark: "V0014",
  createTime: "07-14 14:07:19",
}, {
  alarmId: 2,
  alarmCode: "M2321",
  alarmData: "2322_天车前方障碍感知-中",
  remark: "V0009",
  createTime: "07-14 14:07:17",
}, {
  alarmId: 3,
  alarmCode: "M2322",
  alarmData: "2322_天车前方障碍感知-远",
  remark: "V0005",
  createTime: "07-14 14:07:02",
}, {
  alarmId: 4,
  alarmCode: "M2321",
  alarmData: "2322_天车前方障碍感知-中",
  remark: "V0013",
  createTime: "07-14 14:06:12",
}, {
  alarmId: 5,
  alarmCode: "M2322",
  alarmData: "2322_天车前方障碍感知-远",
  remark: "V0001",
  createTime: "07-14 14:05:53",
}]
// alarmList.value = mockAlarmList

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
          str += params[i].seriesName + ": " + params[i].value + " 秒<br/>";
        }
      }
      return str;
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
      rotate: 60,
      show: true,
      textStyle: {
        color: "#FFF", //X轴文字颜色
      },
    },
  },
  yAxis: [
    {
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
      data: [],
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
      data: [],
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
      data: [],
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
    bottom: "4%",
    containLabel: true,
  },
  xAxis:
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
    data: []
  },

  yAxis: [
    {
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
      data: [],
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
      data: [],
    },
  ],
});


getData()
function getData() {
  McsDeliveryInfo().then(res => {
    const xAxis = []
    const DeliveryTime = []
    const MFGTime = []
    const CycleTime = []
    const CycleCount = []
    const MFGCount = []

    res.data.forEach(e => {
      const dateStrArr = e.mfgdate.split('-')
      xAxis.push(dateStrArr[1] + '-' + dateStrArr[2])
      DeliveryTime.push(e.deliverytime || '0')
      MFGTime.push(e.mfgtime || '0')
      CycleTime.push(e.cycletime || '0')
      CycleCount.push(e.cyclecnt || '0')
      MFGCount.push(e.mfgcnt || '0')
    })

    option2.xAxis.data = xAxis
    option2.series[0].data = DeliveryTime
    option2.series[1].data = MFGTime
    option2.series[2].data = CycleTime

    option3.xAxis.data = xAxis
    option3.series[0].data = CycleCount
    option3.series[1].data = MFGCount

  }).catch(() => {})
}

setInterval(() => {
  getData()
}, 30 * 1000);

</script>

<style lang='less' scoped>
.bottom {
  word-break: break-all;
  position: absolute;
  display: flex;
  left: 0.5%;
  bottom: 1.5%;
  height: 30%;
  z-index: 2;

  .leftdiv {
    margin-left: 0.5vw;
    position: relative;
    word-break: break-all;
    width: 24vw;
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
      font-weight: bold;
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
    margin-left: 0.5vw;
    position: relative;
    word-break: break-all;
    width: 24vw;
    height: 90%;
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

    .zdivp {
      word-break: break-all;
      position: absolute;
      left: 15%;
      top: 10%;
      z-index: 2;
      color: #f64c3f;
      font-weight: bold;
    }
  }

  .rdiv {
    margin-left: 0.5vw;
    position: relative;
    word-break: break-all;
    width: 24vw;
    height: 90%;
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
      font-weight: bold;
    }
  }

  .table-content {
    pointer-events: all;
    height: 85%;

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
        color: #f64c3f;
        font-weight: bold;
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
