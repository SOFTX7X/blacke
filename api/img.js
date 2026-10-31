const db = require('./_db');
module.exports = async (req, res) => {
  const id = String((req.query || {}).s || '');
  try {
    if (/^\d{1,12}$/.test(id)) {
      const it = await db.site(id);
      const src = it && it.image_url;
      if (src) {
        const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/s.exec(src);
        if (m) {
          res.setHeader('Content-Type', m[1]);
          res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
          return res.status(200).send(Buffer.from(m[2], 'base64'));
        }
        if (/^https:\/\//.test(src)) { res.setHeader('Cache-Control', 'public, s-maxage=3600'); return res.redirect(302, src); }
      }
    }
  } catch (_) {}
  res.redirect(302, '/icon-512.png');
};
