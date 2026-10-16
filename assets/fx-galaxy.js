/* ============================================================
   B1 友盟星图（2026-10）

   借鉴 AstraWeb friends-galaxy / star-constellation：
   深色画布上，社团是中心星，伙伴与公开平台环绕成星座，
   悬停点亮节点与连线，点击带链接的节点会跳转。

   布局为归一化坐标（0~1），随画布尺寸缩放；
   背景星点用正弦微光闪烁；节点做极缓慢的呼吸浮动。
   prefers-reduced-motion 时绘制一帧静态星图。
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("galaxy-canvas");
  if (!canvas) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");

  // 节点：链接只使用本站已公开的真实入口
  var NODES = [
    { id: "sjtufur", label: "东川路800号荣毛社", x: 0.50, y: 0.50, r: 9, color: "#f2b84b", link: "index.html", main: true },
    { id: "shcfa", label: "SHCFA 上海高校小动物联盟", x: 0.24, y: 0.26, r: 6, color: "#63d2c9" },
    { id: "shu", label: "上海大学（SHU）伙伴", x: 0.77, y: 0.22, r: 6, color: "#63d2c9" },
    { id: "qq", label: "QQ 群", x: 0.14, y: 0.74, r: 5, color: "#ff8f88", link: "https://qun.qq.com/universal-share/share?ac=1&authKey=Lpyft07bzt5glSMf9cVILulK4S08vy3QSdeiNyIip72hmA33T9ML21E6BHiLBbrR&busi_data=eyJncm91cENvZGUiOiI1NDk1ODUxNTciLCJ0b2tlbiI6IllEWUp0QnltVmRScDVHUjlvYjRBUnF0cDV1N2plL0g2UHhRN2xlcGt5VGdjcWk5eGE5dWVQT0hxS2V6Uk0zK08iLCJ1aW4iOiIzMjE2NzQ4NDcyIn0%3D&data=u7kSG4ZAyzaKoMeQxvI0EgU8evrHqFamID5FpOTZ49BrY9Xj7-LTNBsIBZqqabKHpXe4lZ07AglrtvrXEefsHQ&svctype=4&tempid=h5_group_info" },
    { id: "bili", label: "Bilibili", x: 0.38, y: 0.86, r: 5, color: "#ff8f88", link: "https://space.bilibili.com/3546692796287790" },
    { id: "github", label: "GitHub", x: 0.62, y: 0.86, r: 5, color: "#ff8f88", link: "https://github.com/Rappy325/sjtufur_page" },
    { id: "mail", label: "联系邮箱", x: 0.86, y: 0.72, r: 5, color: "#ff8f88", link: "mailto:sjtufur@163.com" }
  ];

  var width = 0, height = 0, dpr = 1;
  var stars = [];
  var hoverId = null;

  function build() {
    var rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var n = Math.round((width * height) / 6500);
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8
      });
    }
  }

  function nodePos(node, t) {
    // 呼吸浮动：中心节点基本静止，外围节点缓慢漂移
    var amp = node.main ? 2 : 5;
    return {
      x: node.x * width + Math.sin(t * 0.5 + node.x * 9) * amp,
      y: node.y * height + Math.cos(t * 0.4 + node.y * 7) * amp
    };
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);

    // 背景星点
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = reduce ? 0.6 : 0.35 + 0.35 * Math.sin(t * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(237,242,247," + tw.toFixed(3) + ")";
      ctx.fill();
    }

    // 星座连线（中心 ↔ 各节点）
    var center = nodePos(NODES[0], t);
    for (var j = 1; j < NODES.length; j++) {
      var p = nodePos(NODES[j], t);
      var active = hoverId === NODES[j].id || hoverId === "sjtufur";
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = active ? "rgba(99,210,201,0.55)" : "rgba(99,210,201,0.18)";
      ctx.lineWidth = active ? 1.6 : 1;
      ctx.stroke();
      // 连线中点微光
      var mx = (center.x + p.x) / 2, my = (center.y + p.y) / 2;
      ctx.beginPath();
      ctx.arc(mx, my, active ? 2 : 1.3, 0, Math.PI * 2);
      ctx.fillStyle = active ? "rgba(242,184,75,0.8)" : "rgba(242,184,75,0.35)";
      ctx.fill();
    }

    // 节点
    for (var k = 0; k < NODES.length; k++) {
      var node = NODES[k];
      var pos = nodePos(node, t);
      var hovered = hoverId === node.id;
      var glow = node.r * (hovered ? 3.2 : 2.2);

      var g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glow);
      g.addColorStop(0, node.color + (hovered ? "cc" : "88"));
      g.addColorStop(1, node.color + "00");
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, glow, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(237,242,247,0.85)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标签
      ctx.font = (node.main ? "600 14px" : "12px") + " -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = hovered ? "#ffffff" : "rgba(237,242,247,0.78)";
      ctx.fillText(node.label, pos.x, pos.y + node.r + 16);
    }
  }

  function hitTest(x, y) {
    var t = performance.now() / 1000;
    for (var i = 0; i < NODES.length; i++) {
      var pos = nodePos(NODES[i], t);
      if (Math.hypot(x - pos.x, y - pos.y) <= Math.max(14, NODES[i].r + 8)) return NODES[i];
    }
    return null;
  }

  canvas.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    var node = hitTest(e.clientX - r.left, e.clientY - r.top);
    hoverId = node ? node.id : null;
    canvas.style.cursor = node && node.link ? "pointer" : "default";
  }, { passive: true });

  canvas.addEventListener("pointerleave", function () { hoverId = null; });

  canvas.addEventListener("click", function (e) {
    var r = canvas.getBoundingClientRect();
    var node = hitTest(e.clientX - r.left, e.clientY - r.top);
    if (node && node.link) window.open(node.link, "_blank", "noopener");
  });

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 180);
  });

  build();

  if (reduce) {
    draw(0);
    return;
  }

  function loop(nowMs) {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    draw(nowMs / 1000);
  }
  requestAnimationFrame(loop);
})();
