import { VUEDATA } from "@/VUEDATA"
import { API } from '@/ktJS/API.js'
import { DATA } from '@/ktJS/DATA.js'
import { GetCarrierInfo, OhtFindCmdId, CarrierFindCmdId, GetEqpStateInfo, GetRealTimeEqpState, GetRealTimeCmd } from '@/axios/api.js'

// 天车类
export default class SkyCar {
  coordinate = 0              // 当前坐标
  history = []                // 10条历史数据
  state = 0                   // 状态
  id = ''                     // id
  skyCarMesh = null           // 天车模型
  popup = null                // 默认弹窗
  clickPopup = null           // 点击之后的弹窗
  mixer = null                // 模型动画管理器
  actions = null              // 模型动画
  animationSpeed = 1          // 模型动画速度
  animationSpeedTimes = 0.05  // 模型动画速度的倍速
  catch = null                // 当前抓取的卡匣
  catchDirection = 'left'     // 抓取方向
  alert = false               // 是否为报警状态
  run = true                  // 天车是否可以走
  runSpeed = 2                // 天车实际行走的速度
  quickenSpeedTimes = 2       // 天车追赶时的倍速
  line = ''                   // 是在哪一根线上
  lineIndex = 0               // 当前线上面的索引
  nextLine = []               // 下几根要走的轨道
  passLine = []               // 走过的近5根轨道
  animationOver = true        // 动画执行完毕
  oldPosition = null          // 上一次的position 主要是解决 lookat 闪烁的
  _focus = false              // 是不是聚焦在这个车上
  startPopup = null           // 起点标识弹窗
  endPopup = null             // 终点标识弹窗
  posPath = null              // 抓放线路

  isAnimateSoon = false       // 即将有动画
  fastRun = false             // 即将有动画时  快速前进
  targetCoordinate = -1       // 有动画时的目标坐标


  constructor(opt) {
    if (opt.coordinate != undefined) this.coordinate = opt.coordinate
    if (opt.id != undefined) this.id = opt.id
    this.initSkyCar()
    this.initPopup()
    this.setAnimation()
    this.setPosition()
  }

  get focus() {
    return this._focus
  }

  set focus(val) {
    this._focus = val

    if (!val) {
      if (this.startPopup && this.startPopup.parent) {
        this.startPopup.parent.remove(this.startPopup)
        this.startPopup = null
      }
      if (this.endPopup && this.endPopup.parent) {
        this.endPopup.parent.remove(this.endPopup)
        this.endPopup = null
      }
    }
  }

