(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- título: letras entram uma a uma ---------- */
  const h1 = $('.glitch');
  const word = h1.dataset.text;
  h1.innerHTML = [...word].map((c, i) => `<span class="ch" style="--i:${i}" aria-hidden="true">${c}</span>`).join('');

  /* ---------- fundo: rede de partículas lavanda/cinza ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  const mouse = { x: -999, y: -999 };
  const colors = ['#c4b5fd', '#c4b5fd', '#9a9aab', '#d9d9e3'];
  let W, H, pts = [];

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(80, Math.floor((W * H) / 18000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      c: colors[(Math.random() * colors.length) | 0], r: Math.random() * 1.5 + .6
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 130 && d > 0) { p.x += dx / d * 1.3; p.y += dy / d * 1.3; }
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      ctx.fillStyle = a.c; ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.strokeStyle = '#c4b5fd';
          ctx.globalAlpha = (1 - d / 120) * .2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  }
  resize(); draw();
  addEventListener('resize', () => { resize(); if (reduce) draw(); });

  /* ---------- brilho que segue o mouse ---------- */
  const spot = $('.spot');
  addEventListener('pointermove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    spot.style.opacity = 1;
    spot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; spot.style.opacity = 0; });

  /* ---------- parallax das janelas ao rolar ---------- */
  const wins = $$('.win');
  let tick = false;
  const parallax = () => {
    tick = false;
    if (reduce) return;
    for (const w of wins) {
      const r = w.getBoundingClientRect();
      const d = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      w.style.setProperty('--py', (Math.max(-1, Math.min(1, d)) * -26).toFixed(1) + 'px');
    }
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(parallax); } }, { passive: true });
  parallax();

  /* ---------- barra de progresso ---------- */
  const bar = $('.progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- digitação ---------- */
  const typed = $('#typed');
  const phrases = ['Meu site de criações.', 'Design + tecnologia.', 'Projetos que saem do papel.'];
  if (reduce) typed.textContent = phrases[0];
  else {
    let pi = 0, ci = 0, del = false;
    setTimeout(function tick() {
      const t = phrases[pi];
      typed.textContent = t.slice(0, ci);
      if (!del && ci === t.length) { del = true; return setTimeout(tick, 1700); }
      if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      ci += del ? -1 : 1;
      setTimeout(tick, del ? 26 : 62);
    }, 1100);
  }

  /* ---------- reveal ao rolar ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  if (!reduce && fine) {
    /* janelas: inclinam com o mouse */
    $$('.win').forEach(w => {
      w.addEventListener('pointermove', e => {
        const r = w.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        w.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        w.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
      });
      w.addEventListener('pointerleave', () => { w.style.setProperty('--rx', '0deg'); w.style.setProperty('--ry', '0deg'); });
    });

    /* botões magnéticos */
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    /* parallax leve no título */
    addEventListener('scroll', () => {
      if (scrollY < innerHeight) h1.style.transform = `translateY(${scrollY * .18}px)`;
    }, { passive: true });
  }
})();
