'use strict';
/*
  Gera o index.html a partir do content.json.
  - Uso direto:  node build.js      (lê content.json e escreve index.html)
  - Pelo painel: o painel carrega este arquivo e chama build(content).
  Sem dependências. Todo texto vindo do conteúdo é escapado.
*/

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const pad2 = n => String(n).padStart(2, '0');
const safeUrl = u => { const s = String(u || '').trim(); return /^(https?:\/\/|mailto:|tel:)/i.test(s) ? s : ''; };
const safeAsset = p => { const s = String(p || '').trim(); return /^assets\/[A-Za-z0-9_\-./]+$/.test(s) && !s.includes('..') ? s : ''; };
const lines = s => String(s == null ? '' : s).split(/\r?\n/).map(esc).join('<br>');
const flat = s => String(s == null ? '' : s).replace(/\s*\r?\n\s*/g, ' ').trim();

/* ---------- ícones das redes ---------- */
const SVG = (inner, attrs = 'fill="none" stroke="currentColor" stroke-width="1.9"') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${attrs}>${inner}</svg>`;
const ICONS = {
  whatsapp: SVG('<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>', 'fill="currentColor"'),
  telegram: SVG('<path d="M21.6 3.4 2.9 10.6c-1 .4-.9 1.1-.2 1.3l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3-14.3c.3-1.3-.5-1.9-1.3-1.7z" fill="currentColor"/><path class="fold" d="m8.2 13.1 9.4-5.9c.4-.3.8-.1.5.2l-7.6 7-.3 3.3z"/>', ''),
  instagram: SVG('<rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/>'),
  email: SVG('<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 7 8.5 6.5L20.5 7"/>', 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"'),
  youtube: SVG('<rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="m10 9.2 5 2.8-5 2.8z" fill="currentColor" stroke="none"/>', 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"'),
  link: SVG('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"')
};
const DEFAULT_LABEL = { whatsapp: 'WhatsApp', telegram: 'Telegram', instagram: 'Instagram', email: 'E-mail', youtube: 'YouTube', link: 'Link' };

function contactHref(l) {
  const v = String(l.value || '').trim();
  if (!v) return '';
  switch (l.type) {
    case 'whatsapp': {
      let d = v.replace(/\D/g, '');
      if (!d) return '';
      if (!d.startsWith('55') && d.length <= 11) d = '55' + d;
      return `https://wa.me/${d}?text=${encodeURIComponent('Olá! Vim pelo seu site.')}`;
    }
    case 'telegram': return `https://t.me/${encodeURIComponent(v.replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, ''))}`;
    case 'instagram': return `https://instagram.com/${encodeURIComponent(v.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, ''))}`;
    case 'email': return /^[^\s@<>"]+@[^\s@<>"]+$/.test(v) ? `mailto:${v}` : '';
    default: return safeUrl(v);
  }
}

function socials(links) {
  return (links || []).map(l => {
    const href = contactHref(l);
    if (!href) return '';
    const type = ICONS[l.type] ? l.type : 'link';
    const label = l.label || DEFAULT_LABEL[type] || 'Link';
    const ext = type === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"';
    return `        <a class="soc" href="${esc(href)}"${ext} aria-label="${esc(label)}" title="${esc(label)}">${ICONS[type]}</a>`;
  }).filter(Boolean).join('\n');
}

