import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import TU from './threeUtils.js'
import { Reflector } from './js/Reflector.js'
import * as TWEEN from '@tweenjs/tween.js'
// 相机动画（传指定state）
const targetPos = new Bol3D.Vector3()
const pos = new Bol3D.Vector3()
function cameraAnimation({ cameraState, callback, delayTime = 0, duration = 800 }) {
  targetPos.set(cameraState.target.x, cameraState.target.y, cameraState.target.z)
  pos.set(cameraState.position.x, cameraState.position.y, cameraState.position.z)

  if (targetPos.distanceTo(CACHE.container.orbitControls.target) < 0.1 && pos.distanceTo(CACHE.container.orbitControls.object.position) < 0.1) {
    callback && callback()
    return
  }

  if (STATE.isAnimating) return
  STATE.isAnimating = true

  CACHE.container.orbitControls.enabled = false

  let count = 0

  const t1 = new Bol3D.TWEEN.Tween(CACHE.container.orbitControls.object.position)
    .to(
      {
        x: cameraState.position.x,
        y: cameraState.position.y,
        z: cameraState.position.z
      },
      duration
    )
    .onUpdate(() => { })
    .onComplete(() => {
      count++

      if (count == 2) {
        CACHE.container.orbitControls.enabled = true
        STATE.isAnimating = false
        callback && callback()
      }
    })

  t1.delay(delayTime).start()

  const t2 = new Bol3D.TWEEN.Tween(CACHE.container.orbitControls.target)
    .to(
      {
        x: cameraState.target.x,
        y: cameraState.target.y,
        z: cameraState.target.z
      },
      duration
    )
    .onUpdate(() => { })
    .onComplete(() => {
      count++
      if (count == 2) {
        CACHE.container.orbitControls.enabled = true
        STATE.isAnimating = false
        callback && callback()
      }
    })

  t1.delay(delayTime).start()
  t2.delay(delayTime).start()

  return t1
}

function loadGUI() {
  // gui
  const gui = new dat.GUI()


  // filter pass
  const filterFolder = gui.addFolder('滤镜')
  const defaultsFilter = {
    hue: 0,
    saturation: 1,
    vibrance: 0,
    brightness: 0,
    contrast: 1
  }
  filterFolder.add(CACHE.container.filterPass, 'enabled')
  filterFolder
    .add(defaultsFilter, 'hue')
    .min(0)
    .max(1)
    .step(0.01)
    .onChange((val) => {
      CACHE.container.filterPass.filterMaterial.uniforms.hue.value = val
    })
  filterFolder
    .add(defaultsFilter, 'saturation')
    .min(0)
    .max(1)
    .step(0.01)
    .onChange((val) => {
      CACHE.container.filterPass.filterMaterial.uniforms.saturation.value = val
    })
  filterFolder
    .add(defaultsFilter, 'vibrance')
    .min(0)
    .max(10)
    .step(0.01)
    .onChange((val) => {
      CACHE.container.filterPass.filterMaterial.uniforms.vibrance.value = val
    })

  filterFolder
    .add(defaultsFilter, 'brightness')
    .min(0)
    .max(1)
    .step(0.01)
    .onChange((val) => {
      CACHE.container.filterPass.filterMaterial.uniforms.brightness.value = val
    })
  filterFolder
    .add(defaultsFilter, 'contrast')
    .min(0)
    .max(1)
    .step(0.01)
    .onChange((val) => {
      CACHE.container.filterPass.filterMaterial.uniforms.contrast.value = val
    })


  // 测试小车
  const skyCar = gui.addFolder('小车坐标')
  skyCar
    .add(CACHE.test, 'value')
    .min(200000)
    .max(1000000)
    .step(1)
    .onChange((val) => {
      CACHE.test.value = val
    })
}

function testBox() {
  // TU.setModelPosition(STATE.sceneList.WWATA02V)

  const boxG = new Bol3D.BoxGeometry(5, 5, 5)
  const boxM = new Bol3D.MeshBasicMaterial({ color: 0xffffff })
  const box = new Bol3D.Mesh(boxG, boxM)
  box.name = 'testBox'
  CACHE.box = box
  TU.setModelPosition(box)
  function waitContainerLoad() {
    if (!CACHE.container) {
      setTimeout(() => {
        waitContainerLoad()
      }, 1000)
    } else {
      CACHE.container.scene.add(box)
    }
  }
  waitContainerLoad()
}

// 算所有线段的中心点及长度等
function handleLine() {
  STATE.sceneList.guidao.traverse(child => {
    if (child.isMesh && child.name.includes('-')) {
      child.geometry.computeBoundingBox()
      child.geometry.computeBoundingSphere()
      // const { center, radius } = child.geometry.boundingSphere
      const { max, min } = child.geometry.boundingBox
      const size = new Bol3D.Vector3((max.x - min.x) * STATE.sceneScale, (max.y - min.y) * STATE.sceneScale, (max.z - min.z) * STATE.sceneScale)
      // 查找x,z最长的  作为运动方向
      const long = Math.max(size.x, size.z)
      const direction = long === size.x ? 'x' : 'z'

      // 计算线段的世界坐标
      const lineWorldPosition = new Bol3D.Vector3()
      child.getWorldPosition(lineWorldPosition)

      child.userData.direction = direction
      child.userData.worldPosition = lineWorldPosition
      child.userData.long = long
      child.userData.id = child.name.replace('-', '_')

      if (!STATE.sceneList.lineList) {
        STATE.sceneList.lineList = []
      }
      STATE.sceneList.lineList.push(child)
    }
  })
}


