<script setup>
import Scene from '@/views/Scene.vue'
import { ref } from 'vue'
import { VUEDATA } from '@/VUEDATA.js'

// 二维全局变量

VUEDATA.chartShow = ref(true) // 二维图标显隐
VUEDATA.selectedItem = ref([]) // 二维界面图表部分显隐



</script>

<template>
  <Scene />
  <router-view></router-view>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  height: 100%;
  background-color: #999;
  pointer-events: none;
}
</style>
