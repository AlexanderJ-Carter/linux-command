# 贡献者约定

本仓库为 [jaywcjlove/linux-command](https://github.com/jaywcjlove/linux-command) 的 Fork。新增命令或文档建议优先提交至原仓库，以便惠及更多用户。

## 本地预览站点

```bash
npm install
npm run dev
```

同步上游命令文档：

```bash
npm run sync:upstream
```

## 如果您希望提交一个命令

命令的存放位置在 `./command/` 文件夹中

1. 在这里创建一个 `[CommandName].md` 文件，比如 `pacman.md`
2. 打开文件，键入指令在终端中执行的命令
3. 第二行输入三个等号
4. 创建二级标题「补充说明」，并且在这个标题下面创建至少下面几个三级标题
   - 语法
   - 选项
   - 参数

按照预期，文档应该是这样的：

```markdown
CommandName
===

这里是命令介绍，它可以被搜索到

## 补充说明

**CommandName命令** 是用于演示的文档

### 语法

```shell
CommandName <-abcdABCD> <必选参数> [可选参数]
```

### 选项

```shell
-a   # 选项说明
```

### 参数

```shell
参数说明
```
```

提交前请确认 `npm run build` 可通过。
