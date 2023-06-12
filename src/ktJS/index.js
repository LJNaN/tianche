import { API } from './API.js'
import { CACHE } from './CACHE.js'
import { STATE } from './STATE.js'
import { DATA } from './DATA.js'

let container

// 原始加载方式
export const sceneOnLoad = ({ domElement, callback }) => {
  container = new Bol3D.Container({
    publicPath: STATE.PUBLIC_PATH,
    container: domElement,
    viewState: 'orbit',
    bloomEnabled: false,
    cameras: {
      orbitCamera: {
        position: [STATE.initialState.position.x, STATE.initialState.position.y, STATE.initialState.position.z],
        near: 1,
        far: 300,
        fov: 30
      }
    },
    controls: {
      orbitControls: {
        autoRotate: false,
        autoRotateSpeed: 1,
        target: [STATE.initialState.target.x, STATE.initialState.target.y, STATE.initialState.target.z],
        // minDistance: 0,
        // maxDistance: 2500,
        maxPolarAngle: Math.PI * 0.44,
        minPolarAngle: Math.PI * 0.05,
        enableDamping: true,
        dampingFactor: 0.05,
      }
    },
    lights: {
      directionLights: [{ color: 0xedeacc, intensity: 1.0, position: [20.3, 70, 40.2], mapSize: [4096, 4096], near: 10, far: 15000, bias: -0.001, distance: 8000 }],
      ambientLight: {
        color: '#ffffff',
        intensity: 0
      }
    },
    background: {
      type: 'color',
      value: '#333333'
    },
    modelUrls: ['/model/白模.glb'],
    hdrUrls: ['/hdr/HDR.hdr'],
    enableShadow: false,
    antiShake: false,
    // fog: {
    //   color: '#2c4027',
    //   intensity: 0.00022
    // },
    toneMapping: {
      toneMappingExposure: 0.596
    },
    outlineEnabled: false,
    dofEnabled: false,
    msaa: {
      supersampling: false
    },
    gammaEnabled: true,
    stats: true,
    // loadingBar: {
    //   show: true,
    //   type: 10
    // }

    onLoad: (evt) => {
      CACHE.container = evt
      window.container = evt

      evt.sceneModels[0].scale.set(2, 2, 2)
      evt.sceneModels[0].traverse((m) => {
        if (m.isMesh) {
          const matOpts = Object.assign({ envMap: evt.envMap }, DATA.materialOpts[m.name])

          m.material = new Bol3D.MeshStandardMaterial(matOpts)
        }
      })

      API.loadGUI()
      callback && callback()
    }
  })

  /**
   * 出于性能考虑，container中的clickObjects不再自动添加，需要在加载模型时手动添加，注意！！！
   */
  const events = new Bol3D.Events(container)
  events.ondbclick = (e) => { }
  events.onhover = (e) => { }
}

// 通过配置文件加载
export const loadSceneByJSON = ({ domElement, callback }) => {
  fetch(`${STATE.PUBLIC_PATH}/editor/bol3d(2).json`) // 配置文件路径
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
      container.loadModelsByUrl({
        modelUrls: jsonParser.modelUrls,
        onProgress: (model, evt) => {
          // console.log('progress', model)
        },
        onLoad: (evt) => {
          // console.log('onload', evt)
          window.container = evt

          /**
           *  根据jsonParser.nodes中的节点更新3D场景，注意，调用该方法会覆盖onProgress中的模型编辑操作
           *  因此，想要在代码中二次编辑模型，需在该方法调用之后再调用
           */
          evt.updateSceneByNodes(jsonParser.nodes[0])

          /**
          * updateSceneByNodes(node, duration, callback)
          * @node: jsonParser解析后的节点
          * @duration: 相机过渡动画执行时间，默认为0不执行
          * @callback: 更新完成回调
          */
          // evt.updateSceneByNodes(jsonParser.nodes[0] , 800 , () => {
          //   console.log('update finish')
          // })

          evt.scene.traverse(c => {
            if (c.isMesh && c.name === 'Line001') {
              c.material.opacity = .3
              evt.addBloom(c)
            }
          })
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
