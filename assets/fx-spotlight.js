/* ============================================================
   A5 聚光灯揭示立绘（2026-10）

   借鉴 AstraWeb character-portrait-reveal：
   立绘默认压暗（剪影质感），指针移动时用径向渐变光圈
   揭示原图局部，离开后回到暗态。

   实现要点（源自 AstraWeb 的独立透明层技巧）：
   - 底层只画一次"压暗版"；
   - 揭示层每次指针移动重画：先画原图局部 patch，
     再用径向渐变做 destination-in 裁剪，最后叠到底层上；
   - 两层互不干扰，不会产生半透明边缘反复叠加的脏边。

   手机端 pointermove（触屏拖动）可用，纵向滚动不受影响
   （touch-action: pan-y）；prefers-reduced-motion 直接不加载，
   原图保持可见。
   ============================================================ */
(function () {
  "use strict";

  var img = document.querySelector("img[data-spotlight]");
  if (!img) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var wrap = document.createElement("div");
  wrap.className = "spotlight-wrap";
  img.parentNode.insertBefore(wrap, img);
  wrap.appendChild(img);

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  wrap.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var hint = document.createElement("span");
  hint.className = "spotlight-hint";
  hint.textContent = "移动指针，照亮立绘";
  wrap.appendChild(hint);

  var base = document.createElement("canvas");     // 压暗层
  var patch = document.createElement("canvas");    // 揭示 patch
  var dpr = 1, w = 0, h = 0, radius = 170;
  var last = { x: -1, y: -1 };

  function paintBase() {
    var bctx = base.getContext("2d");
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, w, h);
    bctx.drawImage(img, 0, 0, w, h);
    bctx.fillStyle = "rgba(13, 18, 28, 0.84)";
    bctx.fillRect(0, 0, w, h);
  }

  function resize() {
    w = wrap.clientWidth;
    h = wrap.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    radius = window.innerWidth <= 760 ? 115 : 170;
    canvas.width = base.width = Math.round(w * dpr);
    canvas.height = base.height = Math.round(h * dpr);
    patch.width = patch.height = Math.round((radius * 2 + 8) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBase();
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(base, 0, 0, w, h);
  }

  function illuminate(x, y) {
    if (Math.hypot(x - last.x, y - last.y) < 2) return;
    last = { x: x, y: y };
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(base, 0, 0, w, h);

    var size = radius * 2 + 8;
    var pctx = patch.getContext("2d");
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, size, size);
    if (x < -radius || y < -radius || x > w + radius || y > h + radius) return;

    // 先画原图局部，再用径向渐变 destination-in 裁出光圈
    pctx.globalCompositeOperation = "source-over";
    pctx.drawImage(img, -(x - radius - 4), -(y - radius - 4), w, h);
    var g = pctx.createRadialGradient(radius + 4, radius + 4, 0, radius + 4, radius + 4, radius);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.26, "rgba(0,0,0,1)");
    g.addColorStop(0.5, "rgba(0,0,0,0.85)");
    g.addColorStop(0.76, "rgba(0,0,0,0.32)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    pctx.globalCompositeOperation = "destination-in";
    pctx.fillStyle = g;
    pctx.fillRect(0, 0, size, size);
    pctx.globalCompositeOperation = "source-over";

    ctx.drawImage(patch, (x - radius - 4), (y - radius - 4), size, size);
    hint.dataset.faded = "true";
  }

  wrap.addEventListener("pointermove", function (e) {
    var r = wrap.getBoundingClientRect();
    illuminate(e.clientX - r.left, e.clientY - r.top);
  }, { passive: true });

  wrap.addEventListener("pointerleave", function () {
    last = { x: -1, y: -1 };
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(base, 0, 0, w, h);
  });

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  });

  function boot() {
    resize();
    requestAnimationFrame(function () { resize(); }); // 等待布局稳定
  }

  if (img.complete && img.naturalWidth) boot();
  else img.addEventListener("load", boot, { once: true });
})();
