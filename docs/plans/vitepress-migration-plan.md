# VitePress 迁移到 Nextra 计划

## 一、项目概述

### 源项目
- **路径**: `D:\code\docFront`
- **框架**: VitePress
- **内容**: 前端技术文档、笔记、练习题

### 目标项目
- **路径**: `d:\code-gh\my-docs-website`
- **框架**: Next.js + Nextra (基于 MDX)
- **特点**: 支持 React 组件、交互式文档

---

## 二、待迁移文件清单

### 2.1 文档文件 (共30篇)

| 序号 | 源路径 | 目标路径 | 备注 |
|------|--------|----------|------|
| 1 | `doc/frontDoc/JavaScript.md` | `app/frontDoc/JavaScript.mdx` | JS 深入学习笔记 |
| 2 | `doc/frontDoc/promise.md` | `app/frontDoc/promise.mdx` | Promise 详解 |
| 3 | `doc/frontDoc/Promise-base.md` | `app/frontDoc/Promise-base.mdx` | Promise 基础 |
| 4 | `doc/frontDoc/Ts.md` | `app/frontDoc/Ts.mdx` | TypeScript 笔记 |
| 5 | `doc/frontDoc/brower.md` | `app/frontDoc/brower.mdx` | 浏览器相关 |
| 6 | `doc/frontDoc/raf.md` | `app/frontDoc/raf.mdx` | requestAnimationFrame |
| 7 | `doc/frontDoc/大屏适配方案.md` | `app/frontDoc/大屏适配方案.mdx` | 大屏适配 |
| 8 | `doc/frontDoc/HLS.md` | `app/frontDoc/HLS.mdx` | HLS 学习进度 |
| 9 | `doc/frontDoc/凌虚记录.md` | `app/frontDoc/凌虚记录.mdx` | WebSocket 封装 |
| 10 | `doc/frontDoc/reload.md` | `app/frontDoc/reload.mdx` | LiveServer 热重载 |
| 11 | `doc/frontDoc/webpack优化.md` | `app/frontDoc/webpack优化.mdx` | Webpack 配置 |
| 12 | `doc/frontDoc/大文件切片上传实现详解.md` | `app/frontDoc/大文件切片上传实现详解.mdx` | 大文件上传 |
| 13 | `doc/frontDoc/Web Worker 使用教程.md` | `app/frontDoc/Web Worker 使用教程.mdx` | Web Worker |
| 14 | `doc/frontDoc/electron.md` | `app/frontDoc/electron.mdx` | Electron 跨端框架 |
| 15 | `doc/jsDoc/前端文件下载n种方法.md` | `app/jsDoc/前端文件下载n种方法.mdx` | 文件下载 |
| 16 | `doc/jsDoc/双Token鉴权实现无感刷新.md` | `app/jsDoc/双Token鉴权实现无感刷新.mdx` | 双 Token |
| 17 | `doc/jsDoc/Post为什么会发送两次请求.md` | `app/jsDoc/Post为什么会发送两次请求.mdx` | POST 预检请求 |
| 18 | `doc/jsDoc/为什么不推荐foreach.md` | `app/jsDoc/为什么不推荐foreach.mdx` | forEach 讨论 |
| 19 | `doc/jsDoc/拖拽裁切问题解决.md` | `app/jsDoc/拖拽裁切问题解决.mdx` | dndkit |
| 20 | `doc/jsDoc/Zod-类型与校验的统一之md.md` | `app/jsDoc/Zod-类型与校验的统一之md.mdx` | Zod 类型校验 |
| 21 | `doc/jsDoc/shadcn表格封装.md` | `app/jsDoc/shadcn表格封装.mdx` | shadcn table |
| 22 | `doc/jsDoc/性能优化常见方向.md` | `app/jsDoc/性能优化常见方向.mdx` | 性能优化 |
| 23 | `doc/react/react-文档.md` | `app/react/react-文档.mdx` | React 文档 |
| 24 | `doc/react/tanstack query.md` | `app/react/tanstack query.mdx` | TanStack Query |
| 25 | `doc/nextDoc/数据获取方式.md` | `app/nextDoc/数据获取方式.mdx` | Next 数据获取 |
| 26 | `doc/nextDoc/next开发注意事项.md` | `app/nextDoc/next开发注意事项.mdx` | Next 注意事项 |
| 27 | `doc/nextDoc/next主题切换原理.md` | `app/nextDoc/next主题切换原理.mdx` | Next 主题 |
| 28 | `doc/nextDoc/性能优化常见方向.md` | `app/nextDoc/性能优化常见方向.mdx` | Next 性能优化 |
| 29 | `doc/testDoc/jsTest.md` | `app/testDoc/jsTest.mdx` | JS 练习题 |
| 30 | `doc/testDoc/promiseTest.md` | `app/testDoc/promiseTest.mdx` | Promise 练习题 |
| 31 | `doc/testDoc/this指向问题.md` | `app/testDoc/this指向问题.mdx` | this 指向练习 |

