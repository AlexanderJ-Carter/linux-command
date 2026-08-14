import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

/**
 * 命令文档允许的 HTML 标签/属性白名单。
 * 命令正文来自 command/*.md(可被上游 sync 覆盖),此处做收紧式清洗,
 * 显式列出文档所需标签,杜绝 script/iframe/内联事件/ javascript: 等风险。
 */
const ALLOWED_TAGS = [
    'p', 'br', 'hr', 'code', 'pre', 'em', 'strong', 'del', 's',
    'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'a', 'span', 'img', 'div', 'section', 'sup', 'sub', 'kbd', 'b', 'i', 'u',
];

const ALLOWED_ATTR = [
    'href', 'title', 'class', 'id', 'src', 'alt', 'width', 'height',
    'colspan', 'rowspan', 'target', 'rel', 'lang', 'dir',
];

/**
 * 把命令 Markdown 渲染为安全的 HTML。
 * marked 不做清洗(marked v15 官方建议用 DOMPurify 处理输出),
 * 因此先 marked.parse 再过 DOMPurify 白名单。仅构建期调用。
 */
export function renderMarkdown(md: string): string {
    const raw = marked.parse(md, { async: false }) as string;
    return DOMPurify.sanitize(raw, { ALLOWED_TAGS, ALLOWED_ATTR });
}
