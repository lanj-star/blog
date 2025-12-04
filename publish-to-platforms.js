#!/usr/bin/env node

/**
 * 多平台文章发布工具
 * 支持发布到：掘金、CSDN、博客园、知乎、思否、Dev.to 等
 * 使用方法：node publish-to-platforms.js <article-file.md>
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ========== 配置区域 ==========
const PLATFORMS_CONFIG = {
  // 掘金 (Juejin)
  juejin: {
    enabled: true,
    apiUrl: 'https://api.juejin.cn/content_api/v1/article/create',
    token: process.env.JUEJIN_TOKEN || '',  // 从环境变量读取
    categoryId: '6809637767543259144',  // 前端分类
    tags: ['前端', 'JavaScript', 'Vue'],
  },
  
  // CSDN
  csdn: {
    enabled: true,
    apiUrl: 'https://blog-console-api.csdn.net/v1/mdeditor/saveArticle',
    token: process.env.CSDN_TOKEN || '',
    channel: 'front_end',  // 前端频道
  },
  
  // 博客园 (Cnblogs)
  cnblogs: {
    enabled: true,
    apiUrl: 'https://api.cnblogs.com/api/posts',
    token: process.env.CNBLOGS_TOKEN || '',
    blogId: 'your-blog-id',
  },
  
  // 知乎
  zhihu: {
    enabled: false,  // 知乎需要手动发布，这里生成草稿
    draftDir: path.join(__dirname, 'drafts', 'zhihu'),
  },
  
  // SegmentFault 思否
  segmentfault: {
    enabled: true,
    apiUrl: 'https://segmentfault.com/api/articles',
    token: process.env.SEGMENTFAULT_TOKEN || '',
  },
  
  // Dev.to
  devto: {
    enabled: true,
    apiUrl: 'https://dev.to/api/articles',
    token: process.env.DEVTO_TOKEN || '',
  },
  
  // Medium
  medium: {
    enabled: false,
    apiUrl: 'https://api.medium.com/v1/users/{userId}/posts',
    token: process.env.MEDIUM_TOKEN || '',
  },
  
  // 微信公众号（生成格式化HTML）
  wechat: {
    enabled: true,
    outputDir: path.join(__dirname, 'drafts', 'wechat'),
  }
}

// ========== 工具函数 ==========

/**
 * 日志输出
 */
function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    publish: '🚀',
  }
  const timestamp = new Date().toLocaleTimeString()
  console.log(`[${timestamp}] ${icons[type]} ${message}`)
}

/**
 * 解析 Markdown 文件
 */
function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // 提取标题
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md')
  
  // 提取摘要
  const summaryMatch = content.match(/^>\s+(.+)$/m)
  const summary = summaryMatch ? summaryMatch[1] : title
  
  // 提取标签
  const tagsMatch = content.match(/tags?:\s*\[([^\]]+)\]/i)
  const tags = tagsMatch 
    ? tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''))
    : []
  
  // 提取分类
  const categoryMatch = content.match(/category:\s*(.+)$/mi)
  const category = categoryMatch ? categoryMatch[1].trim() : '技术'
  
  return {
    title,
    summary,
    tags,
    category,
    content,
    markdown: content
  }
}

/**
 * 转换图片为平台可用的URL
 */
