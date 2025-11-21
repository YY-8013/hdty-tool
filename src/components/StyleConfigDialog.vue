<template>
  <el-dialog
    v-model="visible"
    title="样式配置"
    width="950px"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 全局样式 -->
      <el-tab-pane label="全局样式" name="global">
        <el-form :model="globalStyle" label-width="130px">
          <el-divider content-position="left">表头样式</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="表头背景色">
                <el-color-picker
                  v-model="globalStyle.headerBgColor"
                  show-alpha
                  :predefine="presetColors"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="表头文字色">
                <el-color-picker
                  v-model="globalStyle.headerTextColor"
                  show-alpha
                  :predefine="presetColors"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="表头字体大小">
                <el-slider
                  v-model="globalStyle.headerFontSize"
                  :min="12"
                  :max="24"
                  show-input
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="表头字体粗细">
                <el-select v-model="globalStyle.headerFontWeight">
                  <el-option label="正常" value="normal" />
                  <el-option label="加粗" value="bold" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">数据行样式</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="数据行背景色">
                <el-color-picker
                  v-model="globalStyle.rowBgColor"
                  show-alpha
                  :predefine="presetColors"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="数据行文字色">
                <el-color-picker
                  v-model="globalStyle.rowTextColor"
                  show-alpha
                  :predefine="presetColors"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="数据行字体大小">
                <el-slider
                  v-model="globalStyle.fontSize"
                  :min="10"
                  :max="20"
                  show-input
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="边框颜色">
                <el-color-picker
                  v-model="globalStyle.borderColor"
                  show-alpha
                  :predefine="presetColors"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 单元格样式 -->
      <el-tab-pane label="单元格/行/列样式" name="cell">
        <div class="cell-style-content">
          <div class="cell-style-tip">
            <el-alert
              title="提示:双击表格单元格可以设置样式,支持单元格、整行、整列三种应用范围"
              type="info"
              :closable="false"
              show-icon
            />
          </div>

          <div v-if="selectedCell" class="cell-style-form">
            <el-tag
              type="success"
              size="large"
              effect="dark"
              class="selected-tag"
            >
              <el-icon><Select /></el-icon>
              已选中: 第 {{ selectedCell.row + 1 }} 行,第
              {{ selectedCell.col + 1 }} 列
            </el-tag>

            <!-- 应用范围选择 -->
            <el-form-item
              label="应用范围"
              label-width="100px"
              style="margin-top: 20px"
            >
              <el-radio-group v-model="applyScope" size="large">
                <el-radio-button label="cell">
                  <el-icon><Document /></el-icon>
                  当前单元格
                </el-radio-button>
                <el-radio-button label="row">
                  <el-icon><Grid /></el-icon>
                  整行
                </el-radio-button>
                <el-radio-button label="column">
                  <el-icon><Tickets /></el-icon>
                  整列(不含表头)
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-divider />

            <el-form :model="cellStyle" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="背景色">
                    <el-color-picker
                      v-model="cellStyle.backgroundColor"
                      show-alpha
                      :predefine="presetColors"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="文字颜色">
                    <el-color-picker
                      v-model="cellStyle.color"
                      show-alpha
                      :predefine="presetColors"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="字体大小">
                    <el-input-number
                      v-model="cellStyle.fontSize"
                      :min="10"
                      :max="24"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="字体粗细">
                    <el-select v-model="cellStyle.fontWeight">
                      <el-option label="正常" value="normal" />
                      <el-option label="加粗" value="bold" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <!-- 单元格样式的操作按钮 -->
            <div class="cell-actions">
              <el-button type="primary" @click="applyCellStyle">
                <el-icon><Check /></el-icon>
                应用样式
              </el-button>
              <el-button @click="clearCellStyle">
                <el-icon><Delete /></el-icon>
                清除样式
              </el-button>
            </div>
          </div>

          <div v-else class="no-cell-selected">
            <el-empty description="请双击表格中的任意单元格进行样式设置" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 只在全局样式标签页显示底部按钮 -->
    <template #footer v-if="activeTab === 'global'">
      <div class="dialog-footer">
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>
          重置所有
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">
          <el-icon><Check /></el-icon>
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  Check,
  Delete,
  RefreshLeft,
  Select,
  Document,
  Grid,
  Tickets
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PRESET_COLORS from "../utils/colorPresets";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  globalStyleConfig: {
    type: Object,
    default: () => ({})
  },
  cellStylesConfig: {
    type: Object,
    default: () => ({})
  },
  selectedCell: {
    type: Object,
    default: null
  },
  totalRows: {
    type: Number,
    default: 0
  },
  totalCols: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["update:modelValue", "confirm", "update:cellStyle"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const activeTab = ref("global");
const applyScope = ref("cell");
const presetColors = ref(PRESET_COLORS);

// 全局样式
const globalStyle = ref({
  headerBgColor: "#409eff",
  headerTextColor: "#ffffff",
  headerFontSize: 14,
  headerFontWeight: "bold",
  rowBgColor: "#ffffff",
  rowTextColor: "#606266",
  fontSize: 13,
  borderColor: "#ebeef5"
});

// 单元格样式
const cellStyle = ref({
  backgroundColor: "#ffffff",
  color: "#606266",
  fontSize: 13,
  fontWeight: "normal"
});

// 监听全局样式配置变化
watch(
  () => props.globalStyleConfig,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      globalStyle.value = { ...globalStyle.value, ...newVal };
    }
  },
  { immediate: true, deep: true }
);