  initSkyCar() {
    this.skyCarMesh = STATE.sceneList.tianche.clone()
    this.skyCarMesh.position.set(235, 28.3, 231)
    this.skyCarMesh.rotation.y = -Math.PI / 2
    this.skyCarMesh.visible = true
    CACHE.container.scene.add(this.skyCarMesh)

    this.skyCarMesh.traverse(e => {
      if (e.isMesh) {
        e.userData.type = '天车'
        e.userData.id = this.id
        CACHE.container.clickObjects.push(e)
      }
    })

    this.runRender()
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
          transform: translate(-50%,60%);
        ">
        </div>
      </div>
    `,
      // animation: arrowJump 1s linear infinite;
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
        e.focus = false
        e.popup.visible = true
        if (e.clickPopup) {
          if (e.clickPopup.parent) {
            e.clickPopup.parent.remove(e.clickPopup)
          }
          e.clickPopup.element.remove()
          e.clickPopup = null
        }
      })

      API.search('天车', this.id)
      this.initClickPopup()

      // 车子在当前轨道上走了多少进度
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
      const progress = this.lineIndex / STATE.sceneList.linePosition[this.line].length
      const thisLineMesh = STATE.sceneList.lineList.find(e => e.name === this.line)
      if (progress && thisLineMesh) {
        thisLineMesh.material.uniforms.currentFocusLineStartPoint.value = this.line.split('-')[0]
        thisLineMesh.material.uniforms.currentFocusLineEndPoint.value = this.line.split('-')[1]
        thisLineMesh.material.uniforms.progress.value = progress
      }
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

    CACHE.tempCameraState = {
      position: CACHE.container.orbitCamera.position.clone(),
      target: CACHE.container.orbitControls.target.clone()
    }

    const init = (data) => {
      this.focus = true

      if (this.clickPopup && this.clickPopup.parent) {
        this.clickPopup.parent.remove(this.clickPopup)
      }

      const name = 'click_popup_天车_' + this.id
      const items = [
        { name: '卡匣ID', value: '--' },
        { name: 'COMMAND ID', value: '--' },
        { name: 'USER ID', value: '--' },
        { name: '起点', value: '--' },
        { name: '终点', value: '--' },
        { name: 'posPath', value: '--' },
        { name: '优先级', value: '--' },
        { name: '当前状态', value: '--' },
        { name: 'Alarm List:', value: [] }
      ]

      for (let key in data) {
        const item = items.find(e => e.name === key)
        if (item) {
          item.value = data[key]
        }
      }

      let textValue = ``
      for (let i = 0; i < items.length - 1; i++) {
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

      textValue += `<div style="
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 0 5%;
        width: 100%;
        background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
        ">
        <p style="font-size: 2vh;">Alarm List:</p>
      </div>`

      let alertValue = `<div style="display:flex; flex-direction: column;overflow-y:scroll;height:10vh;pointer-events:all;padding:0 5%;">`
      for (let i = 0; i < items[items.length - 1].value.length; i++) {
        alertValue += `<p style="word-break: break-all;user-select:text;">
          ${('NO' + (i + 1) + ': ')
          + (items[items.length - 1].value[i].alarmId || '--') + '/'
          + (items[items.length - 1].value[i].alarmCode || '--') + '/'
          + (items[items.length - 1].value[i].alarmData || '--') + '/'
          + (items[items.length - 1].value[i].alarmDescription || '--')
          }
        </p>`
      }
      alertValue += `</div>`


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
            width: 30vw;
            height: 60vh;
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
            ${this.id}
          </p>
  
          <div style="
            display: flex;
            flex-direction: column;
            width: 85%;
            margin: 4% auto 0 auto;
            height: 47vh;
            overflow: scroll;
            pointer-events: all;
          ">
          ${textValue}
          ${alertValue}
          </div>
        </div>
      </div>
      `,
        position: [0, 0, 0],
        className: 'popup3dclass popup3d_tianche',
        closeVisible: true,
        closeColor: "#FFFFFF",
        closeCallback: (() => {
          this.focus = false
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
          if (this.startPopup && this.startPopup.parent) this.startPopup.parent.remove(this.startPopup)
          if (this.endPopup && this.endPopup.parent) this.endPopup.parent.remove(this.endPopup)

          this.popup.visible = true
          this.clickPopup && this.clickPopup.parent && this.clickPopup.parent.remove(this.clickPopup)
          this.clickPopup = null
          STATE.currentPopup = null

          new Bol3D.TWEEN.Tween(CACHE.container.orbitCamera.position)
            .to(CACHE.tempCameraState.position, 800)
            .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
            .start()

          new Bol3D.TWEEN.Tween(CACHE.container.orbitControls.target)
            .to(CACHE.tempCameraState.target, 800)
            .easing(Bol3D.TWEEN.Easing.Quadratic.InOut)
            .start()
            .onComplete(() => {
              CACHE.container.orbitControls.enabled = true
              CACHE.container.orbitControls.saveState()
              CACHE.container.orbitControls.reset()
            })
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
    init()

    OhtFindCmdId(this.id).then(res => {
      const data = {}
      for (let key in res.data) {
        if (key === 'commandid') {
          data['COMMAND ID'] = res.data[key] || '--'
        } else if (key === 'priority') {
          data['优先级'] = res.data[key] || '--'
        } else if (key === 'sourceport') {
          data['起点'] = res.data[key] || '--'
        } else if (key === 'destport') {
          data['终点'] = res.data[key] || '--'
        } else if (key === 'status') {
          if (res.data[key] === '0') {
            // data['当前状态'] = '关闭'
            data['当前状态'] = DATA.skyCarStateColorMap.find(e => e.id === this.state).name
          } else if (res.data[key] === '1') {
            // data['当前状态'] = '开启'
            data['当前状态'] = DATA.skyCarStateColorMap.find(e => e.id === this.state).name
          } else {
            data['当前状态'] = '--'
          }
        } else if (key === 'alarmList') {
          data['Alarm List:'] = res?.data[key] || []
        } else if (key === 'createby') {
          data['USER ID'] = res.data[key] || '--'
        } else if (key === 'carrierid') {
          data['卡匣ID'] = res.data[key] || '--'
        } else if (key === 'pospath') {
          data['posPath'] = res.data[key] || '--'
        }
      }
      init(data)

      // 显示起点终点
      const startPointArr = DATA.MCS2ShelfMap.find(e => e.MSC === res.data.sourceport)
      const endtPointArr = DATA.MCS2ShelfMap.find(e => e.MSC === res.data.destport)
      this.showStartEndPositionImg(startPointArr?.port, endtPointArr?.port)

      // 轨道变色
      this.setCurrentLineState(res.data.pospath)
    })

  }

  // 显示起点和终点坐标的两个图标
  showStartEndPositionImg(start, end) {

    if (start) {
      const startP = API.getPositionByKaxiaLocation(start)
      if (startP) {
        const startPopup = new Bol3D.POI.Popup3DSprite({
          value: `
          <div style="
            pointer-events: all;
            margin:0;
            color: #ffffff;
          ">
    
            <div style="
              position: absolute;
              background: url('./assets/3d/img/66.png') center / 100% 100% no-repeat;
              width: 16vw;
              height: 26vh;
              transform: translate(-50%, -50%);
            ">
              <p style="font-size: 8vh;font-family: YouSheBiaoTiHei; text-align: center; margin-top: 20%;">${start}</p>
            </div>
          </div>
        `,
          position: [startP.position.x, startP.position.y + 20, startP.position.z],
          className: 'popup3dclass',
          closeVisible: false
        })

        startPopup.scale.set(0.05, 0.05, 0.05)
        startPopup.userData.port = start
        CACHE.container.scene.add(startPopup)
        this.startPopup = startPopup
      }
    }

    if (end) {
      const endP = API.getPositionByKaxiaLocation(end)
      if (endP) {
        const endPopup = new Bol3D.POI.Popup3DSprite({
          value: `
          <div style="
            pointer-events: all;
            margin:0;
            color: #ffffff;
          ">
    
            <div style="
              position: absolute;
              background: url('./assets/3d/img/65.png') center / 100% 100% no-repeat;
              width: 16vw;
              height: 26vh;
              transform: translate(-50%, -50%);
            ">
              <p style="font-size: 8vh;font-family: YouSheBiaoTiHei; text-align: center; margin-top: 20%;">${end}</p>
            </div>
          </div>
        `,
          position: [endP.position.x, endP.position.y + 20, endP.position.z],
          className: 'popup3dclass',
          closeVisible: false
        })

        endPopup.scale.set(0.05, 0.05, 0.05)
        endPopup.userData.port = end
        CACHE.container.scene.add(endPopup)
        this.endPopup = endPopup
      }
    }
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

  runRender() {
    requestAnimationFrame(this.runRender.bind(this))
    this.runSpeed = Math.round(this.quickenSpeedTimes)

    if (!this.run || !this.animationOver) return

    if (!this.line) {
      const lineInfo = this.findLine()
      if (!lineInfo) return

      this.line = lineInfo.line
      this.lineIndex = lineInfo.lineIndex
      return
    }

    this.setPosition()
  }

  findLine() {
    // 查找起始点、起始坐标
    const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < this.coordinate && e.endCoordinate > this.coordinate)
    if (!map) {
      return
    }

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
    if (!line) return

    const linePosition = STATE.sceneList.linePosition[line.name]
    if (!linePosition) return

    const progress = (this.coordinate - map.startCoordinate) / mapLong
    const lineIndex = Math.floor(linePosition.length * progress)

    return {
      line: line.name,
      lineIndex: lineIndex
    }
  }


  // cb 回调 后执行
  setPosition(cb) {
    const this_ = this

    if (this.history.length < VUEDATA.messageLen) { return }

    // 变速
    function computeQuickenSpeedTimes(skyCar, position) {
      const line = DATA.pointCoordinateMap.find(e => e.startCoordinate < position && e.endCoordinate > position)
      if (!line) return

      const lineName = line.name.replace('_', '-')

      if (skyCar.line === lineName) {
        const progress1 = skyCar.lineIndex / STATE.sceneList.linePosition[skyCar.line].length // 在当前轨道上的进度
        const progress2 = (position - line.startCoordinate) / (line.endCoordinate - line.startCoordinate) // 目标点在当前轨道上的进度
        const progressDifference = progress2 - progress1 // 进度差


        if (progressDifference > 0) {
          const catchUpIndex = progressDifference * STATE.sceneList.linePosition[lineName].length // 进度差有多少个index
          const speed = catchUpIndex / STATE.frameRate
          skyCar.quickenSpeedTimes = speed * 2

        } else {
          skyCar.quickenSpeedTimes = 0
        }

      } else {
        // 不在同一根轨道的话，就糟了老罪咯
        // 要去统计nextline 看看离他所谓的那个b点还有多少个index没有走
        if (skyCar.nextLine.includes(line.name)) {
          let totalIndex = 0
          for (let i = 0; i < skyCar.nextLine.length; i++) {
            if (skyCar.nextLine[i] !== line.name) {
              totalIndex += STATE.sceneList.linePosition[skyCar.nextLine[i].replace('_', '-')].length

            } else {
              const progress1 = skyCar.lineIndex / STATE.sceneList.linePosition[skyCar.line].length // 在当前轨道上的进度
              const progress2 = (position - line.startCoordinate) / (line.endCoordinate - line.startCoordinate) // 目标点在当前轨道上的进度
              const subIndex1 = (1 - progress1) * STATE.sceneList.linePosition[skyCar.line].length
              const subIndex2 = progress2 * STATE.sceneList.linePosition[line.name.replace('_', '-')].length
              totalIndex += subIndex1 + subIndex2
              break
            }
          }

          if (totalIndex > 0) {
            const speed = totalIndex / STATE.frameRate
            skyCar.quickenSpeedTimes = speed * 2
          } else {
            skyCar.quickenSpeedTimes = 0
          }

        } else {
          // 都查求不到这个轨道，随便吧
          skyCar.quickenSpeedTimes = 3
        }
      }
    }

    // 有特殊事件时
    if (this.isAnimateSoon) {
      this.isAnimateSoon = false
      const animateTargetMsg = this.history[0]
      const { position } = animateTargetMsg
      this.targetCoordinate = Number(position)
      computeQuickenSpeedTimes(this, position)

    } else if (this.fastRun) {
      // 每一帧都动态算一下 this.quickenSpeedTimes
      if (this.targetCoordinate) {
        computeQuickenSpeedTimes(this, this.targetCoordinate)
      }

    } else {
      // 看看前面有没有车
      let runFlag = true
      for (let i = 0; i < STATE.sceneList.skyCarList.length; i++) {
        if (STATE.sceneList.skyCarList[i].id === this.id) {
          continue
        }

        if (STATE.sceneList.skyCarList[i].line === this.line && (STATE.sceneList.skyCarList[i].lineIndex < (this.lineIndex + 100)) && (STATE.sceneList.skyCarList[i].lineIndex > this.lineIndex)) {
          this.quickenSpeedTimes = 0
          runFlag = false
          break
        }
      }

      if (runFlag) {
        let totalIndex = (STATE.sceneList.linePosition[this.line]?.length - this.lineIndex) || 0
        this.nextLine.forEach(e => {
          const item = STATE.sceneList.linePosition[e.replace('_', '-')]
          if (!item) return
          totalIndex += item.length
        })
        this.quickenSpeedTimes = totalIndex > 1000 ? 3 : 1
      }
    }


    if (this_.run && this_.animationOver) {
      if (this_.line && STATE.sceneList.linePosition[this_.line]) {
        // 如果前面还有路，就往前走
        if (this_.lineIndex < STATE.sceneList.linePosition[this_.line].length - this_.runSpeed) {
          this_.lineIndex += this_.runSpeed

          const map = DATA.pointCoordinateMap.find(e => e.name === this_.line.replace('-', '_'))
          if (map) {
            const progress = this_.lineIndex / (map.endCoordinate - map.startCoordinate)
            this_.coordinate = map.startCoordinate + (map.endCoordinate - map.startCoordinate) * progress
          }

          // 如果这根线到尽头了，找nextLine
        } else if (this_.nextLine.length) {
          this_.line = this_.nextLine[0].replace('_', '-')
          this_.lineIndex = 0

          const map = DATA.pointCoordinateMap.find(e => e.name === this_.line.replace('-', '_'))
          if (map) {
            this_.coordinate = map.startCoordinate
          }
          this.setCurrentLineState()
          this_.nextLine.splice(0, 1)
        }
      }

      // 沿着轨道往前走
      const linePosition = STATE.sceneList.linePosition[this_.line]
      if (!linePosition) return

      const currentPositionArray = linePosition[this_.lineIndex]
      if (!currentPositionArray) return

      const currentPosition = new Bol3D.Vector3(currentPositionArray[0] * STATE.sceneScale, 28.3, currentPositionArray[2] * STATE.sceneScale)
      const lookAtPosition = new Bol3D.Vector3(0, 0, 0)

      lookAtPosition.x = currentPosition.x
      lookAtPosition.y = currentPosition.y
      lookAtPosition.z = currentPosition.z

      // 车子在当前轨道上走了多少进度
      const progress = this_.lineIndex / STATE.sceneList.linePosition[this_.line].length
      const thisLineMesh = STATE.sceneList.lineList.find(e => e.name === this_.line)
      if (progress && thisLineMesh) {
        thisLineMesh.material.uniforms.progress.value = progress
      }

      // 解决闪烁问题
      if (!this_.oldPosition || currentPosition.x != this_.oldPosition.x || currentPosition.z != this_.oldPosition.z) {
        this_.skyCarMesh.lookAt(lookAtPosition)
        this_.skyCarMesh.position.set(currentPosition.x, currentPosition.y, currentPosition.z)
      }
      this_.oldPosition = currentPosition
      cb && cb()

    } else {
      cb && cb()
    }
  }

  // 轨道颜色
  setCurrentLineState(data) {
    if (!this.focus) return

    let pospath = null
    if (data) {
      this.posPath = data
      pospath = data
    } else {
      pospath = this.posPath
    }

    if (!pospath) return

    const pospassArr = pospath.split(',')
    const pathArr = pospassArr.slice(0, -1)

    const endPoint = pospassArr[pospassArr.length - 1]
    const thisLineIndex = pathArr.indexOf(this.line.split('-')[0])
    const nextPathSlice = pathArr.slice(thisLineIndex + 1, pathArr.length);
    const nextPathLineArr = nextPathSlice.slice(0, -1).map((val, i) => val + '-' + nextPathSlice[i + 1])


    // 复位
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

    // nextLine轨道
    const nextLineMeshArr = STATE.sceneList.lineList.filter(e =>
      nextPathLineArr.includes(e.name)
    )

    nextLineMeshArr.forEach(e => {
      e.material.uniforms.next.value = 1
    })

    // passLine轨道
    const pathPassLine = pathArr.slice(0, thisLineIndex + 1)
    const pathPassLineArr = pathPassLine.slice(0, -1).map((val, i) => val + '-' + pathPassLine[i + 1]);


    const passLineMeshArr = STATE.sceneList.lineList.filter(e =>
      pathPassLineArr.includes(e.name)
    )

    passLineMeshArr.forEach(e => {
      e.material.uniforms.pass.value = 1
    })

    STATE.sceneList.lineList.forEach(e => {
      if (e.name === this.line) {
        e.material.uniforms.next.value = 0
        e.material.uniforms.pass.value = 0
      }
      e.material.uniforms.currentFocusLineStartPoint.value = this.line.split('-')[0]
      e.material.uniforms.currentFocusLineEndPoint.value = this.line.split('-')[1]
    })


    // ===还有一段延伸出去的轨道，起点到终点那一段，也要变色
    const endPointLine = DATA.pointCoordinateMap.find(e => e.startCoordinate < Number(endPoint) && e.endCoordinate > Number(endPoint))

    if (endPointLine) {
      const endPointMesh = STATE.sceneList.lineList.find(e => e.name === endPointLine.name.replace('_', '-'))
      if (endPointMesh) {
        const progress = (Number(endPoint) - endPointLine.startCoordinate) / (endPointLine.endCoordinate - endPointLine.startCoordinate)
        if (progress > 0) {
          endPointMesh.material.uniforms.isEndLine.value = 1
          endPointMesh.material.uniforms.endLineProgress.value = progress
        }
      }
    }

    // ===还有起始点的轨道，他没有startPosition，要根据ohtport算出来
    if (pathArr.length && this.startPopup?.userData?.port) {
      const startPositionMap = DATA.MCS2ShelfMap.find(e => e.port === this.startPopup.userData.port)

      if (startPositionMap) {
        const lineMap = DATA.pointCoordinateMap.find(e => e.startCoordinate < startPositionMap.position && e.endCoordinate > startPositionMap.position)

        if (lineMap) {
          const progress = (startPositionMap.position - lineMap.startCoordinate) / (lineMap.endCoordinate - lineMap.startCoordinate)
          const startLineMesh = STATE.sceneList.lineList.find(e => e.name === lineMap.name.replace('_', '-'))

          if (startLineMesh) {
            startLineMesh.material.uniforms.isStartLine.value = 1
            startLineMesh.material.uniforms.startLineProgress.value = progress
          }
        }
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
      requestAnimationFrame(animate)

      this_.animationSpeed = (1 / (STATE.frameRate / 60)) * this_.animationSpeedTimes

      this_.mixer.update(this_.animationSpeed)
    }
  }

  setAlert(type) {
    // type
    // true: 开启报警
    // false: 关闭报警
    const this_ = this

    if (type && !this.alert) {
      this.alert = true
    } else {
      this.alert = false
    }

    const nameArr = ['tianche_9', 'tianche_2', 'tianche_7', 'tianche_8', 'tianche_20']

    if (this.alert) {
      this.skyCarMesh.traverse(e => {
        if (e.isMesh && nameArr.includes(e.name)) {
          if (!e.userData.color) {
            e.userData.color = e.material.color.clone()
          }
        }
      })
      render()
    }

    function render() {
      if (this_.alert) {

        requestAnimationFrame(render)
        this_.skyCarMesh.traverse(e => {
          if (e.isMesh && nameArr.includes(e.name)) {
            const redColor = Math.abs(Math.sin(STATE.clock.getElapsedTime() * 3)) + 1
            e.material.color.r = e.userData.color.r * redColor
          }
        })

      } else {
        this_.skyCarMesh.traverse(e => {
          if (e.isMesh && nameArr.includes(e.name) && e.userData.color) {
            e.material.color = e.userData.color.clone()
          }
        })
      }
    }
  }


  // 设置伸缩方法
  down(where = '在货架上', cb) {
    const this_ = this
    this.animationOver = false
    this.animationSpeedTimes = 0.06
    if (this.catchDirection === 'right') {
      this.actions.shen1.enabled = false
      this.actions.suo1.enabled = false
      this.actions.fang1.enabled = false
      this.actions.shou1.enabled = false

      this.actions.shen.enabled = true
      this.actions.suo.enabled = false
      this.actions.fang.enabled = false
      this.actions.fang.paused = false
      this.actions.shou.enabled = false

      this.actions.shen.clampWhenFinished = false
      this.actions.shen.reset().play()
    } else {
      this.actions.shen.enabled = false
      this.actions.suo.enabled = false
      this.actions.fang.enabled = false
      this.actions.shou.enabled = false

      this.actions.shen1.enabled = true
      this.actions.suo1.enabled = false
      this.actions.fang1.enabled = false
      this.actions.fang1.paused = false
      this.actions.shou1.enabled = false

      this.actions.shen1.clampWhenFinished = false
      this.actions.shen1.reset().play()
    }


    this.mixer.addEventListener('finished', function finished_shen(e) {
      if (e.action.name === 'shen' || e.action.name === 'shen1') {
        this_.animationSpeedTimes = (where === '在机台上' ? 0.01 : 0.0018)
        if (this_.catchDirection === 'right') {
          this_.actions.shen.enabled = false
          this_.actions.fang.enabled = true
          this_.actions.fang.time = 0
          this_.actions.fang.reset().play()
        } else {
          this_.actions.shen1.enabled = false
          this_.actions.fang1.enabled = true
          this_.actions.fang1.time = 0
          this_.actions.fang1.reset().play()
        }

        let renderFlag = true
        render()
        function render() {
          if (renderFlag) {
            requestAnimationFrame(render)
            if (this_.catchDirection === 'right') {
              if (this_.actions.fang.time > (where === '在机台上' ? 2.3 : 0.32)) {
                this_.actions.fang.time = (where === '在机台上' ? 2.3 : 0.32)
                this_.actions.fang.paused = true
                this_.mixer.removeEventListener('finished', finished_shen)
                renderFlag = false
                cb && cb()

                setTimeout(() => {
                  this_.up(where, () => {
                    this_.animationOver = true
                  })
                }, 300)

              }
            } else {
              if (this_.actions.fang1.time > (where === '在机台上' ? 2.3 : 0.32)) {
                this_.actions.fang1.time = (where === '在机台上' ? 2.3 : 0.32)
                this_.actions.fang1.paused = true
                this_.mixer.removeEventListener('finished', finished_shen)
                renderFlag = false
                cb && cb()

                setTimeout(() => {
                  this_.up(where, () => {
                    this_.animationOver = true
                  })
                }, 300)
              }
            }
          }
        }
      }
    })
  }

  up(where = '在货架上', cb) {
    const this_ = this
    this.animationSpeedTimes = (where === '在机台上' ? 0.01 : 0.002)
    if (this.catchDirection === 'right') {
      this.actions.shou1.enabled = false
      this.actions.fang1.enabled = false
      this.actions.shen1.enabled = false
      this.actions.suo1.enabled = false

      this.actions.shou.enabled = true
      this.actions.fang.enabled = false
      this.actions.shen.enabled = false
      this.actions.suo.enabled = false

      this.actions.shou.paused = false
      this.actions.shou.reset()
      this.actions.shou.time = (where === '在机台上' ? 0.87 : 2.9)
      this.actions.shou.play()
    } else {
      this.actions.shou.enabled = false
      this.actions.fang.enabled = false
      this.actions.shen.enabled = false
      this.actions.suo.enabled = false

      this.actions.shou1.enabled = true
      this.actions.fang1.enabled = false
      this.actions.shen1.enabled = false
      this.actions.suo1.enabled = false

      this.actions.shou1.paused = false
      this.actions.shou1.reset()
      this.actions.shou1.time = (where === '在机台上' ? 0.87 : 2.41)
      this.actions.shou1.play()
    }


    this.mixer.addEventListener('finished', function finished_suo(e) {
      if (e.action.name === 'shou' || e.action.name === 'shou1') {
        this_.animationSpeedTimes = 0.06
        if (this_.catchDirection === 'right') {
          this_.actions.shou.enabled = false
          this_.actions.suo.enabled = true
          this_.actions.suo.reset().play()
        } else {
          this_.actions.shou1.enabled = false
          this_.actions.suo1.enabled = true
          this_.actions.suo1.reset().play()
        }
        this_.actions.kakoushen.reset().play()
        this_.actions.dangbanshen.reset().play()

      } else if (e.action.name === 'suo' || e.action.name === 'suo1') {
        this_.mixer.removeEventListener('finished', finished_suo)
        cb && cb()
      }
    })
  }
}