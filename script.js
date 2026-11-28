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
      open.onfinish = () => { open.cancel(); cover.cancel(); wipe.style.display = 'none'; wipe.style.pointerEvents = 'none'; jumping = false; };
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

  /* ---------- faixa em movimento: acompanha a rolagem (sobe/desce), leve ---------- */
  (function () {
    const box = $('.mq'); if (!box) return;
    const rows = $$('.mq-row', box).map(r => ({ el: r, tr: r.firstElementChild, dir: +r.dataset.dir, x: 0, w: 0 }));
    const measure = () => rows.forEach(r => { r.w = r.tr.scrollWidth / r.tr.children.length; });
    measure(); addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if (reduce) return;
    let vis = false, raf = 0, last = 0, ly = scrollY, vel = 0, sk = 0;
    const frame = t => {
      const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
      const dy = scrollY - ly; ly = scrollY;
      vel += ((dy / dt) - vel) * Math.min(1, dt * 7);                 // velocidade da rolagem, suavizada
      const push = Math.max(-1400, Math.min(1400, vel));
      sk += ((-push * .0035) - sk) * Math.min(1, dt * 8);             // inclinação leve, limitada
      rows.forEach(r => {
        r.x -= r.dir * (38 + push * .35) * dt;
        if (r.w) { r.x %= r.w; if (r.x > 0) r.x -= r.w; }
        r.tr.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0)';
        r.el.style.setProperty('--sk', (sk * (r.dir > 0 ? 1 : -1)).toFixed(2) + 'deg');
      });
      raf = vis ? requestAnimationFrame(frame) : 0;
    };
    new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !raf) { last = performance.now(); ly = scrollY; raf = requestAnimationFrame(frame); } }, { rootMargin: '120px' }).observe(box);
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
