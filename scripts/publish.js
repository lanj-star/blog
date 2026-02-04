#!/usr/bin/env node

/**
 * 博客管理 CLI
 * 统一入口：选择笔记 -> 导入 -> 预览 -> 发布
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'
import readline from 'readline'
import { importNote } from './import-note.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    menu: '🔧'
  }
  console.log(`${icons[type]} ${message}`)
}

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   🛠️  博客管理工具 CLI                  ║')
  console.log('╚════════════════════════════════════════╝\n')

  while (true) {
    console.log('\n请选择操作:')
    console.log('1. 📥 导入新笔记 (从 Obsidian)')
    console.log('2. 🚀 发布到平台 (掘金/CSDN/公众号)')
    console.log('3. 👁️  启动本地预览')
    console.log('4. 🏗️  构建生产版本')
    console.log('0. 退出')

    const choice = await askQuestion('\n请输入 (0-4): ')

    switch (choice) {
      case '1':
        await handleImport()
        break
      case '2':
        await handlePublish()
        break
      case '3':
        await handlePreview()
        break
      case '4':
        execSync('npm run build', { stdio: 'inherit' })
        break
      case '0':
        console.log('再见! 👋')
        process.exit(0)
      default:
        log('无效选择', 'error')
    }
  }
}

async function handleImport() {
  try {
    // 1. 调用选择器
    const selectScript = path.join(__dirname, 'select-note.js')
    // select-note.js 设计为交互式，直接运行它
    // 但我们需要它返回选择的路径。目前的 select-note.js 主要是打印路径。
    // 我们修改调用方式：
    // 为了简单，我们直接 spawn 子进程运行 select-note.js，它内部有交互
    
    // 注意：目前的 select-note.js 在最后会询问是否立即发布。
    // 我们为了流程控制，最好让 select-note.js 只负责选择。
    // 但鉴于不能轻易修改 select-note.js 的复杂逻辑（它耦合了发布询问），
    // 我们这里采用一种简单策略：
    // 直接运行 select-note.js，让用户在里面完成操作。
    // 既然我们有了 import-note.js，我们应该修改 select-note.js 里的调用逻辑，
    // 或者我们直接在这里调用 import-note.js 如果用户提供了路径。
    
    // 更好的方式：直接运行 select-note.js，它现在已经是一个比较完整的工具了。
    // 不过我们希望统一入口。
    // 让我们运行 select-note.js，让它接管控制权。
    
    execSync(`node "${selectScript}"`, { stdio: 'inherit' })
    
  } catch (error) {
    // 忽略错误，通常是用户取消
  }
}

async function handlePublish() {
  const filePath = await askQuestion('请输入要发布的 Markdown 文件路径: ')
  if (!filePath) return

  const publishScript = path.join(__dirname, 'publish-to-platforms.js')
  try {
    execSync(`node "${publishScript}" "${filePath}"`, { stdio: 'inherit' })
  } catch (e) {
    // error handled in script
  }
}

async function handlePreview() {
  console.log('启动预览服务器... (按 Ctrl+C 停止)')
  const rootDir = path.join(__dirname, '..')
  try {
      execSync('npm run dev', { cwd: rootDir, stdio: 'inherit' })
  } catch (e) {
      // 
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
