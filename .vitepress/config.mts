import { defineConfig } from 'vitepress'
import { genFeed } from './genFeed'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "我的技术博客",
  description: "记录技术成长与思考，分享前端开发、架构设计与技术实践",
  lang: 'zh-CN',
  
  // 如果部署到 GitHub Pages，需要设置 base
  // 格式：'/仓库名/' （如果仓库名是 blog，则为 '/blog/'）
  // 如果是 username.github.io 则不需要设置
  base: '/blog/',
  
  // 忽略死链接检查（针对 localhost 等开发链接）
  ignoreDeadLinks: true,
  
  // SEO 优化：Head 配置
  head: [
    // Favicon
    ['link', { rel: 'icon', href: '/blog/favicon.ico' }],
    
    // SEO Meta
    ['meta', { name: 'keywords', content: '前端博客,技术博客,Vue,React,JavaScript,TypeScript,Web开发' }],
    ['meta', { name: 'author', content: 'lanj-star' }],
    
    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '我的技术博客' }],
    ['meta', { property: 'og:description', content: '记录技术成长与思考，分享前端开发经验' }],
    ['meta', { property: 'og:url', content: 'https://lanj-star.github.io/blog/' }],
    ['meta', { property: 'og:image', content: 'https://lanj-star.github.io/blog/og-image.jpg' }],
    
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: '我的技术博客' }],
    ['meta', { name: 'twitter:description', content: '记录技术成长与思考' }],
    ['meta', { name: 'twitter:image', content: 'https://lanj-star.github.io/blog/og-image.jpg' }],
    
    // 百度统计（可选）
    // ['script', {}, `
    //   var _hmt = _hmt || [];
    //   (function() {
    //     var hm = document.createElement("script");
    //     hm.src = "https://hm.baidu.com/hm.js?YOUR_ID";
    //     var s = document.getElementsByTagName("script")[0]; 
    //     s.parentNode.insertBefore(hm, s);
    //   })();
    // `],
    
    // Google Analytics（可选）
    // ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX' }],
    // ['script', {}, `
    //   window.dataLayer = window.dataLayer || [];
    //   function gtag(){dataLayer.push(arguments);}
    //   gtag('js', new Date());
    //   gtag('config', 'G-XXXXXXXXXX');
    // `],
  ],
  
  // SEO 优化：sitemap
  sitemap: {
    hostname: 'https://lanj-star.github.io/blog/'
  },
  
  // 构建结束后生成 RSS 订阅源
  buildEnd: genFeed,
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '基础', link: '/blog/fundamentals/' },
      { text: '语言', link: '/blog/languages/' },
      { text: '架构', link: '/blog/system-design/' },
      { text: '工程化', link: '/blog/engineering/' },
      { text: 'AI', link: '/blog/ai/' },
      {
        text: '更多',
        items: [
          { text: '学习资源', link: '/blog/resources/' },
          { text: '工作流', link: '/blog/workflows/' },
          { text: '关于', link: '/about' }
        ]
      }
    ],

    sidebar: {
      '/blog/fundamentals/': [
        {
          text: '计算机基础',
          items: [
            { text: '算法与数据结构', link: '/blog/fundamentals/algorithms/' },
            { text: '计算机网络', link: '/blog/fundamentals/network/' },
            { text: '数据库理论', link: '/blog/fundamentals/database/' }
          ]
        }
      ],
      '/blog/languages/': [
        {
          text: 'JavaScript / TypeScript',
          items: [
            { text: 'JavaScript 异步编程详解', link: '/blog/languages/js-ts/js-async' },
            { text: 'Vue 3 组合式 API 实践', link: '/blog/languages/js-ts/vue3-composition-api' }
          ]
        },
        {
          text: 'Golang',
          items: []
        },
        {
          text: 'Rust',
          items: []
        }
      ],
      '/blog/system-design/': [
        {
          text: '系统设计',
          items: [
            { text: '设计模式', link: '/blog/system-design/patterns/' },
            { text: '分布式系统', link: '/blog/system-design/distributed/' }
          ]
        }
      ],
      '/blog/engineering/': [
        {
          text: '开发工具',
          items: [
            { text: 'VitePress 博客搭建指南', link: '/blog/engineering/tools/vitepress-guide' }
          ]
        },
        {
          text: 'DevOps',
          items: []
        }
      ],
      '/blog/ai/': [
        {
          text: 'AI 工程',
          items: [
            { text: 'AI 应用工程师学习路径', link: '/blog/ai/2026-02-04-ai应用工程师学习路径' },
            { text: 'LLM 应用开发', link: '/blog/ai/llm/' }
          ]
        }
      ],
      '/blog/resources/': [
        {
          text: '学习资源',
          items: [
            { text: '读书笔记', link: '/blog/resources/books/' }
          ]
        }
      ],
      '/blog/workflows/': [
        {
          text: '工作流',
          items: [
            { text: '生产力工具', link: '/blog/workflows/productivity/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lanj-star/blog' }
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
