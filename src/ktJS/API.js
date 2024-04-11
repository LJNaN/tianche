import { ref } from 'vue'
import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import { UTIL } from './UTIL.js'
import TU from './js/threeUtils.js'
import { GLOBAL } from '@/GLOBAL.js'
import * as TWEEN from '@tweenjs/tween.js'
import { GetCarrierInfo, CarrierFindCmdId, GetRealTimeEqpState, GetBayStateInfo } from '@/axios/api.js'
import mockData3 from './js/mock3'
import mockData4 from './js/mock4'
import mockData5 from './js/mock5'
import mockData6 from './js/mock6'
import mockData7 from './js/mock7'
import SkyCar from './SkyCar.js'
import bus from '@/utils/mitt.js'


// 获取数据  有data 模拟/回溯 无data 线上
class MainBus {
  isReplayMode = ref(false)// 时间回溯模式
  replayPaused = ref(true) // 时间回溯暂停
  replayTimes = ref(1) // 时间回溯倍率
  replayIndex = ref(0) // 时间回溯当前索引
  replaySlider = ref(0) // 回溯进度条的千分比
  currentReplayData = ref([]) // 当前时间回溯数据
  replayTimer = null
  ws = null

  constructor(mockData) {
    if (mockData) {
      this.run(mockData)

    } else {
      this.run()
    }
  }

  run(replayData) {
    this.closeLink()

    if (replayData) {
      this.currentReplayData.value = replayData
    } else {
      this.currentReplayData.value = []
    }

    if (!this.currentReplayData.value.length) {
      // 真实数据
      // ======================================
      const api = window.wsAPI
      const ws = new WebSocket(api)
      this.ws = ws
      this.ws.onmessage = (info) => {
        const wsMessage = JSON.parse(info.data)
        if (wsMessage?.VehicleInfo?.length) {
          wsMessage?.VehicleInfo.forEach(e => {
            if (!e?.ohtID) return
            const skyCar = STATE.sceneList.skyCarList.find(car => car.id === e.ohtID)

            if (skyCar) {
              skyCar.handleSkyCar(e)

            } else {
              const newCar = new SkyCar({ id: e.ohtID, coordinate: e.position })
              newCar.handleSkyCar(e)
            }
          })
        }

        // 更新报警
        if (wsMessage?.AlarmInfo?.length) {
          if (STATE.alarmList) {
            const list = wsMessage.AlarmInfo.slice(0, 20)
            list.forEach(e => {
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
    } else {
      // 模拟数据/回溯数据
      // =======================================
      const replayTimer = setInterval(() => {
        if (this.replayIndex.value >= this.currentReplayData.value.length - 1) {
          this.replayPaused.value = true
          this.pause()

        } else {
          this.currentReplayData.value[this.replayIndex.value].VehicleInfo.forEach(e => {
            if (!e?.ohtID) return
            const skyCar = STATE.sceneList.skyCarList.find(car => car.id === e.ohtID)

            if (skyCar) {
              skyCar.handleSkyCar(e)

            } else {
              const newCar = new SkyCar({ id: e.ohtID, coordinate: e.position })
              newCar.handleSkyCar(e)
            }
          })
          this.replayIndex.value++
          this.replaySlider.value = Math.floor(this.replayIndex.value / this.currentReplayData.value.length * 1000)
        }
      }, 333 / this.replayTimes.value)
      this.replayTimer = replayTimer
    }
  }

  pause() {
    if (this.replayTimer) {
      clearInterval(this.replayTimer)
      this.replayTimer = null
    }
    this.replayPaused.value = true

    STATE.sceneList.skyCarList.forEach(e => {
      e.replayRun = false
    })
  }

  reset() {
    while (STATE.sceneList.skyCarList.length) {
      STATE.sceneList.skyCarList[0].dispose()
    }
  }

  closeLink() {
    this.currentReplayData.value = []
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.replayTimer) {
      clearInterval(this.replayTimer)
      this.replayTimer = null
    }
  }
}

// 重新加载
function setReload() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if ((CACHE.reloadTime + 60 * 1000 * 2) < new Date() * 1) {
        STATE.currentPopup = null
        STATE.searchAnimateDestroy = true
        STATE.sceneList.lineList.forEach(e => {
          e.material.uniforms.next.value = 0
          e.material.uniforms.pass.value = 0
          e.material.uniforms.currentFocusLineStartPoint.value = -1
          e.material.uniforms.currentFocusLineEndPoint.value = -1
          e.material.uniforms.isEndLine.value = 0
          e.material.uniforms.endLineProgress.value = 0.0
          e.material.uniforms.isStartLine.value = 0
          e.material.uniforms.startLineProgress.value = 0.0
        })

        STATE.mainBus.closeLink()
        STATE.mainBus.reset()
        STATE.mainBus.run()
      }

    } else {
      CACHE.reloadTime = new Date() * 1
    }
  })


