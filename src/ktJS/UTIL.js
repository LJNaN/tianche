import { STATE } from './STATE'
import { CACHE } from './CACHE'
import TU from './js/threeUtils.js'

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

// 通过 GetCarrierInfo 的locationId 找 position
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

// 通过 coordinate 找 position
function getPositionByCoordinate(c) {
  const coordinate = Number(c)
  const map = DATA.pointCoordinateMap.find(e => e.startCoordinate < coordinate && e.endCoordinate > coordinate)
  const lineMap = STATE.sceneList.linePosition[map.name]
  const lineProgress = (coordinate - map.startCoordinate) / (map.endCoordinate - map.startCoordinate)
  const index = Math.floor(lineMap.length * lineProgress)
  return {
    line: map.name,
    lineIndex: index
  }
}

export const UTIL = {
  cameraAnimation,
  loadGUI,
  testBox,
  computedCameraTweenPosition,
  getAnimationList,
  instantiationGroupInfo,
  getPositionByKaxiaLocation,
  getPositionByCoordinate
}