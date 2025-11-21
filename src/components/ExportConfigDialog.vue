<template>
  <el-dialog
    v-model="visible"
    title="导出配置"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab">
      <!-- 导出列配置 -->
      <el-tab-pane label="导出列" name="columns">
        <div style="margin-bottom: 15px">
          <el-alert
            title="提示:只有勾选的列才会被导出，可以单独设置每列的宽度"
            type="info"
            :closable="false"
            show-icon
          />
        </div>

        <div style="margin-bottom: 15px; display: flex; gap: 10px">
          <el-button size="small" @click="selectAll">
            <el-icon><Select /></el-icon>
            全选
          </el-button>
          <el-button size="small" @click="deselectAll">
            <el-icon><Close /></el-icon>
            全不选
          </el-button>
          <el-button size="small" @click="setAllWidth">
            <el-icon><Setting /></el-icon>
            统一设置宽度
          </el-button>
        </div>

        <el-tree
          ref="exportTreeRef"
          :data="exportTreeData"
          :props="treeProps"
          node-key="id"
          default-expand-all
          show-checkbox
          @check="handleCheckChange"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <span class="node-label">{{ node.label }}</span>
              <el-input-number
                v-if="!data.children"
                v-model="data.exportWidth"
                :min="50"
                :max="300"
                size="small"
                style="margin-left: 10px; width: 120px"
                @click.stop
              >
                <template #prefix>宽度:</template>
              </el-input-number>
            </div>
          </template>
        </el-tree>
      </el-tab-pane>

      <!-- 导出样式配置 -->
      <el-tab-pane label="导出样式" name="style">
        <el-form :model="exportStyle" label-width="130px">
          <el-divider content-position="left">表头样式</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="表头背景色">
                <el-color-picker v-model="exportStyle.headerBgColor" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="表头文字色">
                <el-color-picker v-model="exportStyle.headerTextColor" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="表头字体大小">
                <el-input-number
                  v-model="exportStyle.headerFontSize"
                  :min="10"
                  :max="24"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">数据行样式</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="数据行字体大小">
                <el-input-number
                  v-model="exportStyle.fontSize"
                  :min="10"
                  :max="20"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
    </el-tabs>

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
import { Download, Select, Close, Setting } from "@element-plus/icons-vue";
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

const emit = defineEmits(["update:modelValue", "export"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const activeTab = ref("columns");
const exportTreeRef = ref(null);
const exportTreeData = ref([]);
const exporting = ref(false);

const treeProps = {
  label: "label",
  children: "children"
};

const exportStyle = ref({
  headerBgColor: "#4A90E2",
  headerTextColor: "#FFFFFF",
  headerFontSize: 12,
  fontSize: 11
});

// 初始化导出树数据
watch(
  () => props.columns,
  (newColumns) => {
    if (newColumns && newColumns.length > 0) {
      exportTreeData.value = convertToExportTree(newColumns);
      // 默认全选
      setTimeout(() => {
        if (exportTreeRef.value) {
          const allKeys = getAllNodeKeys(exportTreeData.value);
          exportTreeRef.value.setCheckedKeys(allKeys);
        }
      }, 100);
    }
  },
  { immediate: true, deep: true }
);

function convertToExportTree(columns, parentId = "") {
  return columns.map((col, index) => {
    const id = parentId ? `${parentId}-${index}` : `exp-${index}`;
    const node = {
      id,
      label: col.label,
      prop: col.prop,
      key: col.key,
      exportWidth: col.width || 100,
      children: col.children ? convertToExportTree(col.children, id) : undefined
    };
    return node;
  });
}

function getAllNodeKeys(nodes) {
  const keys = [];
  nodes.forEach((node) => {
    keys.push(node.id);
    if (node.children) {
      keys.push(...getAllNodeKeys(node.children));
    }
  });
  return keys;
}

function handleCheckChange() {
  // 处理选中变化
}

// 全选
function selectAll() {
  const allKeys = getAllNodeKeys(exportTreeData.value);
  exportTreeRef.value.setCheckedKeys(allKeys);
  ElMessage.success("已全选所有列");
}

// 全不选
function deselectAll() {
  exportTreeRef.value.setCheckedKeys([]);
  ElMessage.success("已取消全选");
}

// 统一设置宽度
async function setAllWidth() {
  try {
    const { value } = await ElMessageBox.prompt(
      "请输入统一的列宽(像素)",
      "设置列宽",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[0-9]+$/,
        inputErrorMessage: "请输入有效的数字",
        inputValue: "100"
      }
    );

    const width = parseInt(value);
    if (width < 50 || width > 300) {
      ElMessage.warning("列宽范围应在 50-300 之间");
      return;
    }

    // 递归设置所有叶子节点的宽度
    function setWidthRecursive(nodes) {
      nodes.forEach((node) => {
        if (node.children) {
          setWidthRecursive(node.children);
        } else {
          node.exportWidth = width;
        }
      });
    }

    setWidthRecursive(exportTreeData.value);
    ElMessage.success(`已将所有列宽设置为 ${width} 像素`);
  } catch (error) {
    // 用户取消
  }
}

function getCheckedColumns() {
  const checkedKeys = exportTreeRef.value.getCheckedKeys();
  const checkedNodes = exportTreeRef.value.getCheckedNodes();

  // 构建选中的列配置
  return buildCheckedColumns(exportTreeData.value, checkedKeys);
}

function buildCheckedColumns(nodes, checkedKeys) {
  const result = [];

  nodes.forEach((node) => {
    if (checkedKeys.includes(node.id)) {
      const col = {
        label: node.label
      };

      if (node.prop) {
        col.prop = node.prop;
        col.exportWidth = node.exportWidth;
      }
      if (node.key) col.key = node.key;

      if (node.children) {
        const childCols = buildCheckedColumns(node.children, checkedKeys);
        if (childCols.length > 0) {
          col.children = childCols;
        }
      }

      result.push(col);
    }
  });

  return result;
}

function getColumnWidths() {
  const widths = {};

  function traverse(nodes) {
    nodes.forEach((node) => {
      if (node.prop) {
        widths[node.prop] = node.exportWidth;
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(exportTreeData.value);
  return widths;
}

async function handleExport() {
  const checkedColumns = getCheckedColumns();

  if (checkedColumns.length === 0) {
    ElMessage.warning("请至少选择一列进行导出");
    return;
  }

  exporting.value = true;

  try {
    const exportConfig = {
      columns: checkedColumns,
      columnWidths: getColumnWidths(),
      ...exportStyle.value
    };

    emit("export", exportConfig);

    setTimeout(() => {
      exporting.value = false;
      visible.value = false;
    }, 500);
  } catch (error) {
    exporting.value = false;
    ElMessage.error("导出失败: " + error.message);
  }
}

function handleCancel() {
  visible.value = false;
}
</script>

<style scoped>
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
}

.node-label {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-tree-node__content) {
  height: 45px;
  border-bottom: 1px solid #f5f5f5;
}
</style>