### 2.2 首页文件

| 源文件 | 目标文件 | 处理方式 |
|--------|----------|----------|
| `doc/index.md` (VitePress home layout) | `app/page.mdx` | 保留现有鸭喆3D模型 |

### 2.3 图片资源

| 序号 | 源路径 |
|------|--------|
| 1 | `doc/assets/closure1.png` |
| 2 | `doc/assets/closure2.png` |
| 3 | `doc/assets/渲染流水线.png` |
| 4 | `doc/assets/1.png` ~ `17.png` |
| 5 | `doc/assets/bg.JPEG` |
| 6 | `doc/assets/header1.png` |
| 7 | `doc/assets/header2.JPEG` / `.png` |
| 8 | `doc/assets/header3.JPEG` / `.png` |

**图片迁移方案**:
- 复制到 `app/assets/` 目录
- 使用 Next.js `Image` 组件优化加载
- 配置文件: `next.config.mjs` 添加图片域名配置（如需要）

---

## 三、迁移步骤

### Step 1: 创建目录结构

```bash
mkdir -p app/frontDoc
mkdir -p app/jsDoc
mkdir -p app/react
mkdir -p app/nextDoc
mkdir -p app/testDoc
mkdir -p public/assets
```

### Step 2: 复制并转换 MD 文件

**文件扩展名处理**:
- `.md` → `.mdx`

**路径适配**:
```markdown
# VitePress 语法
![](../assets/image.png)

# Nextra 语法
![](/assets/image.png)
# 或使用 Next/Image
import Image from 'next/image'
<Image src="/assets/image.png" alt="..." width={500} height={300} />
```

### Step 3: 复制图片资源

```bash
cp -r "D:/code/docFront/doc/assets/" "d:/code-gh/my-docs-website/public/assets/"
```

### Step 4: 配置导航 (_meta.tsx)

参考 `app/js/_meta.tsx` 格式:

```typescript
export default {
  frontDoc: {
    title: '前端合集',
    items: [
      'JavaScript',
      'Ts',
      'promise',
      // ...
    ],
  },
  jsDoc: {
    title: '文章合集',
    items: [
      '前端文件下载n种方法',
      '双Token鉴权实现无感刷新',
      // ...
    ],
  },
  // ...
}
```

### Step 5: 首页重写

原 VitePress 首页 (`doc/index.md`) 使用了 `layout: home`，包含 hero 和 features 配置。

Nextra 首页需要在 `app/page.mdx` 中手动实现类似效果。

---

## 四、语法差异对照

### 4.1 图片

```md
# VitePress
![alt](./assets/image.png)

# Nextra
![alt](/assets/image.png)
# 或
import Image from 'next/image'
<Image src="/assets/image.png" width={500} height={300} alt="alt" />
```

### 4.2 代码块

两者均支持 Shiki 语法高亮，无需修改。

### 4.3 VitePress 特有功能

| 功能 | VitePress | Nextra | 处理方式 |
|------|-----------|--------|----------|
| `layout: home` | 首页模板 | 不支持 | 手动实现 |
| VitePress 组件 | `.vue` 组件 | `.tsx` 组件 | 重写 |
| `---` YAML frontmatter | 支持 | 支持 | 保留 |
| `[[toc]]` | 目录 | 不支持 | 删除 |

---

## 五、执行清单

- [ ] Step 1: 创建目录结构
- [ ] Step 2: 复制所有 MD 文件并改名为 .mdx
- [ ] Step 3: 修复图片路径
- [ ] Step 4: 复制图片到 public/assets
- [ ] Step 5: 配置 _meta.tsx 侧边栏
- [ ] Step 6: 处理 VitePress 特有语法
- [ ] Step 7: 本地测试验证
- [ ] Step 9: 提交 Git 并推送
- [ ] Step 10: Vercel 部署验证

---

## 六、注意事项

1. **YAML frontmatter**: Nextra 支持，但部分 VitePress 特有字段需移除
2. **Vue 组件**: VitePress 支持 .vue，Nextra 只支持 .tsx/.jsx，需重写
3. **相对路径**: MDX 中图片路径需改为 `/assets/...` 绝对路径
4. **首页配置**: VitePress 的 `layout: home` 需在 MDX 中手动实现

---

## 七、预计工作量

- 文件复制/重命名: 30+ 文件
- 图片迁移: ~20 张
- 路径修复: ~50 处
- 导航配置: 1 个 _meta.tsx
- 首页重写: 1 个 page.mdx
