# jiucaihua1's Blog

个人博客，基于 [Astro](https://astro.build/) + [AstroPaper](https://github.com/satnaing/astro-paper) 主题，通过 GitHub Actions 自动部署到 GitHub Pages。

**在线地址**：https://jiucaihua1.github.io/

## 写作

在 `src/content/posts/` 下新建 `.md` 文件，头部格式：

```markdown
---
author: jiucaihua1
pubDatetime: 2026-09-13T14:50:00+08:00
title: 文章标题
slug: my-post-slug
featured: false
draft: false
tags:
  - 标签
description: 一句话摘要。
---

正文……
```

push 到 `main` 分支后约 1 分钟自动上线。

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 本地预览 http://localhost:4321
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

## 目录说明

| 路径 | 作用 |
|---|---|
| `src/content/posts/` | 博客文章 |
| `src/content/pages/about.md` | 关于页 |
| `astro-paper.config.ts` | 站点信息 / 功能开关 / 社交链接 |
| `public/` | favicon 等静态资源 |
| `.github/workflows/deploy.yml` | 自动部署流水线 |
