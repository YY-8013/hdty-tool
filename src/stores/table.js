import { defineStore } from "pinia";
import { ref } from "vue";

export const useTableStore = defineStore("table", () => {
  // 列配置
  const columnConfig = ref([]);
  const columnWidths = ref({});

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
  const cellStyles = ref({});

  // 更新列配置
  function updateColumnConfig(config) {
    columnConfig.value = config;
  }

  // 更新列宽
  function updateColumnWidth(prop, width) {
    columnWidths.value[prop] = width;
  }

  // 批量更新列宽
  function updateColumnWidths(widths) {
    columnWidths.value = { ...columnWidths.value, ...widths };
  }

  // 更新全局样式
  function updateGlobalStyle(style) {
    globalStyle.value = { ...globalStyle.value, ...style };
  }

  // 更新单元格样式
  function updateCellStyle(cellKey, style) {
    if (style === null) {
      delete cellStyles.value[cellKey];
    } else {
      cellStyles.value[cellKey] = style;
    }
  }

  // 重置所有配置
  function resetAll() {
    columnConfig.value = [];
    columnWidths.value = {};
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
    cellStyles.value = {};
  }

  return {
    columnConfig,
    columnWidths,
    globalStyle,
    cellStyles,
    updateColumnConfig,
    updateColumnWidth,
    updateColumnWidths,
    updateGlobalStyle,
    updateCellStyle,
    resetAll
  };
});
