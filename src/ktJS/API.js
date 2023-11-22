import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import TU from './js/threeUtils.js'
import { Reflector } from './js/Reflector.js'
import * as TWEEN from '@tweenjs/tween.js'
// import mockData1 from './js/mock1'
// import mockData2 from './js/mock2'
// import mockData3 from './js/mock3'
// import mockData4 from './js/mock4'
import mockData5 from './js/mock5'
import { GetCarrierInfo, OhtFindCmdId, CarrierFindCmdId, GetEqpStateInfo, GetRealTimeEqpState, GetRealTimeCmd } from '@/axios/api.js'
import { VUEDATA } from '@/VUEDATA.js'
import SkyCar from './js/SkyCar.js'
import drive from './js/drive.js'

// 获取数据
function getData() {
  STATE.sceneList.skyCarList = []
  let wsMessage = null

  // 真实数据
  // ======================================
  const api = window.wsAPI
  const ws = new WebSocket(api)
  ws.onmessage = (info) => {
    wsMessage = JSON.parse(info.data)
    drive(wsMessage)
  }



  // 模拟数据
  // =======================================
  // let i = 0
  // window.aa = () => { }
  // setInterval(() => {
  //   if (i >= mockData5.length) i = 0
  //   drive(mockData5[i])
  //   i++
  // }, 333)

  // let i = 0
  // function aaa() {
  //   drive(mockData5[i])
  //   i++
  // }
  // window.aaa = aaa
}




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

  // default opts
  const deafultsScene = { distance: 8000, }
  // scenes
  const scenesFolder = gui.addFolder('场景')
  // toneMapping
  scenesFolder.add(CACHE.container.renderer, 'toneMappingExposure', 0, 10).step(0.001).name('exposure')
  scenesFolder.add(CACHE.container.ambientLight, 'intensity').step(0.1).min(0).max(10).name('环境光强度')
  scenesFolder.add(CACHE.container.gammaPass, 'enabled').name('gamma校正')
  scenesFolder
    .addColor(CACHE.container.attrs.lights.directionLights[0], 'color')
    .onChange((val) => {
      CACHE.container.directionLights[0].color.set(val)
    })
    .name('平行光颜色')
  scenesFolder.add(CACHE.container.directionLights[0].position, 'x')
  scenesFolder.add(CACHE.container.directionLights[0].position, 'y')
  scenesFolder.add(CACHE.container.directionLights[0].position, 'z')
  scenesFolder.add(deafultsScene, 'distance').onChange((val) => {
    CACHE.container.directionLights[0].shadow.camera.left = -val
    CACHE.container.directionLights[0].shadow.camera.right = val
    CACHE.container.directionLights[0].shadow.camera.top = val
    CACHE.container.directionLights[0].shadow.camera.bottom = -val
    CACHE.container.directionLights[0].shadow.camera.updateProjectionMatrix()
    CACHE.container.directionLights[0].shadow.needsUpdate = true
  })
  scenesFolder.add(CACHE.container.directionLights[0].shadow.camera, 'far').onChange(() => {
    CACHE.container.directionLights[0].shadow.camera.updateProjectionMatrix()
    CACHE.container.directionLights[0].shadow.needsUpdate = true
  })
  scenesFolder.add(CACHE.container.directionLights[0].shadow.camera, 'near').onChange(() => {
    CACHE.container.directionLights[0].shadow.camera.updateProjectionMatrix()
    CACHE.container.directionLights[0].shadow.needsUpdate = true
  })
  scenesFolder
    .add(CACHE.container.directionLights[0].shadow, 'bias')
    .step(0.0001)
    .onChange(() => {
      CACHE.container.directionLights[0].shadow.needsUpdate = true
    })
  scenesFolder.add(CACHE.container.directionLights[0], 'intensity').step(0.1).min(0).max(10)


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

}

