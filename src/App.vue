<script setup>
import Scene from '@/views/Scene.vue'
</script>

<template>
  <Scene/>
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
