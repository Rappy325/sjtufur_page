# 上海交通大学 Furry 同好社主页

这是一个可直接部署到 GitHub Pages 的纯静态多页面网站框架，不需要安装依赖或执行构建命令。页面中的资料目前以占位内容为主，每个主要填写区都附有 HTML 注释。

## 文件结构

```text
.
├── index.html
├── about.html
├── mascot.html
├── members.html
├── join.html
├── announcements.html    # 旧地址跳转页
├── links.html
├── gallery.html
├── styles.css
├── nav.js              # 全站共用导航栏（修改这里即可同步所有页面）
├── script.js
├── hugo/                # 活动动态 Markdown 博客
│   ├── content/announcements/
│   └── layouts/announcements/
├── .github/workflows/hugo-pages.yml
└── assets/
    └── images/
        └── sjtufur_logo1.png
```

## 各页面填写位置

- `index.html`：主页欢迎语、轮播图、近期活动动态摘要和内容预览。
- `about.html`：社团简介。
- `mascot.html`：吉祥物与 Logo 背景说明。
- `members.html`：负责人资料与全体社员名录。
- `join.html`：校内与校外加入方式。
- `announcements/`：由 Hugo 自动生成的活动动态 Markdown 博客。
- `links.html`：QQ 群、Bilibili、GitHub、邮箱等外部入口。
- `gallery.html`：活动相册、成员作品和视频内容。
- 所有页面顶部都提供“深夜模式”切换按钮，选择会保存在浏览器本地。

## 修改导航栏

导航栏统一写在 `nav.js` 的 `window.SITE_NAV_HTML` 模板中。所有页面只保留
`<div data-site-nav-slot></div>` 挂载点，并在页面底部依次加载 `nav.js`、`script.js`，
因此只需修改 `nav.js`，刷新任意页面即可同步更新。`nav.html` 是便于查看的静态预览副本，
不参与页面加载。

打开对应文件并搜索 `<!--`，即可找到中文维护注释。复制示例区块时，应复制从开始标签到结束标签的完整内容，避免破坏页面结构。

完整的 GitHub 推送和活动发布步骤请参阅 [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md)。

## Logo 和图片

- 现有社团 Logo 文件名为 `sjtufur_logo1.png`，放到 `assets/images/`，所有页面都会自动使用它。
- 其他图片也放在 `assets/images/`。建议使用英文小写文件名，例如 `welcome-meeting-2026.jpg`。
- 替换图片占位块的示例已经写在 `index.html`、`about.html`、`mascot.html` 和 `gallery.html` 的注释中。
- 外部链接中的 `href="#"` 是占位值，发布前必须替换为真实地址。

## 本地预览

这个网站可以直接双击 `index.html` 预览。通过导航栏检查各个页面，并在桌面和手机宽度下确认文字与图片显示正常。
直接打开时，`announcements/index.html` 是 Hugo 构建前的本地兼容页面；正式部署到 GitHub Pages 后，该地址会由 Hugo 自动生成的活动动态列表替换。为兼容本地双击预览，导航链接使用完整的 `announcements/index.html` 路径。

## GitHub Pages 部署

1. 将本目录提交到 GitHub 仓库，并把 `hugo/config.toml` 中的 `baseURL` 改成你的 GitHub Pages 地址。
2. 在仓库 `Settings → Pages` 的发布来源选择 `GitHub Actions`。
3. 以后新增或修改 `hugo/content/announcements/` 下的 `.md` 文件，通过 Pull Request 合并到 `main` 后，Action 会自动构建和发布。

### 新增一篇活动动态

复制 `hugo/content/announcements/2026-09-welcome.md`，改文件名和 front matter：

```yaml
---
title: "活动标题"
date: 2026-10-01T19:00:00+08:00
draft: false
tags: ["线下活动"]
summary: "列表页显示的一句话摘要"
---
```

`draft: true` 的文章不会公开显示；准备发布时改成 `false`，然后提交并走 Pull Request 合并到 `main` 即可。
