/* ============================================================
   B2 图库墨水涟漪（2026-10）

   借鉴 AstraWeb ripple-image / ink-ripple-mask：
   点击图库图片时，以点击点为圆心荡开一圈青色涟漪。

   零依赖 DOM 实现：在 figure 内生成绝对定位圆点，
   CSS 动画放大淡出，结束后自动移除。
   prefers-reduced-motion 时由 CSS 直接隐藏涟漪。
   ============================================================ */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener("click", function (e) {
    var img = e.target instanceof Element ? e.target.closest(".media-item img") : null;
    if (!img) return;
    var item = img.closest(".media-item");
    var r = item.getBoundingClientRect();
    var ripple = document.createElement("span");
    ripple.className = "ink-ripple";
    ripple.style.left = (e.clientX - r.left) + "px";
    ripple.style.top = (e.clientY - r.top) + "px";
    item.appendChild(ripple);
    ripple.addEventListener("animationend", function () { ripple.remove(); }, { once: true });
  });
})();
