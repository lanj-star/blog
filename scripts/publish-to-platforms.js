#!/usr/bin/env node

/**
 * 自动化多平台文章发布工具 (Puppeteer版)
 * 使用方法：node scripts/publish-to-platforms.js <article-file.md>
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

import { BrowserManager } from "./publisher/browser-manager.js";
import { JuejinPublisher } from "./publisher/juejin-publisher.js";
import { CSDNPublisher } from "./publisher/csdn-publisher.js";
import { WechatPublisher } from "./publisher/wechat-publisher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== 工具函数 ==========

function log(message, type = "info") {
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warning: "⚠️",
    publish: "🚀",
  };
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

function parseMarkdown(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // 修复图片链接中的双斜杠 (例如 /notes//2025 -> /notes/2025)
  // 忽略协议部分的 ://
  content = content.replace(/([^:])\/\/+/g, "$1/");

  // 提取标题
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, ".md");

  // 提取标签
  const tagsMatch = content.match(/tags?:\s*\[([^\]]+)\]/i);
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map((t) => t.trim().replace(/['"]/g, ""))
    : [];

  return {
    title,
    tags,
    markdown: content,
    content, // 兼容
  };
}

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ========== 主程序 ==========

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🚀 自动化多平台发布工具 (Puppeteer) ║");
  console.log("╚════════════════════════════════════════╝\n");

  // 1. 获取文章
  const articleFile = process.argv[2];
  if (!articleFile) {
    log("请指定要发布的文章文件", "error");
    process.exit(1);
  }

  const articlePath = path.resolve(articleFile);
  if (!fs.existsSync(articlePath)) {
    log(`文件不存在: ${articlePath}`, "error");
    process.exit(1);
  }

  log(`解析文章: ${path.basename(articlePath)}`, "info");
  const article = parseMarkdown(articlePath);
  console.log(`📝 标题: ${article.title}`);

  // 2. 选择平台
  console.log("\n请选择发布平台 (逗号分隔，例如 1,2):");
  console.log("1. 掘金");
  console.log("2. CSDN");
  console.log("3. 微信公众号");

  const choice = await askQuestion("请输入: ");
  const platforms = choice.split(/[,，]/).map((s) => s.trim());

  // 3. 启动浏览器
  const browserManager = new BrowserManager();
  let browser;

  try {
    browser = await browserManager.launch();
  } catch (e) {
    log("启动浏览器失败，请确保已安装 Chrome", "error");
    console.error(e);
    process.exit(1);
  }

  // 4. 执行发布
  try {
    if (platforms.includes("1")) {
      const publisher = new JuejinPublisher(browser, article);
      await publisher.publish();
    }

    if (platforms.includes("2")) {
      const publisher = new CSDNPublisher(browser, article);
      await publisher.publish();
    }

    if (platforms.includes("3")) {
      const publisher = new WechatPublisher(browser, article);
      await publisher.publish();
    }

    console.log("\n✨ 所有任务已执行完毕！");
    console.log(
      "⚠️  请勿直接关闭脚本，建议手动检查浏览器中的发布状态后再关闭。",
    );

    // 等待用户手动退出
    await askQuestion("\n按回车键关闭浏览器并退出...");
  } catch (error) {
    console.error("执行出错:", error);
  } finally {
    await browserManager.close();
  }
}

main();
