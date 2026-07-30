#!/usr/bin/env node
/**
 * 从上游 jaywcjlove/linux-command 同步 command/ 目录。
 * 不覆盖本仓库站点代码。
 *
 * 用法: npm run sync:upstream
 * 可选环境变量:
 *   UPSTREAM_REF=master
 *   UPSTREAM_URL=https://github.com/jaywcjlove/linux-command.git
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const upstreamUrl =
    process.env.UPSTREAM_URL ||
    'https://github.com/jaywcjlove/linux-command.git';
const ref = process.env.UPSTREAM_REF || 'master';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'linux-command-upstream-'));

function run(cmd, args, cwd = tmp) {
    execFileSync(cmd, args, { cwd, stdio: 'inherit' });
}

console.log(`→ clone ${upstreamUrl} @ ${ref}`);
run('git', ['clone', '--depth', '1', '--branch', ref, upstreamUrl, tmp], root);

const src = path.join(tmp, 'command');
const dest = path.join(root, 'command');
if (!fs.existsSync(src)) {
    throw new Error('上游仓库缺少 command/ 目录');
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`✓ 已同步 command/ （来自 ${ref}）`);
fs.rmSync(tmp, { recursive: true, force: true });
