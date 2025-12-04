import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "我的技术博客",
  description: "记录技术成长与思考",
  lang: 'zh-CN',
  
  // 如果部署到 GitHub Pages，需要设置 base
  // 格式：'/仓库名/' （如果仓库名是 blog，则为 '/blog/'）
  // 如果是 username.github.io 则不需要设置
  base: '/blog/',
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/blog/': [
        {
          text: '最新文章',
          items: [
            { text: 'VitePress 博客搭建指南', link: '/blog/vitepress-guide' },
            { text: 'JavaScript 异步编程详解', link: '/blog/js-async' },
            { text: 'Vue 3 组合式 API 实践', link: '/blog/vue3-composition-api' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/blog' }
    ],

    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2025-present'
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '目录',
      level: [2, 3]
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },

  lastUpdated: true
})
