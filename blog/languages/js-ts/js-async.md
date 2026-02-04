# JavaScript 异步编程详解

## 什么是异步编程？

JavaScript 是单线程语言，异步编程允许代码在等待某些操作（如网络请求、文件读取）完成时继续执行其他任务。

## 异步编程的演进

### 1. 回调函数（Callback）

最早期的异步解决方案：

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback('数据加载完成')
  }, 1000)
}

fetchData((data) => {
  console.log(data)
})
```

**问题**: 回调地狱（Callback Hell）

```javascript
getData((a) => {
  getMoreData(a, (b) => {
    getEvenMoreData(b, (c) => {
      // 嵌套太深，难以维护
    })
  })
})
```

### 2. Promise

ES6 引入的 Promise 解决了回调地狱：

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('数据加载完成')
    }, 1000)
  })
}

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error))
```

**链式调用**：

```javascript
getData()
  .then(a => getMoreData(a))
  .then(b => getEvenMoreData(b))
  .then(c => console.log(c))
  .catch(error => console.error(error))
```

### 3. Async/Await

ES2017 引入，让异步代码看起来像同步代码：

```javascript
async function loadData() {
  try {
    const data = await fetchData()
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}

loadData()
```

## 实际应用场景

### 并行请求

```javascript
async function fetchMultiple() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ])
  
  return { users, posts, comments }
}
```

### 错误处理

```javascript
async function robustFetch() {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error('请求失败')
    }
    return await response.json()
  } catch (error) {
    console.error('发生错误:', error)
    return null
  }
}
```

## 最佳实践

1. **优先使用 async/await** - 代码更清晰易读
2. **合理使用 Promise.all** - 并行执行提升性能
3. **始终处理错误** - 避免未捕获的异常
4. **避免阻塞** - 长时间运行的任务考虑 Web Workers

## 总结

异步编程是 JavaScript 的核心特性，从回调到 Promise 再到 async/await，语法越来越优雅。掌握异步编程对于现代 Web 开发至关重要。

## 扩展阅读

- [MDN - 异步 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous)
- [JavaScript.info - Promises](https://zh.javascript.info/promise-basics)
