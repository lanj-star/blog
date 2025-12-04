# 多平台发布指南

本指南教你如何将博客文章一键发布到各大技术平台。

## 🌐 支持的平台

| 平台 | 发布方式 | 状态 | 说明 |
|------|---------|------|------|
| 🟢 掘金 | API 自动 | ✅ | 中国最大的技术社区 |
| 🔴 CSDN | API 自动 | ✅ | 中国最大的中文IT社区 |
| 🔵 博客园 | API 自动 | ✅ | 开发者知识分享社区 |
| 🟠 知乎 | 生成草稿 | 📝 | 需手动发布 |
| 🟣 SegmentFault | API 自动 | ✅ | 思否技术社区 |
| 🟡 Dev.to | API 自动 | ✅ | 国际开发者社区 |
| 🟢 微信公众号 | 生成格式 | 📝 | 生成排版后的HTML |
| ⚪ Medium | API 自动 | 🚧 | 国际博客平台 |

---

## 🚀 快速开始

### 第一步：配置 Token

复制配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入各平台的 Token：
```bash
JUEJIN_TOKEN=your_juejin_session_token
CSDN_TOKEN=your_csdn_user_token
CNBLOGS_TOKEN=your_cnblogs_access_token
DEVTO_TOKEN=your_devto_api_key
```

### 第二步：发布文章

```bash
# 发布单篇文章
node publish-to-platforms.js blog/article.md

# 或使用 npm 命令
npm run publish blog/article.md
```

---

## 🔑 Token 获取方法

### 掘金 (Juejin)

