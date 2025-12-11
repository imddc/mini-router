mini-router-vue: Vue 3 轻量级路由核心（标准MD版）

# mini-router-vue: Vue 3 轻量级路由核心

## 🚀 项目简介

mini-router-vue 是一个旨在学习和实践 Vue 3 核心路由机制的轻量级库。

它完全基于 TypeScript 构建，以最小化的代码量实现了现代前端路由器的关键特性，包括：响应式状态管理、动态路径匹配、以及可中断的导航守卫链。本项目采用 Monorepo 结构，方便库的开发和示例应用的验证。

## ✨ 核心特性一览

| 特性分类 | 实现细节 |

|----------|----------|

| 路由核心 | createRouter 和 createWebHistory，提供编程式 push 和 replace API。 |

| 动态匹配 | 基于 path-to-regexp 逻辑，精确解析动态路由参数 (params)、查询参数 (query) 和锚点 (hash)。 |

| 导航守卫 | 实现了强大的全局 beforeEach 守卫，支持 async/await、return value (重定向或中断) 以及 next() 函数调用。 |

| Vue 集成 | 提供了完整的 RouterView、RouterLink 组件 和 useRouter、useRoute 组合式 API。 |

| 工程化 | 采用 pnpm Monorepo，使用 Biome 进行代码质量管理。 |

## 📦 Monorepo 结构

我们采用 pnpm Workspace 来管理库代码与示例应用，确保开发环境一致性。

```text

impl-mini-router

├─ apps/

│  ├─ playground/        # 使用 mini-router-vue 的示例应用（开发时启动）

│  └─ official-router/   # 使用官方 vue-router 的对照项目

├─ packages/

│  ├─ mini-router-vue/   # 核心路由库源码

│  └─ prepare/           # 纯 JS 实验包

└─ pnpm-workspace.yaml

```

## 🛠️ 快速上手

### 1. 环境准备

确保您的环境满足以下要求：

- Node.js: ≥ 20

- 包管理器: pnpm

```bash

# 克隆仓库

git clone <repository-url>

cd impl-mini-router

# 安装依赖

pnpm install

```

### 2. 启动示例应用 (Playground)

Playground 是使用 mini-router-vue 的核心示例。

```bash

# 启动开发服务器

pnpm -C apps/playground dev

```

### 3. 构建核心库

如果需要测试构建后的产物，可以手动执行构建：

```bash

# 构建 mini-router-vue 库

pnpm -C packages/mini-router-vue build

```

## 📚 核心 API 示例

### 1. 路由配置与安装

在 main.ts 中创建并安装路由器实例。

```typescript

// src/lib/router.ts

import { createRouter, createWebHistory } from 'mini-router-vue'

import IndexPage from '@/pages/IndexPage.vue'

import UserProfile from '@/pages/UserProfile.vue'

import type { App } from 'vue'

const router = createRouter({

  history: createWebHistory(),

  routes: [

    { path: '/', name: 'Home', component: IndexPage },

    { path: '/user/:id', name: 'User', component: UserProfile }, // 动态路由

  ],

})

export function setupRouter(app: App) {

  app.use(router)

}

```

### 2. 导航守卫 (beforeEach)

支持基于 Promise、返回值或 next() 的异步导航控制。

```typescript

router.beforeEach(async (to, from, next) => {

    // 异步校验

    const isAuthenticated = await checkUserSession(); 

    if (!isAuthenticated && to.name !== 'Login') {

        // 方式一：使用返回值重定向

        return '/login'; 

    }

    // 方式二：使用 next() 通过

    // next();

});

```

### 3. 组合式 API

在任何组件中使用 Hooks 来访问路由器实例或当前路由状态。

```vue

import { useRouter, useRoute } from 'mini-router-vue';

import { watch } from 'vue';

// 在const router = useRouter();

const route = useRoute();

watch(() => route.params.id, (newId) => {

  console.log(`User ID changed to: ${newId}`);

});

function goToHome() {

  // 编程式导航

  router.push('/');

}



```

## 📋 待办事项 (Roadmap)

我们正在积极完善以下功能，以实现完整的 Vue Router 功能集：

- 嵌套路由：支持路由嵌套和多级 matched 记录。

- 导航模式：新增 createWebHashHistory 和 createMemoryHistory。

- 路由 API：支持 addRoute / removeRoute 动态路由管理。

- 异步组件：支持组件懒加载。

- 错误处理：完善 404 Not Found 和重定向逻辑。
