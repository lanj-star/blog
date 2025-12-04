#!/usr/bin/env node

/**
 * 从笔记仓库同步文章到博客
 * 使用方法：node sync-articles.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ========== 配置区域 ==========
const CONFIG = {
  // 笔记仓库的路径（请修改为你的实际路径）
  notesRepoPath: 'C:/Users/11790/your-notes-repo',
  
  // 要同步的文件夹列表（相对于笔记仓库的路径）
  syncFolders: [
    'frontend',      // 前端笔记
    'backend',       // 后端笔记
    'algorithms',    // 算法笔记
  ],
  
  // 要同步的具体文件列表（相对于笔记仓库的路径，留空则同步整个文件夹）
  specificFiles: [
    // 示例：'frontend/vue3-notes.md',
    // 示例：'algorithms/binary-search.md',
  ],
  
  // 博客文章目标目录
  blogTargetDir: path.join(__dirname, 'blog'),
  
  // 是否复制图片等资源文件
  copyAssets: true,
  
  // 图片资源目录
  assetsSourceDir: 'assets',  // 笔记仓库中的图片目录
  assetsTargetDir: path.join(__dirname, 'public', 'assets'),  // 博客中的图片目录
  
  // 是否自动更新侧边栏配置
  autoUpdateSidebar: true,
  
  // 文章分类映射（笔记文件夹 -> 博客分类）
  categoryMapping: {
    'frontend': '前端开发',
    'backend': '后端开发',
    'algorithms': '算法与数据结构',
    'tools': '开发工具',
  }
}

// ========== 工具函数 ==========

/**
 * 检查路径是否存在
 */
function checkPath(filePath) {
  return fs.existsSync(filePath)
}

/**
 * 确保目录存在
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * 复制文件
 */
function copyFile(src, dest) {
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
  console.log(`✓ 已复制: ${path.basename(src)} -> ${dest}`)
}

/**
 * 获取文章元数据
 */
function extractMetadata(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : '未命名文章'
  
  // 提取日期（如果存在）
  const dateMatch = content.match(/date:\s*(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
  
  return { title, date }
}

/**
 * 处理 Markdown 文件中的图片路径
 */
function processImagePaths(content, sourceDir) {
  // 替换相对路径的图片为 /assets/ 路径
  return content.replace(
    /!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
    (match, alt, imgPath) => {
      const cleanPath = imgPath.replace(/^\.\.\//, '').replace(/^\.\//, '')
      return `![${alt}](/assets/${cleanPath})`
    }
  )
}

/**
 * 同步单个文件
 */
function syncFile(sourceFile, targetFile, category) {
  try {
    let content = fs.readFileSync(sourceFile, 'utf-8')
    const metadata = extractMetadata(content)
    
    // 处理图片路径
    content = processImagePaths(content, path.dirname(sourceFile))
    
    // 写入目标文件
    fs.writeFileSync(targetFile, content, 'utf-8')
    
    console.log(`✓ 同步成功: ${path.basename(sourceFile)}`)
    
    return {
      filename: path.basename(targetFile, '.md'),
      title: metadata.title,
      date: metadata.date,
      category: category,
      link: `/blog/${path.basename(targetFile, '.md')}`
    }
  } catch (error) {
    console.error(`✗ 同步失败: ${sourceFile}`, error.message)
    return null
  }
}

/**
 * 复制资源文件
 */
function syncAssets() {
  if (!CONFIG.copyAssets) return
  
  const assetsSource = path.join(CONFIG.notesRepoPath, CONFIG.assetsSourceDir)
  
  if (!checkPath(assetsSource)) {
    console.log('⚠ 未找到资源目录，跳过资源同步')
    return
  }
  
  console.log('\n📁 同步资源文件...')
  ensureDir(CONFIG.assetsTargetDir)
  
  function copyDirRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true })
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      
      if (entry.isDirectory()) {
        ensureDir(destPath)
        copyDirRecursive(srcPath, destPath)
      } else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(entry.name)) {
        copyFile(srcPath, destPath)
      }
    }
  }
  
  copyDirRecursive(assetsSource, CONFIG.assetsTargetDir)
}

/**
 * 更新侧边栏配置
 */
function updateSidebarConfig(articles) {
  if (!CONFIG.autoUpdateSidebar || articles.length === 0) return
  
  console.log('\n⚙️  更新侧边栏配置...')
  
  const configPath = path.join(__dirname, '.vitepress', 'config.mts')
  let configContent = fs.readFileSync(configPath, 'utf-8')
  
  // 按分类组织文章
  const articlesByCategory = {}
  articles.forEach(article => {
    if (!articlesByCategory[article.category]) {
      articlesByCategory[article.category] = []
    }
    articlesByCategory[article.category].push(article)
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
  console.log('✓ 侧边栏配置已更新')
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始同步文章...\n')
  
  // 检查笔记仓库路径
  if (!checkPath(CONFIG.notesRepoPath)) {
    console.error(`❌ 错误: 笔记仓库路径不存在: ${CONFIG.notesRepoPath}`)
    console.error('请在 sync-articles.js 中修改 CONFIG.notesRepoPath 为正确的路径')
    process.exit(1)
  }
  
  ensureDir(CONFIG.blogTargetDir)
  
  const syncedArticles = []
  
  // 同步指定的文件
  if (CONFIG.specificFiles.length > 0) {
    console.log('📝 同步指定文件...')
    CONFIG.specificFiles.forEach(file => {
      const sourceFile = path.join(CONFIG.notesRepoPath, file)
      const targetFile = path.join(CONFIG.blogTargetDir, path.basename(file))
      
      if (checkPath(sourceFile)) {
        const folder = path.dirname(file).split(path.sep)[0]
        const category = CONFIG.categoryMapping[folder] || '其他'
        const article = syncFile(sourceFile, targetFile, category)
        if (article) syncedArticles.push(article)
      } else {
        console.error(`✗ 文件不存在: ${sourceFile}`)
      }
    })
  }
  
  // 同步指定的文件夹
  if (CONFIG.syncFolders.length > 0) {
    console.log('\n📂 同步文件夹...')
    CONFIG.syncFolders.forEach(folder => {
      const sourceDir = path.join(CONFIG.notesRepoPath, folder)
      
      if (!checkPath(sourceDir)) {
        console.error(`✗ 文件夹不存在: ${sourceDir}`)
        return
      }
      
      const files = fs.readdirSync(sourceDir)
      const mdFiles = files.filter(f => f.endsWith('.md'))
      
      console.log(`\n  📁 ${folder}/ (${mdFiles.length} 个文件)`)
      
      mdFiles.forEach(file => {
        const sourceFile = path.join(sourceDir, file)
        const targetFile = path.join(CONFIG.blogTargetDir, file)
        const category = CONFIG.categoryMapping[folder] || folder
        
        const article = syncFile(sourceFile, targetFile, category)
        if (article) syncedArticles.push(article)
      })
    })
  }
  
  // 同步资源文件
  syncAssets()
  
  // 更新侧边栏
  updateSidebarConfig(syncedArticles)
  
  console.log(`\n✅ 同步完成！共同步 ${syncedArticles.length} 篇文章`)
  console.log('\n💡 提示: 运行 npm run dev 查看效果')
}

// 执行
main()