1. 登录 [掘金](https://juejin.cn/)
2. 按 `F12` 打开开发者工具
3. Application → Cookies → `sessionid`
4. 复制值到 `.env` 的 `JUEJIN_TOKEN`

**注意**: sessionid 会过期，需要定期更新。

### CSDN

1. 登录 [CSDN](https://www.csdn.net/)
2. 按 `F12` 打开开发者工具
3. Application → Cookies → `UserToken`
4. 复制值到 `.env` 的 `CSDN_TOKEN`

### 博客园 (Cnblogs)

1. 登录 [博客园](https://www.cnblogs.com/)
2. 进入 "设置" → "API 访问令牌"
3. 创建新令牌
4. 复制到 `.env` 的 `CNBLOGS_TOKEN`

### Dev.to

1. 登录 [Dev.to](https://dev.to/)
2. Settings → Extensions → [Generate API Key](https://dev.to/settings/extensions)
3. 复制到 `.env` 的 `DEVTO_TOKEN`

**最简单！** Dev.to 官方支持 API，无需担心 Token 过期。

### SegmentFault (思否)

1. 登录 [SegmentFault](https://segmentfault.com/)
2. 设置 → 个人令牌
3. 创建新令牌
4. 复制到 `.env` 的 `SEGMENTFAULT_TOKEN`

### Medium

1. 登录 [Medium](https://medium.com/)
2. Settings → [Integration tokens](https://medium.com/me/settings)
3. 生成新 Token
4. 复制到 `.env` 的 `MEDIUM_TOKEN`

---

## 📝 文章格式要求

### 基本格式

```markdown
# 文章标题

> 这是文章摘要，会作为简介显示

category: 前端开发
tags: [Vue, JavaScript, 前端]

## 正文内容

文章正文...
```

### 元数据说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 第一个 `#` 标题 | `# Vue 3 最佳实践` |
| `summary` | 第一个 `>` 引用 | `> 这是文章简介` |
| `category` | 分类 | `category: 前端开发` |
| `tags` | 标签数组 | `tags: [Vue, JavaScript]` |

### 图片处理

脚本会自动转换图片路径：

```markdown
# 原始路径（博客中使用）
![示例](/assets/example.png)

# 自动转换为（发布到平台）
![示例](https://yourusername.github.io/blog/assets/example.png)
```

---

## 🎯 发布策略

### 策略 1：全平台发布

适合：优质原创文章，希望获得最大曝光

```bash
# 发布到所有已配置的平台
node publish-to-platforms.js blog/best-article.md
```

### 策略 2：精选平台发布

适合：针对特定受众的文章

编辑 `publish-to-platforms.js`：
```javascript
const PLATFORMS_CONFIG = {
  juejin: { enabled: true },   // 发布
  csdn: { enabled: false },    // 不发布
  cnblogs: { enabled: true },  // 发布
  // ...
}
```

### 策略 3：草稿模式

适合：需要人工审核的内容

```javascript
// 大部分平台支持先发为草稿
const payload = {
  // ...
  status: 0,  // 草稿
  published: false,
}
```

---

## 🎨 微信公众号发布

### 方式一：使用 Markdown Nice

1. 运行发布脚本生成 HTML：
   ```bash
   node publish-to-platforms.js blog/article.md
   ```

2. 打开 [Markdown Nice](https://editor.mdnice.com/)

3. 复制生成的 HTML 内容

4. 粘贴到微信公众号编辑器

### 方式二：手动排版

1. 在 `drafts/wechat/` 找到生成的 HTML 文件

2. 在浏览器打开预览

3. 全选复制，粘贴到公众号编辑器

4. 手动调整样式

---

## 🔄 自动化工作流

### GitHub Actions 自动发布

创建 `.github/workflows/publish.yml`：

```yaml
name: Auto Publish to Platforms

on:
  push:
    branches:
      - main
    paths:
      - 'blog/**/*.md'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish articles
        env:
          JUEJIN_TOKEN: ${{ secrets.JUEJIN_TOKEN }}
          CSDN_TOKEN: ${{ secrets.CSDN_TOKEN }}
          DEVTO_TOKEN: ${{ secrets.DEVTO_TOKEN }}
        run: |
          # 获取新增或修改的文章
          git diff --name-only HEAD^ HEAD | grep '\.md$' | while read file; do
            node publish-to-platforms.js "$file"
          done
```

### 定时发布脚本

创建 `publish-scheduled.js`：

```javascript
// 每天检查待发布文章，自动发布
const schedule = require('node-schedule')

// 每天早上 9 点发布
schedule.scheduleJob('0 9 * * *', async () => {
  const articles = getPendingArticles()
  for (const article of articles) {
    await publishToAllPlatforms(article)
  }
})
```

---

## 📊 发布统计

### 记录发布历史

脚本会自动生成发布记录：

```json
// publish-history.json
{
  "articles": [
    {
      "title": "Vue 3 最佳实践",
      "file": "blog/vue3-best-practices.md",
      "publishedAt": "2025-01-15T08:00:00Z",
      "platforms": {
        "juejin": { "status": "success", "url": "https://..." },
        "csdn": { "status": "success", "url": "https://..." },
        "devto": { "status": "draft", "url": "https://..." }
      }
    }
  ]
}
```

### 查看统计

```bash
node publish-stats.js

# 输出：
# 📊 发布统计
# 总文章数: 15
# 已发布: 12
# 草稿: 3
# 
# 平台分布:
# 掘金: 12 篇
# CSDN: 10 篇
# Dev.to: 8 篇
```

---

## 🛠️ 高级功能

### 1. 批量发布

```bash
# 发布整个目录
node publish-batch.js blog/

# 发布多个文件
node publish-batch.js blog/article1.md blog/article2.md
```

### 2. 定时发布

```javascript
// 指定发布时间
const publishAt = new Date('2025-01-20 09:00:00')
await schedulePublish(article, publishAt, ['juejin', 'csdn'])
```

### 3. 自动添加版权

```javascript
// 在每篇文章末尾自动添加
const copyright = `
> 本文首发于：[我的博客](${blogUrl})
> 转载请注明出处
`
```

### 4. SEO 优化

```javascript
// 为不同平台优化标题和标签
const optimizedTitle = optimizeForPlatform(title, 'juejin')
const recommendedTags = getRecommendedTags(content, platform)
```

---

## 🔐 安全建议

### 1. Token 管理

- ❌ **不要**把 Token 提交到 Git
- ✅ 使用 `.env` 文件
- ✅ 添加 `.env` 到 `.gitignore`
- ✅ 定期更换 Token

### 2. 权限控制

```javascript
// 只赋予必要的权限
const PERMISSIONS = {
  juejin: ['write:article'],  // 仅写文章权限
  csdn: ['write:blog'],
}
```

### 3. 错误处理

```javascript
try {
  await publishToJuejin(article)
} catch (error) {
  // 记录错误但不中断流程
  logError(error)
  // 发送通知
  await sendNotification(`掘金发布失败: ${error.message}`)
}
```

---

## 🎯 最佳实践

### 1. 文章准备

- ✅ 统一使用 Markdown 格式
- ✅ 图片使用相对路径或博客 URL
- ✅ 添加标题、摘要、标签
- ✅ 代码块指定语言
- ✅ 检查内容质量

### 2. 发布顺序

推荐发布顺序：
1. **个人博客** - 首发
2. **掘金** - 技术氛围好，流量大
3. **知乎** - 适合深度内容
4. **CSDN** - SEO 好，搜索量大
5. **Dev.to** - 国际化
6. **微信公众号** - 最后发，避免被判为转载

### 3. 标签策略

```javascript
// 不同平台的标签偏好
const tagStrategy = {
  juejin: ['前端', 'Vue', 'JavaScript'],      // 3-5个
  csdn: ['前端', 'vue.js', 'javascript'],     // 小写
  devto: ['vue', 'javascript', 'frontend'],   // 英文
}
```

### 4. 内容差异化

```javascript
// 为不同平台定制内容
const customizeForPlatform = (content, platform) => {
  if (platform === 'juejin') {
    // 掘金偏好技术深度
    return addTechnicalDetails(content)
  } else if (platform === 'zhihu') {
    // 知乎偏好故事性
    return addPersonalExperience(content)
  }
  return content
}
```

---

## 📈 效果追踪

### 集成统计

```javascript
// 追踪文章表现
const analytics = {
  views: 0,
  likes: 0,
  comments: 0,
  collections: 0,
}

// 定期拉取数据
setInterval(() => {
  updateAnalytics('juejin', articleId)
  updateAnalytics('csdn', articleId)
}, 3600000)  // 每小时更新
```

### 生成报告

```bash
node generate-report.js

# 输出：
# 📊 本月发布报告
# 
# 发布数量: 8 篇
# 总阅读量: 12,345
# 总点赞数: 567
# 
# 最佳文章: "Vue 3 组合式 API"
#   阅读: 3,456
#   点赞: 234
```

---

## 🐛 常见问题

### Q1: Token 过期怎么办？

**解决**: 
- Cookie 类 Token（掘金、CSDN）需定期手动更新
- API Key（Dev.to）永久有效

### Q2: 发布失败如何重试？

**解决**:
```bash
# 脚本支持重试
node publish-to-platforms.js blog/article.md --retry 3
```

### Q3: 如何避免重复发布？

**解决**:
```javascript
// 检查文章是否已发布
const isPublished = await checkIfPublished(articleId, 'juejin')
if (!isPublished) {
  await publish()
}
```

### Q4: 图片上传失败？

**解决**:
- 使用 CDN 或图床服务
- 脚本中添加图片上传功能
- 使用博客网站的绝对 URL

---

## 🚧 未来计划

- [ ] 支持更多平台（简书、今日头条）
- [ ] 图片自动上传到图床
- [ ] AI 辅助生成摘要和标签
- [ ] 数据分析仪表盘
- [ ] 一键更新已发布文章
- [ ] 评论同步管理

---

## 📚 相关资源

### API 文档
- [掘金 API](https://api.juejin.cn/)
- [Dev.to API](https://developers.forem.com/api/)
- [Medium API](https://github.com/Medium/medium-api-docs)

### 工具推荐
- [Markdown Nice](https://editor.mdnice.com/) - 微信排版
- [mdnice](https://github.com/mdnice/markdown-nice) - 开源排版工具
- [图壳](https://imgkr.com/) - 图片上传

---

## 💡 使用技巧

1. **批量发布新文章**
   ```bash
   find blog -name "*.md" -mtime -7 | while read f; do
     node publish-to-platforms.js "$f"
   done
   ```

2. **只发布到特定平台**
   ```bash
   node publish-to-platforms.js blog/article.md --platforms juejin,devto
   ```

3. **预览模式（不实际发布）**
   ```bash
   node publish-to-platforms.js blog/article.md --dry-run
   ```

---

**开始你的多平台传播之旅吧！** 🚀
