import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import TU from './js/threeUtils.js'
import { Reflector } from './js/Reflector.js'
import * as TWEEN from '@tweenjs/tween.js'
import mockData from './js/mock'
import mockData2 from './js/mock2'
import { GetCarrierInfo, OhtFindCmdId } from '@/axios/api.js'

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



  let i = 0
  setInterval(() => {
    if (i >= mockData2.length) i = 0
    drive(mockData2[i])
    i++
  }, 111)
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

          } else if (e.ohtStatus_Loading === '0' && skyCar.state === 2) { // 完成取货/放货
            skyCar.state = 1
          } else { // 漫游
            if (skyCar.state != 3) {
              skyCar.state = 3
              skyCar.setPopupColor()
            }
          }

        }

        // 处理变化
        {
          skyCar.history.old = Object.assign({}, skyCar.history.new)
          skyCar.history.new = {
            time: new Date() * 1,
            position: e.position || null,
            location: e.location || null,
            loading: e.ohtStatus_Loading || null,
            quhuoda: e.ohtStatus_Quhuoda || null,
            roaming: e.ohtStatus_Roaming || null,
            idle: e.ohtStatus_Idle || null,
            isHaveFoup: e.ohtStatus_IsHaveFoup || null,
            therfidFoup: e.therfidFoup || null,
            moveEnable: e.ohtStatus_MoveEnable || null,
            fanghuoxing: e.ohtStatus_Fanghuoxing || null,
            fanghuoda: e.ohtStatus_Fanghuoda || null,
            unLoading: e.ohtStatus_UnLoading || null,
            ohtID: e.ohtID || null
          }

          if (skyCar.history.old?.position != skyCar.history.new?.position) {
            // 位置动画
            const time = skyCar.history.new.time - skyCar.history.old.time
            skyCar.coordinate = skyCar.history.new.position
            skyCar.setPosition(time, onComplete)
          } else {
            onComplete()
          }

          function onComplete() {
            // 处理状态
            if ( // 装载开始
              (skyCar.history.old.quhuoda == '0' && skyCar.history.new.quhuoda == '1')
            ) {
              console.log('装载开始')
              // 找离天车最近的货架
              let distance = 0
              let shelf = null
              STATE.sceneList.shelves2Arr.forEach(e => {
                const dis = Math.sqrt((e.position[0] - skyCar.skyCarMesh.position.x) ** 2 + (e.position[2] - skyCar.skyCarMesh.position.z) ** 2)
                if (distance === 0) {
                  distance = dis
                  shelf = e
                }
                else if (dis < distance) {
                  distance = dis
                  shelf = e
                }
              })
              STATE.sceneList.shelves4Arr.forEach(e => {
                const dis = Math.sqrt((e.position[0] - skyCar.skyCarMesh.position.x) ** 2 + (e.position[2] - skyCar.skyCarMesh.position.z) ** 2)
                if (distance === 0) {
                  distance = dis
                  shelf = e
                }
                else if (dis < distance) {
                  distance = dis
                  shelf = e
                }
              })

              // 查找最近的货架最近的卡匣，有就搬，没有就生成
              const cb = () => {
                const kaxia = STATE.kaxiaList.children.find(e => e.userData.id === skyCar.history.new.therfidFoup)

                if (kaxia) {
                  kaxia.parent.remove(kaxia)
                  kaxia.position.set(0, -0.25, 0)
                  kaxia.scale.set(1.5, 1.5, 1.5)
                  kaxia.rotation.y = -Math.PI / 2
                  const group = skyCar.skyCarMesh.children.find(e => e.name === 'tianche02')
                  if (group) {
                    group.add(kaxia)
                    skyCar.catch = kaxia
                  }
                  kaxia.area = ''
                  kaxia.shelf = ''
                  kaxia.shelfIndex = -1
                } else {
                  const newKaxia = STATE.sceneList.FOUP.clone()
                  newKaxia.userData.area = ''
                  newKaxia.userData.shelf = ''
                  newKaxia.userData.shelfIndex = -1
                  newKaxia.userData.type = 'kaxia'
                  newKaxia.scale.set(1.5, 1.5, 1.5)
                  newKaxia.position.set(0, -0.25, 0)
                  newKaxia.rotation.y = -Math.PI / 2
                  newKaxia.visible = true
                  newKaxia.traverse(e2 => {
                    if (e2.isMesh) {
                      e2.userData.id = newKaxia.userData.id
                      e2.userData.area = newKaxia.userData.area
                      e2.userData.shelf = newKaxia.userData.shelf
                      e2.userData.shelfIndex = newKaxia.userData.shelfIndex
                      e2.userData.type = newKaxia.userData.type
                      CACHE.container.clickObjects.push(e2)
                    }
                  })
                  const group = skyCar.skyCarMesh.children.find(e => e.name === 'tianche02')
                  if (group) {
                    group.add(newKaxia)
                    skyCar.catch = newKaxia
                  }
                }
              }
              skyCar.down(cb)


            } else if ( // 装载结束
              (skyCar.history.old.idle == '0' && skyCar.history.new.idle == '1') &&
              (skyCar.history.old.isHaveFoup == '0' && skyCar.history.new.isHaveFoup == '1') &&
              (skyCar.history.old.loading == '1' && skyCar.history.new.loading == '0') &&
              (skyCar.history.old.moveEnable == '0' && skyCar.history.new.moveEnable == '1') &&
              (skyCar.history.old.quhuoda == '1' && skyCar.history.new.quhuoda == '0')
            ) {
              console.log('装载结束')
              skyCar.up()

            } else if ( // 卸货开始
              (skyCar.history.old.fanghuoda == '0' && skyCar.history.new.fanghuoda == '1')
            ) {
              console.log('卸货开始')
              // 找离天车最近的货架
              let distance = 0
              let shelf = null
              STATE.sceneList.shelves2Arr.forEach(e => {
                const dis = Math.sqrt((e.position[0] - skyCar.skyCarMesh.position.x) ** 2 + (e.position[2] - skyCar.skyCarMesh.position.z) ** 2)
                if (distance === 0) {
                  distance = dis
                  shelf = e
                } else if (dis < distance) {
                  distance = dis
                  shelf = e
                }
              })
              STATE.sceneList.shelves4Arr.forEach(e => {
                const dis = Math.sqrt((e.position[0] - skyCar.skyCarMesh.position.x) ** 2 + (e.position[2] - skyCar.skyCarMesh.position.z) ** 2)
                if (distance === 0) {
                  distance = dis
                  shelf = e
                } else if (dis < distance) {
                  distance = dis
                  shelf = e
                }
              })

              const cb = () => {
                if (skyCar.catch) {

                  skyCar.catch.userData.area = shelf.area
                  skyCar.catch.userData.shelf = shelf.shelf
                  skyCar.catch.userData.type = 'kaxia'
                  skyCar.catch.scale.set(15, 15, 15)
                  skyCar.catch.rotation.y = shelf.rotate * Math.PI / 180 - Math.PI / 2
                  skyCar.catch.visible = true

                  if (shelf.fields.length === 4) {
                    if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(shelf.area)) {
                      let index = 0
                      if (skyCar.catch.position.x < shelf.position[0] - 7.3 + 0 * 4.9) index = 0
                      else if (skyCar.catch.position.x < shelf.position[0] - 7.3 + 1 * 4.9) index = 1
                      else if (skyCar.catch.position.x < shelf.position[0] - 7.3 + 2 * 4.9) index = 2
                      else if (skyCar.catch.position.x < shelf.position[0] - 7.3 + 3 * 4.9) index = 3

                      skyCar.catch.userData.shelfIndex = index
                      skyCar.catch.position.set(shelf.position[0] - 7.3 + index * 4.9, 27, shelf.position[2])

                    } else {
                      let index = 0
                      if (skyCar.catch.position.z < shelf.position[2] - 7.3 + 0 * 4.9) index = 0
                      else if (skyCar.catch.position.z < shelf.position[2] - 7.3 + 1 * 4.9) index = 1
                      else if (skyCar.catch.position.z < shelf.position[2] - 7.3 + 2 * 4.9) index = 2
                      else if (skyCar.catch.position.z < shelf.position[2] - 7.3 + 3 * 4.9) index = 3

                      skyCar.catch.userData.shelfIndex = index
                      skyCar.catch.position.set(shelf.position[0], 27, shelf.position[2] - 7.3 + index * 4.9)
                    }

                  } else if (shelf.fields.length === 2) {
                    if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(shelf.area)) {
                      let index = 0
                      if (skyCar.catch.position.x < shelf.position[0] - 2.5 + 0 * 4.9) index = 0
                      else if (skyCar.catch.position.x < shelf.position[0] - 2.5 + 1 * 4.9) index = 1

                      skyCar.catch.userData.shelfIndex = index
                      skyCar.catch.position.set(shelf.position[0] - 2.5 + index * 4.9, 27, shelf.position[2])

                    } else {
                      let index = 0
                      if (skyCar.catch.position.z < shelf.position[2] - 2.5 + 0 * 4.9) index = 0
                      else if (skyCar.catch.position.z < shelf.position[2] - 2.5 + 1 * 4.9) index = 1

                      skyCar.catch.userData.shelfIndex = index
                      skyCar.catch.position.set(shelf.position[0], 27, shelf.position[2] - 2.5 + index * 4.9)
                    }
                  }

                  skyCar.catch.traverse(e2 => {
                    if (e2.isMesh) {
                      e2.userData.id = skyCar.catch.userData.id
                      e2.userData.area = skyCar.catch.userData.area
                      e2.userData.shelf = skyCar.catch.userData.shelf
                      e2.userData.shelfIndex = skyCar.catch.userData.shelfIndex
                      e2.userData.type = skyCar.catch.userData.type
                      CACHE.container.clickObjects.push(e2)
                    }
                  })

                  skyCar.catch.parent.remove(skyCar.catch)
                  STATE.kaxiaList.add(skyCar.catch)
                  skyCar.catch = null
                }
              }
              skyCar.down(cb)

            } else if ( // 卸货结束
              (skyCar.history.old.fanghuoda == '1' && skyCar.history.new.fanghuoda == '0') &&
              (skyCar.history.old.idle == '0' && skyCar.history.new.idle == '1') &&
              (skyCar.history.old.isHaveFoup == '1' && skyCar.history.new.isHaveFoup == '0') &&
              (skyCar.history.old.moveEnable == '0' && skyCar.history.new.moveEnable == '1') &&
              (skyCar.history.old.unLoading == '1' && skyCar.history.new.unLoading == '0')
            ) {
              console.log('卸货结束')
              skyCar.up()
            }
          }
        }

      } else {
        const newCar = new SkyCar({ id: e.ohtID, coordinate: e.position })
        STATE.sceneList.skyCarList.push(newCar)
        newCar.history.new = {
          time: new Date() * 1,
          position: e.position || null,
          location: e.location || null,
          loading: e.ohtStatus_Loading || null,
          quhuoda: e.ohtStatus_Quhuoda || null,
          roaming: e.ohtStatus_Roaming || null,
          idle: e.ohtStatus_Idle || null,
          isHaveFoup: e.ohtStatus_IsHaveFoup || null,
          therfidFoup: e.therfidFoup || null,
          moveEnable: e.ohtStatus_MoveEnable || null,
          fanghuoxing: e.ohtStatus_Fanghuoxing || null,
          fanghuoda: e.ohtStatus_Fanghuoda || null,
          unLoading: e.ohtStatus_UnLoading || null,
          ohtID: e.ohtID || null
        }

        newCar.history.old = Object.assign({}, newCar.history.new)
        newCar.coordinate = e.position
        newCar.setPosition(0)
      }
    })
  }

  // // 处理报警
  // if (wsMessage?.AlarmInfo?.length) {
  //   if (STATE.alarmList) {
  //     wsMessage.AlarmInfo.forEach(e => {
  //       if (e.alarmType === 'set') {
  //         STATE.alarmList.value.unshift(e)
  //       } else if (e.alarmType === 'cancel') {
  //         const itemIndex = STATE.alarmList.value.findIndex(e2 => e2.alarmId === e.alarmId)
  //         if (itemIndex >= 0) {
  //           STATE.alarmList.value.splice(itemIndex, 1)
  //         }
  //       }
  //     })
  //   }
  // }

  // 处理轨道
  if (wsMessage?.BayStateInfo?.length) {
    wsMessage.BayStateInfo.forEach(e => {
      const item = DATA.pointCoordinateMap.find(e2 => e2.startPoint == e.point && e2.endPoint == e.ntPoint)
      if (item) {
        item.startCoordinate = e.startPosition
        item.endCoordinate = e.endPosition
        item.status = e.status

        // 锁定变透明
        if (e.status === '0') {
          const mesh = STATE.sceneList.lineList.find(e2 => e2.name == (e.point + '-' + e.ntPoint))
          if (mesh) {
            mesh.material.color = new Bol3D.Color(0.3, 0.3, 0.3)
          }
        }
      }
    })
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
  catch = null             // 当前抓取的卡匣

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

    popup.element.addEventListener('dblclick', (() => {
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

    OhtFindCmdId(this.id).then(res => {

    })

    const name = 'click_popup_天车_' + this.id
    const items = [
      { name: '卡匣ID', value: this.history.new.therfidFoup || '--' },
      { name: 'COMMAND ID', value: '--' },
      { name: 'USER ID', value: '--' },
      { name: '起点', value: '--' },
      { name: '终点', value: '--' },
      { name: '优先级', value: '--' },
      { name: '当前状态', value: DATA.skyCarStateColorMap.find(e => e.id === this.state)?.name || '--' },
      { name: 'ALARM 情况', value: this.history.new.ohtStatus_ErrSet === '1' ? '异常' : '正常' },
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

  setPosition(time = 1000, cb) {
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
        }, cb ? time / 4 : time)
        this.animation.start()
        this.animation.onComplete(() => {
          cb && cb()
        })
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
  down(cb) {
    const this_ = this
    this.actions.shen.enabled = true
    this.actions.suo.enabled = false
    this.actions.fang.enabled = false
    this.actions.fang.paused = false
    this.actions.shou.enabled = false

    this.actions.shen.clampWhenFinished = false
    this.actions.shen.reset().play()


    this.mixer.addEventListener('finished', function finished_shen(e) {
      if (e.action.name === 'shen') {
        this_.actions.shen.enabled = false
        this_.actions.fang.enabled = true
        this_.actions.fang.time = 0
        this_.actions.fang.reset().play()

        let renderFlag = true
        render()
        function render() {
          if (renderFlag) {
            requestAnimationFrame(render)
            if (this_.actions.fang.time > 0.5) {
              this_.actions.fang.time = 0.5
              this_.actions.fang.paused = true
              this_.mixer.removeEventListener('finished', finished_shen)
              renderFlag = false
              cb && cb()
            }
          }
        }
      }
    })
  }

  up(cb) {
    const this_ = this
    this.actions.shou.enabled = true
    this.actions.fang.enabled = false
    this.actions.shen.enabled = false
    this.actions.suo.enabled = false

    this.actions.shou.paused = false
    this.actions.shou.reset()
    this.actions.shou.time = 2.7
    this.actions.shou.play()

    this.mixer.addEventListener('finished', function finished_suo(e) {
      if (e.action.name === 'shou') {

        this_.actions.shou.enabled = false
        this_.actions.suo.enabled = true
        this_.actions.suo.reset().play()
        this_.actions.kakoushen.reset().play()
        this_.actions.dangbanshen.reset().play()
      } else if (e.action.name === 'suo') {
        this_.mixer.removeEventListener('finished', finished_suo)
        cb && cb()
      }
    })
  }
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
  } else if (type === '卡匣') {
    const kaxia = STATE.sceneList.kaxiaList.children.find(e => e.userData.id === id)
    if (kaxia) obj = kaxia
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
        x: Math.abs(camera.position.x - objWorldPosition.x) > 100 ? camera.position.x - (camera.position.x - objWorldPosition.x) / 1.2 : camera.position.x,
        y: Math.abs(camera.position.y - objWorldPosition.y) > 100 ? 100 : camera.position.y,
        z: Math.abs(camera.position.z - objWorldPosition.z) > 100 ? camera.position.z - (camera.position.z - objWorldPosition.z) / 1.2 : camera.position.z
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
        })
      })

      popup.scale.set(0.08, 0.08, 0.08)
      popup.name = 'popup_' + obj.name
      popup.position.set(objWorldPosition.x, objWorldPosition.y + 30, objWorldPosition.z)
      CACHE.container.scene.add(popup)
      STATE.currentPopup = popup


      const eventFunc = () => {
        STATE.searchAnimateDesdory = true
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

      let title = '卡匣'
      let height = '45vh'
      let className = 'popup3d_kaxia'
      let items = [
        { name: '卡匣 ID', value: '--' },
        { name: 'Command ID', value: '--' },
        { name: 'User ID', value: '--' },
        { name: '起点', value: '--' },
        { name: '终点', value: '--' },
        { name: '优先级', value: '--' },
        { name: '当前位置', value: '--' },
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
        })
      })

      popup.scale.set(0.08, 0.08, 0.08)
      popup.name = 'popup_' + obj.name
      popup.position.set(objWorldPosition.x, objWorldPosition.y + 5, objWorldPosition.z)
      CACHE.container.scene.add(popup)
      STATE.currentPopup = popup

      new TWEEN.Tween(camera.position)
        .to({
          x: Math.abs(camera.position.x - objWorldPosition.x) > 70 ? camera.position.x / 3 : camera.position.x,
          y: Math.abs(camera.position.y - objWorldPosition.y) > 70 ? camera.position.y / 3 : camera.position.y,
          z: Math.abs(camera.position.z - objWorldPosition.z) > 70 ? camera.position.z / 3 : camera.position.z
        }, 800)
        .start()
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.updateProjectionMatrix()
        })
      new TWEEN.Tween(contorl.target)
        .to({
          x: objWorldPosition.x,
          y: objWorldPosition.y + 5,
          z: objWorldPosition.z
        }, 800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()

      const eventFunc = () => {
        STATE.searchAnimateDesdory = true
        CACHE.container.orbitControls.removeEventListener('start', eventFunc)
      }

      CACHE.container.orbitControls.addEventListener('start', eventFunc)
      animate = () => {
        if (isCameraMoveOver) {
          contorl.target.set(objWorldPosition.x, objWorldPosition.y + 5, objWorldPosition.z)
        }
      }

      // 接口
      GetCarrierInfo().then(res => {
        if (res?.data?.length) {
          const data = res.data.find(e => e.carrierId == id)
          if (data) {
            popup.parent.remove(popup)
            STATE.currentPopup.element.remove()

            let items = [
              { name: '卡匣 ID', value: data.carrierId || '--' },
              { name: 'Command ID', value: '--' },
              { name: 'User ID', value: '--' },
              { name: '起点', value: '--' },
              { name: '终点', value: '--' },
              { name: '优先级', value: '--' },
              { name: '当前位置', value: data.locationId || '--' },
              { name: '当前状态', value: data.carrierType || '--' }
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
        }
      })
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
function clickInstance(obj, index) {


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
    items = [{ name: 'shelf ID', value: STATE.sceneList.shelves2Arr[index].area + '_' + STATE.sceneList.shelves2Arr[index].fields[0] + '_' + STATE.sceneList.shelves2Arr[index].fields[1] }]
    height = '16vh'
    className = 'popup3d_shalves'

  } else if (obj.name.includes('shalves4')) {
    title = 'OHB'
    items = [{ name: 'shelf ID', value: STATE.sceneList.shelves4Arr[index].area + '_' + STATE.sceneList.shelves4Arr[index].fields[0] + '_' + STATE.sceneList.shelves4Arr[index].fields[3] }]
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
  popup.position.set(transformInfo.position.x, transformInfo.position.y + 15, transformInfo.position.z)
  CACHE.container.scene.add(popup)
  STATE.currentPopup = popup

  let desdory = false
  const camera = CACHE.container.orbitCamera
  const contorl = CACHE.container.orbitControls
  new TWEEN.Tween(camera.position)
    .to({
      x: Math.abs(camera.position.x - transformInfo.position.x) > 100 ? camera.position.x - (camera.position.x - objWorldPosition.x) / 1.2 : camera.position.x,
      y: Math.abs(camera.position.y - transformInfo.position.y) > 100 ? 100 : camera.position.y,
      z: Math.abs(camera.position.z - transformInfo.position.z) > 100 ? camera.position.z - (camera.position.z - objWorldPosition.z) / 1.2 : camera.position.z
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

      // 加一些模拟货物
      item.fields.forEach((e, index) => {
        const kaxia = Math.random() > 0.95 ? Math.random() > 0.5 ? STATE.sceneList.FOSB.clone() : STATE.sceneList.FOUP.clone() : null
        if (kaxia) {
          kaxia.userData.id = ['HX3Fdemo00000067', 'HX3Fdemo00000023', 'HX3Fdemo00000020', '845 8334 6466 5D66 F', 'HX3Fdemo00000202'][Math.floor(Math.random() * 5)]
          kaxia.userData.area = area
          kaxia.userData.shelf = shelf
          kaxia.userData.shelfIndex = e
          kaxia.userData.type = 'kaxia'
          kaxia.scale.set(15, 15, 15)
          kaxia.rotation.y = item.rotate * Math.PI / 180 - Math.PI / 2
          kaxia.visible = true
          kaxia.traverse(e2 => {
            if (e2.isMesh) {
              e2.userData.id = kaxia.userData.id
              e2.userData.area = kaxia.userData.area
              e2.userData.shelf = kaxia.userData.shelf
              e2.userData.shelfIndex = kaxia.userData.shelfIndex
              e2.userData.type = kaxia.userData.type
              CACHE.container.clickObjects.push(e2)
            }
          })
          if (item.fields.length === 4) {
            if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(area)) {
              kaxia.position.set(item.position[0] - 7.3 + index * 4.9, 27, item.position[2])
            } else {
              kaxia.position.set(item.position[0], 27, item.position[2] - 7.3 + index * 4.9)
            }
          } else if (item.fields.length === 2) {
            if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(area)) {
              kaxia.position.set(item.position[0] - 2.5 + index * 4.9, 27, item.position[2])
            } else {
              kaxia.position.set(item.position[0], 27, item.position[2] - 2.5 + index * 4.9)
            }
          }
          STATE.kaxiaList.add(kaxia)


          if (!STATE.shelvesList[shelf]) {
            STATE.shelvesList[shelf] = {}
          }

          STATE.shelvesList[shelf][e] = {
            mesh: kaxia,
            position: [kaxia.position.x, kaxia.position.y, kaxia.position.z],
            rotateY: kaxia.rotation.y
          }
        }
      })
      model.visible = true
      model.position.set(...item.position)
      model.rotation.y = item.rotate * Math.PI / 180
      model.userData.fields = item.fields
      model.userData.name = shelf
      model.userData.area = area
      STATE.sceneList.shelves[shelf] = model
      CACHE.container.scene.add(model)


      CACHE.container.scene.add(STATE.kaxiaList)
      STATE.sceneList.kaxiaList = STATE.kaxiaList
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
