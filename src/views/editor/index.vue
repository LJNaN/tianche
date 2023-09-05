<template>
  <div class="home">
    <Header></Header>
    <Compass></Compass>
  </div>

  <div class="editor">
    <el-button class="output" @click="clickOutput">导出机台配置 (替换 '根目录/data/deviceMap.js')</el-button>

    <el-table v-show="!isEdit" :data="DATA.deviceMap.value" class="table" @row-click="clickRow" ref="table"
      highlight-current-row border>
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="rotate" label="旋转" width="60" />
      <el-table-column prop="position" label="位置" />
      <el-table-column label="操作" width="60">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="clickEdit(scope)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-form v-show="isEdit" class="form" :model="formData">
      <el-form-item label="类型" prop="deviceType" label-width="60">
        <el-select v-model="formData.deviceType" placeholder="Activity zone">
          <el-option label="Zone one" value="shanghai" />
          <el-option label="Zone two" value="beijing" />
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


      <el-form-item label-width="60">
        <el-button>保存</el-button>
        <el-button @click="isEdit = false">返回(不保存)</el-button>
        <el-button type="danger">删除</el-button>
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

let control = null
let table = ref(null)
let isEdit = ref(false)
let formData = reactive({
  deviceType: '',
  id: '',
  x: 0,
  z: 0,
  rotate: 0
})

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

// transform
function editorControls(mesh) {
  CACHE.container.bloomPass.enabled = false
  const controls = CACHE.container.transformControl;
  controls.translationSnap = 0.1
  controls.rotationSnap = Math.PI / 8
  controls.showY = false

  if (controls.object) {
    controls.detach()
  }
  controls.attach(mesh);

  const dataIndex = DATA.deviceMap.value.findIndex(e => e.type === mesh.userData.deviceType && e.id === mesh.userData.id)
  if (dataIndex === -1) {
    return
  }

  controls.addEventListener("change", () => {
    // DATA.deviceMap.value[dataIndex].position = [Number(mesh.position.x.toFixed(1)), mesh.position.y, Number(mesh.position.z.toFixed(1))]
    // DATA.deviceMap.value[dataIndex].rotate = mesh.rotation.y * 180 / Math.PI
    formData.x = Number(mesh.position.x.toFixed(1))
    formData.z = Number(mesh.position.z.toFixed(1))
    formData.rotate = Number((mesh.rotation.y * 180 / Math.PI).toFixed(1))
  })
  return controls
}

function clickEdit(scope) {
  console.log('scope: ', scope.row);
  const model = CACHE.container.scene.children.find(e => e.userData.deviceType === scope.row.type && e.userData.id === scope.row.id)
  if (!model) return
  const controls = editorControls(model)
  control = controls

  isEdit.value = true
  formData.deviceType = scope.row.type
  formData.id = scope.row.id
  formData.x = scope.row.position[0]
  formData.z = scope.row.position[2]
  formData.rotate = scope.row.rotate

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
  .output {
    pointer-events: all;
    position: absolute;
    z-index: 2;
    right: 26vw;
    transform: translateX(100%);
    top: 25%;
  }

  .table {
    pointer-events: all;
    position: absolute;
    right: 1%;
    top: 30%;
    height: 60vh;
    width: 25vw;
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
    width: 25vw;
    z-index: 2;
    background-color: #fff;
  }
}
</style>