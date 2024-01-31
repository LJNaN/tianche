<template>
  <div class="xlk">
    <div class="dropdown">
      <button @click="selects">{{ selected }}</button>
    </div>
    <ul class="my-ul" v-show="showDropdown" @click="selectOption">
      <li v-for="option in options" :key="option" @click="selectItem(option)">{{ option }}</li>
    </ul>
  </div>

  <div class="my-p">
    <input type="text" class="my-p-input" placeholder="请输入关键字..." v-model="searchText" @focus="inputFocus(true)"
      @blur="inputFocus(false)" />
    <div class="search" @click="handleSearch"></div>
  </div>

  <el-scrollbar class="candidate" v-show="candidateShow">
    <div class="candidate-item" v-for="item in candidateList" @click="handleItem(item)">
      {{ item }}
    </div>
  </el-scrollbar>
</template>

<script setup>
import { onMounted, ref, watch, nextTick } from "vue";
import { DATA } from '@/ktJS/DATA'
import { API } from '@/ktJS/API'
import { STATE } from '@/ktJS/STATE'
import { CACHE } from "@/ktJS/CACHE";

const options = ref(['天车', '轨道', 'OHB', '卡匣', '设备', '指令']);

let selected = ref(options.value[0]);
let searchText = ref('')
let showDropdown = ref(false);
let candidateList = ref([])
let candidateShow = ref(false)
let temp = null

watch(
  () => searchText.value,
  ((val) => {
    candidateShow.value = true
    searchCandidate(val)
  })
)

function inputFocus(type) {
  if (type) {
    candidateShow.value = true
    searchCandidate(searchText.value)
  } else {
    setTimeout(() => {
      candidateShow.value = false
    }, 150)
  }
}


function selects() {
  showDropdown.value = !showDropdown.value;
}

function selectOption(event) {
  const target = event.target;
  if (target.nodeName === "LI") {
    selected.value = target.innerText;
    showDropdown.value = false;
    searchText.value = ''
  }
}

function selectItem(item) {
  selected.value = item
};




function searchCandidate(text) {
  candidateList.value = []
  if (selected.value === '轨道') {
    candidateList.value = DATA.pointCoordinateMap.filter(e => e.name.includes(text)).map(e => e.name)

  } else if (selected.value === '天车') {
    candidateList.value = STATE.sceneList.skyCarList.filter(e => e.id.includes(text)).map(e => e.id)

  } else if (selected.value === 'OHB') {
    const items4 = STATE.sceneList.shelves4Arr.filter(e => e.shelf.includes(text))
    const items2 = STATE.sceneList.shelves2Arr.filter(e => e.shelf.includes(text))
    const arr = [...items2, ...items4]
    candidateList.value = arr.map(e => e.shelf)
    temp = arr

  } else if (selected.value === '卡匣') {
    const list1 = STATE.sceneList.kaxiaList.children.filter(e => e.userData.id.includes(text)).map(e => e.userData.id)
    const list2 = []
    STATE.sceneList.skyCarList.forEach(e => {
      if (e.catch) {
        list2.push(e.catch.userData.id)
      }
    })
    candidateList.value = list1.concat(list2)

  } else if (selected.value === '设备') {
    const arr = []
    for (let key in DATA.deviceMap) {
      for (let key2 in DATA.deviceMap[key]) {
        if (key2.includes(text)) {
          arr.push(key2)
        }
      }
    }

    candidateList.value = arr
  }
}


function handleSearch() {
  handleItem(searchText.value)
}

