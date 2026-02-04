# Vue 3 组合式 API 实践

## 什么是组合式 API？

组合式 API（Composition API）是 Vue 3 引入的新特性，提供了一种更灵活的方式来组织组件逻辑。

## 为什么需要组合式 API？

### Options API 的局限

在 Vue 2 中，我们使用 Options API：

```javascript
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('组件挂载')
  }
}
```

**问题**: 相关逻辑分散在不同选项中，大型组件难以维护。

### Composition API 的优势

```javascript
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    function increment() {
      count.value++
    }
    
    onMounted(() => {
      console.log('组件挂载')
    })
    
    return { count, increment }
  }
}
```

**优势**:
- 逻辑组织更清晰
- 代码复用更容易
- TypeScript 支持更好

## 核心概念

### 1. 响应式基础

#### ref

用于基本类型：

```javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0
count.value++ // 修改值
```

#### reactive

用于对象：

```javascript
import { reactive } from 'vue'

const state = reactive({
  name: '张三',
  age: 25
})

state.age++ // 直接修改
```

### 2. 计算属性

```javascript
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
```

### 3. 侦听器

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newValue, oldValue) => {
  console.log(`从 ${oldValue} 变为 ${newValue}`)
})
```

## 组合函数（Composables）

将可复用逻辑提取到独立函数：

```javascript
// useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return { count, increment, decrement }
}
```

使用：

```javascript
import { useCounter } from './useCounter'

export default {
  setup() {
    const { count, increment } = useCounter(10)
    return { count, increment }
  }
}
```

## 实战示例

### 用户列表组件

```vue
<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)

async function fetchUsers() {
  loading.value = true
  try {
    const response = await fetch('/api/users')
    users.value = await response.json()
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>
```

## 最佳实践

1. **使用 `<script setup>`** - 更简洁的语法
2. **合理拆分组合函数** - 提高代码复用性
3. **避免过度响应式** - 不需要响应的数据用普通变量
4. **善用 TypeScript** - 充分利用类型推导

## 总结

组合式 API 是 Vue 3 的核心特性，它让代码更灵活、更易维护。通过组合函数，我们可以轻松实现逻辑复用，构建更强大的应用。

## 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue Composition API RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)
