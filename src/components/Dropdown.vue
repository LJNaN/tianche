<template>
  <div class="dropdown">
    <button @click="selects">{{ dropdownText }}</button>
    
  </div>
  <ul class="my-ul" v-show="showDropdown" @click="selectOption">
      <li v-for="option in options" :key="option">{{ option }}</li>
    </ul>
</template>
<script>
import { ref } from "vue";
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const dropdownText = ref(props.options[0]);
    let showDropdown = ref(false);
    console.log(showDropdown.value);

    function selects(event) {
      console.log(showDropdown);
      showDropdown.value = !showDropdown.value;
    }
    function selectOption(event) {
      const target = event.target;
      if (target.nodeName === "LI") {
        dropdownText.value = target.innerText;
        showDropdown.value = false;
      }
    }
    return {
      dropdownText,
      showDropdown,
      selects,
      selectOption,
    };
  },
};
</script>
<style scoped lang='less'>
.dropdown {
  position: relative;
  display: inline-block;
  pointer-events: all;
  background: transparent;
}
.dropdown button {
//   border: 1px solid #ccc;
  border: none;
  background-color: #fff;
  padding: 1.161vh;
  width: 160%;
  //   height: 80%;
  font-size: 14px;
  text-align: center;
  background: transparent;
  color: #a39696;
  //   vertical-align: baseline;
}
.my-ul{
    width: 23.5%;
  border: 1px solid #ccc;
  background-color: #fff;
  list-style: none;
  background: transparent;
  color: #ffff;
  text-align: center;
  border-top: none;
  border-bottom: none;
//   outline: 1px solid #ccc;
}
.my-ul li {
  text-align: center;
  color: #ffff;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  background: transparent;
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
</style>