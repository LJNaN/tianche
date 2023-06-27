<script setup>
import Scene from '@/views/Scene.vue'
</script>

<template>
  <Scene />
  <router-view></router-view>

  <div v-if="false">
    <div style="
      pointer-events: all;
      cursor: pointer;
      margin:0;
      color: #ffffff;
    ">

      <div style="
        position: absolute;
        background: url('./assets/3d/img/39.png') center / 100% 100% no-repeat;
        width: 30vw;
        height: 20vh;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      ">
        <p style="font-size: 8vh;line-height: 80%; font-family: YouSheBiaoTiHei; text-align: center; margin-top: 7%;">设备信息</p>
      </div>

      <div style="
        position: absolute;
        background: url('./assets/3d/img/40.png') center / 100% 100% no-repeat;
        width: 10vw;
        height: 10vh;
        left: 50%;
        top: 65%;
        transform: translate(-50%, -50%);
        z-index: 2;
      ">
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  height: 100%;
  background-color: #999;
  pointer-events: none;
}
</style>
