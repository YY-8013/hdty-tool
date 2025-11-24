import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { readFileSync } from "fs";

// 读取package.json中的版本号
const getVersion = () => {
  try {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
    );
    return packageJson.version || "0.0.0";
  } catch (error) {
    return "0.0.0";
  }
};

const version = getVersion();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue()],

    // 路径别名配置
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@components": resolve(__dirname, "src/components"),
        "@utils": resolve(__dirname, "src/utils"),
        "@stores": resolve(__dirname, "src/stores"),
        "@views": resolve(__dirname, "src/views"),
        "@router": resolve(__dirname, "src/router"),
        "@mock": resolve(__dirname, "src/mock")
      }
    },

    // 开发服务器配置
    server: {
      port: 3000,
      open: true,
      host: true, // 允许外部访问
      cors: true // 允许跨域
      // 代理配置示例(如需要)
      // proxy: {
      //   '/api': {
      //     target: 'http://localhost:8080',
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, '')
      //   }
      // }
    },

    // 构建配置
    build: {
      // 输出目录
      outDir: "dist",
      // 静态资源目录
      assetsDir: "assets",
      // 小于此阈值的导入或引用资源将内联为 base64 编码(单位:字节)
      assetsInlineLimit: 4096,
      // 启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      // 构建后是否生成 source map 文件
      sourcemap: mode === "development",
      // chunk 大小警告的限制(单位:kbs)
      chunkSizeWarningLimit: 1000,
      // 自定义底层的 Rollup 打包配置
      rollupOptions: {
        output: {
          // 静态资源分类打包 - 文件名携带版本号
          chunkFileNames: `assets/js/[name].v${version}.[hash].js`,
          entryFileNames: `assets/js/[name].v${version}.[hash].js`,
          assetFileNames: (assetInfo) => {
            // 根据文件类型分类
            const extType = assetInfo.name.split(".").pop();
            if (/css/i.test(extType)) {
              return `assets/css/[name].v${version}.[hash].[ext]`;
            }
            if (/png|jpe?g|svg|gif|webp|ico/i.test(extType)) {
              return `assets/img/[name].v${version}.[hash].[ext]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name].v${version}.[hash].[ext]`;
            }
            return `assets/[ext]/[name].v${version}.[hash].[ext]`;
          },
          // 分包策略
          manualChunks(id) {
            // 将 node_modules 中的代码单独打包
            if (id.includes("node_modules")) {
              // Element Plus 单独打包
              if (id.includes("element-plus")) {
                return "element-plus";
              }
              // ExcelJS 单独打包
              if (id.includes("exceljs")) {
                return "exceljs";
              }
              // Vue 全家桶打包
              if (
                id.includes("vue") ||
                id.includes("pinia") ||
                id.includes("vue-router")
              ) {
                return "vue-vendor";
              }
              // 其他第三方库
              return "vendor";
            }
          }
        }
      },
      // 压缩配置 - 使用esbuild(默认,更快)
      minify: "esbuild",
      // esbuild 压缩配置
      esbuild: {
        // 生产环境移除 console 和 debugger
        drop: mode === "production" ? ["console", "debugger"] : []
      }
    },

    // 优化依赖预构建
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia", "element-plus", "exceljs"]
    },

    // 全局常量定义
    define: {
      __APP_NAME__: JSON.stringify(
        env.VITE_APP_NAME || "统计列表个性化配置工具"
      ),
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "0.0.1"
      )
    }
  };
});
