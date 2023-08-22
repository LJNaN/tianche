<script setup>
import { CACHE } from '@/ktJS/CACHE'
import { ref, render } from 'vue'

let deg = ref(0)
setTimeout(() => {
  init()
}, 3000)
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

const imgList = [[4, 10], [2, 7], [1, 8], [3, 9]]

let imgSrc = ref([
  `/assets/3d/img/compass/${imgList[0][0]}.png`,
  `/assets/3d/img/compass/${imgList[1][0]}.png`,
  `/assets/3d/img/compass/${imgList[2][0]}.png`,
  `/assets/3d/img/compass/${imgList[3][0]}.png`
])

let rotateUpFlag = ref(false)

function hoverDial(id) {
  imgSrc.value[id] = `/assets/3d/img/compass/${imgList[id][1]}.png`
}
function leaveDial(id) {
  imgSrc.value[id] = `/assets/3d/img/compass/${imgList[id][0]}.png`
}
function downDial(id) {
  const control = CACHE.container.orbitControls


  if (id === 1) {
    control.autoRotateSpeed = 3
    control.autoRotate = true

  } else if (id === 3) {
    control.autoRotateSpeed = -3
    control.autoRotate = true

  } else if (id === 0 || id === 2) {
    rotateUpFlag.value = true
    render()
    function render() {
      if (rotateUpFlag.value) {
        control.rotateUp(id === 0 ? 0.01 : -0.01)
        control.update()
        requestAnimationFrame(render)
      }
    }

  }
}

function upDial(id) {
  const control = CACHE.container.orbitControls
  if (id === 1 || id === 3) {
    control.autoRotate = false
  } else if (id === 0 || id === 2) {
    rotateUpFlag.value = false
  }
}

</script>

<template>
  <div class="main">
    <div class="arrow" :style="{ transform: `rotateZ(${deg}deg)` }"></div>
    <div class="dial">
      <img :src="imgSrc[0]" @mousedown="downDial(0)" @mouseup="upDial(0)" @mouseenter="hoverDial(0)"
        @mouseleave="leaveDial(0)">
      <img :src="imgSrc[1]" @mousedown="downDial(1)" @mouseup="upDial(1)" @mouseenter="hoverDial(1)"
        @mouseleave="leaveDial(1)">
      <img :src="imgSrc[2]" @mousedown="downDial(2)" @mouseup="upDial(2)" @mouseenter="hoverDial(2)"
        @mouseleave="leaveDial(2)">
      <img :src="imgSrc[3]" @mousedown="downDial(3)" @mouseup="upDial(3)" @mouseenter="hoverDial(3)"
        @mouseleave="leaveDial(3)">
    </div>
    <div class="line"></div>
  </div>
</template>

<style scoped lang="less">
.main {
  position: absolute;
  top: 10%;
  left: 10%;
  height: 100px;
  width: 100px;
  border: 1px solid red;
  pointer-events: all;

  div {
    cursor: pointer;
    user-select: none;
    -webkit-user-drag: none;
  }

  .arrow {
    position: absolute;
    height: 100%;
    width: 100%;
    background: url('/assets/3d/img/compass/6.png') center / 100% 100% no-repeat;
    z-index: 1;
  }

  .dial {
    position: absolute;
    height: 100%;
    width: 100%;

    img {
      position: absolute;
      width: 65%;
      pointer-events: all;
      z-index: 3;
      user-select: none;
      -webkit-user-drag: none;
    }

    img:nth-of-type(1) {
      left: 18%;
      top: 4.5%;
    }

    img:nth-of-type(2) {
      height: 65%;
      width: auto;
      right: 4.6%;
      top: 18%;
    }

    img:nth-of-type(3) {
      left: 18%;
      bottom: 4%;
    }

    img:nth-of-type(4) {
      height: 65%;
      width: auto;
      left: 4.6%;
      top: 18%;
    }
  }

  .line {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 2;
    background: url('/assets/3d/img/compass/5.png') center / 95% 95% no-repeat;
  }
}
</style>
