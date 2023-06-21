import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import TU from './threeUtils.js'
import { Reflector } from './js/Reflector.js'
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
  // // default opts
  // const deafultsScene = { distance: 8000, }
  // // scenes
  // const scenesFolder = gui.addFolder('场景')
  // // toneMapping
  // scenesFolder.add(CACHE.container.renderer, 'toneMappingExposure', 0, 10).step(0.001).name('exposure')
  // scenesFolder.add(CACHE.container.ambientLight, 'intensity').step(0.1).min(0).max(10).name('环境光强度')
  // scenesFolder.add(CACHE.container.gammaPass, 'enabled').name('gamma校正')
  // scenesFolder
  //   .addColor(CACHE.container.attrs.lights.directionLights[0], 'color')
  //   .onChange((val) => {
  //     CACHE.container.directionLights[0].color.set(val)
  //   })
  //   .name('平行光颜色')
  // scenesFolder.add(CACHE.container.directionLights[0].position, 'x')
  // scenesFolder.add(CACHE.container.directionLights[0].position, 'y')
  // scenesFolder.add(CACHE.container.directionLights[0].position, 'z')
  // scenesFolder.add(deafultsScene, 'distance').onChange((val) => {
  //   CACHE.container.directionLights[0].shadow.camera.left = -val
  //   CACHE.container.directionLights[0].shadow.camera.right = val
  //   CACHE.container.directionLights[0].shadow.camera.top = val
  //   CACHE.container.directionLights[0].shadow.camera.bottom = -val
  //   CACHE.container.directionLights[0].shadow.camera.updateProjectionMatrix()
  //   CACHE.container.directionLights[0].shadow.needsUpdate = true
  // })
  // scenesFolder.add(CACHE.container.directionLights[0].shadow.camera, 'far').onChange(() => {
  //   CACHE.container.directionLights[0].shadow.camera.updateProjectionMatrix()
  //   CACHE.container.directionLights[0].shadow.needsUpdate = true
  // })
  // scenesFolder.add(CACHE.container.directionLights[0].shadow.camera, 'near').onChange(() => {
  //   CACHE.container.directionLights[0].shadow.camera.updateProjectionMatrix()
  //   CACHE.container.directionLights[0].shadow.needsUpdate = true
  // })
  // scenesFolder
  //   .add(CACHE.container.directionLights[0].shadow, 'bias')
  //   .step(0.0001)
  //   .onChange(() => {
  //     CACHE.container.directionLights[0].shadow.needsUpdate = true
  //   })
  // scenesFolder.add(CACHE.container.directionLights[0], 'intensity').step(0.1).min(0).max(10)

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
  const boxG = new Bol3D.BoxGeometry(5, 5, 5)
  const boxM = new Bol3D.MeshBasicMaterial({ color: 0xffffff })
  const box = new Bol3D.Mesh(boxG, boxM)
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
    }
  })
}

class SkyCar {
  coordinate = 0
  skyCarMesh = null
  animation = null

  constructor(coordinate) {
    this.coordinate = coordinate
    this.initSkyCar()
    this.setPosition()
  }

  initSkyCar() {
    this.skyCarMesh = STATE.sceneList.tianche.clone()
    this.skyCarMesh.visible = true
    CACHE.container.scene.add(this.skyCarMesh)
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
          currentPosition.y = worldPosition.y
          currentPosition.z = worldPosition.z
        } else if (direction === 'z') {
          const moveDirection = map.direction === 'z' ? -1 : 1
          currentPosition.x = worldPosition.x
          currentPosition.y = worldPosition.y
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

function initSkyCar() {
  const skyCar1 = new SkyCar(82500)
  const skyCar2 = new SkyCar(822200)
  const skyCar3 = new SkyCar(180000)
  const skyCar4 = new SkyCar(78000)
  const skyCar5 = new SkyCar(226200)
  const skyCar6 = new SkyCar(1353761)
  console.log('skyCar1: ', skyCar1);
  console.log('skyCar2: ', skyCar2);
  console.log('skyCar3: ', skyCar3);
  console.log('skyCar4: ', skyCar4);
  console.log('skyCar5: ', skyCar5);
  console.log('skyCar6: ', skyCar6);


  setInterval(() => {
    if (skyCar1.coordinate >= 1500000) skyCar1.coordinate = 19000
    skyCar1.coordinate += 200
    skyCar1.setPosition()

    if (skyCar2.coordinate >= 1500000) skyCar2.coordinate = 19000
    skyCar2.coordinate += 200
    skyCar2.setPosition()

    if (skyCar3.coordinate >= 1500000) skyCar3.coordinate = 19000
    skyCar3.coordinate += 200
    skyCar3.setPosition()

    if (skyCar4.coordinate >= 1500000) skyCar4.coordinate = 19000
    skyCar4.coordinate += 200
    skyCar4.setPosition()

    if (skyCar5.coordinate >= 1500000) skyCar5.coordinate = 19000
    skyCar5.coordinate += 200
    skyCar5.setPosition()

    if (skyCar6.coordinate >= 1500000) skyCar6.coordinate = 19000
    skyCar6.coordinate += 200
    skyCar6.setPosition()

  }, 333)

}

function initReflexFloor() {
  const geo1 = new Bol3D.PlaneGeometry(1000, 1000)

  const reflector = new Reflector(geo1, {
    clipBias: 0,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x777777,
    blur: 0.3
  })

  console.log('reflector: ', reflector);
  reflector.rotation.x = -Math.PI / 2
  reflector.position.set(0, -1, 0)
  CACHE.container.scene.add(reflector)
  CACHE.container.addBloom(reflector)
  TU.setModelPosition(reflector)



  const gui = new dat.GUI()
  const floorBlur = gui.addFolder('地板模糊')
  floorBlur
    .add(reflector.material.uniforms.blurSize, 'value')
    .min(0)
    .max(2)
    .step(0.01)
    .onChange((val) => {
      reflector.material.uniforms.blurSize.value = val
    })



  // TU.setModelPosition(light)
}

export const API = {
  ...TU,
  cameraAnimation,
  loadGUI,
  handleLine,
  initSkyCar,
  initReflexFloor,
  testBox
}
