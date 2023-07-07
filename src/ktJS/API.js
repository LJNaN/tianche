import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import TU from './js/threeUtils.js'
import { Reflector } from './js/Reflector.js'
import * as TWEEN from '@tweenjs/tween.js'
import mockData from './js/mock'

// 获取数据
function getData() {
  STATE.sceneList.skyCarList = []
  let wsMessage = null

  // 真实数据
  // ======================================
  // const api = window.wsAPI
  // const ws = new WebSocket(api)
  // ws.onmessage = (info) => {
  //   wsMessage = JSON.parse(info.data)
  //   drive(wsMessage)
  // }



  // 模拟数据
  // =======================================
  // let i = 0
  // setInterval(() => {
  //   if (i >= mockData.length) i = 0
  //   drive(JSON.parse(mockData[i].data))
  //   i++
  // }, 333)

}

// 数据驱动
function drive(wsMessage) {
  // 处理天车
  if (wsMessage?.VehicleInfo?.length) {
    wsMessage.VehicleInfo.forEach(e => {
      const skyCar = STATE.sceneList.skyCarList.find(car => car.id === e.ohtID)
      if (skyCar) {
        // 处理颜色
        if (e.ohtStatus_OnlineControl === '0') { // 离线
          if (skyCar.state != 5) {
            skyCar.state = 5
            skyCar.setPopupColor()
          }

        } else {
          if (e.ohtStatus_UnLoading === '1' || e.ohtStatus_Loading === '1') { // 放货/取货中
            if (skyCar.state != 2) {
              skyCar.state = 2
              skyCar.setPopupColor()
            }

          } else if (e.ohtStatus_Quhuoxing === '1') { // 取货行
            if (skyCar.state != 0) {
              skyCar.state = 0
              skyCar.setPopupColor()
            }

          } else if (e.ohtStatus_Fanghuoxing === '1') { // 放货行
            if (skyCar.state != 1) {
              skyCar.state = 1
              skyCar.setPopupColor()
            }

          } else { // 漫游
            if (skyCar.state != 3) {
              skyCar.state = 3
              skyCar.setPopupColor()
            }
          }
        }

        // 处理位置
        {
          if (!skyCar.history.new) {  // 初始化 history 时
            skyCar.history.new = {
              time: new Date() * 1,
              coordinate: e.position
            }
            skyCar.history.old = Object.assign({}, skyCar.history.new)
            skyCar.coordinate = e.position
            skyCar.setPosition(0)

          } else { // 更新 history
            skyCar.history.new = {
              time: new Date() * 1,
              coordinate: e.position
            }

            if (skyCar.history.old.coordinate != skyCar.history.new.coordinate) {
              // 位置动画
              const time = skyCar.history.new.time - skyCar.history.old.time
              skyCar.coordinate = skyCar.history.new.coordinate
              skyCar.setPosition(time)

              skyCar.history.old = Object.assign({}, skyCar.history.new)
            }
          }
        }

      } else {
        const newCar = new SkyCar({ id: e.ohtID, coordinate: e.position })
        STATE.sceneList.skyCarList.push(newCar)
      }
    })
  }

  // 处理报警
  if (wsMessage?.AlarmInfo?.length) {
    if (STATE.alarmList) {
      wsMessage.AlarmInfo.forEach(e => {
        if (e.alarmType === 'set') {
          STATE.alarmList.value.unshift(e)
        } else if (e.alarmType === 'cancel') {
          const itemIndex = STATE.alarmList.value.findIndex(e2 => e2.alarmId === e.alarmId)
          if (itemIndex >= 0) {
            STATE.alarmList.value.splice(itemIndex, 1)
          }
        }
      })
    }
  }
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
      CACHE.container.clickObjects.push(child)

      child.userData.direction = direction
      child.userData.worldPosition = lineWorldPosition
      child.userData.long = long
      child.userData.id = child.name.replace('-', '_')
      child.userData.type = '轨道'

      if (!STATE.sceneList.lineList) {
        STATE.sceneList.lineList = []
      }
      STATE.sceneList.lineList.push(child)
    }
  })
}


// 天车类
class SkyCar {
  coordinate = 0           // 当前坐标
  history = {}             // 历史坐标与时间
  state = 0                // 状态
  id = ''                  // id
  skyCarMesh = null        // 天车模型
  animation = null         // render 里的每帧动画
  popup = null             // 默认弹窗
  clickPopup = null        // 点击之后的弹窗
  mixer = null             // 模型动画管理器
  actions = null           // 模型动画
  speed = 0.05             // 模型动画速度

