<template>
  <div class="home">
    <Header></Header>
    <Compass></Compass>
  </div>

  <div class="editor">
    <div class="output">
      <el-button @click="clickInsert" v-show="!isInsertMode && !isEdit">新增</el-button>
      <el-button @click="clickOutput">导出配置(替换"根目录/data/deviceMap.js")</el-button>
    </div>

    <el-table v-show="!isEdit" :data="DATA.deviceMap.value" class="table" @row-click="clickRow" ref="table"
      highlight-current-row border>
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="rotate" label="旋转" width="60" />
      <el-table-column prop="position" label="位置" />
      <el-table-column prop="visible" label="显示" width="60" />
      <el-table-column label="操作" width="60">
        <template #default="scope">
          <el-button link size="small" style="color: #f1682a;" @click="clickEdit(scope)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-form v-show="isEdit" class="form" :model="formData">
      <el-form-item label="类型" prop="deviceType" label-width="60">
        <el-select v-model="formData.deviceType" @change="selectChange">
          <el-option v-for="item in modelList" :label="item.label" :value="item.modelName" />
        </el-select>
      </el-form-item>

      <el-form-item label="id" prop="id" label-width="60">
        <el-input v-model="formData.id" />
      </el-form-item>

      <el-form-item label="位置" prop="x" label-width="60">
        <el-input v-model="formData.x" @focus="handleInput('position')" style="width:30%" />
        <el-input v-model="formData.z" @focus="handleInput('position')" style="width:30%" />
      </el-form-item>

      <el-form-item label="旋转" prop="rotate" label-width="60">
        <el-input v-model="formData.rotate" @focus="handleInput('rotate')" style="width:30%" />
      </el-form-item>

      <el-form-item label="显示" prop="visible" label-width="60">
        <el-switch v-model="formData.visible" @click="handleVisible" style="--el-switch-on-color: #f1682a; width:30%" />
      </el-form-item>


      <el-form-item label-width="60" style="margin-top: 10%;">
        <el-button @click="isInsertMode ? insertSubmit(0) : handleSubmit(0)">保存</el-button>
        <el-button @click="isInsertMode ? insertSubmit(1) : handleSubmit(1)">返回(不保存)</el-button>
        <el-button type="danger" @click="handleSubmit(2)" v-show="!isInsertMode">删除</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeMount, reactive } from "vue";
import Header from '@/components/header.vue'
import Compass from '@/components/compass.vue';
import { DATA } from '@/ktJS/DATA'
import { CACHE } from '@/ktJS/CACHE'
import { API } from '@/ktJS/API'
import bus from '@/utils/mitt'
import { STATE } from "@/ktJS/STATE";
import { ElMessage } from 'element-plus'

const modelList = [
  { label: '2LP机台(W01区域)', modelName: '2LPjitai(W01)' },
  { label: 'OLUS', modelName: 'OLUS' },
  { label: 'WBS002', modelName: 'WBS002' },
  { label: 'WHWSA01', modelName: 'WHWSA01' },
  { label: 'WMACB03', modelName: 'WMACB03' },
  { label: 'WS0RA01(I01)', modelName: 'WS0RA01(I01)' },
  { label: 'WS0RA01(I02)', modelName: 'WS0RA01(I02)' },
  { label: 'WS0RA01', modelName: 'WS0RA01' },
  { label: 'WSSP008', modelName: 'WSSP008' },
  { label: 'WTSTK01', modelName: 'WTSTK01' },
  { label: 'WWATA02V', modelName: 'WWATA02V' },
  { label: 'WWATA03V', modelName: 'WWATA03V' },
]

let control = null            // transform 控制器
let table = ref(null)         // 表格 ref dom
let isEdit = ref(false)       // 是否进入编辑模式
let isInsertMode = ref(false) // 新增模式
let oldVal = null             // 原始模型的数据
let oldModel = null           // 原始模型
let tempModel = null          // 编辑类型时的临时模型
let formData = reactive({     // 关联 table 和 form 的对象
  deviceType: '',
  id: '',
  x: 0,
  z: 0,
  rotate: 0,
  visible: true
})


function changeListener() {
  formData.x = Number(control.object.position.x.toFixed(1))
  formData.z = Number(control.object.position.z.toFixed(1))
  formData.rotate = Number((control.object.rotation.y * 180 / Math.PI).toFixed(1))
}


