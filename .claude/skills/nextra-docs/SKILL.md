---
name: nextra-docs
description: >-
  Nextra 文档站框架的权威参考资料。

  本地存储了 Nextra 4 的完整官方文档 (https://github.com/shuding/nextra)

  当用户询问 Nextra 相关问题时使用此 skill：
  - Nextra 的安装和配置
  - 内容目录结构 (content directory)
  - 主题配置 (docs theme / blog theme)
  - 内置组件 (Callout, Tabs, Steps, Cards, FileTree 等)
  - 搜索配置 (Pagefind)
  - 自定义主题开发
  - MDX 组件定制
  - 高级功能 (LaTeX、Mermaid、Tailwind CSS 等)
---

# Nextra Documentation Skill

## 本地文档

Nextra 官方文档已完整克隆到 `./docs/` 目录。

## 文档结构

```
.skills/nextra-docs/
├── docs/                    # 官方文档 (来自 GitHub)
│   ├── guide/              # 指南 (CSS, i18n, 图片, 搜索等)
│   ├── built-ins/          # 内置组件
│   ├── file-conventions/   # 文件约定
│   ├── advanced/           # 高级功能 (LaTeX, Mermaid, Tailwind 等)
│   ├── docs-theme/         # 文档主题配置
│   ├── blog-theme/         # 博客主题
│   └── custom-theme/       # 自定义主题
├── app/                    # 示例应用结构
├── components/             # 组件源码
├── public/                 # 静态资源
├── mdx-components.tsx       # MDX 组件配置
├── next.config.ts          # Next.js 配置
├── package.json
└── SKILL.md               # 本文件
```

## 使用方法

### 搜索特定主题

```bash
# 搜索文档
grep -r "search" docs/guide/ --include="*.mdx" -l

# 搜索 Pagefind
grep -r "pagefind\|Pagefind" docs/ --include="*.mdx" -l

# 搜索 Head 组件
grep -r "Head\|color.*hue" docs/ --include="*.mdx" -l
```

### 常用文档路径

| 主题 | 路径 |
|------|------|
| 快速开始 | `docs/guide/page.mdx` |
| 搜索配置 | `docs/guide/search/page.mdx` |
| 内置组件 | `docs/built-ins/page.mdx` |
| Content Directory | `docs/file-conventions/content-directory/page.mdx` |
| MDX Components | `docs/file-conventions/mdx-components/page.mdx` |
| Head 组件 | `docs/built-ins/[name]/page.tsx` |
| LaTeX | `docs/advanced/latex/page.mdx` |
| Mermaid | `docs/advanced/mermaid/page.mdx` |
| 主题配置 | `docs/docs-theme/` |
| 博客主题 | `docs/blog-theme/` |
| 自定义主题 | `docs/custom-theme/page.mdx` |

## 相关资源

- [GitHub 仓库](https://github.com/shuding/nextra)
- [在线文档](https://nextra.site)