function testBox() {

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
  STATE.sceneList.guidao.children.forEach(e => {
    if (e.name.includes('X-')) {
      e.visible = true
      e.geometry.computeBoundingBox()
      e.geometry.computeBoundingSphere()
      const { max, min } = e.geometry.boundingBox
      const size = new Bol3D.Vector3((max.x - min.x) * STATE.sceneScale, 0, (max.z - min.z) * STATE.sceneScale)
      // 查找x,z最长的  作为运动方向
      const long = Math.max(size.x, size.z)
      const direction = long === size.x ? 'x' : 'z'
      e.userData.direction = direction
      e.userData.long = long

      const { array } = e.geometry.attributes.position
      const arr = []
      for (let i = 0; i < array.length - 4; i += 3) {
        const point = array.slice(i, i + 3)
        if (point[1] > 0) {
          point[0] += e.position.x
          point[1] += e.position.y
          point[2] += e.position.z
          arr.push(point)
        }
      }

      // 有些轨道的索引是反的，需要反转一下
      const reserveList = ['66-67', '57-58', '58-59', '68-69', '69-70', '70-64', '63-65', '65-71', '75-76', '77-78', '79-80', '13-21', '21-25', '25-29', '30-31', '31-32', '31-34', '21-22', '16-17', '17-23', '27-35', '35-36', '35-38', '23-24', '56-91', '90-95', '95-96', '55-73', '74-72', '71-53', '53-52', '53-54', '36-33', '32-39', '39-40', '40-43', '44-47', '47-78', '48-49', '110-106', '50-119', '118-115', '41-42', '45-46', '49-50', '2-3', '6-7', '10-11', '1-4', '4-5', '5-8', '9-10', '10-81', '81-82', '82-83', '86-89', '11-12', '12-15', '15-16', '19-97', '100-101', '104-20', '98-105', '105-109', '109-113', '113-116', '105-106', '102-107', '111-117', '107-111', '107-108', '84-87', '87-88', '88-85', '93-94', '73-75', '43-41', '42-44', '47-45', '46-48', '117-120', '47-48', '53-54', '80-74', '12-13']
      if (reserveList.includes(e.name.split('X-')[1])) {
        arr.reverse()
      }

      STATE.sceneList.linePosition[e.name.split('X-')[1]] = arr
    }
  })



  STATE.sceneList.guidao.traverse(child => {
    if (child.isMesh && child.name.includes('-') && !child.name.includes('X-')) {
      CACHE.container.clickObjects.push(child)
      child.userData.id = child.name.replace('-', '_')
      child.userData.type = '轨道'
      if (!STATE.sceneList.lineList) {
        STATE.sceneList.lineList = []
      }
      STATE.sceneList.lineList.push(child)
    }
  })
}


// 计算聚焦 Tween 动画的
function computedCameraTweenPosition(currentP, targetP, gapDistance = 100) {

  // 计算点1和点2之间的距离
  let distance = Math.sqrt((targetP.x - currentP.x) ** 2 + (targetP.y - currentP.y) ** 2 + (targetP.z - currentP.z) ** 2);


  // 计算从点1到点2的向量，并将其标准化为单位向量
  let vector = { x: (targetP.x - currentP.x) / distance, y: (targetP.y - currentP.y) / distance, z: (targetP.z - currentP.z) / distance };

  // 将向量乘以200，以便点1向点2移动
  let scaled_vector = { x: vector.x * gapDistance, z: vector.z * gapDistance };

  // 将点1的x和z坐标设置为新位置的值，使其靠近点2
  const computedPosition = new Bol3D.Vector3()
  computedPosition.x = targetP.x - scaled_vector.x;
  computedPosition.z = targetP.z - scaled_vector.z;
  computedPosition.y = 100;

  // 最终坐标[x3,y3,z3]
  return computedPosition
}



