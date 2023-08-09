<script setup>
import { CACHE } from '@/ktJS/CACHE'
import { ref } from 'vue'

let deg = ref(0)
setTimeout(() => {
  init()
},3000)
function init() {
  const control = CACHE.container.orbitControls
  control.addEventListener('change', () => {
    // 计算相机的旋转角度
    const angle = control.getAzimuthalAngle();
  
    // 将弧度转换为角度
    const degrees = angle * Bol3D.Math.RAD2DEG;
  
    // 将角度限制在0到360度之间
    const clampedDegrees = (degrees + 360) % 360;
    
    deg.value = clampedDegrees
  })
}

</script>

<template>
  <div class="zhi" :style="{transform: `rotateZ(${deg}deg)`}"></div>
  <div class="z" :style="{transform: `rotateZ(180deg)`}"></div>
</template>

<style scoped>
.zhi {
  height: 150px;
  width: 150px;
  position: fixed;
  top: 10%;
  left: 1%;
  background: url('/assets/3d/img/51.png') center / 100% 100% no-repeat;
  z-index: 2;
}

.z {
  height: 150px;
  width: 150px;
  position: fixed;
  top: 10%;
  left: 1%;
  z-index: 2;
  background: url('/assets/3d/img/52.png') center / 100% 100% no-repeat;
}
</style>
