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

  /* ---------- transição entre seções (cortina) ---------- */
  let jumping = false;
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#' ? null : $(id);
    if (!target || reduce || jumping || !started) return;
    e.preventDefault(); jumping = true;
    curtain.dataset.s = 'in';
    setTimeout(() => {
      const top = id === '#inicio' ? 0 : target.getBoundingClientRect().top + scrollY - (id === '#projetos' || id === '#contato' ? 0 : 0);
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, top);
      document.documentElement.style.scrollBehavior = '';
      history.replaceState(null, '', id);
      lastY = scrollY; body.classList.remove('nav-hide'); updateHero();
      setTimeout(() => { curtain.dataset.s = 'out'; setTimeout(() => { jumping = false; }, 650); }, 160);
    }, 620);
  }));

  /* ---------- rolagem: cabeçalho some/volta, hero sobe, marquee acelera ---------- */
  const heroIn = $('.hero-in');
  const mTracks = $$('.marquee .track'), mRows = $$('.marquee .row');
  let lastY = scrollY, vel = 0;
  function updateHero() {
    const p = Math.max(0, Math.min(1, scrollY / (innerHeight * .85)));
    heroIn.style.setProperty('--hp', p.toFixed(3));
  }
  addEventListener('scroll', () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (!jumping) {
      vel += dy;
      if (y > 220 && dy > 3) body.classList.add('nav-hide');
      else if (dy < -3 || y < 220) body.classList.remove('nav-hide');
    }
    if (!reduce) updateHero();
  }, { passive: true });
  if (!reduce) {
    (function loop() {
      vel *= .9;
      const rate = 1 + Math.min(Math.abs(vel) * .18, 7);
      mTracks.forEach(t => { const a = t.getAnimations()[0]; if (a) a.playbackRate = rate; });
      const sk = Math.max(-14, Math.min(14, -vel * .28));
      mRows.forEach(r => { r.style.transform = `skewX(${sk.toFixed(2)}deg)`; });
      requestAnimationFrame(loop);
    })();
  }

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

  /* ---------- faixa de nomes: loop infinito sem emenda ---------- */
  const logoSep = '<span class="sep"><img src="assets/logo.png" alt=""></span>';
  const dotSep = '<span class="sep"></span>';
  const row1 = ['CRIAÇÕES DIGITAIS', 'PLAYBOY', 'BLACKE', 'DESIGN', 'TECNOLOGIA'];
  const row2 = ['Portfólio', 'Br <b>/</b> 2026', 'Soft Downloader', 'Assista Player', 'Blacke IPTV', 'M3U', 'Xtream'];
  function buildMarquee() {
    $$('.marquee .track').forEach((track, n) => {
      const items = n === 0 ? row1 : row2, sep = n === 0 ? logoSep : dotSep;
      const unit = items.map((t, i) => `<span class="it${n === 0 && i % 2 ? ' out' : ''}">${t}</span>${sep}`).join('');
      let reps = 1, grp;
      track.innerHTML = '<div class="grp"></div><div class="grp"></div>';
      const g = track.children;
      do {
        g[0].innerHTML = unit.repeat(reps); g[1].innerHTML = unit.repeat(reps);
        grp = g[0].offsetWidth; reps++;
      } while (grp < innerWidth * 1.15 && reps < 12);
      track.style.setProperty('--dur', (grp / (n === 0 ? 60 : 42)).toFixed(1) + 's');
    });
  }
  buildMarquee();
  let mqW = innerWidth;
  addEventListener('resize', () => { if (innerWidth > mqW * 1.1) { mqW = innerWidth; buildMarquee(); } });

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
  if (reduce || !intro) { if (intro) intro.remove(); start(); }
  else {
    let played = false;
    const play = () => {
      if (played) return; played = true;
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
