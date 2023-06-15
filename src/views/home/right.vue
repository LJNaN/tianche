<template>
  <div class="right">
    <div class="topdiv">
      <Chart :option="option" width="100%" height="100%"></Chart>
    </div>
    <div class="inthediv">
      
    </div>
    <div class="underdiv">

    </div>
       
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import * as echarts from "echarts";
import Chart from "@/components/Chart.vue";

const option = reactive({
    backgroundColor: '',
    grid: {
      top: '30%',
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: "rgba(1, 13, 19, 0.5)",
      borderWidth: 1,
      axisPointer: {
        type: 'shadow',
        // label: {
        //   show: true,
        // },
      },
      formatter: function (params) {
        var str = "";
        if (params.length > 0) {
          str = params[0].name + "<br/>"
        }
        for (var i = 0; i < params.length; i++) {
          if (params[i].seriesName !== "") {
            str +=
              params[i].seriesName +
              ':' +
              params[i].value +
              "%<br/>";
          }
        }
        return str;
      },
      textStyle: {
        color: "rgba(212, 232, 254, 1)",
        // fontSize: fontChart(0.24),
      },
      extraCssText: "z-index:2"
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
      type: 'category',
      data: ['01G01', '01G01', '01G01', '01G01', '01G01', '01G01', '01G01'],
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: '#FFF', //X轴文字颜色
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '',
        nameGap: 30,  // 表现为上下位置
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
            color: '#eeeeee',
          },
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#FFF',
          },
        },
      },
      {
        type: 'value',
        name: '',
        nameTextStyle: {
          color: '',
          padding: [0, 0, 0, 40], // 四个数字分别为上右下左与原位置距离
        },
        nameGap: 20,  // 表现为上下位置
        position: 'right',
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#FFF',
          },
          formatter: "{value} %",
        },
        max: 100,
      },
    ],
    series: [
      {
        name: 'Capacity',
        type: 'bar',
        barWidth: 14,
        itemStyle: {
          normal: {
            color: '#6DC8EC',
          },
        },
        data: [91, 92, 88, 91, 87, 93, 91, 89, 92, 87],
      },
      {
        name: 'Used',
        type: 'bar',
        barWidth: 14,
        itemStyle: {
          normal: {
            color: '#5AD8A6',
          },
        },
        data: [78, 82, 79, 80, 83, 79, 85, 78, 83, 78],
      },     
      {
        name: 'OHBRatio',
        type: 'line',
        yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
        showAllSymbol: true, //显示所有图形。
        symbol: 'circle', //标记的图形为实心圆
        symbolSize: 8, //标记的大小
        itemStyle: {
          //折线拐点标志的样式
          color: 'white',
          borderWidth: '2',
          borderColor: '#fac858',
        },
        lineStyle: {
          color: '#fac858',
        },
        data: [81, 84, 80, 83, 82, 81, 83, 82, 85, 81],
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
  word-break: break-all;
  position: absolute;
  right: 0;
  top: 0;
  width: 30%;
  height: 100%;
  z-index: 2;

  .topdiv{
    word-break: break-all;
    position: absolute;
    top: 12%;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .inthediv{
    word-break: break-all;
    position: absolute;
    top: 38%;
    width: 100%;
    height: 25%;
    z-index: 2;
  }
  .underdiv{
    word-break: break-all;
    position: absolute;
    top: 64%;
    width: 100%;
    height: 25%;
    z-index: 2;
  }

  .echart1 {
    width: 100%;
    height: 100%;
  }
}
</style>
