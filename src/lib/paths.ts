/** 规范化 Astro `BASE_URL`（可能无尾斜杠）。 */
export function baseUrl(): string {
    const raw = import.meta.env.BASE_URL || '/';
    if (raw === '/') return '/';
    return raw.endsWith('/') ? raw : `${raw}/`;
}

/** 生成兼容纯静态托管的页面 URL（带 .html）。 */
export function withBase(path = '/'): string {
    const base = baseUrl().replace(/\/$/, '');
    if (!path || path === '/') return `${base}/` || '/';
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (clean.endsWith('.html') || clean.endsWith('.json') || clean.endsWith('.svg')) {
        return `${base}${clean}`;
    }
    return `${base}${clean}.html`;
}

/** 命令详情页。`p` 形如 `/ls`。 */
export function commandHref(p: string): string {
    const slug = p.startsWith('/') ? p : `/${p}`;
    return withBase(`/c${slug}`);
}

/** 静态资源（如 favicon）。 */
export function assetHref(path: string): string {
    const clean = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl()}${clean}`;
}