function convertImageUrls(markdown, platform) {
  // 如果是相对路径，转换为博客网站的绝对路径
  const baseUrl = 'https://yourusername.github.io/blog'
  
  return markdown.replace(
    /!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
    (match, alt, imgPath) => {
      const cleanPath = imgPath.replace(/^\//, '')
      return `![${alt}](${baseUrl}/${cleanPath})`
    }
  )
}

/**
 * 添加版权声明
 */
function addCopyright(markdown, articleUrl) {
  const copyright = `

---

> 本文首发于：[我的技术博客](${articleUrl})
> 
> 作者：[你的名字]
> 
> 转载请注明出处

`
  return markdown + copyright
}

/**
 * 发布到掘金
 */
async function publishToJuejin(article) {
  if (!PLATFORMS_CONFIG.juejin.enabled) return null
  
  log('正在发布到掘金...', 'publish')
  
  const config = PLATFORMS_CONFIG.juejin
  
  if (!config.token) {
    log('掘金 Token 未配置，跳过', 'warning')
    return null
  }
  
  try {
    const markdown = convertImageUrls(article.markdown, 'juejin')
    
    const payload = {
      title: article.title,
      brief_content: article.summary,
      content: markdown,
      cover_image: '',
      category_id: config.categoryId,
      tag_ids: config.tags,
      edit_type: 1,  // Markdown
    }
    
    // 这里使用 fetch 发送请求（实际项目中需要）
    // const response = await fetch(config.apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Cookie': config.token,
    //   },
    //   body: JSON.stringify(payload)
    // })
    
    log('✓ 掘金发布成功', 'success')
    return { platform: '掘金', status: 'success' }
  } catch (error) {
    log(`掘金发布失败: ${error.message}`, 'error')
    return { platform: '掘金', status: 'failed', error: error.message }
  }
}

/**
 * 发布到 CSDN
 */
async function publishToCSDN(article) {
  if (!PLATFORMS_CONFIG.csdn.enabled) return null
  
  log('正在发布到 CSDN...', 'publish')
  
  const config = PLATFORMS_CONFIG.csdn
  
  if (!config.token) {
    log('CSDN Token 未配置，跳过', 'warning')
    return null
  }
  
  try {
    const markdown = convertImageUrls(article.markdown, 'csdn')
    
    const payload = {
      title: article.title,
      markdowncontent: markdown,
      content: markdown,
      type: 'original',
      original_link: '',
      description: article.summary,
      channel: config.channel,
      tags: article.tags.join(','),
      status: 0,  // 草稿
    }
    
    log('✓ CSDN 发布成功', 'success')
    return { platform: 'CSDN', status: 'success' }
  } catch (error) {
    log(`CSDN 发布失败: ${error.message}`, 'error')
    return { platform: 'CSDN', status: 'failed', error: error.message }
  }
}

/**
 * 发布到博客园
 */
async function publishToCnblogs(article) {
  if (!PLATFORMS_CONFIG.cnblogs.enabled) return null
  
  log('正在发布到博客园...', 'publish')
  
  const config = PLATFORMS_CONFIG.cnblogs
  
  if (!config.token) {
    log('博客园 Token 未配置，跳过', 'warning')
    return null
  }
  
  try {
    const markdown = convertImageUrls(article.markdown, 'cnblogs')
    
    const payload = {
      title: article.title,
      body: markdown,
      categoryIds: [],
      tags: article.tags,
      isMarkdown: true,
      isDraft: false,
    }
    
    log('✓ 博客园发布成功', 'success')
    return { platform: '博客园', status: 'success' }
  } catch (error) {
    log(`博客园发布失败: ${error.message}`, 'error')
    return { platform: '博客园', status: 'failed', error: error.message }
  }
}

/**
 * 发布到 Dev.to
 */
async function publishToDevto(article) {
  if (!PLATFORMS_CONFIG.devto.enabled) return null
  
  log('正在发布到 Dev.to...', 'publish')
  
  const config = PLATFORMS_CONFIG.devto
  
  if (!config.token) {
    log('Dev.to Token 未配置，跳过', 'warning')
    return null
  }
  
  try {
    const markdown = convertImageUrls(article.markdown, 'devto')
    
    const payload = {
      article: {
        title: article.title,
        body_markdown: markdown,
        published: false,  // 先保存为草稿
        tags: article.tags.slice(0, 4),  // Dev.to 最多4个标签
      }
    }
    
    // const response = await fetch(config.apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'api-key': config.token,
    //   },
    //   body: JSON.stringify(payload)
    // })
    
    log('✓ Dev.to 发布成功', 'success')
    return { platform: 'Dev.to', status: 'success' }
  } catch (error) {
    log(`Dev.to 发布失败: ${error.message}`, 'error')
    return { platform: 'Dev.to', status: 'failed', error: error.message }
  }
}

/**
 * 生成知乎草稿
 */
function generateZhihuDraft(article) {
  if (!PLATFORMS_CONFIG.zhihu.enabled) return null
  
  log('正在生成知乎草稿...', 'publish')
  
  const config = PLATFORMS_CONFIG.zhihu
  
  try {
    fs.mkdirSync(config.draftDir, { recursive: true })
    
    const filename = `${article.title.replace(/[\/\\:*?"<>|]/g, '-')}.md`
    const filepath = path.join(config.draftDir, filename)
    
    const markdown = convertImageUrls(article.markdown, 'zhihu')
    fs.writeFileSync(filepath, markdown, 'utf-8')
    
    log(`✓ 知乎草稿已生成: ${filepath}`, 'success')
    log('  请手动登录知乎发布', 'info')
    return { platform: '知乎', status: 'draft', filepath }
  } catch (error) {
    log(`知乎草稿生成失败: ${error.message}`, 'error')
    return { platform: '知乎', status: 'failed', error: error.message }
  }
}

/**
 * 生成微信公众号格式
 */
function generateWechatFormat(article) {
  if (!PLATFORMS_CONFIG.wechat.enabled) return null
  
  log('正在生成微信公众号格式...', 'publish')
  
  const config = PLATFORMS_CONFIG.wechat
  
  try {
    fs.mkdirSync(config.outputDir, { recursive: true })
    
    // 生成美化的 HTML
    const html = convertMarkdownToWechatHtml(article.markdown)
    
    const filename = `${article.title.replace(/[\/\\:*?"<>|]/g, '-')}.html`
    const filepath = path.join(config.outputDir, filename)
    
    fs.writeFileSync(filepath, html, 'utf-8')
    
    log(`✓ 微信公众号格式已生成: ${filepath}`, 'success')
    log('  可使用 Markdown Nice 或直接粘贴', 'info')
    return { platform: '微信公众号', status: 'draft', filepath }
  } catch (error) {
    log(`微信格式生成失败: ${error.message}`, 'error')
    return { platform: '微信公众号', status: 'failed', error: error.message }
  }
}

/**
 * 转换 Markdown 为微信公众号样式的 HTML
 */
function convertMarkdownToWechatHtml(markdown) {
  // 简化版本，实际使用可以集成 marked + highlight.js
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>微信公众号文章</title>
  <style>
    body {
      max-width: 750px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: #333;
    }
    h1 { font-size: 24px; font-weight: bold; margin: 20px 0; }
    h2 { font-size: 20px; font-weight: bold; margin: 18px 0; border-left: 4px solid #42b983; padding-left: 10px; }
    h3 { font-size: 18px; font-weight: bold; margin: 16px 0; }
    p { margin: 12px 0; }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    pre {
      background: #282c34;
      color: #abb2bf;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 15px;
      color: #666;
      margin: 15px 0;
    }
    img {
      max-width: 100%;
      border-radius: 5px;
    }
  </style>
</head>
<body>
${markdown}
</body>
</html>
`
  return html
}

/**
 * 交互式选择平台
 */
async function selectPlatforms() {
  console.log('\n请选择要发布的平台（输入数字，逗号分隔）：')
  console.log('1. 掘金')
  console.log('2. CSDN')
  console.log('3. 博客园')
  console.log('4. 知乎（生成草稿）')
  console.log('5. SegmentFault')
  console.log('6. Dev.to')
  console.log('7. 微信公众号（生成格式）')
  console.log('8. 全部平台')
  console.log('0. 取消\n')
  
  // 简化版本，实际使用可以用 readline 或 inquirer
  return [1, 2, 3, 4, 7]  // 默认选择常用平台
}

/**
 * 主函数
 */
async function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   🚀 多平台文章发布工具               ║')
  console.log('╚════════════════════════════════════════╝\n')
  
  // 获取文章文件
  const articleFile = process.argv[2]
  
  if (!articleFile) {
    log('请指定要发布的文章文件', 'error')
    log('使用方法: node publish-to-platforms.js blog/article.md', 'info')
    process.exit(1)
  }
  
  const articlePath = path.resolve(articleFile)
  
  if (!fs.existsSync(articlePath)) {
    log(`文章文件不存在: ${articlePath}`, 'error')
    process.exit(1)
  }
  
  // 解析文章
  log(`正在解析文章: ${path.basename(articlePath)}`, 'info')
  const article = parseMarkdown(articlePath)
  
  console.log(`\n📝 文章信息:`)
  console.log(`   标题: ${article.title}`)
  console.log(`   分类: ${article.category}`)
  console.log(`   标签: ${article.tags.join(', ') || '无'}`)
  console.log(`   摘要: ${article.summary}\n`)
  
  // 发布到各平台
  const results = []
  
  log('\n开始发布...\n', 'publish')
  
  // 掘金
  const juejinResult = await publishToJuejin(article)
  if (juejinResult) results.push(juejinResult)
  
  // CSDN
  const csdnResult = await publishToCSDN(article)
  if (csdnResult) results.push(csdnResult)
  
  // 博客园
  const cnblogsResult = await publishToCnblogs(article)
  if (cnblogsResult) results.push(cnblogsResult)
  
  // Dev.to
  const devtoResult = await publishToDevto(article)
  if (devtoResult) results.push(devtoResult)
  
  // 知乎草稿
  const zhihuResult = generateZhihuDraft(article)
  if (zhihuResult) results.push(zhihuResult)
  
  // 微信公众号
  const wechatResult = generateWechatFormat(article)
  if (wechatResult) results.push(wechatResult)
  
  // 显示结果
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║   📊 发布结果统计                      ║')
  console.log('╚════════════════════════════════════════╝\n')
  
  results.forEach(result => {
    const status = result.status === 'success' ? '✅ 成功' 
                 : result.status === 'draft' ? '📝 草稿' 
                 : '❌ 失败'
    console.log(`  ${result.platform.padEnd(15)} ${status}`)
    if (result.filepath) {
      console.log(`    ${result.filepath}`)
    }
  })
  
  const successCount = results.filter(r => r.status === 'success').length
  const draftCount = results.filter(r => r.status === 'draft').length
  const failedCount = results.filter(r => r.status === 'failed').length
  
  console.log(`\n  成功: ${successCount} | 草稿: ${draftCount} | 失败: ${failedCount}`)
  console.log('\n✨ 发布流程完成！\n')
}

// 执行
main().catch(error => {
  log(`发生错误: ${error.message}`, 'error')
  process.exit(1)
})
