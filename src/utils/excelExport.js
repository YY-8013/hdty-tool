import ExcelJS from "exceljs";

class UniversalExcelExporter {
  constructor() {
    this.workbook = null;
    this.worksheet = null;
    this.flatColumns = [];
    this.headerLevels = 0;
  }

  initWorkbook(creator = "系统") {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = creator;
    this.workbook.created = new Date();
    return this;
  }

  addWorksheet(name = "Sheet1") {
    this.worksheet = this.workbook.addWorksheet(name);
    return this;
  }

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

  applyColumnAlignments(dataRow) {
    dataRow.eachCell((cell, colNumber) => {
      const col = this.flatColumns[colNumber - 1];
      if (col && col.alignment) {
        cell.alignment = { ...cell.alignment, horizontal: col.alignment };
      }
    });
  }

  _colorToArgb(color) {
    if (!color) return "FFFFFFFF";
    let hex = color.replace("#", "");
    if (hex.length === 6) hex = "FF" + hex;
    return hex.toUpperCase();
  }

  setColumnWidth() {
    if (!this.worksheet) throw new Error("请先添加工作表");
    this.worksheet.columns = this.flatColumns.map((col) => ({
      width: col.width || 15
    }));
    return this;
  }

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
