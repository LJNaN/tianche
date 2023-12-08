<script setup>
import Scene from '@/views/Scene.vue'
import { ref } from 'vue'
import { VUEDATA } from '@/VUEDATA.js'
import { progress } from '@/utils/progress.js'

if(location.hash.includes('editor')) {
  VUEDATA.isEditorMode.value = true
}


progress.init()


// 二维全局变量
VUEDATA.deviceShow.value = true // 机台显隐
VUEDATA.selectedItem.value = [] // 二维界面图表部分显隐



</script>

<template>
  <Scene />
  <router-view></router-view>
  <p class="version">Version 1.7.2</p>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  height: 100%;
  background-color: #999;
  pointer-events: none;
}

.version {
  position: fixed;
  bottom: 0;
  right: 0;
  color: #dbdbdb;
  font-size: 12px;
  z-index: 2;
}
</style>
