<template>
  <el-dialog
    v-model="visible"
    title="导出配置"
    width="950px"
    :close-on-click-modal="false"
    class="export-config-dialog"
    @close="handleDialogClose"
  >
    <div class="dialog-content-wrapper">
      <el-tabs v-model="activeTab">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="exportConfig" label-width="130px">
            <el-form-item label="文件名">
              <el-input
                v-model="exportConfig.fileName"
                placeholder="请输入导出文件名"
                clearable
              >
                <template #append>.xlsx</template>
              </el-input>
            </el-form-item>

            <el-form-item label="字体设置方式">
              <el-radio-group v-model="exportConfig.useUniformFont">
                <el-radio :label="true">统一字体格式</el-radio>
                <el-radio :label="false">保持列表样式</el-radio>
              </el-radio-group>
              <div class="form-tip">
                <el-icon><InfoFilled /></el-icon>
                <span
                  >选择"统一字体格式"可整体设置,选择"保持列表样式"将完全按照列表显示效果导出</span
                >
              </div>
            </el-form-item>

            <template v-if="exportConfig.useUniformFont">
              <el-divider content-position="left">统一字体设置</el-divider>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="字体">
                    <el-select v-model="exportConfig.fontFamily">
                      <el-option label="微软雅黑" value="Microsoft YaHei" />
                      <el-option label="宋体" value="SimSun" />
                      <el-option label="黑体" value="SimHei" />
                      <el-option label="Arial" value="Arial" />
                      <el-option
                        label="Times New Roman"
                        value="Times New Roman"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="字体大小">
                    <el-input-number
                      v-model="exportConfig.fontSize"
                      :min="8"
                      :max="24"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="字体粗细">
                    <el-select v-model="exportConfig.fontBold">
                      <el-option label="正常" :value="false" />
                      <el-option label="加粗" :value="true" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="字体颜色">
                    <el-color-picker
                      v-model="exportConfig.fontColor"
                      show-alpha
                      :predefine="presetColors"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </el-form>
        </el-tab-pane>

        <!-- 导出列配置 -->
        <el-tab-pane label="导出列" name="columns">
          <div class="export-columns-section">
            <div class="toolbar">
              <el-alert
                title="提示:只导出当前列表中已展示的列"
                type="info"
                :closable="false"
                show-icon
              />
            </div>

            <div class="actions-bar">
              <el-button size="small" type="primary" @click="selectAllColumns">
                <el-icon><Select /></el-icon>
                全选
              </el-button>
              <el-button size="small" @click="deselectAllColumns">
                <el-icon><Close /></el-icon>
                全不选
              </el-button>
              <el-button size="small" type="warning" @click="batchSetWidth">
                <el-icon><Setting /></el-icon>
                批量设置列宽
              </el-button>
            </div>

            <!-- 使用层级表格展示 -->
            <el-table
              :data="exportColumnsData"
              row-key="id"
              default-expand-all
              :tree-props="{ children: 'children' }"
              border
              style="width: 100%; margin-top: 15px"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
            >
              <el-table-column label="导出" width="80" align="center" fixed>
                <template #default="{ row }">
                  <el-checkbox
                    v-if="row.prop"
                    v-model="row.export"
                    @change="handleExportChange(row)"
                  />
                  <span v-else>-</span>
                </template>
              </el-table-column>

              <el-table-column label="列名" prop="label" min-width="200">
                <template #default="{ row }">
                  <span
                    :style="{ fontWeight: row.children ? 'bold' : 'normal' }"
                  >
                    {{ row.label }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="列宽" width="140" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-if="row.prop && row.export"
                    v-model="row.exportWidth"
                    :min="10"
                    :max="100"
                    size="small"
                    controls-position="right"
                    style="width: 120px"
                  />
                  <span v-else class="no-config">-</span>
                </template>
              </el-table-column>

              <el-table-column label="对齐方式" width="160" align="center">
                <template #default="{ row }">
                  <el-select
                    v-if="row.prop && row.export"
                    v-model="row.alignment"
                    size="small"
                    style="width: 130px"
                  >
                    <el-option label="居左" value="left">
                      <el-icon><Back /></el-icon>
                      居左
                    </el-option>
                    <el-option label="居中" value="center">
                      <el-icon><Minus /></el-icon>
                      居中
                    </el-option>
                    <el-option label="居右" value="right">
                      <el-icon><Right /></el-icon>
                      居右
                    </el-option>
                  </el-select>
                  <span v-else class="no-config">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="exporting" @click="handleExport">
          <el-icon v-if="!exporting"><Download /></el-icon>
          {{ exporting ? "导出中..." : "确认导出" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  Download,
  Select,
  Close,
  Setting,
  InfoFilled,
  Back,
  Minus,
  Right
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { exportMultiHeaderExcel } from "../utils/excelExport.js";
import PRESET_COLORS from "../utils/colorPresets";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  visibleColumns: {
    type: Array,
    default: () => []
  },
  tableData: {
    type: Array,
    default: () => []
  },
  globalStyle: {
    type: Object,
    default: () => ({})
  },
  cellStyles: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:modelValue", "export"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const activeTab = ref("basic");
const exporting = ref(false);
const presetColors = ref(PRESET_COLORS);

// 导出配置
const exportConfig = ref({
  fileName: "鄂尔多斯市统计数据",
  useUniformFont: false,
  fontFamily: "Microsoft YaHei",
  fontSize: 11,
  fontBold: false,
  fontColor: "#000000"
});

// 导出列数据
const exportColumnsData = ref([]);

// 监听可见列变化,初始化导出列数据
watch(
  () => props.visibleColumns,
  (newColumns) => {
    if (newColumns && newColumns.length > 0) {
      exportColumnsData.value = convertToExportData(newColumns);
    }
  },
  { immediate: true, deep: true }
);

/**
 * 转换为导出数据格式
 * 将嵌套的列配置转换为带有层级的表格数据
 */
function convertToExportData(columns, parentId = "") {
  return columns.map((col, index) => {
    const id = parentId ? `${parentId}-${index}` : `exp-${index}`;

    // 计算导出列宽(列表宽度的1/3,限制10-100)
    let exportWidth = 30;
    if (col.width) {
      exportWidth = Math.round(col.width / 3);
      exportWidth = Math.max(10, Math.min(100, exportWidth));
    }

    const node = {
      id,
      label: col.label,
      prop: col.prop,
      key: col.key,
      export: true, // 默认全选
      exportWidth: exportWidth,
      alignment: "center",
      originalWidth: col.width
    };

    if (col.children && col.children.length > 0) {
      node.children = convertToExportData(col.children, id);
    }

    return node;
  });
}

// 导出选择变化
function handleExportChange(row) {
  if (row.children) {
    setChildrenExport(row.children, row.export);
  }
}

function setChildrenExport(children, exportVal) {
  children.forEach((child) => {
    child.export = exportVal;
    if (child.children) {
      setChildrenExport(child.children, exportVal);
    }
  });
}

// 全选
function selectAllColumns() {
  setAllExport(exportColumnsData.value, true);
  ElMessage.success("已全选所有列");
}

// 全不选
function deselectAllColumns() {
  setAllExport(exportColumnsData.value, false);
  ElMessage.success("已取消全选");
}

function setAllExport(columns, exportVal) {
  columns.forEach((col) => {
    col.export = exportVal;
    if (col.children) {
      setAllExport(col.children, exportVal);
    }
  });
}

// 批量设置列宽
async function batchSetWidth() {
  try {
    const { value } = await ElMessageBox.prompt(
      "请输入统一的列宽(10-100)",
      "批量设置列宽",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[0-9]+$/,
        inputErrorMessage: "请输入有效的数字",
        inputValue: "30"
      }
    );

    const width = parseInt(value);
    if (width < 10 || width > 100) {
      ElMessage.warning("列宽范围应在 10-100 之间");
      return;
    }

    setAllWidth(exportColumnsData.value, width);
    ElMessage.success(`已将所有列宽设置为 ${width}`);
  } catch (error) {
    // 用户取消
  }
}

function setAllWidth(columns, width) {
  columns.forEach((col) => {
    if (col.prop && col.export) {
      col.exportWidth = width;
    }
    if (col.children) {
      setAllWidth(col.children, width);
    }
  });
}

// 导出
async function handleExport() {
  // 收集要导出的列
  const exportColumns = collectExportColumns(exportColumnsData.value);

  if (exportColumns.length === 0) {
    ElMessage.warning("请至少选择一列进行导出");
    return;
  }

  if (!exportConfig.value.fileName.trim()) {
    ElMessage.warning("请输入文件名");
    return;
  }

  exporting.value = true;

  try {
    // 准备导出配置
    const config = {
      fileName: exportConfig.value.fileName,
      useUniformFont: exportConfig.value.useUniformFont,
      headerBgColor: props.globalStyle.headerBgColor?.replace("#", ""),
      headerTextColor: props.globalStyle.headerTextColor?.replace("#", ""),
      headerFontSize: props.globalStyle.headerFontSize || 12,
      cellStyles: exportConfig.value.useUniformFont ? {} : props.cellStyles,
      columnAlignments: collectColumnAlignments(exportColumnsData.value)
    };

    // 如果使用统一字体
    if (exportConfig.value.useUniformFont) {
      config.uniformFont = {
        family: exportConfig.value.fontFamily,
        size: exportConfig.value.fontSize,
        bold: exportConfig.value.fontBold,
        color: exportConfig.value.fontColor?.replace("#", "") || "000000"
      };
    } else {
      // 使用列表样式
      config.fontSize = props.globalStyle.fontSize || 11;
      config.rowBgColor = props.globalStyle.rowBgColor?.replace("#", "");
      config.rowTextColor = props.globalStyle.rowTextColor?.replace("#", "");
    }

    // 执行导出
    await exportMultiHeaderExcel(
      exportColumns,
      props.tableData,
      config,
      exportConfig.value.fileName
    );

    ElMessage.success("导出成功!");
    visible.value = false;
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败: " + error.message);
  } finally {
    exporting.value = false;
  }
}

// 收集要导出的列
function collectExportColumns(columns) {
  const result = [];

  columns.forEach((col) => {
    if (col.children && col.children.length > 0) {
      const childColumns = collectExportColumns(col.children);
      if (childColumns.length > 0) {
        result.push({
          label: col.label,
          key: col.key,
          children: childColumns
        });
      }
    } else if (col.export && col.prop) {
      result.push({
        label: col.label,
        prop: col.prop,
        exportWidth: col.exportWidth,
        width: col.exportWidth,
        alignment: col.alignment
      });
    }
  });

  return result;
}

// 收集列对齐方式
function collectColumnAlignments(columns) {
  const alignments = {};

  function traverse(cols) {
    cols.forEach((col) => {
      if (col.prop && col.export) {
        alignments[col.prop] = col.alignment;
      }
      if (col.children) {
        traverse(col.children);
      }
    });
  }

  traverse(columns);
  return alignments;
}

function handleCancel() {
  visible.value = false;
}

function handleDialogClose() {
  // 对话框关闭时重置状态
  exporting.value = false;
}
</script>

<style scoped>
/* 弹框内容包装器 - 限制最大高度并内部滚动 */
.dialog-content-wrapper {
  max-height: 80vh;
  overflow-y: auto;
  padding: 2px;
}

.export-columns-section {
  padding: 10px 0;
}

.toolbar {
  margin-bottom: 15px;
}

.actions-bar {
  display: flex;
  gap: 10px;
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.no-config {
  color: #c0c4cc;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-input-group__append) {
  padding: 0 15px;
  background-color: #f5f7fa;
  color: #909399;
}
</style>
