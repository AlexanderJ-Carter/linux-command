> **Fork 自** [**jaywcjlove/linux-command**](https://github.com/jaywcjlove/linux-command)，感谢 [@jaywcjlove](https://github.com/jaywcjlove)。原仓库为 Linux 命令大全，采用 MIT 协议。本 fork 在保留 `command/*.md` 可同步的前提下，用 Astro 重做了站点体验。

<hr>

<p align="center">
  <h1>Linux Command</h1>
  <p>终端纸感速查手册 · 收录 600+ Linux 命令</p>
</p>

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
npm run preview  # 预览构建产物
```

同步上游命令文档（只更新 `command/`，不动站点代码）：

```bash
npm run sync:upstream
# 可选: UPSTREAM_REF=master npm run sync:upstream
```

## 功能速览

- **模糊搜索**：名称优先 + Fuse.js 描述模糊匹配
- **命令面板**：`Ctrl/Cmd+K`（也可点导航「面板」）
- **收藏 / 最近查看**：本地存储，详情页可收藏
- **主题**：浅色优先，可手动切换暗色
- **SEO**：自动 sitemap + robots.txt

子路径部署时设置：

```bash
BASE_PATH=/linux-command SITE_URL=https://example.com npm run build
```

## 部署

- **产物目录**：`dist/`
- **线上地址**：https://linux-command.alexander.xin/
- **Vercel / Netlify**：已指向 `dist`
- **GitHub Pages**：CI 在 `master`/`main` 推送时构建并部署（自定义域名，`BASE_PATH=/`）
- **Docker**：多阶段构建，镜像内含静态站点

```bash
docker build -t linux-command .
docker run --rm -p 9665:3000 linux-command
```

## 站点结构

| 路径 | 说明 |
|------|------|
| `/` | 首页搜索 |
| `/c/<name>.html` | 命令详情 |
| `/hot.html` | 字母列表 |
| `/category.html` | 分类浏览 |
| `/list.html` | 高级搜索 |
| `/search-index.json` | 客户端搜索索引 |
| `/sitemap-index.xml` | Sitemap |
| `/robots.txt` | 爬虫规则 |

内容源仍为根目录 `command/*.md`（与上游格式兼容）。

## 设计说明

见 `docs/superpowers/specs/2026-07-30-linux-command-reboot-design.md`。

## 许可证

MIT · 命令文档版权归原作者与贡献者。
