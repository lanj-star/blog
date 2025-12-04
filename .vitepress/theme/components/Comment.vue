<template>
  <div class="comment-container">
    <div class="comment-header">
      <h3>💬 评论交流</h3>
      <p class="comment-tip">欢迎留言交流，分享你的想法 👇</p>
    </div>
    <div ref="commentRef" class="giscus-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const commentRef = ref<HTMLElement>()

// Giscus 配置
const GISCUS_CONFIG = {
  repo: 'lanj-star/blog',  // 你的 GitHub 仓库
  repoId: 'R_kgDOQisXEQ',  // 需要在 giscus.app 获取
  category: 'General',
  categoryId: 'DIC_kwDOQisXEc4CzZ6W',  // 需要在 giscus.app 获取
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  theme: 'preferred_color_scheme',
  lang: 'zh-CN',
  loading: 'lazy'
}

const loadGiscus = () => {
  if (!commentRef.value) return

  // 清空现有评论
  commentRef.value.innerHTML = ''

  // 创建 Giscus 脚本
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', GISCUS_CONFIG.repo)
  script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId)
  script.setAttribute('data-category', GISCUS_CONFIG.category)
  script.setAttribute('data-category-id', GISCUS_CONFIG.categoryId)
  script.setAttribute('data-mapping', GISCUS_CONFIG.mapping)
  script.setAttribute('data-strict', GISCUS_CONFIG.strict)
  script.setAttribute('data-reactions-enabled', GISCUS_CONFIG.reactionsEnabled)
  script.setAttribute('data-emit-metadata', GISCUS_CONFIG.emitMetadata)
  script.setAttribute('data-input-position', GISCUS_CONFIG.inputPosition)
  script.setAttribute('data-theme', GISCUS_CONFIG.theme)
  script.setAttribute('data-lang', GISCUS_CONFIG.lang)
  script.setAttribute('data-loading', GISCUS_CONFIG.loading)
  script.crossOrigin = 'anonymous'
  script.async = true

  commentRef.value.appendChild(script)
}

onMounted(() => {
  loadGiscus()
})

// 路由变化时重新加载评论
watch(() => route.path, () => {
  loadGiscus()
})
</script>

<style scoped>
.comment-container {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--vp-c-divider);
}

.comment-header {
  margin-bottom: 24px;
}

.comment-header h3 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.comment-tip {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.giscus-wrapper {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .comment-container {
    margin-top: 32px;
    padding-top: 24px;
  }
  
  .comment-header h3 {
    font-size: 20px;
  }
}
</style>
