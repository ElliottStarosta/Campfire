const TAU = Math.PI * 2;

function initStars(canvas) {
  const ctx  = canvas.getContext('2d');
  const stars = [];
  const count = 180;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars.length = 0;
    for (let i = 0; i < count; i++) {
      stars.push({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height * 0.65,
        r:    0.4 + Math.random() * 1.2,
        base: 0.2 + Math.random() * 0.75,
        phase: Math.random() * TAU,
        speed: 0.3 + Math.random() * 0.8,
        warm:  Math.random() < 0.12, // warm-tinted stars near fire
      });
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Night sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0,   '#03060f');
    grad.addColorStop(0.4, '#060d18');
    grad.addColorStop(0.75,'#100a06');
    grad.addColorStop(1,   '#0b0804');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    t += 0.008;
    stars.forEach(s => {
      const alpha = s.base + Math.sin(t * s.speed + s.phase) * 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fillStyle = s.warm
        ? `rgba(246,196,147,${alpha})`
        : `rgba(238,228,210,${alpha})`;
      ctx.fill();
    });

    // Fire light cast on ground
    const cx = canvas.width / 2;
    const cy = canvas.height;
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.55);
    const flicker = 0.08 + Math.sin(t * 4) * 0.02;
    rg.addColorStop(0,   `rgba(233,149,102,${flicker + 0.07})`);
    rg.addColorStop(0.25,`rgba(185,89,85,${flicker * 0.6})`);
    rg.addColorStop(0.6, `rgba(130,50,30,${flicker * 0.2})`);
    rg.addColorStop(1,   'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

function initEmbers(canvas) {
  const ctx    = canvas.getContext('2d');
  const embers = [];
  const MAX    = 55;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnEmber() {
    const cx = window.innerWidth / 2;
    embers.push({
      x:     cx + (Math.random() - 0.5) * 60,
      y:     window.innerHeight - 30,
      vx:    (Math.random() - 0.5) * 1.2,
      vy:    -(1.5 + Math.random() * 2.5),
      life:  1,
      decay: 0.005 + Math.random() * 0.008,
      r:     0.8 + Math.random() * 2,
      warm:  Math.random(),
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frame++;
    if (frame % 4 === 0 && embers.length < MAX) spawnEmber();

    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.x    += e.vx + Math.sin(frame * 0.05 + i) * 0.3;
      e.y    += e.vy;
      e.vy   *= 0.992;
      e.life -= e.decay;

      if (e.life <= 0 || e.y < -10) { embers.splice(i, 1); continue; }

      const alpha = e.life * 0.9;
      const color = e.warm > 0.5
        ? `rgba(255,${Math.floor(160 + e.warm * 80)},80,${alpha})`
        : `rgba(240,${Math.floor(120 + e.life * 80)},60,${alpha})`;

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * e.life, 0, TAU);
      ctx.fillStyle = color;
      ctx.shadowBlur  = 6;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

function buildTrees(container) {
  // Procedurally built SVG tree line
  container.innerHTML = `
    <svg viewBox="0 0 1440 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#040805" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#020502" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <path fill="url(#treeGrad)" d="
        M0,220 L0,160 L20,145 L35,120 L50,140 L65,100 L80,125
        L100,80  L115,108 L130,60  L145,95  L158,45  L172,80
        L185,30  L200,65  L215,20  L230,55  L248,15  L262,50
        L278,25  L292,58  L308,35  L322,70  L338,42  L352,75
        L368,50  L382,88  L398,62  L412,95  L428,70  L444,105
        L460,78  L476,115 L492,82  L508,118 L522,88  L538,122
        L554,92  L568,128 L582,98  L596,135 L612,105 L628,140
        L644,112 L658,148 L672,118 L688,155 L704,125 L720,158
        L736,128 L750,162 L764,132 L780,165 L796,135 L812,168
        L828,138 L844,172 L860,142 L876,175 L892,145 L908,178
        L924,148 L940,180 L956,150 L972,182 L988,152 L1004,185
        L1020,155 L1036,186 L1052,156 L1068,188 L1084,158 L1100,190
        L1120,160 L1138,188 L1156,158 L1174,185 L1192,155 L1210,182
        L1228,152 L1246,178 L1264,148 L1282,174 L1300,145 L1318,170
        L1336,142 L1354,165 L1372,138 L1390,160 L1410,155 L1440,165
        L1440,220 Z
      "/>
    </svg>
  `;
}

export function initEnvironment() {
  const skyCanvas   = document.getElementById('env-canvas');
  const emberCanvas = document.getElementById('ember-canvas');
  const treesWrap   = document.querySelector('.trees-layer');

  if (skyCanvas)   initStars(skyCanvas);
  if (emberCanvas) initEmbers(emberCanvas);
  if (treesWrap)   buildTrees(treesWrap);
}