<script setup>
import { CACHE } from '@/ktJS/CACHE'
import { STATE } from '@/ktJS/STATE'
import { ref, computed } from 'vue'
import * as TWEEN from '@tweenjs/tween.js'
import { VUEDATA } from '@/VUEDATA.js'

let deg = ref(0)
let tweenRenderFlag = ref(false)
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
  <div class="main" :style="{
    right:
      (VUEDATA.selectedItem.value.includes(4)
        || VUEDATA.selectedItem.value.includes(5)
        || VUEDATA.selectedItem.value.includes(6)
      ) ? '26%' : '1%'
  }">
    <div class="compass">
      <div class="arrow" :style="{ transform: `rotateZ(${deg}deg)` }" @click="clickArrow()"></div>
      <div class="dial">
        <img src="/assets/3d/img/compass/1.png" @mousedown="downDial(0)" @mouseup="upDial(0)" @mouseleave="upDial(0)">
        <img src="/assets/3d/img/compass/2.png" @mousedown="downDial(1)" @mouseup="upDial(1)" @mouseleave="upDial(1)">
        <img src="/assets/3d/img/compass/3.png" @mousedown="downDial(2)" @mouseup="upDial(2)" @mouseleave="upDial(2)">
        <img src="/assets/3d/img/compass/4.png" @mousedown="downDial(3)" @mouseup="upDial(3)" @mouseleave="upDial(3)">
      </div>
    </div>

    <div class="zoom">
      <img src="/assets/3d/img/compass/6.png" class="zoom-jia" @mousedown="zoomDown(0)" @mouseup="zoomUp()"
        @mouseleave="zoomUp()" />
      <img src="/assets/3d/img/compass/7.png" class="zoom-jian" @mousedown="zoomDown(1)" @mouseup="zoomUp()"
        @mouseleave="zoomUp()" />
    </div>
  </div>
</template>

<style scoped lang="less">
.main {
  position: absolute;
  top: 11.5%;
  right: 26%;
  width: 80px;
  height: 160px;
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
      background: url('/assets/3d/img/compass/5.png') center / 48% 48% no-repeat;
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
        left: 50%;
        transform: translateX(-50%);
        top: 0;
      }

      img:nth-of-type(2) {
        height: 65%;
        width: auto;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }

      img:nth-of-type(3) {
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
      }

      img:nth-of-type(4) {
        height: 65%;
        width: auto;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  .zoom {
    position: absolute;
    bottom: 8%;
    width: 48%;
    height: 40%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &-jia,
    &-jian {
      width: 70%;
      height: 40%;
      cursor: pointer;
      pointer-events: all;
      font-size: 2rem;
      font-weight: bold;
      line-height: 100%;
      text-align: center;
      color: #687386;
      user-select: none;
      -webkit-user-drag: none;
    }

    &-jia {
      margin-bottom: 15%;
    }

    &-jia:hover,
    &-jian:hover {
      background-color: #666;
    }


  }
}
</style>
