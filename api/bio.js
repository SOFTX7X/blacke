// Página de links do @ (/bio/nome): foto, bio, contatos e os sites da pessoa, pronta para a bio do Instagram/TikTok.
const db = require('./_db');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const cortar = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const fmt = n => (+n || 0).toLocaleString('pt-BR');
const host = u => { try{ return new URL(u).hostname.replace(/^www\./, ''); }catch(_){ return ''; } };
const pos = s => { const m = /^(\d{1,3})% (\d{1,3})%$/.exec(s || ''); return m ? `${Math.min(100, +m[1])}% ${Math.min(100, +m[2])}%` : '50% 50%'; };
const BASE = 'https://faccliky.com';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU';

const SELO_BLACKE = '<span class="selo-b" role="img" aria-label="Selo Faccliky" title="Selo Faccliky"><img class="sb-ninja" src="/ninja-marca.png?v=1" alt="" aria-hidden="true" width="34" height="34"></span>';
const META_V = 1000, META_SELO = 10000;
const SELO = '<svg class="selo" viewBox="0 0 24 24" role="img" aria-label="Verificado"><title>Verificado</title><path fill="currentColor" d="M12 1.6l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3-2.6 1.9-1 3.1-3.2-.1L12 22.4l-2.6-1.9-3.2.1-1-3.1-2.6-1.9 1-3-1-3.1 2.6-1.9 1-3 3.2.1z"/><path fill="none" stroke="#06070d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M7.8 12.3l2.8 2.8 5.6-5.8"/></svg>';
const SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';
const CT = {
  instagram:{ ic:'fa-brands fa-instagram', nome:'Instagram' },
  whatsapp:{ ic:'fa-brands fa-whatsapp', nome:'WhatsApp' },
  telegram:{ ic:'fa-brands fa-telegram', nome:'Telegram' }
};
function nomeContato(c){
  if (c.tipo === 'telegram' && /t\.me\/(\+|joinchat)/i.test(c.url)) return 'Grupo no Telegram';
  if (c.tipo === 'whatsapp' && /chat\.whatsapp\.com/i.test(c.url)) return 'Grupo no WhatsApp';
  return (CT[c.tipo] || {}).nome || 'Link';
}