function project(p, i) {
  const st = p.status || {};
  const AL = { live: ['online', 'no ar', 'ao vivo'], wip: ['em andamento', 'em desenvolvimento', 'desenvolvendo'], soon: ['em breve', 'breve', 'lançamento', 'lancamento'], off: ['pausado', 'em pausa', 'offline', 'fora do ar'] };
  const lbl = (st.label || '').trim().toLowerCase();
  const sType = Object.keys(AL).find(k => AL[k].includes(lbl)) || st.type;
  const chipCls = ['live', 'wip', 'soon', 'off'].includes(sType) ? 'chip ' + sType : 'chip';
  const meta = (p.category || st.label)
    ? `<div class="proj-meta">${p.category ? `<span class="cat">${esc(p.category)}</span>` : ''}${st.label ? `<span class="${chipCls}"><i></i>${esc(st.label)}</span>` : ''}</div>`
    : '';

  let prog = '';
  const pv = p.progress && p.progress.value;
  if (pv !== undefined && pv !== null && pv !== '' && !isNaN(+pv)) {
    const v = Math.max(0, Math.min(100, Math.round(+pv)));
    const note = p.progress.note ? `<small>${esc(p.progress.note)}</small>` : '';
    prog = `<div class="prog${v === 100 ? ' done' : ''}" style="--v:${v}"><div class="prog-top"><span>PROGRESSO</span><b><em data-count="${v}">0</em>%</b></div><div class="prog-bar"><i></i></div>${note}</div>`;
  }

  const lk = p.link || {};
  const url = safeUrl(lk.url);
  const link = url
    ? `<a class="link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(lk.label || 'Acessar projeto')} <span>↗</span></a>`
    : (lk.label ? `<span class="link off">${esc(lk.label)}</span>` : '');

  const img = safeAsset(p.image);
  const body = img
    ? (p.fit === 'fill'
      ? `<div class="win-body fill"><img src="${esc(img)}" alt="${esc('Tela inicial do ' + flat(p.name))}" loading="lazy"></div>`
      : p.fit === 'contain'
      ? `<div class="win-body contain"><img class="bk" src="${esc(img)}" alt="" aria-hidden="true" loading="lazy"><img src="${esc(img)}" alt="${esc('Tela inicial do ' + flat(p.name))}" loading="lazy"></div>`
      : `<div class="win-body"><img src="${esc(img)}" alt="${esc('Tela inicial do ' + flat(p.name))}" loading="lazy"></div>`)
    : `<div class="win-body soon"><img class="mark" src="assets/logo.png" alt=""><span class="ph">${esc(p.soonLabel || 'EM BREVE')}</span><span class="bar"></span></div>`;

  return `      <article class="proj reveal">
        <div class="proj-info">
          <span class="bignum" aria-hidden="true">${pad2(i + 1)}</span>
          ${[meta, `<h3>${lines(p.name)}</h3>`, p.description ? `<p>${esc(p.description)}</p>` : '', prog, link].filter(Boolean).join('\n          ')}
        </div>
        <div class="win">
          <div class="win-bar"><i></i><span class="url">${esc(hostOf(p.link && p.link.url) || 'em breve')}</span><span class="wb-tick" aria-hidden="true"></span></div>
          ${body}
        </div>
      </article>`;
}

function accentTitle(t) {
  const m = String(t || '').match(/^([\s\S]*?)([?!]?)$/);
  return esc(m[1]) + (m[2] ? `<span class="q">${esc(m[2])}</span>` : '');
}

