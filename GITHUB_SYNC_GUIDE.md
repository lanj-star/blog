# GitHub 私有仓库同步指南

本指南教你如何从 GitHub 私有仓库自动同步笔记到博客。

## 🎯 方案优势

- ✅ **完全自动化** - 一条命令搞定
- ✅ **支持私有仓库** - 使用 SSH 或 Personal Access Token
- ✅ **增量同步** - 只拉取最新更改，速度快
- ✅ **版本控制** - 笔记和博客都有版本记录
- ✅ **隔离存储** - 笔记仓库保持独立

---

## 🚀 快速开始

### 第一步：配置 GitHub 仓库

编辑 `sync-from-github.js`，修改配置：

```javascript
const CONFIG = {
  // GitHub 仓库地址（SSH 或 HTTPS）
  githubRepo: 'git@github.com:yourusername/your-notes-repo.git',
  
  // 分支名称
  branch: 'main',
  
  // 要同步的文件夹
  syncFolders: [
    'frontend',
    'backend',
    'algorithms',
  ],
}
```

### 第二步：配置 Git 访问权限

选择以下任一方式：

#### 方式 A：SSH Key（推荐）

1. **生成 SSH Key**（如果还没有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **添加到 GitHub**：
   - 复制公钥：`cat ~/.ssh/id_ed25519.pub`
   - 打开 GitHub Settings > SSH and GPG keys
   - 点击 "New SSH key"，粘贴公钥

3. **测试连接**：
   ```bash
   ssh -T git@github.com
   ```

4. **使用 SSH 地址**：
   ```javascript
   githubRepo: 'git@github.com:yourusername/your-notes-repo.git'
   ```

#### 方式 B：Personal Access Token

1. **生成 Token**：
   - 打开 GitHub Settings > Developer settings > Personal access tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo`（完全访问私有仓库）
   - 生成并复制 token

2. **使用 HTTPS + Token**：
   ```javascript
   githubRepo: 'https://<TOKEN>@github.com/yourusername/your-notes-repo.git'
   ```

### 第三步：运行同步

```bash
npm run sync:github
```

---

## 📋 完整配置说明

### 配置项详解

```javascript
const CONFIG = {
  // ========== 必填 ==========
  // GitHub 仓库地址
  githubRepo: 'git@github.com:yourusername/notes.git',
  
  // 分支名称
  branch: 'main',  // 或 'master'
  
  // ========== 同步内容 ==========
  // 同步整个文件夹
  syncFolders: ['frontend', 'backend'],
  
  // 或同步指定文件
  specificFiles: [
    'frontend/vue3-notes.md',
    'algorithms/leetcode.md',
  ],
  
  // ========== 资源文件 ==========
  // 是否复制图片
  copyAssets: true,
  
  // 图片源目录（笔记仓库中）
  assetsSourceDir: 'assets',
  
  // 图片目标目录（博客中）
  assetsTargetDir: path.join(__dirname, 'public', 'assets'),
  
  // ========== 其他选项 ==========
  // 是否自动更新侧边栏
  autoUpdateSidebar: true,
  
  // 是否保留临时目录（加速后续同步）
  keepTempDir: true,
  
  // 文章分类映射
  categoryMapping: {
    'frontend': '前端开发',
    'backend': '后端开发',
  }
}
```

---

## 🔧 使用场景

### 场景 1：全量同步

同步笔记仓库的所有前端和后端文章：

```javascript
const CONFIG = {
  githubRepo: 'git@github.com:username/notes.git',
  syncFolders: ['frontend', 'backend'],
  specificFiles: [],
}
```

### 场景 2：精选同步

只同步精心挑选的文章：

```javascript
const CONFIG = {
  githubRepo: 'git@github.com:username/notes.git',
  syncFolders: [],
  specificFiles: [
    'frontend/vue3-best-practices.md',
    'backend/nodejs-performance.md',
    'algorithms/leetcode-hot100.md',
  ],
}
```

### 场景 3：混合同步

前端全部 + 后端精选：

```javascript
const CONFIG = {
  githubRepo: 'git@github.com:username/notes.git',
  syncFolders: ['frontend'],
  specificFiles: [
    'backend/important-note.md',
    'database/mysql-optimization.md',
  ],
}
```

---

## 🔄 工作流程

### 日常写作流程

```bash
# 1. 在笔记仓库写作并提交
cd your-notes-repo
git add .
git commit -m "添加新笔记"
git push