// 加载模拟天车
function initSkyCar() {
  DATA.skyCarMap.forEach(e => {
    const skyCar = new SkyCar({ coordinate: e.coordinate, id: e.id })

    initLoop()
    function initLoop() {
      if (skyCar.coordinate >= 1500000) skyCar.coordinate = 0
      for (let i = 0; i < STATE.sceneList.skyCarList.length; i++) {
        if (Math.abs(STATE.sceneList.skyCarList[i].coordinate - skyCar.coordinate) < 2000) {
          skyCar.coordinate += 200
          initLoop()
        }
        const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < skyCar.coordinate && e.endCoordinate > skyCar.coordinate)
        if (!map) {
          skyCar.coordinate += 200
          initLoop()
        }
      }

    }

    setInterval(() => {
      loop()
      function loop() {
        if (skyCar.coordinate >= 1500000) skyCar.coordinate = 0
        const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < skyCar.coordinate && e.endCoordinate > skyCar.coordinate)
        if (!map) {
          skyCar.coordinate += 200
          loop()
        }
      }

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
    blur: 0.25
  })

  reflector.rotation.x = -Math.PI / 2
  reflector.position.set(0, -0.4, 0)
  CACHE.container.scene.add(reflector)



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

// 加载机台
async function initDeviceByMap() {
  if (VUEDATA.isEditorMode.value) {
    CACHE.container.clickObjects = []
    DATA.deviceMap.value.forEach(e => {
      const model = STATE.sceneList[e.type].clone()
      setTimeout(() => {
        model.visible = e.visible
      }, 0)
      model.position.set(...e.position)
      model.rotation.y = e.rotate * Math.PI / 180
      model.userData.type = '机台'
      model.userData.deviceType = e.type
      model.userData.id = e.id
      CACHE.container.scene.add(model)

      model.traverse(e2 => {
        e2.visible = true
        if (e2.isMesh) {
          e2.userData.type = '机台'
          e2.userData.deviceType = e.type
          e2.userData.id = e.id
          CACHE.container.clickObjects.push(e2)
        }
      })
    })

  } else {

    const deviceType = Array.from(new Set(DATA.deviceMap.value.map(e => e.type)))
    const deviceObject = {}
    deviceType.forEach(e => {
      deviceObject[e] = []
    })

    DATA.deviceMap.value.forEach(e => {
      const model = STATE.sceneList[e.type].clone()

      if (e.visible) {
        model.visible = true
        model.position.set(...e.position)
        model.rotation.y = e.rotate * Math.PI / 180
        model.userData.id = e.id
        model.userData.type = '机台'
        model.userData.enabled = ''
        model.userData.eqptype = ''
        deviceObject[e.type].push(model)
        CACHE.container.scene.add(model)
      }
    })


    deviceType.forEach(e => {
      instantiationGroupInfo(deviceObject[e], e, CACHE.container)
    })

  }
}


// 二维的搜索 并跟随移动
function search(type, id) {

  // 恢复动画销毁为false
  STATE.searchAnimateDestroy = false

  // 找到当前 obj
  let obj = null
  if (type === '天车') {
    const skyCar = STATE.sceneList.skyCarList.find(e => e.id === id)
    if (skyCar) obj = skyCar.skyCarMesh

  } else if (type === '轨道') {
    const line = STATE.sceneList.lineList.find(e => e.userData.id === id)
    if (line) obj = line
    if (obj) {
      STATE.sceneList.lineList.forEach(e => {
        if (e.userData.color) {
          e.material.color = e.userData.color
        }
      })
    }
  } else if (type === '卡匣') {
    const kaxia = STATE.sceneList.kaxiaList.children.find(e => e.userData.id === id)
    if (kaxia) obj = kaxia
  }

  if (obj) {
    // 相机移动动画
    let isCameraMoveOver = false // 动画移动完成
    const camera = CACHE.container.orbitCamera
    const control = CACHE.container.orbitControls
    CACHE.tempCameraState = {
      position: camera.position.clone(),
      target: control.target.clone()
    }
    let objWorldPosition = new Bol3D.Vector3()
    obj.getWorldPosition(objWorldPosition)


    const finalPosition = computedCameraTweenPosition(camera.position, objWorldPosition)

    new TWEEN.Tween(camera.position)
      .to(finalPosition, 800)
      .start()
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        camera.updateProjectionMatrix()
      })

    new TWEEN.Tween(control.target)
      .to(objWorldPosition, 800)
      .dynamic(true)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
      .onComplete(() => {
        isCameraMoveOver = true
      })


    // 针对不同类型个性化的动画
    let animate = () => { }

    if (type === '天车') {
      const eventFunc = () => {
        const camera = CACHE.container.orbitCamera
        const control = CACHE.container.orbitControls
        control.enabled = false
        STATE.sceneList.skyCarList.forEach(e => {
          e.popup.visible = true
          if (e.clickPopup) {
            if (e.clickPopup.parent) {
              e.clickPopup.parent.remove(e.clickPopup)
            }
            e.clickPopup.element.remove()
            e.clickPopup = null
          }
        })
        STATE.searchAnimateDestroy = true
        control.removeEventListener('start', eventFunc)


        new Bol3D.TWEEN.Tween(camera.position)
          .to(CACHE.tempCameraState.position, 800)
          .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
          .start()

        new Bol3D.TWEEN.Tween(control.target)
          .to(CACHE.tempCameraState.target, 800)
          .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
          .start()
          .onComplete(() => {
            control.enabled = true
            control.saveState()
            control.reset()
          })
      }

      CACHE.container.orbitControls.addEventListener('start', eventFunc)
      animate = () => {
        if (isCameraMoveOver) {
          control.target.set(objWorldPosition.x, objWorldPosition.y, objWorldPosition.z)
        }
      }

    } else if (type === '轨道') {
      const color = obj.material.color.clone()
      obj.userData.color = color

      CACHE.tempCameraState = {
        position: camera.position.clone(),
        target: control.target.clone()
      }


      if (STATE.currentPopup) {
        if (STATE.currentPopup.parent) {
          STATE.currentPopup.parent.remove(STATE.currentPopup)
        }
        STATE.currentPopup.element.remove()
        STATE.currentPopup = null

        STATE.sceneList.skyCarList.forEach(e => {
          e.popup.visible = true
        })
      }

      const lineData = DATA.pointCoordinateMap.find(e => e.name === obj.userData.id)

      let title = '轨道'
      let height = '37vh'
      let className = 'popup3d_guidao'
      let items = [
        { name: '起点节点', value: lineData?.startPoint },
        { name: '起点坐标', value: lineData?.startCoordinate },
        { name: '终点节点', value: lineData?.endPoint },
        { name: '终点坐标', value: lineData?.endCoordinate },
        { name: '轨道状态', value: (lineData?.status === '1' ? '释放' : '锁定') },
        { name: 'Alarm 情况', value: '无' }
      ]

      let textValue = ``
      for (let i = 0; i < items.length; i++) {
        textValue += `
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0 5%;
              height: 4vh;
              width: 100%;
              background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
              ">
              <p style="font-size: 2vh;">${items[i].name}</p>
              <p style="font-size: 2vh;">${items[i].value}</p>
            </div>`
      }

      const popup = new Bol3D.POI.Popup3DSprite({
        value: `
            <div style="
              pointer-events: none;
              margin:0;
              color: #ffffff;
            ">

            <div style="
                position: absolute;
                background: url('./assets/3d/img/47.png') center / 100% 100% no-repeat;
                width: 25vw;
                height: ${height};
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
                ${title}
              </p>

              <div style="
                display: flex;
                flex-direction: column;
                width: 85%;
                margin: 4% auto 0 auto;
                height: 100%;
              ">
              ${textValue}
              </div>
            </div>
          </div>
          `,
        position: [0, 0, 0],
        className: `popup3dclass ${className}`,
        closeVisible: true,
        closeColor: "#FFFFFF",
        closeCallback: (() => {
          popup.element.remove()
          popup.parent.remove(popup)
          STATE.currentPopup = null

          new Bol3D.TWEEN.Tween(camera.position)
            .to(CACHE.tempCameraState.position, 800)
            .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
            .start()

          new Bol3D.TWEEN.Tween(control.target)
            .to(CACHE.tempCameraState.target, 800)
            .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
            .start()
            .onComplete(() => {
              control.enabled = true
              control.saveState()
              control.reset()
            })
        })
      })

      popup.scale.set(0.08, 0.08, 0.08)
      popup.name = 'popup_' + obj.name
      popup.position.set(objWorldPosition.x, objWorldPosition.y + 30, objWorldPosition.z)
      CACHE.container.scene.add(popup)
      STATE.currentPopup = popup


      const eventFunc = () => {
        STATE.searchAnimateDestroy = true
        obj.material.color = color
        CACHE.container.orbitControls.removeEventListener('start', eventFunc)
      }
      CACHE.container.orbitControls.addEventListener('start', eventFunc)
      animate = () => {
        const dt = STATE.clock.getElapsedTime()
        const mixColor = Math.abs(Math.sin(dt * 2))
        obj.material.color.r = color.r + mixColor * 0.95
        obj.material.color.g = color.g + mixColor * 0.41
      }
    } else if (type === '卡匣') {
      if (STATE.currentPopup) {
        if (STATE.currentPopup.parent) {
          STATE.currentPopup.parent.remove(STATE.currentPopup)
        }
        STATE.currentPopup.element.remove()
        STATE.currentPopup = null

        STATE.sceneList.skyCarList.forEach(e => {
          e.popup.visible = true
        })
      }

      CACHE.tempCameraState = {
        position: camera.position.clone(),
        target: control.target.clone()
      }

      let title = '卡匣'
      let height = '49vh'
      let className = 'popup3d_kaxia'
      let items = [
        { name: '卡匣 ID', value: obj.userData.id || '--' },
        { name: 'carrierType', value: obj.userData.carrierType || '--' },
        { name: 'location ID', value: obj.userData.locationId || '--' },
        { name: 'Command ID', value: '--' },
        { name: 'User ID', value: '--' },
        { name: '起点', value: '--' },
        { name: '终点', value: '--' },
        { name: '优先级', value: '--' },
        { name: '当前状态', value: '--' }
      ]

      let textValue = ``
      for (let i = 0; i < items.length; i++) {
        textValue += `
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0 5%;
              height: 4vh;
              width: 100%;
              background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
              ">
              <p style="font-size: 2vh;">${items[i].name}</p>
              <p style="font-size: 2vh;">${items[i].value}</p>
            </div>`
      }

      const popup = new Bol3D.POI.Popup3DSprite({
        value: `
            <div style="
              pointer-events: none;
              margin:0;
              color: #ffffff;
            ">

            <div style="
                position: absolute;
                background: url('./assets/3d/img/47.png') center / 100% 100% no-repeat;
                width: 25vw;
                height: ${height};
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
                ${title}
              </p>

              <div style="
                display: flex;
                flex-direction: column;
                width: 85%;
                margin: 4% auto 0 auto;
                height: 100%;
              ">
              ${textValue}
              </div>
            </div>
          </div>
          `,
        position: [0, 0, 0],
        className: `popup3dclass ${className}`,
        closeVisible: true,
        closeColor: "#FFFFFF",
        closeCallback: (() => {
          popup.element.remove()
          popup.parent.remove(popup)
          STATE.currentPopup = null

          new Bol3D.TWEEN.Tween(camera.position)
            .to(CACHE.tempCameraState.position, 800)
            .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
            .start()

          new Bol3D.TWEEN.Tween(control.target)
            .to(CACHE.tempCameraState.target, 800)
            .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
            .start()
            .onComplete(() => {
              control.enabled = true
              control.saveState()
              control.reset()
            })
        })
      })

      popup.scale.set(0.08, 0.08, 0.08)
      popup.name = 'popup_' + obj.name
      popup.position.set(objWorldPosition.x, objWorldPosition.y + 5, objWorldPosition.z)
      CACHE.container.scene.add(popup)
      STATE.currentPopup = popup
      const finalPosition = computedCameraTweenPosition(camera.position, objWorldPosition)

      new TWEEN.Tween(camera.position)
        .to(finalPosition, 800)
        .start()
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.updateProjectionMatrix()
        })
      new TWEEN.Tween(control.target)
        .to({
          x: objWorldPosition.x,
          y: objWorldPosition.y + 5,
          z: objWorldPosition.z
        }, 800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()

      const eventFunc = () => {
        STATE.searchAnimateDestroy = true
        CACHE.container.orbitControls.removeEventListener('start', eventFunc)
      }

      CACHE.container.orbitControls.addEventListener('start', eventFunc)
      animate = () => {
        if (isCameraMoveOver) {
          control.target.set(objWorldPosition.x, objWorldPosition.y + 5, objWorldPosition.z)
        }
      }

      // 接口
      CarrierFindCmdId(obj.userData.id).then(res => {
        if (res?.data?.length) {

          const data = res.data[0]
          popup.parent.remove(popup)
          STATE.currentPopup.element.remove()

          let items = [
            { name: '卡匣 ID', value: obj.userData.id || '--' },
            { name: 'carrierType', value: obj.userData.carrierType || '--' },
            { name: 'location ID', value: obj.userData.locationId || '--' },
            { name: 'Command ID', value: data.commandId || '--' },
            { name: 'User ID', value: '--' },
            { name: '起点', value: data.sourcePort || '--' },
            { name: '终点', value: data.destPort || '--' },
            { name: '优先级', value: data.priority || '--' },
            { name: '当前状态', value: '--' }
          ]

          let textValue = ``
          for (let i = 0; i < items.length; i++) {
            textValue += `
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 5%;
                    height: 4vh;
                    width: 100%;
                    background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
                    ">
                    <p style="font-size: 2vh;">${items[i].name}</p>
                    <p style="font-size: 2vh;">${items[i].value}</p>
                  </div>`
          }

          const newPopup = new Bol3D.POI.Popup3DSprite({
            value: `
                  <div style="
                    pointer-events: none;
                    margin:0;
                    color: #ffffff;
                  ">
      
                  <div style="
                      position: absolute;
                      background: url('./assets/3d/img/47.png') center / 100% 100% no-repeat;
                      width: 25vw;
                      height: ${height};
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
                      ${title}
                    </p>
      
                    <div style="
                      display: flex;
                      flex-direction: column;
                      width: 85%;
                      margin: 4% auto 0 auto;
                      height: 100%;
                    ">
                    ${textValue}
                    </div>
                  </div>
                </div>
                `,
            position: [0, 0, 0],
            className: `popup3dclass ${className}`,
            closeVisible: true,
            closeColor: "#FFFFFF",
            closeCallback: (() => {
              popup.element.remove()
              STATE.currentPopup = null
              popup.parent && popup.parent.remove(popup)
            })
          })

          newPopup.scale.set(0.08, 0.08, 0.08)
          newPopup.name = 'popup_' + obj.name
          newPopup.position.set(objWorldPosition.x, objWorldPosition.y + 5, objWorldPosition.z)
          CACHE.container.scene.add(newPopup)
          STATE.currentPopup = newPopup

        }
      })
    }


    render()
    function render() {
      obj.getWorldPosition(objWorldPosition)

      TWEEN.update();
      if (STATE.searchAnimateDestroy) {
        return
      } else {
        animate()
        requestAnimationFrame(render)
      }
    }
  }
}

