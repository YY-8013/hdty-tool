<template>
  <div class="excel-export-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </el-button>
      <div class="page-title-section">
        <h1 class="page-title">Excel导出配置工具</h1>
        <p class="page-subtitle">鄂尔多斯市统计数据</p>
      </div>
    </div>

    <!-- 数据表格组件 -->
    <DataTable />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import DataTable from "../components/DataTable.vue";

const router = useRouter();

function goBack() {
  router.push("/");
}
</script>

<style scoped>
.excel-export-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-weight: 500;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.page-title-section {
  flex: 1;
}

.page-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
  font-weight: 300;
}
</style>
