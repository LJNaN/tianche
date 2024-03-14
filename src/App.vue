<script setup>
import Scene from '@/views/Scene.vue'
import { GLOBAL } from '@/GLOBAL.js'
import Progress from "@/components/Progress.vue";

if(location.hash.includes('editor')) {
  GLOBAL.isEditorMode.value = true
}

if(location.hash === '#/replay') {
  location.href = location.origin
}

</script>

<template>
  <Scene />
  <router-view></router-view>
  <Progress></Progress>
  <p class="version">Version 2.1.5</p>
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
