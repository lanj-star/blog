import path from 'path'
import { writeFileSync } from 'fs'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'

const hostname = 'https://lanj-star.github.io/blog'

export async function genFeed(config: SiteConfig) {
  const feed = new Feed({
    title: '我的技术博客',
    description: '记录技术成长与思考，分享前端开发经验',
    id: hostname,
    link: hostname,
    language: 'zh-CN',
    image: `${hostname}/logo.png`,
    favicon: `${hostname}/favicon.ico`,
    copyright: 'Copyright © 2025-present lanj-star'
  })

  const posts = await createContentLoader('blog/*.md', {
    excerpt: true,
    render: true
  }).load()

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.date as string) -
      +new Date(a.frontmatter.date as string)
  )

  for (const { url, excerpt, frontmatter, html } of posts) {
    feed.addItem({
      title: frontmatter.title,
      id: `${hostname}${url}`,
      link: `${hostname}${url}`,
      description: excerpt,
      content: html,
      author: [
        {
          name: frontmatter.author || 'lanj-star',
          link: frontmatter.twitter
            ? `https://twitter.com/${frontmatter.twitter}`
            : undefined
        }
      ],
      date: frontmatter.date
    })
  }

  writeFileSync(path.join(config.outDir, 'feed.rss'), feed.rss2())
}
