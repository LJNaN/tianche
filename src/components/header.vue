<script setup>
import { onMounted, ref } from "vue";
import * as echarts from "echarts";

// let url = ref('./assets/3d/img/4.png')
</script>

<template>
  <div class="header">
    <!-- <img :src="url"> -->
  </div>
  
</template>

<style scoped>
.header {
  background: url('/assets/3d/img/4.png') center / 100% 100% no-repeat;
  border: 1px solid red;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 10%;
  z-index: 2;
  pointer-events: all;
}
.img {

}
</style>