  setInterval(() => {
    const hh = new Date().getHours()
    const mm = new Date().getMinutes()
    if (hh % 2 === 0 && mm === 0) {
      STATE.mainBus.closeLink()
      STATE.mainBus.reset()
      STATE.mainBus.run()
    }
  }, 1000 * 60)
}

// afterOnload
function afterOnload(evt) {
  // 开灯开阴影
  CACHE.container.directionLights[0].visible = true
  container.orbitCamera.position.set(STATE.initialState.position.x, STATE.initialState.position.y, STATE.initialState.position.z)
  container.orbitControls.target.set(STATE.initialState.target.x, STATE.initialState.target.y, STATE.initialState.target.z)

  // 天车不知道为什么放大不了，手动放大
  STATE.sceneList.tianche.scale.set(10, 10, 10)
  STATE.sceneList.tianche.visible = false
  // OLUS放大
  STATE.sceneList.OLUS.scale.set(30, 30, 30)

  STATE.sceneList.WTSTK01.scale.set(7, 7, 7)

  // 默认的设备隐藏
  const hiddenDevices = ['2LPjitai(W01)', 'huojia4', 'huojia2', 'OLUS', 'WWATA03V', 'WHWSA01', 'WMACB03', 'WSSP008', 'WTSTK01', 'WWATA02V', '2LPjitai(W01)', 'WBS002', 'WS0RA01(I01)', 'WS0RA01(I02)', 'WS0RA01', 'FOSB', 'FOUP']
  hiddenDevices.forEach(e => {
    STATE.sceneList[e].visible = false
  })

  // 主场景处理
  setTimeout(() => [
    STATE.sceneList.guidao.traverse(e => {
      if (e.isMesh && e.name === 'di') {
        e.material = new Bol3D.MeshLambertMaterial({ color: '#717880' })

      } else if (e.name.includes('X-')) { // 隐藏红线
        e.visible = false
      }
    })
  ], 0)

  // WBS002 处理
  STATE.sceneList.WBS002.children[1].position.x = 0
  STATE.sceneList.WBS002.children[1].position.z = 0

  // editor 中 outline 处理
  CACHE.container.outlinePass.hiddenEdgeColor = new Bol3D.Color(0.95, 0.41, 0.16)
  CACHE.container.outlinePass.visibleEdgeColor = new Bol3D.Color(0.95, 0.41, 0.16)
  CACHE.container.outlinePass.pulsePeriod = 1

  TU.init(container, Bol3D)
  API.initKaxia()
  UTIL.getAnimationList()
  API.initLine()
  API.initDeviceByMap()
  API.initShelves()
  STATE.mainBus = new MainBus()
  
  


  // 货架实例化
  const shalves2 = []
  const shalves4 = []
  for (let key in STATE.sceneList.shelves) {
    if (STATE.sceneList.shelves[key].name === 'huojia4') {
      shalves4.push(STATE.sceneList.shelves[key])

    } else if (STATE.sceneList.shelves[key].name === 'huojia2') {
      shalves2.push(STATE.sceneList.shelves[key])
    }
  }

  UTIL.instantiationGroupInfo(shalves4, 'shalves4', CACHE.container)
  UTIL.instantiationGroupInfo(shalves2, 'shalves2', CACHE.container)

  // remove unused obj3d
  for (const i in CACHE.removed) {
    const removed = CACHE.removed[i];
    if (removed.parent) {
      removed.parent.remove(removed);
    }
  }

  // instance
  for (const key in CACHE.instanceMeshInfo) {
    const { geometry, material } = CACHE.instanceMeshInfo[key];
    const count = CACHE.instanceTransformInfo[key].length;
    const instanceMesh = new Bol3D.InstancedMesh(geometry, material, count);
    const matrix = new Bol3D.Matrix4();
    for (let i = 0; i < count; i++) {
      const { position, quaternion, scale } = CACHE.instanceTransformInfo[key][i];
      matrix.compose(position, quaternion, scale);
      instanceMesh.setMatrixAt(i, matrix);
      instanceMesh.name = key;
      instanceMesh.castShadow = true
    }
    if (key != '2portOhb' && key != '4portOhb') {
      CACHE.container.clickObjects.push(instanceMesh)
    }
    evt.scene.add(instanceMesh);
  }
}


