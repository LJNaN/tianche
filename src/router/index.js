import { createRouter, createWebHashHistory } from "vue-router"
import Home from "@/views/home/index.vue"
import Editor from "@/views/editor/index.vue"
import Replay from "@/views/replay/index.vue"

const routes = [
  { path: "/", component: Home },
  { path: "/home", component: Home },
  { path: "/editor", component: Editor },
  { path: "/replay", component: Replay }
]



export default createRouter({
  routes,
  history: createWebHashHistory()
})