// 天车类
class SkyCar {
  coordinate = 0
  id = ''
  skyCarMesh = null
  animation = null

  constructor(opt) {
    this.coordinate = opt.coordinate
    this.id = opt.id
    this.initSkyCar()
    this.setPosition()
  }

  initSkyCar() {
    this.skyCarMesh = STATE.sceneList.tianche.clone()
    this.skyCarMesh.visible = true
    CACHE.container.scene.add(this.skyCarMesh)
    // const animate1 = STATE.animations.tianche[0]._mixer.clipAction(STATE.animations.tianche[0]._clip)
    // animate1.loop = Bol3D.LoopOnce
    // animate1.clampWhenFinished = true
    // CACHE.container.mixers.push(animate1)
    // this.skyCarMesh.userData.animate = animate1

    this.skyCarMesh.traverse(e => {
      if (e.isMesh) {
        e.userData.type = '天车'
        e.userData.id = this.id
        CACHE.container.clickObjects.push(e)
      }
    })
  }

  setPosition() {
    // 查找起始点、起始坐标
    const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < this.coordinate && e.endCoordinate > this.coordinate)
    if (map) {
      // 坐标区间
      const mapLong = map.endCoordinate - map.startCoordinate
      // 查找对应线段
      const line = CACHE.container.sceneList.guidao.children.find(e => {
        if (e.name.includes('-')) {
          const split = e.name.split('-')
          const start = split[0]
          const end = split[1]
          if (start == map.startPoint && end == map.endPoint) {
            return e
          }
        }
      })

      if (line) {
        const { direction, worldPosition, long } = line.userData
        const longToStart = this.coordinate - map.startCoordinate
        const longToEnd = map.endCoordinate - this.coordinate

        const currentPosition = new Bol3D.Vector3(0, 0, 0)
        const lookAtPosition = new Bol3D.Vector3(0, 0, 0)
        if (direction === 'x') {
          const moveDirection = map.direction === 'x' ? -1 : 1
          currentPosition.x = worldPosition.x + (moveDirection * long / 2) - (moveDirection * long * longToStart / (mapLong || 1))
          currentPosition.y = worldPosition.y - 9.3
          currentPosition.z = worldPosition.z
        } else if (direction === 'z') {
          const moveDirection = map.direction === 'z' ? -1 : 1
          currentPosition.x = worldPosition.x
          currentPosition.y = worldPosition.y - 9.3
          currentPosition.z = worldPosition.z + (moveDirection * long / 2) - (moveDirection * long * longToStart / (mapLong || 1))
        }

        lookAtPosition.x = currentPosition.x
        lookAtPosition.y = currentPosition.y
        lookAtPosition.z = currentPosition.z

        this.skyCarMesh.lookAt(lookAtPosition)

        if (this.animation) {
          this.animation.stop()
        }
        this.animation = new Bol3D.TWEEN.Tween(this.skyCarMesh.position)
        this.animation.to({
          x: currentPosition.x,
          y: currentPosition.y,
          z: currentPosition.z
        }, 333)
        this.animation.start()
      }
    }
  }
}

// 加载模拟天车
function initSkyCar() {
  DATA.skyCarMap.forEach(e => {
    const skyCar = new SkyCar({ coordinate: e.coordinate, id: e.id })
    console.log('skyCar: ', skyCar);
    setInterval(() => {
      if (skyCar.coordinate >= 1500000) skyCar.coordinate = 19000
      skyCar.coordinate += 200
      skyCar.setPosition()
    }, 333)

    if (!STATE.sceneList.skyCarList) {
      STATE.sceneList.skyCarList = []
    }
    STATE.sceneList.skyCarList.push(skyCar)
  })
}

// 加载反射器地板
function initReflexFloor() {
  const geo1 = new Bol3D.PlaneGeometry(600, 800)

  const reflector = new Reflector(geo1, {
    clipBias: 0,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x777777,
    blur: 0.4
  })

  reflector.rotation.x = -Math.PI / 2
  reflector.position.set(0, -0.4, 0)
  CACHE.container.scene.add(reflector)
  // TU.setModelPosition(reflector)



  // const gui = new dat.GUI()
  // const floorBlur = gui.addFolder('地板模糊')
  // floorBlur
  //   .add(reflector.material.uniforms.blurSize, 'value')
  //   .min(0)
  //   .max(2)
  //   .step(0.01)
  //   .onChange((val) => {
  //     reflector.material.uniforms.blurSize.value = val
  //   })

}

// 加载临时的设备
function initDeviceByMap() {
  for (let key in DATA.deviceMap) {
    DATA.deviceMap[key].forEach((e, index) => {
      const model = STATE.sceneList[key].clone()
      model.visible = true
      model.position.set(...e.position)
      model.rotation.y = e.rotate * Math.PI / 180
      CACHE.container.scene.add(model)
    })
  }
}


