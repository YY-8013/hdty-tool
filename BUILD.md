# 构建配置说明

## 📦 系统架构

### 技术栈
- **框架**: Vue 3.4.0 (Composition API)
- **构建工具**: Vite 5.0.0
- **UI组件库**: Element Plus 2.5.0
- **状态管理**: Pinia 2.1.7
- **路由**: Vue Router 4.2.5
- **Excel处理**: ExcelJS 4.4.0
- **拖拽**: Sortablejs 1.15.6

### 项目结构
```
hdty-tool/
├── scripts/          # 构建脚本
│   └── build.js     # 自定义构建脚本
├── src/
│   ├── components/  # 组件
│   ├── views/       # 视图
│   ├── router/      # 路由
│   ├── stores/      # 状态管理
│   ├── utils/       # 工具函数
│   ├── mock/        # Mock数据
│   ├── App.vue      # 根组件
│   └── main.js      # 入口文件
├── .env                    # 基础环境变量
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .env.test              # 测试环境变量
├── vite.config.js         # Vite配置
├── package.json           # 项目配置
└── index.html            # HTML模板

```

## 🚀 使用指南

### 开发模式
```bash
npm run dev
```
- 启动开发服务器
- 默认端口: 3000
- 自动打开浏览器
- 热更新

### 标准构建
```bash
# 生产环境构建
npm run build

# 开发环境构建(包含sourcemap)
npm run build:dev

# 测试环境构建
npm run build:test

# 清理后构建
npm run build:clean
```

### 自定义构建(支持项目名)
```bash
# 默认构建(输出目录: dist_版本号_时间戳)
npm run build:custom

# 指定项目名构建
npm run build:custom -- --name=项目名

# 指定项目名和环境
npm run build:custom -- --name=项目名 --mode=production

# 示例
npm run build:custom -- --name=erdos-stats --mode=production
# 输出目录: erdos-stats_1.0.0_2024-01-20T10-30-00
```

### 预览构建结果
```bash
npm run preview
```

## ⚙️ 配置说明

### 环境变量

#### .env (基础配置)
```bash
VITE_APP_NAME=统计列表个性化配置工具
```

#### .env.development (开发环境)
```bash
NODE_ENV=development
VITE_APP_NAME=统计列表个性化配置工具[开发]
VITE_APP_BASE_API=/api
VITE_APP_PORT=3000
VITE_USE_MOCK=true
VITE_APP_DEBUG=true
```

#### .env.production (生产环境)
```bash
NODE_ENV=production
VITE_APP_NAME=统计列表个性化配置工具
VITE_APP_BASE_API=/api
VITE_USE_MOCK=false
VITE_APP_DEBUG=false
```

### Vite配置特性

#### 路径别名
```javascript
import Component from '@/components/Component.vue'
import { utils } from '@utils/index.js'
```

支持的别名:
- `@` → `src/`
- `@components` → `src/components/`
- `@utils` → `src/utils/`
- `@stores` → `src/stores/`
- `@views` → `src/views/`
- `@router` → `src/router/`
- `@mock` → `src/mock/`

#### 代码分包策略
自动将以下库分包:
- **element-plus**: Element Plus UI库
- **exceljs**: Excel处理库
- **vue-vendor**: Vue全家桶(vue, pinia, vue-router)
- **vendor**: 其他第三方库

#### 构建优化
- 生产环境自动移除 console.log
- CSS代码分割
- 资源压缩(terser)
- 静态资源分类存放
- 依赖预构建优化

#### 输出目录结构
```
dist/
├── assets/
│   ├── js/
│   │   ├── index-[hash].js
│   │   ├── element-plus-[hash].js
│   │   ├── exceljs-[hash].js
│   │   ├── vue-vendor-[hash].js
│   │   └── vendor-[hash].js
│   ├── css/
│   │   └── index-[hash].css
│   └── [其他资源]/
└── index.html
```

## 📝 自定义构建脚本说明

### 功能特性
- ✅ 支持自定义项目名
- ✅ 自动添加版本号
- ✅ 自动添加构建时间戳
- ✅ 生成构建信息文件
- ✅ 自动清理旧构建

### 构建信息文件
每次构建会自动生成 `build-info.json`:
```json
{
  "projectName": "erdos-stats",
  "version": "1.0.0",
  "mode": "production",
  "buildTime": "2024-01-20T10:30:00.000Z",
  "timestamp": "2024-01-20T10-30-00"
}
```

## 🔧 性能优化建议

### 1. 按需引入Element Plus
如需进一步优化,可配置按需引入:
```bash
npm install unplugin-vue-components unplugin-auto-import -D
```

### 2. 开启Gzip压缩
```bash
npm install vite-plugin-compression -D
```

### 3. CDN加速
可在 `.env.production` 配置CDN地址

### 4. 路由懒加载
已在项目中使用:
```javascript
const Home = () => import('@views/Home.vue')
```

## 📊 构建分析

### 查看打包体积
```bash
npm run build
# 构建完成后会显示各文件大小
```

### 优化建议
- chunk大小超过1000kb会警告
- 静态资源小于4kb自动base64内联
- 第三方库已分包,避免重复打包

## 🐛 常见问题

### Q: 构建后白屏?
A: 检查路由配置的base路径,确保与部署路径一致

### Q: 环境变量不生效?
A: 确保变量以 `VITE_` 开头,且重启开发服务器

### Q: 打包体积过大?
A: 检查是否有未使用的依赖,考虑按需引入或CDN

---

**更新时间**: 2024-01-20
**维护者**: 项目组
