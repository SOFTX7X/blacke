// Sitemap para o Google: páginas fixas, perfis (@) e sites públicos.
const db = require('./_db');
const BASE = 'https://blackelavex.online';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));
const dia = d => (d ? new Date(d) : new Date()).toISOString().slice(0, 10);

module.exports = async (req, res) => {
  const urls = [
    { loc:BASE + '/', freq:'hourly', pri:'1.0' },
    { loc:BASE + '/destaques', freq:'daily', pri:'0.8' },
    { loc:BASE + '/termos', freq:'yearly', pri:'0.2' },
    { loc:BASE + '/privacidade', freq:'yearly', pri:'0.2' }
  ];
  try{
    const sites = await db.pedir('/rest/v1/sites_publicos?select=id,handle,created_at&oculto=eq.false&denuncias=lt.5&order=created_at.desc&limit=5000') || [];
    const perfis = new Map();
    for (const s of sites){
      urls.push({ loc:`${BASE}/s/${s.id}`, mod:dia(s.created_at), freq:'weekly', pri:'0.6' });
      if (s.handle && !perfis.has(s.handle)) perfis.set(s.handle, s.created_at);
    }
    for (const [h, d] of perfis) urls.push({ loc:`${BASE}/@${h}`, mod:dia(d), freq:'daily', pri:'0.7' });
  }catch(_){ /* sem banco: manda só as páginas fixas */ }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => `  <url><loc>${esc(u.loc)}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}<changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`).join('\n') +
    '\n</urlset>\n';
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
