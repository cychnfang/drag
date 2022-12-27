<script setup lang="ts">
import {
  getCurrentInstance,
  onMounted,
  ref,
  ComponentInternalInstance,
  toRaw,
  reactive
} from "vue";
import { createDrag, createShap } from "../../dist/bundle.js";

let drag: any;
onMounted(() => {
  drag = createDrag({
    el: "#drag-container",
  });

  drag.on("click", (data: any) => {
  });
});

const ipt = ref();
const handleAdd = () => {
  console.log(ipt.value)
  createShap({
    el: ipt.value,
    width: 120,
    height: 34
  });
};
const placeholder = ref('我是输入框')
const columns = reactive([
  {
    label: '姓名',
    prop: 'name'
  },
  {
    label: '年龄',
    prop: 'age'
  }
])
const handleClick = () => {
  columns.push({
    label: '性别',
    prop: 'gender'
  })
};

</script>

<template>
  <div class="page">
    <div class="page-header">
      <el-button @click="handleAdd">新增方块</el-button>
      <el-button @click="handleClick">click</el-button>
    </div>
    <div class="page-aside">
      <div ref="ipt" class="item">
        <el-table ref="ipt" border>
          <el-table-column align="center" v-for="column in columns" :key="column.prop" :label="column.label"></el-table-column>
        </el-table>
      </div>
    </div>
    <div class="page-main" id="drag-container">

    </div>
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
    "header header"
    "aside main";

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
    background: url("./assets/canvas_bg.jpeg") repeat;
  }
}
</style>