// 实例化点击
function clickInstance(obj, index) {
  const transformInfo = CACHE.instanceTransformInfo[obj.name][index]

  const camera = CACHE.container.orbitCamera
  const control = CACHE.container.orbitControls

  CACHE.tempCameraState = {
    position: camera.position.clone(),
    target: control.target.clone()
  }

  if (STATE.currentPopup) {
    STATE.currentPopup.element.remove()
    if (STATE.currentPopup.parent) {
      STATE.currentPopup.parent.remove(STATE.currentPopup)
      STATE.currentPopup = null
    }
    STATE.sceneList.skyCarList.forEach(e2 => {
      e2.popup.visible = true
    })
  }
  const name = 'popup_' + obj.name
  let items = []
  let title = ''
  let height = ''
  let className = ''

  if (obj.name.includes('shalves2')) {
    title = 'OHB'
    items = [
      { name: 'OHB Group', value: STATE.sceneList.shelves2Arr[index].area },
      { name: 'Remark', value: STATE.sceneList.shelves2Arr[index].shelf },
      { name: 'OHTPort1', value: STATE.sceneList.shelves2Arr[index].fields[0] },
      { name: 'OHTPort2', value: STATE.sceneList.shelves2Arr[index].fields[1] }
    ]
    height = '16vh'
    className = 'popup3d_shalves'

  } else if (obj.name.includes('shalves4')) {
    title = 'OHB'
    items = [
      { name: 'OHB Group', value: STATE.sceneList.shelves4Arr[index].area },
      { name: 'Remark', value: STATE.sceneList.shelves4Arr[index].shelf },
      { name: 'OHTPort1', value: STATE.sceneList.shelves4Arr[index].fields[0] },
      { name: 'OHTPort2', value: STATE.sceneList.shelves4Arr[index].fields[1] },
      { name: 'OHTPort2', value: STATE.sceneList.shelves4Arr[index].fields[2] },
      { name: 'OHTPort2', value: STATE.sceneList.shelves4Arr[index].fields[3] }
    ]
    height = '38vh'
    className = 'popup3d_shalves'

  } else {
    const deviceItem = CACHE.instanceNameMap[obj.name.split('_')[0]][index]

    title = '机台'
    items = [
      { name: '机台ID', value: deviceItem?.id || '--' },
      { name: '机台Type', value: '--' },
      { name: '机台状态', value: '--' },
      { name: 'isOnline', value: '--' },
      { name: 'Bay', value: '--' },
      { name: 'Port1', value: '--' },
      { name: 'Port2', value: '--' },
      { name: 'Port3', value: '--' },
      { name: 'Port4', value: '--' }
    ]
    height = '49vh'
    className = 'popup3d_jitai'
  }




  let textValue = ``
  for (let i = 0; i < items.length; i++) {
    textValue += `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 5%;
        height: 4vh;
        width: 100%;
        background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
        ">
        <p style="font-size: 2vh;">${items[i].name}</p>
        <p style="font-size: 2vh;">${items[i].value}</p>
      </div>`
  }

  const popup = new Bol3D.POI.Popup3DSprite({
    value: `
      <div style="
        pointer-events: none;
        margin:0;
        color: #ffffff;
      ">

      <div style="
          position: absolute;
          background: url('./assets/3d/img/47.png') center / 100% 100% no-repeat;
          width: 25vw;
          height: ${height};
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
          ${title}
        </p>

        <div style="
          display: flex;
          flex-direction: column;
          width: 85%;
          margin: 4% auto 0 auto;
          height: 100%;
        ">
        ${textValue}
        </div>
      </div>
    </div>
    `,
    position: [0, 0, 0],
    className: `popup3dclass ${className}`,
    closeVisible: true,
    closeColor: "#FFFFFF",
    closeCallback: (() => {
      popup.element.remove()
      popup.parent.remove(popup)
      STATE.currentPopup = null

      new Bol3D.TWEEN.Tween(camera.position)
        .to(CACHE.tempCameraState.position, 800)
        .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
        .start()

      new Bol3D.TWEEN.Tween(control.target)
        .to(CACHE.tempCameraState.target, 800)
        .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(() => {
          control.enabled = true
          control.saveState()
          control.reset()
        })
    })
  })

  popup.scale.set(0.08, 0.08, 0.08)
  popup.name = name
  popup.position.set(transformInfo.position.x, transformInfo.position.y + 15, transformInfo.position.z)
  CACHE.container.scene.add(popup)
  STATE.currentPopup = popup

  let desdory = false


  const finalPosition = computedCameraTweenPosition(camera.position, transformInfo.position)
  new TWEEN.Tween(camera.position)
    .to(finalPosition, 800)
    .start()
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.updateProjectionMatrix()
    })
    .onComplete(() => {
      desdory = true
    })

  new TWEEN.Tween(control.target)
    .to({
      x: transformInfo.position.x,
      y: transformInfo.position.y + 15,
      z: transformInfo.position.z
    }, 800)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()

  render()
  function render() {
    TWEEN.update();
    if (desdory) {
      return
    } else {
      requestAnimationFrame(render)
    }
  }


  if (title === '机台') {
    const deviceId = items.find(e => e.name === '机台ID').value
    GetRealTimeEqpState(deviceId).then(res => {
      if (res?.data?.length) {
        const data = res.data[0]
        const type = data?.equipmentType == 0 ? 'VEHICLE' : data?.equipmentType == 1 ? 'EQP' : data?.equipmentType == 2 ? 'STC' : data?.equipmentType == 3 ? 'OLUS' : ''
        const enable = data?.enable == 0 ? '禁用' : data?.enable == 1 ? '启用' : ''
        const isOnlineState = data?.isOnlineState == 0 ? '离线' : data?.isOnlineState == 1 ? '在线' : ''

        popup.parent.remove(popup)
        STATE.currentPopup.element.remove()

        let items = [
          { name: '机台ID', value: deviceId || '--' },
          { name: '机台Type', value: type || '--' },
          { name: '机台状态', value: enable || '--' },
          { name: 'isOnline', value: isOnlineState || '--' },
          { name: 'Bay', value: '--' },
          { name: 'Port1', value: '--' },
          { name: 'Port2', value: '--' },
          { name: 'Port3', value: '--' },
          { name: 'Port4', value: '--' }
        ]


        let textValue = ``
        for (let i = 0; i < items.length; i++) {
          textValue += `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 5%;
        height: 4vh;
        width: 100%;
        background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
        ">
        <p style="font-size: 2vh;">${items[i].name}</p>
        <p style="font-size: 2vh;">${items[i].value}</p>
      </div>`
        }

        const newPopup = new Bol3D.POI.Popup3DSprite({
          value: `
      <div style="
        pointer-events: none;
        margin:0;
        color: #ffffff;
      ">

      <div style="
          position: absolute;
          background: url('./assets/3d/img/47.png') center / 100% 100% no-repeat;
          width: 25vw;
          height: ${height};
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
          ${title}
        </p>

        <div style="
          display: flex;
          flex-direction: column;
          width: 85%;
          margin: 4% auto 0 auto;
          height: 100%;
        ">
        ${textValue}
        </div>
      </div>
    </div>
    `,
          position: [0, 0, 0],
          className: `popup3dclass ${className}`,
          closeVisible: true,
          closeColor: "#FFFFFF",
          closeCallback: (() => {
            popup.element.remove()
            popup.parent.remove(popup)
            STATE.currentPopup = null

            new Bol3D.TWEEN.Tween(camera.position)
              .to(CACHE.tempCameraState.position, 800)
              .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
              .start()

            new Bol3D.TWEEN.Tween(control.target)
              .to(CACHE.tempCameraState.target, 800)
              .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
              .start()
              .onComplete(() => {
                control.enabled = true
                control.saveState()
                control.reset()
              })
          })
        })

        newPopup.scale.set(0.08, 0.08, 0.08)
        newPopup.name = 'popup_' + obj.name
        newPopup.name = name
        newPopup.position.set(transformInfo.position.x, transformInfo.position.y + 15, transformInfo.position.z)
        CACHE.container.scene.add(newPopup)
        STATE.currentPopup = newPopup

      }
    })
  }
}


