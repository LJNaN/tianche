import SkyCar from './SkyCar.js'
import { VUEDATA } from '@/VUEDATA.js'
import { GetCarrierInfo, OhtFindCmdId, CarrierFindCmdId, GetEqpStateInfo, GetRealTimeEqpState, GetRealTimeCmd } from '@/axios/api.js'


// 数据驱动
export default function drive(wsMessage) {
  // 处理天车
  if (wsMessage?.VehicleInfo?.length) {
    wsMessage.VehicleInfo.forEach(e => {
      if (!e.ohtID) return
      const { lastTime, position, location, ohtStatus_Loading, ohtStatus_Quhuoda, ohtStatus_Roaming, ohtStatus_Quhuoxing, ohtStatus_Idle, ohtStatus_IsHaveFoup, therfidFoup, ohtStatus_MoveEnable, ohtStatus_Fanghuoxing, ohtStatus_Fanghuoda, ohtStatus_UnLoading, ohtID } = e


      let skyCar = STATE.sceneList.skyCarList.find(car => car.id === e.ohtID)

      if (skyCar) {
        // 处理变化
        // 去个重
        if (skyCar.history.length) {
          if (
            skyCar.history[0].lastTime == lastTime &&
            skyCar.history[0].position == position &&
            skyCar.history[0].location == location &&
            skyCar.history[0].ohtStatus_Loading == ohtStatus_Loading &&
            skyCar.history[0].ohtStatus_Quhuoda == ohtStatus_Quhuoda &&
            skyCar.history[0].ohtStatus_Roaming == ohtStatus_Roaming &&
            skyCar.history[0].ohtStatus_Idle == ohtStatus_Idle &&
            skyCar.history[0].ohtStatus_IsHaveFoup == ohtStatus_IsHaveFoup &&
            skyCar.history[0].therfidFoup == therfidFoup &&
            skyCar.history[0].ohtStatus_MoveEnable == ohtStatus_MoveEnable &&
            skyCar.history[0].ohtStatus_Fanghuoxing == ohtStatus_Fanghuoxing &&
            skyCar.history[0].ohtStatus_Fanghuoda == ohtStatus_Fanghuoda &&
            skyCar.history[0].ohtStatus_UnLoading == ohtStatus_UnLoading &&
            skyCar.history[0].ohtID == ohtID
          ) { return }
        }

        skyCar.history.unshift({
          time: new Date() * 1,
          lastTime,
          position,
          location,
          ohtStatus_Loading,
          ohtStatus_Quhuoda,
          ohtStatus_Roaming,
          ohtStatus_Quhuoxing,
          ohtStatus_Idle,
          ohtStatus_IsHaveFoup,
          therfidFoup,
          ohtStatus_MoveEnable,
          ohtStatus_Fanghuoxing,
          ohtStatus_Fanghuoda,
          ohtStatus_UnLoading,
          ohtID
        })


        // 保持去重后的数据在X条
        if (skyCar.history.length < VUEDATA.messageLen + 1) { return }
        skyCar.history.splice(VUEDATA.messageLen, 1)


        // 处理颜色

        if (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_OnlineControl === '0') { // 离线
          if (skyCar.state != 5) {
            skyCar.state = 5
            skyCar.setPopupColor()
          }

        } else if (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_ErrSet === '1') { // 故障
          if (skyCar.state != 4) {
            skyCar.state = 4
            skyCar.setPopupColor()
          }

        } else if (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_Roaming === '1') { // 漫游
          if (skyCar.state != 3) {
            skyCar.state = 3
            skyCar.setPopupColor()
          }

        } else if (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_Loading === '1' || skyCar.history[VUEDATA.messageLen - 1].ohtStatus_UnLoading === '1') { // 取货、放货中
          if (skyCar.state != 2) {
            skyCar.state = 2
            skyCar.setPopupColor()
          }

        } else if (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_Quhuoxing === '1') { // 取货行

          if (skyCar.state != 0) {
            skyCar.state = 0
            skyCar.setPopupColor()
          }

        } else if (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_Fanghuoxing === '1') { // 放货行
          if (skyCar.state != 1) {
            skyCar.state = 1
            skyCar.setPopupColor()
          }
        } else {
          if (skyCar.state != 3) {
            skyCar.state = 3
            skyCar.setPopupColor()
          }
        }

        // 找一下 nextLine
        const thisPosition = skyCar.history[VUEDATA.messageLen - 1].position
        const thisLine = DATA.pointCoordinateMap.find(e => e.startCoordinate < thisPosition && e.endCoordinate > thisPosition)
        for (let i = 1; i <= VUEDATA.messageLen - 1; i++) {
          const nextLine = DATA.pointCoordinateMap.find(e => e.startCoordinate < skyCar.history[VUEDATA.messageLen - 1 - i].position && e.endCoordinate > skyCar.history[VUEDATA.messageLen - 1 - i].position)
          if (nextLine && thisLine && nextLine.name != thisLine.name) {
            if ((!skyCar.nextLine.length || skyCar.nextLine[skyCar.nextLine.length - 1] != nextLine.name) && skyCar.line != nextLine.name.replace('_', '-')) {
              if (skyCar.nextLine.length > 2) {
                if (skyCar.nextLine[skyCar.nextLine.length - 2] === nextLine.name) {
                  skyCar.nextLine.splice(skyCar.nextLine.length - 1, 1)
                  skyCar.nextLine.push(nextLine.name)
                }
              } else {
                skyCar.nextLine.push(nextLine.name)
              }
            }
            break
          }
        }


        // 除了position改变，有没有动画要放
        let haveAnimation = false
        if ((skyCar.history[VUEDATA.messageLen - 1].ohtStatus_Loading == '0' && skyCar.history[VUEDATA.messageLen - 2].ohtStatus_Loading == '1')
          || (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_Loading == '1' && skyCar.history[VUEDATA.messageLen - 2].ohtStatus_Loading == '0')
          || (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_UnLoading == '0' && skyCar.history[VUEDATA.messageLen - 2].ohtStatus_UnLoading == '1')
          || (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_UnLoading == '1' && skyCar.history[VUEDATA.messageLen - 2].ohtStatus_UnLoading == '0')) {
          haveAnimation = true
        }

        // 常态化清空 FOUP
        if (!haveAnimation && skyCar.history[VUEDATA.messageLen - 1].ohtStatus_IsHaveFoup === '0' && skyCar.catch && skyCar.run) {

          skyCar.catch.parent && skyCar.catch.parent.remove(skyCar.catch)
          skyCar.catch = null
        }

        // 强制清除取货行中的FOUP
        if (skyCar.state === 0 && !skyCar.catch) {
          skyCar.skyCarMesh.traverse(e => {
            if (e.isGroup && e.userData.type === 'kaxia') {
              e.parent && e.parent.remove(e)
              const itemIndex = STATE.sceneList.kaxiaList.children.findIndex(e2 => e2 === e)
              if (itemIndex >= 0) {
                STATE.sceneList.kaxiaList.children.splice(itemIndex, 1)
              }
            }
          })
        }


        // 两个先行动画，光执行，不移动
        function beforeComplete() {
          const cb = () => {
            skyCar.run = true
          }

          // if (skyCar.history.old.loading == '1' && skyCar.history.new.loading == '0') { // 装载结束
          //   skyCar.up(cb)

          // } else if (skyCar.history.old.ohtStatus_UnLoading == '1' && skyCar.history.new.ohtStatus_UnLoading == '0') { // 卸货结束
          //   skyCar.up(cb)
          // }
        }

        // 两个后行动画，先移动，再执行
        function onComplete(newHistory, oldHistory) {
          if (!skyCar.animationOver) return


          let positionData = API.getPositionByKaxiaLocation(newHistory.location)
          if (!positionData) {
            positionData = {
              type: '在货架上'
            }
          }

          if (oldHistory.ohtStatus_Loading == '0' && newHistory.ohtStatus_Loading == '1') { // 装载开始
            skyCar.run = false

            // 找离天车最近的机台或者货架
            let distance = 0
            let shelf = null

            if (positionData.type === '在机台上') {
              DATA.deviceMapArray.forEach(e => {
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

            } else {
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
            }


            // 查找最近的货架最近的卡匣，有就搬，没有就生成
            const kaxia = STATE.sceneList.kaxiaList.children.find(e => e.userData.id === newHistory.therfidFoup)

            const direction = positionData.type === '在机台上' ? 'right' : shelf.direction
            const cb = () => {
              if (kaxia && kaxia.parent) {
                kaxia.parent.remove(kaxia)
                kaxia.position.set(0, -0.35, 0)
                kaxia.scale.set(3, 3, 3)
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
                newKaxia.userData.id = newHistory.therfidFoup
                newKaxia.userData.area = ''
                newKaxia.userData.shelf = ''
                newKaxia.userData.shelfIndex = -1
                newKaxia.userData.type = 'kaxia'
                newKaxia.scale.set(3, 3, 3)
                newKaxia.position.set(0, -0.35, 0)
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
            skyCar.catchDirection = direction
            skyCar.down(positionData.type, cb)


          } else if (oldHistory.ohtStatus_UnLoading == '0' && newHistory.ohtStatus_UnLoading == '1') { // 卸货开始

            skyCar.run = false
            // setTimeout(() => { skyCar.run = true }, 10000)

            const cb = () => {
              if (skyCar.catch) {

                if (!positionData.position) {
                  skyCar.catch.parent.remove(skyCar.catch)
                  skyCar.catch = null

                } else {
                  skyCar.catch.position.x = positionData.position.x
                  skyCar.catch.position.y = positionData.position.y
                  skyCar.catch.position.z = positionData.position.z
                  skyCar.catch.userData.locationId = newHistory.location
                  skyCar.catch.userData.carrierType = 'FOUP'
                  skyCar.catch.userData.where = positionData.type
                  skyCar.catch.userData.area = positionData.area
                  skyCar.catch.userData.shelf = positionData.shelf
                  skyCar.catch.userData.shelfIndex = positionData.shelfIndex
                  skyCar.catch.userData.type = 'kaxia'
                  skyCar.catch.scale.set(30, 30, 30)
                  if (positionData.type === '在机台上') {
                    skyCar.catch.rotation.y = DATA.deviceMap[positionData.area][positionData.shelf].rotate * Math.PI / 180 - Math.PI / 2
                  } else if (positionData.type === '在货架上') {
                    skyCar.catch.rotation.y = DATA.shelvesMap[positionData.area][positionData.shelf].rotate * Math.PI / 180 - Math.PI / 2
                  }
                  skyCar.catch.visible = true
                  skyCar.catch.parent.remove(skyCar.catch)

                  skyCar.catch.traverse(e2 => {
                    if (e2.isMesh) {
                      e2.userData.id = skyCar.catch.userData.id
                      e2.userData.locationId = skyCar.catch.userData.locationId
                      e2.userData.carrierType = skyCar.catch.userData.carrierType
                      e2.userData.where = skyCar.catch.userData.where
                      e2.userData.area = skyCar.catch.userData.area
                      e2.userData.shelf = skyCar.catch.userData.shelf
                      e2.userData.shelfIndex = skyCar.catch.userData.shelfIndex
                      e2.userData.type = skyCar.catch.userData.type
                      CACHE.container.clickObjects.push(e2)
                    }
                  })

                  STATE.sceneList.kaxiaList.add(skyCar.catch)
                  skyCar.catch = null

                }

              }
            }
            skyCar.down(positionData.type, cb)
          }
        }


        // 不改变位置的情况 装货结束
        if (skyCar.history[VUEDATA.messageLen - 1].ohtStatus_Loading == '1' && skyCar.history[VUEDATA.messageLen - 2].ohtStatus_Loading == '0') {
          skyCar.run = true
          // skyCar.isAnimateSoon = false

        } else if (skyCar.history[VUEDATA.messageLen - 1]?.ohtStatus_UnLoading == '1' && skyCar.history[VUEDATA.messageLen - 2].ohtStatus_UnLoading == '0') {
          skyCar.run = true

        } else if (skyCar.history[VUEDATA.messageLen - 1]?.position != skyCar.history[VUEDATA.messageLen - 2]?.position) {
          // 改变位置的情况
          skyCar.coordinate = skyCar.history[VUEDATA.messageLen - 2].position
          const oldHistory = Object.assign({}, skyCar.history[VUEDATA.messageLen - 1])
          const newHistory = Object.assign({}, skyCar.history[VUEDATA.messageLen - 2])
          skyCar.setPosition(onComplete(newHistory, oldHistory))

        } else {
          skyCar.coordinate = skyCar.history[VUEDATA.messageLen - 2].position
          const oldHistory = Object.assign({}, skyCar.history[VUEDATA.messageLen - 1])
          const newHistory = Object.assign({}, skyCar.history[VUEDATA.messageLen - 2])
          skyCar.setPosition(onComplete(newHistory, oldHistory))
        }


        // 判断一下是否即将有动画
        const animateTargetMsg = skyCar.history[Math.floor(VUEDATA.messageLen / 2)]
        if (animateTargetMsg && (animateTargetMsg.ohtStatus_Loading == '1' || animateTargetMsg.ohtStatus_UnLoading == '1')) {
          skyCar.isAnimateSoon = true
        }



      } else { // 新建车
        const newCar = new SkyCar({ id: e.ohtID, coordinate: e.position })
        STATE.sceneList.skyCarList.push(newCar)
        newCar.history = [{
          time: new Date() * 1,
          lastTime,
          position,
          location,
          ohtStatus_Loading,
          ohtStatus_Quhuoda,
          ohtStatus_Roaming,
          ohtStatus_Idle,
          ohtStatus_IsHaveFoup,
          therfidFoup,
          ohtStatus_MoveEnable,
          ohtStatus_Fanghuoxing,
          ohtStatus_Fanghuoda,
          ohtStatus_UnLoading,
          ohtID
        }]

        newCar.coordinate = e.position
        newCar.skyCarMesh.position.set(235, 28.3, 231)
        newCar.skyCarMesh.rotation.y = Math.PI / 2
        newCar.setPosition()
        skyCar = newCar
      }


      // 单独依据 ohtStatus_IsHaveFoup 来给所有其值为 1 的天车绑上 FOUP
      if (e.ohtStatus_IsHaveFoup === '1' && skyCar.run) {
        if (!skyCar.catch) {
          const newKaxia = STATE.sceneList.FOUP.clone()
          const kaxiaId = e.therfidFoup
          newKaxia.userData.area = ''
          newKaxia.userData.shelf = ''
          newKaxia.userData.shelfIndex = -1
          newKaxia.userData.type = 'kaxia'
          newKaxia.userData.id = kaxiaId || '--'
          newKaxia.scale.set(3, 3, 3)
          newKaxia.position.set(0, -0.35, 0)
          newKaxia.rotation.y = -Math.PI / 2
          newKaxia.visible = true
          STATE.sceneList.kaxiaList.children.push(newKaxia)
          skyCar.catch = newKaxia

          const group = skyCar.skyCarMesh.children.find(e => e.name === 'tianche02')
          group.add(newKaxia)

          const kaxiaIndex = STATE.sceneList.kaxiaList.children.findIndex(e => e.userData.id === kaxiaId)
          if (kaxiaIndex >= 0 && STATE.sceneList.kaxiaList.children[kaxiaIndex].parent) {
            STATE.sceneList.kaxiaList.children[kaxiaIndex].parent.remove(STATE.sceneList.kaxiaList.children[kaxiaIndex])
            STATE.sceneList.kaxiaList.splice(kaxiaIndex, 1)
          }

          newKaxia.traverse(e2 => {
            if (e2.isMesh) {
              e2.userData.id = kaxiaId
              e2.userData.area = newKaxia.userData.area
              e2.userData.shelf = newKaxia.userData.shelf
              e2.userData.shelfIndex = newKaxia.userData.shelfIndex
              e2.userData.type = newKaxia.userData.type
            }
          })
        }
      }
    })
  }

  // 处理报警
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
