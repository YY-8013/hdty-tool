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

        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="id"
          default-expand-all
          draggable
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          @node-drop="handleNodeDrop"
          class="column-tree"
        >
          <template #default="{ node, data }">
            <div class="tree-node-content">
              <div class="node-info">
                <el-checkbox
                  v-model="data.visible"
                  @change="handleVisibleChange(data)"
                  class="node-checkbox"
                  @click.stop
                />
                <span class="node-label">{{ data.label }}</span>
                <span v-if="data.prop" class="node-prop"
                  >({{ data.prop }})</span
                >
              </div>
              <div class="node-actions">
                <el-input-number
                  v-if="data.prop"
                  v-model="data.width"
                  :min="60"
                  :max="500"
                  size="small"
                  controls-position="right"
                  placeholder="列宽"
                  style="width: 120px"
                  @click.stop
                />
              </div>
            </div>
          </template>
        </el-tree>
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
import { Plus, Minus, RefreshLeft, Check } from "@element-plus/icons-vue";
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

const treeRef = ref(null);
const treeData = ref([]);
const originalColumns = ref([]);

/**
 * 监听列配置变化
 * 当传入新的列配置时,转换为树形数据格式
 */
watch(
  () => props.columns,
  (newColumns) => {
    if (newColumns && newColumns.length > 0) {
      originalColumns.value = JSON.parse(JSON.stringify(newColumns));
      treeData.value = convertToTreeData(
        JSON.parse(JSON.stringify(newColumns))
      );
    }
  },
  { immediate: true, deep: true }
);

/**
 * 转换为树形数据格式
 * 将嵌套的列配置转换为带有ID的树形数据
 */
function convertToTreeData(columns, parentId = "") {
  const result = [];
  columns.forEach((col, index) => {
    const id = parentId ? `${parentId}-${index}` : `col-${index}`;
    const node = {
      id,
      label: col.label,
      prop: col.prop,
      key: col.key,
      visible: col.visible !== false,
      width: col.width || 120
    };

    if (col.children && col.children.length > 0) {
      node.children = convertToTreeData(col.children, id);
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
  // 遍历所有节点的ID并展开
  const expandAllNodes = (nodes) => {
    nodes.forEach((node) => {
      if (treeRef.value) {
        treeRef.value.store.nodesMap[node.id].expanded = true;
      }
      if (node.children && node.children.length > 0) {
        expandAllNodes(node.children);
      }
    });
  };

  if (treeRef.value && treeData.value.length > 0) {
    expandAllNodes(treeData.value);
    ElMessage.success("已展开所有节点");
  }
}

/**
 * 全部收起
 */
function collapseAll() {
  // 遍历所有节点的ID并收起
  const collapseAllNodes = (nodes) => {
    nodes.forEach((node) => {
      if (treeRef.value) {
        treeRef.value.store.nodesMap[node.id].expanded = false;
      }
      if (node.children && node.children.length > 0) {
        collapseAllNodes(node.children);
      }
    });
  };

  if (treeRef.value && treeData.value.length > 0) {
    collapseAllNodes(treeData.value);
    ElMessage.success("已收起所有节点");
  }
}

/**
 * 允许拖拽
 */
function allowDrag(draggingNode) {
  return true;
}

/**
 * 允许放置
 */
function allowDrop(draggingNode, dropNode, type) {
  // 允许前后插入和内部插入
  return true;
}

/**
 * 节点拖拽结束处理
 */
function handleNodeDrop(draggingNode, dropNode, dropType, ev) {
  ElMessage.success("已调整列顺序");
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

    treeData.value = convertToTreeData(
      JSON.parse(JSON.stringify(originalColumns.value))
    );
    ElMessage.success("已重置列配置");
  } catch (error) {
    // 用户取消
  }
}

/**
 * 转换回列配置格式
 * 将树形数据转换回嵌套的列配置结构
 */
function convertToColumns(treeData) {
  return treeData.map((node) => {
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
 * 将树形数据转换后发送给父组件
 */
function handleConfirm() {
  const newColumns = convertToColumns(treeData.value);
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
  max-height: 70vh; /* 降低高度以适应margin-top */
  overflow-y: auto;
  padding: 2px;
}

/* 优化Element Plus弹框的margin-top */
:deep(.el-dialog) {
  margin-top: 5vh !important; /* 减小顶部边距 */
}

.column-config-container {
  padding: 10px 0;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

/* 树形控件样式 */
.column-tree {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.tree-node-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  font-size: 14px;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-checkbox {
  margin-right: 5px;
}

.node-label {
  font-weight: 500;
  color: #303133;
}

.node-prop {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}

.node-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
  background-color: #ecf5ff;
  border: 2px dashed #409eff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