// 0-保存 1-返回 2-删除
function handleSubmit(type) {
  if (type === 0) {
    
    const obj = control.object
    control.removeEventListener("change", changeListener)
    control.detach()

    // 新模型
    if (tempModel) {
      
      const index = DATA.deviceMap.value.findIndex(e => e.type === oldModel.userData.deviceType && e.id === oldModel.userData.id)
      if (index >= 0) {
        DATA.deviceMap.value.splice(index, 1)
      }
      oldModel.parent.remove(oldModel)
      oldModel = null
      DATA.deviceMap.value.push({
        id: formData.id,
        type: formData.deviceType,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotate: formData.rotate,
        visible: formData.visible
      })

      obj.traverse(e => {
        if (e.isMesh) {
          e.userData.type = '机台'
          e.userData.deviceType = formData.deviceType
          e.userData.id = formData.id
          CACHE.container.clickObjects.push(e)
        }
      })

      // 模型没变
    } else {
      const data = DATA.deviceMap.value.find(e => e.type === oldModel.userData.deviceType && e.id === oldModel.userData.id)

      
      if (data) {
        data.id = formData.id
        data.type = formData.deviceType
        data.position[0] = Number(formData.x.toFixed(1))
        data.position[2] = Number(formData.z.toFixed(1))
        data.rotate = formData.rotate
        data.visible = formData.visible
      }
    }
    isEdit.value = false

  } else if (type === 1) {
    control.removeEventListener("change", changeListener)
    control.detach()
    oldModel.position.x = oldVal.x
    oldModel.position.z = oldVal.z
    oldModel.rotation.y = oldVal.rotate * Math.PI / 180
    oldModel.visible = oldVal.visible
    if (tempModel) {
      tempModel.parent.remove(tempModel)
    }
    isEdit.value = false

  } else if (type === 2) {
    control.removeEventListener("change", changeListener)
    control.detach()
    CACHE.container.outlineObjects = []

    oldModel.parent.remove(oldModel)
    const index = DATA.deviceMap.value.findIndex(e => e.type === oldModel.userData.deviceType && e.id === oldModel.userData.id)
    if (index >= 0) {
      DATA.deviceMap.value.splice(index, 1)
    }

    oldModel = null
    isEdit.value = false
  }

  oldVal = null
  oldModel = null
  tempModel = null
}

// 新增提交
function insertSubmit(type) {
  if (type === 0) {

    const data = DATA.deviceMap.value.find(e => e.id === formData.id)
    if (data) {
      ElMessage({
        message: 'ID 重复，请更改 ID',
        type: 'warning',
      })
      return
    }

    DATA.deviceMap.value.push({
      id: formData.id,
      type: formData.deviceType,
      position: [Number((tempModel.position.x).toFixed(1)), tempModel.position.y, Number((tempModel.position.z).toFixed(1))],
      rotate: formData.rotate,
      visible: formData.visible
    })

    tempModel.userData.deviceType = formData.deviceType
    tempModel.userData.id = formData.id
    tempModel.traverse(e => {
      if (e.isMesh) {
        e.userData.type = '机台'
        e.userData.deviceType = formData.deviceType
        e.userData.id = formData.id
        CACHE.container.clickObjects.push(e)
      }
    })

  } else {
    tempModel.parent.remove(tempModel)
  }


  CACHE.container.outlineObjects = []
  control.removeEventListener("change", changeListener)
  control.detach()
  isInsertMode.value = false
  isEdit.value = false
  oldVal = {}
  tempModel = null
}

function selectChange(e) {
  if (e === oldVal.deviceType) return


  if (tempModel) {
    if (isInsertMode.value) {
      control.removeEventListener("change", changeListener)
      control.detach()
    }
    tempModel.parent.remove(tempModel)
    tempModel = null
  }

  if (isInsertMode.value) {

    const originModel = STATE.sceneList[e]

    if (!originModel) return


    const model = originModel.clone()
    model.position.set(formData.x, 0, formData.z)
    model.rotation.y = Math.PI / 180 * formData.rotate
    model.visible = true
    CACHE.container.scene.add(model)
    CACHE.container.outlineObjects = []
    model.traverse(e => {
      if (e.isMesh) {
        CACHE.container.outlineObjects.push(e)
      }
    })

    if (control) {

      control.attach(model)
      control.object = model
    } else {
      const controls = editorControls(model)
      control = controls
    }
    control.addEventListener("change", changeListener)

    formData.id = e + '_1'
    formData.x = model.position.x
    formData.z = model.position.z
    formData.rotate = model.rotation.y
    formData.visible = true

    oldVal = JSON.parse(JSON.stringify(formData))
    tempModel = model


  } else {
    oldModel.visible = false
    const model = STATE.sceneList[e].clone()
    model.position.x = formData.x
    model.position.z = formData.z
    model.rotation.y = formData.rotate * Math.PI / 180
    model.visible = true
    tempModel = model

    CACHE.container.scene.add(model)
    control.object = model
  }
}

function clickRow(e) {
  CACHE.container.outlineObjects = []
  let obj = CACHE.container.scene.children.find(e2 => e2.userData.id === e.id)

  if (obj) {
    obj.traverse(e2 => {
      if (e2.isMesh) {
        CACHE.container.outlineObjects.push(e2)
      }
    })
  }
}

