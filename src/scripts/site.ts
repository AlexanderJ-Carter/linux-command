import { searchCommands, type IndexItem } from './search-engine';

const RECENT_KEY = 'linux_command_recent';
const FAV_KEY = 'linux_command_favorites';
const RECENT_LIMIT = 8;
const FAV_LIMIT = 24;
const THEME_KEY = 'linux_command_theme';

function debounce<T extends (...args: never[]) => void>(fn: T, delay: number) {
    let timer = 0;
    return (...args: Parameters<T>) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
    };
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getBasePath() {
    const base = import.meta.env.BASE_URL || '/';
    return base === '/' ? '' : base.replace(/\/$/, '');
}

function pageHref(path: string) {
    const base = getBasePath();
    if (!path || path === '/') return `${base}/` || '/';
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (clean.endsWith('.html') || clean.endsWith('.json')) return `${base}${clean}`;
    return `${base}${clean}.html`;
}

function commandHref(p: string) {
    const slug = p.startsWith('/') ? p : `/${p}`;
    return pageHref(`/c${slug}`);
}

function readList(key: string): IndexItem[] {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function writeList(key: string, list: IndexItem[], limit: number) {
    localStorage.setItem(key, JSON.stringify(list.slice(0, limit)));
}

function getRecent() {
    return readList(RECENT_KEY);
}

function setRecent(list: IndexItem[]) {
    writeList(RECENT_KEY, list, RECENT_LIMIT);
}

function getFavorites() {
    return readList(FAV_KEY);
}

function setFavorites(list: IndexItem[]) {
    writeList(FAV_KEY, list, FAV_LIMIT);
}

function isFavorite(name: string) {
    return getFavorites().some((item) => item.n === name);
}

function toggleFavorite(item: IndexItem) {
    const current = getFavorites();
    const exists = current.some((x) => x.n === item.n);
    const next = exists
        ? current.filter((x) => x.n !== item.n)
        : [item, ...current.filter((x) => x.n !== item.n)];
    setFavorites(next);
    return !exists;
}

async function loadIndex(): Promise<IndexItem[]> {
    const cached = (window as unknown as { __linux_commands__?: IndexItem[] })
        .__linux_commands__;
    if (cached) return cached;
    const res = await fetch(`${getBasePath()}/search-index.json`);
    if (!res.ok) throw new Error('failed to load search index');
    const data = (await res.json()) as IndexItem[];
    (window as unknown as { __linux_commands__: IndexItem[] }).__linux_commands__ =
        data;
    return data;
}

function highlight(text: string, query: string) {
    const safe = escapeHtml(text);
    if (!query) return safe;
    const reg = new RegExp(`(${escapeRegExp(query)})`, 'ig');
    return safe.replace(reg, '<i class="kw">$1</i>');
}

function resultHtml(item: IndexItem, query: string) {
    return `<a href="${commandHref(item.p)}"><strong>${highlight(item.n, query)}</strong>${
        item.d ? ` - ${highlight(item.d, query)}` : ''
    }</a>`;
}

function chipHtml(cmd: IndexItem) {
    return `<a class="cmd-chip focus-ring" href="${commandHref(cmd.p)}" title="${escapeHtml(cmd.d || '')}">${escapeHtml(cmd.n)}</a>`;
}

function initThemeToggle() {
    const btn = document.getElementById('theme_toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const root = document.documentElement;
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
    });
}