function build(c) {
  c = c || {};
  const site = c.site || {}, hero = c.hero || {}, contact = c.contact || {};
  const brand = (site.brand || 'BLACKE').toString().toUpperCase();
  const projects = Array.isArray(c.projects) ? c.projects : [];
  const phrases = (hero.phrases || []).map(s => String(s)).filter(s => s.trim());
  const marquee = (c.marquee || []).map(s => String(s)).filter(s => s.trim());
  const data = JSON.stringify({ phrases: phrases.length ? phrases : [''], marquee: marquee.length ? marquee : [brand] }).replace(/</g, '\\u003c');
  const count = projects.length === 1 ? '01 criação' : `${pad2(projects.length)} criações`;
  const letters = [...brand].map((ch, i) => `<span style="--i:${i}">${esc(ch)}</span>`).join('');
  const curtain = [0, 1, 2, 3, 4, 5, 6].map(k => `<i style="--k:${k}"></i>`).join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0b0b10">
<meta name="description" content="${esc(site.description)}">
<title>${esc(site.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="assets/logo.png">
<link rel="stylesheet" href="style.css">
<script>window.__SITE=${data};</script>
<script src="script.js" defer></script>
<noscript><style>.curtain,.intro{display:none}.loading *,.loading{animation-play-state:running!important}</style></noscript>
<script>try{if(sessionStorage.getItem("introSeen"))document.documentElement.classList.add("seen")}catch(e){}</script>
</head>
<body class="loading">
<div class="intro" aria-hidden="true">
  <div class="half a"></div><div class="half b"></div>
  <svg class="slash" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 60 L100 40" pathLength="1"/></svg>
  <div class="intro-core">
    <img src="assets/logo.png" alt="">
    <div class="intro-word">${letters}</div>
    <i class="intro-line"></i>
    <small>${esc((c.intro || {}).line)}</small>
  </div>
</div>
<div class="curtain" data-s="out" aria-hidden="true">${curtain}</div>
<canvas id="bg" aria-hidden="true"></canvas>
<div class="grain" aria-hidden="true"></div>
<div class="spot" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"></div>

<header>
  <a class="logo" href="#inicio"><img src="assets/logo.png" alt="" onerror="this.remove()"><b>${esc(brand)}</b><span>_</span></a>
  <nav aria-label="Navegação">
    <a href="#inicio" data-spy="inicio">Início</a>
    <a href="#projetos" data-spy="projetos">Projetos</a>
    <a href="#contato" class="nav-cta magnetic" data-spy="contato">Contato</a>
  </nav>
</header>

<main id="inicio">
  <!-- HERO -->
  <section class="hero">
    <div class="hero-in">
    <img class="hero-logo" src="assets/logo.png" alt="Logo ${esc(brand)}" width="564" height="427">
    <p class="tag"><i></i> ${esc(hero.tag)}</p>
    <h1 class="glitch" data-text="${esc(brand)}" aria-label="${esc(brand)}"></h1>
    <p class="typing"><span id="typed"></span><b class="caret"></b></p>
    <div class="hero-actions">
      <a class="btn magnetic" href="#projetos">${esc(hero.primary || 'Ver projetos')}</a>
      <a class="btn ghost magnetic" href="#contato">${esc(hero.secondary || 'Falar comigo')}</a>
    </div>
    <a class="scroll-hint" href="#projetos" aria-label="Rolar para projetos"><span></span></a>
    </div>
  </section>

  <div class="cut" id="corte">
    <div class="cut-pin">
      <div class="cut-view"><canvas class="cut-cv" aria-hidden="true"></canvas><div class="cut-words"></div></div>
      <div class="cut-ui" aria-hidden="true"><span class="cut-n"></span><span class="cut-rail"></span><span class="cut-hint">role</span></div>
    </div>
  </div>

  <!-- PROJETOS -->
  <section id="projetos" class="projects">
    <header class="sec-head reveal">
      <h2>Projetos</h2>
      <span class="count">${count}</span>
    </header>

    <div class="list">
${projects.map(project).join('\n\n')}
    </div>
  </section>

  <!-- CONTATO -->
  <section id="contato" class="contact">
    <header class="sec-head reveal">
      <h2>${accentTitle(contact.title)}</h2>
    </header>
    <p class="lead reveal">${esc(contact.lead)}</p>

    <div class="socials reveal">
${socials(contact.links)}
    </div>
  </section>
</main>

<footer>
  <span>${esc(c.footer)}</span>
</footer>
</body>
</html>
`;
}

module.exports = { build, ICONS };

if (typeof require === 'function' && typeof module !== 'undefined' && require.main === module) {
  const fs = require('fs'), path = require('path');
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
  fs.writeFileSync(path.join(__dirname, 'index.html'), build(content));
  console.log('index.html gerado.');
}
