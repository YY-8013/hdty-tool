import ExcelJS from "exceljs";

/**
 * 通用Excel导出工具类
 * 支持多层级表头、自定义样式、单元格样式等功能
 */
class UniversalExcelExporter {
  constructor() {
    this.workbook = null;
    this.worksheet = null;
    this.flatColumns = [];
    this.headerLevels = 0;
  }

  /**
   * 初始化工作簿
   * @param {string} creator - 创建者名称
   */
  initWorkbook(creator = "系统") {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = creator;
    this.workbook.created = new Date();
    return this;
  }

  /**
   * 添加工作表
   * @param {string} name - 工作表名称
   */
  addWorksheet(name = "Sheet1") {
    this.worksheet = this.workbook.addWorksheet(name);
    return this;
  }

  /**
   * 处理表头结构
   * 将嵌套的列配置转换为表头行和合并单元格信息
   * @param {Array} headerList - 列配置数组
   */
  processHeaderStructure(headerList) {
    this.flatColumns = [];
    this.headerLevels = this._calculateMaxDepth(headerList);
    const headerRows = Array.from({ length: this.headerLevels }, () => []);
    const mergeCells = [];
    this._buildHeadersFinal(headerList, headerRows, mergeCells, 1, 1);
    return { headerRows, mergeCells, leafColumns: this.flatColumns };
  }

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

  _buildHeadersFinal(headers, headerRows, mergeCells, currentRow, startCol) {
    let currentCol = startCol;
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const hasChildren = header.children && header.children.length > 0;
      const colSpan = hasChildren ? this._countLeafNodes(header.children) : 1;
      headerRows[currentRow - 1][currentCol - 1] = header.label;
      if (colSpan > 1) {
        mergeCells.push({
          startRow: currentRow,
          startCol: currentCol,
          endRow: currentRow,
          endCol: currentCol + colSpan - 1
        });
      }
      if (hasChildren) {
        currentCol = this._buildHeadersFinal(
          header.children,
          headerRows,
          mergeCells,
          currentRow + 1,
          currentCol
        );
      } else {
        this.flatColumns.push({
          label: header.label,
          prop: header.prop,
          width: header.exportWidth || header.width || 15,
          alignment: header.alignment || "center",
          colIndex: currentCol
        });
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

  _countLeafNodes(headers) {
    let count = 0;
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      count +=
        header.children && header.children.length > 0
          ? this._countLeafNodes(header.children)
          : 1;
    }
    return count;
  }

  /**
   * 构建动态表头
   * @param {Array} headerList - 列配置
   * @param {Object} headerStyle - 表头样式配置
   */
  buildDynamicHeaders(headerList, headerStyle) {
    if (!this.worksheet) throw new Error("请先添加工作表");
    const { headerRows, mergeCells } = this.processHeaderStructure(headerList);
    for (let i = 0; i < headerRows.length; i++) {
      const cleanRowData = headerRows[i].map((v) => (v === undefined ? "" : v));
      const row = this.worksheet.addRow(cleanRowData);
      this.applyHeaderStyle(row, headerStyle);
    }
    mergeCells.forEach((merge) => {
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
    });
    return this;
  }

  /**
   * 应用表头样式
   * @param {Object} headerRow - 表头行对象
   * @param {Object} customStyle - 自定义样式
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
   * @param {Array} data - 数据数组
   * @param {Object} styleConfig - 样式配置
   */
  addData(data, styleConfig = {}) {
    if (!this.worksheet) throw new Error("请先添加工作表");
    const cellStyles = styleConfig.cellStyles || {};
    const uniformFont = styleConfig.uniformFont;
    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const rowValues = this.flatColumns.map((col) => {
        const value = rowData[col.prop];
        return value !== undefined && value !== null ? value : "";
      });
      const dataRow = this.worksheet.addRow(rowValues);
      dataRow.height = 25;
      if (uniformFont) {
        this.applyUniformFont(dataRow, uniformFont);
      } else {
        this.applyCustomCellStyles(dataRow, i, cellStyles, styleConfig);
      }
      this.applyColumnAlignments(dataRow);
    }
    return this;
  }

