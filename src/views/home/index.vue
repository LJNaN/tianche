<script setup>
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import Header from '@/components/Header.vue'
import Right from './right.vue'
import Bottom from './bottom.vue'
</script>

<template>
  <div class="home">
    <Header></Header>
    <Right></Right>
    <Bottom></Bottom>
  </div>
</template>

<style scoped>
.home {
  background: url("/assets/3d/img/1.png") center / 100% 100% no-repeat;
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
}
</style>