// 获取动画
function getAnimationList() {
  const animations = {};
  CACHE.container.mixerActions.forEach((item) => {
    if (!animations[item._mixer._root.name]) {
      animations[item._mixer._root.name] = []
    }
    animations[item._mixer._root.name].push(item)
  });
  STATE.animations = animations
}

// 加载货架
function initShelves() {
  STATE.sceneList.shelves = {}
  STATE.sceneList.shelves2Arr = []
  STATE.sceneList.shelves4Arr = []

  for (let area in DATA.shelvesMap) {
    for (let shelf in DATA.shelvesMap[area]) {
      const item = DATA.shelvesMap[area][shelf]
      item.shelf = shelf
      item.area = area

      let model = null
      if (item.fields.length === 4) {
        STATE.sceneList.shelves4Arr.push(item)
        model = STATE.sceneList.huojia4.clone()
      } else {
        STATE.sceneList.shelves2Arr.push(item)
        model = STATE.sceneList.huojia2.clone()
      }

      model.visible = true
      model.position.set(...item.position)
      model.rotation.y = item.rotate * Math.PI / 180
      model.userData.fields = item.fields
      model.userData.name = shelf
      model.userData.area = area

      // if (!STATE.shelvesList[shelf]) {
      //   STATE.shelvesList[shelf] = {}
      // }

      // STATE.shelvesList[shelf][e] = {
      //   mesh: null,
      //   position: [kaxia.position.x, kaxia.position.y, kaxia.position.z],
      //   rotateY: kaxia.rotation.y
      // }

      STATE.sceneList.shelves[shelf] = model
      CACHE.container.scene.add(model)

    }
  }
}

