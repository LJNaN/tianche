<template>
  <div class="home">
    <Header></Header>
    <Compass></Compass>
  </div>

  <div class="editor">
    <div class="output" v-show="!isInsertMode && !isEdit">
      <el-button @click="clickInsert">新增</el-button>
      <el-button @click="clickOutput">导出配置(替换"根目录/data/deviceMap.js")</el-button>
    </div>

    <el-table v-show="!isEdit" :data="DATA.deviceMapArray" class="table" @row-click="clickRow" ref="table"
      highlight-current-row border>
      <el-table-column prop="modelType" label="模型" width="80" />
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="rotate" label="旋转" width="60" />
      <el-table-column prop="position" label="位置" />
      <el-table-column prop="type" label="机台类型" width="60" />
      <el-table-column prop="bay" label="Bay" width="60" />
      <el-table-column prop="visible" label="显示" width="60" />
      <el-table-column label="操作" width="60">
        <template #default="scope">
          <el-button link size="small" style="color: #f1682a;" @click="clickEdit(scope)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-form v-show="isEdit" class="form" :model="formData">
      <el-form-item label="模型" prop="modelType" label-width="60">
        <el-select v-model="formData.modelType" @change="selectChange">
          <el-option v-for="item in modelList" :label="item.label" :value="item.label" :disabled="item.disabled" />
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

      <el-form-item label="类型" prop="type" label-width="60">
        <el-input v-model="formData.type" style="width:30%" />
      </el-form-item>

      <el-form-item label="Bay" prop="bay" label-width="60">
        <el-input v-model="formData.bay" style="width:30%" />
      </el-form-item>

      <el-form-item label="货位" prop="fields" label-width="60">
        <el-input v-model="formData.fields[0]" style="width:25%" />
        <el-input v-model="formData.fields[1]" style="width:25%" />
        <el-input v-model="formData.fields[2]" style="width:25%" />
        <el-input v-model="formData.fields[3]" style="width:25%" />
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


  <Test></Test>
</template>

<script setup>
import { onMounted, ref, onBeforeMount, reactive } from "vue";
import Test from '../home/test.vue'
import Header from '@/components/header.vue'
import Compass from '@/components/compass.vue';
import { DATA } from '@/ktJS/DATA'
import { CACHE } from '@/ktJS/CACHE'
import { API } from '@/ktJS/API'
import bus from '@/utils/mitt'
import { STATE } from "@/ktJS/STATE";
import { ElMessage } from 'element-plus'



const modelList = JSON.parse(JSON.stringify(DATA.deviceTypeMap))
modelList.forEach(e => e.disabled = e.modelName ? false : true)


let control = null            // transform 控制器
let table = ref(null)         // 表格 ref dom
let isEdit = ref(false)       // 是否进入编辑模式
let isInsertMode = ref(false) // 新增模式
let oldVal = null             // 原始模型的数据
let oldModel = null           // 原始模型
let tempModel = null          // 编辑类型时的临时模型
let formData = reactive({     // 关联 table 和 form 的对象
  modelType: '',
  type: '',
  bay: '',
  id: '',
  x: 0,
  z: 0,
  rotate: 0,
  fields: [],
  visible: true
})





function changeListener() {
  formData.x = Number(control.object.position.x.toFixed(1))
  formData.z = Number(control.object.position.z.toFixed(1))

  if (control.object.rotation.x < -3.14 && control.object.rotation.x > -3.15 && control.object.rotation.z < -3.14 && control.object.rotation.z > -3.15 && control.object.rotation.y > -0.1 && control.object.rotation.y < 0.1) {
    formData.rotate = 180
  } else {
    formData.rotate = Number((control.object.rotation.y * 180 / Math.PI).toFixed(1))
  }

}


