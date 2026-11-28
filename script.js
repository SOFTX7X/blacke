(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let startTyping = () => {};
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

  /* ---------- cabeçalho: compacta ao rolar + link ativo ---------- */
  const setScrolled = () => document.body.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', setScrolled, { passive: true }); setScrolled();
  const spyLinks = $$('[data-spy]');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) spyLinks.forEach(a => a.classList.toggle('active', a.dataset.spy === e.target.dataset.sec));
  }), { rootMargin: '-45% 0px -50% 0px' });
  [['.hero', 'inicio'], ['#projetos', 'projetos'], ['#contato', 'contato']].forEach(([s, n]) => {
    const el = $(s); if (el) { el.dataset.sec = n; spy.observe(el); }
  });

  /* ---------- abertura: abre direto, sem tela de carregamento ---------- */
  const body = document.body, curtain = $('.curtain');
  let started = false;
  const start = () => {
    if (started) return; started = true;
    curtain.dataset.s = 'out';
    body.classList.remove('loading');
    body.classList.add('ready');
    startTyping();
  };

  /* ---------- transição entre seções (corte diagonal) ---------- */
  let jumping = false;
  const wipe = document.createElement('div');
  wipe.className = 'wipe'; wipe.setAttribute('aria-hidden', 'true'); body.append(wipe);
  const SK = 'skewX(-16deg)';
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#' ? null : $(id);
    if (!target || reduce || jumping || !started) return;
    e.preventDefault(); jumping = true;
    const w = innerWidth + 600;
    wipe.style.display = 'block'; wipe.style.pointerEvents = 'all';
    const cover = wipe.animate([{ transform: `translateX(${-w - 200}px) ${SK}` }, { transform: `translateX(-300px) ${SK}` }], { duration: 480, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'forwards' });
    cover.onfinish = () => {
      const top = id === '#inicio' ? 0 : target.getBoundingClientRect().top + scrollY;
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo({ top: top, left: 0, behavior: "instant" });
      document.documentElement.style.scrollBehavior = '';
      history.replaceState(null, '', id);
      lastY = scrollY; body.classList.remove('nav-hide'); updateHero();
      const open = wipe.animate([{ transform: `translateX(-300px) ${SK}` }, { transform: `translateX(${innerWidth + 200}px) ${SK}` }], { duration: 560, delay: 120, easing: 'cubic-bezier(.55,0,.2,1)', fill: 'forwards' });
      open.onfinish = () => { open.cancel(); cover.cancel(); wipe.style.display = 'none'; wipe.style.pointerEvents = 'none'; jumping = false; if (window.__cutSnap) window.__cutSnap(); };
    };
  }));

  /* ---------- rolagem: cabeçalho some/volta, hero sobe, marquee acelera ---------- */
  const heroIn = $('.hero-in');
  let lastY = scrollY;
  function updateHero() {
    const p = Math.max(0, Math.min(1, scrollY / (innerHeight * .85)));
    heroIn.style.setProperty('--hp', p.toFixed(3));
  }
  addEventListener('scroll', () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (!jumping) {
      if (y > 220 && dy > 3) body.classList.add('nav-hide');
      else if (dy < -3 || y < 220) body.classList.remove('nav-hide');
    }
    if (!reduce) updateHero();
  }, { passive: true });
  /* ---------- barra de progresso ---------- */
  const bar = $('.progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- digitação ---------- */
  const typed = $('#typed');
  const SITE = window.__SITE || {};
  const phrases = SITE.phrases && SITE.phrases.length ? SITE.phrases : ['Meu site de criações.', 'Design + tecnologia.', 'Projetos que saem do papel.'];
  if (reduce) typed.textContent = phrases[0];
  else {
    let pi = 0, ci = 0, del = false;
    startTyping = () => setTimeout(function tick() {
      const t = phrases[pi];
      typed.textContent = t.slice(0, ci);
      if (!del && ci === t.length) { del = true; return setTimeout(tick, 1700); }
      if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      ci += del ? -1 : 1;
      setTimeout(tick, del ? 26 : 62);
    }, 650);
  }

  /* ---------- porcentagem sobe até o valor ---------- */
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = $('em', e.target), to = +el.dataset.count;
    if (reduce) { el.textContent = to; return; }
    const D = 1800, delay = 450;
    setTimeout(() => {
      const t0 = performance.now();
      (function step(t) {
        const k = Math.min(1, (t - t0) / D);
        el.textContent = Math.round((1 - Math.pow(1 - k, 3)) * to);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }, delay);
  }), { threshold: .6 });
  $$('.prog').forEach(p => countIO.observe(p));

  /* ---------- CORTE: a katana corta as palavras conforme você rola (sobe e desce) ---------- */
  (function () {
    const cut = $('.cut'); if (!cut) return;
    const pin = $('.cut-pin', cut), view = $('.cut-view', cut), wordsEl = $('.cut-words', cut), cv = $('.cut-cv', cut), ctx = cv.getContext('2d'), nEl = $('.cut-n', cut), rail = $('.cut-rail', cut);
    const list = (SITE.marquee && SITE.marquee.length ? SITE.marquee : ['BLACKE']).map(String).filter(t => t.trim());
    const N = list.length, SEG = 78;
    wordsEl.innerHTML = list.map(t => `<div class="cw" aria-hidden="true"><span class="hb">${t}</span><span class="ha">${t}</span></div>`).join('');
    rail.innerHTML = list.map(() => '<i></i>').join('');
    const sr = document.createElement('p'); sr.className = 'sr'; sr.textContent = list.join(', '); cut.append(sr);
    if (reduce) { cut.classList.add('static'); nEl.textContent = ''; return; }

    const TH = -20 * Math.PI / 180, U = { x: Math.cos(TH), y: Math.sin(TH) }, NV = { x: U.y, y: -U.x };
    const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
    let W = 0, H = 0, dpr = 1, items = [], cur = 0, tgt = 0, idx = -1, last = performance.now(), raf = 0;
    const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const SP = list.map((_, i) => { const r = rng(i * 977 + 13); return Array.from({ length: 34 }, () => ({ t: r(), a: (r() < .5 ? -1 : 1) * (80 + r() * 380), b: (r() - .5) * 260, g: 260 + r() * 220, r: .9 + r() * 1.9, w: r() < .35 })); });

    function layout() {
      W = pin.clientWidth; H = pin.clientHeight; dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cut.style.height = ((N - .33) * SEG + 100) + 'vh';
      const els = $$('.cw', wordsEl);
      items = els.map((el, i) => {
        el.style.fontSize = '100px';
        const r = el.offsetWidth / 100, fs = Math.max(28, Math.min(W * .88 / r, H * .34, 260));
        el.style.fontSize = fs + 'px';
        const w = el.offsetWidth, h = el.offsetHeight, cx = w / 2, cy = h / 2, L = Math.hypot(w, h), P0 = [cx - U.x * L, cy - U.y * L], P1 = [cx + U.x * L, cy + U.y * L];
        const poly = k => `polygon(${P0[0]}px ${P0[1]}px,${P1[0]}px ${P1[1]}px,${P1[0] + NV.x * L * k}px ${P1[1] + NV.y * L * k}px,${P0[0] + NV.x * L * k}px ${P0[1] + NV.y * L * k}px)`;
        return { el, a: $('.ha', el), b: $('.hb', el), w, h, pa: poly(1), pb: poly(-1), whole: null, i };
      });
    }

    function draw(pos) {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      ctx.globalCompositeOperation = 'lighter';
      items.forEach(it => {
        const s = pos - it.i; if (s < -.6 || s > 1.2) return;
        const bp = cl((s - .15) / .2), sp = cl((s - .35) / .55), asm = s < -.05 ? cl((-.05 - s) / .5) : 0;
        const Ll = Math.min(W * .62, it.w * .75 + 140), x0 = cx - U.x * Ll, y0 = cy - U.y * Ll, x1 = cx + U.x * Ll, y1 = cy + U.y * Ll;
        // brilho da linha de corte (some quando as metades se afastam, volta quando se juntam)
        const gap = bp >= 1 ? (1 - sp) : bp > 0 ? 1 : 0, join = asm > 0 ? (1 - asm) * .55 : 0, flash = asm > 0 && asm < .2 ? (1 - asm / .2) : 0;
        const la = Math.max(gap * .9, join, flash);
        if (la > .01) {
          ctx.lineCap = 'round';
          ctx.strokeStyle = `rgba(196,181,253,${(la * .22).toFixed(3)})`; ctx.lineWidth = 14 + flash * 18; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,255,${(la * .9).toFixed(3)})`; ctx.lineWidth = 1.6 + flash * 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        // lâmina cruzando
        if (bp > 0 && bp < 1) {
          const hx = x0 + (x1 - x0) * bp, hy = y0 + (y1 - y0) * bp, tb = Math.max(0, bp - .5), tx = x0 + (x1 - x0) * tb, ty = y0 + (y1 - y0) * tb;
          const g = ctx.createLinearGradient(tx, ty, hx, hy); g.addColorStop(0, 'rgba(196,181,253,0)'); g.addColorStop(.7, 'rgba(196,181,253,.55)'); g.addColorStop(1, 'rgba(255,255,255,1)');
          ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
          const rg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 46); rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(.25, 'rgba(196,181,253,.5)'); rg.addColorStop(1, 'rgba(196,181,253,0)');
          ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(hx, hy, 46, 0, 7); ctx.fill();
        }
        // faíscas
        SP[it.i].forEach(p => {
          const age = s - (.15 + .2 * p.t); if (age < 0 || age > .6) return;
          const tau = age * 1.5, k = 1 - age / .6, px = x0 + (x1 - x0) * p.t + U.x * p.a * tau + NV.x * p.b * tau, py = y0 + (y1 - y0) * p.t + U.y * p.a * tau + NV.y * p.b * tau + p.g * tau * tau * .5;
          ctx.fillStyle = p.w ? `rgba(255,255,255,${(k * k).toFixed(3)})` : `rgba(196,181,253,${(k * k).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(px, py, p.r * (.4 + k), 0, 7); ctx.fill();
        });
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    function render(pos, lag) {
      const D = Math.min(W * .5, 640);
      items.forEach(it => {
        const s = pos - it.i;
        if (s < -.6 || s > 1.0) { if (it.el.style.visibility !== 'hidden') it.el.style.visibility = 'hidden'; return; }
        it.el.style.visibility = 'visible';
        const asm = s < -.05 ? cl((-.05 - s) / .5) : 0, sp = cl((s - .35) / .55), out = 1 - Math.pow(1 - sp, 3);
        const off = D * out - D * asm * asm, rot = 5 * out - 5 * asm * asm;
        const alpha = (1 - Math.pow(sp, 1.4)) * (1 - Math.pow(asm, 1.5));
        const whole = off === 0 && rot === 0;
        if (whole) {
          if (it.whole !== true) { it.a.style.display = 'none'; it.b.style.clipPath = 'none'; it.b.style.transform = 'none'; it.whole = true; }
        } else {
          if (it.whole !== false) { it.a.style.display = ''; it.a.style.clipPath = it.pa; it.b.style.clipPath = it.pb; it.whole = false; }
          it.a.style.transform = `translate3d(${(-U.x * off).toFixed(1)}px,${(-U.y * off).toFixed(1)}px,0) rotate(${(-rot).toFixed(2)}deg)`;
          it.b.style.transform = `translate3d(${(U.x * off).toFixed(1)}px,${(U.y * off).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`;
        }
        it.el.style.opacity = alpha.toFixed(3);
        const pre = cl((s + .05) / .2), glow = 1 - cl((s - .15) / .25);
        it.el.style.setProperty('--glow', (.25 + .75 * pre * glow).toFixed(2));
      });
      // tremor no instante do corte (qualquer palavra)
      let sh = 0; items.forEach(it => { const s = pos - it.i, b = Math.max(0, 1 - Math.abs(s - .34) / .045); if (b > sh) sh = b * Math.sin(s * 220); });
      view.style.transform = sh ? `translate3d(${(sh * 7).toFixed(1)}px,${(sh * -4).toFixed(1)}px,0)` : '';
      wordsEl.style.transform = `skewX(${cl(-lag * 16, -7, 7).toFixed(2)}deg)`;
      const ni = cl(Math.floor(pos + .45), 0, N - 1);
      if (ni !== idx) { idx = ni; nEl.textContent = String(ni + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); $$('i', rail).forEach((t, k) => t.classList.toggle('on', k === ni)); }
    }

    function frame(t) {
      raf = 0;
      const dt = Math.min(.05, (t - last) / 1000); last = t;
      const lag = tgt - cur; cur += lag * (1 - Math.pow(.0008, dt));
      render(cur, tgt - cur); draw(cur);
      if (Math.abs(tgt - cur) > .0006) raf = requestAnimationFrame(frame);
    }
    function onScroll() {
      if (jumping) { cut.style.visibility = 'hidden'; return; }   // clique no menu: a cena não toca por baixo da transição
      const r = cut.getBoundingClientRect(), total = cut.offsetHeight - pin.clientHeight, nt = -.05 + cl(-r.top / total) * (N - .33);
      if (r.bottom < -200 || r.top > innerHeight + 200) { tgt = cur = nt; return; }
      const big = Math.abs(nt - tgt) > 1.2;                       // salto grande (link/âncora): vai direto, sem animar
      tgt = nt;
      if (big) { cur = tgt; render(cur, 0); draw(cur); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }
    window.__cutSnap = () => { cut.style.visibility = ''; const r = cut.getBoundingClientRect(), total = cut.offsetHeight - pin.clientHeight; tgt = cur = -.05 + cl(-r.top / total) * (N - .33); render(cur, 0); draw(cur); };
    layout(); cur = tgt = -.05; onScroll(); cur = tgt; render(cur, 0); draw(cur);
    addEventListener('scroll', onScroll, { passive: true });
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layout(); items.forEach(i => { i.whole = null; }); onScroll(); render(cur, 0); draw(cur); }, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); items.forEach(i => { i.whole = null; }); onScroll(); cur = tgt; render(cur, 0); draw(cur); });
  })();

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

  }
  /* ---------- abertura: corte de katana (espera o carregamento real) ---------- */
  const intro = $('.intro');
  const seen = document.documentElement.classList.contains('seen');
  if (reduce || !intro || seen) { if (intro) intro.remove(); start(); }
  else {
    let played = false;
    const play = () => {
      if (played) return; played = true;
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
      intro.classList.add('go');
      setTimeout(() => { intro.classList.add('open'); start(); }, 340);
      setTimeout(() => intro.remove(), 1700);
    };
    const minTime = new Promise(r => setTimeout(r, 1700));
    const loaded = new Promise(r => {
      if (document.readyState === 'complete') r(); else addEventListener('load', r, { once: true });
      setTimeout(r, 4500);
    });
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([minTime, loaded, fonts]).then(play);
    intro.addEventListener('click', play);
    setTimeout(play, 6500);
  }
})();
