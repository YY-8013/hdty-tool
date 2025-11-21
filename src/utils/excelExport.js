import ExcelJS from "exceljs";

class UniversalExcelExporter {
  constructor() {
    this.workbook = null;
    this.worksheet = null;
    this.flatColumns = [];
    this.headerLevels = 0;
  }

  /**
   * 初始化工作簿
   */
  initWorkbook(creator = "系统") {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = creator;
    this.workbook.created = new Date();
    return this;
  }

  /**
   * 添加工作表
   */
  addWorksheet(name = "Sheet1") {
    this.worksheet = this.workbook.addWorksheet(name);
    return this;
  }

  /**
   * 处理表头结构
   */
  processHeaderStructure(headerList) {
    this.flatColumns = [];
    this.headerLevels = this._calculateMaxDepth(headerList);

    const headerRows = Array.from({ length: this.headerLevels }, () => []);
    const mergeCells = [];

    this._buildHeadersFinal(headerList, headerRows, mergeCells, 1, 1);

    return {
      headerRows,
      mergeCells,
      leafColumns: this.flatColumns
    };
  }

  /**
   * 计算表头最大深度
   */
  _calculateMaxDepth(headers, currentDepth = 1) {
    let maxDepth = currentDepth;
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header.children && header.children.length > 0) {
        const childDepth = this._calculateMaxDepth(
          header.children,
          currentDepth + 1
        );
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    return maxDepth;
  }

  /**
   * 最终表头构建算法
   */
  _buildHeadersFinal(headers, headerRows, mergeCells, currentRow, startCol) {
    let currentCol = startCol;

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const hasChildren = header.children && header.children.length > 0;
      const colSpan = hasChildren ? this._countLeafNodes(header.children) : 1;

      // 设置当前header的位置
      headerRows[currentRow - 1][currentCol - 1] = header.label;

      // 处理水平合并
      if (colSpan > 1) {
        mergeCells.push({
          startRow: currentRow,
          startCol: currentCol,
          endRow: currentRow,
          endCol: currentCol + colSpan - 1
        });
      }

      if (hasChildren) {
        // 递归处理子节点
        currentCol = this._buildHeadersFinal(
          header.children,
          headerRows,
          mergeCells,
          currentRow + 1,
          currentCol
        );
      } else {
        // 叶子节点处理
        this.flatColumns.push({
          label: header.label,
          prop: header.prop,
          width: header.exportWidth || header.width || 15,
          colIndex: currentCol
        });

        // 垂直合并处理
        if (currentRow < this.headerLevels) {
          for (let row = currentRow; row < this.headerLevels; row++) {
            headerRows[row][currentCol - 1] = "";
          }

          mergeCells.push({
            startRow: currentRow,
            startCol: currentCol,
            endRow: this.headerLevels,
            endCol: currentCol
          });
        }

        currentCol++;
      }
    }

