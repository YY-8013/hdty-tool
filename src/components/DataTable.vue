<template>
  <div class="data-table-container">
    <!-- 头部操作栏 -->
    <el-card class="header-card" shadow="hover">
      <div class="header">
        <div class="title-section">
          <div class="title-content">
            <h2>鄂尔多斯市统计列表个性化配置工具</h2>
            <p class="subtitle">支持多层级表头、单元格级样式配置、Excel导出</p>
          </div>
          <el-tag type="success" size="large" effect="dark">
            <el-icon><DocumentCopy /></el-icon>
            {{ tableData.length }} 条数据
          </el-tag>
        </div>
        <div class="actions">
          <el-tooltip content="配置显示的列及顺序" placement="bottom">
            <el-button type="primary" @click="showColumnConfigDialog = true">
              <el-icon><Setting /></el-icon>
              列配置
            </el-button>
          </el-tooltip>
          <el-tooltip
            content="设置表格和单元格样式(双击单元格即可)"
            placement="bottom"
          >
            <el-button type="success" @click="showStyleConfigDialog = true">
              <el-icon><Brush /></el-icon>
              样式配置
            </el-button>
          </el-tooltip>
          <el-tooltip
            content="导出为Excel文件(保留所有样式)"
            placement="bottom"
          >
            <el-button type="warning" @click="showExportDialog = true">
              <el-icon><Download /></el-icon>
              导出Excel
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-card>

    <!-- 表格卡片 -->
    <el-card class="table-card" shadow="hover">
      <div class="table-wrapper">
        <table class="custom-table" :style="tableGlobalStyle">
          <thead>
            <tr
              v-for="(row, rowIndex) in headerRows"
              :key="rowIndex"
              class="header-row"
            >
              <th
                v-for="(cell, colIndex) in row"
                :key="colIndex"
                :colspan="cell.colspan"
                :rowspan="cell.rowspan"
                :style="getHeaderCellStyle()"
                class="header-cell"
              >
                {{ cell.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIndex) in tableData"
              :key="rowIndex"
              class="data-row"
              @mouseover="hoverRow = rowIndex"
              @mouseleave="hoverRow = null"
            >
              <td
                v-for="(col, colIndex) in flatColumns"
                :key="colIndex"
                :style="getCellStyle(rowIndex, colIndex)"
                class="data-cell"
                @dblclick="handleCellDblClick(rowIndex, colIndex)"
              >
                {{ formatCellValue(row[col.prop], col.prop) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>

    <!-- 列配置对话框 -->
    <ColumnConfigDialog
      v-model="showColumnConfigDialog"
      :columns="currentColumns"
      @confirm="handleColumnConfigConfirm"
    />

    <!-- 样式配置对话框 -->
    <StyleConfigDialog
      v-model="showStyleConfigDialog"
      :global-style-config="globalStyle"
      :cell-styles-config="cellStyles"
      :selected-cell="selectedCell"
      :total-rows="tableData.length"
      :total-cols="flatColumns.length"
      @confirm="handleStyleConfigConfirm"
      @update:cellStyle="handleCellStyleUpdate"
    />

    <!-- 导出配置对话框 -->
    <ExportConfigDialog
      v-model="showExportDialog"
      :columns="currentColumns"
      @export="handleExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import {
  Setting,
  Brush,
  Download,
  DocumentCopy
} from "@element-plus/icons-vue";
import { mockData, tableColList } from "../mock/data.js";
import { exportMultiHeaderExcel } from "../utils/excelExport.js";
import ColumnConfigDialog from "./ColumnConfigDialog.vue";
import StyleConfigDialog from "./StyleConfigDialog.vue";
import ExportConfigDialog from "./ExportConfigDialog.vue";
import { ElMessage } from "element-plus";

// 数据
const tableData = ref(mockData);
const currentColumns = ref(JSON.parse(JSON.stringify(tableColList)));
const hoverRow = ref(null);
const selectedCell = ref(null);

// 对话框显示控制
const showColumnConfigDialog = ref(false);
const showStyleConfigDialog = ref(false);
const showExportDialog = ref(false);

// 全局样式配置
const globalStyle = reactive({
  headerBgColor: "#409eff",
  headerTextColor: "#ffffff",
  headerFontSize: 14,
  headerFontWeight: "bold",
  rowBgColor: "#ffffff",
  rowTextColor: "#606266",
  fontSize: 13,
  borderColor: "#ebeef5"
});

// 单元格样式配置
const cellStyles = reactive({});

// 计算扁平化的列(只包含叶子节点)
const flatColumns = computed(() => {
  const result = [];

  function flatten(cols) {
    cols.forEach((col) => {
      if (col.visible === false) return;

      if (col.children && col.children.length > 0) {
        flatten(col.children);
      } else if (col.prop) {
        result.push(col);
      }
    });
  }

  flatten(currentColumns.value);
  return result;
});

// 计算表头行
const headerRows = computed(() => {
  const maxDepth = getMaxDepth(currentColumns.value);
  const rows = Array(maxDepth)
    .fill(null)
    .map(() => []);

  function buildHeader(cols, depth) {
    cols.forEach((col) => {
      if (col.visible === false) return;

      const cell = {
        label: col.label,
        colspan: 1,
        rowspan: 1
      };

      if (col.children && col.children.length > 0) {
        const visibleChildren = col.children.filter((c) => c.visible !== false);
        if (visibleChildren.length > 0) {
          cell.colspan = getLeafCount(col);
          rows[depth].push(cell);
          buildHeader(col.children, depth + 1);
        }
      } else {
        cell.rowspan = maxDepth - depth;
        rows[depth].push(cell);
      }
    });
  }

  buildHeader(currentColumns.value, 0);
  return rows;
});

// 表格全局样式
const tableGlobalStyle = computed(() => ({
  "--border-color": globalStyle.borderColor,
  fontSize: `${globalStyle.fontSize}px`
}));

// 获取表头单元格样式
function getHeaderCellStyle() {
  return {
    backgroundColor: globalStyle.headerBgColor,
    color: globalStyle.headerTextColor,
    fontSize: `${globalStyle.headerFontSize}px`,
    fontWeight: globalStyle.headerFontWeight
  };
}

// 获取数据单元格样式
function getCellStyle(rowIndex, colIndex) {
  const cellKey = `${rowIndex}_${colIndex}`;
  const customStyle = cellStyles[cellKey];

  if (customStyle) {
    return {
      backgroundColor: customStyle.backgroundColor || globalStyle.rowBgColor,
      color: customStyle.color || globalStyle.rowTextColor,
      fontSize: `${customStyle.fontSize || globalStyle.fontSize}px`,
      fontWeight: customStyle.fontWeight || "normal"
    };
  }

  return {
    backgroundColor:
      hoverRow.value === rowIndex ? "#f5f7fa" : globalStyle.rowBgColor,
    color: globalStyle.rowTextColor
  };
}

// 格式化单元格值
function formatCellValue(value, prop) {
  if (value === null || value === undefined) return "-";
  if (prop === "totalNum") return value.toLocaleString();
  return value;
}

// 双击单元格
function handleCellDblClick(rowIndex, colIndex) {
  selectedCell.value = { row: rowIndex, col: colIndex };
  showStyleConfigDialog.value = true;
  ElMessage.info(`已选中第 ${rowIndex + 1} 行,第 ${colIndex + 1} 列`);
}

// 获取最大深度
function getMaxDepth(columns, depth = 1) {
  let maxDepth = depth;
  columns.forEach((col) => {
    if (col.visible === false) return;
    if (col.children && col.children.length > 0) {
      const childDepth = getMaxDepth(col.children, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  });
  return maxDepth;
}

// 获取叶子节点数量
function getLeafCount(col) {
  if (col.visible === false) return 0;
  if (!col.children || col.children.length === 0) return 1;
  return col.children.reduce((sum, child) => sum + getLeafCount(child), 0);
}

// 列配置确认
function handleColumnConfigConfirm(newColumns) {
  currentColumns.value = newColumns;
}

// 样式配置确认
function handleStyleConfigConfirm({ globalStyle: newGlobalStyle }) {
  Object.assign(globalStyle, newGlobalStyle);
  ElMessage.success("样式配置已应用");
}

// 单元格样式更新
function handleCellStyleUpdate(cellKey, style) {
  if (style === null) {
    delete cellStyles[cellKey];
  } else {
    cellStyles[cellKey] = style;
  }
}

// 导出Excel
function handleExport(exportConfig) {
  try {
    // 准备导出配置
    const config = {
      columnWidths: exportConfig.columnWidths,
      headerBgColor: exportConfig.headerBgColor,
      headerTextColor: exportConfig.headerTextColor,
      headerFontSize: exportConfig.headerFontSize,
      fontSize: exportConfig.fontSize,
      cellStyles: cellStyles
    };

    // 执行导出
    exportMultiHeaderExcel(
      exportConfig.columns,
      tableData.value,
      config,
      "鄂尔多斯市统计数据"
    );

    ElMessage.success("导出成功!");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败: " + error.message);
  }
}
</script>

<style scoped>
.data-table-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-card :deep(.el-card__body) {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-content h2 {
  color: #ffffff;
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
  font-weight: 300;
}

.actions {
  display: flex;
  gap: 12px;
}

.actions .el-button {
  font-weight: 500;
  padding: 12px 24px;
}

.table-card {
  background: #ffffff;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 650px;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid var(--border-color, #ebeef5);
}

.header-cell {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid var(--border-color, #ebeef5);
  font-weight: bold;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-cell {
  padding: 10px 8px;
  text-align: center;
  border: 1px solid var(--border-color, #ebeef5);
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}

.data-cell:hover {
  background-color: #ecf5ff !important;
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-row {
  transition: background-color 0.2s ease;
}

.data-row:nth-child(even) {
  background-color: #fafafa;
}

.data-row:hover {
  background-color: #f5f7fa;
}

/* 固定列样式 */
.custom-table td:first-child,
.custom-table th:first-child {
  position: sticky;
  left: 0;
  z-index: 5;
  background: white;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.header-row th:first-child {
  z-index: 15 !important;
}

/* 滚动条样式 */
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
