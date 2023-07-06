import { API } from './API.js'
import { CACHE } from './CACHE.js'
import { STATE } from './STATE.js'
import { DATA } from './DATA.js'
import TU from './js/threeUtils.js'
import { test } from '@/axios/api.ts'

let container

// 通过配置文件加载
export const loadSceneByJSON = ({ domElement, callback }) => {
  fetch(`${STATE.PUBLIC_PATH}/editor/bol3d.json`) // 配置文件路径
    .then((res) => {
      return res.json()
    })
    .then((result) => {
      const nodeData = result.data
      const fileList = result.fileList

      container = new Bol3D.Container({
        publicPath: STATE.PUBLIC_PATH,
        container: domElement,
        loadingBar: {
          type: '10',
          show: true
        },
        lights: {
          directionLights: [{
            color: 0xaccdff,
            intensity: 0.8,
            position: [50, 200, -90],
            mapSize: [2048, 2048],
            near: 0.01,
            far: 600,
            bias: -0.001,
            distance: 500,
            target: [0, 0, 0]
          }],
        }
      })

      const jsonParser = new Bol3D.JSONParser({
        container,
        modelUrls: fileList,
        publicPath: '/editor/',  // 节点解析，资源文件路径（包含hdr，天空盒，图片等）最终路径为STATE.PUBLICPATH加上这一段
        publicPath2: './assets/3d'
      })
      jsonParser.parseNodes(nodeData, jsonParser.nodes) // 解析节点, jsonParser.nodes存储了配置文件导出的所有节点信息
      container.loadModelsByUrl({
        publicPath: './assets/3d',
        modelUrls: jsonParser.modelUrls,
        onProgress: (model, evt) => {
          if (!evt.sceneList) {
            evt.sceneList = {}
            STATE.sceneList = evt.sceneList
            window.STATE = STATE
          }
          evt.sceneList[model.name] = model

          // 
        },
        onLoad: (evt) => {
          // 
          window.container = evt
          window.STATE = STATE
          CACHE.container = evt

          /**
           *  根据jsonParser.nodes中的节点更新3D场景，注意，调用该方法会覆盖onProgress中的模型编辑操作
           *  因此，想要在代码中二次编辑模型，需在该方法调用之后再调用
          */

          evt.updateSceneByNodes(jsonParser.nodes[0], 0, () => {
            // 开灯开阴影
            CACHE.container.directionLights[0].visible = true
            CACHE.container.directionLights[0].castShadow = true
            CACHE.container.scene.traverse(child => {
              if (child.isMesh) {
                if (child.name === 'di') {
                  child.receiveShadow = true
                } else if (child.name === 'ding') {
                  child.visible = false
                } else {
                  child.castShadow = true
                  child.receiveShadow = true
                }
              }
            })

            container.orbitCamera.position.set(STATE.initialState.position.x, STATE.initialState.position.y, STATE.initialState.position.z)
            container.orbitControls.target.set(STATE.initialState.target.x, STATE.initialState.target.y, STATE.initialState.target.z)

            // 天车不知道为什么放大不了，手动放大
            STATE.sceneList.tianche.scale.set(10, 10, 10)

            // 默认的设备隐藏
            const hiddenDevices = ['2LPjitai(W01)', 'huojia4', 'huojia2', 'OLUS', 'WWATA03V', 'WHWSA01', 'WMACB03', 'WSSP008', 'WTSTK01', 'WWATA02V', '2LPjitai(W01)', 'WBS002', 'WS0RA01(I01)', 'WS0RA01(I02)', 'WS0RA01', 'FOSB', 'FOUP']
            hiddenDevices.forEach(e => {
              STATE.sceneList[e].visible = false
            })

            // 主场景处理
            const di = STATE.sceneList.guidao.children.find(e => e.name === 'di')
            if (di) {
              di.material.transparent = true
              di.material.opacity = 0.68
            }

            TU.init(container, Bol3D)
            API.getData()
            API.getAnimationList()
            API.handleLine()
            API.initReflexFloor()
            API.initDeviceByMap()
            API.initSkyCar()
            API.initShelves()
            API.search()
            // API.testBox()
            // API.loadGUI()

            CACHE.container.loadingBar.style.visibility = 'hidden'
          })


          /**
          * updateSceneByNodes(node, duration, callback)
          * @node: jsonParser解析后的节点
          * @duration: 相机过渡动画执行时间，默认为0不执行
          * @callback: 更新完成回调
          */
          // evt.updateSceneByNodes(jsonParser.nodes[0] , 800 , () => {
          //   
          // })


        }
      })

      /**
       * 出于性能考虑，container中的clickObjects不再自动添加，需要在加载模型时手动添加，注意！！！
       */
      const events = new Bol3D.Events(container)
      events.ondbclick = (e) => { }
      events.onhover = (e) => { }
      events.onclick = (e) => {
        if (e.objects.length) {
          const obj = e.objects[0].object
          if (obj.userData.type === '天车') {
            API.search('天车', obj.userData.id)
            const instance = STATE.sceneList.skyCarList.find(e2 => e2.id === obj.userData.id)
            if (instance) {
              instance.initClickPopup()
            }
          }
        }
      }
    })
}
