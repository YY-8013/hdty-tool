/**
 * 版本号管理脚本
 * 使用方式:
 *   node scripts/version.js patch  (默认,递增修订版本号 1.0.0 -> 1.0.1)
 *   node scripts/version.js minor  (递增次版本号 1.0.0 -> 1.1.0)
 *   node scripts/version.js major  (递增主版本号 1.0.0 -> 2.0.0)
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 解析命令行参数
const args = process.argv.slice(2);
const type = args[0] || "patch"; // 默认递增修订号

// 读取 package.json
const packagePath = resolve(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));

// 解析当前版本号
const currentVersion = packageJson.version;
const versionParts = currentVersion.split(".").map(Number);

// 根据类型递增版本号
switch (type) {
  case "major": // 主版本号
    versionParts[0]++;
    versionParts[1] = 0;
    versionParts[2] = 0;
    break;
  case "minor": // 次版本号
    versionParts[1]++;
    versionParts[2] = 0;
    break;
  case "patch": // 修订号
  default:
    versionParts[2]++;
    break;
}

const newVersion = versionParts.join(".");

// 更新 package.json
packageJson.version = newVersion;
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");

console.log("\n========================================");
console.log("📌 版本号更新成功!");
console.log("========================================");
console.log(`旧版本: ${currentVersion}`);
console.log(`新版本: ${newVersion}`);
console.log(`更新类型: ${type}`);
console.log("========================================\n");

// 输出新版本号供其他脚本使用
process.stdout.write(newVersion);
