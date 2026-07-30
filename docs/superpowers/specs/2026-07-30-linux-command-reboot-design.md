# Linux Command 站点重生设计

**日期:** 2026-07-30  
**状态:** 已批准（架构 §1 + 用户确认「开始」）

## 目标

在可继续同步上游 `command/*.md` 的前提下，大胆重做本 fork 的体验、功能与工程栈，做成更现代、更快、更好用的 Linux 命令速查站。

## 约束

- **内容可同步**：`command/` 保持上游兼容的 Markdown 格式（首行命令名、`===`、一行简介、正文）。
- **表现层独立**：不沿用现有 EJS/Stylus 模板作为长期方案。
- **本地操作**：不擅自 `git commit` / `push` / merge；需提交时再请示。
- **包管理**：若引入 Python 工具用 uv；前端用 npm/pnpm（本项目以 Node 为主）。
- **不向后兼容旧模板栈**：旧 `template/`、旧 `scripts/build.mjs` 在迁移完成后可移除或归档，不做双轨回落。

## 架构

```
command/*.md                 # 上游可同步的内容源
        │
        ▼
Astro (Vite) 构建
  ├─ content collection / 自定义 loader 解析命令 MD
  ├─ 页面：首页、分类、字母表、搜索、命令详情
  ├─ 构建产物：静态 HTML + search-index.json
  └─ 客户端：搜索 / 命令面板 / 最近查看（轻量 islands）
        │
        ▼
dist/                        # 纯静态，可部署到 Pages / Vercel / Netlify / Docker
```

### 内容同步

- 保留 `command/` 目录结构与文件命名。
- 提供 `scripts/sync-upstream.mjs`：从上游拉取/合并 `command/`（及可选分类元数据），不覆盖本地站点代码。
- 分类数据迁到 `src/data/categories.ts`（可由上游 README 分类表维护，首次从现有 `scripts/categories.mjs` 迁移）。

### 路由（与现站大致兼容，便于外链）

| 路径 | 用途 |
|------|------|
| `/` | 首页：品牌 + 搜索 + 常用/最近 |
| `/c/:name` | 命令详情（输出 `c/<name>.html` 或等价） |
| `/list` | 高级搜索结果页 |
| `/hot` | 字母分组列表 |
| `/category` | 分类浏览 |

构建时尽量保持 `c/*.html` 路径，减少镜像站与书签失效。

## 视觉方向

主题名：**Terminal Paper**（终端纸感，浅色优先）

- **气质**：速查手册 × 终端，干净、利落，不要仪表盘感。
- **品牌**：首屏「Linux Command」为英雄级信号；搜索框是唯一主 CTA。
- **色彩**：浅色基底 `#F4F7F5`；墨色文字 `#14201A`；强调色终端绿 `#0F7A4A`；暗色模式为可选第二主题（`prefers-color-scheme` + 手动切换），不是默认唯一外观。
- **字体**：显示/命令用 `JetBrains Mono`；正文用 `IBM Plex Sans` + 中文回退 `Noto Sans SC`。
- **背景**：极淡网格 + 顶部柔和渐变（非纯色平铺）；禁止紫渐变、奶油衬线陶土风、报纸多栏风。
- **动效**：搜索聚焦、结果列表进入、返回顶部；尊重 `prefers-reduced-motion`。
- **组件**：默认无卡片；交互列表可用轻微分隔，不用大阴影卡片墙。

## 功能分期

### Phase 1 — 体验重生（本期核心）

1. Astro 项目脚手架与构建管线。
2. 解析全部 `command/*.md` → 详情页 + 索引。
3. 新首页、布局、暗色切换、移动端适配。
4. 基础搜索（客户端索引）与键盘：`/`、`Ctrl/Cmd+K`、方向键、Enter。
5. 命令页：面包屑、目录 TOC、相关命令、复制代码块。
6. 更新 README 说明本 fork 的构建与预览方式。

### Phase 2 — 查阅增强

1. Fuse.js 模糊搜索（名称优先、描述次之）。
2. 命令面板（全局 `Cmd+K`）：搜命令、跳转分类/字母。
3. 最近查看 + 本地收藏（localStorage）。
4. 分类页与字母表视觉统一。

### Phase 3 — 工程

1. `sync-upstream` 脚本与文档。
2. Docker / `vercel.json` / `netlify.toml` 对齐新 `dist`。
3. sitemap、基础 SEO meta、资源压缩。
4. 移除旧 `template/` 与旧 build（确认新站可用后）。

## 错误处理与边界

- 无效/空 MD：构建时跳过并打印警告，不中断全部构建（或可配置为 fail-fast；默认 warn）。
- 搜索无结果：明确空状态文案 + 示例关键词。
- localStorage 不可用：静默降级，不显示最近/收藏。

## 测试

- 本地 `astro build` 成功，抽样打开首页与 `ls`/`grep` 详情页。
- 搜索「ls」「查找文件」有合理结果。
- 窄屏（~375px）与桌面布局可读。
- 暗色切换不破坏对比度。

## 非目标（本期不做）

- Chrome 插件 / Dash / Alfred 等衍生客户端重做。
- 用户账号、服务端 API。
- 重写 600+ 篇命令文档正文。
- 与上游 UI 保持一致。