/**
 * 组实例化
 * @param {Array} arr 需要实例化的 相同组结构的模型集合 例如：[group1{mesh_1,mesh_2,mesh_3},group2{mesh_1,mesh_2,mesh_3},group3{mesh_1,mesh_2,mesh_3}]
 * @param {String} name 实例化信息命名
 * @param {Object} evt container
 */
function instantiationGroupInfo(arr, name, evt) {

  arr.forEach((item) => {
    if (item.userData.type === '机台') {
      if (!CACHE.instanceNameMap[item.name]) {
        CACHE.instanceNameMap[item.name] = [];
      }
      CACHE.instanceNameMap[item.name].push({ index: CACHE.instanceNameMap[item.name].length, id: item.userData.id })
    }

    item.traverse(child => {
      if (child.isMesh) {
        let position = new Bol3D.Vector3()
        let scale = new Bol3D.Vector3()
        let quaternion = new Bol3D.Quaternion()
        child.getWorldPosition(position)
        child.getWorldScale(scale)
        child.getWorldQuaternion(quaternion)

        const instanceName = `${name}_${child.name}`;

        if (!CACHE.instanceTransformInfo[instanceName]) {
          CACHE.instanceTransformInfo[instanceName] = [];
        }

        CACHE.instanceTransformInfo[instanceName].push({
          position,
          quaternion,
          scale,
        });

        if (item.name.includes('huojia')) {
          if (!CACHE.instanceNameMap[item.name]) {
            CACHE.instanceNameMap[item.name] = [];
          }
          CACHE.instanceNameMap[item.name].push({ index: CACHE.instanceNameMap[item.name].length, name: item.userData.name })

        }

        if (!CACHE.instanceMeshInfo[instanceName])
          CACHE.instanceMeshInfo[instanceName] = {
            material: child.material.clone(),
            geometry: child.geometry.clone(),
          };

        let flag = -1;
        for (let j = 0; j < evt.clickObjects.length; j++) {
          if (evt.clickObjects[j].uuid === child.uuid) {
            flag = j;
            break;
          }
        }
        if (flag !== -1) evt.clickObjects.splice(flag, 1);

        if (!CACHE.removed[item.uuid]) {
          CACHE.removed[item.uuid] = item;
        }

        child.geometry.dispose();
        if (child.material.map) {
          child.material.map.dispose();
          child.material.map = null;
        }
        child.material.dispose();
        child = null;
      }
    })
  });
}

