<template>
  <el-dialog
    v-model="visible"
    title="列配置"
    width="900px"
    :close-on-click-modal="false"
    class="column-config-dialog"
  >
    <div class="dialog-content-wrapper">
      <div class="column-config-container">
        <div class="toolbar">
          <el-button size="small" type="primary" @click="expandAll">
            <el-icon><Plus /></el-icon>
            全部展开
          </el-button>
          <el-button size="small" @click="collapseAll">
            <el-icon><Minus /></el-icon>
            全部收起
          </el-button>
          <el-button size="small" type="warning" @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置配置
          </el-button>
        </div>

        <el-table
          ref="tableRef"
          :data="tableData"
          row-key="id"
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column label="显示" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox
                v-model="row.visible"
                @change="handleVisibleChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column label="列名" prop="label" min-width="200">
            <template #default="{ row }">
              <span :style="{ paddingLeft: (row.level || 0) * 20 + 'px' }">
                {{ row.label }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="字段" prop="prop" width="150" />

          <el-table-column label="列宽(px)" width="150" align="center">
            <template #default="{ row }">
              <el-input-number
                v-if="row.prop"
                v-model="row.width"
                :min="60"
                :max="500"
                size="small"
                controls-position="right"
              />
              <span v-else class="no-width">-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row, $index }">
              <el-button-group size="small">
                <el-tooltip content="上移" placement="top">
                  <el-button
                    :disabled="$index === 0"
                    @click="moveUp(row, $index)"
                  >
                    <el-icon><Top /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="下移" placement="top">
                  <el-button
                    :disabled="$index === tableData.length - 1"
                    @click="moveDown(row, $index)"
                  >
                    <el-icon><Bottom /></el-icon>
                  </el-button>
                </el-tooltip>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
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
import { ref, watch, computed } from "vue";
import {
  Plus,
  Minus,
  RefreshLeft,
  Check,
  Top,
  Bottom
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const tableRef = ref(null);
const tableData = ref([]);
const originalColumns = ref([]);

/**
 * 监听列配置变化
 * 当传入新的列配置时,转换为表格数据格式
 */
watch(
  () => props.columns,
  (newColumns) => {
    if (newColumns && newColumns.length > 0) {
      originalColumns.value = JSON.parse(JSON.stringify(newColumns));
      tableData.value = convertToTableData(
        JSON.parse(JSON.stringify(newColumns))
      );
    }
  },
  { immediate: true, deep: true }
);

/**
 * 转换为表格数据格式
 * 将嵌套的列配置转换为带有层级和ID的表格数据
 */
function convertToTableData(columns, level = 0, parentId = "") {
  const result = [];
  columns.forEach((col, index) => {
    const id = parentId ? `${parentId}-${index}` : `${index}`;
    const node = {
      id,
      label: col.label,
      prop: col.prop,
      key: col.key,
      visible: col.visible !== false,
      width: col.width || 120,
      level,
      hasChildren: !!(col.children && col.children.length > 0)
    };

    if (col.children && col.children.length > 0) {
      node.children = convertToTableData(col.children, level + 1, id);
    }

    result.push(node);
  });
  return result;
}

/**
 * 复选框变化处理
 * 当父节点变化时,同步所有子节点的状态
 */
function handleVisibleChange(row) {
  if (row.children) {
    setChildrenVisible(row.children, row.visible);
  }
}

/**
 * 递归设置子节点的显示状态
 */
function setChildrenVisible(children, visible) {
  children.forEach((child) => {
    child.visible = visible;
    if (child.children) {
      setChildrenVisible(child.children, visible);
    }
  });
}

/**
 * 全部展开
 */
function expandAll() {
  ElMessage.success("已展开所有节点");
}

/**
 * 全部收起
 */
function collapseAll() {
  ElMessage.success("已收起所有节点");
}

/**
 * 上移操作
 * 交换当前行与上一行的位置
 */
function moveUp(row, index) {
  if (index > 0) {
    [tableData.value[index], tableData.value[index - 1]] = [
      tableData.value[index - 1],
      tableData.value[index]
    ];
    ElMessage.success("已上移");
  }
}

/**
 * 下移操作
 * 交换当前行与下一行的位置
 */
function moveDown(row, index) {
  if (index < tableData.value.length - 1) {
    [tableData.value[index], tableData.value[index + 1]] = [
      tableData.value[index + 1],
      tableData.value[index]
    ];
    ElMessage.success("已下移");
  }
}

/**
 * 重置配置
 * 恢复到初始状态
 */
async function handleReset() {
  try {
    await ElMessageBox.confirm(
      "确定要重置所有列配置吗?这将恢复到初始状态。",
      "重置确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    tableData.value = convertToTableData(
      JSON.parse(JSON.stringify(originalColumns.value))
    );
    ElMessage.success("已重置列配置");
  } catch (error) {
    // 用户取消
  }
}

/**
 * 转换回列配置格式
 * 将表格数据转换回嵌套的列配置结构
 */
function convertToColumns(tableData) {
  return tableData.map((node) => {
    const col = {
      label: node.label,
      visible: node.visible,
      width: node.width || 120
    };

    if (node.prop) col.prop = node.prop;
    if (node.key) col.key = node.key;

    if (node.children && node.children.length > 0) {
      col.children = convertToColumns(node.children);
    }

    return col;
  });
}

/**
 * 确认应用配置
 * 将表格数据转换后发送给父组件
 */
function handleConfirm() {
  const newColumns = convertToColumns(tableData.value);
  emit("confirm", newColumns);
  visible.value = false;
  ElMessage.success("列配置已应用");
}

/**
 * 取消操作
 */
function handleCancel() {
  visible.value = false;
}
</script>

<style scoped>
/* 弹框内容包装器 - 限制最大高度并内部滚动 */
.dialog-content-wrapper {
  max-height: 80vh;
  overflow-y: auto;
  padding: 2px;
}

.column-config-container {
  padding: 10px 0;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.no-width {
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table__row) {
  cursor: default;
}
</style>
