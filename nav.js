// Hugo 生成的活动文章位于 announcements/ 子目录；文章页会通过
// data-site-base="../" 告诉导航返回上一级。普通静态页面不设置该属性。
const siteBase = document.body?.dataset.siteBase || "";
window.SITE_NAV_HTML = `
<header class="site-header">
  <nav class="nav" aria-label="主导航">
    <a class="brand" href="${siteBase}index.html" aria-label="返回主页">
      <span class="logo-slot" aria-hidden="true">
        <img src="${siteBase}assets/images/sjtufur_logo1.png" alt="" onerror="this.style.display='none'; this.parentElement.classList.add('is-empty');">
      </span>
      <span>
        <span class="brand-title">上海交通大学 Furry 同好社</span>
        <span class="brand-subtitle">创作 · 交流 · 聚会</span>
      </span>
    </a>

    <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false">
      <span class="theme-icon" aria-hidden="true"></span>
      <span data-theme-label>深夜模式</span>
    </button>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">
      <span class="sr-only">打开导航菜单</span>
      <span></span>
      <span></span>
      <span></span>
    </button>

    <ul class="nav-menu" id="nav-menu">
      <li><a data-page-target="index" href="${siteBase}index.html">主页</a></li>
      <li class="has-submenu">
        <button data-page-target="about" type="button" aria-expanded="false">关于我们</button>
        <ul class="submenu">
          <li><a data-page-target="about" href="${siteBase}about.html">社团简介</a></li>
          <li><a data-page-target="mascot" href="${siteBase}mascot.html">吉祥物与 Logo</a></li>
          <li><a data-page-target="members" href="${siteBase}members.html">成员</a></li>
        </ul>
      </li>
      <li><a data-page-target="join" href="${siteBase}join.html">加入我们</a></li>
      <li><a data-page-target="announcements" href="${siteBase}announcements/index.html">活动动态</a></li>
      <li><a data-page-target="links" href="${siteBase}links.html">外部链接</a></li>
      <li><a data-page-target="gallery" href="${siteBase}gallery.html">多媒体内容</a></li>
    </ul>
  </nav>
</header>
`;
