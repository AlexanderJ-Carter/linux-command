import FS from 'fs-extra';
import path from 'path';
import stylus from 'stylus';
import * as ejs from 'ejs';
import UglifyJS from 'uglify-js';
import { create } from 'markdown-to-html-cli';
import _ from 'colors-cli/toxic';
import { createRequire } from 'module';
import {
    buildCategoryGroups,
    buildRelatedMap,
} from './categories.mjs';

const require = createRequire(import.meta.url);
const { version: packageVersion } = require('../package.json');
const buildVersion = packageVersion;

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
];

function pickPopularCommands(commands) {
    return POPULAR_COMMAND_NAMES.map((name) =>
        commands.find((item) => item.n === name),
    ).filter(Boolean);
}

function stripInjectedDarkMode(html) {
    return String(html)
        .replace(/<dark-mode\b[^>]*>[\s\S]*?<\/dark-mode>/gi, '')
        .replace(
            /<script>const t=document;const e="_dark_mode_theme_"[\s\S]*?customElements\.define\("dark-mode",a\);<\/script>/g,
            '',
        );
}

const deployDir = path.resolve(process.cwd(), '.deploy');
const templateImgDir = path.resolve(process.cwd(), 'template', 'img');
const rootIndexJSPath = path.resolve(
    process.cwd(),
    'template',
    'js',
    'index.js',
);
const dataJsonPath = path.resolve(process.cwd(), 'dist', 'data.json');
const dataJsonMinPath = path.resolve(process.cwd(), 'dist', 'data.min.json');
const cssPath = path.resolve(deployDir, 'css', 'index.css');
const contributorsPath = path.resolve(process.cwd(), 'CONTRIBUTORS.svg');

function sanitizeCommandName(value) {
    return String(value || '')
        .replace(/^\uFEFF/, '')
        .replace(/[\u200B-\u200D\u2060]/g, '')
        .trim();
}

;(async () => {
    try {
        await FS.ensureDir(deployDir);
        await FS.emptyDir(deployDir);
        await FS.ensureDir(path.resolve(deployDir, 'js'));
        await FS.ensureDir(path.resolve(deployDir, 'css'));
        await FS.ensureDir(path.resolve(deployDir, 'c'));
        await FS.copySync(templateImgDir, path.resolve(deployDir, 'img'));

        await FS.copyFile(
            path.resolve(
                process.cwd(),
                'template',
                'js',
                'copy-to-clipboard.js',
            ),
            path.resolve(deployDir, 'js', 'copy-to-clipboard.js'),
        );
        await FS.copyFile(
            path.resolve(process.cwd(), 'node_modules/@wcj/dark-mode/main.js'),
            path.resolve(deployDir, 'js', 'dark-mode.min.js'),
        );
        await FS.copyFile(
            path.resolve(
                process.cwd(),
                'node_modules/@uiw/github-corners/lib/index.js',
            ),
            path.resolve(deployDir, 'js', 'github-corners.js'),
        );

        const jsData = await FS.readFileSync(rootIndexJSPath);
        await FS.outputFile(
            path.resolve(deployDir, 'js', 'index.js'),
            UglifyJS.minify(jsData.toString()).code,
        );
        const files = await readMarkdownPaths(
            path.resolve(process.cwd(), 'command'),
        );
        const jsonData = await createDataJSON(files);
        await FS.outputFile(
            dataJsonPath,
            JSON.stringify(jsonData.json, null, 2),
        );
        await FS.outputFile(dataJsonMinPath, JSON.stringify(jsonData.json));
        await FS.outputFile(
            path.resolve(deployDir, 'js', 'dt.js'),
            `var linux_commands=${JSON.stringify(jsonData.data)}`,
        );

        const cssStr = await createStylToCss(
            path.resolve(process.cwd(), 'template', 'styl', 'index.styl'),
            path.resolve(deployDir, 'css', 'index.css'),
        );

        await FS.outputFileSync(cssPath, cssStr);
        console.log(`  ${'→'.green} ${jsonData.data.length}`);

        await createTmpToHTML(
            path.resolve(process.cwd(), 'template', 'index.ejs'),
            path.resolve(deployDir, 'index.html'),
            {
                p: '/index.html',
                is_home: true,
                command_length: jsonData.data.length,
                popular_commands: pickPopularCommands(jsonData.data),
            },
        );

        await createTmpToHTML(
            path.resolve(process.cwd(), 'template', 'list.ejs'),
            path.resolve(deployDir, 'list.html'),
            {
                p: '/list.html',
                is_list_page: true,
                page_title: '搜索结果',
                page_desc: '按名称或说明搜索 Linux 命令',
                command_length: jsonData.data.length,
            },
        );

        await createTmpToHTML(
            path.resolve(process.cwd(), 'template', 'hot.ejs'),
            path.resolve(deployDir, 'hot.html'),
            {
                p: '/hot.html',
                is_list_page: true,
                page_title: '命令列表',
                page_desc: '全部 Linux 命令，按字母排序浏览',
                arr: jsonData.data,
                command_length: jsonData.data.length,
            },
        );

        const categories = buildCategoryGroups(jsonData.data);
        const relatedMap = buildRelatedMap(jsonData.data);
        await createTmpToHTML(
            path.resolve(process.cwd(), 'template', 'category.ejs'),
            path.resolve(deployDir, 'category.html'),
            {
                p: '/category.html',
                is_list_page: true,
                page_title: '分类浏览',
                page_desc: '按用途浏览 Linux 命令',
                categories,
                command_length: jsonData.data.length,
            },
        );

        let svgStr = '';
        if (FS.existsSync(contributorsPath)) {
            svgStr = (await FS.readFile(contributorsPath)).toString();
        }

        await createTmpToHTML(
            path.resolve(process.cwd(), 'template', 'contributors.ejs'),
            path.resolve(deployDir, 'contributors.html'),
            {
                p: '/contributors.html',
                is_list_page: true,
                page_title: '贡献者',
                page_desc: '感谢所有为 linux-command 做出贡献的开发者',
                arr: jsonData.data,
                command_length: jsonData.data.length,
                contributors: svgStr,
            },
        );

        await Promise.all(
            jsonData.data.map(async (item) => {
                item.command_length = jsonData.data.length;
                item.related = relatedMap.get(item.n) || [];
                await createTmpToHTML(
                    path.resolve(process.cwd(), 'template', 'details.ejs'),
                    path.resolve(deployDir, 'c', `${item.n}.html`),
                    item,
                    path.resolve(process.cwd(), 'command'),
                );
            }),
        );
    } catch (err) {
        console.log(`\n ERROR :> ${err}\n`);
        if (err && err.message) {
            console.log(`\n ERROR :> ${err.message.red_bt}\n`);
        }
        process.exit(1);
    }
})();

