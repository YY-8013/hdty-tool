<template>
  <div id="hdty-tool-main">
    <DataTable />
  </div>
</template>

<script setup>
import DataTable from "./components/DataTable.vue";
</script>

<style>
#hdty-tool-main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
