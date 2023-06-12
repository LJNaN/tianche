import { createRouter, createWebHashHistory } from "vue-router"
import Home from "@/views/home/index.vue"

const routes = [
  { path: "/", component: Home },
  { path: "/home", component: Home },
]



export default createRouter({
  routes,
  history: createWebHashHistory()
})