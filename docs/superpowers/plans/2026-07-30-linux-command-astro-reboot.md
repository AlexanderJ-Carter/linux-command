# Linux Command Astro 重生 Implementation Plan

> **For agentic workers:** 按任务顺序实现。用户要求未经允许不 commit / push。

**Goal:** 用 Astro 重做静态 Linux 命令速查站，保留 `command/*.md` 可同步上游。

**Architecture:** 自定义 loader 解析无 frontmatter 的命令 MD；Astro 输出纯静态；客户端轻量 JS 做搜索与最近查看。

**Tech Stack:** Astro 5、Vite、TypeScript、原生 CSS、Fuse.js（Phase 2；Phase 1 可用简单 indexOf）

## Global Constraints

- 不擅自 git commit / push
- 不破坏 `command/*.md` 上游格式
- 浅色优先 Terminal Paper 视觉；无紫渐变 / 奶油衬线陶土 / 报纸风
- 旧 template 构建在新站可用后再删
- 中文 UI 文案

---

### Task 1: Astro 脚手架与命令加载器

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/lib/commands.ts`
- Create: `src/lib/categories.ts`（从 `scripts/categories.mjs` 迁移 CATEGORIES）
- Create: `src/styles/tokens.css`
- Modify: `package.json`（Astro 脚本与依赖）
- Create: `public/favicon.svg`（可用现有 logo 简化）

**Interfaces:**
- Produces: `loadCommands(): CommandInfo[]`，`CommandInfo = { n: string; p: string; d: string; body: string; file: string }`
- Produces: `parseCommandMarkdown(raw: string, filePath: string): CommandInfo`
- Produces: `getPopularCommands(commands: CommandInfo[]): CommandInfo[]`
- Produces: `CATEGORIES` 与 `buildRelatedMap(commands)`

- [ ] **Step 1:** 重写 `package.json` scripts 为 `dev`/`build`/`preview`，加入 `astro` 依赖
- [ ] **Step 2:** 实现 `parseCommandMarkdown`：首段标题、`===`、简介到下一 `##`、其余为 body
- [ ] **Step 3:** 实现 `loadCommands` 读取仓库根 `command/*.md`
- [ ] **Step 4:** `astro.config.mjs`：`build.format = 'file'`，`outDir = 'dist'`
- [ ] **Step 5:** 跑 `npm install && npx astro sync`（或等价）确认工程可启动

**Verify:** `node -e` 或临时脚本能解析出 `ls` 的 n/d；`npm run build` 在有最小页面后通过。

---

### Task 2: 布局、首页与全局样式

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/SearchBox.astro`
- Create: `src/components/CommandChips.astro`
- Create: `src/components/SiteFooter.astro`
- Create: `src/pages/index.astro`
- Create: `src/styles/global.css`

**Verify:** `npm run dev` 首页显示品牌、搜索框、常用命令 chips、链接到分类/字母表。

---

### Task 3: 命令详情页 + Markdown 渲染

**Files:**
- Create: `src/pages/c/[name].astro`
- Create: `src/components/CommandToc.astro`（或客户端生成）
- Create: `src/components/CodeCopy.astro` / `src/scripts/copy-code.ts`
- Create: `src/styles/markdown.css`

**Verify:** `/c/ls` 渲染标题、简介、正文、相关命令；代码块可复制。

---

### Task 4: 列表页（hot / category / list）与搜索索引

**Files:**
- Create: `src/pages/hot.astro`
- Create: `src/pages/category.astro`
- Create: `src/pages/list.astro`
- Create: `src/pages/search-index.json.ts`（或 build 写入 `public`/`dist`）
- Create: `src/scripts/search.ts`

**Verify:** 字母表与分类有数据；搜索「ls」命中；`/` 与 `Ctrl+K` 聚焦。

---

### Task 5: 部署配置与 README；归档旧构建入口

**Files:**
- Modify: `Dockerfile`、`vercel.json`、`netlify.toml`
- Modify: `README.md`
- Modify: `package.json`（可保留 `build:legacy` 指向旧脚本直至确认删除）
- Create: `scripts/sync-upstream.mjs`（Phase 3 最小可用版可顺手加）

**Verify:** `npm run build` 产出可预览静态站；README 说明预览命令。

---

## 执行说明

用户已说「开始吧」：按 Task 1→5 在本会话内联执行，不自动 commit。
