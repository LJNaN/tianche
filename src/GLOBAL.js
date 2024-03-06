// 二维响应式控制的全局数据
import { ref } from 'vue'

const GLOBAL = {
  deviceShow: ref(true), // 机台显隐
  selectedItem: ref([]), // 二维界面图表部分显隐
  isEditorMode: ref(false), // 编辑模式
  messageLen: 4, // 天车堆栈数据条数

  
  loadingPercent: ref(0),
  loadedModelNum: 0,
  modelNum: 18
}

window.GLOBAL = GLOBAL

export { GLOBAL }