onMounted(() => {
  bus.$on('device', data => {
    if (data) {

      if (isEdit.value) {
        ElMessage({
          message: '请先完成当前编辑',
          type: 'warning',
        })
        return
      }


      CACHE.container.outlineObjects = []
      data.traverse(e => {
        if (e.isMesh) {
          CACHE.container.outlineObjects.push(e)
        }
      })

      // 操，具体细节我就不说了，功能是双击模型，然后 element table 进行对应跳转
      const tableBody = table.value.$el.children[0].children[2].children[0].children[0].children[0].children[0].children[1]
      for (let i = 0; i < tableBody.children.length; i++) {
        if (tableBody.children[i].children[0].children[0].innerText === data.userData.deviceType
          && tableBody.children[i].children[1].children[0].innerText === data.userData.id) {
          const rowIndex = DATA.deviceMap.value.findIndex(e =>
            e.type === data.userData.deviceType
            && e.id === data.userData.id
          )
          table.value.setCurrentRow(DATA.deviceMap.value[rowIndex])
          table.value.scrollTo({ top: tableBody.children[i].offsetTop, behavior: 'smooth' })
          break
        }
      }
    }
  })
})

function clickOutput() {
  const link = document.createElement('a')
  link.download = 'deviceMap.js'
  const outDeviceMap = DATA.deviceMap.value
  link.href = `data:text/plain,const deviceMap = ${JSON.stringify(outDeviceMap)}\n window.deviceMap = deviceMap`
  link.click()
}

// 新增模型
function clickInsert() {
  isInsertMode.value = true
  isEdit.value = true

  const originModel = STATE.sceneList[modelList[0]?.modelName]
  if (!originModel) return

  const model = originModel.clone()
  model.position.set(0, 0, 0)
  model.rotation.y = 0
  model.visible = true
  model.userData.deviceType = modelList[0]?.modelName
  model.userData.id = modelList[0]?.modelName + '_1'
  CACHE.container.scene.add(model)
  CACHE.container.outlineObjects = []
  model.traverse(e => {
    if (e.isMesh) {
      CACHE.container.outlineObjects.push(e)
    }
  })


  if (control) {
    control.attach(model)
    control.object = model
  } else {
    const controls = editorControls(model)
    control = controls
  }
  control.addEventListener("change", changeListener)

  formData.deviceType = model.userData.deviceType
  formData.id = model.userData.id
  formData.x = model.position.x
  formData.z = model.position.z
  formData.rotate = model.rotation.y
  formData.visible = true
  

  oldVal = JSON.parse(JSON.stringify(formData))
  tempModel = model
}

// transform
function editorControls(mesh) {
  CACHE.container.bloomPass.enabled = false
  const controls = CACHE.container.transformControl;
  controls.translationSnap = 0.1
  controls.rotationSnap = Math.PI / 8
  controls.showY = false

  controls.attach(mesh);

  // const dataIndex = DATA.deviceMap.value.findIndex(e => e.type === mesh.userData.deviceType && e.id === mesh.userData.id)
  // if (dataIndex === -1) {
  //   return
  // }

  return controls
}



function clickEdit(scope) {
  const model = CACHE.container.scene.children.find(e => e.userData.deviceType === scope.row.type && e.userData.id === scope.row.id)
  if (!model) return

  if (control) {
    control.attach(model)
    control.object = model
  } else {
    const controls = editorControls(model)
    control = controls
  }
  control.addEventListener("change", changeListener)


  isEdit.value = true

  formData.deviceType = scope.row.type
  formData.id = scope.row.id
  formData.x = scope.row.position[0]
  formData.z = scope.row.position[2]
  formData.rotate = scope.row.rotate
  formData.visible = scope.row.visible

  oldVal = JSON.parse(JSON.stringify(formData))
  oldModel = model
}

function handleInput(type) {
  if (type === 'position') {
    control.setMode('translate')
    control.showX = true
    control.showY = false
    control.showZ = true
  } else if (type === 'rotate') {
    control.setMode('rotate')
    control.showX = false
    control.showY = true
    control.showZ = false
  }
}

function handleVisible() {
  if(isInsertMode.value) {
    console.log(tempModel)
    tempModel.visible = formData.visible


  } else {
    oldModel.visible = formData.visible
  }
}

onBeforeMount(() => {
  bus.$off('device')
})
</script>

<style scoped lang="less">
.home {
  background: url("/assets/3d/img/1.png") center / 100% 100% no-repeat;
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;

  .logo {
    position: absolute;
    left: 21.5%;
    top: 2.5%;
    height: calc(3vw * 1.347);
    width: 3vw;
  }

}

.editor {
  height: 100vh;
  position: relative;

  .output {
    display: flex;
    justify-content: flex-start;
    pointer-events: all;
    position: absolute;
    z-index: 2;
    right: 28vw;
    transform: translateX(100%);
    top: 25%;

    .el-button {
      margin-left: 0;
      margin-right: 12px;
    }
  }

  .table {
    pointer-events: all;
    position: absolute;
    right: 1%;
    top: 30%;
    height: 60vh;
    width: 27vw;
    z-index: 2;
    border-radius: 4px;
  }

  .form {
    border-radius: 4px;
    padding: 2%;
    pointer-events: all;
    position: absolute;
    right: 1%;
    top: 30%;
    width: 27vw;
    z-index: 2;
    background-color: #fff;
  }
}
</style>