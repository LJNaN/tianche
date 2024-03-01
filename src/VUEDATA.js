// 二维响应式控制的全局数据
import { ref } from 'vue'

const VUEDATA = {
  deviceShow: ref(true), // 机台显隐
  selectedItem: ref([]), // 二维界面图表部分显隐
  isEditorMode: ref(false), // 编辑模式
  messageLen: 4, // 天车堆栈数据条数
  isReplayMode: ref(false),// 时间回溯模式
  replayPaused: ref(true), // 时间回溯暂停
  replayTimes: ref(1), // 时间回溯倍率
  replayIndex: ref(0), // 时间回溯当前索引
  replaySlider: ref(0), // 回溯进度条的千分比
}

window.VUEDATA = VUEDATA

export { VUEDATA }