function initBackToTop() {
    const btn = document.getElementById('back_to_top');
    if (!btn) return;
    const onScroll = () => {
        btn.hidden = window.scrollY < 400;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
}

function initToc() {
    const toc = document.getElementById('cmd_toc');
    const body = document.querySelector('[data-markdown]');
    if (!toc || !body) return;
    const headings = body.querySelectorAll('h2, h3');
    if (headings.length < 2) return;
    const title = document.createElement('div');
    title.className = 'cmd-toc__title';
    title.textContent = '本页目录';
    const list = document.createElement('ul');
    list.className = 'cmd-toc__list';
    headings.forEach((heading) => {
        if (!heading.id) {
            heading.id = (heading.textContent || '')
                .trim()
                .replace(/\s+/g, '-')
                .toLowerCase();
        }
        const li = document.createElement('li');
        li.className = `cmd-toc__item cmd-toc__item--${heading.tagName.toLowerCase()}`;
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = (heading.textContent || '').replace(/^#\s*/, '').trim();
        li.appendChild(a);
        list.appendChild(li);
    });
    toc.append(title, list);
    toc.hidden = false;
}

function initCodeCopy() {
    document.querySelectorAll('[data-markdown] pre').forEach((pre) => {
        if (pre.querySelector('.code-copy')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-copy';
        btn.textContent = '复制';
        btn.addEventListener('click', async () => {
            const code = pre.querySelector('code');
            const text = code?.textContent || pre.textContent || '';
            await navigator.clipboard.writeText(text);
            btn.textContent = '已复制';
            window.setTimeout(() => {
                btn.textContent = '复制';
            }, 1200);
        });
        (pre as HTMLElement).style.position = 'relative';
        pre.appendChild(btn);
    });
}

function trackRecent() {
    const header = document.querySelector('.cmd-page-header');
    if (!(header instanceof HTMLElement)) return;
    const name = header.dataset.cmdName;
    const path = header.dataset.cmdPath;
    const desc = header.dataset.cmdDesc || '';
    if (!name || !path) return;
    setRecent([{ n: name, p: path, d: desc }, ...getRecent().filter((i) => i.n !== name)]);
}

function renderChipSection(wrapId: string, listId: string, items: IndexItem[]) {
    const wrap = document.getElementById(wrapId);
    const list = document.getElementById(listId);
    if (!wrap || !list) return;
    if (!items.length) {
        wrap.hidden = true;
        list.innerHTML = '';
        return;
    }
    list.innerHTML = items.map(chipHtml).join('');
    wrap.hidden = false;
}

function renderRecent() {
    renderChipSection('recent_commands', 'recent_commands_list', getRecent());
}

function renderFavorites() {
    renderChipSection('favorite_commands', 'favorite_commands_list', getFavorites());
}

function syncFavoriteButton() {
    const btn = document.getElementById('favorite_btn');
    const header = document.querySelector('.cmd-page-header');
    if (!(btn instanceof HTMLButtonElement) || !(header instanceof HTMLElement)) return;
    const name = header.dataset.cmdName || '';
    const active = isFavorite(name);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.textContent = active ? '已收藏' : '收藏';
    btn.classList.toggle('is-active', active);
}

function initFavoriteButton() {
    const btn = document.getElementById('favorite_btn');
    const header = document.querySelector('.cmd-page-header');
    if (!(btn instanceof HTMLButtonElement) || !(header instanceof HTMLElement)) return;
    syncFavoriteButton();
    btn.addEventListener('click', () => {
        const name = header.dataset.cmdName;
        const path = header.dataset.cmdPath;
        const desc = header.dataset.cmdDesc || '';
        if (!name || !path) return;
        toggleFavorite({ n: name, p: path, d: desc });
        syncFavoriteButton();
        renderFavorites();
    });
}

type PaletteRow =
    | { kind: 'cmd'; item: IndexItem }
    | { kind: 'nav'; n: string; d: string; href: string };

function initCommandPalette() {
    const root = document.getElementById('cmdk');
    const input = document.getElementById('cmdk_input') as HTMLInputElement | null;
    const list = document.getElementById('cmdk_list');
    const openBtn = document.getElementById('cmdk_open');
    if (!root || !input || !list) return;

    let index: IndexItem[] = [];
    let rows: PaletteRow[] = [];
    let open = false;

    const navRows = (): PaletteRow[] => [
        { kind: 'nav', n: '首页', d: '回到搜索首页', href: pageHref('/') },
        { kind: 'nav', n: '字母表', d: '按字母浏览全部命令', href: pageHref('/hot') },
        { kind: 'nav', n: '分类', d: '按用途浏览命令', href: pageHref('/category') },
        { kind: 'nav', n: '高级搜索', d: '打开搜索结果页', href: pageHref('/list') },
    ];

    const setOpen = (next: boolean) => {
        open = next;
        root.hidden = !next;
        document.body.style.overflow = next ? 'hidden' : '';
        if (next) {
            input.value = '';
            void refresh('');
            window.requestAnimationFrame(() => input.focus());
        }
    };

    const selectIndex = (idx: number) => {
        const items = [...list.children] as HTMLElement[];
        items.forEach((el) => el.classList.remove('ok'));
        const target = items[idx];
        if (!target) return;
        target.classList.add('ok');
        target.scrollIntoView({ block: 'nearest' });
    };

    const render = (query: string) => {
        list.innerHTML = '';
        if (!rows.length) {
            const li = document.createElement('li');
            li.className = 'cmdk__empty';
            li.textContent = query ? `未找到「${query}」` : '输入命令名或说明开始搜索';
            list.appendChild(li);
            return;
        }
        rows.forEach((row) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            if (row.kind === 'cmd') {
                li.innerHTML = `<a href="${commandHref(row.item.p)}"><span class="cmdk__name">${highlight(row.item.n, query)}</span><span class="cmdk__desc">${highlight(row.item.d || '', query)}</span></a>`;
            } else {
                li.innerHTML = `<a href="${row.href}"><span class="cmdk__name">${escapeHtml(row.n)}</span><span class="cmdk__desc">${escapeHtml(row.d)}</span></a>`;
            }
            list.appendChild(li);
        });
        selectIndex(0);
    };

    const refresh = async (query: string) => {
        if (!index.length) index = await loadIndex();
        const q = query.trim();
        if (!q) {
            const fav = getFavorites().slice(0, 6).map((item) => ({ kind: 'cmd' as const, item }));
            const recent = getRecent()
                .filter((item) => !fav.some((f) => f.item.n === item.n))
                .slice(0, 4)
                .map((item) => ({ kind: 'cmd' as const, item }));
            rows = [...navRows(), ...fav, ...recent];
            render('');
            return;
        }
        const hits = searchCommands(index, q).slice(0, 12);
        const navHits = navRows().filter(
            (row) =>
                row.kind === 'nav' &&
                (row.n.includes(q) || row.d.includes(q)),
        );
        rows = [
            ...navHits,
            ...hits.map((item) => ({ kind: 'cmd' as const, item })),
        ];
        render(q);
    };

    const onInput = debounce(() => {
        void refresh(input.value);
    }, 80);

    input.addEventListener('input', onInput);
    openBtn?.addEventListener('click', () => setOpen(true));
    root.querySelectorAll('[data-cmdk-close]').forEach((el) => {
        el.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        const tag = (document.activeElement as HTMLElement | null)?.tagName;
        const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            setOpen(!open);
            return;
        }

        if (!open && e.key === '/' && !typing) {
            e.preventDefault();
            const query = document.getElementById('query') as HTMLInputElement | null;
            if (query) {
                query.focus();
                query.select();
            } else {
                setOpen(true);
            }
            return;
        }

        if (!open) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            return;
        }

        const items = [...list.children] as HTMLElement[];
        const current = items.findIndex((item) => item.classList.contains('ok'));
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectIndex(current < 0 ? 0 : Math.min(current + 1, items.length - 1));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectIndex(current < 0 ? items.length - 1 : Math.max(current - 1, 0));
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const selected = items.find((item) => item.classList.contains('ok'));
            const link = selected?.querySelector('a');
            if (link) link.click();
        }
    });
}

