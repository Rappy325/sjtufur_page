# 活动动态发布教程

本网站的“活动动态”使用 Hugo 生成。新增 Markdown 文件后，通过 Pull Request 合并到 `main` 分支，GitHub Actions 就会自动构建和发布网页。请不要直接推送到 `main`。

## 第一次配置

### 1. 修改 Hugo 地址

打开 `hugo/config.toml`，把示例地址改成实际的 GitHub Pages 地址：

```toml
baseURL = "https://你的用户名.github.io/你的仓库名/"
```

例如：

```toml
baseURL = "https://sjtu-furry.github.io/sjtu-furry-site/"
```

### 2. 在 GitHub 开启 Pages

1. 把网站目录上传到 GitHub 仓库的 `main` 分支。
2. 打开仓库的 `Settings` → `Pages`。
3. 在 `Build and deployment` → `Source` 中选择 `GitHub Actions`。
4. 打开仓库的 `Actions` 页面，等待 `Build and deploy GitHub Pages` 变成绿色。
5. 访问 `https://你的用户名.github.io/你的仓库名/`。

如果还没有推送过本地目录，可以在网站目录打开 PowerShell：

```powershell
git init -b main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git add .
git commit -m "初始化社团网站"
git push -u origin main
```

如果 `git init -b main` 不支持，使用：

```powershell
git init
git branch -M main
```

## 新增一篇活动动态

### 1. 复制 Markdown 模板

复制：

```text
hugo/content/announcements/2026-09-welcome.md
```

例如改名为：

```text
hugo/content/announcements/2026-10-autumn-meetup.md
```

文件名建议只使用英文、数字和连字符。

### 2. 修改文章信息

文件开头的内容称为 front matter：

```yaml
---
title: "秋季线下聚会报名通知"
date: 2026-10-12T19:00:00+08:00
draft: false
tags: ["线下活动", "报名"]
summary: "活动列表中显示的一句话简介。"
---
```

字段说明：

- `title`：活动标题。
- `date`：发布时间，列表按日期从新到旧排序。
- `draft`：`true` 是草稿，不公开；发布时改为 `false`。
- `tags`：活动标签，可写一个或多个。
- `summary`：列表页显示的摘要。

### 3. 用 Markdown 写正文

```markdown
## 活动信息

- 时间：2026 年 10 月 12 日 19:00
- 地点：闵行校区某教室
- 报名：填写报名表后加入活动群

## 活动内容

本次活动包括自我介绍、角色设定交流和自由绘画。

## 注意事项

请遵守场地规定，并提前确认报名信息。
```

常用写法：

```markdown
**加粗文字**
[报名表](https://example.com)
![活动海报](poster.jpg)
```

图片可以放在文章目录中：

```text
hugo/content/announcements/2026-10-autumn-meetup/index.md
hugo/content/announcements/2026-10-autumn-meetup/poster.jpg
```

正文中使用 `![活动海报](poster.jpg)` 即可。

## 日常推送（Pull Request 流程）

所有改动都通过 Pull Request 合并到 `main`，不要直接推送 `main`。

在网站根目录执行：

```powershell
git checkout main
git pull
git checkout -b feature/my-update
```

修改文件后提交并推送分支：

```powershell
git status
git add hugo/content/announcements
git commit -m "发布秋季线下聚会通知"
git push -u origin feature/my-update
```

如果同时修改了样式、导航或其他页面：

```powershell
git add .
git commit -m "更新社团网站"
git push
```

推送前建议查看将要提交的文件：

```powershell
git status
git diff --cached
```

然后在 GitHub 仓库页面为该分支创建 Pull Request（base 选 `main`），确认无误后合并。合并后进入仓库的 `Actions` 页面，等待构建和部署都显示绿色。网站可能需要几十秒到几分钟更新；浏览器仍显示旧内容时按 `Ctrl + F5`。

## 发布前检查

- 改动通过 Pull Request 合并到 `main`，没有直接推送 `main`。
- `title`、`date`、`summary` 已填写。
- 要公开的文章使用 `draft: false`。
- 时间、地点、报名截止时间正确。
- 报名链接可以打开。
- 图片路径和文件名大小写一致。
- 没有公开私人联系方式或未经同意的成员信息。
- `git status` 没有显示其他项目文件。

## 常见问题

### 文章没有出现

检查文件是否位于 `hugo/content/announcements/`，front matter 是否被两个 `---` 包围，`draft` 是否为 `false`，以及 GitHub Actions 是否成功。

### GitHub Actions 失败

检查 `hugo/config.toml` 的 `baseURL`、Pages 来源是否为 `GitHub Actions`、分支是否为 `main`，以及 YAML 缩进是否正确。

### Git 要求登录

GitHub 不再接受普通账号密码作为 Git 密码。可以使用 GitHub Desktop 登录，或按照 GitHub 提示配置浏览器认证、个人访问令牌或 SSH。

### 旧的 `announcements.html` 怎么办

它只是兼容旧链接的跳转页。以后不要在其中写活动内容，所有活动都放在 `hugo/content/announcements/`。

