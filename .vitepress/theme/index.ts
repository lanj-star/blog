import DefaultTheme from 'vitepress/theme'
import Comment from './components/Comment.vue'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Comment', Comment)
  }
}
