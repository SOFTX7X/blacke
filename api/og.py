# BLACKE LAVEX — imagem de prévia (1200x630) para links de site (/s/ID), perfil (/@nome) e do mural.
# Usada pelo WhatsApp, Telegram, Instagram, X, Discord e Google quando alguém compartilha um link.
import base64, io, json, os, re, urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTES = os.path.join(AQUI, '_og')
W, H = 1200, 630
SS = 3  # supersampling para bordas suaves

BG = (6, 7, 13)
TEXTO = (236, 238, 248)
MUTED = (150, 156, 190)
DIM = (96, 102, 140)
VIOLETA = (123, 108, 255)
INDIGO = (74, 63, 214)
GELO = (111, 214, 255)

BANCOS = [
    ('https://wyjrjioipqfltdyupfna.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU'),
    ('https://ldghexvlbkiqduzlpdss.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ2hleHZsYmtpcWR1emxwZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjgzNzAsImV4cCI6MjEwMjkwNDM3MH0.MJOsPqcyc5J5TRH_JxvpH0Eul_v9bwfSeab-bFLe6vM'),
]

# ---------- fontes e caracteres suportados ----------
_F = {}
def fonte(nome, tam):
    k = (nome, tam)
    if k not in _F:
        _F[k] = ImageFont.truetype(os.path.join(FONTES, nome + '.ttf'), tam)
    return _F[k]

try:
    _R = json.load(open(os.path.join(FONTES, 'glifos.json')))
except Exception:
    _R = [[32, 126]]
def _tem(c):
    o = ord(c)
    for a, b in _R:
        if a <= o <= b: return True
        if o < a: return False
    return False
def limpo(s):
    s = ''.join(c if _tem(c) else ' ' for c in str(s or ''))
    return re.sub(r'\s+', ' ', s).strip()

def num(n):
    try: return f'{int(n):,}'.replace(',', '.')
    except Exception: return '0'

