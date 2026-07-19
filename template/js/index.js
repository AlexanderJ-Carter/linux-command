/**
 * 对数组进行排序，作为 Array.sort() 回调函数使用
 */
const sortArray = function (a, b) {
    return a.nIdx - b.nIdx;
};
/**
 * 判断 indexOf() 是否捕获到了搜索词
 * @returns {boolean} 是否捕获
 */
function indexOfCatch(a) {
    return a > -1;
}
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
(function () {
    const RECENT_KEY = 'linux_command_recent';
    const RECENT_LIMIT = 8;

    class Commands {
        query = '';
        query_size = 5;
        page_size = 50;
        list_offset = 0;
        list_results = [];
        $$(id) {
            return document.getElementById(id);
        }
        constructor() {
            function $$(id) {
                return document.getElementById(id);
            }
            this.commands = linux_commands || [];
            this.elm_query = $$('query');
            this.elm_btn = $$('search_btn');
            this.elm_result = $$('result');
            this.elm_search_result = $$('search_list_result');
            this.elm_load_more = $$('load_more_btn');

            this.root_path = (function () {
                let elm_path = $$('current_path');
                let url = window.location.origin + window.location.pathname;
                return elm_path
                    ? url
                          .replace(/\/(c\/)?[\w.-]+\.html/, '')
                          .replace(/\/$/, '')
                    : '';
            })();

            this.init();
            this.initAlphaNav();
            this.initBackToTop();
            this.initSearchTips();
            this.initLoadMore();
            this.initToc();
            this.trackRecent();
            this.renderRecent();
            this.goToIndex();
        }
        goToIndex() {
            let elma = document.getElementsByTagName('A');
            for (let i = 0; i < elma.length; i++) {
                if (
                    elma[i].pathname === '/' &&
                    !/^https?:/i.test(elma[i].protocol)
                ) {
                    elma[i].href = this.root_path + '/';
                }
            }
        }
        bindEvent(element, type, callback) {
            if (!element) return;
            if (element.addEventListener) {
                element.addEventListener(type, callback, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, callback);
            }
        }
        isSearchIndexOf(oldstr, kw) {
            if (!oldstr || !kw) return -1;
            return oldstr.toLowerCase().indexOf(kw.toLowerCase());
        }
        getQueryString(name) {
            let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            let r = decodeURIComponent(
                window.location.hash.replace(/^(\#\!|\#)/, ''),
            ).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return null;
        }
        pushState() {
            if (window.history && window.history.pushState)
                if (this.query) {
                    history.pushState(
                        {},
                        'linux_commands',
                        `#!kw=${this.query}`,
                    );
                } else {
                    history.pushState(
                        {},
                        'linux_commands',
                        window.location.pathname,
                    );
                }
        }
        createKeyworldsHTML(json, keywolds) {
            const replaceHTML = `<i class="kw">$1</i>`;
            let name = escapeHtml(json.n);
            let des = escapeHtml(json.d || '');
            if (keywolds) {
                const reg = new RegExp(`(${escapeRegExp(keywolds)})`, 'ig');
                name = name.replace(reg, replaceHTML);
                des = des.replace(reg, replaceHTML);
            }
            let rootp = this.root_path.replace(/\/$/, '');
            return `<a href="${rootp}/c${json.p}.html"><strong>${name}</strong>${des ? ` - ${des}` : ''}</a>`;
        }
        collectResults() {
            let arr = this.commands;
            let nameArr = [],
                desArr = [];
            if (
                indexOfCatch(
                    arr && arr.length && toString.call(arr).indexOf('Array'),
                )
            ) {
                for (let i = 0; i < arr.length; i++) {
                    if (!arr[i]) break;
                    const nIdx = this.isSearchIndexOf(arr[i].n, this.query);
                    const dIdx = this.isSearchIndexOf(arr[i].d, this.query);
                    let json = arr[i];
                    if (indexOfCatch(nIdx)) {
                        json.nIdx = nIdx;
                        nameArr.push(json);
                    } else if (indexOfCatch(dIdx)) {
                        json.dIdx = dIdx;
                        desArr.push(json);
                    }
                }
            }
            nameArr.sort(sortArray);
            desArr.sort(sortArray);
            return nameArr.concat(desArr);
        }
        searchResult(islist = false) {
            const self = this;
            const allResults = this.collectResults();
            const total = allResults.length;

            if (islist) {
                this.list_results = allResults;
                this.list_offset = 0;
                this.renderListPage(true);
                return;
            }

            const resultData = allResults.slice(0, this.query_size);
            this.updateSearchMeta(total, resultData.length, false);
            /** @type {HTMLElement} */
            let elm = this.elm_result;
            elm.innerHTML = '';
            resultData.forEach((a) => {
                const el = document.createElement('li');
                el.setAttribute('role', 'option');
                el.innerHTML = self.createKeyworldsHTML(a, self.query);
                elm.appendChild(el);
            });
            if (!resultData.length) {
                const noResultTipHTML = document.createElement('LI');
                const tipSpan = document.createElement('span');
                tipSpan.innerText = this.query
                    ? `没有搜索到任何内容，请尝试输入其它字符！`
                    : `请尝试输入一些字符，进行搜索！`;
                noResultTipHTML.appendChild(tipSpan);
                elm.appendChild(noResultTipHTML);
            }
        }
        renderListPage(reset) {
            if (!this.elm_search_result) return;
            const self = this;
            const total = this.list_results.length;
            if (reset) this.elm_search_result.innerHTML = '';

            const next = this.list_results.slice(
                this.list_offset,
                this.list_offset + this.page_size,
            );
            next.forEach((a) => {
                const el = document.createElement('li');
                el.setAttribute('role', 'option');
                el.innerHTML = self.createKeyworldsHTML(a, self.query);
                self.elm_search_result.appendChild(el);
            });
            this.list_offset += next.length;
            this.updateSearchMeta(total, this.list_offset, true);
            if (this.elm_load_more) {
                this.elm_load_more.hidden =
                    !this.query || this.list_offset >= total || total === 0;
            }
            if (reset && !next.length) {
                const noResultTipHTML = document.createElement('LI');
                const tipSpan = document.createElement('span');
                tipSpan.innerText = this.query
                    ? `没有搜索到任何内容，请尝试输入其它字符！`
                    : `请尝试输入一些字符，进行搜索！`;
                noResultTipHTML.appendChild(tipSpan);
                this.elm_search_result.appendChild(noResultTipHTML);
            }
        }
        updateSearchMeta(total, shown, islist) {
            const meta = document.getElementById('search_meta');
            if (!meta || !islist) return;
            if (!this.query) {
                meta.textContent = '输入关键词开始搜索，或点击下方示例';
                return;
            }
            if (total === 0) {
                meta.textContent = `未找到与「${this.query}」相关的命令`;
                return;
            }
            meta.textContent =
                shown < total
                    ? `找到 ${total} 条结果，已显示 ${shown} 条`
                    : `找到 ${total} 条结果`;
        }
        initLoadMore() {
            if (!this.elm_load_more) return;
            this.bindEvent(this.elm_load_more, 'click', () => {
                this.renderListPage(false);
            });
        }
        initSearchTips() {
            const tips = document.querySelectorAll('.search-tip');
            tips.forEach((btn) => {
                this.bindEvent(btn, 'click', () => {
                    const kw = btn.getAttribute('data-kw') || '';
                    this.elm_query.value = kw;
                    this.query = kw;
                    this.pushState();
                    if (this.elm_search_result) this.searchResult(true);
                    else this.elm_btn.click();
                });
            });
        }
        initAlphaNav() {
            const nav = document.getElementById('alpha_nav');
            if (!nav) return;
            const groups = document.querySelectorAll('.alpha-group');
            groups.forEach((group) => {
                const letter = group.id.replace('letter-', '');
                const link = document.createElement('a');
                link.href = `#${group.id}`;
                link.textContent = letter;
                link.className = 'alpha-nav__link';
                nav.appendChild(link);
            });
        }
        initBackToTop() {
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
        initToc() {
            const toc = document.getElementById('cmd_toc');
            const body = document.querySelector('.markdown-body');
            if (!toc || !body) return;
            const headings = body.querySelectorAll('h2, h3');
            if (headings.length < 2) return;
            const list = document.createElement('ul');
            list.className = 'cmd-toc__list';
            const title = document.createElement('div');
            title.className = 'cmd-toc__title';
            title.textContent = '本页目录';
            toc.appendChild(title);
            headings.forEach((heading) => {
                if (!heading.id) {
                    heading.id = heading.textContent
                        .trim()
                        .replace(/\s+/g, '-')
                        .toLowerCase();
                }
                const li = document.createElement('li');
                li.className = `cmd-toc__item cmd-toc__item--${heading.tagName.toLowerCase()}`;
                const a = document.createElement('a');
                a.href = `#${heading.id}`;
                a.textContent = heading.textContent.replace(/^#\s*/, '').trim();
                li.appendChild(a);
                list.appendChild(li);
            });
            toc.appendChild(list);
            toc.hidden = false;
        }
        getRecent() {
            const raw = localStorage.getItem(RECENT_KEY);
            if (!raw) return [];
            const list = JSON.parse(raw);
            return Array.isArray(list) ? list : [];
        }
        setRecent(list) {
            localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_LIMIT)));
        }
        trackRecent() {
            const header = document.querySelector('.cmd-page-header');
            if (!header) return;
            const name = header.getAttribute('data-cmd-name');
            const path = header.getAttribute('data-cmd-path');
            const desc = header.getAttribute('data-cmd-desc') || '';
            if (!name || !path) return;
            const next = [
                { n: name, p: path, d: desc },
                ...this.getRecent().filter((item) => item.n !== name),
            ];
            this.setRecent(next);
        }
        renderRecent() {
            const wrap = document.getElementById('recent_commands');
            const list = document.getElementById('recent_commands_list');
            if (!wrap || !list) return;
            const recent = this.getRecent();
            if (!recent.length) return;
            const rootp = this.root_path.replace(/\/$/, '');
            list.innerHTML = recent
                .map(
                    (cmd) =>
                        `<a class="cmd-chip" href="${rootp}/c${cmd.p}.html" title="${escapeHtml(cmd.d || '')}">${escapeHtml(cmd.n)}</a>`,
                )
                .join('');
            wrap.hidden = false;
        }
        selectedResult(type) {
            const items = this.elm_result.children;
            let index = 0;
            for (let i = 0; i < items.length; i++) {
                if (items[i].classList.contains('ok')) {
                    items[i].classList.remove('ok');
                    index = type === 'up' ? i - 1 : i + 1;
                    break;
                }
            }
            if (items[index]) items[index].classList.add('ok');
        }
        isSelectedResult() {
            const items = this.elm_result.children;
            for (let i = 0; i < items.length; i++) {
                if (items[i].classList.contains('ok')) {
                    return items[i];
                }
            }
            return false;
        }
        init() {
            function setdisplay(inputDisplay) {
                self.elm_result.style.display = inputDisplay || 'none';
            }
            let self = this;
            let kw = self.getQueryString('kw');
            this.elm_query.value = kw;
            this.query = kw || '';
            if (this.elm_search_result) self.searchResult(true);
            const handleInput = debounce(function (e) {
                self.query = e.target.value;
                self.pushState();
                if (self.query) {
                    self.searchResult();
                } else {
                    setdisplay();
                }
                if (!self.elm_search_result) {
                    setdisplay(self.query ? 'block' : 'none');
                } else {
                    self.elm_btn.click();
                }
            }, 120);
            this.bindEvent(this.elm_query, 'input', handleInput);
            this.bindEvent(this.elm_btn, 'click', function () {
                setdisplay();
                if (self.elm_search_result) self.searchResult(true);
                else
                    window.location.href =
                        self.root_path + '/list.html#!kw=' + self.query;
            });
            this.bindEvent(this.elm_query, 'focus', function () {
                self.searchResult();
                if (self.query) setdisplay('block');
            });
            this.bindEvent(this.elm_query, 'blur', function () {
                setTimeout(function () {
                    setdisplay();
                }, 300);
            });
            this.bindEvent(document, 'keydown', function (e) {
                const activeTag = document.activeElement?.tagName;
                const typing =
                    activeTag === 'INPUT' ||
                    activeTag === 'TEXTAREA' ||
                    activeTag === 'SELECT';
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    self.elm_query.focus();
                    self.elm_query.select();
                    return;
                }
                if (e.key === '/' && !typing) {
                    e.preventDefault();
                    self.elm_query.focus();
                    return;
                }
                if (e.key === 'Escape') {
                    setdisplay();
                    if (document.activeElement === self.elm_query) {
                        self.elm_query.blur();
                    }
                }
            });
            this.bindEvent(document, 'keyup', function (e) {
                if (e.key === 'ArrowDown') self.selectedResult('down');
                if (e.key === 'ArrowUp') self.selectedResult('up');
                if (e.key === 'Enter') {
                    let item = self.isSelectedResult();
                    if (!item) return self.elm_btn.click();
                    if (item.children[0]) item.children[0].click();
                }
            });
            if (kw) self.searchResult();
        }
    }
    new Commands();
})();
