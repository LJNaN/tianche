import {ref} from 'vue'
import { STATE } from './STATE.js'
import { CACHE } from './CACHE.js'
import { DATA } from './DATA.js'
import TU from './js/threeUtils.js'
import { Reflector } from './js/Reflector.js'
import * as TWEEN from '@tweenjs/tween.js'
import mockData1 from './js/mock1'
import mockData2 from './js/mock2'
import mockData3 from './js/mock3'
import mockData4 from './js/mock4'
import { GetCarrierInfo, OhtFindCmdId, CarrierFindCmdId, GetEqpStateInfo, GetRealTimeEqpState, GetRealTimeCmd, GetBayStateInfo } from '@/axios/api.js'
import { VUEDATA } from '@/VUEDATA.js'
import SkyCar from './js/SkyCar.js'
import drive from './js/drive.js'

// 获取数据  有data 模拟/回溯 无data 线上
class GetData {
  currentReplayData = ref([])
  replayTimer = null
  ws = null

  constructor() {
    this.run()
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
        drive(wsMessage)
      }

    } else {
      // 模拟数据/回溯数据
      // =======================================

      STATE.sceneList.skyCarList.forEach(e => {
        e.replayRun = true
      })

      const replayTimer = setInterval(() => {
        if (VUEDATA.replayIndex.value >= this.currentReplayData.value.length - 1) {
          VUEDATA.replayPaused.value = true
          this.pause()

        } else {
          drive(this.currentReplayData.value[VUEDATA.replayIndex.value])
          VUEDATA.replayIndex.value++
          VUEDATA.replaySlider.value = Math.floor(VUEDATA.replayIndex.value / this.currentReplayData.value.length * 1000)
        }
      }, 333 / VUEDATA.replayTimes.value)
      this.replayTimer = replayTimer

      // setInterval(() => {
      // if (i >= mockData4.length) i = 0
      // drive(mockData4[i])
      // i++
      // }, 333)
    }
  }

  pause() {
    if (this.replayTimer) {
      clearInterval(this.replayTimer)
      this.replayTimer = null
    }

    STATE.sceneList.skyCarList.forEach(e => {
      e.replayRun = false
    })
  }

  reset() {
    while(STATE.sceneList.skyCarList.length) {
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

// 全部轨道状态
function getBayState() {
  // GetBayStateInfo().then(res => {
  //   if (res?.data?.length) {
  //     res.data.forEach(e => {
  //       const line = STATE.sceneList.lineList.find(e2 => e2.name.replace('-', '_') === e.mapId)
  //       if (line) {
  //         

  //         // line.material.color.set(e.status === '0' ? '#333333' : '#b3b3b3')
  //       }
  //     })
  //   }
  // })
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
      const reverseList = ['92-11', '11-12', '114-37', '72-66', '66-67', '57-58', '58-59', '68-69', '69-70', '70-64', '63-65', '65-71', '75-76', '77-78', '79-80', '13-21', '21-25', '25-29', '30-31', '31-32', '31-34', '21-22', '16-17', '17-23', '27-35', '35-36', '35-38', '23-24', '56-91', '90-95', '55-73', '74-72', '71-53', '53-52', '53-54', '36-33', '32-39', '39-40', '40-43', '44-47', '47-78', '48-49', '110-106', '50-119', '118-115', '41-42', '45-46', '49-50', '2-3', '6-7', '10-11', '1-4', '5-8', '9-10', '81-82', '82-83', '86-89', '15-16', '19-97', '100-101', '104-20', '98-105', '105-109', '109-113', '113-116', '105-106', '102-107', '111-117', '107-111', '107-108', '84-87', '87-88', '88-85', '93-94', '73-75', '43-41', '42-44', '47-45', '46-48', '117-120', '47-48', '53-54', '80-74', '12-13']
      if (reverseList.includes(e.name.split('X-')[1])) {
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
        color = vec4(0.0,0.2,0.0,1.);
        color.a = blockMask;

      } else if(pass == 1) {
        color = vec4(0.0,0.0,0.2,1.);
        color.a = blockMask;
        
      } else if (currentFocusLineStartPoint == startPoint && currentFocusLineEndPoint == endPoint) {
        if(isEndLine == 1) {
          if(vUv.x > endLineProgress) {
            color = vec4(0.7,0.7,0.7,1.);
            
          } else if (vUv.x < progress) {
            color = vec4(0.0,0.0,0.2,1.);
            color.a = blockMask;
            
          } else {
            color = vec4(0.0,0.2,0.0,1.);
            color.a = blockMask;
          }
          
        } else if(isStartLine == 1) {
          if(vUv.x < startLineProgress) {
            color = vec4(0.7,0.7,0.7,1.);

          } else if (vUv.x < progress) {
            color = vec4(0.0,0.0,0.2,1.);
            color.a = blockMask;

          } else {
            color = vec4(0.0,0.2,0.0,1.);
            color.a = blockMask;
          }

        } else {
          if(vUv.x > progress) {
            color = vec4(0.0,0.2,0.0,1.);
            color.a = blockMask;

          } else {
            color = vec4(0.0,0.0,0.2,1.);
            color.a = blockMask;
          }
        }

      } else if (isEndLine == 1) {
        if(vUv.x > endLineProgress) {
          color = vec4(0.7,0.7,0.7,1.); 

        } else {
          color = vec4(0.0,0.2,0.0,1.);
          color.a = blockMask;
        }

      } else if (isStartLine == 1) {
        if(vUv.x < startLineProgress) {
          color = vec4(0.7,0.7,0.7,1.);

        } else {
          color = vec4(0.0,0.0,0.2,1.);
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
function initMockSkyCar() {
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

      if (obj.parent.name === 'tianche02') {
        popup.position.set(0, 0, 0)
        obj.parent.parent.add(popup)
        obj.parent.parent.userData.popup.visible = false

      } else {
        popup.position.set(objWorldPosition.x, objWorldPosition.y + 5, objWorldPosition.z)
        CACHE.container.scene.add(popup)
      }
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

// 实例化点击
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

// 通过 GetCarrierInfo 的locationId 找 position
// 史
function getPositionByKaxiaLocation(location) {
  // 先判断机台
  for (let key in DATA.deviceMap) {
    for (let key2 in DATA.deviceMap[key]) {
      if (DATA.deviceMap[key][key2].fields.includes(Number(location))) {

        const item = DATA.deviceMap[key][key2]
        const position = new Bol3D.Vector3()
        const index = item.fields.findIndex(e => e === Number(location))
        if (key === 'WSORA') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0] - 6 + index * 5.07, 12, item.position[2] + 6.3)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 6.3, 12, item.position[2] - 6 + index * 5.07)
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0] + 6 - index * 5.07, 12, item.position[2] - 6.3)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 6.3, 12, item.position[2] + 6 - index * 5.07)
          }

        } else if (key === 'WMACB') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0] - 9 + index * 5.3, 11, item.position[2] + 10)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 10, 11, item.position[2] - 9 + index * 5.3)
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0] + 9 - index * 5.3, 11, item.position[2] - 10)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 10, 11, item.position[2] + 9 - index * 5.3)
          }

        } else if (key === 'WROMA') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0] - 1.2 + index * 5.3, 11, item.position[2] + 12.5)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 12.5, 11, item.position[2] - 1.2 + index * 5.3)
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0] + 1.2 - index * 5.3, 11, item.position[2] - 12.5)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 12.5, 11, item.position[2] + 1.2 - index * 5.3)
          }

        } else if (key === 'WHWSA') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(index < 2 ? (item.position[2] + 6 + index * 5.3) : (item.position[2] + 26 + index * 5.3), 11, item.position[0] + 6)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 28, 11, index < 2 ? (item.position[2] + 15 - index * 5.3) : (item.position[2] - 5 - index * 5.3))
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(index < 2 ? (item.position[2] + 37 - index * 5.3) : (item.position[2] + 16 - index * 5.3), 11, item.position[0] - 49)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 28, 11, index < 2 ? (item.position[2] - 15 + index * 5.3) : (item.position[2] + 5 + index * 5.3))
          }

        } else if (key === 'WBS') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0] - 4 + index * 5.3, 11, item.position[2] + 12.5)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 12.5, 11, item.position[2] - 4 + index * 5.3)
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0] + 4 - index * 5.3, 11, item.position[2] - 12.5)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 12.5, 11, item.position[2] + 4 - index * 5.3)
          }

        } else if (key === 'WWS') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0] - 9, 11, item.position[2] + 11)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 11, 11, item.position[2] + 9)
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0] + 9, 11, item.position[2] - 11)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 11, 11, item.position[2] - 9)
          }

        } else if (key === 'WWATA') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0] - 10, 11, item.position[2] + 11)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 11, 11, item.position[2] + 10)
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0] + 10, 11, item.position[2] - 11)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 11, 11, item.position[2] - 10)
          }

        } else if (key === 'WTSTK') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0] - 4 + index * 7.8, 20, item.position[2] + 3)
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0] + 3, 20, item.position[2] - 4 + index * 7.8)
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0] + 4 - index * 7.8, 20, item.position[2] - 3)
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0] - 3, 20, item.position[2] + 4 - index * 7.8)
          }

        } else if (key === 'WOLUS') {
          if (Math.abs(DATA.deviceMap[key][key2].rotate % 360) === 0) {
            position.set(item.position[0], 10.5, item.position[2])
          } else if (DATA.deviceMap[key][key2].rotate === 90 || DATA.deviceMap[key][key2].rotate === -270) {
            position.set(item.position[0], 10.5, item.position[2])
          } else if (Math.abs(DATA.deviceMap[key][key2].rotate) === 180) {
            position.set(item.position[0], 10.5, item.position[2])
          } else if (DATA.deviceMap[key][key2].rotate === -90 || DATA.deviceMap[key][key2].rotate === 270) {
            position.set(item.position[0], 10.5, item.position[2])
          }
        }


        const res = {
          type: '在机台上',
          position,
          area: key,
          shelf: key2,
          shelfIndex: index
        }
        return res
      }
    }
  }

  // 再判断货架
  for (let key in DATA.shelvesMap) {
    for (let key2 in DATA.shelvesMap[key]) {
      if (DATA.shelvesMap[key][key2].fields.includes(Number(location))) {

        const item = DATA.shelvesMap[key][key2]
        const position = new Bol3D.Vector3()
        const index = item.fields.findIndex(e => e === Number(location))
        if (item.fields.length === 4) {
          if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(key)) {
            if (item.axle === 'x') {
              position.set(item.position[0] - 7.3 + index * 4.9, 27, item.position[2])
            } else {
              position.set(item.position[0] + 7.3 - index * 4.9, 27, item.position[2])
            }

          } else {
            if (item.axle === 'z') {
              position.set(item.position[0], 27, item.position[2] - 7.3 + index * 4.9)
            } else {
              position.set(item.position[0], 27, item.position[2] + 7.3 - index * 4.9)
            }
          }

        } else if (item.fields.length === 2) {
          if (['WBW01G01', 'WBW01G02', 'WBW01G03'].includes(key)) {
            if (item.axle === 'x') {
              position.set(item.position[0] - 2.5 + index * 4.9, 28, item.position[2])
            } else {
              position.set(item.position[0] + 2.5 - index * 4.9, 28, item.position[2])
            }

          } else {
            if (item.axle === 'z') {
              position.set(item.position[0], 27, item.position[2] - 2.5 + index * 4.9)
            } else {
              position.set(item.position[0], 27, item.position[2] + 2.5 - index * 4.9)
            }
          }
        }

        const res = {
          type: '在货架上',
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

    // const res = {
    //   "code": 0,
    //   "msg": "",
    //   "data": [
    //     { carrierId: "1197", carrierType: "0", locationId: "1197" },
    //     { carrierId: "1204", carrierType: "0", locationId: "1204" },
    //     { carrierId: "1208", carrierType: "0", locationId: "1208" },
    //     { carrierId: "1212", carrierType: "0", locationId: "1212" },
    //     { carrierId: "1213", carrierType: "0", locationId: "1213" },
    //     { carrierId: "1217", carrierType: "0", locationId: "1217" },
    //     { carrierId: "1221", carrierType: "0", locationId: "1221" },
    //     { carrierId: "1225", carrierType: "0", locationId: "1225" },
    //     { carrierId: "1232", carrierType: "0", locationId: "1232" },
    //     { carrierId: "1236", carrierType: "0", locationId: "1236" },
    //     { carrierId: "1240", carrierType: "0", locationId: "1240" },
    //     { carrierId: "1244", carrierType: "0", locationId: "1244" },
    //     { carrierId: "1248", carrierType: "0", locationId: "1248" },
    //     { carrierId: "1268", carrierType: "0", locationId: "1268" },
    //     { carrierId: "1264", carrierType: "0", locationId: "1264" },
    //     { carrierId: "1260", carrierType: "0", locationId: "1260" },
    //     { carrierId: "1256", carrierType: "0", locationId: "1256" },
    //     { carrierId: "1252", carrierType: "0", locationId: "1252" },
    //     { carrierId: "1165", carrierType: "0", locationId: "1165" },
    //     { carrierId: "1161", carrierType: "0", locationId: "1161" },
    //     { carrierId: "1157", carrierType: "0", locationId: "1157" },
    //     { carrierId: "1153", carrierType: "0", locationId: "1153" },
    //     { carrierId: "1149", carrierType: "0", locationId: "1149" },
    //     { carrierId: "1185", carrierType: "0", locationId: "1185" },
    //     { carrierId: "1181", carrierType: "0", locationId: "1181" },
    //     { carrierId: "1177", carrierType: "0", locationId: "1177" },
    //     { carrierId: "1173", carrierType: "0", locationId: "1173" },
    //     { carrierId: "1169", carrierType: "0", locationId: "1169" },
    //     { carrierId: "1192", carrierType: "0", locationId: "1192" },
    //     { carrierId: "1196", carrierType: "0", locationId: "1196" },
    //     { carrierId: "1148", carrierType: "0", locationId: "1148" },
    //     { carrierId: "1136", carrierType: "0", locationId: "1136" },
    //     { carrierId: "1144", carrierType: "0", locationId: "1144" },
    //     { carrierId: "1140", carrierType: "0", locationId: "1140" },
    //     { carrierId: "1132", carrierType: "0", locationId: "1132" },
    //     { carrierId: "1128", carrierType: "0", locationId: "1128" },
    //     { carrierId: "1124", carrierType: "0", locationId: "1124" },
    //     { carrierId: "1120", carrierType: "0", locationId: "1120" },
    //     { carrierId: "1116", carrierType: "0", locationId: "1116" },
    //     { carrierId: "1112", carrierType: "0", locationId: "1112" },
    //     { carrierId: "1108", carrierType: "0", locationId: "1108" },
    //     { carrierId: "1104", carrierType: "0", locationId: "1104" },
    //     { carrierId: "1071", carrierType: "0", locationId: "1071" },
    //     { carrierId: "1067", carrierType: "0", locationId: "1067" },
    //     { carrierId: "1063", carrierType: "0", locationId: "1063" },
    //     { carrierId: "1059", carrierType: "0", locationId: "1059" },
    //     { carrierId: "1055", carrierType: "0", locationId: "1055" },
    //     { carrierId: "1051", carrierType: "0", locationId: "1051" },
    //     { carrierId: "1021", carrierType: "0", locationId: "1021" },
    //     { carrierId: "1017", carrierType: "0", locationId: "1017" },
    //     { carrierId: "1013", carrierType: "0", locationId: "1013" },
    //     { carrierId: "1009", carrierType: "0", locationId: "1009" },
    //     { carrierId: "1005", carrierType: "0", locationId: "1005" },
    //     { carrierId: "1001", carrierType: "0", locationId: "1001" },
    //     { carrierId: "1099", carrierType: "0", locationId: "1099" },
    //     { carrierId: "1049", carrierType: "0", locationId: "1049" },
    //     { carrierId: "1095", carrierType: "0", locationId: "1095" },
    //     { carrierId: "1091", carrierType: "0", locationId: "1091" },
    //     { carrierId: "1087", carrierType: "0", locationId: "1087" },
    //     { carrierId: "1083", carrierType: "0", locationId: "1083" },
    //     { carrierId: "1079", carrierType: "0", locationId: "1079" },
    //     { carrierId: "1075", carrierType: "0", locationId: "1075" },
    //     { carrierId: "1045", carrierType: "0", locationId: "1045" },
    //     { carrierId: "1041", carrierType: "0", locationId: "1041" },
    //     { carrierId: "1037", carrierType: "0", locationId: "1037" },
    //     { carrierId: "1033", carrierType: "0", locationId: "1033" },
    //     { carrierId: "1029", carrierType: "0", locationId: "1029" },
    //     { carrierId: "1025", carrierType: "0", locationId: "1025" },
    //     { carrierId: "2288", carrierType: "0", locationId: "2288" },
    //     { carrierId: "2284", carrierType: "0", locationId: "2284" },
    //     { carrierId: "2280", carrierType: "0", locationId: "2280" },
    //     { carrierId: "2276", carrierType: "0", locationId: "2276" },
    //     { carrierId: "2272", carrierType: "0", locationId: "2272" },
    //     { carrierId: "2220", carrierType: "0", locationId: "2220" },
    //     { carrierId: "2216", carrierType: "0", locationId: "2216" },
    //     { carrierId: "2212", carrierType: "0", locationId: "2212" },
    //     { carrierId: "2208", carrierType: "0", locationId: "2208" },
    //     { carrierId: "2204", carrierType: "0", locationId: "2204" },
    //     { carrierId: "2153", carrierType: "0", locationId: "2153" },
    //     { carrierId: "2149", carrierType: "0", locationId: "2149" },
    //     { carrierId: "2145", carrierType: "0", locationId: "2145" },
    //     { carrierId: "2141", carrierType: "0", locationId: "2141" },
    //     { carrierId: "2137", carrierType: "0", locationId: "2137" },
    //     { carrierId: "2075", carrierType: "0", locationId: "2075" },
    //     { carrierId: "2071", carrierType: "0", locationId: "2071" },
    //     { carrierId: "2067", carrierType: "0", locationId: "2067" },
    //     { carrierId: "2063", carrierType: "0", locationId: "2063" },
    //     { carrierId: "2059", carrierType: "0", locationId: "2059" },
    //     { carrierId: "2268", carrierType: "0", locationId: "2268" },
    //     { carrierId: "2264", carrierType: "0", locationId: "2264" },
    //     { carrierId: "2260", carrierType: "0", locationId: "2260" },
    //     { carrierId: "2256", carrierType: "0", locationId: "2256" },
    //     { carrierId: "2252", carrierType: "0", locationId: "2252" },
    //     { carrierId: "2248", carrierType: "0", locationId: "2248" },
    //     { carrierId: "2200", carrierType: "0", locationId: "2200" },
    //     { carrierId: "2196", carrierType: "0", locationId: "2196" },
    //     { carrierId: "2192", carrierType: "0", locationId: "2192" },
    //     { carrierId: "2188", carrierType: "0", locationId: "2188" },
    //     { carrierId: "2244", carrierType: "0", locationId: "2244" },
    //     { carrierId: "2240", carrierType: "0", locationId: "2240" },
    //     { carrierId: "2236", carrierType: "0", locationId: "2236" },
    //     { carrierId: "2184", carrierType: "0", locationId: "2184" },
    //     { carrierId: "2180", carrierType: "0", locationId: "2180" },
    //     { carrierId: "2176", carrierType: "0", locationId: "2176" },
    //     { carrierId: "2172", carrierType: "0", locationId: "2172" },
    //     { carrierId: "2133", carrierType: "0", locationId: "2133" },
    //     { carrierId: "2129", carrierType: "0", locationId: "2129" },
    //     { carrierId: "2125", carrierType: "0", locationId: "2125" },
    //     { carrierId: "2121", carrierType: "0", locationId: "2121" },
    //     { carrierId: "2117", carrierType: "0", locationId: "2117" },
    //     { carrierId: "2055", carrierType: "0", locationId: "2055" },
    //     { carrierId: "2051", carrierType: "0", locationId: "2051" },
    //     { carrierId: "2047", carrierType: "0", locationId: "2047" },
    //     { carrierId: "2043", carrierType: "0", locationId: "2043" },
    //     { carrierId: "2039", carrierType: "0", locationId: "2039" },
    //     { carrierId: "2113", carrierType: "0", locationId: "2113" },
    //     { carrierId: "2109", carrierType: "0", locationId: "2109" },
    //     { carrierId: "2105", carrierType: "0", locationId: "2105" },
    //     { carrierId: "2101", carrierType: "0", locationId: "2101" },
    //     { carrierId: "2097", carrierType: "0", locationId: "2097" },
    //     { carrierId: "2035", carrierType: "0", locationId: "2035" },
    //     { carrierId: "2031", carrierType: "0", locationId: "2031" },
    //     { carrierId: "2027", carrierType: "0", locationId: "2027" },
    //     { carrierId: "2023", carrierType: "0", locationId: "2023" },
    //     { carrierId: "2019", carrierType: "0", locationId: "2019" },
    //     { carrierId: "2232", carrierType: "0", locationId: "2232" },
    //     { carrierId: "2228", carrierType: "0", locationId: "2228" },
    //     { carrierId: "2168", carrierType: "0", locationId: "2168" },
    //     { carrierId: "2164", carrierType: "0", locationId: "2164" },
    //     { carrierId: "2224", carrierType: "0", locationId: "2224" },
    //     { carrierId: "2160", carrierType: "0", locationId: "2160" },
    //     { carrierId: "2093", carrierType: "0", locationId: "2093" },
    //     { carrierId: "2089", carrierType: "0", locationId: "2089" },
    //     { carrierId: "2085", carrierType: "0", locationId: "2085" },
    //     { carrierId: "2081", carrierType: "0", locationId: "2081" },
    //     { carrierId: "2079", carrierType: "0", locationId: "2079" },
    //     { carrierId: "2015", carrierType: "0", locationId: "2015" },
    //     { carrierId: "2011", carrierType: "0", locationId: "2011" },
    //     { carrierId: "2007", carrierType: "0", locationId: "2007" },
    //     { carrierId: "2003", carrierType: "0", locationId: "2003" },
    //     { carrierId: "2001", carrierType: "0", locationId: "2001" },
    //     { carrierId: "3300", carrierType: "0", locationId: "3300" },
    //     { carrierId: "3296", carrierType: "0", locationId: "3296" },
    //     { carrierId: "3292", carrierType: "0", locationId: "3292" },
    //     { carrierId: "3288", carrierType: "0", locationId: "3288" },
    //     { carrierId: "3284", carrierType: "0", locationId: "3284" },
    //     { carrierId: "3280", carrierType: "0", locationId: "3280" },
    //     { carrierId: "3222", carrierType: "0", locationId: "3222" },
    //     { carrierId: "3218", carrierType: "0", locationId: "3218" },
    //     { carrierId: "3214", carrierType: "0", locationId: "3214" },
    //     { carrierId: "3210", carrierType: "0", locationId: "3210" },
    //     { carrierId: "3206", carrierType: "0", locationId: "3206" },
    //     { carrierId: "3202", carrierType: "0", locationId: "3202" },
    //     { carrierId: "3141", carrierType: "0", locationId: "3141" },
    //     { carrierId: "3137", carrierType: "0", locationId: "3137" },
    //     { carrierId: "3133", carrierType: "0", locationId: "3133" },
    //     { carrierId: "3129", carrierType: "0", locationId: "3129" },
    //     { carrierId: "3125", carrierType: "0", locationId: "3125" },
    //     { carrierId: "3123", carrierType: "0", locationId: "3123" },
    //     { carrierId: "3071", carrierType: "0", locationId: "3071" },
    //     { carrierId: "3067", carrierType: "0", locationId: "3067" },
    //     { carrierId: "3063", carrierType: "0", locationId: "3063" },
    //     { carrierId: "3059", carrierType: "0", locationId: "3059" },
    //     { carrierId: "3055", carrierType: "0", locationId: "3055" },
    //     { carrierId: "3053", carrierType: "0", locationId: "3053" },
    //     { carrierId: "4300", carrierType: "0", locationId: "4300" },
    //     { carrierId: "4296", carrierType: "0", locationId: "4296" },
    //     { carrierId: "4292", carrierType: "0", locationId: "4292" },
    //     { carrierId: "4288", carrierType: "0", locationId: "4288" },
    //     { carrierId: "4284", carrierType: "0", locationId: "4284" },
    //     { carrierId: "4280", carrierType: "0", locationId: "4280" },
    //     { carrierId: "4226", carrierType: "0", locationId: "4226" },
    //     { carrierId: "4222", carrierType: "0", locationId: "4222" },
    //     { carrierId: "4218", carrierType: "0", locationId: "4218" },
    //     { carrierId: "4214", carrierType: "0", locationId: "4214" },
    //     { carrierId: "4210", carrierType: "0", locationId: "4210" },
    //     { carrierId: "4206", carrierType: "0", locationId: "4206" },
    //     { carrierId: "4153", carrierType: "0", locationId: "4153" },
    //     { carrierId: "4149", carrierType: "0", locationId: "4149" },
    //     { carrierId: "4145", carrierType: "0", locationId: "4145" },
    //     { carrierId: "4141", carrierType: "0", locationId: "4141" },
    //     { carrierId: "4137", carrierType: "0", locationId: "4137" },
    //     { carrierId: "4135", carrierType: "0", locationId: "4135" },
    //     { carrierId: "4075", carrierType: "0", locationId: "4075" },
    //     { carrierId: "4071", carrierType: "0", locationId: "4071" },
    //     { carrierId: "4067", carrierType: "0", locationId: "4067" },
    //     { carrierId: "4063", carrierType: "0", locationId: "4063" },
    //     { carrierId: "4059", carrierType: "0", locationId: "4059" },
    //     { carrierId: "4057", carrierType: "0", locationId: "4057" },
    //     { carrierId: "5799", carrierType: "0", locationId: "5799" },
    //     { carrierId: "5795", carrierType: "0", locationId: "5795" },
    //     { carrierId: "5791", carrierType: "0", locationId: "5791" },
    //     { carrierId: "5787", carrierType: "0", locationId: "5787" },
    //     { carrierId: "5783", carrierType: "0", locationId: "5783" },
    //     { carrierId: "5779", carrierType: "0", locationId: "5779" },
    //     { carrierId: "5725", carrierType: "0", locationId: "5725" },
    //     { carrierId: "5721", carrierType: "0", locationId: "5721" },
    //     { carrierId: "5717", carrierType: "0", locationId: "5717" },
    //     { carrierId: "5713", carrierType: "0", locationId: "5713" },
    //     { carrierId: "5709", carrierType: "0", locationId: "5709" },
    //     { carrierId: "5705", carrierType: "0", locationId: "5705" },
    //     { carrierId: "5652", carrierType: "0", locationId: "5652" },
    //     { carrierId: "5648", carrierType: "0", locationId: "5648" },
    //     { carrierId: "5644", carrierType: "0", locationId: "5644" },
    //     { carrierId: "5640", carrierType: "0", locationId: "5640" },
    //     { carrierId: "5636", carrierType: "0", locationId: "5636" },
    //     { carrierId: "5634", carrierType: "0", locationId: "5634" },
    //     { carrierId: "5574", carrierType: "0", locationId: "5574" },
    //     { carrierId: "5570", carrierType: "0", locationId: "5570" },
    //     { carrierId: "5566", carrierType: "0", locationId: "5566" },
    //     { carrierId: "5562", carrierType: "0", locationId: "5562" },
    //     { carrierId: "5558", carrierType: "0", locationId: "5558" },
    //     { carrierId: "5556", carrierType: "0", locationId: "5556" },
    //     { carrierId: "3278", carrierType: "0", locationId: "3278" },
    //     { carrierId: "3274", carrierType: "0", locationId: "3274" },
    //     { carrierId: "3270", carrierType: "0", locationId: "3270" },
    //     { carrierId: "3266", carrierType: "0", locationId: "3266" },
    //     { carrierId: "3200", carrierType: "0", locationId: "3200" },
    //     { carrierId: "3196", carrierType: "0", locationId: "3196" },
    //     { carrierId: "3192", carrierType: "0", locationId: "3192" },
    //     { carrierId: "3188", carrierType: "0", locationId: "3188" },
    //     { carrierId: "3262", carrierType: "0", locationId: "3262" },
    //     { carrierId: "3258", carrierType: "0", locationId: "3258" },
    //     { carrierId: "3254", carrierType: "0", locationId: "3254" },
    //     { carrierId: "3250", carrierType: "0", locationId: "3250" },
    //     { carrierId: "3246", carrierType: "0", locationId: "3246" },
    //     { carrierId: "3184", carrierType: "0", locationId: "3184" },
    //     { carrierId: "3180", carrierType: "0", locationId: "3180" },
    //     { carrierId: "3176", carrierType: "0", locationId: "3176" },
    //     { carrierId: "3172", carrierType: "0", locationId: "3172" },
    //     { carrierId: "3168", carrierType: "0", locationId: "3168" },
    //     { carrierId: "3119", carrierType: "0", locationId: "3119" },
    //     { carrierId: "3115", carrierType: "0", locationId: "3115" },
    //     { carrierId: "3049", carrierType: "0", locationId: "3049" },
    //     { carrierId: "3045", carrierType: "0", locationId: "3045" },
    //     { carrierId: "3041", carrierType: "0", locationId: "3041" },
    //     { carrierId: "3111", carrierType: "0", locationId: "3111" },
    //     { carrierId: "3107", carrierType: "0", locationId: "3107" },
    //     { carrierId: "3103", carrierType: "0", locationId: "3103" },
    //     { carrierId: "3099", carrierType: "0", locationId: "3099" },
    //     { carrierId: "3095", carrierType: "0", locationId: "3095" },
    //     { carrierId: "3037", carrierType: "0", locationId: "3037" },
    //     { carrierId: "3033", carrierType: "0", locationId: "3033" },
    //     { carrierId: "3029", carrierType: "0", locationId: "3029" },
    //     { carrierId: "3025", carrierType: "0", locationId: "3025" },
    //     { carrierId: "3021", carrierType: "0", locationId: "3021" },
    //     { carrierId: "3242", carrierType: "0", locationId: "3242" },
    //     { carrierId: "3238", carrierType: "0", locationId: "3238" },
    //     { carrierId: "3234", carrierType: "0", locationId: "3234" },
    //     { carrierId: "3230", carrierType: "0", locationId: "3230" },
    //     { carrierId: "3226", carrierType: "0", locationId: "3226" },
    //     { carrierId: "3164", carrierType: "0", locationId: "3164" },
    //     { carrierId: "3160", carrierType: "0", locationId: "3160" },
    //     { carrierId: "3156", carrierType: "0", locationId: "3156" },
    //     { carrierId: "3152", carrierType: "0", locationId: "3152" },
    //     { carrierId: "3148", carrierType: "0", locationId: "3148" },
    //     { carrierId: "3091", carrierType: "0", locationId: "3091" },
    //     { carrierId: "3087", carrierType: "0", locationId: "3087" },
    //     { carrierId: "3083", carrierType: "0", locationId: "3083" },
    //     { carrierId: "3079", carrierType: "0", locationId: "3079" },
    //     { carrierId: "3075", carrierType: "0", locationId: "3075" },
    //     { carrierId: "3017", carrierType: "0", locationId: "3017" },
    //     { carrierId: "3013", carrierType: "0", locationId: "3013" },
    //     { carrierId: "3009", carrierType: "0", locationId: "3009" },
    //     { carrierId: "3005", carrierType: "0", locationId: "3005" },
    //     { carrierId: "3001", carrierType: "0", locationId: "3001" },
    //     { carrierId: "4278", carrierType: "0", locationId: "4278" },
    //     { carrierId: "4274", carrierType: "0", locationId: "4274" },
    //     { carrierId: "4270", carrierType: "0", locationId: "4270" },
    //     { carrierId: "4266", carrierType: "0", locationId: "4266" },
    //     { carrierId: "4204", carrierType: "0", locationId: "4204" },
    //     { carrierId: "4200", carrierType: "0", locationId: "4200" },
    //     { carrierId: "4196", carrierType: "0", locationId: "4196" },
    //     { carrierId: "4264", carrierType: "0", locationId: "4264" },
    //     { carrierId: "4260", carrierType: "0", locationId: "4260" },
    //     { carrierId: "4256", carrierType: "0", locationId: "4256" },
    //     { carrierId: "4194", carrierType: "0", locationId: "4194" },
    //     { carrierId: "4190", carrierType: "0", locationId: "4190" },
    //     { carrierId: "4186", carrierType: "0", locationId: "4186" },
    //     { carrierId: "4252", carrierType: "0", locationId: "4252" },
    //     { carrierId: "4248", carrierType: "0", locationId: "4248" },
    //     { carrierId: "4244", carrierType: "0", locationId: "4244" },
    //     { carrierId: "4240", carrierType: "0", locationId: "4240" },
    //     { carrierId: "4236", carrierType: "0", locationId: "4236" },
    //     { carrierId: "4232", carrierType: "0", locationId: "4232" },
    //     { carrierId: "4228", carrierType: "0", locationId: "4228" },
    //     { carrierId: "4182", carrierType: "0", locationId: "4182" },
    //     { carrierId: "4178", carrierType: "0", locationId: "4178" },
    //     { carrierId: "4174", carrierType: "0", locationId: "4174" },
    //     { carrierId: "4170", carrierType: "0", locationId: "4170" },
    //     { carrierId: "4166", carrierType: "0", locationId: "4166" },
    //     { carrierId: "4162", carrierType: "0", locationId: "4162" },
    //     { carrierId: "4158", carrierType: "0", locationId: "4158" },
    //     { carrierId: "4101", carrierType: "0", locationId: "4101" },
    //     { carrierId: "4097", carrierType: "0", locationId: "4097" },
    //     { carrierId: "4093", carrierType: "0", locationId: "4093" },
    //     { carrierId: "4089", carrierType: "0", locationId: "4089" },
    //     { carrierId: "4085", carrierType: "0", locationId: "4085" },
    //     { carrierId: "4081", carrierType: "0", locationId: "4081" },
    //     { carrierId: "4079", carrierType: "0", locationId: "4079" },
    //     { carrierId: "4023", carrierType: "0", locationId: "4023" },
    //     { carrierId: "4019", carrierType: "0", locationId: "4019" },
    //     { carrierId: "4015", carrierType: "0", locationId: "4015" },
    //     { carrierId: "4011", carrierType: "0", locationId: "4011" },
    //     { carrierId: "4007", carrierType: "0", locationId: "4007" },
    //     { carrierId: "4001", carrierType: "0", locationId: "4001" },
    //     { carrierId: "4001", carrierType: "0", locationId: "4001" },
    //     { carrierId: "4115", carrierType: "0", locationId: "4115" },
    //     { carrierId: "4111", carrierType: "0", locationId: "4111" },
    //     { carrierId: "4107", carrierType: "0", locationId: "4107" },
    //     { carrierId: "4105", carrierType: "0", locationId: "4105" },
    //     { carrierId: "4037", carrierType: "0", locationId: "4037" },
    //     { carrierId: "4033", carrierType: "0", locationId: "4033" },
    //     { carrierId: "4029", carrierType: "0", locationId: "4029" },
    //     { carrierId: "4027", carrierType: "0", locationId: "4027" },
    //     { carrierId: "4131", carrierType: "0", locationId: "4131" },
    //     { carrierId: "4127", carrierType: "0", locationId: "4127" },
    //     { carrierId: "4123", carrierType: "0", locationId: "4123" },
    //     { carrierId: "4119", carrierType: "0", locationId: "4119" },
    //     { carrierId: "4053", carrierType: "0", locationId: "4053" },
    //     { carrierId: "4049", carrierType: "0", locationId: "4049" },
    //     { carrierId: "4045", carrierType: "0", locationId: "4045" },
    //     { carrierId: "4041", carrierType: "0", locationId: "4041" },
    //     { carrierId: "5751", carrierType: "0", locationId: "5751" },
    //     { carrierId: "5747", carrierType: "0", locationId: "5747" },
    //     { carrierId: "5743", carrierType: "0", locationId: "5743" },
    //     { carrierId: "5739", carrierType: "0", locationId: "5739" },
    //     { carrierId: "5735", carrierType: "0", locationId: "5735" },
    //     { carrierId: "5731", carrierType: "0", locationId: "5731" },
    //     { carrierId: "5727", carrierType: "0", locationId: "5727" },
    //     { carrierId: "5681", carrierType: "0", locationId: "5681" },
    //     { carrierId: "5677", carrierType: "0", locationId: "5677" },
    //     { carrierId: "5673", carrierType: "0", locationId: "5673" },
    //     { carrierId: "5669", carrierType: "0", locationId: "5669" },
    //     { carrierId: "5665", carrierType: "0", locationId: "5665" },
    //     { carrierId: "5661", carrierType: "0", locationId: "5661" },
    //     { carrierId: "5657", carrierType: "0", locationId: "5657" },
    //     { carrierId: "5600", carrierType: "0", locationId: "5600" },
    //     { carrierId: "5596", carrierType: "0", locationId: "5596" },
    //     { carrierId: "5592", carrierType: "0", locationId: "5592" },
    //     { carrierId: "5588", carrierType: "0", locationId: "5588" },
    //     { carrierId: "5584", carrierType: "0", locationId: "5584" },
    //     { carrierId: "5580", carrierType: "0", locationId: "5580" },
    //     { carrierId: "5578", carrierType: "0", locationId: "5578" },
    //     { carrierId: "5522", carrierType: "0", locationId: "5522" },
    //     { carrierId: "5518", carrierType: "0", locationId: "5518" },
    //     { carrierId: "5514", carrierType: "0", locationId: "5514" },
    //     { carrierId: "5510", carrierType: "0", locationId: "5510" },
    //     { carrierId: "5506", carrierType: "0", locationId: "5506" },
    //     { carrierId: "5502", carrierType: "0", locationId: "5502" },
    //     { carrierId: "5500", carrierType: "0", locationId: "5500" },
    //     { carrierId: "5777", carrierType: "0", locationId: "5777" },
    //     { carrierId: "5773", carrierType: "0", locationId: "5773" },
    //     { carrierId: "5769", carrierType: "0", locationId: "5769" },
    //     { carrierId: "5765", carrierType: "0", locationId: "5765" },
    //     { carrierId: "5703", carrierType: "0", locationId: "5703" },
    //     { carrierId: "5699", carrierType: "0", locationId: "5699" },
    //     { carrierId: "5695", carrierType: "0", locationId: "5695" },
    //     { carrierId: "5763", carrierType: "0", locationId: "5763" },
    //     { carrierId: "5759", carrierType: "0", locationId: "5759" },
    //     { carrierId: "5755", carrierType: "0", locationId: "5755" },
    //     { carrierId: "5693", carrierType: "0", locationId: "5693" },
    //     { carrierId: "5689", carrierType: "0", locationId: "5689" },
    //     { carrierId: "5685", carrierType: "0", locationId: "5685" },
    //     { carrierId: "5614", carrierType: "0", locationId: "5614" },
    //     { carrierId: "5610", carrierType: "0", locationId: "5610" },
    //     { carrierId: "5606", carrierType: "0", locationId: "5606" },
    //     { carrierId: "5604", carrierType: "0", locationId: "5604" },
    //     { carrierId: "5536", carrierType: "0", locationId: "5536" },
    //     { carrierId: "5532", carrierType: "0", locationId: "5532" },
    //     { carrierId: "5528", carrierType: "0", locationId: "5528" },
    //     { carrierId: "5526", carrierType: "0", locationId: "5526" },
    //     { carrierId: "5630", carrierType: "0", locationId: "5630" },
    //     { carrierId: "5626", carrierType: "0", locationId: "5626" },
    //     { carrierId: "5622", carrierType: "0", locationId: "5622" },
    //     { carrierId: "5618", carrierType: "0", locationId: "5618" },
    //     { carrierId: "5552", carrierType: "0", locationId: "5552" },
    //     { carrierId: "5548", carrierType: "0", locationId: "5548" },
    //     { carrierId: "5544", carrierType: "0", locationId: "5544" },
    //     { carrierId: "5540", carrierType: "0", locationId: "5540" }
    //   ],
    //   "count": 45
    // }

    if (!res?.data) return

    res.data.forEach(e => {
      if (e.carrierType !== '0' && e.carrierType !== '1') return

      const position = getPositionByKaxiaLocation(e.locationId)

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

function getPositionByCoordinate(c) {
  const coordinate = Number(c)
  const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < coordinate && e.endCoordinate > coordinate)
  const lineMap = STATE.sceneList.linePosition[map.name.replace('_', '-')]
  const lineProgress = (coordinate - map.startCoordinate) / (map.endCoordinate - map.startCoordinate)
  const index = Math.floor(lineMap.length * lineProgress)
  return {
    line: map.name.replace('_', '-'),
    lineIndex: index
  }
}


// render
let j = 0
render()
function render() {
  requestAnimationFrame(render)


  // for(let i = 0; i < 10000000; i++) {
  //   j += i
  // }

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
  GetData,
  cameraAnimation,
  loadGUI,
  handleLine,
  initMockSkyCar,
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
  initKaxia,
  getPositionByCoordinate,
  getBayState
}