// 监听选中单元格变化
watch(
  () => props.selectedCell,
  (newVal) => {
    if (newVal) {
      const cellKey = `${newVal.row}_${newVal.col}`;
      const existingStyle = props.cellStylesConfig[cellKey];
      if (existingStyle) {
        cellStyle.value = { ...cellStyle.value, ...existingStyle };
      } else {
        cellStyle.value = {
          backgroundColor: "#ffffff",
          color: "#606266",
          fontSize: 13,
          fontWeight: "normal"
        };
      }
      // 切换到单元格样式标签
      activeTab.value = "cell";
    }
  },
  { immediate: true }
);

// 标签页切换
function handleTabChange(tabName) {
  // 可以在这里添加切换逻辑
}

// 应用单元格样式
function applyCellStyle() {
  if (!props.selectedCell) {
    ElMessage.warning("请先选择一个单元格");
    return;
  }

  const stylesToApply = [];

  switch (applyScope.value) {
    case "cell":
      stylesToApply.push({
        row: props.selectedCell.row,
        col: props.selectedCell.col
      });
      break;

    case "row":
      for (let col = 0; col < props.totalCols; col++) {
        stylesToApply.push({
          row: props.selectedCell.row,
          col: col
        });
      }
      break;

    case "column":
      for (let row = 0; row < props.totalRows; row++) {
        stylesToApply.push({
          row: row,
          col: props.selectedCell.col
        });
      }
      break;
  }

  stylesToApply.forEach(({ row, col }) => {
    const cellKey = `${row}_${col}`;
    emit("update:cellStyle", cellKey, { ...cellStyle.value });
  });

  const scopeText = {
    cell: "单元格",
    row: "整行",
    column: "整列"
  };
  ElMessage.success(`${scopeText[applyScope.value]}样式已应用`);
}

// 清除单元格样式
function clearCellStyle() {
  if (!props.selectedCell) {
    ElMessage.warning("请先选择一个单元格");
    return;
  }

  const cellsToClear = [];

  switch (applyScope.value) {
    case "cell":
      cellsToClear.push({
        row: props.selectedCell.row,
        col: props.selectedCell.col
      });
      break;

    case "row":
      for (let col = 0; col < props.totalCols; col++) {
        cellsToClear.push({
          row: props.selectedCell.row,
          col: col
        });
      }
      break;

    case "column":
      for (let row = 0; row < props.totalRows; row++) {
        cellsToClear.push({
          row: row,
          col: props.selectedCell.col
        });
      }
      break;
  }

  cellsToClear.forEach(({ row, col }) => {
    const cellKey = `${row}_${col}`;
    emit("update:cellStyle", cellKey, null);
  });

  cellStyle.value = {
    backgroundColor: "#ffffff",
    color: "#606266",
    fontSize: 13,
    fontWeight: "normal"
  };

  const scopeText = {
    cell: "单元格",
    row: "整行",
    column: "整列"
  };
  ElMessage.success(`${scopeText[applyScope.value]}样式已清除`);
}

// 重置所有样式
function handleReset() {
  globalStyle.value = {
    headerBgColor: "#409eff",
    headerTextColor: "#ffffff",
    headerFontSize: 14,
    headerFontWeight: "bold",
    rowBgColor: "#ffffff",
    rowTextColor: "#606266",
    fontSize: 13,
    borderColor: "#ebeef5"
  };
  ElMessage.success("全局样式已重置");
}

function handleConfirm() {
  emit("confirm", {
    globalStyle: { ...globalStyle.value }
  });
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}
</script>

<style scoped>
.cell-style-content {
  min-height: 400px;
}

.cell-style-tip {
  margin-bottom: 20px;
}

.cell-style-form {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 14px;
}

.no-cell-selected {
  padding: 80px 20px;
  text-align: center;
}

.cell-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-radio-button__inner) {
  padding: 12px 20px;
}

:deep(.el-color-picker__trigger) {
  width: 50px;
  height: 36px;
}
</style>
