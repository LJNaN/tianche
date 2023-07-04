import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import TU from './js/threeUtils.js'
import { Reflector } from './js/Reflector.js'
import * as TWEEN from '@tweenjs/tween.js'

// 获取数据
function getData() {
  STATE.sceneList.skyCarList = []
  let wsMessage = null

  // 真实数据
  // ======================================
  const api = window.wsAPI
  const ws = new WebSocket(
    // `ws://192.168.150.133:8090/MOC/OHTC/SendData/${new Date() * 1}`
    api
  )
  ws.onmessage = (info) => {
    wsMessage = JSON.parse(info.data)
    drive(wsMessage)
  }



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
  coordinate = 0           // 当前坐标
  history = {}             // 历史坐标与时间
  state = 5                // 状态
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
      search('天车', this.id)
      this.initClickPopup()
    }))

  }

  initClickPopup() {
    if (this.clickPopup) {
      return;
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
        height: 12.5%;
        width: 100%;
        background: url('./assets/3d/img/44.png') center / 100% 100% no-repeat;
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
          height: 68%;
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
      })
    })

    clickPopup.scale.set(0.08, 0.08, 0.08)
    clickPopup.name = name



    this.popup.visible = false
    this.skyCarMesh.add(clickPopup)
    this.clickPopup = clickPopup
    clickPopup.position.y = 2.3
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
  // DATA.skyCarMap.forEach(e => {
  //   const skyCar = new SkyCar({ coordinate: e.coordinate, id: e.id })

  //   setInterval(() => {
  //     if (skyCar.coordinate >= 1500000) skyCar.coordinate = 19000
  //     skyCar.coordinate += 200
  //     skyCar.setPosition()
  //   }, 333)

  //   if (!STATE.sceneList.skyCarList) {
  //     STATE.sceneList.skyCarList = []
  //   }
  //   STATE.sceneList.skyCarList.push(skyCar)
  // })
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
        x: Math.abs(camera.position.x) > 100 ? camera.position.x / 2 : camera.position.x,
        y: Math.abs(camera.position.y) > 200 ? camera.position.y / 2 : camera.position.y,
        z: Math.abs(camera.position.z) > 100 ? camera.position.z / 2 : camera.position.z
      }, 1500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
      .onUpdate(() => {
        camera.updateProjectionMatrix()
      })

    new TWEEN.Tween(contorl.target)
      .to(objWorldPosition, 1500)
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

}

// 获取动画
const getAnimationList = () => {
  const animations = {};
  CACHE.container.mixerActions.forEach((item) => {
    if (!animations[item._mixer._root.name]) {
      animations[item._mixer._root.name] = []
    }
    animations[item._mixer._root.name].push(item)
  });
  STATE.animations = animations
};


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
  initSkyCarPopup,
  getAnimationList,
  testBox
}