function initSearch() {
    const input = document.getElementById('query') as HTMLInputElement | null;
    const btn = document.getElementById('search_btn');
    const dropdown = document.getElementById('result');
    const listPage = document.querySelector('[data-list-page]');
    const listResult = document.getElementById('search_list_result');
    const loadMore = document.getElementById('load_more_btn');
    const meta = document.getElementById('search_meta');
    if (!input || !btn) return;

    let index: IndexItem[] = [];
    let listResults: IndexItem[] = [];
    let listOffset = 0;
    const pageSize = 50;
    const suggestSize = 8;

    const showDropdown = (visible: boolean) => {
        if (!dropdown || listPage) return;
        dropdown.hidden = !visible;
    };

    const renderSuggest = (items: IndexItem[], query: string) => {
        if (!dropdown) return;
        dropdown.innerHTML = '';
        if (!items.length) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${query ? '没有搜索到任何内容' : '请输入关键词'}</span>`;
            dropdown.appendChild(li);
            return;
        }
        items.forEach((item) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.innerHTML = resultHtml(item, query);
            dropdown.appendChild(li);
        });
    };

    const updateMeta = (total: number, shown: number, query: string) => {
        if (!meta) return;
        if (!query) {
            meta.textContent = '输入关键词开始搜索，或点击首页示例';
            return;
        }
        if (total === 0) {
            meta.textContent = `未找到与「${query}」相关的命令`;
            return;
        }
        meta.textContent =
            shown < total
                ? `找到 ${total} 条结果，已显示 ${shown} 条`
                : `找到 ${total} 条结果`;
    };

    const renderListPage = (reset: boolean) => {
        if (!listResult) return;
        if (reset) {
            listResult.innerHTML = '';
            listOffset = 0;
        }
        const query = input.value.trim();
        const next = listResults.slice(listOffset, listOffset + pageSize);
        next.forEach((item) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.innerHTML = resultHtml(item, query);
            listResult.appendChild(li);
        });
        listOffset += next.length;
        updateMeta(listResults.length, listOffset, query);
        if (loadMore) {
            loadMore.hidden = !query || listOffset >= listResults.length || listResults.length === 0;
        }
        if (reset && !next.length) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${query ? '没有搜索到任何内容，请尝试其它关键词' : '请输入关键词开始搜索'}</span>`;
            listResult.appendChild(li);
        }
    };

    const runSearch = async (fromButton = false) => {
        if (!index.length) index = await loadIndex();
        const query = input.value.trim();
        if (listPage) {
            listResults = searchCommands(index, query);
            renderListPage(true);
            const url = new URL(window.location.href);
            if (query) url.searchParams.set('kw', query);
            else url.searchParams.delete('kw');
            history.replaceState({}, '', url);
            return;
        }
        if (!query) {
            showDropdown(false);
            return;
        }
        const results = searchCommands(index, query).slice(0, suggestSize);
        renderSuggest(results, query);
        showDropdown(true);
        if (fromButton) {
            window.location.href = `${pageHref('/list')}?kw=${encodeURIComponent(query)}`;
        }
    };

    const onInput = debounce(() => {
        void runSearch(false);
    }, 120);

    input.addEventListener('input', onInput);
    input.addEventListener('focus', () => {
        if (input.value.trim()) void runSearch(false);
    });
    input.addEventListener('blur', () => {
        window.setTimeout(() => showDropdown(false), 200);
    });
    btn.addEventListener('click', () => {
        void runSearch(true);
    });
    loadMore?.addEventListener('click', () => renderListPage(false));

    document.querySelectorAll('.search-tip').forEach((el) => {
        el.addEventListener('click', () => {
            const kw = (el as HTMLElement).dataset.kw || '';
            input.value = kw;
            void runSearch(true);
        });
    });

    document.addEventListener('keyup', (e) => {
        const paletteOpen = !document.getElementById('cmdk')?.hidden;
        if (paletteOpen) return;
        if (!dropdown || dropdown.hidden) {
            if (e.key === 'Enter' && document.activeElement === input) {
                void runSearch(true);
            }
            return;
        }
        const items = [...dropdown.children] as HTMLElement[];
        const current = items.findIndex((item) => item.classList.contains('ok'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            items.forEach((item) => item.classList.remove('ok'));
            let next = current;
            if (e.key === 'ArrowDown') next = current < 0 ? 0 : Math.min(current + 1, items.length - 1);
            else next = current < 0 ? items.length - 1 : Math.max(current - 1, 0);
            items[next]?.classList.add('ok');
        }
        if (e.key === 'Enter') {
            const selected = items.find((item) => item.classList.contains('ok'));
            const link = selected?.querySelector('a');
            if (link) link.click();
            else void runSearch(true);
        }
    });

    if (listPage && input.value.trim()) {
        void runSearch(false);
    }
}

initThemeToggle();
initBackToTop();
initToc();
initCodeCopy();
trackRecent();
renderRecent();
renderFavorites();
initFavoriteButton();
initCommandPalette();
initSearch();
