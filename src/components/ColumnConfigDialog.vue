<template>
  <el-dialog
    v-model="visible"
    title="列配置"
    width="700px"
    :close-on-click-modal="false"
  >
    <div class="column-config-container">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        node-key="id"
        default-expand-all
        draggable
        @node-drop="handleNodeDrop"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <el-checkbox
              v-model="data.visible"
              @change="handleCheckChange(data)"
            >
              {{ node.label }}
            </el-checkbox>
            <span class="node-info">
              <el-tag v-if="data.children" size="small" type="info">
                {{ data.children.length }} 个子列
              </el-tag>
            </span>
          </div>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";

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
const treeProps = {
  label: "label",
  children: "children"
};

// 初始化树形数据
watch(
  () => props.columns,
  (newColumns) => {
    if (newColumns && newColumns.length > 0) {
      treeData.value = convertToTreeData(newColumns);
    }
  },
  { immediate: true, deep: true }
);

// 转换为树形数据
function convertToTreeData(columns, parentId = "") {
  return columns.map((col, index) => {
    const id = parentId ? `${parentId}-${index}` : `${index}`;
    const node = {
      id,
      label: col.label,
      prop: col.prop,
      key: col.key,
      visible: col.visible !== false,
      width: col.width,
      fixed: col.fixed,
      children: col.children ? convertToTreeData(col.children, id) : undefined
    };
    return node;
  });
}

// 复选框变化
function handleCheckChange(data) {
  // 如果有子节点,同步子节点的状态
  if (data.children) {
    setChildrenVisible(data.children, data.visible);
  }
}

function setChildrenVisible(children, visible) {
  children.forEach((child) => {
    child.visible = visible;
    if (child.children) {
      setChildrenVisible(child.children, visible);
    }
  });
}

// 节点拖拽
function handleNodeDrop(draggingNode, dropNode, dropType, ev) {
  ElMessage.success("列顺序已调整");
}

// 转换回列配置
function convertToColumns(treeData) {
  return treeData.map((node) => {
    const col = {
      label: node.label,
      visible: node.visible
    };

    if (node.prop) col.prop = node.prop;
    if (node.key) col.key = node.key;
    if (node.width) col.width = node.width;
    if (node.fixed) col.fixed = node.fixed;

    if (node.children) {
      col.children = convertToColumns(node.children);
    }

    return col;
  });
}

function handleConfirm() {
  const newColumns = convertToColumns(treeData.value);
  emit("confirm", newColumns);
  visible.value = false;
  ElMessage.success("列配置已应用");
}

function handleCancel() {
  visible.value = false;
}
</script>

<style scoped>
.column-config-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
}

.node-info {
  margin-left: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-tree-node__content) {
  height: 40px;
  border-bottom: 1px solid #f5f5f5;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
</style>
