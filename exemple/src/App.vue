<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, ComponentInternalInstance, toRaw } from 'vue';
import { createDrag, createShap } from '../../dist/bundle.js';

let drag: any;
onMounted(() => {
  drag = createDrag({
    el: '#drag-container'
  });
});

const ipt = ref();
const handleAdd = () => {
  createShap({el: ipt.value})
};
</script>

<template>
  <div class="page">
    <div class="page-header">
      <el-button @click="handleAdd" :draggable="true">新增方块</el-button>
    </div>
    <div class="page-aside">
      <div ref="ipt" class="item"> 
        <el-input placeholder="我是输入框" ref="ipt"></el-input>
      </div>
    </div>
    <div class="page-main" id="drag-container"></div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 400px 1fr;
  grid-template-rows: 80px 1fr;
  grid-template-areas:
    'header header'
    'aside main';

  &-header {
    grid-area: header;
    background-color: #f6f6f6;
    border-bottom: 1px solid #a2a2a2;
  }
  &-aside {
    grid-area: aside;
    background-color: #f6f6f6;
    border-right: 1px solid #a2a2a2;
    .item {
      width: 200px;
    }
  }
  &-main {
    grid-area: main;
    border: 1px solid #ddd;
    background: url('./assets/canvas_bg.jpeg') repeat;
  }
}
</style>
