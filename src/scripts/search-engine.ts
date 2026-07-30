import Fuse from 'fuse.js';

export type IndexItem = { n: string; p: string; d: string };

export type NavAction = {
    kind: 'nav';
    id: string;
    n: string;
    d: string;
    href: string;
};

let fuse: Fuse<IndexItem> | null = null;
let fuseSource: IndexItem[] = [];

export function ensureFuse(items: IndexItem[]) {
    if (fuse && fuseSource === items) return fuse;
    fuseSource = items;
    fuse = new Fuse(items, {
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

/** 名称精确/前缀优先，其余走 Fuse。 */
export function searchCommands(items: IndexItem[], query: string): IndexItem[] {
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
    const fuzzy = ensureFuse(items)
        .search(q)
        .map((r) => r.item)
        .filter((item) => !reserved.has(item.n));
    prefix.sort((a, b) => a.n.localeCompare(b.n));
    return [...exact, ...prefix, ...fuzzy];
}