  constructor(opt) {
    if (opt.coordinate != undefined) this.coordinate = opt.coordinate
    if (opt.id != undefined) this.id = opt.id
    if (opt.speed != undefined) this.speed = opt.speed
    this.initSkyCar()
    this.initPopup()
    this.setAnimation()
    this.setPosition()
  }

  initSkyCar() {
    this.skyCarMesh = STATE.sceneList.tianche.clone()
    this.skyCarMesh.visible = true
    CACHE.container.scene.add(this.skyCarMesh)

    this.skyCarMesh.traverse(e => {
      if (e.isMesh) {
        e.userData.type = '天车'
        e.userData.id = this.id
        CACHE.container.clickObjects.push(e)
      }
    })
  }

  initPopup() {
    const name = 'popup_天车_' + this.id
    const popup = new Bol3D.POI.Popup3DSprite({
      value: `
      <div style="
        pointer-events: all;
        margin:0;
        color: #ffffff;
      ">

        <div style="
          position: absolute;
          background: url('./assets/3d/img/${DATA.skyCarStateColorMap[this.state].img[0]}.png') center / 100% 100% no-repeat;
          width: 30vw;
          height: 20vh;
          transform: translate(-50%, -50%);
        ">
          <p style="font-size: 8vh;line-height: 80%; font-family: YouSheBiaoTiHei; text-align: center; margin-top: 7%;">${this.id}</p>
        </div>

        <div style="
          position: absolute;
          background: url('./assets/3d/img/${DATA.skyCarStateColorMap[this.state].img[1]}.png') center / 100% 100% no-repeat;
          width: 8vw;
          height: 10vh;
          animation: arrowJump 1s linear infinite;
        ">
        </div>
      </div>
    `,
      position: [0, 0, 0],
      className: 'popup3dclass popup3d_tianche',
      closeVisible: false
    })

    popup.scale.set(0.05, 0.05, 0.05)
    popup.name = name
    this.skyCarMesh.add(popup)
    this.skyCarMesh.userData.popup = popup
    popup.position.y = 2.3
    this.popup = popup

    popup.element.addEventListener('click', (() => {
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

      search('天车', this.id)
      this.initClickPopup()
    }))

  }

  initClickPopup() {
    if (this.clickPopup) {
      return;
    }

    if (STATE.currentPopup) {
      if (STATE.currentPopup.parent) {
        STATE.currentPopup.parent.remove(STATE.currentPopup)
      }
      STATE.currentPopup.element.remove()
      STATE.currentPopup = null
    }

    const name = 'click_popup_天车_' + this.id
    const items = [
      { name: '卡匣ID', value: '09728' },
      { name: 'COMMAND ID', value: '57129' },
      { name: 'USER ID', value: '59741' },
      { name: '起点', value: '69715' },
      { name: '终点', value: '98558' },
      { name: '优先级', value: '低' },
      { name: '当前状态', value: '漫游' },
      { name: 'ALARM 情况', value: '正常' },
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

    const clickPopup = new Bol3D.POI.Popup3DSprite({
      value: `
      <div style="
        pointer-events: none;
        margin:0;
        color: #ffffff;
      ">

      <div style="
          position: absolute;
          background: url('./assets/3d/img/${DATA.skyCarStateColorMap[this.state].img[2]}.png') center / 100% 100% no-repeat;
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
          height: 100%;
        ">
        ${textValue}
        </div>
      </div>
    </div>
    `,
      position: [0, 0, 0],
      className: 'popup3dclass popup3d_tianche',
      closeVisible: true,
      closeColor: "#FFFFFF",
      closeCallback: (() => {
        this.popup.visible = true
        this.clickPopup.parent.remove(this.clickPopup)
        this.clickPopup = null
        STATE.currentPopup = null
      })
    })

    clickPopup.scale.set(0.08, 0.08, 0.08)
    clickPopup.name = name



    this.popup.visible = false
    this.skyCarMesh.add(clickPopup)
    this.clickPopup = clickPopup
    clickPopup.position.y = 2.3
    STATE.currentPopup = clickPopup
  }

  setPopupColor() {
    const item = DATA.skyCarStateColorMap[this.state]

    const div = this.popup?.element?.children[0]
    if (div) {
      const title = div?.children[0]
      const arrow = div?.children[1]
      title.style.background = title.style.background.replace(/img\/.*?\.png/, `img/${item.img[0]}.png`)
      arrow.style.background = arrow.style.background.replace(/img\/.*?\.png/, `img/${item.img[1]}.png`)
    }

    const clickDiv = this.clickPopup?.element?.children[0]
    if (clickDiv) {
      const content = clickDiv?.children[0]
      content.style.background = content.style.background.replace(/img\/.*?\.png/, `img/${item.img[2]}.png`)
    }
  }

  setPosition(time = 1000) {
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
        }, time)
        this.animation.start()
      }
    }
  }

  setAnimation() {
    const this_ = this
    // 克隆动画
    this.mixer = new Bol3D.AnimationMixer(this.skyCarMesh)
    STATE.animations.tianche.forEach(e => {
      this.mixer.clipAction(e._clip)
    })
    const actions = {}
    this.mixer._actions.forEach(e => {
      e.clampWhenFinished = true
      e.loop = Bol3D.LoopOnce
      e.name = e._clip.name
      actions[e._clip.name] = e
    })
    this.actions = actions
    this.skyCarMesh.userData.instance = this

    animate()
    function animate() {
      this_.mixer.update(this_.speed)
      requestAnimationFrame(animate)
    }
  }

  // 设置伸缩方法
  down() {
    this.actions.shen.enabled = true
    this.actions.suo.enabled = false
    this.actions.fang.enabled = false
    this.actions.shou.enabled = false

    this.actions.shen.clampWhenFinished = false
    this.actions.shen.reset().play()

    this.mixer.addEventListener('finished', ((e) => {
      if (e.action.name === 'shen') {
        this.actions.shen.enabled = false
        this.actions.fang.enabled = true
        this.actions.fang.reset().play()
      }
    }))
  }

  up() {
    this.actions.shou.enabled = true
    this.actions.fang.enabled = false
    this.actions.shen.enabled = false
    this.actions.suo.enabled = false

    this.actions.shou.reset().play()
    this.mixer.addEventListener('finished', ((e) => {
      if (e.action.name === 'shou') {
        this.actions.shou.enabled = false
        this.actions.suo.enabled = true
        this.actions.suo.reset().play()
        this.actions.kakoushen.reset().play()
        this.actions.dangbanshen.reset().play()
      }
    }))
  }
}

