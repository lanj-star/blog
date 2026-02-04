#!/usr/bin/env node

/**
 * 笔记导入工具
 * 功能：将 Obsidian 笔记转换为 VitePress 兼容格式，并复制相关资源
 * 使用方法：node scripts/import-note.js <笔记文件路径>
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ========== 配置区域 ==========
const CONFIG = {
  // 笔记仓库路径 (相对于 scripts 目录)
  notesRepoPath: path.resolve(__dirname, '../../../../Knowledge/03_Brain/technical-notes'),
  
  // 博客目录
  blogDir: path.join(__dirname, '../blog'),
  
  // 资源文件目录
  assetsDir: path.join(__dirname, '../public/assets'),
  
  // 作者信息
  author: {
    name: 'Yangh',
    github: 'https://github.com/yangh',
    blog: 'https://yangh.github.io'
  },
  
  // 默认标签
  defaultTags: ['技术分享', '编程'],
  
  // 分类映射
  categoryMap: {
    '01-FUNDAMENTALS': 'fundamentals',
    '02-PROGRAMMING-LANGUAGES': 'languages',
    '03-SYSTEM-DESIGN': 'system-design',
    '04-DEVELOPMENT-TOOLS': 'engineering',
    '05-CLOUD-PLATFORMS': 'engineering',
    '06-PROJECTS': 'projects',
    '07-LEARNING-RESOURCES': 'resources',
    '08-WORKFLOWS': 'workflows',
    '09-TOOLS-COMPARISON': 'engineering',
    '10-AI-ENGINEERING': 'ai'
  }
}

// ========== 工具函数 ==========

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    convert: '🔄'
  }
  console.log(`${icons[type]} ${message}`)
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// ========== 核心转换函数 ==========

/**
 * 转换 Obsidian 笔记为博客格式
 */
function convertObsidianToBlog(content, filePath) {
  let converted = content
  
  // 1. 移除 Obsidian 特有的语法
  converted = converted.replace(/%%.*?%%/gs, '') // 移除注释
  converted = converted.replace(/\[\[([^\]]+)\]\]/g, '$1') // 移除内部链接标记
  converted = converted.replace(/\!\[\[([^\]]+)\]\]/g, '$1') // 移除内部图片链接标记
  
  // 2. 转换标题格式
  // 如果第一行不是一级标题，添加文件名作为标题
  if (!converted.match(/^#\s+/m)) {
    const fileName = path.basename(filePath, '.md')
    const title = fileName.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ')
    converted = `# ${title}\n\n${converted}`
  }
  
  // 3. 处理代码块
  converted = converted.replace(/```(\w+)\n/g, (match, lang) => {
    return '```' + (lang || '') + '\n'
  })
  
  // 4. 转换图片路径
  converted = converted.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, imgPath) => {
      // 如果是相对路径，转换为博客路径
      if (!imgPath.startsWith('http') && !imgPath.startsWith('/')) {
        const cleanPath = imgPath.replace(/^\.\.\//, '').replace(/^\.\//, '')
        return `![${alt}](/assets/${cleanPath})`
      }
      return match
    }
  )
  
  // 5. 提取元数据
  const metadata = extractMetadata(converted, filePath)
  
  // 6. 添加博客 frontmatter
  const frontmatter = generateFrontmatter(metadata)
  
  return {
    content: frontmatter + converted,
    metadata
  }
}

/**
 * 提取文章元数据
 */
function extractMetadata(content, filePath) {
  const fileName = path.basename(filePath, '.md')
  
  // 从文件名提取日期
  const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
  
  // 从内容提取标题
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : fileName.replace(/-/g, ' ')
  
  // 提取前200字作为摘要
  const lines = content.split('\n')
  let summary = ''
  for (const line of lines.slice(1)) { // 跳过标题
    if (line.trim() && !line.startsWith('#') && !line.startsWith('```')) {
      summary += line + ' '
      if (summary.length > 200) break
    }
  }
  summary = summary.trim().substring(0, 200) + '...'
  
  // 提取标签
  const tags = []
  const tagMatches = content.match(/#[\w\u4e00-\u9fa5]+/g)
  if (tagMatches) {
    tags.push(...tagMatches.map(tag => tag.substring(1)))
  }
  
  // 确定分类 (映射到 blog/ 下的子目录)
  let categoryDir = 'others'
  try {
      const relativePath = path.relative(CONFIG.notesRepoPath, filePath)
      const topLevelDir = relativePath.split(path.sep)[0]
      categoryDir = CONFIG.categoryMap[topLevelDir] || 'others'
  } catch (e) {
      // 如果不在 notesRepoPath 下，默认为 others
  }
  
  return {
    title,
    date,
    summary,
    tags: tags.length > 0 ? tags : CONFIG.defaultTags,
    categoryDir,
    author: CONFIG.author.name
  }
}

/**
 * 生成 VitePress frontmatter
 */
function generateFrontmatter(metadata) {
  return `---
title: ${metadata.title}
date: ${metadata.date}
summary: ${metadata.summary}
tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]
author: ${metadata.author}
---

`
}

/**
 * 复制相关资源文件
 */
function copyAssets(sourceFile) {
  const sourceDir = path.dirname(sourceFile)
  const assets = []
  
  // 查找内容中的图片引用
  const content = fs.readFileSync(sourceFile, 'utf-8')
  const imageMatches = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []
  
  imageMatches.forEach(match => {
    const imgPath = match.match(/\(([^)]+)\)/)[1]
    if (!imgPath.startsWith('http') && !imgPath.startsWith('/')) {
      const fullPath = path.resolve(sourceDir, imgPath)
      if (fs.existsSync(fullPath)) {
        const targetPath = path.join(CONFIG.assetsDir, path.basename(imgPath))
        ensureDir(path.dirname(targetPath))
        fs.copyFileSync(fullPath, targetPath)
        assets.push(path.basename(imgPath))
      }
    }
  })
  
  return assets
}

// ========== 主流程 ==========

async function importNote(notePath) {
  log(`开始导入笔记: ${path.basename(notePath)}`, 'info')
  
  if (!fs.existsSync(notePath)) {
    log(`文件不存在: ${notePath}`, 'error')
    return false
  }
  
  // 1. 转换格式
  log('正在转换格式...', 'convert')
  const originalContent = fs.readFileSync(notePath, 'utf-8')
  const { content: convertedContent, metadata } = convertObsidianToBlog(originalContent, notePath)
  
  // 2. 复制资源
  log('正在处理资源文件...', 'convert')
  const copiedAssets = copyAssets(notePath)
  if (copiedAssets.length > 0) {
      log(`复制了 ${copiedAssets.length} 个资源文件`, 'success')
  }
  
  // 3. 保存文件
  const blogFileName = `${metadata.date}-${metadata.title.replace(/\s+/g, '-').toLowerCase()}.md`
  // 使用映射后的分类目录
  const targetDir = path.join(CONFIG.blogDir, metadata.categoryDir)
  const blogFilePath = path.join(targetDir, blogFileName)
  
  ensureDir(path.dirname(blogFilePath))
  fs.writeFileSync(blogFilePath, convertedContent)
  
  log(`笔记已导入至: blog/${metadata.categoryDir}/${blogFileName}`, 'success')
  return blogFilePath
}

// CLI 支持
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const notePath = process.argv[2]
  if (notePath) {
    importNote(notePath).catch(err => {
        console.error(err)
        process.exit(1)
    })
  } else {
    console.log('请提供笔记路径')
  }
}

export { importNote }
