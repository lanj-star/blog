# 我的技术博客

基于 VitePress 搭建的现代化个人技术博客。

## ✨ 特性

- ⚡ **极速体验** - 基于 Vite + Vue 3，开发和构建都超快
- 📝 **Markdown 写作** - 专注内容创作，支持代码高亮
- 🎨 **美观主题** - 现代化设计，支持深色模式
- 🔍 **全文搜索** - 内置本地搜索功能
- 📱 **响应式设计** - 完美适配移动端
- 🚀 **自动部署** - GitHub Actions 自动部署到 GitHub Pages

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

在浏览器中访问 `http://localhost:5173` 查看效果。

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📁 项目结构

```
blog/
├── .vitepress/          # VitePress 配置目录
│   ├── config.mts       # 网站配置
│   └── dist/            # 构建输出（自动生成）
├── .github/
│   └── workflows/       # GitHub Actions 配置
│       └── deploy.yml   # 自动部署配置
├── blog/                # 博客文章目录
│   ├── index.md         # 博客首页
│   └── *.md             # 各篇文章
├── index.md             # 网站首页
├── about.md             # 关于页面
├── package.json         # 项目配置
└── README.md            # 项目说明
```

## 📝 写作指南

### 创建新文章

1. 在 `blog/` 目录下创建新的 `.md` 文件
2. 在 `.vitepress/config.mts` 的 `sidebar` 中添加文章链接
3. 使用 Markdown 语法编写内容

### 文章模板

```markdown
# 文章标题

## 简介

文章简介...

## 主要内容

### 小标题 1

内容...

### 小标题 2

内容...

## 总结

总结...
```

## 🚀 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

创建一个新的 GitHub 仓库，例如 `my-blog`。

### 2. 推送代码

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/my-blog.git
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 进入仓库的 Settings > Pages
2. Source 选择 "GitHub Actions"
3. 推送代码后，Actions 会自动构建和部署
4. 部署完成后，访问 `https://yourusername.github.io/my-blog/`

### 4. 配置 base 路径（如果需要）

如果仓库名不是 `yourusername.github.io`，需要在 `.vitepress/config.mts` 中配置 base：

```typescript
export default defineConfig({
  base: '/my-blog/', // 你的仓库名
  // ... 其他配置
})
```

## 🎨 自定义配置

### 修改网站信息

编辑 `.vitepress/config.mts`：

```typescript
export default defineConfig({
  title: "你的博客名称",
  description: "你的博客描述",
  // ... 其他配置
})
```

### 修改导航栏

```typescript
nav: [
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  { text: '关于', link: '/about' }
]
```

### 修改侧边栏

```typescript
sidebar: {
  '/blog/': [
    {
      text: '分类名称',
      items: [
        { text: '文章标题', link: '/blog/article-name' }
      ]
    }
  ]
}
```

## 📚 技术栈

- [VitePress](https://vitepress.dev/) - 静态站点生成器
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [GitHub Pages](https://pages.github.com/) - 静态网站托管

## 📄 License

MIT License

---

**开始写作吧！** 🎉
