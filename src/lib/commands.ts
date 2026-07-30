import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CommandInfo {
    n: string;
    p: string;
    d: string;
    body: string;
    file: string;
}

export interface CommandIndexItem {
    n: string;
    p: string;
    d: string;
}

const POPULAR_COMMAND_NAMES = [
    'ls',
    'cd',
    'grep',
    'find',
    'chmod',
    'tar',
    'ssh',
    'docker',
    'kubectl',
    'git',
    'vi',
    'curl',
    'awk',
] as const;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COMMAND_DIR = path.join(ROOT, 'command');

function sanitizeCommandName(value: string): string {
    return String(value || '')
        .replace(/^\uFEFF/, '')
        .replace(/[\u200B-\u200D\u2060]/g, '')
        .trim();
}

export function parseCommandMarkdown(raw: string, filePath: string): CommandInfo {
    const basename = path.basename(filePath, '.md');
    const titleMatch = raw.match(/[^===]+(?===)/);
    if (!titleMatch) {
        throw new Error(`缺少标题分隔符 ===: ${filePath}`);
    }
    const n = sanitizeCommandName(titleMatch[0].replace(/[\r\n]/g, ''));
    const desMatch = raw.match(/\n==={1,}([\s\S]*?)##/i);
    if (!desMatch) {
        throw new Error(`格式错误（简介段）: ${filePath}`);
    }
    const d = desMatch[1].replace(/[\r\n]/g, '').trim();
    const bodyStart = raw.search(/^##/m);
    const body = bodyStart >= 0 ? raw.slice(bodyStart).trim() : '';
    return {
        n,
        p: `/${basename.replace(/\\/g, '/')}`,
        d,
        body,
        file: filePath,
    };
}

let cache: CommandInfo[] | null = null;

export function loadCommands(): CommandInfo[] {
    if (cache) return cache;
    const files = fs
        .readdirSync(COMMAND_DIR)
        .filter((name) => name.endsWith('.md'))
        .sort((a, b) => a.localeCompare(b));

    const commands: CommandInfo[] = [];
    for (const name of files) {
        const filePath = path.join(COMMAND_DIR, name);
        try {
            const raw = fs.readFileSync(filePath, 'utf8');
            commands.push(parseCommandMarkdown(raw, filePath));
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`[commands] skip ${name}: ${message}`);
        }
    }
    cache = commands;
    return commands;
}

export function toIndexItems(commands: CommandInfo[]): CommandIndexItem[] {
    return commands.map(({ n, p, d }) => ({ n, p, d }));
}

export function getPopularCommands(commands: CommandInfo[]): CommandInfo[] {
    return POPULAR_COMMAND_NAMES.map((name) =>
        commands.find((item) => item.n === name),
    ).filter((item): item is CommandInfo => Boolean(item));
}

export function getCommandBySlug(slug: string): CommandInfo | undefined {
    return loadCommands().find((item) => item.p === `/${slug}` || item.n === slug);
}

export function groupByLetter(commands: CommandInfo[]): Array<{
    letter: string;
    items: CommandInfo[];
}> {
    const map = new Map<string, CommandInfo[]>();
    for (const cmd of commands) {
        const letter = (cmd.n[0] || '#').toUpperCase();
        const key = /[A-Z]/.test(letter) ? letter : '#';
        const list = map.get(key) || [];
        list.push(cmd);
        map.set(key, list);
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, items]) => ({
            letter,
            items: items.sort((x, y) => x.n.localeCompare(y.n)),
        }));
}
