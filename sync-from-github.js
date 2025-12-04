#!/usr/bin/env node

/**
 * 从 GitHub 私有仓库同步文章到博客
 * 使用方法：node sync-from-github.js
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ========== 配置区域 ==========
const CONFIG = {
  // GitHub 仓库地址（支持 SSH 和 HTTPS）
  githubRepo: 'git@github.com:yourusername/your-notes-repo.git',
  // 或使用 HTTPS: 'https://github.com/yourusername/your-notes-repo.git'
  
  // 分支名称
  branch: 'main',
  
  // 临时克隆目录
  tempDir: path.join(__dirname, '.temp-notes'),
  
  // 要同步的文件夹列表
  syncFolders: [
    'frontend',
    'backend',
    'algorithms',
  ],
  
  // 要同步的具体文件（相对于仓库根目录）
  specificFiles: [
    // 'frontend/vue3-notes.md',
  ],
  
  // 博客目标目录
  blogTargetDir: path.join(__dirname, 'blog'),
  
  // 是否复制图片等资源
  copyAssets: true,
  assetsSourceDir: 'assets',
  assetsTargetDir: path.join(__dirname, 'public', 'assets'),
  
  // 是否自动更新侧边栏
  autoUpdateSidebar: true,
  
  // 文章分类映射
  categoryMapping: {
    'frontend': '前端开发',
    'backend': '后端开发',
    'algorithms': '算法与数据结构',
    'tools': '开发工具',
    'database': '数据库',
  },
  
  // 同步后是否删除临时目录（建议保留以加速后续同步）
  keepTempDir: true,
}

// ========== 工具函数 ==========

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✓',
    error: '✗',
    warning: '⚠',
  }
  console.log(`${icons[type] || ''} ${message}`)
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    })
  } catch (error) {
    if (!options.ignoreError) {
      throw error
    }
    return null
  }
}

/**
 * 克隆或更新 GitHub 仓库
 */
function syncGitRepo() {
  log('\n📦 同步 GitHub 仓库...')
  
  if (fs.existsSync(CONFIG.tempDir)) {
    // 已存在，执行 git pull
    log('检测到已克隆的仓库，执行更新...', 'info')
    process.chdir(CONFIG.tempDir)
    
    try {
      execCommand(`git fetch origin ${CONFIG.branch}`)
      execCommand(`git reset --hard origin/${CONFIG.branch}`)
      log('仓库更新成功', 'success')
    } catch (error) {
      log('更新失败，尝试重新克隆...', 'warning')
      process.chdir(__dirname)
      fs.rmSync(CONFIG.tempDir, { recursive: true, force: true })
      cloneRepo()
    }
    
    process.chdir(__dirname)
  } else {
    // 不存在，执行克隆
    cloneRepo()
  }
}

function cloneRepo() {
  log('正在克隆仓库...', 'info')
  ensureDir(path.dirname(CONFIG.tempDir))
  
  try {
    execCommand(
      `git clone --depth 1 --branch ${CONFIG.branch} ${CONFIG.githubRepo} ${CONFIG.tempDir}`
    )
    log('仓库克隆成功', 'success')
  } catch (error) {
    log('克隆失败，请检查：', 'error')
    log('1. GitHub 仓库地址是否正确', 'error')
    log('2. 是否有访问权限（SSH key 或 Personal Access Token）', 'error')
    log('3. 分支名称是否正确', 'error')
    process.exit(1)
  }
}

/**
 * 处理 Markdown 文件中的图片路径
 */
function processImagePaths(content) {
  return content.replace(
    /!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
    (match, alt, imgPath) => {
      const cleanPath = imgPath
        .replace(/^\.\.\//, '')
        .replace(/^\.\//, '')
        .replace(/^assets\//, '')
      return `![${alt}](/assets/${cleanPath})`
    }
  )
}

/**
 * 提取文章元数据
 */
function extractMetadata(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : '未命名文章'
  
  const dateMatch = content.match(/date:\s*(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
  
  return { title, date }
}

/**
 * 同步单个文件
 */
function syncFile(sourceFile, targetFile, category) {
  try {
    let content = fs.readFileSync(sourceFile, 'utf-8')
    const metadata = extractMetadata(content)
    
    // 处理图片路径
    content = processImagePaths(content)
    
    // 写入目标文件
    fs.writeFileSync(targetFile, content, 'utf-8')
    
    log(`已同步: ${path.basename(sourceFile)}`, 'success')
    
    return {
      filename: path.basename(targetFile, '.md'),
      title: metadata.title,
      date: metadata.date,
      category: category,
      link: `/blog/${path.basename(targetFile, '.md')}`
    }
  } catch (error) {
    log(`同步失败: ${sourceFile} - ${error.message}`, 'error')
    return null
  }
}

/**
 * 复制资源文件
 */
function syncAssets() {
  if (!CONFIG.copyAssets) return
  
  const assetsSource = path.join(CONFIG.tempDir, CONFIG.assetsSourceDir)
  
  if (!fs.existsSync(assetsSource)) {
    log('未找到资源目录，跳过资源同步', 'warning')
    return
  }
  
  log('\n📁 同步资源文件...')
  ensureDir(CONFIG.assetsTargetDir)
  
  function copyDirRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true })
    let count = 0
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      
      if (entry.isDirectory()) {
        ensureDir(destPath)
        count += copyDirRecursive(srcPath, destPath)
      } else if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(entry.name)) {
        fs.copyFileSync(srcPath, destPath)
        count++
      }
    }
    return count
  }
  
  const count = copyDirRecursive(assetsSource, CONFIG.assetsTargetDir)
  log(`已复制 ${count} 个资源文件`, 'success')
}

