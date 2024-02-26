/*
 * @Author: 小明 1135331731@qq.com
 * @Date: 2023-08-07 10:07:56
 * @LastEditors: 小明 1135331731@qq.com
 * @LastEditTime: 2023-08-07 14:39:44
 * @FilePath: \project-tianche\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router/index.js"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/utils/dateFormat.js'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(router)

// if(new Date() * 1 < new Date('2023-10-16') * 1) {
app.mount('#app')
// }