function handleItem(item) {
  if (selected.value === '轨道' || selected.value === '天车' || selected.value === 'OHB' || selected.value === '卡匣' || selected.value === '设备') {
    searchText.value = item
  }

  STATE.searchAnimateDestroy = true
  setTimeout(() => {
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

    // 恢复初始状态
    if (STATE.currentPopup) {
      STATE.currentPopup.visible = false
      STATE.currentPopup.parent && STATE.currentPopup.parent.remove(STATE.currentPopup)
    }
    STATE.sceneList.skyCarList.forEach(e => {
      e.focus = false
      e.popup.visible = true
      e.clickPopup && e.clickPopup.parent && e.clickPopup.parent.remove(e.clickPopup)
      e.clickPopup = null
    })
    STATE.currentPopup = null

    if (selected.value === '轨道') {
      API.search(selected.value, searchText.value)

    } else if (selected.value === '天车') {
      STATE.searchAnimateDestroy = true
      API.search(selected.value, searchText.value)
      const instance = STATE.sceneList.skyCarList.find(e => e.id === searchText.value)
      if (instance) {

        instance.focus = true
        instance.initClickPopup()
        // 车子在当前轨道上走了多少进度
        const progress = instance.lineIndex / STATE.sceneList.linePosition[instance.line].length
        const thisLineMesh = STATE.sceneList.lineList.find(e => e.name === instance.line)
        if (progress && thisLineMesh) {
          thisLineMesh.material.uniforms.currentFocusLineStartPoint.value = instance.line.split('-')[0]
          thisLineMesh.material.uniforms.currentFocusLineEndPoint.value = instance.line.split('-')[1]
          thisLineMesh.material.uniforms.progress.value = progress
        }
      }

    } else if (selected.value === 'OHB') {
      const OHBItemInfo = temp.find(e => e.shelf === item)
      const OHBItem = STATE.sceneList.shelves[OHBItemInfo.shelf]

      let instanceMesh = null
      let index = 0
      if (OHBItem.name === 'huojia4') {
        instanceMesh = container.scene.children.find(e => e.isInstancedMesh && e.name.includes('shalves4_'))
        index = CACHE.instanceNameMap.huojia4.find(e => e.name === OHBItem.userData.name).index
      } else if (OHBItem.name === 'huojia2') {
        instanceMesh = container.scene.children.find(e => e.isInstancedMesh && e.name.includes('shalves2_'))
        index = CACHE.instanceNameMap.huojia2.find(e => e.name === OHBItem.userData.name).index
      }

      API.clickInstance(instanceMesh, index)

    } else if (selected.value === '卡匣') {
      API.search(selected.value, searchText.value)

    } else if (selected.value === '设备') {

      let objMap = null
      let objType = null
      for (let key in CACHE.instanceNameMap) {
        const findObj = CACHE.instanceNameMap[key].find(e => e.id === item)
        if (findObj) {
          objMap = findObj
          objType = key
          break
        }
      }


      const deviceDetail = DATA.deviceMapArray.find(e => e.id === item)

      const instanceMesh = CACHE.container.scene.children.find(e =>
        e.isInstancedMesh && e.name.split('_')[0] === deviceDetail?.modelType
      )



      if (instanceMesh) {
        API.clickInstance(instanceMesh, objMap.index)
      }
    }
  }, 100)
}


</script>

<style scoped lang="less">
select option {
  background-color: transparent;
}

.xlk {
  background: url("/assets/3d/img/20.png") center / 100% 100% no-repeat;
  word-break: break-all;
  position: absolute;
  width: 19%;
  height: 53%;
  z-index: 2;
  bottom: 1%;
  left: 1%;
  z-index: 2;
  pointer-events: all;
}

.search {
  position: absolute;
  right: 0;
  cursor: pointer;
  z-index: 2;
  height: 100%;
  width: 5vh;
}

.dropdown {
  position: relative;
  display: inline-block;
  pointer-events: all;
  background: transparent;
}

.dropdown button {
  border: none;
  padding: 1.161vh;
  width: 160%;
  font-size: 14px;
  text-align: center;
  background: transparent;
  color: #FFFFFF;
  cursor: pointer;
}

.my-ul {
  width: 23.5%;
  border: 1px solid #ccc;
  background-color: #0009;
  list-style: none;
  color: #ffff;
  text-align: center;
  border-top: none;
  border-bottom: none;
}

.my-ul li {
  text-align: center;
  color: #ffff;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 1px solid #bfbfbf;

  .li::after {
    content: "";
    display: block;
    margin-top: 5px;
  }
}

.my-ul li:hover {
  background-color: #f2f2f2;
  background: transparent;
}

.my-p {
  word-break: break-all;
  position: absolute;
  font-size: 14px;
  width: 13.5%;
  height: 53%;
  z-index: 2;
  left: 6.5%;
  bottom: 1%;

  &-input {
    word-break: break-all;
    position: absolute;
    border: none;
    font-size: 14px;
    top: 27.5%;
    background: transparent;
    color: #FFF;

    &:focus {
      border: none;
      outline: none;
      background: none;
    }

    &::placeholder {
      color: #aaaaaa;
    }
  }
}


p {
  color: #ffff;
}

.candidate {
  height: 40vh;
  width: 14.5%;
  position: absolute;
  top: 100%;
  left: 5.5%;
  display: flex;
  flex-direction: column;

  &-item {
    color: #ffff;
    display: flex;
    align-items: center;
    overflow: hidden;
    height: 30px;
    padding-left: 12px;
    cursor: pointer;
  }

  &-item:nth-child(odd) {
    background-color: #0004;
  }

  &-item:nth-child(even) {
    background-color: #0001;
  }
}
</style>