/**
* 单模型实例化
* @param {Array} arr 需要实例化的 单mesh结构模型集合 例如：[mesh_1,mesh_2,mesh_3]
* @param {String} name 实例化信息命名
* @param {Object} evt container
*/
function instantiationSingleInfo(identicalMeshArray, name, evt) {
  identicalMeshArray.forEach((item) => {
    const instanceName = `${name}`;
    if (!CACHE.instanceTransformInfo[instanceName])
      CACHE.instanceTransformInfo[instanceName] = [];

    let p = new Bol3D.Vector3()
    let s = new Bol3D.Vector3()
    let q = new Bol3D.Quaternion()


    item.getWorldPosition(p)
    item.getWorldScale(s)
    item.getWorldQuaternion(q)

    CACHE.instanceTransformInfo[instanceName].push({
      position: p,
      quaternion: q,
      scale: s,
    });

    if (!CACHE.instanceMeshInfo[instanceName])
      CACHE.instanceMeshInfo[instanceName] = {
        material: item.material.clone(),
        geometry: item.geometry.clone(),
      };

    let flag = -1;
    for (let j = 0; j < evt.clickObjects.length; j++) {
      if (evt.clickObjects[j].uuid === item.uuid) {
        flag = j;
        break;
      }
    }
    if (flag !== -1) evt.clickObjects.splice(flag, 1);

    if (!CACHE.removed[item.uuid]) CACHE.removed[item.uuid] = item;

    item.geometry.dispose();
    if (item.material.map) {
      item.material.map.dispose();
      item.material.map = null;
    }
    item.material.dispose();
    item = null;
  });
}

