// 二维响应式控制的全局数据
import { ref } from 'vue'

const VUEDATA = {
  deviceShow: ref(true), // 机台显隐
  selectedItem: ref([]), // 二维界面图表部分显隐
  isEditorMode: ref(false) // 编辑模式
}

window.VUEDATA = VUEDATA

export { VUEDATA }