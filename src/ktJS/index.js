import { API } from './API.js'
import { CACHE } from './CACHE.js'
import { STATE } from './STATE.js'
import { GLOBAL } from '@/GLOBAL.js'
import { UTIL } from './UTIL.js'

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
          if (!evt.sceneList) {
            evt.sceneList = STATE.sceneList
            window.STATE = STATE
          }
          evt.sceneList[model.name] = model

          
          GLOBAL.loadedModelNum++
          GLOBAL.loadingPercent.value = Math.floor(GLOBAL.loadedModelNum / GLOBAL.modelNum * 100) - 1
        },
        onLoad: (evt) => {
          window.container = evt
          window.STATE = STATE
          window.CACHE = CACHE
          window.API = API
          CACHE.container = evt

          evt.updateSceneByNodes(jsonParser.nodes[0], 0, () => {
          
            API.afterOnload(evt)
            GLOBAL.loadingPercent.value = 100
            // UTIL.testBox()
            // UTIL.loadGUI()
          })
        }
      })

      /**
       * 出于性能考虑，container中的clickObjects不再自动添加，需要在加载模型时手动添加，注意！！！
       */
      const events = new Bol3D.Events(container)
      events.onclick = (e) => { }
      events.onhover = (e) => { }
      events.ondblclick = (e) => {
        API.dbClickFunc(e)
      }
    })
}