/**
 * 返回 MD 所有路径的 Array
 * @param {String} filepath
 */
function readMarkdownPaths(filepath) {
    return new Promise((resolve, reject) => {
        try {
            let pathAll = [];
            const files = FS.readdirSync(filepath);
            for (let i = 0; i < files.length; i++) {
                if (/\.md$/.test(files[i])) {
                    pathAll.push(path.join(filepath, files[i]));
                }
            }
            resolve(pathAll);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Ensures that the directory exists.
 * @param {String} pathArr
 */
function createDataJSON(pathArr) {
    return new Promise((resolve, reject) => {
        try {
            const commandData = {};
            const indexes = [];
            pathArr.forEach((mdPath, i) => {
                const json = {};
                const con = FS.readFileSync(mdPath);
                const str = con.toString();
                let title = str.match(/[^===]+(?=[===])/g);
                title = title[0] ? title[0].replace(/\n/g, '') : title[0];
                title = title.replace(/\r/, '');
                title = sanitizeCommandName(title);
                // 命令名称
                json['n'] = title;
                // 命令路径
                json['p'] =
                    `/${path.basename(mdPath, '.md').replace(/\\/g, '/')}`;
                // 命令描述
                let des = str.match(/\n==={1,}([\s\S]*?)##/i);
                if (!des) {
                    throw `格式错误: ${mdPath}`;
                }
                des = des[1] ? des[1].replace(/\n/g, '') : des[1];
                des = des.replace(/\r/g, '');
                json['d'] = des;
                indexes.push(json);
                commandData[title] = json;
            });
            resolve({
                json: commandData,
                data: indexes,
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * @param {String} fromPath ejs path
 * @param {String} toPath html path
 */
function createTmpToHTML(fromPath, toPath, desJson, mdPath) {
    return new Promise(async (resolve, reject) => {
        try {
            const current_path = path
                .relative(deployDir, toPath)
                .split(path.sep)
                .join('/');
            const tmpStr = await FS.readFile(fromPath);
            let mdPathName = '';
            let mdhtml = '';
            let relative_path = '';
            if (mdPath) {
                // CSS/JS 引用相对地址
                relative_path = '../';
                const mdFileName = desJson.p
                    ? String(desJson.p).replace(/^\//, '')
                    : sanitizeCommandName(desJson.n);
                mdPathName = `/command/${mdFileName}.md`;
                const READMESTR = await FS.readFile(
                    path.resolve(mdPath, `${mdFileName}.md`),
                );
                mdhtml = await markdownToHTML(READMESTR.toString());
            }
            // 生成 HTML
            let html = ejs.render(
                tmpStr.toString(),
                {
                    filename: fromPath,
                    relative_path, // 当前文件相对于根目录的相对路径
                    md_path: mdPathName || '', // markdown 路径
                    mdhtml: mdhtml || '',
                    current_path, // 当前 html 路径
                    describe: desJson ? desJson : {}, // 当前 md 的描述
                    build_version: buildVersion,
                },
                {
                    filename: fromPath,
                },
            );

            await FS.outputFile(toPath, html);
            console.log(
                `  ${'♻️  →'.green} ${path.relative(process.cwd(), toPath)}`,
            );
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function markdownToHTML(str) {
    const html = create({
        rewrite: (node) => {
            if (
                node.type === 'element' &&
                node.properties?.href &&
                /.md/.test(node.properties.href) &&
                !/^(https?:\/\/)/.test(node.properties.href)
            ) {
                let href = node.properties.href;
                node.properties.href = href.replace(
                    /([^\.\/\\]+)\.(md|markdown)/gi,
                    '$1.html',
                );
            }
        },
        markdown: str,
        document: undefined,
        corners: false,
        'dark-mode': false,
    });
    return stripInjectedDarkMode(html);
}

/**
 * [createStylToCss 生成CSS]
 * @param {[type]} stylPath stylus path
 * @param {[type]} cssPath css path
 */
function createStylToCss(stylPath, _cssPath) {
    return new Promise((resolve, reject) => {
        try {
            const stylStr = FS.readFileSync(stylPath, 'utf8');
            stylus(stylStr.toString())
                .set('filename', stylPath)
                .set('compress', true)
                .render((err, css) => {
                    if (err) throw err;
                    resolve(`${css}`);
                });
        } catch (err) {
            reject(err);
        }
    });
}