// 加载模拟天车
function initSkyCar() {
  DATA.skyCarMap.forEach(e => {
    const skyCar = new SkyCar({ coordinate: e.coordinate, id: e.id })

    setInterval(() => {
      if (skyCar.coordinate >= 1500000) skyCar.coordinate = 0

      loop()
      function loop() {
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
    blur: 0.1
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

// 加载临时的设备
function initDeviceByMap() {
  for (let key in DATA.deviceMap) {
    let arr = []
    DATA.deviceMap[key].forEach((e, index) => {
      const model = STATE.sceneList[key].clone()
      model.visible = true
      model.position.set(...e.position)
      model.rotation.y = e.rotate * Math.PI / 180
      arr.push(model)
      CACHE.container.scene.add(model)
    })
    instantiationGroupInfo(arr, key, CACHE.container)
  }
}


// 二维的搜索 并跟随移动
function search(type, id) {

  // 恢复动画销毁为false
  STATE.searchAnimateDesdory = false

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
  }

  if (obj) {
    // 相机移动动画
    let isCameraMoveOver = false // 动画移动完成
    const camera = CACHE.container.orbitCamera
    const contorl = CACHE.container.orbitControls
    let objWorldPosition = new Bol3D.Vector3()
    obj.getWorldPosition(objWorldPosition)

    new TWEEN.Tween(camera.position)
      .to({
        x: Math.abs(camera.position.x - objWorldPosition.x) > 200 ? camera.position.x / 2 : camera.position.x,
        y: Math.abs(camera.position.y - objWorldPosition.y) > 200 ? camera.position.y / 2 : camera.position.y,
        z: Math.abs(camera.position.z - objWorldPosition.z) > 200 ? camera.position.z / 2 : camera.position.z
      }, 800)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
      .onUpdate(() => {
        camera.updateProjectionMatrix()
      })

    new TWEEN.Tween(contorl.target)
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
        STATE.searchAnimateDesdory = true
        CACHE.container.orbitControls.removeEventListener('start', eventFunc)
      }

      CACHE.container.orbitControls.addEventListener('start', eventFunc)
      animate = () => {
        if (isCameraMoveOver) {
          contorl.target.set(objWorldPosition.x, objWorldPosition.y, objWorldPosition.z)
        }
      }

    } else if (type === '轨道') {
      const color = obj.material.color.clone()
      obj.userData.color = color

      obj.material.color.g = 0.0
      obj.material.color.b = 0.0

      console.log('obj: ', obj);
      
      if (STATE.currentPopup) {
        if (STATE.currentPopup.parent) {
          STATE.currentPopup.parent.remove(STATE.currentPopup)
        }
        STATE.currentPopup.element.remove()
        STATE.currentPopup = null
      }

      let title = '轨道'
      let height = '40vh'
      let className = 'popup3d_guidao'
      let items = [
        { name: '起点节点', value: '256121' },
        { name: '起点坐标', value: '5216322' },
        { name: '终点节点', value: '214125' },
        { name: '终点坐标', value: '53261' },
        { name: '轨道状态', value: '正常' },
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
        })
      })

      popup.scale.set(0.08, 0.08, 0.08)
      popup.name = 'popup_' + obj.name
      popup.position.set(objWorldPosition.x, objWorldPosition.y + 30, objWorldPosition.z)
      CACHE.container.scene.add(popup)
      STATE.currentPopup = popup

      new TWEEN.Tween(camera.position)
        .to({
          x: Math.abs(camera.position.x - objWorldPosition.x) > 200 ? camera.position.x / 2 : camera.position.x,
          y: Math.abs(camera.position.y - objWorldPosition.y) > 200 ? camera.position.y / 2 : camera.position.y,
          z: Math.abs(camera.position.z - objWorldPosition.z) > 200 ? camera.position.z / 2 : camera.position.z
        }, 800)
        .start()
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.updateProjectionMatrix()
        })
      new TWEEN.Tween(contorl.target)
        .to({
          x: objWorldPosition.x,
          y: objWorldPosition.y + 30,
          z: objWorldPosition.z
        }, 800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()

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

// 实例化点击
function clickInstance(e) {
  const obj = e.objects[0].object
  const index = e.objects[0].instanceId
  const transformInfo = CACHE.instanceTransformInfo[obj.name][index]

  if (STATE.currentPopup) {
    STATE.currentPopup.element.remove()
    STATE.currentPopup.parent.remove(STATE.currentPopup)
    STATE.currentPopup = null
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
    items = [{ name: 'shelf ID', value: '84358' }]
    height = '16vh'
    className = 'popup3d_shalves'

  } else if (obj.name.includes('shalves4')) {
    title = 'OHB'
    items = [{ name: 'shelf ID', value: '84358' }]
    height = '16vh'
    className = 'popup3d_shalves'

  } else {
    title = '机台'
    items = [
      { name: '机台ID', value: '09728' },
      { name: '机台Type', value: '57129' },
      { name: '机台状态', value: 'Enable' },
      { name: '在线状态', value: '在线' }
    ]
    height = '30vh'
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
    })
  })

  popup.scale.set(0.08, 0.08, 0.08)
  popup.name = name
  popup.position.set(transformInfo.position.x, transformInfo.position.y + 30, transformInfo.position.z)
  CACHE.container.scene.add(popup)
  STATE.currentPopup = popup

  let desdory = false
  const camera = CACHE.container.orbitCamera
  const contorl = CACHE.container.orbitControls
  new TWEEN.Tween(camera.position)
    .to({
      x: Math.abs(camera.position.x - transformInfo.position.x) > 200 ? camera.position.x / 2 : camera.position.x,
      y: Math.abs(camera.position.y - transformInfo.position.y) > 200 ? camera.position.y / 2 : camera.position.y,
      z: Math.abs(camera.position.z - transformInfo.position.z) > 200 ? camera.position.z / 2 : camera.position.z
    }, 800)
    .start()
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.updateProjectionMatrix()
    })
    .onComplete(() => {
      desdory = true
    })

  new TWEEN.Tween(contorl.target)
    .to({
      x: transformInfo.position.x,
      y: transformInfo.position.y + 30,
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
  STATE.sceneList.shelvesArr = []

  for (let area in DATA.shelvesMap) {
    for (let shelf in DATA.shelvesMap[area]) {
      const item = DATA.shelvesMap[area][shelf]
      item.shelf = shelf
      item.area = area
      STATE.sceneList.shelvesArr.push(item)
      
      let model = null
      if (item.fields.length === 4) {
        model = STATE.sceneList.huojia4.clone()
      } else {
        model = STATE.sceneList.huojia2.clone()
      }
      model.visible = true
      model.position.set(...item.position)
      model.rotation.y = item.rotate * Math.PI / 180
      model.userData.fields = item.fields
      model.userData.name = shelf
      model.userData.area = area
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
  // const randomNum = Math.floor(Math.random() * 10000)

  arr.forEach((item) => {
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
  testBox
}