/**
 * 同步文章
 */
function syncArticles() {
  log('\n📝 同步文章...')
  ensureDir(CONFIG.blogTargetDir)
  
  const syncedArticles = []
  
  // 同步指定文件
  if (CONFIG.specificFiles.length > 0) {
    log('\n  同步指定文件：')
    CONFIG.specificFiles.forEach(file => {
      const sourceFile = path.join(CONFIG.tempDir, file)
      const targetFile = path.join(CONFIG.blogTargetDir, path.basename(file))
      
      if (fs.existsSync(sourceFile)) {
        const folder = path.dirname(file).split(path.sep)[0]
        const category = CONFIG.categoryMapping[folder] || '其他'
        const article = syncFile(sourceFile, targetFile, category)
        if (article) syncedArticles.push(article)
      } else {
        log(`文件不存在: ${file}`, 'error')
      }
    })
  }
  
  // 同步文件夹
  if (CONFIG.syncFolders.length > 0) {
    log('\n  同步文件夹：')
    CONFIG.syncFolders.forEach(folder => {
      const sourceDir = path.join(CONFIG.tempDir, folder)
      
      if (!fs.existsSync(sourceDir)) {
        log(`文件夹不存在: ${folder}`, 'error')
        return
      }
      
      const files = fs.readdirSync(sourceDir)
      const mdFiles = files.filter(f => f.endsWith('.md'))
      
      log(`\n  📂 ${folder}/ (${mdFiles.length} 个文件)`)
      
      mdFiles.forEach(file => {
        const sourceFile = path.join(sourceDir, file)
        const targetFile = path.join(CONFIG.blogTargetDir, file)
        const category = CONFIG.categoryMapping[folder] || folder
        
        const article = syncFile(sourceFile, targetFile, category)
        if (article) syncedArticles.push(article)
      })
    })
  }
  
  return syncedArticles
}

/**
 * 更新侧边栏配置
 */
function updateSidebarConfig(articles) {
  if (!CONFIG.autoUpdateSidebar || articles.length === 0) return
  
  log('\n⚙️  更新侧边栏配置...')
  
  const configPath = path.join(__dirname, '.vitepress', 'config.mts')
  let configContent = fs.readFileSync(configPath, 'utf-8')
  
  // 按分类和日期组织文章
  const articlesByCategory = {}
  articles.forEach(article => {
    if (!articlesByCategory[article.category]) {
      articlesByCategory[article.category] = []
    }
    articlesByCategory[article.category].push(article)
  })
  
  // 每个分类内按日期排序
  Object.values(articlesByCategory).forEach(items => {
    items.sort((a, b) => b.date.localeCompare(a.date))
  })
  
  // 生成侧边栏配置
  let sidebarItems = []
  for (const [category, items] of Object.entries(articlesByCategory)) {
    sidebarItems.push(`        {
          text: '${category}',
          items: [
${items.map(item => `            { text: '${item.title}', link: '${item.link}' }`).join(',\n')}
          ]
        }`)
  }
  
  const sidebarConfig = `      '/blog/': [
${sidebarItems.join(',\n')}
      ]`
  
  // 替换侧边栏配置
  configContent = configContent.replace(
    /sidebar:\s*{[^}]*'\/blog\/'\s*:\s*\[[^\]]*\]/s,
    `sidebar: {
${sidebarConfig}`
  )
  
  fs.writeFileSync(configPath, configContent, 'utf-8')
  log('侧边栏配置已更新', 'success')
}

/**
 * 清理临时目录
 */
function cleanup() {
  if (!CONFIG.keepTempDir && fs.existsSync(CONFIG.tempDir)) {
    log('\n🧹 清理临时文件...')
    fs.rmSync(CONFIG.tempDir, { recursive: true, force: true })
    log('清理完成', 'success')
  }
}

/**
 * 主函数
 */
function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   📚 GitHub 笔记同步工具               ║')
  console.log('╚════════════════════════════════════════╝\n')
  
  try {
    // 1. 同步 Git 仓库
    syncGitRepo()
    
    // 2. 同步文章
    const articles = syncArticles()
    
    // 3. 同步资源
    syncAssets()
    
    // 4. 更新配置
    updateSidebarConfig(articles)
    
    // 5. 清理
    cleanup()
    
    // 总结
    console.log('\n╔════════════════════════════════════════╗')
    console.log(`║   ✅ 同步完成！共 ${articles.length.toString().padEnd(2)} 篇文章          ║`)
    console.log('╚════════════════════════════════════════╝\n')
    
    log('💡 提示: 运行 npm run dev 查看效果\n')
    
  } catch (error) {
    log(`\n发生错误: ${error.message}`, 'error')
    process.exit(1)
  }
}

// 执行
main()