// 0-保存 1-返回 2-删除
function handleSubmit(type) {
  if (type === 0) {

    const obj = control.object

    control.removeEventListener("change", changeListener)
    control.detach()

    // 新模型
    if (tempModel) {
      const index = DATA.deviceMapArray.findIndex(e => e.id === oldModel.userData.id)
      if (index >= 0) {
        DATA.deviceMapArray.splice(index, 1)
      }

      for (let key in DATA.deviceMap) {
        for (let key2 in DATA.deviceMap[key]) {
          if (key2 === oldModel.userData.id) {
            delete DATA.deviceMap[key][key2]
          }
        }
      }

      oldModel.parent.remove(oldModel)
      oldModel = null

      DATA.deviceMapArray.push({
        id: formData.id,
        modelType: formData.modelType,
        type: formData.type,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotate: formData.rotate,
        visible: formData.visible,
        bay: formData.bay,
        fields: formData.fields.map(e => Number(e))
      })


      if (!DATA.deviceMap[formData.modelType]) {
        DATA.deviceMap[formData.modelType] = {}
      }
      DATA.deviceMap[formData.modelType][formData.id] = {
        id: formData.id,
        modelType: formData.modelType,
        type: formData.type,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotate: formData.rotate,
        visible: formData.visible,
        bay: formData.bay,
        fields: formData.fields.map(e => Number(e))
      }

      obj.userData.deviceType = formData.type
      obj.userData.id = formData.id
      obj.traverse(e => {
        if (e.isMesh) {
          e.userData.type = '机台'
          e.userData.deviceType = formData.type
          e.userData.id = formData.id
          CACHE.container.clickObjects.push(e)
        }
      })

      // 模型没变
    } else {
      if (!DATA.deviceMap[oldModel.userData.modelType]) {
        DATA.deviceMap[oldModel.userData.modelType] = {}
      }
      const data = DATA.deviceMap[oldModel.userData.modelType][oldModel.userData.id]
      console.log('oldModel.userData.modelType: ', oldModel.userData.modelType);
      console.log('oldModel.userData.id: ', oldModel.userData.id);

      if (data) {
        const oldPosition = DATA.deviceMap[oldModel.userData.modelType][oldModel.userData.id].position
        delete DATA.deviceMap[oldModel.userData.modelType][oldModel.userData.id]

        DATA.deviceMap[oldModel.userData.modelType][formData.id] = {
          id: formData.id,
          type: formData.type,
          modelType: formData.modelType,
          position: [Number(formData.x.toFixed(1)), oldPosition[1], Number(formData.z.toFixed(1))],
          rotate: formData.rotate,
          visible: formData.visible,
          bay: formData.bay,
          fields: formData.fields.map(e => Number(e))
        }

      }

      const itemIndex = DATA.deviceMapArray.findIndex(e => e.id === oldModel.userData.id)
      if (itemIndex >= 0) {
        const oldPosition = DATA.deviceMapArray[itemIndex].position
        DATA.deviceMapArray.splice(itemIndex, 1)
        DATA.deviceMapArray.push({
          id: formData.id,
          type: formData.type,
          modelType: formData.modelType,
          position: [Number(formData.x.toFixed(1)), oldPosition[1], Number(formData.z.toFixed(1))],
          rotate: formData.rotate,
          visible: formData.visible,
          bay: formData.bay,
          fields: formData.fields.map(e => Number(e))
        })
      }

      obj.userData.deviceType = formData.type
      obj.userData.modelType = formData.modelType
      obj.userData.id = formData.id
      obj.traverse(e => {
        if (e.isMesh) {
          e.userData.type = '机台'
          e.userData.deviceType = formData.type
          e.userData.modelType = formData.modelType
          e.userData.id = formData.id
        }
      })
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

    const index = DATA.deviceMapArray.findIndex(e => e.id === oldModel.userData.id)
    if (index >= 0) {
      DATA.deviceMapArray.splice(index, 1)
    }

    for (let key in DATA.deviceMap) {
      for (let key2 in DATA.deviceMap[key]) {
        if (key2 === oldModel.userData.id) {
          delete DATA.deviceMap[key][key2]
        }
      }
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

    for (let key in DATA.deviceMap) {
      for (let key2 in DATA.deviceMap[key]) {
        if (key2 === formData.id) {
          ElMessage({
            message: 'ID 重复，请更改 ID',
            type: 'warning',
          })
          return
        }
      }
    }

    DATA.deviceMapArray.push({
      id: formData.id,
      type: formData.type,
      modelType: formData.modelType,
      bay: formData.bay,
      position: [Number((tempModel.position.x).toFixed(1)), tempModel.position.y, Number((tempModel.position.z).toFixed(1))],
      rotate: formData.rotate,
      fields: formData.fields.map(e => Number(e)),
      visible: formData.visible
    })

    if (!DATA.deviceMap[formData.modelType]) {
      DATA.deviceMap[formData.modelType] = {}
    }
    DATA.deviceMap[formData.modelType][formData.id] = {
      id: formData.id,
      type: formData.type,
      modelType: formData.modelType,
      bay: formData.bay,
      position: [Number((tempModel.position.x).toFixed(1)), tempModel.position.y, Number((tempModel.position.z).toFixed(1))],
      rotate: formData.rotate,
      fields: formData.fields.map(e => Number(e)),
      visible: formData.visible
    }

    tempModel.userData.deviceType = formData.type
    tempModel.userData.modelType = formData.modelType
    tempModel.userData.id = formData.id
    tempModel.traverse(e => {
      if (e.isMesh) {
        e.userData.type = '机台'
        e.userData.deviceType = formData.type
        e.userData.modelType = formData.modelType
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


// 机台类型改变
function selectChange(e) {

  if (tempModel) {
    if (isInsertMode.value) {
      control.removeEventListener("change", changeListener)
      control.detach()
    }
    tempModel.parent.remove(tempModel)
    tempModel = null
  }


  const map = modelList.find(e2 => e2.label === e)
  if (isInsertMode.value) {
    const originModel = STATE.sceneList[map.modelName]

    if (!originModel) return
    const model = originModel.clone()
    model.position.set(formData.x, 0, formData.z)
    model.rotation.y = Math.PI / 180 * formData.rotate
    model.visible = true
    CACHE.container.scene.add(model)
    CACHE.container.outlineObjects = []
    model.traverse(e2 => {
      e2.visible = true
      if (e2.isMesh) {
        CACHE.container.outlineObjects.push(e2)
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


    formData.id = e + '01'
    formData.x = model.position.x
    formData.z = model.position.z
    formData.rotate = model.rotation.y
    formData.bay = ''
    formData.modelType = e
    formData.fields = []
    formData.type = ''
    formData.visible = true

    oldVal = JSON.parse(JSON.stringify(formData))
    tempModel = model


  } else {

    oldModel.visible = false
    const model = STATE.sceneList[map.modelName].clone()
    model.position.x = formData.x
    model.position.z = formData.z
    model.rotation.y = formData.rotate * Math.PI / 180
    model.visible = true
    tempModel = model

    CACHE.container.scene.add(model)
    CACHE.container.outlineObjects = []
    model.traverse(e => {
      e.visible = true
      if (e.isMesh) {
        CACHE.container.outlineObjects.push(e)
      }
    })
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
        if (tableBody.children[i].children[1].children[0].innerText === data.userData.id) {
          const rowIndex = DATA.deviceMapArray.findIndex(e => e.id === data.userData.id)
          table.value.setCurrentRow(DATA.deviceMapArray[rowIndex])
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
  const outDeviceMap = DATA.deviceMap
  link.href = `data:text/plain,const deviceMap = ${JSON.stringify(outDeviceMap)}\n window.deviceMap = deviceMap`
  link.click()
}

// 新增模型
function clickInsert() {
  isInsertMode.value = true
  isEdit.value = true

  const originModel = STATE.sceneList[DATA.deviceTypeMap[0].modelName]
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

  formData.type = model.userData.deviceType
  formData.id = model.userData.id
  formData.x = model.position.x
  formData.z = model.position.z
  formData.rotate = model.rotation.y
  formData.rotate = model.rotation.y
  formData.fields = []
  formData.bay = ''
  formData.modelType = DATA.deviceTypeMap[0].label
  formData.visible = true


  oldVal = JSON.parse(JSON.stringify(formData))
  tempModel = model
}

// transform
function editorControls(mesh) {
  CACHE.container.bloomPass.enabled = false
  const controls = CACHE.container.transformControl;
  controls.translationSnap = 0.1
  controls.rotationSnap = Math.PI / 2
  controls.showY = false

  controls.attach(mesh)
  return controls
}


// 点击编辑按钮
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
  formData.type = scope.row.type
  formData.id = scope.row.id
  formData.x = scope.row.position[0]
  formData.z = scope.row.position[2]
  formData.fields = scope.row.fields
  formData.bay = scope.row.bay
  formData.modelType = scope.row.modelType
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
  if (isInsertMode.value) {
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
    right: 32vw;
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
    width: 31vw;
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
    width: 31vw;
    z-index: 2;
    background-color: #fff;
  }
}
</style>