# 2. 在博客仓库同步
cd blog
npm run sync:github

# 3. 预览效果
npm run dev

# 4. 推送博客更新
git add .
git commit -m "同步新文章"
git push
```

### 自动化脚本（可选）

创建 `auto-sync.sh`（Mac/Linux）：

```bash
#!/bin/bash
cd /path/to/blog
npm run sync:github
git add .
git commit -m "自动同步文章 $(date)"
git push
```

或 `auto-sync.bat`（Windows）：

```batch
@echo off
cd C:\path\to\blog
call npm run sync:github
git add .
git commit -m "自动同步文章 %date%"
git push
```

设置定时任务（每天自动同步）：
- **Windows**: 任务计划程序
- **Mac**: crontab
- **Linux**: crontab

---

## 📁 推荐的笔记仓库结构

```
your-notes-repo/
├── frontend/           # 前端笔记
│   ├── vue3.md
│   ├── react.md
│   └── typescript.md
├── backend/            # 后端笔记
│   ├── nodejs.md
│   └── python.md
├── algorithms/         # 算法笔记
│   └── sorting.md
├── assets/             # 图片资源
│   ├── vue3/
│   │   └── component.png
│   └── react/
│       └── hooks.png
├── drafts/             # 草稿（不同步）
└── README.md
```

---

## 🛡️ 安全最佳实践

### 1. 保护 Personal Access Token

**❌ 不要这样**：
```javascript
githubRepo: 'https://ghp_xxxxx@github.com/user/repo.git'  // Token 暴露
```

**✅ 推荐做法**：

使用环境变量：
```javascript
githubRepo: `https://${process.env.GITHUB_TOKEN}@github.com/user/repo.git`
```

```bash
# .env 文件
GITHUB_TOKEN=ghp_your_token_here
```

```javascript
// 读取 .env
import dotenv from 'dotenv'
dotenv.config()
```

### 2. 使用 SSH Key

SSH Key 更安全，推荐优先使用：

```javascript
githubRepo: 'git@github.com:username/notes.git'
```

### 3. .gitignore 配置

确保敏感文件不被提交：

```gitignore
# 环境变量
.env
.env.local

# 临时目录
.temp-notes/

# Token 配置
.github-credentials
```

---

## 🔍 故障排查

### Q1: 提示 "Permission denied (publickey)"

**原因**: SSH Key 未配置或未添加到 GitHub

**解决**:
```bash
# 1. 生成 SSH Key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加到 SSH Agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. 复制公钥并添加到 GitHub
cat ~/.ssh/id_ed25519.pub
```

### Q2: 提示 "Authentication failed"

**原因**: Personal Access Token 无效或权限不足

**解决**:
1. 重新生成 Token，确保选择 `repo` 权限
2. 检查 Token 是否过期
3. 确认 HTTPS 地址格式正确

### Q3: 克隆速度很慢

**原因**: 仓库历史记录太多

**解决**:
脚本已使用 `--depth 1` 浅克隆，只拉取最新版本，速度会快很多。

### Q4: 图片无法显示

**原因**: 图片路径不正确

**解决**:
1. 确保图片在笔记仓库的 `assets/` 目录
2. Markdown 中使用相对路径：`![](../assets/xxx.png)`
3. 脚本会自动转换为 `/assets/xxx.png`

### Q5: 私有仓库无法访问

**原因**: 没有配置访问权限

**解决**:
- SSH: 添加 SSH Key 到 GitHub
- HTTPS: 使用 Personal Access Token

---

## ⚙️ 高级配置

### 1. 使用配置文件

创建 `.github-sync.config.json`：

```json
{
  "githubRepo": "git@github.com:username/notes.git",
  "branch": "main",
  "syncFolders": ["frontend", "backend"],
  "copyAssets": true
}
```

修改脚本读取配置：

```javascript
// 读取外部配置
const externalConfig = JSON.parse(
  fs.readFileSync('.github-sync.config.json', 'utf-8')
)
const CONFIG = { ...defaultConfig, ...externalConfig }
```

### 2. 多仓库同步

同步多个笔记仓库：

```javascript
const REPOS = [
  {
    repo: 'git@github.com:user/frontend-notes.git',
    folders: ['vue', 'react'],
    category: '前端开发'
  },
  {
    repo: 'git@github.com:user/backend-notes.git',
    folders: ['nodejs', 'python'],
    category: '后端开发'
  }
]

