// Páginas de site (/s/ID) e perfil (/@nome): devolve o próprio site já com título, descrição,
// imagem e endereço certos (bom para o Google e para as prévias no WhatsApp/Telegram).
const fs = require('fs'), path = require('path');
const db = require('./_db');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const cortar = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
let MODELO = null;
try{ MODELO = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8'); }catch(_){}

module.exports = async (req, res) => {
  const base = 'https://blackelavex.online';
  const q = req.query || {};
  let titulo = 'Faccliky — Mural anônimo', desc = 'Publique seu link com capa e legenda. Sem conta, sem cadastro.';
  let img = base + '/api/og', url = base + '/', achou = false, destino = '/';
  try{
    if (q.s && /^\d{1,12}$/.test(q.s)){
      url = base + '/s/' + q.s; destino = '/?s=' + q.s;
      const it = await db.site(q.s);
      if (it){
        achou = true;
        titulo = it.brand_name + ' — Faccliky';
        desc = cortar(it.caption, 180) || ('Site da categoria ' + (it.categoria || 'Outros') + ' no mural Faccliky.');
        img = base + '/api/og?s=' + it.id;
      }
    }else if (q.p){
      const h = String(q.p).replace(/^@/, '').toLowerCase();
      if (/^[a-z0-9_]{3,30}$/.test(h)){
        url = base + '/@' + h; destino = '/?p=' + h;
        const pf = await db.perfil(h);
        if (pf && pf.handle){
          achou = true;
          titulo = '@' + pf.handle + ' — Faccliky';
          desc = cortar(pf.bio, 160) || (pf.sites + (pf.sites === 1 ? ' site' : ' sites') + ' publicados no mural · ' + pf.acessos + (pf.acessos === 1 ? ' acesso' : ' acessos') + (+pf.seguidores > 0 ? ' · ' + pf.seguidores + (+pf.seguidores === 1 ? ' seguidor' : ' seguidores') : ''));
          img = base + '/api/og?p=' + pf.handle;
        }
      }
    }
  }catch(_){ /* segue com os dados padrão */ }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (!MODELO){   // sem o modelo: comportamento antigo (redireciona)
    return res.status(200).send(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title><meta name="description" content="${esc(desc)}"><meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(img)}"><meta http-equiv="refresh" content="0;url=${esc(destino)}"></head><body><script>location.replace(${JSON.stringify(destino)})</script></body></html>`);
  }
  const html = MODELO
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(titulo)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(img)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(url)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(url)}">`)
    .replace(/<meta name="twitter:card" content="[^"]*">/, '<meta name="twitter:card" content="summary_large_image">')
    .replace('</head>', achou ? '</head>' : '<meta name="robots" content="noindex"></head>');
  res.status(achou ? 200 : 404).send(html);
};
