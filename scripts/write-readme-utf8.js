const fs = require('fs');
const path = require('path');

const content = `> **Fork 自** [**jaywcjlove/linux-command**](https://github.com/jaywcjlove/linux-command)，感谢 [@jaywcjlove](https://github.com/jaywcjlove)。原仓库为 Linux 命令大全，采用 MIT 协议。Fork 仅作学习与备份，版权归原作者。

<hr>

<p align="center">
  <a href="https://jaywcjlove.github.io/linux-command">
    <img src="./template/img/banner.svg?sanitize=true">
  </a>
  <h1>Linux Command</h1>
</p>

[![GitHub](https://img.shields.io/badge/GitHub-jaywcjlove%2Flinux--command-333?logo=github)](https://github.com/jaywcjlove/linux-command)
[![NPM](https://img.shields.io/npm/dm/linux-command.svg?style=flat)](https://www.npmjs.com/package/linux-command)
[![Docker](https://img.shields.io/docker/image-size/wcjiang/linux-command?logo=docker)](https://hub.docker.com/r/wcjiang/linux-command)

当前仓库搜集了 600 多个 Linux 命令，生成 Web 站点便于查阅，内容包含 Linux 命令手册、详解与学习，来自网络与网友补充，适合作为速查手册。版权归原作者，Fork 仅作学习与备份。

## Web 版本

- **在线地址**：[https://jaywcjlove.github.io/linux-command/](https://jaywcjlove.github.io/linux-command/) 或 https://git.io/linux
- **镜像站点**：可参见 [镜像站 #649](https://github.com/jaywcjlove/linux-command/issues/649#issue-3141950597)
- **自行部署**：可克隆 [gh-pages](https://github.com/jaywcjlove/linux-command/tree/gh-pages) 或使用下方 Docker、Vercel、Netlify 等方式

**推荐镜像** [hycer.cn](https://linux.hycer.cn) · [chaoxi.online](https://linux.chaoxi.online) · [alapi.cn](https://linux.alapi.cn) · [srebro.cn](https://linux.srebro.cn/) 等，更多见 [镜像 #649](https://github.com/jaywcjlove/linux-command/issues/649#issue-3141950597)

## 其它版本

Chrome 插件、Alfred、Dash、Krunner、Android 等见 [原仓库 README](https://github.com/jaywcjlove/linux-command#%E5%85%B6%E5%AE%83%E7%89%88%E6%9C%AC)。

## Docker 部署

[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/wcjiang/linux-command?logo=docker)](https://hub.docker.com/r/wcjiang/linux-command) [![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/wcjiang/linux-command?logo=docker)](https://hub.docker.com/r/wcjiang/linux-command) [![Docker Pulls](https://img.shields.io/docker/pulls/wcjiang/linux-command?logo=docker)](https://hub.docker.com/r/wcjiang/linux-command)

通过 Docker 部署 linux-command 网站：

\`\`\`bash
docker pull wcjiang/linux-command
\`\`\`

\`\`\`bash
docker run --name linux-command --rm -d -p 9665:3000 wcjiang/linux-command:latest
# Or
docker run --name linux-command -itd -p 9665:3000 wcjiang/linux-command:latest
\`\`\`

在浏览器中访问：

\`\`\`bash
http://localhost:9665/
\`\`\`

## Vercel / Netlify

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jaywcjlove/linux-command) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jaywcjlove/linux-command)

宝塔面板、1Panel 等部署步骤见 [原仓库 README](https://github.com/jaywcjlove/linux-command)。

## Linux 命令分类

*[command](./command) 目录为 Markdown 命令文档，可生成 HTML 并在 [在线站](https://jaywcjlove.github.io/linux-command/) 搜索查看。*

### 文件传输

bye、ftp、ftpcount、ftpshut、ftpwho、ncftp、tftp、uucico、uucp、uupick、uuto、scp

### 备份压缩

ar、bunzip2、bzip2、bzip2recover、compress、cpio、dump、gunzip、gzexe、gzip、lha、restore、tar、unarj、unzip、zip、zipinfo

### 文件管理

diff、diffstat、file、find、git、gitview、ln、locate、lsattr、mattrib、mc、mcopy、mdel、mdir、mktemp、mmove、mread、mren、mshowfat、mtools、mtoolstest、mv、od、paste、patch、rcp、rhmask、rm、slocate、split、tee、tmpwatch、touch、umask、whereis、which、cat、chattr、chgrp、chmod、chown、cksum、cmp、cp、cut、indent

### 磁盘管理

cd、df、dirs、du、edquota、eject、lndir、ls、mcd、mdeltree、mdu、mkdir、mlabel、mmd、mmount、mrd、mzip、pwd、quota、quotacheck、quotaoff、quotaon、repquota、rmdir、rmt、stat、tree、umount

### 磁盘维护

badblocks、cfdisk、dd、e2fsck、ext2ed、fdisk、fsck.ext2、fsck、fsck.minix、fsconf、hdparm、losetup、mbadblocks、mformat、mkbootdisk、mkdosfs、mke2fs、mkfs.ext2、mkfs、mkfs.minix、mkfs.msdos、mkinitrd、mkisofs、mkswap、mpartition、sfdisk、swapoff、swapon、symlinks、sync

### 系统设置

alias、apmd、aumix、bind、chkconfig、chroot、clock、crontab、declare、depmod、dircolors、dmesg、enable、eval、export、fbset、grpconv、grpunconv、hwclock、insmod、kbdconfig、lilo、liloconfig、lsmod、minfo、mkkickstart、modinfo、modprobe、mouseconfig、ntsysv、passwd、pwconv、pwunconv、rdate、resize、rmmod、rpm、set、setconsole、setenv、setup、sndconfig、SVGAText Mode、timeconfig、ulimit、unalias、unset

### 系统管理

adduser、chfn、chsh、date、exit、finger、free、fwhois、gitps、groupdel、groupmod、halt、id、kill、last、lastb、login、logname、logout、logrotate、newgrp、nice、procinfo、ps、pstree、reboot、renice、rlogin、rsh、rwho、screen、shutdown、sliplogin、su、sudo、suspend、swatch、tload、top、uname、useradd、userconf、userdel、usermod、vlock、w、who、whoami、whois

### 文本处理

awk、col、colrm、comm、csplit、ed、egrep、ex、fgrep、fmt、fold、grep、ispell、jed、joe、join、look、mtype、pico、rgrep、sed、sort、spell、tr、uniq、vi、wc

### 网络通讯

dip、getty、mingetty、ppp-off、smbd(samba daemon)、telnet、uulog、uustat、uux、cu、dnsconf、efax、httpd、ip、ifconfig、mesg、minicom、nc、netconf、netconfig、netstat、ping、ping6、pppstats、samba、setserial、shapecfg(shaper configuration)、smbd(samba daemon)、statserial(status ofserial port)、talk、tcpdump、testparm(test parameter)、traceroute、tty(teletypewriter)、uuname、wall(write all)、write、ytalk、arpwatch、apachectl、smbclient(samba client)、pppsetup

### 设备管理

dumpkeys、loadkeys、MAKEDEV、rdev、setleds

### 电子邮件与新闻组

archive、ctlinnd、elm、getlist、inncheck、mail、mailconf、mailq、messages、metamail、mutt、nntpget、pine、slrn、X WINDOWS SYSTEM、reconfig、startx(start X Window)、Xconfigurator、XF86Setup、xlsatoms、xlsclients、xlsfonts

### 其他命令

yes

## 开发使用

可通过 npm 安装 [linux-command](https://www.npmjs.com/package/linux-command)，包含所有命令的 markdown 与 [索引文件](dist/data.json)。

\`\`\`bash
npm install linux-command
\`\`\`

\`\`\`js
var comm = require("linux-command");
console.log("---->", comm.ls);

var alias = require("linux-command/command/alias.md");
console.log("---->", alias);
\`\`\`

也可通过 CDN [UNPKG](https://unpkg.com/linux-command/) 获取。

\`\`\`shell
# 命令索引 JSON
https://unpkg.com/linux-command/dist/data.json
# 对应命令详情（Markdown）
https://unpkg.com/linux-command/command/<命令名称>.md
\`\`\`

或通过 Github Raw 获取最新内容。

\`\`\`shell
# 命令索引 JSON
https://raw.githubusercontent.com/jaywcjlove/linux-command/master/dist/data.json
# 对应命令详情（Markdown）
https://raw.githubusercontent.com/jaywcjlove/linux-command/master/command/<命令名称>.md
\`\`\`

## Linux 学习资源

### 社区网站

- [Linux 中国](https://linux.cn/) — 资讯、文章、技术
- [LabEx](https://labex.io/) — Linux 在线环境与实验
- [鸟哥的 linux 私房菜](http://linux.vbird.org/) — 入门教程
- [Linux 公社](http://www.linuxidc.com/) — 新闻、教程、主题等
- [Linux Today](http://www.linuxde.net) — 资讯与学习
- [X-CMD](https://www.x-cmd.com/) — Shell + AWK 增强与命令教程

### 知识相关

- [Linux 思维导图整理](http://www.jianshu.com/p/59f759207862)
- [Linux 初学者进阶学习资源](http://www.jianshu.com/p/fe2a790b41eb)
- [Linux 新手入门（动手实验）](https://labex.io/zh/courses/linux-for-noobs)
- [【译】Linux 概念架构的理解](http://www.jianshu.com/p/c5ae8f061cfe) [En](http://oss.org.cn/ossdocs/linux/kernel/a1/index.html)
- [Linux 守护进程的启动方法](http://www.ruanyifeng.com/blog/2016/02/linux-daemon.html)
- [Linux 知识点小结](https://blog.huachao.me/2016/1/Linux%E7%9F%A5%E8%AF%86%E7%82%B9%E5%B0%8F%E7%BB%93/)
- [10 大白帽黑客专用的 Linux 操作系统](https://linux.cn/article-6971-1.html)

### 软件工具

- [超赞的 Linux 软件](https://github.com/alim0x/Awesome-Linux-Software-zh_CN) / Awesome Linux Software
- 更多替代品见原仓库 README

## 致谢

感谢 [@jaywcjlove](https://github.com/jaywcjlove) 及所有 [Contributors](https://github.com/jaywcjlove/linux-command/graphs/contributors)。

## License

Licensed under the MIT License.
`;

const outPath = path.join(process.cwd(), 'README.md');
fs.writeFileSync(outPath, content, { encoding: 'utf8' });
console.log('README.md written as UTF-8 to', outPath);
