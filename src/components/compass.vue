<script setup>
import { CACHE } from '@/ktJS/CACHE'
import { STATE } from '@/ktJS/STATE'
import { ref, render } from 'vue'
import * as TWEEN from '@tweenjs/tween.js'


let deg = ref(0)

const imgList = [[4, 10], [2, 7], [1, 8], [3, 9]]

let tweenRenderFlag = ref(false)

let imgSrc = ref([
  `/assets/3d/img/compass/${imgList[0][0]}.png`,
  `/assets/3d/img/compass/${imgList[1][0]}.png`,
  `/assets/3d/img/compass/${imgList[2][0]}.png`,
  `/assets/3d/img/compass/${imgList[3][0]}.png`
])

let rotateDownFlag = ref(false)
let zoomDownFlag = ref(false)

wait()
function wait() {
  if (CACHE?.container?.orbitControls) {
    init()
  } else {
    setTimeout(() => {
      wait()
    }, 500)
  }
}


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


function hoverDial(id) {
  imgSrc.value[id] = `/assets/3d/img/compass/${imgList[id][1]}.png`
}
function leaveDial(id) {
  imgSrc.value[id] = `/assets/3d/img/compass/${imgList[id][0]}.png`
}
function downDial(id) {
  const control = CACHE.container.orbitControls

  if (id === 1) {
    control.autoRotateSpeed = -3
    control.autoRotate = true

  } else if (id === 3) {
    control.autoRotateSpeed = 3
    control.autoRotate = true

  } else if (id === 0 || id === 2) {
    rotateDownFlag.value = true
    render()
    function render() {
      if (rotateDownFlag.value) {
        control.rotateUp(id === 0 ? 0.005 : -0.005)
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
    rotateDownFlag.value = false
  }
}


function clickArrow() {
  tweenRenderFlag.value = true
  const camera = CACHE.container.orbitCamera
  const control = CACHE.container.orbitControls

  TweenRender()
  new TWEEN.Tween(camera.position)
    .to({
      x: STATE.initialState.position.x,
      y: STATE.initialState.position.y,
      z: STATE.initialState.position.z
    }, 800)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()

  new TWEEN.Tween(control.target)
    .to({
      x: STATE.initialState.target.x,
      y: STATE.initialState.target.y,
      z: STATE.initialState.target.z
    }, 800)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
    .onComplete(() => {
      tweenRenderFlag.value = false
    })
}

function TweenRender() {
  if (tweenRenderFlag.value) {
    TWEEN.update()
    requestAnimationFrame(TweenRender)
  }
}

function zoomDown(type) {
  
  const control = CACHE.container.orbitControls
  zoomDownFlag.value = true

  render()
  function render() {
    
    if (zoomDownFlag.value) {
      control.dollyIn(type === 0 ? 0.99 : 1.01)
      control.update()
      requestAnimationFrame(render)
    }
  }
}

function zoomUp() {
  zoomDownFlag.value = false
}

</script>

<template>
  <div class="main">
    <div class="compass">
      <div class="arrow" :style="{ transform: `rotateZ(${deg}deg)` }" @click="clickArrow()"></div>
      <div class="dial">
        <img :src="imgSrc[0]" @mousedown="downDial(0)" @mouseup="upDial(0)" @mouseenter="hoverDial(0)"
          @mouseleave="leaveDial(0), upDial(0)">
        <img :src="imgSrc[1]" @mousedown="downDial(1)" @mouseup="upDial(1)" @mouseenter="hoverDial(1)"
          @mouseleave="leaveDial(1), upDial(1)">
        <img :src="imgSrc[2]" @mousedown="downDial(2)" @mouseup="upDial(2)" @mouseenter="hoverDial(2)"
          @mouseleave="leaveDial(2), upDial(2)">
        <img :src="imgSrc[3]" @mousedown="downDial(3)" @mouseup="upDial(3)" @mouseenter="hoverDial(3)"
          @mouseleave="leaveDial(3), upDial(3)">
      </div>
      <div class="compass-line"></div>
    </div>

    <div class="zoom">
      <div class="zoom-jia" @mousedown="zoomDown(0)" @mouseup="zoomUp()" @mouseleave="zoomUp()">+</div>
      <div class="zoom-line"></div>
      <div class="zoom-jian" @mousedown="zoomDown(1)" @mouseup="zoomUp()" @mouseleave="zoomUp()">-</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.main {
  position: absolute;
  width: 100px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .compass {
    position: absolute;
    height: 50%;
    width: 100%;
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
      z-index: 3;
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
        top: 5.7%;
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
        left: 5%;
        top: 18%;
      }
    }

    &-line {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 2;
      background: url('/assets/3d/img/compass/5.png') center / 95% 95% no-repeat;
    }
  }

  .zoom {
    position: absolute;
    bottom: 0;
    background-color: #fff;
    border-radius: 6px;
    width: 40%;
    height: 40%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &-jia,
    &-jian {
      width: 100%;
      height: 100%;
      cursor: pointer;
      pointer-events: all;
      font-size: 2rem;
      font-weight: bold;
      line-height: 100%;
      text-align: center;
      color: #687386;
    }

    &-jia:hover,
    &-jian:hover {
      border-radius: 6px;
      background-color: #e4e9f0;
    }

    &-line {
      position: absolute;
      top: 50%;
      width: 100%;
      height: 2px;
      background-color: #e4e9f0;
    }
  }
}
</style>
