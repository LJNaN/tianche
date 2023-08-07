import { createStore } from 'vuex'

const store = createStore({
  state: {
    isShowButton: true 
  },
  mutations: {
    // increment(state) {
    //   state.count++
    // }
  },
  actions: {
    // incrementAsync({ commit }) {
    //   setTimeout(() => {
    //     commit('increment')
    //   }, 1000)
    // }
  },
  getters: {
    // getCount(state) {
    //   return state.count
    // }
  }
})

export default store