// 二维的搜索 并跟随移动
function search(type, id) {

  STATE.searchAnimateDesdory = false
  let obj = null
  if (type === '天车') {
    const skyCar = STATE.sceneList.skyCarList.find(e => e.id === id)
    if (skyCar) obj = skyCar.skyCarMesh

  } else if (type === '轨道') {
    const line = STATE.sceneList.lineList.find(e => e.userData.id === id)
    if (line) obj = line
  }

  if (obj) {
    let isCameraMoveOver = false // 动画移动完成

    const camera = CACHE.container.orbitCamera
    const contorl = CACHE.container.orbitControls
    let objWorldPosition = new Bol3D.Vector3()
    obj.getWorldPosition(objWorldPosition)
    new TWEEN.Tween(camera.position)
      .to({
        x: objWorldPosition.x + 100,
        y: objWorldPosition.y + 100,
        z: objWorldPosition.z + 100
      }, 1000)
      .dynamic(true)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
      .onComplete(() => {
        isCameraMoveOver = true
      })

    new TWEEN.Tween(contorl.target)
      .to({
        x: objWorldPosition.x,
        y: objWorldPosition.y,
        z: objWorldPosition.z
      }, 1000)
      .dynamic(true)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    // 针对不同类型个性化的动画
    let animate = () => { }

    if (type === '天车') {
      const eventFunc = () => {
        STATE.searchAnimateDesdory = true
        CACHE.container.orbitControls.removeEventListener('start', eventFunc)
      }
      CACHE.container.orbitControls.addEventListener('start', eventFunc)
      animate = () => {

        if (isCameraMoveOver) {
          camera.position.set(objWorldPosition.x + 100, objWorldPosition.y + 100, objWorldPosition.z + 100)
          contorl.target.set(objWorldPosition.x, objWorldPosition.y, objWorldPosition.z)
        }
      }

    } else if (type === '轨道') {
      const color = obj.material.color.clone()

      obj.material.color.g = 0.0
      obj.material.color.b = 0.0
      const eventFunc = () => {
        STATE.searchAnimateDesdory = true
        obj.material.color = color
        CACHE.container.orbitControls.removeEventListener('start', eventFunc)
      }
      CACHE.container.orbitControls.addEventListener('start', eventFunc)
      animate = () => {
        const dt = STATE.clock.getElapsedTime()
        const redColor = Math.abs(Math.sin(dt * 2))
        obj.material.color.r = redColor
      }
    }


    render()
    function render() {
      obj.getWorldPosition(objWorldPosition)

      TWEEN.update();
      if (STATE.searchAnimateDesdory) {
        return
      } else {
        animate()
        requestAnimationFrame(render)
      }
    }
  }
}

// 天车单击弹窗
function initSkyCarPopup(type, id) {
  const name = 'popup_' + type + '_' + id
  const skyCar = STATE.sceneList.skyCarList.find(e => e.id === id)
  if (skyCar) {
    const popupInGroup = skyCar.skyCarMesh.children.find(e => e.name === name)
    if (!popupInGroup) {
      const popup = new Bol3D.POI.Popup3DSprite({
        value: `
      <div style="
        pointer-events: all;
        margin:0;
        color: #ffffff;
      ">
  
        <div style="
          position: absolute;
          background: url('./assets/3d/img/39.png') center / 100% 100% no-repeat;
          width: 30vw;
          height: 20vh;
          transform: translate(-50%, -50%);
        ">
          <p style="font-size: 8vh;line-height: 80%; font-family: YouSheBiaoTiHei; text-align: center; margin-top: 7%;">${id}</p>
        </div>
  
        <div style="
          position: absolute;
          background: url('./assets/3d/img/40.png') center / 100% 100% no-repeat;
          width: 8vw;
          height: 10vh;
          animation: arrowJump 1s linear infinite;
        ">
        </div>
      </div>
        `,
        position: [0, 0, 0],
        className: 'popup3dclass popup3d_tianche',
        closeVisible: true,
        closeColor: "#FFFFFF",
        closeCallback: (() => {
          const pop = skyCar.skyCarMesh.children.find(e => e.name === name)
          if (pop) {
            pop.parent.remove(pop)
          }
        })
      })

      popup.scale.set(0.05, 0.05, 0.05)
      popup.name = name
      skyCar.skyCarMesh.add(popup)
      popup.position.y = 2.3
    }
  }
}

// 获取动画
const getAnimationList = () => {
  const animations = {};
  CACHE.container.mixerActions.forEach((item) => {
    if(!animations[item._mixer._root.name]) {
      animations[item._mixer._root.name] = []
    }
    animations[item._mixer._root.name].push(item)
  });
  STATE.animations = animations
};


export const API = {
  ...TU,
  cameraAnimation,
  loadGUI,
  handleLine,
  initSkyCar,
  initReflexFloor,
  search,
  initDeviceByMap,
  initSkyCarPopup,
  getAnimationList,
  testBox
}
