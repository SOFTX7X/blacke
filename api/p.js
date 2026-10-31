const db = require('./_db');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cortar = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'blackelavex.online';
  const base = 'https://' + host;
  const q = req.query || {};
  let titulo = 'BLACKE LAVEX — Mural anônimo', desc = 'Publique seu link com capa e legenda. Sem conta, sem cadastro.';
  let img = base + '/icon-512.png', url = base + '/', destino = '/';
  try {
    if (q.s && /^\d{1,12}$/.test(q.s)) {
      const it = await db.site(q.s);
      if (it) {
        titulo = it.brand_name + ' — BLACKE LAVEX';
        desc = cortar(it.caption, 180) || ('Site da categoria ' + (it.categoria || 'Outros') + ' no mural BLACKE LAVEX.');
        img = base + '/api/img?s=' + it.id; url = base + '/s/' + it.id; destino = '/?s=' + it.id;
      }
    } else if (q.p) {
      const h = String(q.p).replace(/^@/, '').toLowerCase();
      if (/^[a-z0-9_]{3,30}$/.test(h)) {
        const pf = await db.perfil(h);
        if (pf && pf.handle) {
          titulo = '@' + pf.handle + ' — BLACKE LAVEX';
          desc = pf.sites + (pf.sites === 1 ? ' site' : ' sites') + ' publicados no mural · ' + pf.acessos + (pf.acessos === 1 ? ' acesso' : ' acessos');
          url = base + '/@' + pf.handle; destino = '/?p=' + pf.handle;
        }
      }
    }
  } catch (_) { /* segue com os dados padrão */ }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).send(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<title>${esc(titulo)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="BLACKE LAVEX">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(titulo)}"><meta name="twitter:image" content="${esc(img)}">
<meta http-equiv="refresh" content="0;url=${esc(destino)}">
<style>body{background:#06070d;color:#aab}</style></head>
<body><script>location.replace(${JSON.stringify(destino)})</script><noscript><a href="${esc(destino)}">Abrir no BLACKE LAVEX</a></noscript></body></html>`);
};
