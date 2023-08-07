<!--
 * @Author: 小明 1135331731@qq.com
 * @Date: 2023-08-07 16:45:34
 * @LastEditors: 小明 1135331731@qq.com
 * @LastEditTime: 2023-08-07 17:52:47
 * @FilePath: \project-tianche\src\views\home\yc.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="right" @click="isshow()">
   
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import * as echarts from "echarts";
import Chart from "@/components/Chart.vue";
import store from '../../store'

function isshow() {
  console.log("store.state.isShowButton",store.state.isShowButton)
  store.state.isShowButton = !store.state.isShowButton;
}

</script>

<style lang="less" scoped>

.right{
  pointer-events: all;
  background: url("/assets/3d/img/49.png") center / 90% 100% no-repeat;
  // border: 1px solid red;
  position: absolute;
  width: 2%;
  height: 3%;
  top: 7%;
  right: 1%;
}
</style>
