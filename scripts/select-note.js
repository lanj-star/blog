#!/usr/bin/env node

/**
 * 智能笔记选择器
 * 扫描 technical-notes 目录，显示可发布的笔记列表
 * 使用方法：node scripts/select-note.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
// 从 scripts/ 目录向上找: ../ -> blog, ../../ -> Content, ../../../ -> Developer (Wait, check env again)
// /Users/yangh/Developer/Content/blog
// /Users/yangh/Knowledge/03_Brain/technical-notes
// Common ancestor: /Users/yangh
// blog -> Content -> Developer -> yangh -> Knowledge -> 03_Brain -> technical-notes
// scripts -> blog -> Content -> Developer -> yangh -> Knowledge -> 03_Brain -> technical-notes
// scripts/.. = blog
// blog/.. = Content
// Content/.. = Developer
// Developer/.. = yangh
// yangh/Knowledge/03_Brain/technical-notes
// So from scripts: ../../../../Knowledge/03_Brain/technical-notes
const NOTES_DIR = path.resolve(__dirname, "../../../../Knowledge/03_Brain/technical-notes");
const PUBLISH_HISTORY = path.join(__dirname, "../.publish-history.json");

// 工具函数
function log(message, type = "info") {
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warning: "⚠️",
    select: "👆",
    new: "🆕",
  };
  console.log(`${icons[type]} ${message}`);
}

function loadPublishHistory() {
  try {
    if (fs.existsSync(PUBLISH_HISTORY)) {
      return JSON.parse(fs.readFileSync(PUBLISH_HISTORY, "utf-8"));
    }
  } catch (error) {
    log("读取发布历史失败", "warning");
  }
  return {};
}

function scanNotesDirectory(dir, level = 0) {
  const items = [];
  
  try {
    if (!fs.existsSync(dir)) {
        log(`目录不存在: ${dir}`, 'error');
        return [];
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith(".") && level < 3) {
        // 递归扫描子目录
        const subItems = scanNotesDirectory(fullPath, level + 1);
        if (subItems.length > 0) {
          items.push({
            type: "directory",
            name: entry.name,
            path: fullPath,
            items: subItems,
            level,
          });
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        // 检查是否为笔记文件
        const stat = fs.statSync(fullPath);
        const relativePath = path.relative(NOTES_DIR, fullPath);
        
        items.push({
          type: "file",
          name: entry.name,
          path: fullPath,
          relativePath,
          size: stat.size,
          modified: stat.mtime,
          level,
        });
      }
    }
  } catch (error) {
    log(`扫描目录失败: ${dir}`, "error");
  }
  
  return items;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
}

function formatDate(date) {
  return (
    date.toLocaleDateString("zh-CN") +
    " " +
    date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  );
}

function displayNotesTree(items, history, prefix = "", index = { value: 0 }) {
  const result = [];
  
  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    const currentPrefix = prefix + (isLast ? "└── " : "├── ");
    
    if (item.type === "file") {
      index.value++;
      const isPublished = history[item.path];
      const isNew =
        !isPublished &&
        Date.now() - item.modified.getTime() < 7 * 24 * 60 * 60 * 1000;
      
      let status = "";
      if (isPublished) status += " ✓已发布";
      if (isNew) status += " 🆕新笔记";
      
      result.push({
        index: index.value,
        item,
        display: `${currentPrefix}[${index.value.toString().padStart(2)}] ${item.name} (${formatFileSize(item.size)}, ${formatDate(item.modified)})${status}`,
      });
    } else if (item.type === "directory") {
      result.push({
        index: null,
        item,
        display: `${currentPrefix}📁 ${item.name}/`,
      });
      
      // 递归显示子项目
      const subItems = displayNotesTree(
        item.items,
        history,
        prefix + (isLast ? "    " : "│   "),
        index,
      );
      result.push(...subItems);
    }
  });
  
  return result;
}

function displayNotesList(notes, history) {
  const result = [];
  
  notes.forEach((note, index) => {
    const isPublished = history[note.path];
    const isNew =
      !isPublished &&
      Date.now() - note.modified.getTime() < 7 * 24 * 60 * 60 * 1000;
    
    let status = "";
    if (isPublished) status += " ✓已发布";
    if (isNew) status += " 🆕新笔记";
    
    result.push({
      index: index + 1,
      item: note,
      display: `[${(index + 1).toString().padStart(2)}] ${note.relativePath} (${formatFileSize(note.size)}, ${formatDate(note.modified)})${status}`,
    });
  });
  
  return result;
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

async function selectNoteInteractive() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   📝 智能笔记选择器                    ║");
  console.log("╚════════════════════════════════════════╝\n");
  
  // 扫描笔记目录
  log("正在扫描笔记目录...", "info");
  const notesTree = scanNotesDirectory(NOTES_DIR);
  
  if (notesTree.length === 0) {
    log("未找到任何笔记文件", "error");
    return null;
  }
  
  // 加载发布历史
  const history = loadPublishHistory();
  
  // 显示选择模式
  console.log("\n选择显示模式:");
  console.log("1. 🌳 树形结构显示");
  console.log("2. 📋 列表显示（按修改时间排序）");
  console.log("3. 🔍 搜索模式");
  console.log("4. 🆕 只显示新笔记");
  console.log("0. 退出");
  
  const mode = await askQuestion("\n请选择 (0-4): ");
  
  let selectedNote = null;
  
  switch (mode) {
    case "1":
      selectedNote = await showTreeView(notesTree, history);
      break;
    case "2":
      selectedNote = await showListView(notesTree, history);
      break;
    case "3":
      selectedNote = await showSearchView(notesTree, history);
      break;
    case "4":
      selectedNote = await showNewNotesView(notesTree, history);
      break;
    case "0":
      log("已退出", "info");
      return null;
    default:
      log("无效选择", "error");
      return null;
  }
  
  if (selectedNote) {
    console.log("\n" + "=".repeat(50));
    log(`已选择: ${selectedNote.relativePath}`, "success");
    console.log("=".repeat(50));
    
    // 询问是否立即发布
    const publishNow = await askQuestion("\n是否立即发布到博客? (y/N): ");
    if (publishNow.toLowerCase() === "y") {
      return selectedNote.path;
    }
  }
  
  return null;
}

async function showTreeView(notesTree, history) {
  console.log("\n📁 笔记目录结构:");
  console.log("─".repeat(60));
  
  const displayItems = displayNotesTree(notesTree, history);
  displayItems.forEach((item) => {
    if (item.index) {
      console.log(item.display);
    } else {
      console.log("\n" + item.display);
    }
  });
  
  const selection = await askQuestion("\n请选择笔记编号 (输入q返回): ");
  if (selection.toLowerCase() === "q") return null;
  
  const selectedIndex = parseInt(selection);
  const selectedItem = displayItems.find(
    (item) => item.index === selectedIndex,
  );
  
  return selectedItem ? selectedItem.item : null;
}

async function showListView(notesTree, history) {
  // 收集所有笔记文件
  const allNotes = [];
  
  function collectNotes(items) {
    items.forEach((item) => {
      if (item.type === "file") {
        allNotes.push(item);
      } else if (item.type === "directory") {
        collectNotes(item.items);
      }
    });
  }
  
  collectNotes(notesTree);
  
  // 按修改时间排序
  allNotes.sort((a, b) => b.modified.getTime() - a.modified.getTime());
  
  console.log("\n📋 最新笔记列表:");
  console.log("─".repeat(60));
  
  const displayItems = displayNotesList(allNotes, history);
  displayItems.slice(0, 20).forEach((item) => {
    // 显示前20个
    console.log(item.display);
  });
  
  if (allNotes.length > 20) {
    log(`还有 ${allNotes.length - 20} 个笔记未显示`, "info");
  }
  
  const selection = await askQuestion("\n请选择笔记编号 (输入q返回): ");
  if (selection.toLowerCase() === "q") return null;
  
  const selectedIndex = parseInt(selection);
  const selectedItem = displayItems.find(
    (item) => item.index === selectedIndex,
  );
  
  return selectedItem ? selectedItem.item : null;
}

async function showSearchView(notesTree, history) {
  const keyword = await askQuestion("\n请输入搜索关键词: ");
  if (!keyword.trim()) return null;
  
  // 收集所有笔记文件
  const allNotes = [];
  
  function collectNotes(items) {
    items.forEach((item) => {
      if (item.type === "file") {
        allNotes.push(item);
      } else if (item.type === "directory") {
        collectNotes(item.items);
      }
    });
  }
  
  collectNotes(notesTree);
  
  // 搜索匹配的文件
  const matchedNotes = allNotes.filter((note) => {
    const content = fs.readFileSync(note.path, "utf-8").toLowerCase();
    return (
      note.name.toLowerCase().includes(keyword.toLowerCase()) ||
      content.includes(keyword.toLowerCase())
    );
  });
  
  if (matchedNotes.length === 0) {
    log("未找到匹配的笔记", "warning");
    return null;
  }
  
  console.log(`\n🔍 找到 ${matchedNotes.length} 个匹配笔记:`);
  console.log("─".repeat(60));
  
  const displayItems = displayNotesList(matchedNotes, history);
  displayItems.slice(0, 10).forEach((item) => {
    console.log(item.display);
  });
  
  if (matchedNotes.length > 10) {
    log(`还有 ${matchedNotes.length - 10} 个匹配笔记未显示`, "info");
  }
  
  const selection = await askQuestion("\n请选择笔记编号 (输入q返回): ");
  if (selection.toLowerCase() === "q") return null;
  
  const selectedIndex = parseInt(selection);
  const selectedItem = displayItems.find(
    (item) => item.index === selectedIndex,
  );
  
  return selectedItem ? selectedItem.item : null;
}

async function showNewNotesView(notesTree, history) {
  // 收集最近7天的新笔记
  const allNotes = [];
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  function collectNotes(items) {
    items.forEach((item) => {
      if (item.type === "file") {
        if (item.modified.getTime() > oneWeekAgo && !history[item.path]) {
          allNotes.push(item);
        }
      } else if (item.type === "directory") {
        collectNotes(item.items);
      }
    });
  }
  
  collectNotes(notesTree);
  
  if (allNotes.length === 0) {
    log("最近7天没有新笔记", "info");
    return null;
  }
  
  console.log(`\n🆕 最近7天的新笔记 (${allNotes.length}个):`);
  console.log("─".repeat(60));
  
  const displayItems = displayNotesList(allNotes, history);
  displayItems.forEach((item) => {
    console.log(item.display);
  });
  
  const selection = await askQuestion("\n请选择笔记编号 (输入q返回): ");
  if (selection.toLowerCase() === "q") return null;
  
  const selectedIndex = parseInt(selection);
  const selectedItem = displayItems.find(
    (item) => item.index === selectedIndex,
  );
  
  return selectedItem ? selectedItem.item : null;
}

// 主函数
async function main() {
  try {
    const selectedPath = await selectNoteInteractive();
    
    if (selectedPath) {
      // 输出选择的文件路径，供其他脚本使用
      console.log(selectedPath);
      
      // 询问是否立即导入到博客
      const importNow = await askQuestion("\n是否立即导入到博客? (y/N): ");
      if (importNow.toLowerCase() === "y") {
        console.log("\n🚀 正在启动导入流程...");
        try {
          execSync(`node "${path.join(__dirname, 'import-note.js')}" "${selectedPath}"`, {
            stdio: "inherit",
          });
        } catch (error) {
          log("导入失败，请手动运行导入命令", "error");
        }
      }
    }
  } catch (error) {
    log(`发生错误: ${error.message}`, "error");
    process.exit(1);
  }
}

// 执行主程序
main();