  /**
   * 应用统一字体样式
   * @param {Object} dataRow - 数据行对象
   * @param {Object} uniformFont - 统一字体配置
   */
  applyUniformFont(dataRow, uniformFont) {
    dataRow.eachCell((cell) => {
      cell.font = {
        name: uniformFont.family || "Microsoft YaHei",
        size: uniformFont.size || 11,
        bold: uniformFont.bold || false,
        color: { argb: this._colorToArgb(uniformFont.color || "#000000") }
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } }
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  }

  /**
   * 应用自定义单元格样式
   * @param {Object} dataRow - 数据行对象
   * @param {number} rowIndex - 行索引
   * @param {Object} cellStyles - 单元格样式对象
   * @param {Object} styleConfig - 样式配置
   */
  applyCustomCellStyles(dataRow, rowIndex, cellStyles, styleConfig) {
    const fontSize = styleConfig.fontSize || 11;
    dataRow.eachCell((cell, colNumber) => {
      const cellKey = `${rowIndex}_${colNumber - 1}`;
      const style = cellStyles[cellKey];

      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } }
      };

      if (style) {
        if (style.backgroundColor) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: this._colorToArgb(style.backgroundColor) }
          };
        }
        cell.font = {
          size: style.fontSize || fontSize,
          color: style.color
            ? { argb: this._colorToArgb(style.color) }
            : { argb: "FF000000" },
          bold: style.fontWeight === "bold"
        };
      } else {
        cell.font = { size: fontSize };
      }

      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  }

  /**
   * 应用列对齐方式
   * @param {Object} dataRow - 数据行对象
   */
  applyColumnAlignments(dataRow) {
    dataRow.eachCell((cell, colNumber) => {
      const col = this.flatColumns[colNumber - 1];
      if (col && col.alignment) {
        cell.alignment = { ...cell.alignment, horizontal: col.alignment };
      }
    });
  }

  /**
   * 颜色转换为ARGB格式
   * @param {string} color - 颜色值,支持 #RGB, #RRGGBB, RRGGBB 等格式
   * @returns {string} ARGB格式的颜色值 (例: FFFF0000 表示红色)
   */
  _colorToArgb(color) {
    if (!color) return "FFFFFFFF"; // 默认白色

    // 移除 # 号
    let hex = color.replace("#", "").replace("0x", "");

    // 处理三位简写 #RGB -> #RRGGBB
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    // 确保是 6 位频色值
    if (hex.length === 6) {
      hex = "FF" + hex; // 添加完全不透明的 Alpha 通道
    }

    // 确保是 8 位 ARGB
    if (hex.length !== 8) {
      console.warn(`无效的颜色值: ${color}, 使用默认白色`);
      return "FFFFFFFF";
    }

    return hex.toUpperCase();
  }

  /**
   * 设置列宽
   */
  setColumnWidth() {
    if (!this.worksheet) throw new Error("请先添加工作表");
    this.worksheet.columns = this.flatColumns.map((col) => ({
      width: col.width || 15
    }));
    return this;
  }

  /**
   * 导出Excel文件
   * @param {string} fileName - 文件名
   */
  async export(fileName = "数据导出") {
    if (!this.workbook) throw new Error("请先初始化工作簿");
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
 * 导出多层级表头的Excel文件
 * @param {Array} columns - 列配置数组(支持嵌套)
 * @param {Array} data - 数据数组
 * @param {Object} exportConfig - 导出配置
 * @param {string} fileName - 文件名
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
      headerBgColor: exportConfig.headerBgColor || "4A90E2",
      headerTextColor: exportConfig.headerTextColor || "FFFFFF",
      headerFontSize: exportConfig.headerFontSize || 12
    })
    .addData(data, {
      fontSize: exportConfig.fontSize || 11,
      cellStyles: exportConfig.cellStyles || {},
      uniformFont: exportConfig.uniformFont
    })
    .setColumnWidth();
  await exporter.export(fileName);
}