// 加载并处理线段 计算所有线段的中心点及长度 创建shader
function initLine() {
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
      const reverseList = ['8-6','92-11', '11-12', '114-37', '72-66', '66-67', '57-58', '58-59', '68-69', '69-70', '70-64', '63-65', '65-71', '75-76', '77-78', '79-80', '13-21', '21-25', '25-29', '30-31', '31-32', '31-34', '21-22', '16-17', '17-23', '27-35', '35-36', '35-38', '23-24', '56-91', '90-95', '55-73', '74-72', '71-53', '53-52', '53-54', '36-33', '32-39', '39-40', '40-43', '44-47', '47-78', '48-49', '110-106', '50-119', '118-115', '41-42', '45-46', '49-50', '2-3', '6-7', '10-11', '1-4', '5-8', '9-10', '81-82', '82-83', '86-89', '15-16', '19-97', '100-101', '104-20', '98-105', '105-109', '109-113', '113-116', '105-106', '102-107', '111-117', '107-111', '107-108', '84-87', '87-88', '88-85', '93-94', '73-75', '43-41', '42-44', '47-45', '46-48', '117-120', '47-48', '53-54', '80-74', '12-13','97-98','113-114']
      if (reverseList.includes(e.name.split('X-')[1])) {
        arr.reverse()
      }

      STATE.sceneList.linePosition[e.name.split('X-')[1]] = arr
    }
  })



  STATE.sceneList.guidao.traverse(child => {
    if (child.isMesh && child.name.includes('-') && !child.name.includes('X-')) {

      CACHE.container.clickObjects.push(child)
      child.userData.id = child.name
      child.userData.type = '轨道'
      const line = STATE.sceneList.guidao.children.find(e => e.name === 'X-' + child.name)
      if (line) {
        child.userData.lineLong = line.userData.long
      }
      if (!STATE.sceneList.lineList) {
        STATE.sceneList.lineList = []
      }
      STATE.sceneList.lineList.push(child)
    }
  })


  // shader
  // 顶点着色器代码
  const vertexShader = `
    #include <logdepthbuf_pars_vertex>
    #include <common>

    uniform float time;
    varying vec2 vUv; // 传递纹理坐标给片元着色器
    varying vec2 vPosition;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      
      #include <logdepthbuf_vertex>
    }
  `

  // 片元着色器代码
  const fragmentShader = `
    #include <logdepthbuf_pars_fragment>
    #include <common>
    
    uniform int startPoint;
    uniform int endPoint;
    uniform int currentFocusLineStartPoint;
    uniform int currentFocusLineEndPoint;
    uniform int pass;
    uniform int next;
    uniform float progress;
    uniform int isEndLine;
    uniform float endLineProgress;
    uniform int isStartLine;
    uniform float startLineProgress;
    uniform float time;
    uniform float lineLong;
    uniform int hasPosPath;


    varying vec2 vUv; // 接收从顶点着色器传递过来的纹理坐标
    varying vec2 vPosition;

    void main() {
      
      vec4 color = vec4(0.7,0.7,0.7,1.);

      float threshold = 10.; // 控制留白的间距
      float blockWidth = 0.5; // 控制留白的宽度
      float flowSpeed = 5.0; // 控制流动速度
      float flowOffset = vUv.x - time * flowSpeed / lineLong; // 控制流动效果
      flowOffset = mod(flowOffset, threshold / lineLong); // 将偏移量限制在阈值范围内
      float blockMask = 1.0 - step(flowOffset, blockWidth/ lineLong);


      
      if (hasPosPath == 0) {
        color = vec4(0.7,0.7,0.7,1.);

      } else if (next == 1) {
        color = vec4(0.45,0.97,0.24,0.6);
        color.a = blockMask;

      } else if(pass == 1) {
        color = vec4(0.04,0.29,0.96,0.6);
        color.a = blockMask;
        
      } else if (currentFocusLineStartPoint == startPoint && currentFocusLineEndPoint == endPoint) {
        if(isEndLine == 1) {
          if(vUv.x > endLineProgress) {
            color = vec4(0.7,0.7,0.7,1.);
            
          } else if (vUv.x < progress) {
            color = vec4(0.04,0.29,0.96,0.6);
            color.a = blockMask;
            
          } else {
            color = vec4(0.45,0.97,0.24,0.6);
            color.a = blockMask;
          }
          
        } else if(isStartLine == 1) {
          if(vUv.x < startLineProgress) {
            color = vec4(0.7,0.7,0.7,1.);

          } else if (vUv.x < progress) {
            color = vec4(0.04,0.29,0.96,0.6);
            color.a = blockMask;

          } else {
            color = vec4(0.45,0.97,0.24,0.6);
            color.a = blockMask;
          }

        } else {
          if(vUv.x > progress) {
            color = vec4(0.45,0.97,0.24,0.6);
            color.a = blockMask;

          } else {
            color = vec4(0.04,0.29,0.96,0.6);
            color.a = blockMask;
          }
        }

      } else if (isEndLine == 1) {
        if(vUv.x > endLineProgress) {
          color = vec4(0.7,0.7,0.7,1.); 

        } else {
          color = vec4(0.45,0.97,0.24,0.6);
          color.a = blockMask;
        }

      } else if (isStartLine == 1) {
        if(vUv.x < startLineProgress) {
          color = vec4(0.7,0.7,0.7,1.);

        } else {
          color = vec4(0.04,0.29,0.96,0.6);
          color.a = blockMask;
        }
      }

      
      

      gl_FragColor = color; // 应用纹理颜色到片元
      #include <logdepthbuf_fragment>
    }
  `

  // 创建 ShaderMaterial，并传入纹理
  const material = new Bol3D.ShaderMaterial({
    uniforms: {
      startPoint: { value: 0 },
      endPoint: { value: 0 },
      progress: { value: 1.0 },
      pass: { value: 0 },
      next: { value: 0 },
      currentFocusLineStartPoint: { value: -1 },
      currentFocusLineEndPoint: { value: -1 },
      isEndLine: { value: 0 },
      endLineProgress: { value: 0.0 },
      isStartLine: { value: 0 },
      startLineProgress: { value: 0.0 },
      time: { value: 0.0 },
      lineLong: { value: 1.0 },
      hasPosPath: { value: 0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true
  })
  material.needsUpdate = true


  STATE.sceneList.lineList.forEach(e => {
    e.material = material.clone()
    e.material.uniforms.startPoint.value = e.name.split('-')[0]
    e.material.uniforms.endPoint.value = e.name.split('-')[1]
    e.material.uniforms.lineLong.value = e.userData.lineLong
  })
}


// 加载机台
async function initDeviceByMap() {
  if (GLOBAL.isEditorMode.value) {
    CACHE.container.clickObjects = []
    for (let key in DATA.deviceMap) {
      const map = DATA.deviceTypeMap.find(e => e.label === key)
      if (!map || !map.modelName) continue

      for (let key2 in DATA.deviceMap[key]) {
        const model = STATE.sceneList[map.modelName].clone()
        setTimeout(() => {
          model.visible = DATA.deviceMap[key][key2].visible
        }, 0)
        model.position.set(...DATA.deviceMap[key][key2].position)
        model.rotation.y = DATA.deviceMap[key][key2].rotate * Math.PI / 180
        model.userData.type = '机台'
        model.userData.deviceType = DATA.deviceMap[key][key2].type
        model.userData.modelType = key
        model.userData.bay = DATA.deviceMap[key][key2].bay
        model.userData.id = key2
        CACHE.container.scene.add(model)

        model.traverse(e => {
          e.visible = true
          if (e.isMesh) {
            e.userData.type = '机台'
            e.userData.deviceType = DATA.deviceMap[key][key2].type
            e.userData.modelType = key
            e.userData.bay = DATA.deviceMap[key][key2].bay
            e.userData.id = key2
            CACHE.container.clickObjects.push(e)
          }
        })
      }
    }

  } else {
    const deviceType = []
    for (let key in DATA.deviceMap) {
      deviceType.push(key)
    }
    const deviceObject = {}
    deviceType.forEach(e => {
      deviceObject[e] = []
    })

    for (let key in DATA.deviceMap) {
      const map = DATA.deviceTypeMap.find(e => e.label === key)
      if (!map || !map.modelName) continue
      for (let key2 in DATA.deviceMap[key]) {
        const model = STATE.sceneList[map.modelName].clone()

        if (DATA.deviceMap[key][key2].visible) {
          model.visible = true
          model.position.set(...DATA.deviceMap[key][key2].position)
          model.rotation.y = DATA.deviceMap[key][key2].rotate * Math.PI / 180
          model.userData.id = DATA.deviceMap[key][key2].id
          model.userData.type = '机台'
          model.userData.enabled = ''
          model.userData.deviceType = DATA.deviceMap[key][key2].type
          model.userData.modelType = key
          model.userData.bay = DATA.deviceMap[key][key2].bay
          deviceObject[key].push(model)
          CACHE.container.scene.add(model)
        }
      }
    }


    deviceType.forEach(e => {
      UTIL.instantiationGroupInfo(deviceObject[e], e, CACHE.container)
    })

  }
}


// 二维的搜索框
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
    // if (obj) {
    //   STATE.sceneList.lineList.forEach(e => {
    //     if (e.userData.color) {
    //       e.material.color = e.userData.color
    //     }
    //   })
    // }
  } else if (type === '卡匣') {
    const kaxia = STATE.sceneList.kaxiaList.children.find(e => e.userData.id === id)

    if (kaxia) {
      obj = kaxia

    } else {
      for (let i = 0; i < STATE.sceneList.skyCarList.length; i++) {
        if (STATE.sceneList.skyCarList[i].catch && STATE.sceneList.skyCarList[i].catch.userData.id === id) {
          obj = STATE.sceneList.skyCarList[i].catch
          break
        }
      }
    }
  }

  if (obj) {
    // 相机移动动画
    let isCameraMoveOver = false // 动画移动完成
    const camera = CACHE.container.orbitCamera
    const control = CACHE.container.orbitControls

    if (!CACHE.tempCameraState.position) {
      CACHE.tempCameraState = {
        position: camera.position.clone(),
        target: control.target.clone()
      }
    }
    let objWorldPosition = new Bol3D.Vector3()
    obj.getWorldPosition(objWorldPosition)


    const finalPosition = UTIL.computedCameraTweenPosition(camera.position, objWorldPosition)

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
        isCameraMoveOver = false
        // control.enabled = false
        // STATE.sceneList.skyCarList.forEach(e => {
        //   e.popup.visible = true
        //   if (e.clickPopup) {
        //     if (e.clickPopup.parent) {
        //       e.clickPopup.parent.remove(e.clickPopup)
        //     }
        //     e.clickPopup.element.remove()
        //     e.clickPopup = null
        //   }
        // })
        // STATE.searchAnimateDestroy = true
        control.removeEventListener('start', eventFunc)


        // new Bol3D.TWEEN.Tween(camera.position)
        //   .to(CACHE.tempCameraState.position, 800)
        //   .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
        //   .start()

        // new Bol3D.TWEEN.Tween(control.target)
        //   .to(CACHE.tempCameraState.target, 800)
        //   .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
        //   .start()
        //   .onComplete(() => {
        //     control.enabled = true
        //     control.saveState()
        //     control.reset()
        //   })
      }

      CACHE.container.orbitControls.addEventListener('start', eventFunc)

      animate = () => {
        if (isCameraMoveOver) {
          control.target.set(objWorldPosition.x, objWorldPosition.y, objWorldPosition.z)
        }
      }

    } else if (type === '轨道') {
      // const color = obj.material.color.clone()
      // obj.userData.color = color

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
      let height = '32vh'
      let className = 'popup3d_guidao'
      let items = [
        { name: '起点节点', value: lineData?.startPoint },
        { name: '起点坐标', value: lineData?.startCoordinate },
        { name: '终点节点', value: lineData?.endPoint },
        { name: '终点坐标', value: lineData?.endCoordinate },
        { name: '轨道状态', value: (lineData?.status === '1' ? '启用' : '锁定') }
      ]

      let textValue = ``
      for (let i = 0; i < items.length; i++) {
        textValue += `
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0 5%;
              margin-bottom: 4%;      
              width: 100%;
              background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
              ">
              <p style="font-size: 2vh;text-align:left;margin-right:2%;">${items[i].name}</p>
              <p style="font-size: 2vh;text-align:right;word-break:break-all;">${items[i].value}</p>
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
                margin-top: 8%;
              ">
                ${title}
              </p>

              <div style="
                display: flex;
                flex-direction: column;
                width: 85%;
                margin: 4% auto 0 auto;
                height: 47vh;
                                pointer-events: all;
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
          if (popup.parent) {
            popup.parent.remove(popup)
          }
          STATE.currentPopup = null

          if (CACHE.tempCameraState.position) {
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

            CACHE.tempCameraState = {}
          }
        })
      })

      popup.scale.set(0.08, 0.08, 0.08)
      popup.name = 'popup_' + obj.name
      popup.position.set(objWorldPosition.x, objWorldPosition.y + 10, objWorldPosition.z)
      CACHE.container.scene.add(popup)
      STATE.currentPopup = popup


      // const eventFunc = () => {
      //   STATE.searchAnimateDestroy = true
      //   obj.material.color = color
      //   CACHE.container.orbitControls.removeEventListener('start', eventFunc)
      // }
      // CACHE.container.orbitControls.addEventListener('start', eventFunc)
      // animate = () => {
      //   const dt = STATE.clock.getElapsedTime()
      //   const mixColor = Math.abs(Math.sin(dt * 2))
      //   obj.material.color.r = color.r + mixColor * 0.95
      //   obj.material.color.g = color.g + mixColor * 0.41
      // }



      // 接口
      GetBayStateInfo(`${lineData.startPoint}_${lineData.endPoint}`).then(res => {
        if (res?.data) {

          const data = res.data
          if (popup.parent) {
            popup.parent.remove(popup)
          }

          STATE.currentPopup.element.remove()

          let items = [
            { name: '起点节点', value: data.point || '--' },
            { name: '起点坐标', value: data.startPosition || '--' },
            { name: '终点节点', value: data.ntPoint || '--' },
            { name: '终点坐标', value: data.endPosition || '--' },
            { name: '轨道状态', value: (data?.status === '1' ? '启用' : '锁定') }
          ]

          let textValue = ``
          for (let i = 0; i < items.length; i++) {
            textValue += `
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0 5%;
              margin-bottom: 4%;      
              width: 100%;
              background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
              ">
              <p style="font-size: 2vh;text-align:left;margin-right:2%;">${items[i].name}</p>
              <p style="font-size: 2vh;text-align:right;word-break:break-all;">${items[i].value}</p>
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
                    margin-top: 8%;
                  ">
                    ${title}
                  </p>
    
                  <div style="
                    display: flex;
                    flex-direction: column;
                    width: 85%;
                    margin: 4% auto 0 auto;
                    height: 47vh;
                                        pointer-events: all;
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
              if (popup.parent) {
                popup.parent.remove(popup)
              }
              STATE.currentPopup = null

              if (CACHE.tempCameraState.position) {
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

                CACHE.tempCameraState = {}
              }
            })
          })

          newPopup.scale.set(0.08, 0.08, 0.08)
          newPopup.name = 'popup_' + obj.name
          newPopup.position.set(objWorldPosition.x, objWorldPosition.y + 10, objWorldPosition.z)
          CACHE.container.scene.add(newPopup)
          STATE.currentPopup = newPopup

          // obj.material.color.set(data.status === '0' ? '#333333' : '#b3b3b3')
        }
      })

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


      // CACHE.tempCameraState = {
      //   position: camera.position.clone(),
      //   target: control.target.clone()
      // }

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
              margin-bottom: 4%;      
              width: 100%;
              background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
              ">
              <p style="font-size: 2vh;text-align:left;margin-right:2%;">${items[i].name}</p>
              <p style="font-size: 2vh;text-align:right;word-break:break-all;">${items[i].value}</p>
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
                margin-top: 8%;
              ">
                ${title}
              </p>

              <div style="
                display: flex;
                flex-direction: column;
                width: 85%;
                margin: 4% auto 0 auto;
                height: 47vh;
                                pointer-events: all;
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
          if (obj.parent.name === 'tianche02') {
            STATE.sceneList.skyCarList.forEach(e => {
              e.skyCarMesh.userData.popup.visible = true
            })
          }

          popup.element.remove()
          if (popup.parent) {
            popup.parent.remove(popup)
          }
          STATE.currentPopup = null

          if (CACHE.tempCameraState.position) {
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

            CACHE.tempCameraState = {}
          }

        })
      })

      popup.scale.set(0.08, 0.08, 0.08)
      popup.name = 'popup_' + obj.name

      if (obj.parent && obj.parent.name === 'tianche02') {
        popup.position.set(0, 0, 0)
        obj.parent.parent.add(popup)
        obj.parent.parent.userData.popup.visible = false

      } else {
        popup.position.set(objWorldPosition.x, objWorldPosition.y + 5, objWorldPosition.z)
        CACHE.container.scene.add(popup)
      }
      STATE.currentPopup = popup
      const finalPosition = UTIL.computedCameraTweenPosition(camera.position, objWorldPosition)

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
        isCameraMoveOver = false
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
          if (popup.parent) {
            popup.parent.remove(popup)
          }

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
                    margin-bottom: 4%;            
                    width: 100%;
                    background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
                    ">
                    <p style="font-size: 2vh;text-align:left;margin-right:2%;">${items[i].name}</p>
                    <p style="font-size: 2vh;text-align:right;word-break:break-all;">${items[i].value}</p>
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
                      margin-top: 8%;
                    ">
                      ${title}
                    </p>
      
                    <div style="
                      display: flex;
                      flex-direction: column;
                      width: 85%;
                      margin: 4% auto 0 auto;
                      height: 47vh;
                                            pointer-events: all;
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
              if (popup.parent) {
                popup.parent.remove(popup)
              }

              if (CACHE.tempCameraState.position) {
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

                CACHE.tempCameraState = {}
              }
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


      // 货架上的文字
      // const loader = new Bol3D.FontLoader()
      // loader.load('/assets/optimer_bold.typeface.json', (font) => {
      //   const g = new Bol3D.TextGeometry(DATA.shelvesMap[area][shelf].fields.join(','), {
      //     font: font,
      //     size: 150,
      //     height: 1,
      //     curveSegments: 12,
      //     bevelEnabled: false,
      //     bevelThickness: 1,
      //     bevelSize: 1,
      //     bevelSegments: 1
      //   })
      //   g.computeBoundingBox();
      //   const m = new Bol3D.MeshBasicMaterial({ color: 0xff0000 })
      //   const mesh = new Bol3D.Mesh(g, m)
      //   mesh.position.set(...item.position)
      //   mesh.position.y += 16
      //   mesh.scale.set(0.01, 0.01, 0.01)
      //   if (item.axle.includes('z')) {
      //     mesh.rotation.y = -Math.PI / 2
      //     mesh.position.z -= 7;
      //   } else {
      //     mesh.position.x -= 7;
      //   }
      //   CACHE.container.scene.add(mesh)

      // })


      STATE.sceneList.shelves[shelf] = model
      CACHE.container.scene.add(model)

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

      const position = UTIL.getPositionByKaxiaLocation(e.locationId)

      if (!position) return

      const kaxia = e.carrierType === '0' ? STATE.sceneList.FOUP.clone() : STATE.sceneList.FOSB.clone()
      kaxia.userData.id = e.carrierId
      kaxia.userData.locationId = e.locationId
      kaxia.userData.carrierType = e.carrierType === '0' ? 'FOUP' : e.carrierType === '1' ? 'FOSB' : e.carrierType === '2' ? 'POD' : ''
      kaxia.userData.where = position.type
      kaxia.userData.area = position.area
      kaxia.userData.shelf = position.shelf
      kaxia.userData.shelfIndex = position.shelfIndex
      kaxia.userData.type = 'kaxia'
      kaxia.scale.set(30, 30, 30)
      kaxia.position.set(position.position.x, position.position.y, position.position.z)
      if (position.type === '在货架上') {
        kaxia.rotation.y = DATA.shelvesMap[position.area][position.shelf].rotate * Math.PI / 180 - Math.PI / 2
      } else if (position.type === '在机台上') {
        kaxia.rotation.y = DATA.deviceMap[position.area][position.shelf].rotate * Math.PI / 180
      }
      kaxia.visible = true
      kaxia.traverse(e2 => {
        if (e2.isMesh) {
          e2.userData.id = kaxia.userData.id
          e2.userData.locationId = kaxia.userData.locationId
          e2.userData.carrierType = kaxia.userData.carrierType
          e2.userData.where = kaxia.userData.type
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


// 点击实例化后的模型 如货架和机台 (模型, 索引)
function clickInstance(obj, index) {
  const transformInfo = CACHE.instanceTransformInfo[obj.name][index]

  const camera = CACHE.container.orbitCamera
  const control = CACHE.container.orbitControls

  let thisDevice = null

  if (!CACHE.tempCameraState.position) {
    CACHE.tempCameraState = {
      position: camera.position.clone(),
      target: control.target.clone()
    }
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
    height = '38vh'
    className = 'popup3d_shalves'

  } else if (obj.name.includes('shalves4')) {
    title = 'OHB'
    items = [
      { name: 'OHB Group', value: STATE.sceneList.shelves4Arr[index].area },
      { name: 'Remark', value: STATE.sceneList.shelves4Arr[index].shelf },
      { name: 'OHTPort1', value: STATE.sceneList.shelves4Arr[index].fields[0] },
      { name: 'OHTPort2', value: STATE.sceneList.shelves4Arr[index].fields[1] },
      { name: 'OHTPort3', value: STATE.sceneList.shelves4Arr[index].fields[2] },
      { name: 'OHTPort4', value: STATE.sceneList.shelves4Arr[index].fields[3] }
    ]
    height = '38vh'
    className = 'popup3d_shalves'

  } else {
    const map = DATA.deviceTypeMap.find(e => e.label === obj.name.split('_')[0])
    if (!map) return
    const deviceItem = CACHE.instanceNameMap[map.modelName][index]

    for (let key in DATA.deviceMap) {
      for (let key2 in DATA.deviceMap[key]) {
        if (deviceItem?.id === key2) {
          thisDevice = DATA.deviceMap[key][key2]
        }
      }
    }

    title = '机台'
    items = [
      { name: '机台ID', value: deviceItem?.id || '--' },
      { name: '机台Type', value: thisDevice.type || '--' },
      { name: '机台状态', value: '--' },
      { name: 'isOnline', value: '--' },
      { name: 'Bay', value: thisDevice.bay || '--' },
      { name: 'Port1', value: thisDevice.fields[0] || '--' },
      { name: 'Port2', value: thisDevice.fields[1] || '--' },
      { name: 'Port3', value: thisDevice.fields[2] || '--' },
      { name: 'Port4', value: thisDevice.fields[3] || '--' }
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
        margin-bottom: 4%;
        width: 100%;
        background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
        ">
        <p style="font-size: 2vh;text-align:left;margin-right:2%;">${items[i].name}</p>
        <p style="font-size: 2vh;text-align:right;word-break:break-all;">${items[i].value}</p>
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
          margin-top: 8%;
        ">
          ${title}
        </p>

        <div style="
          display: flex;
          flex-direction: column;
          width: 85%;
          margin: 4% auto 0 auto;
          height: 47vh;
                    pointer-events: all;
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
      if (popup.parent) {
        popup.parent.remove(popup)
      }
      STATE.currentPopup = null

      if (CACHE.tempCameraState.position) {
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

        CACHE.tempCameraState = {}
      }
    })
  })

  popup.scale.set(0.08, 0.08, 0.08)
  popup.name = name
  popup.position.set(transformInfo.position.x, transformInfo.position.y + 15, transformInfo.position.z)
  CACHE.container.scene.add(popup)
  STATE.currentPopup = popup

  let desdory = false


  const finalPosition = UTIL.computedCameraTweenPosition(camera.position, transformInfo.position)
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

        if (popup.parent) {
          popup.parent.remove(popup)
        }
        STATE.currentPopup.element.remove()

        let items = [
          { name: '机台ID', value: deviceId || '--' },
          { name: '机台Type', value: type || '--' },
          { name: '机台状态', value: enable || '--' },
          { name: 'isOnline', value: isOnlineState || '--' },
          { name: 'Bay', value: thisDevice.bay || '--' },
          { name: 'Port1', value: thisDevice.fields[0] || '--' },
          { name: 'Port2', value: thisDevice.fields[1] || '--' },
          { name: 'Port3', value: thisDevice.fields[2] || '--' },
          { name: 'Port4', value: thisDevice.fields[3] || '--' }
        ]


        let textValue = ``
        for (let i = 0; i < items.length; i++) {
          textValue += `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 5%;
        margin-bottom: 4%;
        width: 100%;
        background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
        ">
        <p style="font-size: 2vh;text-align:left;margin-right:2%;">${items[i].name}</p>
        <p style="font-size: 2vh;text-align:right;word-break:break-all;">${items[i].value}</p>
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
          margin-top: 8%;
        ">
          ${title}
        </p>

        <div style="
          display: flex;
          flex-direction: column;
          width: 85%;
          margin: 4% auto 0 auto;
          height: 47vh;
                    pointer-events: all;
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
            if (popup.parent) {
              popup.parent.remove(popup)
            }
            STATE.currentPopup = null

            if (CACHE.tempCameraState.position) {
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

              CACHE.tempCameraState = {}
            }
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


// 显隐机台 type: true/false
function deviceShow(type) {
  const instancedMeshArr = CACHE.container.scene.children.filter(e => e.isInstancedMesh)
  const keys = []
  for (let key in DATA.deviceMap) {
    keys.push(key)
  }
  keys.forEach(key => {
    const itemArr = instancedMeshArr.filter(e => e.name.split('_')[0] === key)
    itemArr.forEach(e => {
      e.visible = type
    })
  })
}


// 双击模型方法
function dbClickFunc(e) {
  if (e.objects.length) {
    const obj = e.objects[0].object

    if (GLOBAL.isEditorMode.value) {
      if (obj.userData.type === '机台') {
        const obj2 = CACHE.container.scene.children.find(e2 =>
          e2.userData.id === obj.userData.id &&
          e2.userData.deviceType === obj.userData.deviceType
        )
        bus.$emit('device', obj2)
      }

    } else {
      STATE.sceneList.lineList.forEach(e => {
        e.material.uniforms.next.value = 0
        e.material.uniforms.pass.value = 0
        e.material.uniforms.currentFocusLineStartPoint.value = -1
        e.material.uniforms.currentFocusLineEndPoint.value = -1
        e.material.uniforms.isEndLine.value = 0
        e.material.uniforms.endLineProgress.value = 0.0
        e.material.uniforms.isStartLine.value = 0
        e.material.uniforms.startLineProgress.value = 0.0
      })
      STATE.sceneList.skyCarList.forEach(e2 => {
        e2.focus = false
      })

      if (obj.userData.type === '天车') {
        STATE.searchAnimateDestroy = true
        API.search('天车', obj.userData.id)
        const instance = STATE.sceneList.skyCarList.find(e2 => e2.id === obj.userData.id)
        if (instance) {
          STATE.sceneList.skyCarList.forEach(e2 => {
            e2.popup.visible = true
            e2.focus = false
            if (e2.clickPopup && e2.clickPopup.parent) {
              e2.clickPopup.element.remove()
              e2.clickPopup.parent.remove(e2.clickPopup)
              e2.clickPopup = null
            }
          })
          instance.focus = true
          instance.initClickPopup()
          // 车子在当前轨道上走了多少进度
          const progress = instance.lineIndex / STATE.sceneList.linePosition[instance.line].length
          const thisLineMesh = STATE.sceneList.lineList.find(e => e.name === instance.line)
          if (progress && thisLineMesh) {
            thisLineMesh.material.uniforms.currentFocusLineStartPoint.value = instance.line.split('-')[0]
            thisLineMesh.material.uniforms.currentFocusLineEndPoint.value = instance.line.split('-')[1]
            thisLineMesh.material.uniforms.progress.value = progress
          }
        }
      } else if (obj.userData.type === '轨道') {
        API.search('轨道', obj.userData.id)

      } else if (obj.isInstancedMesh) {
        const index = e.objects[0].instanceId
        API.clickInstance(obj, index)

      } else if (obj.userData.type === 'kaxia') {
        API.search('卡匣', obj.userData.id)
      }

    }
  }
}


render()
function render() {
  requestAnimationFrame(render)

  // 更新当前帧率
  const t = STATE.clock.getElapsedTime()
  const frameRate = 1 / (t - CACHE.oldClock)
  STATE.frameRate = frameRate
  CACHE.oldClock = t

  if (STATE?.sceneList?.lineList?.length) {
    STATE.sceneList.lineList.forEach(e => {
      e.material.uniforms.time.value = t
    })
  }
}


export const API = {
  ...TU,
  setReload,
  initLine,
  search,
  initDeviceByMap,
  initShelves,
  clickInstance,
  deviceShow,
  initKaxia,
  afterOnload,
  dbClickFunc
}
