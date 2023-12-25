import { VUEDATA } from "@/VUEDATA"
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
  animationOver = true        // 动画执行完毕
  isAnimateSoon = false       // 即将有动画
  oldPosition = null          // 上一次的position 主要是解决 lookat 闪烁的


  constructor(opt) {
    if (opt.coordinate != undefined) this.coordinate = opt.coordinate
    if (opt.id != undefined) this.id = opt.id
    this.initSkyCar()
    this.initPopup()
    this.setAnimation()
    this.setPosition()
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
          height: 4vh;
          width: 100%;
          background: url('./assets/3d/img/30.png') center / 100% 100% no-repeat;
          ">
          <p style="font-size: 2vh;">${items[i].name}</p>
          <p style="font-size: 2vh;">${items[i].value}</p>
        </div>`
      }

      textValue += `<div style="
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 0 5%;
        height: 4vh;
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
            height: 56vh;
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
            height: 100%;
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
          this.popup.visible = true
          this.clickPopup.parent.remove(this.clickPopup)
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
        }
      }
      init(data)
    })

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
    this.runSpeed = Math.round(((1 / (STATE.frameRate / 60)) * 1) * this.quickenSpeedTimes)

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

    const process = (this.coordinate - map.startCoordinate) / mapLong
    const lineIndex = Math.floor(linePosition.length * process)

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
    // 有特殊事件时
    if (this.isAnimateSoon) {
      this.isAnimateSoon = false
      const animateTargetMsg = this.history[Math.floor(VUEDATA.messageLen / 2)]
      const { position } = animateTargetMsg
      const line = DATA.pointCoordinateMap.find(e => e.startCoordinate < position && e.endCoordinate > position)
      if (!line) return

      const lineName = line.name.replace('_', '-')
      if (this.line === lineName) {
        const process1 = this.lineIndex / STATE.sceneList.linePosition[this.line].length
        const process2 = (position - line.startCoordinate) / (line.endCoordinate - line.startCoordinate)
        const processDifference = process2 - process1
        const timeDifference = this.history[Math.floor(VUEDATA.messageLen / 2)].time - this.history[VUEDATA.messageLen - 1].time


        if (processDifference < 0) {
          this.quickenSpeedTimes = 0

        } else {
          const catchUpIndex = processDifference * STATE.sceneList.linePosition[lineName].length
          this.quickenSpeedTimes = (catchUpIndex / STATE.frameRate) / (timeDifference / 1000)
        }

      } else {
        this.quickenSpeedTimes = 3
      }

    } else {
      let totalIndex = (STATE.sceneList.linePosition[this.line]?.length - this.lineIndex) || 0
      this.nextLine.forEach(e => {
        const item = STATE.sceneList.linePosition[e.replace('_', '-')]
        if (!item) return
        totalIndex += item.length
      })
      this.quickenSpeedTimes = totalIndex > 1000 ? 3 : 1
    }


    if (this_.run && this_.animationOver) {
      if (this_.line && STATE.sceneList.linePosition[this_.line]) {
        // 如果前面还有路，就往前走
        if (this_.lineIndex < STATE.sceneList.linePosition[this_.line].length - this_.runSpeed) {
          this_.lineIndex += this_.runSpeed

          // 如果这根线到尽头了，找nextLine
        } else if (this_.nextLine.length) {
          this_.line = this_.nextLine[0].replace('_', '-')
          this_.lineIndex = 0
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
      // const progress = this_.lineIndex / STATE.sceneList.linePosition[this_.line].length
      // const thisLineMesh = STATE.sceneList.lineList.find(e => e.name === this_.line)
      // if (progress && thisLineMesh) {
      //   thisLineMesh.material.uniforms.progress.value = progress
      // }

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