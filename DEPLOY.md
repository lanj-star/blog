# GitHub Pages 部署指南

本文档详细说明如何将博客部署到 GitHub Pages。

## 🚀 快速部署

### 第一步：创建 GitHub 仓库

1. 打开 [GitHub](https://github.com/)
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`blog`（或任意名称）
4. 设置为 Public（公开）
5. 不要勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

### 第二步：推送代码

```bash
# 1. 添加所有文件
git add .

# 2. 提交
git commit -m "Initial commit: 博客初始化"

# 3. 设置默认分支为 main
git branch -M main

# 4. 添加远程仓库（替换 yourusername 为你的 GitHub 用户名）
git remote add origin https://github.com/yourusername/blog.git

# 5. 推送到 GitHub
git push -u origin main
```

### 第三步：配置 GitHub Pages

1. 进入仓库页面
2. 点击 "Settings"（设置）
3. 左侧菜单找到 "Pages"
4. **Source（来源）**选择：**GitHub Actions**
5. 保存

### 第四步：等待部署

- 推送代码后，GitHub Actions 会自动构建
- 查看构建状态：仓库页面 → Actions 标签
- 构建成功后，访问：`https://yourusername.github.io/blog/`

---

## 📝 详细说明

### 仓库类型说明

#### 类型 A：项目仓库（推荐）

**仓库名**：任意名称（如 `blog`, `my-blog`）

**访问地址**：`https://yourusername.github.io/blog/`

**配置 base**：
```typescript
// .vitepress/config.mts
export default defineConfig({
  base: '/blog/',  // 仓库名
  // ...
})
```

#### 类型 B：用户/组织仓库

**仓库名**：必须是 `yourusername.github.io`

**访问地址**：`https://yourusername.github.io/`

**配置 base**：
```typescript
// .vitepress/config.mts
export default defineConfig({
  base: '/',  // 根路径
  // ...
})
```

---

## 🔧 配置文件说明

### 1. GitHub Actions 工作流

文件：`.github/workflows/deploy.yml`

这个文件已经为你创建好了，会自动：
- 监听 main 分支的推送
- 安装依赖
- 构建静态网站
- 部署到 GitHub Pages

### 2. VitePress 配置

文件：`.vitepress/config.mts`

**重要配置**：
```typescript
export default defineConfig({
  // base 路径（根据仓库类型设置）
  base: '/blog/',
  
  // 网站标题
  title: "我的技术博客",
  
  // 网站描述
  description: "记录技术成长与思考",
  
  // GitHub 链接
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/blog' }
    ]
  }
})
```

---

## 🎯 常见问题

### Q1: 推送时要求输入用户名密码？

**原因**：GitHub 已禁用密码认证

**解决方案 A - 使用 Personal Access Token**：

1. 生成 Token：
   - GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token
   - 勾选 `repo` 权限
   - 生成并复制 Token

2. 使用 Token：
   ```bash
   # 用户名：你的 GitHub 用户名
   # 密码：粘贴 Token（不是真实密码）
   git push
   ```

**解决方案 B - 使用 SSH（推荐）**：

1. 生成 SSH Key：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 添加公钥到 GitHub：
   ```bash
   # 复制公钥
   cat ~/.ssh/id_ed25519.pub
   
   # 在 GitHub Settings → SSH and GPG keys → New SSH key 粘贴
   ```

3. 修改远程仓库地址：
   ```bash
   git remote set-url origin git@github.com:yourusername/blog.git
   git push
   ```

### Q2: 页面 404 或样式丢失？

**原因**：`base` 路径配置不正确

**检查**：
- 仓库名是 `blog` → base 应该是 `/blog/`
- 仓库名是 `yourusername.github.io` → base 应该是 `/`

**修改**：
```typescript
// .vitepress/config.mts
export default defineConfig({
  base: '/你的仓库名/',  // 注意前后都有斜杠
})
```

### Q3: Actions 构建失败？

**常见原因**：

1. **权限问题**：
   - Settings → Actions → General
   - Workflow permissions → 选择 "Read and write permissions"
   - 保存

2. **分支问题**：
   - 确保代码在 `main` 分支
   - 检查 `.github/workflows/deploy.yml` 中的分支配置

3. **依赖问题**：
   - 确保 `package.json` 正确
   - 本地运行 `npm install` 测试

### Q4: 如何绑定自定义域名？

**步骤**：

1. 在仓库根目录创建 `public/CNAME` 文件：
   ```
   blog.yourdomain.com
   ```

2. 在域名提供商设置 DNS：
   ```
   类型: CNAME
   主机记录: blog
   记录值: yourusername.github.io
   ```

3. GitHub Settings → Pages → Custom domain
   输入域名并保存

4. 等待 DNS 生效（几分钟到几小时）

---

## 📋 完整部署检查清单

### 部署前检查

- [ ] 已创建 GitHub 仓库
- [ ] 本地代码已提交
- [ ] `.vitepress/config.mts` 中 base 路径正确
- [ ] GitHub 用户名和链接已更新
- [ ] `.github/workflows/deploy.yml` 文件存在

### 推送代码

```bash
# 检查状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "部署到 GitHub Pages"

# 推送
git push origin main
```

### 部署后验证

- [ ] GitHub Actions 构建成功（绿色✓）
- [ ] Settings → Pages 显示部署地址
- [ ] 访问网站正常
- [ ] 导航链接正常
- [ ] 图片显示正常
- [ ] 搜索功能正常
- [ ] 移动端显示正常

---

## 🔄 更新流程

### 日常更新文章

```bash
# 1. 编辑或添加文章
vim blog/new-article.md

# 2. 本地预览
npm run dev

# 3. 提交并推送
git add .
git commit -m "添加新文章：xxx"
git push

# 4. 自动部署（无需手动操作）
# GitHub Actions 会自动构建并部署
```

### 更新配置

```bash
# 1. 修改配置文件
vim .vitepress/config.mts

# 2. 本地测试
npm run build
npm run preview

# 3. 提交并推送
git add .
git commit -m "更新配置"
git push
```

---

## 🚀 性能优化

### 1. 启用缓存

GitHub Actions 已配置 npm 缓存，加速构建。

### 2. 图片优化

```bash
# 安装图片优化工具
npm install -D vite-plugin-imagemin

# 配置 .vitepress/config.mts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  vite: {
    plugins: [viteImagemin()]
  }
})
```

### 3. CDN 加速

使用 jsDelivr CDN：
```
https://cdn.jsdelivr.net/gh/yourusername/blog@main/
```

---

## 📊 监控和分析

### 1. Google Analytics

```typescript
// .vitepress/config.mts
export default defineConfig({
  head: [
    ['script', {
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'
    }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `]
  ]
})
```

### 2. 百度统计

```typescript
head: [
  ['script', {}, `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?xxxxxx";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
  `]
]
```

---

## 🎓 进阶配置

### 1. 多环境部署

```yaml
# .github/workflows/deploy-staging.yml
# 部署到测试环境
on:
  push:
    branches: [develop]

# .github/workflows/deploy-production.yml
# 部署到生产环境
on:
  push:
    branches: [main]
```

### 2. 自动化测试

```yaml
- name: Test build
  run: |
    npm run build
    # 检查是否有损坏的链接
    npx broken-link-checker http://localhost:4173
```

### 3. 部署通知

```yaml
- name: Send notification
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"博客部署成功！"}' \
    YOUR_WEBHOOK_URL
```

---

## 📞 获取帮助

### 查看部署日志

1. 进入仓库页面
2. 点击 "Actions" 标签
3. 点击最新的工作流运行
4. 查看详细日志

### 常用命令

```bash
# 查看远程仓库
git remote -v

# 查看提交历史
git log --oneline

# 强制推送（慎用）
git push -f origin main

# 查看构建输出
npm run build

# 本地预览构建结果
npm run preview
```

---

## ✅ 部署成功！

部署完成后，你的博客将可以通过以下地址访问：

**项目仓库**：`https://yourusername.github.io/blog/`

**用户仓库**：`https://yourusername.github.io/`

---

**祝你的博客蓬勃发展！** 🎉

最后更新：2025-01-15