REPOS.forEach(config => syncRepo(config))
```

### 3. 增量同步优化

只同步有变化的文件：

```javascript
// 获取文件修改时间
const lastSync = fs.readFileSync('.last-sync', 'utf-8')
const files = execSync(
  `git log --since="${lastSync}" --name-only --pretty=format: | sort -u`
).toString().split('\n')

// 只同步这些文件
files.forEach(file => syncFile(file))

// 记录本次同步时间
fs.writeFileSync('.last-sync', new Date().toISOString())
```

---

## 🤖 GitHub Actions 自动同步

在博客仓库创建 `.github/workflows/sync-articles.yml`：

```yaml
name: Sync Articles from Private Repo

on:
  schedule:
    # 每天早上 8 点自动同步
    - cron: '0 0 * * *'
  workflow_dispatch:  # 支持手动触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Blog Repo
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Sync Articles
        env:
          GITHUB_TOKEN: ${{ secrets.NOTES_REPO_TOKEN }}
        run: npm run sync:github
      
      - name: Commit Changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "自动同步文章 $(date)" || echo "No changes"
          git push
```

配置 Secrets：
1. 在笔记仓库生成 Personal Access Token
2. 在博客仓库 Settings > Secrets 添加 `NOTES_REPO_TOKEN`

---

## 📊 对比：本地 vs GitHub

| 特性 | 本地仓库 | GitHub 仓库 |
|------|----------|-------------|
| 同步速度 | ⚡ 很快 | 🐢 较慢（首次） |
| 版本控制 | ❌ | ✅ |
| 多设备同步 | ❌ | ✅ |
| 自动化部署 | ❌ | ✅ GitHub Actions |
| 配置复杂度 | 简单 | 需要配置权限 |

---

## 💡 最佳实践

1. **使用 SSH Key** - 比 Token 更安全方便
2. **保留临时目录** - `keepTempDir: true` 加速后续同步
3. **定期同步** - 设置定时任务或 GitHub Actions
4. **文章分类** - 在笔记仓库使用清晰的文件夹结构
5. **图片优化** - 发布前压缩图片
6. **备份笔记** - GitHub 私有仓库本身就是备份

---

## 🔗 相关资源

- [GitHub SSH 配置文档](https://docs.github.com/zh/authentication/connecting-to-github-with-ssh)
- [Personal Access Token 文档](https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git 浅克隆文档](https://git-scm.com/docs/git-clone#Documentation/git-clone.txt---depthltdepthgt)

---

## 🎉 开始使用

1. **配置仓库地址**
   ```bash
   # 编辑 sync-from-github.js
   githubRepo: 'git@github.com:你的用户名/笔记仓库.git'
   ```

2. **配置 SSH Key**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 添加公钥到 GitHub
   ```

3. **首次同步**
   ```bash
   npm run sync:github
   ```

4. **查看效果**
   ```bash
   npm run dev
   ```

**祝你写作愉快！** ✍️
