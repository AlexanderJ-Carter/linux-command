import type Fuse from 'fuse.js';

export type IndexItem = { n: string; p: string; d: string };

type FuseFactory = typeof import('fuse.js').default;

let fuseModule: FuseFactory | null = null;
let fuse: Fuse<IndexItem> | null = null;
let fuseSource: IndexItem[] = [];

async function loadFuse(): Promise<FuseFactory> {
    if (fuseModule) return fuseModule;
    const mod = await import('fuse.js');
    fuseModule = mod.default;
    return fuseModule;
}

async function ensureFuse(items: IndexItem[]) {
    if (fuse && fuseSource === items) return fuse;
    const FuseCtor = await loadFuse();
    fuseSource = items;
    fuse = new FuseCtor(items, {
        keys: [
            { name: 'n', weight: 0.7 },
            { name: 'd', weight: 0.3 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 1,
    });
    return fuse;
}

export type SearchOptions = {
    fuzzyLimit?: number;
};

/** 名称精确/前缀优先，其余走 Fuse。 */
export async function searchCommands(
    items: IndexItem[],
    query: string,
    options: SearchOptions = {},
): Promise<IndexItem[]> {
    const q = query.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    const exact: IndexItem[] = [];
    const prefix: IndexItem[] = [];
    for (const item of items) {
        const name = item.n.toLowerCase();
        if (name === lower) exact.push(item);
        else if (name.startsWith(lower)) prefix.push(item);
    }
    const reserved = new Set([...exact, ...prefix].map((i) => i.n));
    const fuzzyLimit = options.fuzzyLimit ?? 120;
    const fuzzy = (await ensureFuse(items))
        .search(q, { limit: fuzzyLimit })
        .map((r) => r.item)
        .filter((item) => !reserved.has(item.n));
    prefix.sort((a, b) => a.n.localeCompare(b.n));
    return [...exact, ...prefix, ...fuzzy];
}
