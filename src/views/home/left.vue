<template>
  <div class="right">
   
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import * as echarts from "echarts";
import Chart from "@/components/Chart.vue";

setInterval(() => {
  option.series.forEach((item, index) => {
    let randomDataArr = [];
    if (index == 2) {
      for (let i = 0; i < 29; i++) {
        randomDataArr.push({
          value: Math.floor(Math.random() * 100),
          name: i,
        });
      }
      item.data = randomDataArr;
    } else {
      for (let i = 0; i < 29; i++) {
        randomDataArr.push({
          value: Math.floor(Math.random() * 500) + 500,
          name: i,
        });
      }
      item.data = randomDataArr;
    }
  });
}, 6000);

onMounted(() => {});
</script>

<style lang="less" scoped>

  
</style>
