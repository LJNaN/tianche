import { API } from './API.js'
import { CACHE } from './CACHE.js'
import { STATE } from './STATE.js'
import { DATA } from './DATA.js'
import TU from './js/threeUtils.js'
import * as TWEEN from '@tweenjs/tween.js'
import { progress } from '@/utils/progress.js'
import { VUEDATA } from '@/VUEDATA.js'
import bus from '@/utils/mitt.js'

let container
let loadedNum = 0
let totalNum = 18

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
        // loadingBar: {
        //   type: '10',
        //   show: true
        // },
        lights: {
          directionLights: [{
            color: 0xaccdff,
            intensity: 0.5,
            position: [50, 200, -90],
            mapSize: [2048, 2048],
            near: 0.01,
            far: 600,
            bias: -0.001,
            distance: 500,
            target: [0, 0, 0]
          }],
        },
        stats: false
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
          loadedNum++
          progress.update((loadedNum / totalNum) * 100)

          if (!evt.sceneList) {
            evt.sceneList = STATE.sceneList
            window.STATE = STATE
          }
          evt.sceneList[model.name] = model

          // 
        },
        onLoad: (evt) => {
          // 
          window.container = evt
          window.STATE = STATE
          window.CACHE = CACHE
          CACHE.container = evt

          /**
           *  根据jsonParser.nodes中的节点更新3D场景，注意，调用该方法会覆盖onProgress中的模型编辑操作
           *  因此，想要在代码中二次编辑模型，需在该方法调用之后再调用
          */

          evt.updateSceneByNodes(jsonParser.nodes[0], 0, () => {
            // 左右键行为
            // CACHE.container.orbitControls.mouseButtons = {
            //   LEFT: Bol3D.MOUSE.PAN,
            //   MIDDLE: Bol3D.MOUSE.DOLLY,
            //   RIGHT: Bol3D.MOUSE.ROTATE
            // }


            // 开灯开阴影
            CACHE.container.directionLights[0].visible = true
            // CACHE.container.directionLights[0].castShadow = true
            // CACHE.container.scene.traverse(child => {
            //   if (child.isMesh) {
            //     if (child.name === 'di') {
            //       child.receiveShadow = true
            //     } else if (child.name === 'ding') {
            //       child.visible = false
            //     } else {
            //       child.castShadow = true
            //       // child.receiveShadow = true
            //     }
            //   }
            // })

            container.orbitCamera.position.set(STATE.initialState.position.x, STATE.initialState.position.y, STATE.initialState.position.z)
            container.orbitControls.target.set(STATE.initialState.target.x, STATE.initialState.target.y, STATE.initialState.target.z)

            // 天车不知道为什么放大不了，手动放大
            STATE.sceneList.tianche.scale.set(10, 10, 10)
            // OLUS放大
            STATE.sceneList.OLUS.scale.set(30, 30, 30)

            // 默认的设备隐藏
            const hiddenDevices = ['2LPjitai(W01)', 'huojia4', 'huojia2', 'OLUS', 'WWATA03V', 'WHWSA01', 'WMACB03', 'WSSP008', 'WTSTK01', 'WWATA02V', '2LPjitai(W01)', 'WBS002', 'WS0RA01(I01)', 'WS0RA01(I02)', 'WS0RA01', 'FOSB', 'FOUP']
            hiddenDevices.forEach(e => {
              STATE.sceneList[e].visible = false
            })

            // 主场景处理
            STATE.sceneList.guidao.traverse(e => {
              if (e.isMesh && e.name === 'di') {
                // 地板马赛克处理
                // const map = e.material.map.clone()
                e.material = new Bol3D.MeshLambertMaterial({ color: '#717880' })
                // e.material.map = map
                // e.material.map.needsUpdate = true
              }
            })

            // WBS002 处理
            STATE.sceneList.WBS002.children[1].position.x = 0
            STATE.sceneList.WBS002.children[1].position.z = 0

            // editor 中 outline 处理
            CACHE.container.outlinePass.hiddenEdgeColor = new Bol3D.Color(0.95, 0.41, 0.16)
            CACHE.container.outlinePass.visibleEdgeColor = new Bol3D.Color(0.95, 0.41, 0.16)
            CACHE.container.outlinePass.pulsePeriod = 1



            TU.init(container, Bol3D)
            API.getData()
            API.initKaxia()
            API.getAnimationList()
            API.handleLine()
            // API.initReflexFloor()
            // API.initSkyCar()
            API.initDeviceByMap()
            API.initShelves()
            API.search()


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

            API.instantiationGroupInfo(shalves4, 'shalves4', CACHE.container)
            API.instantiationGroupInfo(shalves2, 'shalves2', CACHE.container)



            //实例化
            // console.log(
            //   "CACHE\n",
            //   '实例转换坐标、缩放、旋转信息\n', CACHE.instanceTransformInfo, '\n',
            //   '实例转换外观、形状信息\n', CACHE.instanceMeshInfo, '\n',
            //   '已删除的模型\n', CACHE.removed
            // );

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
              // instanceMesh.castShadow = true
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


            progress.remove()
            // API.testBox()
            // API.loadGUI()
            // CACHE.container.loadingBar.style.visibility = 'hidden'
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
      events.onclick = (e) => { }
      events.onhover = (e) => { }
      events.ondblclick = (e) => {
        if (e.objects.length) {
          const obj = e.objects[0].object

          if (VUEDATA.isEditorMode.value) {
            if (obj.userData.type === '机台') {
              const obj2 = CACHE.container.scene.children.find(e2 =>
                e2.userData.id === obj.userData.id &&
                e2.userData.deviceType === obj.userData.deviceType
              )
              bus.$emit('device', obj2)
            }

          } else {

            if (obj.userData.type === '天车') {
              API.search('天车', obj.userData.id)
              const instance = STATE.sceneList.skyCarList.find(e2 => e2.id === obj.userData.id)
              if (instance) {
                STATE.sceneList.skyCarList.forEach(e2 => {
                  e2.popup.visible = true
                  if (e2.clickPopup) {
                    e2.clickPopup.element.remove()
                    e2.clickPopup.parent.remove(e2.clickPopup)
                    e2.clickPopup = null
                  }
                })
                instance.initClickPopup()
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
    })
}