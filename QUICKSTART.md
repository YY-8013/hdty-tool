# 快速开始指南

## 🎯 系统架构总览

### 核心依赖
- **Vue 3.4.0** - 前端框架(Composition API)
- **Vite 5.0.0** - 构建工具(快速、轻量)
- **Element Plus 2.5.0** - UI组件库
- **ExcelJS 4.4.0** - Excel文件生成
- **Pinia 2.1.7** - 状态管理
- **Vue Router 4.2.5** - 路由管理

### 项目特点
✅ 树形列配置(支持拖拽排序)  
✅ 多层级表头自动计算  
✅ 单元格级样式配置  
✅ 边框样式独立配置(表头/数据)  
✅ Excel完整导出(保留所有样式)  
✅ 多环境构建支持  
✅ 自定义项目名打包  

---

## 📦 构建优化说明

### 1. Vite配置优化 (vite.config.js)

#### ✨ 新增功能
- **路径别名**: `@/`, `@components/`, `@utils/` 等快捷导入
- **代码分包**: 自动拆分 Element Plus、ExcelJS、Vue全家桶
- **环境变量**: 支持多环境配置(.env.*)
- **生产优化**: 自动移除console.log、压缩代码
- **资源优化**: CSS分割、静态资源分类存放

#### 📁 输出目录结构
```
dist/
├── assets/
│   ├── js/
│   │   ├── index-[hash].js        # 主应用代码
│   │   ├── element-plus-[hash].js # Element Plus
│   │   ├── exceljs-[hash].js      # ExcelJS
│   │   ├── vue-vendor-[hash].js   # Vue全家桶
│   │   └── vendor-[hash].js       # 其他依赖
│   ├── css/
│   │   └── index-[hash].css       # 样式文件
│   └── [其他资源]/
└── index.html
```

### 2. Package.json脚本优化

```json
{
  "scripts": {
    "dev": "开发模式",
    "build": "生产环境构建",
    "build:dev": "开发环境构建(含sourcemap)",
    "build:test": "测试环境构建",
    "build:prod": "生产环境构建",
    "build:custom": "自定义项目名构建",
    "build:clean": "清理后构建",
    "preview": "预览生产版本"
  }
}
```

### 3. 环境变量配置

#### .env (基础配置)
```bash
VITE_APP_NAME=统计列表个性化配置工具
```

#### .env.development (开发环境)
```bash
NODE_ENV=development
VITE_APP_NAME=统计列表个性化配置工具[开发]
VITE_APP_DEBUG=true
```

#### .env.production (生产环境)
```bash
NODE_ENV=production
VITE_APP_NAME=统计列表个性化配置工具
VITE_APP_DEBUG=false
```

---

## 🚀 使用指南

### 开发阶段
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器(自动打开浏览器 localhost:3000)
npm run dev
```

### 构建阶段

#### 方式1: 标准构建
```bash
# 生产环境构建 -> 输出到 dist/
npm run build

# 或指定环境
npm run build:dev   # 开发环境(含sourcemap)
npm run build:test  # 测试环境
npm run build:prod  # 生产环境
```

#### 方式2: 自定义项目名构建(推荐⭐)
```bash
# 默认构建(输出目录: dist_1.0.0_2024-01-20T10-30-00)
npm run build:custom

# 指定项目名(输出目录: 项目名_版本号_时间戳)
npm run build:custom -- --name=erdos-stats-tool

# 指定项目名和环境
npm run build:custom -- --name=erdos-stats-tool --mode=production
```

**构建结果示例**:
```
erdos-stats-tool_1.0.0_2024-01-20T10-30-00/
├── assets/
│   ├── js/
│   ├── css/
│   └── ...
├── index.html
└── build-info.json  # 构建信息文件
```

**build-info.json 内容**:
```json
{
  "projectName": "erdos-stats-tool",
  "version": "1.0.0",
  "mode": "production",
  "buildTime": "2024-01-20T10:30:00.000Z",
  "timestamp": "2024-01-20T10-30-00"
}
```

---

## 🔧 配置说明

### 路径别名使用

**之前**:
```javascript
import DataTable from '../../components/DataTable.vue'
import { exportExcel } from '../../utils/excelExport.js'
```

**现在**:
```javascript
import DataTable from '@components/DataTable.vue'
import { exportExcel } from '@utils/excelExport.js'
// 或
import DataTable from '@/components/DataTable.vue'
```

### 环境变量使用

**在代码中访问**:
```javascript
console.log(import.meta.env.VITE_APP_NAME)     // 应用名称
console.log(import.meta.env.VITE_APP_DEBUG)    // 是否调试模式
console.log(import.meta.env.MODE)              // 当前环境
```

**在HTML中访问**:
```html
<title>%VITE_APP_NAME%</title>
```

---

## 📊 性能优化

### 已实现的优化
✅ **依赖预构建**: 加速首次启动  
✅ **代码分包**: 减少主包体积  
✅ **资源压缩**: terser压缩JS代码  
✅ **CSS拆分**: 按需加载样式  
✅ **移除console**: 生产环境自动移除  
✅ **资源内联**: 小于4kb的资源base64内联  

### 构建体积参考
- **主应用**: ~50-100KB
- **Element Plus**: ~500KB
- **ExcelJS**: ~400KB
- **Vue全家桶**: ~200KB

---

## 🐛 常见问题

### Q1: 构建后页面空白?
**A**: 检查部署路径,如需部署到子路径,在vite.config.js添加:
```javascript
export default defineConfig({
  base: '/your-subpath/'
})
```

### Q2: 环境变量不生效?
**A**: 
1. 确保变量以 `VITE_` 开头
2. 重启开发服务器
3. 清除缓存重新构建

### Q3: 自定义构建脚本报错?
**A**: 确保在项目根目录执行命令,不要在scripts目录执行

### Q4: 打包体积过大?
**A**: 
1. 检查是否有未使用的依赖
2. 考虑使用CDN加载大型库
3. 启用gzip压缩(需服务器配置)

---

## 📚 相关文档

- [BUILD.md](./BUILD.md) - 详细构建配置说明
- [README.md](./README.md) - 项目功能说明
- [Vite官方文档](https://vitejs.dev/)
- [Vue 3官方文档](https://vuejs.org/)

---

**更新时间**: 2024-01-20  
**版本**: 1.0.0
