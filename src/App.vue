<script setup>
import Scene from '@/views/Scene.vue'
</script>

<template>
  <Scene />
  <router-view></router-view>

  <div v-if="false" style="z-index: 22;">
    <div style="
        pointer-events: all;
        margin:0;
        color: #ffffff;
      ">

      <div style="
          position: absolute;
          background: url('./assets/3d/img/43.png') center / 100% 100% no-repeat;
          width: 25vw;
          height: 47vh;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          left: 50%;
          top: 50%;
          z-index: 2;
        ">
        <p style="
          font-size: 2vh;
          font-weight: bold;
          letter-spacing: 8px;
          margin-left: 4px;
          text-align: center;
          margin-top: 10%;
        ">
          天车
        </p>

        <div style="
          display: flex;
          flex-direction: column;
          width: 85%;
          margin: 4% auto 0 auto;
          height: 68%;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 5%;
            height: 12.5%;
            width: 100%;
            background: url('./assets/3d/img/44.png') center / 100% 100% no-repeat;
            ">
            <p style="font-size: 2vh;">id</p>
            <p style="font-size: 2vh;">xxxxx</p>
          </div>
        </div>
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
