#!/usr/bin/env node
/**
 * 生成社交分享卡片图 public/og.png（1200×630）。
 *
 * sharp 的预编译 libvips 不含文本渲染（实测 <text> 留空），
 * 故用 @resvg/resvg-js：Rust SVG 渲染器，自带系统字体加载，文字渲染可靠。
 *
 * 用法: node scripts/gen-og-image.mjs
 * 产物提交进仓库；CI 不重新生成，避免字体依赖。
 */
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'public', 'og.png');

// 配色取自 src/styles/tokens.css（浅色主题）
const C = {
    bg: '#f4f7f5',
    bgCard: '#ffffff',
    ink: '#14201a',
    inkMuted: '#5a6b62',
    accent: '#0f7a4a',
    accentStrong: '#0a5c38',
    accentSoft: 'rgba(15, 122, 74, 0.12)',
    line: 'rgba(20, 32, 26, 0.10)',
    red: '#e0533a',
    yellow: '#d9a441',
    bar: '#0f1612',
};

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg}"/>
      <stop offset="1" stop-color="#e9efe9"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${C.line}" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#paper)"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.5"/>

  <!-- 左侧终端窗口 -->
  <g transform="translate(96, 150)">
    <rect width="430" height="330" rx="16" fill="${C.bgCard}" stroke="${C.line}" stroke-width="1.5"/>
    <rect width="430" height="46" rx="16" fill="${C.bar}"/>
    <rect y="30" width="430" height="16" fill="${C.bar}"/>
    <circle cx="28" cy="23" r="7" fill="${C.red}"/>
    <circle cx="52" cy="23" r="7" fill="${C.yellow}"/>
    <circle cx="76" cy="23" r="7" fill="${C.accent}"/>
    <text x="108" y="29" font-family="Menlo, JetBrains Mono, monospace" font-size="15" fill="#9bb0a4">bash — 92×24</text>

    <text x="32" y="100" font-family="Menlo, JetBrains Mono, monospace" font-size="26" fill="${C.accent}">➜</text>
    <text x="68" y="100" font-family="Menlo, JetBrains Mono, monospace" font-size="26" fill="${C.ink}">~</text>
    <text x="108" y="100" font-family="Menlo, JetBrains Mono, monospace" font-size="26" fill="${C.accentStrong}">ls</text>
    <text x="160" y="100" font-family="Menlo, JetBrains Mono, monospace" font-size="26" fill="${C.accent}">-lah</text>

    <text x="68" y="142" font-family="Menlo, JetBrains Mono, monospace" font-size="22" fill="${C.inkMuted}">drwxr-xr-x  user</text>
    <text x="68" y="176" font-family="Menlo, JetBrains Mono, monospace" font-size="22" fill="${C.inkMuted}">.config   .ssh</text>
    <text x="68" y="210" font-family="Menlo, JetBrains Mono, monospace" font-size="22" fill="${C.inkMuted}">README.md  dist/</text>
    <text x="68" y="244" font-family="Menlo, JetBrains Mono, monospace" font-size="22" fill="${C.accent}">command/</text>
    <text x="68" y="278" font-family="Menlo, JetBrains Mono, monospace" font-size="22" fill="${C.inkMuted}">621 docs ready</text>
    <rect x="64" y="292" width="200" height="2" fill="${C.accent}" opacity="0.7">
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.6s" repeatCount="indefinite"/>
    </rect>
  </g>

  <!-- 右侧品牌区 -->
  <g transform="translate(580, 0)">
    <text x="0" y="232" font-family="Menlo, JetBrains Mono, monospace" font-size="22" letter-spacing="6" fill="${C.accent}">TERMINAL PAPER</text>
    <text x="0" y="330" font-family="Menlo, JetBrains Mono, monospace" font-weight="700" font-size="96" letter-spacing="-3" fill="${C.ink}">Linux</text>
    <text x="0" y="430" font-family="Menlo, JetBrains Mono, monospace" font-weight="700" font-size="96" letter-spacing="-3" fill="${C.accent}">Command</text>
    <rect x="4" y="460" width="360" height="6" rx="3" fill="${C.accent}"/>
    <text x="0" y="516" font-family="PingFang SC, Heiti SC, Noto Sans SC, sans-serif" font-size="30" fill="${C.inkMuted}">终端纸感速查手册 · 收录 600+ 命令</text>
  </g>

  <!-- 底部脚标 -->
  <text x="580" y="586" font-family="Menlo, JetBrains Mono, monospace" font-size="18" fill="${C.inkMuted}" opacity="0.8">linux-command · 模糊搜索 + 命令面板</text>
</svg>`;

const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
        // 加载系统字体目录，确保中文与等宽字体可渲染
        loadSystemFonts: true,
        fontFiles: [],
    },
});
const png = resvg.render().asPng();
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, png);
console.log(`✓ wrote ${path.relative(root, outPath)} (${png.length} bytes)`);
