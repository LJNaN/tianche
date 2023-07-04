<template>
  <div class="chart">
    <div ref="chartRef" :style="{ height: height, width: width }" @mouseover="chartInstance.chartMouseover"
      @mouseout="chartInstance.chartMouseout">
    </div>
  </div>
</template>

<script setup>
import * as echarts from "echarts";
import { markRaw, watch, onMounted, onBeforeUnmount, toRefs, ref } from "vue";

// width height 在行内样式无效，需传过来
const props = defineProps({
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "100%",
  },
  autoResize: {
    type: Boolean,
    default: true,
  },
  gap: {
    type: Number,
    default: 1
  },
  autoTooltip: {
    type: Boolean,
    default: true,
  },
  autoSelect: {
    type: Boolean,
    default: true,
  },
  option: {
    type: [Object, null],
    required: true,
  },
  type: {
    type: String,
    default: "canvas",
  },
})


const { width, height, autoResize, gap, autoTooltip, autoSelect, option, type } = toRefs(props)


let chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  newAChart()
})


onBeforeUnmount(() => {
  if (!chartInstance) {
    return;
  }
  clearInterval(chartInstance.intervalTick);
  if (autoResize.value) {
    window.removeEventListener("resize", chartInstance.resizeHandler.bind(chartInstance));
  }
  chartInstance.chart.dispose();
  chartInstance = null;
})

function newAChart() {
  if (option.value?.hasOwnProperty('series')) {
    chartInstance = new initChart()
    if (autoResize.value) {
      window.addEventListener("resize", chartInstance.resizeHandler.bind(chartInstance));
    }
  }
}


class initChart {
  option = null // 配置
  dataLen = 0 // 数据长度
  chart = null // echart实例
  handleClick = null // 点击回调，没做

  currentIndex = 0 // 当前自动滚动index
  doneIndex = 0 // 已完成的数量
  gap = 1 // 每次跳多少个

  intervalTick = null

  constructor(innerOption) {
    if (!innerOption && !option.value) {
      return
    }
    if (!innerOption) {
      this.option = option.value
    } else {
      this.option = innerOption
    }

    this.dataLen = this.option.series[0].data.length
    this.chart = markRaw(echarts.init(chartRef.value, "", {
      renderer: type.value,
    }));

    if (this.option?.hasOwnProperty && this.option.hasOwnProperty('tooltip')) {
      this.option.tooltip = Object.assign({}, this.option.tooltip, this.tooltip);
    }
    this.chart.setOption(this.option);
    this.chart.on("click", this.handleClick);
    // 执行自动播放
    if (this.dataLen > 0) this.setTimer()
  }

  setTimer() {
    clearInterval(this.intervalTick);
    if (!autoTooltip.value && !autoSelect.value) return;
    this.currentIndex = -1; // 默认为-1
    this.doneIndex = this.dataLen - this.gap;
    this.intervalTick = setInterval(() => {
      if (this.currentIndex < this.dataLen - this.gap) {
        this.currentIndex += this.gap;
      } else {
        this.currentIndex = 0;
      } // 高亮当前图形
      this.doneIndex = this.currentIndex == 0 ? this.dataLen - this.gap : this.currentIndex - this.gap;
      // 显示 tooltip
      if (autoTooltip.value) {

        this.chart.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          dataIndex: this.currentIndex,
        });
      }
      // 切换选中状态
      if (autoSelect.value) {
        this.chart.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          dataIndex: this.currentIndex,
        });
        this.chart.dispatchAction({
          type: "downplay",
          seriesIndex: 0,
          dataIndex: this.doneIndex,
        });
      }
    }, 3000);
  }

  resizeHandler() {
    this.chart.resize();
  }


  chartMouseover() {
    if (this.intervalTick) {
      if (this.currentIndex > -1) {
        this.chart.dispatchAction({
          type: "downplay",
          seriesIndex: 0,
          dataIndex: this.currentIndex,
        });
        this.chart.dispatchAction({
          type: "downplay",
          seriesIndex: 0,
          dataIndex: this.doneIndex,
        });
      }
      clearInterval(this.intervalTick);
    }
  }

  //图表的鼠标移出事件，继续轮播图表
  chartMouseout() {
    this.setTimer();
  }

  // handleClick(params) {
  //   // this.$emit("click", params);
  // }

  setOptions() {
    if (!this.chart) {
      this.initChart();
      return;
    }
    // this.clearChart();
    this.resizeHandler();
    if (this.chart) {
      this.dataLen = this.option.series[0].data.length; //数据长度
      if (this.option?.hasOwnProperty && this.option.hasOwnProperty('tooltip')) {
        this.option.tooltip = Object.assign({}, this.option.tooltip, this.tooltip);
      }
      this.chart.setOption(this.option);
      // 执行自动播放
      this.setTimer();
    }
  }

  clearChart() {
    this.chart && this.chart.clear();
  }
}


watch(
  () => option,
  (newVal) => {
    if(!chartInstance) {
      newAChart()
    }

    if (chartInstance && newVal.value?.hasOwnProperty && newVal.value.hasOwnProperty('series')) {
      chartInstance.chart.setOption(newVal.value)
    }
  }, { deep: true }
)
</script>


<style>
.chart {
  pointer-events: all;
  height: 100%;
  width: 100%; 
}
</style>