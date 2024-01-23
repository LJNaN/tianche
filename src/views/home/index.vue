<script setup>
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import Header from '@/components/header.vue'
import Right from './right.vue'
import Left from './left.vue'
import Bottom from './bottom.vue'
import Test from './test.vue'
import ExtensionBtn from './extensionBtn.vue'
import Compass from '@/components/compass.vue';
import { VUEDATA } from '@/VUEDATA'
</script>

<template>
  <div class="home">
    <!-- <img class="logo" src="/assets/3d/img/logo.png" alt="logo"> -->
    <Header></Header>
    <Compass></Compass>
    <Left></Left>
    <Right></Right>
    <Bottom></Bottom>
    <ExtensionBtn></ExtensionBtn>
    <!-- <Test></Test> -->
  </div>
</template>

<style scoped lang="less">
.home {
  background: url("/assets/3d/img/1.png") center / 100% 100% no-repeat;
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;

  .logo {
    position: absolute;
    left: 21.5%;
    top: 2.5%;
    height: calc(3vw * 1.347);
    width: 3vw;
  }
}
</style>