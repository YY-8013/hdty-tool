/**
 * 构建脚本 - 支持自定义项目名打包和自动版本号管理
 * 使用方式:
 *   node scripts/build.js                           (默认构建,自动递增patch版本号)
 *   node scripts/build.js --name=项目名           (自定义项目名)
 *   node scripts/build.js --mode=production        (指定构建模式)
 *   node scripts/build.js --version=minor          (指定版本号递增类型: major/minor/patch)
 *   node scripts/build.js --no-version             (不更新版本号)
 */

import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  mkdirSync,
  rmSync
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 解析命令行参数
const args = process.argv.slice(2);
const params = {};
args.forEach((arg) => {
  const [key, value] = arg.split("=");
  params[key.replace("--", "")] = value || true;
});

// 配置
const projectName = params.name || "hdty-tool";
const mode = params.mode || "production";
const versionType = params.version || "patch"; // major/minor/patch
const skipVersion = params["no-version"] === true; // 是否跳过版本号更新

// 更新版本号(如果需要)
let version;
if (!skipVersion) {
  console.log("\n========================================");
  console.log("🔄 正在更新版本号...");
  console.log("========================================\n");

  try {
    execSync(`node scripts/version.js ${versionType}`, {
      stdio: "inherit",
      cwd: resolve(__dirname, "..")
    });
  } catch (error) {
    console.error("⚠️  版本号更新失败，使用当前版本号继续构建");
  }
}

// 读取最新版本号
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
version = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8")
).version;

console.log("\n========================================");
console.log("🚀 开始构建项目");
console.log("========================================");
console.log(`📦 项目名称: ${projectName}`);
console.log(`🔧 构建模式: ${mode}`);
console.log(`📌 版本号: ${version}`);
console.log(`⏰ 构建时间: ${timestamp}`);
console.log("========================================\n");

try {
  // 1. 清理旧的构建文件
  console.log("🧹 清理旧的构建文件...");
  const distPath = resolve(__dirname, "../dist");
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
  }

  // 2. 执行构建
  console.log(`🔨 执行构建 (${mode} 模式)...`);
  execSync(`vite build --mode ${mode}`, {
    stdio: "inherit",
    cwd: resolve(__dirname, "..")
  });

  // 3. 重命名构建目录(如果指定了自定义项目名)
  if (projectName !== "hdty-tool") {
    console.log(
      `📝 重命名构建目录为: ${projectName}_${version}_${timestamp}...`
    );
    const newDistPath = resolve(
      __dirname,
      `../${projectName}_${version}_${timestamp}`
    );
    renameSync(distPath, newDistPath);
    console.log(
      `✅ 构建目录已重命名为: ${projectName}_${version}_${timestamp}`
    );
  } else {
    // 如果使用默认名称,也添加版本和时间戳
    console.log(`📝 重命名构建目录为: dist_${version}_${timestamp}...`);
    const newDistPath = resolve(__dirname, `../dist_${version}_${timestamp}`);
    renameSync(distPath, newDistPath);
    console.log(`✅ 构建目录已重命名为: dist_${version}_${timestamp}`);
  }

  // 4. 创建构建信息文件
  const buildInfo = {
    projectName,
    version,
    mode,
    buildTime: new Date().toISOString(),
    timestamp
  };

  const buildInfoPath =
    projectName !== "hdty-tool"
      ? resolve(
          __dirname,
          `../${projectName}_${version}_${timestamp}/build-info.json`
        )
      : resolve(__dirname, `../dist_${version}_${timestamp}/build-info.json`);

  writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log("📄 构建信息文件已创建");

  console.log("\n========================================");
  console.log("✨ 构建完成!");
  console.log("========================================\n");
} catch (error) {
  console.error("\n❌ 构建失败:", error.message);
  process.exit(1);
}
