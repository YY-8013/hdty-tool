// Mock 数据 - 鄂尔多斯市各旗区统计数据
export const mockData = [
  {
    orgName: "鄂尔多斯市",
    totalNum: 1256,
    DWLB_DICT_01: 156,
    SYDW_DICT_01: 45,
    SYDW_DICT_02: 12,
    DWLB_DICT_02: 23,
    DWLB_DICT_03: 8,
    DWLB_DICT_04: 15,
    FFDJ_DICT_01: 89,
    FFDJ_DICT_02: 234,
    FFDJ_DICT_03: 156
  },
  {
    orgName: "东胜区",
    totalNum: 289,
    DWLB_DICT_01: 45,
    SYDW_DICT_01: 12,
    SYDW_DICT_02: 3,
    DWLB_DICT_02: 6,
    DWLB_DICT_03: 2,
    DWLB_DICT_04: 4,
    FFDJ_DICT_01: 23,
    FFDJ_DICT_02: 56,
    FFDJ_DICT_03: 38
  },
  {
    orgName: "康巴什区",
    totalNum: 178,
    DWLB_DICT_01: 28,
    SYDW_DICT_01: 8,
    SYDW_DICT_02: 2,
    DWLB_DICT_02: 4,
    DWLB_DICT_03: 1,
    DWLB_DICT_04: 3,
    FFDJ_DICT_01: 15,
    FFDJ_DICT_02: 34,
    FFDJ_DICT_03: 25
  },
  {
    orgName: "伊金霍洛旗",
    totalNum: 156,
    DWLB_DICT_01: 22,
    SYDW_DICT_01: 6,
    SYDW_DICT_02: 1,
    DWLB_DICT_02: 3,
    DWLB_DICT_03: 1,
    DWLB_DICT_04: 2,
    FFDJ_DICT_01: 12,
    FFDJ_DICT_02: 28,
    FFDJ_DICT_03: 20
  },
  {
    orgName: "达拉特旗",
    totalNum: 134,
    DWLB_DICT_01: 18,
    SYDW_DICT_01: 5,
    SYDW_DICT_02: 1,
    DWLB_DICT_02: 2,
    DWLB_DICT_03: 1,
    DWLB_DICT_04: 1,
    FFDJ_DICT_01: 10,
    FFDJ_DICT_02: 24,
    FFDJ_DICT_03: 18
  },
  {
    orgName: "准格尔旗",
    totalNum: 145,
    DWLB_DICT_01: 20,
    SYDW_DICT_01: 6,
    SYDW_DICT_02: 2,
    DWLB_DICT_02: 3,
    DWLB_DICT_03: 1,
    DWLB_DICT_04: 2,
    FFDJ_DICT_01: 11,
    FFDJ_DICT_02: 26,
    FFDJ_DICT_03: 19
  },
  {
    orgName: "鄂托克前旗",
    totalNum: 98,
    DWLB_DICT_01: 12,
    SYDW_DICT_01: 3,
    SYDW_DICT_02: 1,
    DWLB_DICT_02: 2,
    DWLB_DICT_03: 0,
    DWLB_DICT_04: 1,
    FFDJ_DICT_01: 7,
    FFDJ_DICT_02: 18,
    FFDJ_DICT_03: 13
  },
  {
    orgName: "鄂托克旗",
    totalNum: 112,
    DWLB_DICT_01: 15,
    SYDW_DICT_01: 4,
    SYDW_DICT_02: 1,
    DWLB_DICT_02: 2,
    DWLB_DICT_03: 1,
    DWLB_DICT_04: 1,
    FFDJ_DICT_01: 8,
    FFDJ_DICT_02: 20,
    FFDJ_DICT_03: 15
  },
  {
    orgName: "杭锦旗",
    totalNum: 89,
    DWLB_DICT_01: 10,
    SYDW_DICT_01: 3,
    SYDW_DICT_02: 0,
    DWLB_DICT_02: 1,
    DWLB_DICT_03: 1,
    DWLB_DICT_04: 1,
    FFDJ_DICT_01: 6,
    FFDJ_DICT_02: 16,
    FFDJ_DICT_03: 12
  },
  {
    orgName: "乌审旗",
    totalNum: 105,
    DWLB_DICT_01: 13,
    SYDW_DICT_01: 4,
    SYDW_DICT_02: 1,
    DWLB_DICT_02: 2,
    DWLB_DICT_03: 0,
    DWLB_DICT_04: 1,
    FFDJ_DICT_01: 7,
    FFDJ_DICT_02: 19,
    FFDJ_DICT_03: 14
  }
];

// 多层级列配置
export const tableColList = [
  {
    prop: "orgName",
    label: "管辖机构",
    width: 150,
    fixed: true
  },
  {
    prop: "totalNum",
    label: "总数",
    width: 100
  },
  {
    key: "dwlbList",
    label: "单位类别",
    children: [
      {
        key: "01",
        label: "党政机关",
        prop: "DWLB_DICT_01",
        width: 100,
        children: [
          {
            key: "01",
            label: "事业单位",
            prop: "SYDW_DICT_01",
            width: 100
          },
          {
            key: "02",
            label: "驻华外事外交机构",
            prop: "SYDW_DICT_02",
            width: 150
          }
        ]
      },
      {
        key: "02",
        label: "驻华外事外交机构",
        prop: "DWLB_DICT_02",
        width: 150
      },
      {
        key: "03",
        label: "城市中心广场",
        prop: "DWLB_DICT_03",
        width: 120
      },
      {
        key: "04",
        label: "标志性建筑物",
        prop: "DWLB_DICT_04",
        width: 120
      }
    ]
  },
  {
    key: "dwdjList",
    label: "单位等级",
    children: [
      {
        key: "01",
        label: "Ⅰ级",
        prop: "FFDJ_DICT_01",
        width: 100
      },
      {
        key: "02",
        label: "Ⅱ级",
        prop: "FFDJ_DICT_02",
        width: 100
      },
      {
        key: "03",
        label: "Ⅲ级",
        prop: "FFDJ_DICT_03",
        width: 100
      }
    ]
  }
];
