/* ============================================================
   B3 首页 hero 标题粒子汇聚（2026-10，v6 物理 steering 版）

   流程（借鉴 AstraWeb 汇聚思路 + 自然群体运动）：
   1. 粒子初始是标题周围椭圆云团里的白色小点，带缓慢漂移
   2. 按"距离越远越早醒来"错峰激活，steering 寻的：
      速度朝目标方向渐进转向（限幅），叠加随距离衰减的
      切向 swirl，路径呈弧线/螺线，而非直线插值
   3. 接近家时 arrival 减速，落定后切换为呼吸漂浮
   4. 约 2.3s 后 90% 归位 → 实线白字淡入接管，粒子淡出退场

   零依赖原生 canvas；h1 保留原文供无障碍与 SEO，
   粒子画布仅作视觉增强（aria-hidden）。
   深夜模式同样适用；prefers-reduced-motion 完全不加载；
   移动端降低密度与飞行距离。
   ============================================================ */
(function () {
  "use strict";

  var title = document.querySelector(".hero-title");
  if (!title) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // 白色粒子，与实线化后的标题颜色一致，衔接无缝
  var INK = "255,255,255";

  var canvas = document.createElement("canvas");
  canvas.className = "hero-title-canvas";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext("2d");

  var particles = [];
  var width = 0, height = 0, dpr = 1;
  var startedAt = -1;
  var lastMs = -1;
  var frameCount = 0;
  var phase = "assemble"; // assemble → solid
  var debug = { total: 0, landed: 0, phase: phase };
  window.__fxTitle = debug;

  // 落定后的呼吸漂浮：双正弦叠加（engine.ts particleWander）
  function particleWander(seconds, phaseV, amplitude) {
    var t = seconds * (0.7 + phaseV * 0.6), seed = phaseV * 6.2832;
    return {
      x: amplitude * (0.62 * Math.sin(t * 0.49 + seed) + 0.38 * Math.sin(t * 0.91 + seed * 3.7)),
      y: amplitude * (0.58 * Math.sin(t * 0.43 + seed * 2.3) + 0.42 * Math.cos(t * 0.83 + seed * 5.1))
    };
  }

  // 采样标题文字像素（抖动采样，alpha 阈值过滤）
  function sampleText() {
    var rect = title.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cs = getComputedStyle(title);
    var off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    var octx = off.getContext("2d");
    octx.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(title.textContent.trim(), 0, height / 2);

    var rgba = octx.getImageData(0, 0, width, height).data;
    var small = width < 640;
    var gap = 2;
    var limit = small ? 1800 : 4200;
    var pts = [];
    for (var y = 0; y < height; y += gap) {
      for (var x = 0; x < width; x += gap) {
        var sx = Math.min(width - 1, x + Math.floor(Math.random() * gap));
        var sy = Math.min(height - 1, y + Math.floor(Math.random() * gap));
        var offset = (sy * width + sx) * 4;
        var alpha = rgba[offset + 3] / 255;
        if (alpha < 0.08) continue;
        pts.push({ x: sx, y: sy, a: 0.45 + alpha * 0.55 });
      }
    }
    if (pts.length > limit) {
      var kept = new Array(limit);
      for (var i = 0; i < limit; i++) kept[i] = pts[Math.floor(i * pts.length / limit)];
      pts = kept;
    }
    return pts;
  }

  function buildParticles() {
    var pts = sampleText();
    if (pts.length < 60) return false;
    var now = performance.now();
    if (startedAt < 0) startedAt = now;
    lastMs = -1;
    var small = width < 640;
    var cx = width / 2, cy = height / 2;
    var flyR = Math.max(width * (small ? 0.42 : 0.5), 150); // 云团半径
    var maxDelay = 0;
    particles = pts.map(function (p) {
      var ang = Math.random() * 6.2832;
      // 椭圆云团：水平方向散得更开，竖直方向收在标题上下
      var r = flyR * (0.5 + Math.random() * 0.85);
      var sx = cx + Math.cos(ang) * r;
      var sy = cy + Math.sin(ang) * r * 0.42;
      var delay = (r / flyR) * 240 + Math.random() * 420; // 远者先醒
      if (delay > maxDelay) maxDelay = delay;
      return {
        homeX: p.x, homeY: p.y,
        startX: sx, startY: sy,
        // steering 状态（px 与 px/s）
        x: sx, y: sy, vx: 0, vy: 0,
        awake: false, landed: false,
        wakeAt: delay,
        maxSpeed: 320 + Math.random() * 240,   // px/s
        steer: 2.2 + Math.random() * 1.6,      // 转向速率（指数趋近系数）
        swirl: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.7), // 切向强度
        // 云团待命期的缓慢漂移参数
        driftSeed: Math.random() * 6.2832,
        driftAmp: 2 + Math.random() * 2.5,
        // 呼吸漂浮参数
        phase: Math.random(),
        wanderAmp: small ? 0.8 : 1.1,
        size: 0.5 + Math.random() * 0.3,
        baseA: p.a
      };
    });
    debug.total = particles.length;
    debug.maxT = maxDelay + 2400; // 最晚归位时刻(ms)
    return true;
  }

  function frame(nowMs) {
    requestAnimationFrame(frame);
    if (phase === "solid") return; // 实线阶段：粒子已退场，停止循环
    if (lastMs < 0) lastMs = nowMs;
    var dt = Math.min(0.05, (nowMs - lastMs) / 1000); // 秒，钳制防切页跳变
    lastMs = nowMs;
    var elapsed = nowMs - startedAt;
    var seconds = elapsed / 1000;

    ctx.clearRect(0, 0, width, height);
    var landed = 0;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var alpha;

      if (!p.awake) {
        if (elapsed >= p.wakeAt) {
          p.awake = true;
          // 给一个切向初速，让起飞就是弧线而不是静止起步
          var hdx = p.homeX - p.x, hdy = p.homeY - p.y;
          var hd = Math.hypot(hdx, hdy) || 1;
          var t0 = 0.45 * p.swirl;
          p.vx = (hdx / hd) * 40 - (hdy / hd) * 90 * t0;
          p.vy = (hdy / hd) * 40 + (hdx / hd) * 90 * t0;
          p.wakeT = elapsed;
        } else {
          // 待命：云团内缓慢漂移（双正弦），透明度渐显
          var d1 = p.driftSeed;
          p.x = p.startX + p.driftAmp * Math.sin(seconds * 0.7 + d1);
          p.y = p.startY + p.driftAmp * 0.7 * Math.cos(seconds * 0.55 + d1 * 2.3);
          alpha = p.baseA * Math.min(1, elapsed / 450);
          drawDot(p, alpha);
          continue;
        }
      }

      if (p.landed) {
        landed++;
        var w = particleWander(seconds, p.phase, p.wanderAmp);
        alpha = p.baseA * Math.min(1, (elapsed - p.wakeT) / 300);
        drawDotAt(p.homeX + w.x, p.homeY + w.y, p, alpha);
        continue;
      }

      // 目标点 = 家 + 呼吸漂浮（落定前已有轻微跟随）
      var w2 = particleWander(seconds, p.phase, p.wanderAmp * 0.5);
      var tx = p.homeX + w2.x;
      var ty = p.homeY + w2.y;

      var dx = tx - p.x, dy = ty - p.y;
      var dist = Math.hypot(dx, dy) || 1;

      // arrival：远则全速，近则线性减速
      var speed = Math.min(p.maxSpeed, dist * 4.2 + 24);
      // swirl：切向偏转，距离越近越弱，形成弧线/收尾直线
      var sw = p.swirl * Math.min(1, dist / 200) * 0.85;
      var ux = dx / dist, uy = dy / dist;
      var desX = (ux - uy * sw) * speed;
      var desY = (uy + ux * sw) * speed;

      // 速度朝期望方向指数趋近 → 自然弧线
      var k = Math.min(1, p.steer * dt * 3.2);
      p.vx += (desX - p.vx) * k;
      p.vy += (desY - p.vy) * k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // 落定判定：足够近且足够慢
      if (dist < 1.6 && Math.hypot(p.vx, p.vy) < 46) {
        p.landed = true;
        p.x = p.homeX; p.y = p.homeY;
      }

      alpha = p.baseA * Math.min(1, (elapsed - p.wakeT) / 280);
      drawDot(p, alpha);
    }

    if ((frameCount++ & 31) === 0) {
      debug.landed = landed;
    }

    // 汇聚完成（90% 归位且超过 2.3s）：过渡为实线字体，粒子淡出退场
    if (phase === "assemble" && elapsed > 2300 && landed > particles.length * 0.9) {
      beginSolid();
    }
  }

  function drawDot(p, alpha) {
    drawDotAt(p.x, p.y, p, alpha);
  }

  function drawDotAt(x, y, p, alpha) {
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, 6.2832);
    ctx.fillStyle = "rgba(" + INK + "," + alpha.toFixed(3) + ")";
    ctx.fill();
  }

  // 实线化：h1 文字颜色过渡回实色（CSS transition），canvas 淡出后移除
  function beginSolid() {
    phase = "solid";
    debug.phase = "solid";
    title.classList.remove("is-enhanced");
    canvas.style.opacity = "0";
    setTimeout(function () {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", scheduleRebuild);
      canvas.remove();
      particles = [];
    }, 800);
  }

  var resizeTimer = 0;
  var ro = null;
  function scheduleRebuild() {
    if (phase === "solid") return; // 实线化后不再重建
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!buildParticles()) {
        title.classList.remove("is-enhanced");
        canvas.remove();
      }
    }, 250);
  }
  window.addEventListener("resize", scheduleRebuild);
  if (window.ResizeObserver) {
    ro = new ResizeObserver(scheduleRebuild);
    ro.observe(title);
  }

  function start() {
    if (!buildParticles()) return; // 保持纯文字
    title.appendChild(canvas);
    title.classList.add("is-enhanced");
    requestAnimationFrame(frame);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }
})();
