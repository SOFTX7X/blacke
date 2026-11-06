// Selo "Estou no Faccliky" (SVG). Uso: /selo/nome  ou  /selo/nome?t=claro  (sem nome = selo genérico)
const A = require('./_selo_assets');
const TEMAS = {
  escuro: { fundo:'#0c0e1b', borda1:'#4a3fd6', borda2:'#6fd6ff', suave:'#8c92b3', texto:'#ffffff', arroba:'#6fd6ff', brilho:'0.55', logo:'' },
  claro:  { fundo:'#ffffff', borda1:'#4a3fd6', borda2:'#6fd6ff', suave:'#6b7194', texto:'#0c0e1b', arroba:'#4a3fd6', brilho:'0', logo:' filter="url(#f)"' }
};
module.exports = (req, res) => {
  let h = String((req.query && req.query.h) || '').replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(h)) h = '';
  const t = TEMAS[(req.query && req.query.t) === 'claro' ? 'claro' : 'escuro'];
  const W = 292, H = h ? 84 : 72, cy = H / 2;
  const y1 = h ? 29 : 28, y2 = h ? 52 : 50, y3 = 69;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Estou no Faccliky${h ? ' - @' + h : ''}">
<title>Estou no Faccliky${h ? ' - @' + h : ''}</title>
<defs>
<style>@font-face{font-family:SG;font-weight:700;src:url(data:font/ttf;base64,${A.bold}) format("truetype")}@font-face{font-family:SG;font-weight:500;src:url(data:font/ttf;base64,${A.medium}) format("truetype")}text{font-family:SG,'Space Grotesk',system-ui,Arial,sans-serif}</style>
<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.borda1}"/><stop offset="1" stop-color="${t.borda2}"/></linearGradient>
<radialGradient id="g" cx="0.12" cy="0.5" r="0.7"><stop offset="0" stop-color="#7b6cff" stop-opacity="${t.brilho}"/><stop offset="1" stop-color="#7b6cff" stop-opacity="0"/></radialGradient>
<filter id="f" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.29  0 0 0 0 0.25  0 0 0 0 0.84  0 0 0 1 0"/></filter>
<clipPath id="c"><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${(H - 3) / 2 > 22 ? 22 : (H - 3) / 2}"/></clipPath>
</defs>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="22" fill="${t.fundo}"/>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="22" fill="url(#g)" clip-path="url(#c)"/>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="22" fill="none" stroke="url(#b)" stroke-width="2.2"/>
<image${t.logo} x="20" y="${cy - 20}" width="63" height="40" xlink:href="data:image/png;base64,${A.logo}"/>
<text x="100" y="${y1}" font-size="10" font-weight="500" letter-spacing="2.6" fill="${t.suave}">ESTOU NO</text>
<text x="100" y="${y2}" font-size="21" font-weight="700" letter-spacing="0.4" fill="${t.texto}">Faccliky</text>
${h ? `<text x="100" y="${y3}" font-size="13" font-weight="500" fill="${t.arroba}">@${h}</text>` : ''}
</svg>`;
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
  res.status(200).send(svg);
};