// 显隐机台
function deviceShow(type) {
  const instancedMeshArr = CACHE.container.scene.children.filter(e => e.isInstancedMesh)
  const keys = Array.from(new Set(DATA.deviceMap.value.map(e => e.type)))
  keys.forEach(key => {
    const itemArr = instancedMeshArr.filter(e => e.name.split('_')[0] === key)
    itemArr.forEach(e => {
      e.visible = type
    })
  })
}

// 通过 GetCarrierInfo 的locationId 找 position
function getPositionByKaxiaLocation(location) {
  for (let key in DATA.shelvesMap) {
    for (let key2 in DATA.shelvesMap[key]) {
      if (DATA.shelvesMap[key][key2].fields.includes(Number(location))) {

        const item = DATA.shelvesMap[key][key2]
        const position = new Bol3D.Vector3()
        const index = item.fields.findIndex(e => e === Number(location))
        if (item.fields.length === 4) {
          if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(key)) {
            position.set(item.position[0] - 7.3 + index * 4.9, 28, item.position[2])
          } else {
            position.set(item.position[0], 27, item.position[2] - 7.3 + index * 4.9)
          }

        } else if (item.fields.length === 2) {
          if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(key)) {
            position.set(item.position[0] - 2.5 + index * 4.9, 28, item.position[2])
          } else {
            position.set(item.position[0], 27, item.position[2] - 2.5 + index * 4.9)
          }
        }

        const res = {
          position,
          area: key,
          shelf: key2,
          shelfIndex: index
        }
        return res
      }
    }
  }
}

// 加载卡匣
function initKaxia() {
  CACHE.container.scene.add(STATE.sceneList.kaxiaList)
  GetCarrierInfo().then(res => {
    if (!res?.data) return

    res.data.forEach(e => {
      if (e.carrierType !== '0' && e.carrierType !== '1') return

      const position = getPositionByKaxiaLocation(e.locationId)

      if (!position) return

      const kaxia = e.carrierType === '0' ? STATE.sceneList.FOUP.clone() : STATE.sceneList.FOSB.clone()
      kaxia.userData.id = e.carrierId
      kaxia.userData.locationId = e.locationId
      kaxia.userData.carrierType = e.carrierType === '0' ? 'FOUP' : e.carrierType === '1' ? 'FOSB' : e.carrierType === '2' ? 'POD' : ''
      kaxia.userData.area = position.area
      kaxia.userData.shelf = position.shelf
      kaxia.userData.shelfIndex = position.shelfIndex
      kaxia.userData.type = 'kaxia'
      kaxia.scale.set(30, 30, 30)
      kaxia.position.set(position.position.x, position.position.y, position.position.z)
      kaxia.rotation.y = DATA.shelvesMap[position.area][position.shelf].rotate * Math.PI / 180 - Math.PI / 2
      kaxia.visible = true
      kaxia.traverse(e2 => {
        if (e2.isMesh) {
          e2.userData.id = kaxia.userData.id
          e2.userData.locationId = kaxia.userData.locationId
          e2.userData.carrierType = kaxia.userData.carrierType
          e2.userData.area = kaxia.userData.area
          e2.userData.shelf = kaxia.userData.shelf
          e2.userData.shelfIndex = kaxia.userData.shelfIndex
          e2.userData.type = kaxia.userData.type
          CACHE.container.clickObjects.push(e2)
        }
      })

      STATE.sceneList.kaxiaList.add(kaxia)
    })
  })
}


// render
render()
function render() {
  requestAnimationFrame(render)

  // 更新当前帧率
  const t = STATE.clock.getElapsedTime()
  const frameRate = 1 / (t - CACHE.oldClock)
  STATE.frameRate = frameRate
  CACHE.oldClock = t
}





export const API = {
  ...TU,
  getData,
  cameraAnimation,
  loadGUI,
  handleLine,
  initSkyCar,
  initReflexFloor,
  search,
  initDeviceByMap,
  getAnimationList,
  initShelves,
  instantiationGroupInfo,
  instantiationSingleInfo,
  clickInstance,
  testBox,
  deviceShow,
  getPositionByKaxiaLocation,
  initKaxia
}
