(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- fundo: rede de partículas neon ---------- */
  const cv = document.getElementById('bg');
  const ctx = cv.getContext('2d');
  const mouse = { x: -999, y: -999 };
  let W, H, dpr, pts = [];
  const colors = ['#00f0ff', '#ff2bd6', '#39ff88'];

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((W * H) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      c: colors[(Math.random() * 3) | 0], r: Math.random() * 1.6 + .7
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140) { p.x += dx / d * 1.4; p.y += dy / d * 1.4; }
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      ctx.fillStyle = a.c; ctx.shadowColor = a.c; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = a.c;
          ctx.globalAlpha = (1 - d / 130) * .28;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  addEventListener('resize', resize);
  if (reduce) { draw = () => {}; }
  requestAnimationFrame(draw);

  /* ---------- brilho que segue o mouse ---------- */
  const glow = document.querySelector('.cursor');
  addEventListener('pointermove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    glow.style.opacity = 1;
    glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }, { passive: true });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; glow.style.opacity = 0; });

  /* ---------- barra de progresso ---------- */
  const bar = document.querySelector('.progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- digitação ---------- */
  const typed = document.getElementById('typed');
  const phrases = ['Meu site de criações.', 'Design + tecnologia.', 'Projetos que saem do papel.'];
  if (reduce) { typed.textContent = phrases[0]; }
  else {
    let pi = 0, ci = 0, del = false;
    (function tick() {
      const t = phrases[pi];
      typed.textContent = t.slice(0, ci);
      if (!del && ci === t.length) { del = true; return setTimeout(tick, 1600); }
      if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      ci += del ? -1 : 1;
      setTimeout(tick, del ? 28 : 65);
    })();
  }

  /* ---------- reveal ao rolar ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- tilt 3D nos cards ---------- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.card').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = `perspective(800px) rotateX(${(.5 - y) * 10}deg) rotateY(${(x - .5) * 12}deg) translateY(-4px)`;
        c.style.setProperty('--mx', x * 100 + '%');
        c.style.setProperty('--my', y * 100 + '%');
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  /* ---------- formulário: abre o Telegram com a mensagem pronta ---------- */
  const form = document.getElementById('form');
  const hint = document.getElementById('hint');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = form.nome, msg = form.msg;
    [nome, msg].forEach(f => f.classList.toggle('err', !f.value.trim()));
    if (!nome.value.trim() || !msg.value.trim()) {
      hint.style.color = '#ff2bd6';
      hint.textContent = 'Preencha seu nome e a mensagem.';
      return;
    }
    const texto = `Olá! Sou ${nome.value.trim()}.\nAssunto: ${form.assunto.value}\n\n${msg.value.trim()}`;
    navigator.clipboard?.writeText(texto).catch(() => {});
    hint.style.color = '#39ff88';
    hint.textContent = 'Abrindo o Telegram... (mensagem também copiada).';
    open(`https://t.me/pbhubxx?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    form.reset();
  });
})();