# ---------- dados ----------
def pedir(caminho, corpo=None):
    for i, (url, chave) in enumerate(BANCOS):
        try:
            req = urllib.request.Request(url + caminho, data=json.dumps(corpo).encode() if corpo is not None else None,
                                         headers={'apikey': chave, 'Authorization': 'Bearer ' + chave, 'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=4) as r:
                txt = r.read().decode()
            if i:
                txt = txt.replace(BANCOS[0][0] + '/storage/', url + '/storage/')
            return json.loads(txt)
        except Exception:
            continue
    return None

def baixar_imagem(src, lado_max=1400):
    if not src: return None
    try:
        m = re.match(r'^data:image/[a-z]+;base64,(.+)$', src, re.S)
        if m:
            dados = base64.b64decode(m.group(1))
        elif src.startswith('https://'):
            req = urllib.request.Request(src, headers={'User-Agent': 'BlackeLavexOG/1.0'})
            with urllib.request.urlopen(req, timeout=4) as r:
                dados = r.read(8_000_000)
        else:
            return None
        im = Image.open(io.BytesIO(dados))
        im.draft('RGB', (lado_max, lado_max))
        return im.convert('RGB')
    except Exception:
        return None

# ---------- desenho ----------
def fundo():
    im = Image.new('RGB', (W, H), BG)
    brilho = Image.new('RGB', (W // 4, H // 4), BG)
    d = ImageDraw.Draw(brilho)
    d.ellipse((-70, -90, 150, 70), fill=(44, 34, 140))
    d.ellipse((210, 90, 360, 200), fill=(18, 60, 92))
    brilho = brilho.filter(ImageFilter.GaussianBlur(38)).resize((W, H), Image.LANCZOS)
    im = Image.blend(im, brilho, .9)
    # grade fina, como no mural
    g = Image.new('L', (W, H), 0)
    dg = ImageDraw.Draw(g)
    for x in range(0, W, 40): dg.line((x, 0, x, H), fill=10)
    for y in range(0, H, 40): dg.line((0, y, W, y), fill=10)
    im.paste((255, 255, 255), (0, 0), g)
    return im

def mascara_arred(w, h, r):
    m = Image.new('L', (w * SS, h * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * SS - 1, h * SS - 1), r * SS, fill=255)
    return m.resize((w, h), Image.LANCZOS)

def mascara_circulo(d):
    m = Image.new('L', (d * SS, d * SS), 0)
    ImageDraw.Draw(m).ellipse((0, 0, d * SS - 1, d * SS - 1), fill=255)
    return m.resize((d, d), Image.LANCZOS)

def cobrir(img, w, h):
    iw, ih = img.size
    s = max(w / iw, h / ih)
    img = img.resize((max(w, round(iw * s)), max(h, round(ih * s))), Image.LANCZOS)
    x, y = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((x, y, x + w, y + h))

def caixa(base, xy, wh, r, fill, borda=None, sombra=False):
    x, y = xy; w, h = wh
    if sombra:
        s = Image.new('L', (W, H), 0)
        ImageDraw.Draw(s).rounded_rectangle((x + 6, y + 18, x + w - 6, y + h + 10), r, fill=150)
        s = s.filter(ImageFilter.GaussianBlur(26))
        base.paste((0, 0, 0), (0, 0), s)
    camada = Image.new('RGB', (w, h), fill)
    base.paste(camada, (x, y), mascara_arred(w, h, r))
    if borda:
        m = Image.new('L', (w * SS, h * SS), 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, w * SS - 1, h * SS - 1), r * SS, outline=255, width=2 * SS)
        m = m.resize((w, h), Image.LANCZOS)
        base.paste(borda, (x, y), m)

def colar_arred(base, img, xy, wh, r):
    w, h = wh
    base.paste(cobrir(img, w, h), xy, mascara_arred(w, h, r))

def anel(base, cx, cy, d, esp):
    # anel em degradê violeta → gelo
    D = d + esp * 2
    grad = Image.new('RGB', (D, D))
    gd = ImageDraw.Draw(grad)
    for i in range(D):
        t = i / max(1, D - 1)
        gd.line((i, 0, i, D), fill=tuple(round(INDIGO[k] + (GELO[k] - INDIGO[k]) * t) for k in range(3)))
    m = mascara_circulo(D)
    furo = Image.new('L', (D, D), 0)
    furo.paste(mascara_circulo(d + 4), (esp - 2, esp - 2))
    m = Image.composite(Image.new('L', (D, D), 0), m, furo)
    base.paste(grad, (cx - D // 2, cy - D // 2), m)

def selo(base, x, y, d):
    # selo de verificado (círculo gelo com ✓)
    c = Image.new('RGB', (d, d), GELO)
    base.paste(c, (x, y), mascara_circulo(d))
    m = Image.new('L', (d * SS, d * SS), 0)
    md = ImageDraw.Draw(m)
    p = [(.28, .52), (.44, .67), (.73, .36)]
    md.line([(a * d * SS, b * d * SS) for a, b in p], fill=255, width=round(d * .13 * SS), joint='curve')
    m = m.resize((d, d), Image.LANCZOS)
    base.paste(BG, (x, y), m)


META_V, META_SELO = 1000, 10000
def regras(pf):
    # mesmas regras do site: verificado manual ou 1000 acessos; Selo BLACKE manual ou 10000 acessos
    ac = int((pf or {}).get('acessos') or 0)
    return bool((pf or {}).get('verificado')) or ac >= META_V, bool((pf or {}).get('selo')) or ac >= META_SELO

def selo_ninja(base, x, y, d):
    # Selo BLACKE: rótulo roxo com ninja preto e dois olhos roxos (mesmo desenho do site)
    S = 8; N = d * S; k = N / 24.0
    P = lambda pts: [(a * k, b * k) for a, b in pts]
    lay = Image.new('RGBA', (N, N), (0, 0, 0, 0)); g = ImageDraw.Draw(lay)
    hexa = [(12, .9), (21.6, 6.4), (21.6, 17.6), (12, 23.1), (2.4, 17.6), (2.4, 6.4)]
    g.polygon(P(hexa), fill=(74, 63, 214, 255))
    g.polygon(P([(12, .9), (2.4, 6.4), (2.4, 12), (12, 6.4)]), fill=(141, 127, 255, 190))
    g.line(P(hexa + [hexa[0]]), fill=(111, 214, 255, 235), width=max(2, round(.9 * k)), joint='curve')
    g.polygon(P([(17.9, 8.3), (21, 6.6), (20.1, 9.2), (21.6, 11), (18.3, 10.6)]), fill=(0, 0, 0, 255))
    cab = Image.new('L', (N, N), 0)
    ImageDraw.Draw(cab).ellipse(((12 - 6.9) * k, (12.6 - 6.9) * k, (12 + 6.9) * k, (12.6 + 6.9) * k), fill=255)
    lay.paste((0, 0, 0, 255), (0, 0), cab)
    faixa = Image.new('L', (N, N), 0)
    ImageDraw.Draw(faixa).rectangle((5.6 * k, 8.6 * k, 18.4 * k, 9.9 * k), fill=255)
    faixa = Image.composite(faixa, Image.new('L', (N, N), 0), cab)
    lay.paste((123, 108, 255, 255), (0, 0), faixa)
    olho = [(6.8, 12.3), (10.4, 13.3), (10.75, 13.6), (10.75, 14.0), (10.4, 14.3), (8, 14.9), (7.2, 15.05), (6.6, 14.6), (6.55, 13.9)]
    g.polygon(P(olho), fill=(169, 155, 255, 255))
    g.polygon(P([(24 - a, b) for a, b in olho]), fill=(169, 155, 255, 255))
    lay = lay.resize((d, d), Image.LANCZOS)
    base.paste(lay, (x, y), lay)

def largura(txt, f):
    return f.getlength(txt)

def quebrar(txt, f, larg, linhas):
    palavras, out, atual = txt.split(' '), [], ''
    for p in palavras:
        t = (atual + ' ' + p).strip()
        if largura(t, f) <= larg: atual = t; continue
        if atual: out.append(atual)
        atual = p
        while largura(atual, f) > larg and len(atual) > 1:
            corte = len(atual)
            while corte > 1 and largura(atual[:corte] + '…', f) > larg: corte -= 1
            out.append(atual[:corte] + '…' if len(out) + 1 >= linhas else atual[:corte]); atual = atual[corte:]
            if len(out) >= linhas: break
        if len(out) >= linhas: break
    if atual and len(out) < linhas: out.append(atual)
    if len(out) > linhas: out = out[:linhas]
    resto = ' '.join(out)
    if len(resto) < len(txt) and out and not out[-1].endswith('…'):
        u = out[-1]
        while u and largura(u + '…', f) > larg: u = u[:-1]
        out[-1] = u.rstrip() + '…'
    return out

def titulo_ajustado(txt, larg, max_linhas, tams, nome='SpaceGrotesk-Bold'):
    for t in tams:
        f = fonte(nome, t)
        l = quebrar(txt, f, larg, max_linhas)
        if not any(x.endswith('…') for x in l): return f, l
    f = fonte(nome, tams[-1])
    return f, quebrar(txt, f, larg, max_linhas)

_LOGO = None
def logo():
    global _LOGO
    if _LOGO is None:
        try: _LOGO = Image.open(os.path.join(FONTES, 'logo-mark.png')).convert('RGBA')
        except Exception: _LOGO = False
    return _LOGO

def marca(base, x, y, tam=30):
    d = ImageDraw.Draw(base)
    lg = logo(); dx = 0
    if lg:
        h = tam + 8; w = round(lg.width * h / lg.height)
        lg2 = lg.resize((w, h), Image.LANCZOS)
        base.paste(lg2, (x, y - 4), lg2); dx = w + 14
    f = fonte('IBMPlexMono-SemiBold', round(tam * .72))
    t1 = 'BLACKE '
    esp = round(tam * .2)
    cx = x + dx
    for ch in t1:
        d.text((cx, y + tam * .12), ch, font=f, fill=TEXTO); cx += f.getlength(ch) + esp
    for ch in 'LAVEX':
        d.text((cx, y + tam * .12), ch, font=f, fill=VIOLETA); cx += f.getlength(ch) + esp
    return cx

def pilula(base, x, y, txt, f, cor_txt, cor_fundo, cor_borda=None, alt=40, pad=18):
    w = round(f.getlength(txt) + pad * 2)
    caixa(base, (x, y), (w, alt), alt // 2, cor_fundo, cor_borda)
    bb = f.getbbox('Hg')
    ImageDraw.Draw(base).text((x + pad, y + (alt - (bb[3] - bb[1])) / 2 - bb[1]), txt, font=f, fill=cor_txt)
    return w

def avatar(base, img, letra, cx, cy, d, esp):
    anel(base, cx, cy, d, esp)
    if img is not None:
        base.paste(cobrir(img, d, d), (cx - d // 2, cy - d // 2), mascara_circulo(d))
    else:
        c = Image.new('RGB', (d, d), (22, 26, 53))
        base.paste(c, (cx - d // 2, cy - d // 2), mascara_circulo(d))
        f = fonte('SpaceGrotesk-Bold', round(d * .42))
        ImageDraw.Draw(base).text((cx, cy), letra, font=f, fill=TEXTO, anchor='mm')

# ---------- cartões ----------
def cartao_site(s, foto, regra=(False, False)):
    im = fundo(); d = ImageDraw.Draw(im)
    capa = baixar_imagem(s.get('image_url'))
    # capa à esquerda
    cx, cy, cw, ch = 56, 58, 588, 514
    caixa(im, (cx - 2, cy - 2), (cw + 4, ch + 4), 34, (30, 33, 64), sombra=True)
    if capa: colar_arred(im, capa, (cx, cy), (cw, ch), 32)
    else:
        caixa(im, (cx, cy), (cw, ch), 32, (16, 18, 38))
        letra = (limpo(s.get('brand_name'))[:1] or 'B').upper()
        d.text((cx + cw / 2, cy + ch / 2), letra, font=fonte('SpaceGrotesk-Bold', 220), fill=(44, 40, 110), anchor='mm')
    # coluna da direita
    x = 700; larg = W - x - 60
    marca(im, x, 64, 28)
    y = 158
    cat = limpo(s.get('categoria') or 'Outros')
    pilula(im, x, y, cat, fonte('IBMPlexMono-Medium', 19), GELO, (13, 30, 46), (40, 92, 120), alt=38, pad=16)
    y += 66
    nome = limpo(s.get('brand_name') or 'Site').upper() or 'SITE'
    f, linhas = titulo_ajustado(nome, larg - (46 if s.get('verificado') else 0), 3, [66, 58, 50, 44])
    lh = round(f.size * 1.08)
    for i, l in enumerate(linhas):
        d.text((x, y + i * lh), l, font=f, fill=TEXTO)
    if s.get('verificado'):
        ult = linhas[-1]; sx = x + round(f.getlength(ult)) + 14
        selo(im, sx, y + (len(linhas) - 1) * lh + round(f.size * .2), round(f.size * .62))
    y += len(linhas) * lh + 22
    if s.get('handle'):
        letra = (s['handle'][:1] or '@').upper()
        avatar(im, foto, letra, x + 22, y + 22, 40, 3)
        fh = fonte('IBMPlexMono-SemiBold', 26); hx = x + 58
        d.text((hx, y + 22), '@' + s['handle'], font=fh, fill=GELO, anchor='lm')
        hx += round(fh.getlength('@' + s['handle'])) + 12
        if regra[0]: selo(im, hx, y + 8, 28); hx += 38
        if regra[1]: selo_ninja(im, hx, y + 4, 36)
        y += 62
    # números
    fn = fonte('SpaceGrotesk-Bold', 36)
    n = num(s.get('cliques') or 0)
    d.text((x, y + 4), n, font=fn, fill=TEXTO)
    d.text((x + fn.getlength(n) + 10, y + 18), 'acessos' if (s.get('cliques') or 0) != 1 else 'acesso', font=fonte('SpaceGrotesk-Medium', 21), fill=MUTED)
    # rodapé
    d.line((x, H - 96, W - 60, H - 96), fill=(30, 33, 64), width=2)
    d.text((x, H - 70), f"blackelavex.online/s/{s.get('id')}", font=fonte('IBMPlexMono-Medium', 20), fill=DIM, anchor='lm')
    return im

def cartao_perfil(p, sites):
    im = fundo(); d = ImageDraw.Draw(im)
    foto = baixar_imagem(p.get('foto'), 600)
    h = p.get('handle') or ''
    # avatar à esquerda
    avatar(im, foto, (h[:1] or '@').upper(), 250, 300, 300, 10)
    # direita
    x = 470; larg = W - x - 64
    marca(im, x, 64, 28)
    y = 168
    f, linhas = titulo_ajustado('@' + h, larg - (60 if regras(p)[0] else 0) - (70 if regras(p)[1] else 0), 1, [66, 58, 50, 44, 38], 'IBMPlexMono-SemiBold')
    d.text((x, y), linhas[0], font=f, fill=TEXTO)
    ver, nin = regras(p); sx = x + round(f.getlength(linhas[0])) + 16
    if ver:
        selo(im, sx, y + round(f.size * .22), round(f.size * .66)); sx += round(f.size * .66) + 14
    if nin:
        selo_ninja(im, sx, y + round(f.size * .12), round(f.size * .86))
    y += round(f.size * 1.3)
    bio = limpo(p.get('bio'))
    if bio:
        fb = fonte('SpaceGrotesk-Regular', 28)
        for i, l in enumerate(quebrar(bio, fb, larg, 2)):
            d.text((x, y + i * 38), l, font=fb, fill=(200, 204, 230))
        y += 2 * 38 if len(quebrar(bio, fb, larg, 2)) > 1 else 38
    y += 18
    # números: sites, acessos, seguidores, seguindo
    itens = [(p.get('sites') or 0, 'site', 'sites'), (p.get('acessos') or 0, 'acesso', 'acessos')]
    if p.get('seguidores') is not None:
        itens += [(p.get('seguidores') or 0, 'seguidor', 'seguidores'), (p.get('seguindo') or 0, 'seguindo', 'seguindo')]
    for tn, tl in ((38, 20), (32, 18), (28, 16)):
        fn, fl = fonte('SpaceGrotesk-Bold', tn), fonte('SpaceGrotesk-Medium', tl)
        tot = sum(fn.getlength(num(n)) + 10 + fl.getlength(um if n == 1 else varios) for n, um, varios in itens) + 30 * (len(itens) - 1)
        if tot <= larg: break
    cx = x
    for n, um, varios in itens:
        t = num(n); d.text((cx, y), t, font=fn, fill=TEXTO); cx += fn.getlength(t) + 10
        lab = um if n == 1 else varios
        d.text((cx, y + round(tn * .37)), lab, font=fl, fill=MUTED); cx += fl.getlength(lab) + 30
    # miniaturas dos sites
    caps = []
    for s in sites[:3]:
        c = baixar_imagem(s.get('image_url'), 500)
        if c: caps.append(c)
    ty = H - 64 - 120 - 30
    if caps:
        tx = x
        for c in caps:
            caixa(im, (tx - 2, ty - 2), (148, 124), 18, (30, 33, 64))
            colar_arred(im, c, (tx, ty), (144, 120), 16); tx += 162
    d.text((x, H - 44), f'blackelavex.online/@{h}', font=fonte('IBMPlexMono-Medium', 20), fill=DIM, anchor='lm')
    return im

def cartao_mural():
    im = fundo(); d = ImageDraw.Draw(im)
    lg = logo()
    if lg:
        hh = 150; ww = round(lg.width * hh / lg.height); l2 = lg.resize((ww, hh), Image.LANCZOS)
        im.paste(l2, ((W - ww) // 2, 120), l2)
    f = fonte('IBMPlexMono-SemiBold', 50); esp = 14
    txt = 'BLACKE LAVEX'; tw = sum(f.getlength(c) + esp for c in txt) - esp; cx = (W - tw) / 2
    for i, c in enumerate(txt):
        d.text((cx, 310), c, font=f, fill=VIOLETA if i > 6 else TEXTO); cx += f.getlength(c) + esp
    d.text((W / 2, 410), 'Mural de sites e marcas', font=fonte('SpaceGrotesk-Bold', 46), fill=TEXTO, anchor='mm')
    d.text((W / 2, 466), 'Publique seu link com capa e legenda. Grátis, sem cadastro.', font=fonte('SpaceGrotesk-Regular', 27), fill=MUTED, anchor='mm')
    d.text((W / 2, H - 56), 'blackelavex.online', font=fonte('IBMPlexMono-Medium', 22), fill=DIM, anchor='mm')
    return im

def gerar(q):
    s = (q.get('s') or [''])[0]; p = (q.get('p') or [''])[0]
    if re.fullmatch(r'\d{1,12}', s):
        a = pedir(f'/rest/v1/sites_publicos?select=id,brand_name,categoria,image_url,handle,cliques,verificado&id=eq.{s}&oculto=eq.false&denuncias=lt.5&limit=1')
        if a:
            site = a[0]; foto = None; regra = (False, False)
            if site.get('handle'):
                pf = pedir('/rest/v1/rpc/perfil_publico', {'p_handle': site['handle']})
                if pf:
                    regra = regras(pf)
                    if pf.get('foto'): foto = baixar_imagem(pf['foto'], 300)
            return cartao_site(site, foto, regra)
    h = p.lstrip('@').lower()
    if re.fullmatch(r'[a-z0-9_]{3,30}', h):
        pf = pedir('/rest/v1/rpc/perfil_publico', {'p_handle': h})
        if pf and pf.get('handle'):
            sites = pedir(f"/rest/v1/sites_publicos?select=image_url&handle=eq.{pf['handle']}&oculto=eq.false&denuncias=lt.5&order=cliques.desc&limit=3") or []
            return cartao_perfil(pf, sites)
    return cartao_mural()

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            img = gerar(parse_qs(urlparse(self.path).query))
            # o WhatsApp ignora imagens de prévia acima de ~300 KB: reduz a qualidade até caber
            for qual in (88, 80, 72, 64, 56):
                buf = io.BytesIO(); img.save(buf, 'JPEG', quality=qual, optimize=True, progressive=True)
                corpo = buf.getvalue()
                if len(corpo) <= 280_000: break
            self.send_response(200)
            self.send_header('Content-Type', 'image/jpeg')
            self.send_header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
        except Exception:
            self.send_response(302)
            self.send_header('Location', '/icon-512.png')
            corpo = b''
        self.send_header('Content-Length', str(len(corpo)))
        self.end_headers()
        if corpo: self.wfile.write(corpo)