function pagina({ titulo, desc, img, url, corpo, robots, fundo }){
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
${robots ? '<meta name="robots" content="noindex">' : ''}
<meta name="theme-color" content="#06070d">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Faccliky">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="/logo-mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root{--bg:#06070d;--panel:#0e1020;--panel-2:#141731;--line:rgba(255,255,255,.08);--text:#eceef8;--muted:#9aa0c6;--dim:#6a7099;--violet:#7b6cff;--indigo:#4a3fd6;--ice:#6fd6ff;--grad:linear-gradient(135deg,#4a3fd6,#7b6cff 50%,#6fd6ff);--display:'Space Grotesk',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box;margin:0}[hidden]{display:none!important}
html{scrollbar-width:none;-webkit-text-size-adjust:100%}::-webkit-scrollbar{display:none}
body{min-height:100vh;min-height:100dvh;background:var(--bg);color:var(--text);font:400 16px/1.5 var(--display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--ice);outline-offset:3px}
.fundo{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.fundo::before{content:"";position:absolute;inset:0;background:radial-gradient(700px 420px at 50% -8%,rgba(90,75,230,.38),transparent 70%),radial-gradient(520px 380px at 100% 100%,rgba(111,214,255,.10),transparent 70%)}
.fundo img{position:absolute;left:50%;top:-120px;width:760px;height:760px;max-width:none;transform:translateX(-50%);object-fit:cover;filter:blur(80px) saturate(1.4);opacity:.32;-webkit-mask-image:radial-gradient(closest-side,#000 40%,transparent);mask-image:radial-gradient(closest-side,#000 40%,transparent)}
.wrap{position:relative;z-index:1;width:100%;max-width:600px;margin:0 auto;padding:max(14px,env(safe-area-inset-top)) 16px calc(40px + env(safe-area-inset-bottom))}

.topo{display:flex;align-items:center;gap:8px;height:52px;padding:0 6px 0 14px;border:1px solid var(--line);border-radius:999px;background:rgba(20,21,36,.72);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.marca{display:flex;align-items:center;gap:9px;margin-right:auto;font:600 12.5px var(--mono);letter-spacing:.2em;white-space:nowrap}
.marca img{height:22px;width:auto}
.marca b{color:#9d92ff;font-weight:600}
.tb{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:40px;min-width:40px;padding:0 12px;border:0;border-radius:999px;background:rgba(255,255,255,.06);cursor:pointer;transition:background .2s,transform .15s}
.tb:hover{background:rgba(255,255,255,.11)}
.tb:active{transform:scale(.94)}
.tb svg{width:17px;height:17px}
.tb b{font:600 12px var(--mono);letter-spacing:.04em}
.lang{position:relative}
.lang-menu{position:absolute;right:0;top:calc(100% + 8px);z-index:20;min-width:150px;padding:6px;border:1px solid var(--line);border-radius:16px;background:rgba(14,16,30,.98);box-shadow:0 18px 40px -12px rgba(0,0,0,.8)}
.lang-menu button{display:block;width:100%;padding:10px 12px;border:0;border-radius:11px;background:none;text-align:left;font:500 14px var(--display);cursor:pointer}
.lang-menu button:hover,.lang-menu button.on{background:rgba(123,108,255,.2)}

.cab{display:flex;flex-direction:column;align-items:center;text-align:center;padding:38px 8px 6px}
.av{position:relative;width:118px;height:118px;padding:4px;border-radius:50%;background:var(--grad);box-shadow:0 18px 50px -12px rgba(123,108,255,.75)}
.av span{display:grid;place-items:center;width:100%;height:100%;overflow:hidden;border-radius:50%;border:4px solid var(--bg);background:var(--panel-2);font:700 44px var(--display)}
.av img{width:100%;height:100%;object-fit:cover;display:block}
.nome{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:18px;font:600 clamp(22px,6vw,27px) var(--mono);letter-spacing:-.01em;word-break:break-all}
.selo{flex:none;width:22px;height:22px;color:var(--ice)}
/* Selo Faccliky: rótulo roxo com ninja preto */ .selo-b{display:inline-block;flex:none;width:34px;height:34px;margin-left:.35em;vertical-align:-.26em;overflow:visible!important}.selo-b .sb-ninja{display:block;width:100%;height:100%;object-fit:contain}.selo-b .sb-hex{display:none} .selo-b{width:34px;height:34px} 
.bio{max-width:460px;margin-top:10px;color:#cdd1ea;font-size:15.5px;white-space:pre-line;overflow-wrap:anywhere}
.num{display:flex;justify-content:center;gap:10px 26px;margin-top:14px;color:var(--dim);font-size:13px}
.num span{display:flex;flex-direction:column;align-items:center;line-height:1.3}
.num b{color:var(--text);font-weight:700;font-size:17px;font-variant-numeric:tabular-nums}

.ct{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px}
.ct a{display:inline-flex;align-items:center;gap:9px;height:44px;padding:0 18px;border:1px solid var(--line);border-radius:999px;background:rgba(20,22,42,.8);font:600 14.5px var(--display);transition:transform .2s,border-color .2s,background .2s}
.ct a:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.18);background:rgba(28,30,56,.9)}
.ct i{font-size:18px}
.ct .instagram i{background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5);-webkit-background-clip:text;background-clip:text;color:transparent}
.ct .whatsapp i{color:#25d366}
.ct .telegram i{color:#2aabee}

.lista{display:flex;flex-direction:column;gap:12px;margin-top:30px}
.lk{position:relative;display:flex;align-items:center;gap:14px;min-height:78px;padding:9px 14px 9px 9px;border:1px solid var(--line);border-radius:22px;background:rgba(16,18,36,.78);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:transform .25s cubic-bezier(.2,.8,.2,1),border-color .25s,background .25s,box-shadow .25s}
.lk:hover{transform:translateY(-3px);border-color:rgba(123,108,255,.5);background:rgba(22,24,48,.9);box-shadow:0 18px 40px -20px rgba(123,108,255,.7)}
.lk:active{transform:scale(.985)}
.lk .th{flex:none;width:60px;height:60px;overflow:hidden;border-radius:15px;background:#05060c}
.lk .th img{width:100%;height:100%;object-fit:cover;display:block}
.lk .tx{flex:1;min-width:0}
.lk .tx b{display:flex;align-items:center;gap:6px;font:600 16.5px var(--display);letter-spacing:-.01em}
.lk .tx b span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lk .tx b .selo{width:16px;height:16px}
.lk .tx small{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dim);font:500 12.5px var(--mono)}
.lk .ir{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);color:var(--muted);transition:background .25s,color .25s,transform .3s cubic-bezier(.3,1.6,.5,1)}
.lk .ir svg{width:17px;height:17px}
.lk:hover .ir{background:var(--grad);color:#fff;transform:rotate(45deg)}
.lk.dest{flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:hidden}
.lk.dest .capa{position:relative;aspect-ratio:16/9;overflow:hidden;background:#05060c}
.lk.dest .capa img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.lk.dest:hover .capa img{transform:scale(1.04)}
.lk.dest .capa::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(6,7,13,.55))}
.lk.dest .base{display:flex;align-items:center;gap:14px;padding:14px 14px 14px 18px}
.lk.dest .tx b{font-size:18px}

.vz{margin-top:30px;padding:34px 20px;border:1px dashed rgba(255,255,255,.12);border-radius:22px;color:var(--muted);text-align:center}

.pe{display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:44px;text-align:center}
.cta{display:inline-flex;align-items:center;gap:10px;height:50px;padding:0 24px;border-radius:999px;background:linear-gradient(135deg,#4a3fd6,#7b6cff);color:#fff;font:600 15px var(--display);box-shadow:0 12px 30px -10px rgba(123,108,255,.85);transition:transform .2s,box-shadow .2s}
.cta:hover{transform:translateY(-2px);box-shadow:0 16px 36px -10px rgba(123,108,255,1)}
.cta img{height:20px;width:auto}
.pe small{color:var(--dim);font-size:12.5px}

.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));z-index:30;transform:translate(-50%,20px);opacity:0;pointer-events:none;height:46px;display:flex;align-items:center;padding:0 20px;border:1px solid rgba(123,108,255,.55);border-radius:999px;background:rgba(20,21,36,.98);font:600 14px var(--display);transition:opacity .3s,transform .4s cubic-bezier(.16,1,.3,1)}
.toast.on{opacity:1;transform:translate(-50%,0)}

/* entrada: tudo surge em sequência, uma vez */
.e{opacity:0;transform:translateY(14px);animation:sobe .7s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--i,0) * 70ms + 80ms)}
@keyframes sobe{to{opacity:1;transform:none}}
.av.e{transform:scale(.85);animation-name:pop}
@keyframes pop{to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.e{animation:none;opacity:1;transform:none}*{transition:none!important}}
@media (max-width:360px){.marca span{display:none}}
@media (max-width:420px){.lk .th{width:54px;height:54px}}
@media (min-width:600px){.lk.dest .capa{aspect-ratio:2/1}}
</style>
</head>
<body>
<div class="fundo" aria-hidden="true">${fundo ? `<img src="${esc(fundo)}" alt="">` : ''}</div>
<main class="wrap">
  <header class="topo">
    <a class="marca" href="/" title="Ir para o mural"><img src="/logo-mark.png" alt=""><span translate="no">Faccliky</span></a>
    <div class="lang">
      <button type="button" class="tb" id="langBtn" aria-haspopup="true" aria-expanded="false" aria-label="Idioma / Language"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><b>PT</b></button>
      <div class="lang-menu" id="langMenu" hidden role="menu" translate="no">
        <button type="button" role="menuitem" data-l="pt">Português</button>
        <button type="button" role="menuitem" data-l="en">English</button>
        <button type="button" role="menuitem" data-l="es">Español</button>
      </div>
    </div>
    <button type="button" class="tb" id="partilhar" aria-label="Compartilhar" title="Compartilhar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/></svg></button>
  </header>
${corpo}
  <footer class="pe e" style="--i:7">
    <a class="cta" href="/publicar"><img src="/logo-mark.png" alt=""> Crie a sua página grátis</a>
    <small><span>Feito no</span> <span translate="no">Faccliky</span> <span>· sem cadastro</span></small>
  </footer>
</main>
<div class="toast" id="toast" role="status"></div>
<script>
(function(){
  var t = document.getElementById('toast');
  function aviso(m){ t.textContent = m; t.classList.add('on'); clearTimeout(aviso._t); aviso._t = setTimeout(function(){ t.classList.remove('on'); }, 2200); }
  document.getElementById('partilhar').addEventListener('click', function(){
    var u = location.origin + location.pathname, ti = document.title;
    if (navigator.share) navigator.share({ title:ti, url:u }).catch(function(){});
    else if (navigator.clipboard) navigator.clipboard.writeText(u).then(function(){ aviso('Link copiado'); });
  });
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[data-id]'); if (!a) return;
    var id = a.dataset.id, hj = ${JSON.stringify(db.clique.headers)};
    // principal fora do ar: se houver PC de segurança, o clique vai para a fila dele e é reenviado quando o principal voltar
    var PCS = ${JSON.stringify(db.PC ? { url:db.PC.url, key:db.PC.key } : null)};
    function pc(){
      if (!PCS) return;
      var H = { 'Content-Type':'application/json', Authorization:'Bearer ' + PCS.key }, U = PCS.url;
      fetch(U + '/rpc/pc_enfileirar', { method:'POST', keepalive:true, headers:H, body:JSON.stringify({ p_nome:'registrar_clique', p_args:{ p_id:id } }) })
        .then(function(){ return fetch(U + '/rpc/registrar_clique', { method:'POST', keepalive:true, headers:H, body:JSON.stringify({ p_id:id }) }); }).catch(function(){});
    }
    try{ fetch(${JSON.stringify(db.clique.url)}, { method:'POST', keepalive:true, headers:hj, body:JSON.stringify({ p_id:id }) }).then(function(r){ if (!r.ok) pc(); }).catch(pc); }catch(_){ pc(); }
  });
})();
</script>
<script src="/i18n.js?v=1793563299"></script>
</body>
</html>`;
}

function render(p, sites){
  const h = p.handle, ini = esc(h.charAt(0).toUpperCase());
  const ct = (Array.isArray(p.contatos) ? p.contatos : []).filter(c => /^https:\/\//.test(c.url || ''));
  let i = 0;
  const linha = (s, dest) => {
    const im = `/api/img?s=${s.id}`, nome = `<b><span translate="no">${esc(s.brand_name)}</span>${s.verificado ? SELO : ''}</b>`, dom = `<small translate="no">${esc(host(s.link_url))}</small>`;
    if (dest) return `<a class="lk dest e" style="--i:${++i}" href="${esc(s.link_url)}" target="_blank" rel="noopener noreferrer" data-id="${s.id}">
      <span class="capa"><img src="${im}" alt="" style="object-position:${pos(s.img_pos)}"></span>
      <span class="base"><span class="tx">${nome}${dom}</span><span class="ir">${SETA}</span></span></a>`;
    return `<a class="lk e" style="--i:${++i}" href="${esc(s.link_url)}" target="_blank" rel="noopener noreferrer" data-id="${s.id}">
      <span class="th"><img src="${im}" alt="" loading="lazy" style="object-position:${pos(s.img_pos)}"></span>
      <span class="tx">${nome}${dom}</span><span class="ir">${SETA}</span></a>`;
  };
  const links = sites.filter(s => /^https?:\/\//i.test(s.link_url || ''));
  return `
  <section class="cab">
    <div class="av e" style="--i:0"><span>${p.foto ? `<img src="${esc(p.foto)}" alt="">` : ini}</span></div>
    <h1 class="nome e" style="--i:1"><span translate="no">@${esc(h)}</span>${p.verificado || (+p.acessos || 0) >= META_V ? SELO : ''}${p.selo || (+p.acessos || 0) >= META_SELO ? SELO_BLACKE : ''}</h1>
    ${p.bio ? `<p class="bio e" style="--i:2" translate="no">${esc(p.bio)}</p>` : ''}
    <div class="num e" style="--i:3"><span><b>${fmt(p.sites)}</b>${+p.sites === 1 ? 'site' : 'sites'}</span><span><b>${fmt(p.acessos)}</b>${+p.acessos === 1 ? 'acesso' : 'acessos'}</span>${p.seguidores != null ? `<span><b>${fmt(p.seguidores)}</b>${+p.seguidores === 1 ? 'seguidor' : 'seguidores'}</span><span><b>${fmt(p.seguindo)}</b>seguindo</span>` : ''}</div>
    ${ct.length ? `<nav class="ct e" style="--i:4" aria-label="Contatos">${ct.map(c => `<a class="${esc(c.tipo)}" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><i class="${(CT[c.tipo] || {}).ic || 'fa-solid fa-link'}"></i>${nomeContato(c)}</a>`).join('')}</nav>` : ''}
  </section>
  ${links.length ? `<section class="lista" aria-label="Links">${links.map((s, k) => linha(s, k === 0 && links.length > 1)).join('')}</section>` : '<p class="vz e" style="--i:5">Ainda não há links por aqui.</p>'}`;
}

module.exports = async (req, res) => {
  const h = String((req.query || {}).h || '').replace(/^@/, '').toLowerCase();
  let p = null, sites = [];
  if (/^[a-z0-9_]{3,30}$/.test(h)){
    try{
      p = await db.perfil(h);
      if (p && p.handle){
        sites = await db.pedir(`/rest/v1/sites_publicos?select=id,brand_name,link_url,verificado,img_pos&handle=eq.${p.handle}&oculto=eq.false&denuncias=lt.5&order=created_at.desc&limit=30`) || [];
      }
    }catch(_){ p = null; }
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!p || !p.handle){
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(404).send(pagina({
      titulo:'Perfil não encontrado · Faccliky', desc:'Este @ não existe ou foi removido.', img:BASE + '/api/og', url:BASE + '/', robots:true,
      corpo:`<section class="cab"><div class="av e"><span>@</span></div><h1 class="nome e" style="--i:1">Perfil não encontrado</h1><p class="bio e" style="--i:2">Este @ não existe ou foi removido.</p></section>`
    }));
  }
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  res.status(200).send(pagina({
    titulo:`@${p.handle} · Links | Faccliky`,
    desc:cortar(p.bio, 160) || `Links de @${p.handle} no Faccliky.`,
    img:`${BASE}/api/og?p=${p.handle}`, url:`${BASE}/bio/${p.handle}`,
    fundo:p.foto || null,
    corpo:render(p, sites)
  }));
};