    return currentCol;
  }

  /**
   * 计算叶子节点数量
   */
  _countLeafNodes(headers) {
    let count = 0;
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header.children && header.children.length > 0) {
        count += this._countLeafNodes(header.children);
      } else {
        count++;
      }
    }
    return count;
  }

  /**
   * 构建动态表头
   */
  buildDynamicHeaders(headerList, headerStyle) {
    if (!this.worksheet) {
      throw new Error("请先添加工作表");
    }

    const { headerRows, mergeCells } = this.processHeaderStructure(headerList);

    // 添加表头行
    for (let i = 0; i < headerRows.length; i++) {
      const rowData = headerRows[i];
      const cleanRowData = [];
      for (let j = 0; j < rowData.length; j++) {
        cleanRowData.push(rowData[j] === undefined ? "" : rowData[j]);
      }
      const row = this.worksheet.addRow(cleanRowData);
      this.applyHeaderStyle(row, headerStyle);
    }

    // 应用合并单元格
    for (let i = 0; i < mergeCells.length; i++) {
      const merge = mergeCells[i];
      try {
        this.worksheet.mergeCells(
          merge.startRow,
          merge.startCol,
          merge.endRow,
          merge.endCol
        );
      } catch (error) {
        console.warn("合并单元格失败:", merge, error);
      }
    }

    return this;
  }

  /**
   * 应用表头样式
   */
  applyHeaderStyle(headerRow, customStyle = {}) {
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: customStyle.headerBgColor || "FF4A90E2" }
      };
      cell.font = {
        bold: true,
        size: customStyle.headerFontSize || 12,
        color: { argb: customStyle.headerTextColor || "FFFFFFFF" }
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D0D0" } },
        left: { style: "thin", color: { argb: "FFD0D0D0" } },
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
        right: { style: "thin", color: { argb: "FFD0D0D0" } }
      };
    });
  }

  /**
   * 添加数据行
   */
  addData(data, styleConfig = {}) {
    if (!this.worksheet) {
      throw new Error("请先添加工作表");
    }

    const cellStyles = styleConfig.cellStyles || {};

    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const rowValues = [];

      for (let j = 0; j < this.flatColumns.length; j++) {
        const col = this.flatColumns[j];
        const value = rowData[col.prop];
        rowValues.push(value !== undefined && value !== null ? value : "");
      }

      const dataRow = this.worksheet.addRow(rowValues);
      dataRow.height = 25;

      // 应用基础样式
      this.applyBaseRowStyle(dataRow, styleConfig);

      // 应用自定义单元格样式
      this.applyCustomCellStyles(dataRow, i, cellStyles);
    }

    return this;
  }

  /**
   * 应用基础行样式
   */
  applyBaseRowStyle(dataRow, styleConfig) {
    const fontSize = styleConfig.fontSize || 11;

    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } }
      };
      cell.font = { size: fontSize };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center"
      };
    });
  }

  /**
   * 应用自定义单元格样式
   */
  applyCustomCellStyles(dataRow, rowIndex, cellStyles) {
    for (const cellKey in cellStyles) {
      const [row, col] = cellKey.split("_").map(Number);

      if (row === rowIndex) {
        const style = cellStyles[cellKey];
        const cell = dataRow.getCell(col + 1);

        if (style.backgroundColor) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: this._colorToArgb(style.backgroundColor) }
          };
        }

        if (style.color || style.fontSize || style.fontWeight) {
          cell.font = {
            ...cell.font,
            size: style.fontSize || cell.font.size,
            color: style.color
              ? { argb: this._colorToArgb(style.color) }
              : cell.font.color,
            bold: style.fontWeight === "bold"
          };
        }
      }
    }
  }

  /**
   * 颜色转ARGB格式
   */
  _colorToArgb(color) {
    if (!color) return "FFFFFFFF";

    // 移除 # 号
    let hex = color.replace("#", "");

    // 如果是6位,添加FF作为alpha
    if (hex.length === 6) {
      hex = "FF" + hex;
    }

    return hex.toUpperCase();
  }

  /**
   * 设置列宽
   */
  setColumnWidth() {
    if (!this.worksheet) {
      throw new Error("请先添加工作表");
    }

    const columnConfig = [];
    for (let i = 0; i < this.flatColumns.length; i++) {
      const col = this.flatColumns[i];
      columnConfig.push({ width: col.width || 15 });
    }

    this.worksheet.columns = columnConfig;
    return this;
  }

  /**
   * 导出文件
   */
  async export(fileName = "数据导出") {
    if (!this.workbook) {
      throw new Error("请先初始化工作簿");
    }

    const buffer = await this.workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}_${new Date().getTime()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

/**
 * 导出多层级表头的Excel
 */
export async function exportMultiHeaderExcel(
  columns,
  data,
  exportConfig = {},
  fileName = "统计数据"
) {
  const exporter = new UniversalExcelExporter();

  exporter
    .initWorkbook("鄂尔多斯市统计系统")
    .addWorksheet("统计数据")
    .buildDynamicHeaders(columns, {
      headerBgColor: exportConfig.headerBgColor?.replace("#", "") || "4A90E2",
      headerTextColor:
        exportConfig.headerTextColor?.replace("#", "") || "FFFFFF",
      headerFontSize: exportConfig.headerFontSize || 12
    })
    .addData(data, {
      fontSize: exportConfig.fontSize || 11,
      cellStyles: exportConfig.cellStyles || {}
    })
    .setColumnWidth();

  await exporter.export(fileName);
}
