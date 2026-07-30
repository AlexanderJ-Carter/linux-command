import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
    const site = (import.meta.env.SITE || 'http://localhost:4321').replace(/\/$/, '');
    const base = import.meta.env.BASE_URL || '/';
    const prefix = base === '/' ? '' : base.replace(/\/$/, '');
    const sitemap = `${site}${prefix}/sitemap-index.xml`;
    const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
};
