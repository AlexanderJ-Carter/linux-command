import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
    site,
    base,
    trailingSlash: 'never',
    build: {
        format: 'file',
    },
    outDir: 'dist',
    integrations: [
        sitemap({
            filter: (page) => !page.includes('/search-index'),
            changefreq: 'weekly',
            priority: 0.7,
        }),
    ],
});
