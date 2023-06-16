import { API } from './API.js'
import { CACHE } from './CACHE.js'
import { STATE } from './STATE.js'
import { DATA } from './DATA.js'
import TU from './threeUtils.js'

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
      })

      const jsonParser = new Bol3D.JSONParser({
        container,
        modelUrls: fileList,
        publicPath: '/editor/'  // 节点解析，资源文件路径（包含hdr，天空盒，图片等）最终路径为STATE.PUBLICPATH加上这一段
      })
      jsonParser.parseNodes(nodeData, jsonParser.nodes) // 解析节点, jsonParser.nodes存储了配置文件导出的所有节点信息
      console.log('jsonParser.modelUrls,',jsonParser.modelUrls);
      container.loadModelsByUrl({
        modelUrls: jsonParser.modelUrls,
        onProgress: (model, evt) => {
          if (!evt.sceneList) {
            evt.sceneList = {}
            STATE.sceneList = evt.sceneList
            window.STATE = STATE
          }
          evt.sceneList[model.name] = model

          // console.log('progress', model)
        },
        onLoad: (evt) => {
          // console.log('onload', evt)
          window.container = evt
          CACHE.container = evt

          /**
           *  根据jsonParser.nodes中的节点更新3D场景，注意，调用该方法会覆盖onProgress中的模型编辑操作
           *  因此，想要在代码中二次编辑模型，需在该方法调用之后再调用
          */

          evt.updateSceneByNodes(jsonParser.nodes[0], 0, () => {
            evt.sceneList.guidao.scale.set(STATE.sceneScale, STATE.sceneScale, STATE.sceneScale)
            // container.orbitCamera.position.set(STATE.initialState.position.x, STATE.initialState.position.y, STATE.initialState.position.z)
            // container.orbitControls.target.set(STATE.initialState.target.x, STATE.initialState.target.y, STATE.initialState.target.z)
            console.log('evt.sceneList.guidao: ', evt.sceneList.guidao);
            STATE.sceneList.tianche.visible = false

            TU.init(container, Bol3D)
            API.handleLine()
            API.initSkyCar()
            // API.testBox()
            // API.loadGUI()
          })


          /**
          * updateSceneByNodes(node, duration, callback)
          * @node: jsonParser解析后的节点
          * @duration: 相机过渡动画执行时间，默认为0不执行
          * @callback: 更新完成回调
          */
          // evt.updateSceneByNodes(jsonParser.nodes[0] , 800 , () => {
          //   console.log('update finish')
          // })


        }
      })

      /**
       * 出于性能考虑，container中的clickObjects不再自动添加，需要在加载模型时手动添加，注意！！！
       */
      const events = new Bol3D.Events(container)
      events.ondbclick = (e) => { }
      events.onhover = (e) => { }
    })
}
