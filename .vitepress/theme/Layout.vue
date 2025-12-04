<template>
  <Layout>
    <template #doc-after>
      <Comment v-if="showComment" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Comment from './components/Comment.vue'

const { Layout } = DefaultTheme
const route = useRoute()

// 在博客文章页面显示评论
const showComment = computed(() => {
  return route.path.startsWith('/blog/') && route.path !== '/blog/'
})
</script>
