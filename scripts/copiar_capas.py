"""Copia o bucket 'capas' do Supabase principal para o reserva (só o que falta; apaga o que sumiu)."""
import json, os, sys, urllib.request, urllib.parse

MAIN, RES = os.environ['MAIN_URL'], os.environ['RESERVA_URL']
KM, KR = os.environ['MAIN_SERVICE_KEY'], os.environ['RESERVA_SERVICE_KEY']
B = 'capas'

def req(url, key, method='GET', data=None, ctype='application/json'):
    h = {'apikey': key, 'Authorization': 'Bearer ' + key}
    if data is not None: h['Content-Type'] = ctype
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    with urllib.request.urlopen(r, timeout=60) as resp:
        return resp.read()

def listar(base, key):
    nomes, off = set(), 0
    while True:
        body = json.dumps({'prefix': '', 'limit': 1000, 'offset': off, 'sortBy': {'column': 'name', 'order': 'asc'}}).encode()
        itens = json.loads(req(f'{base}/storage/v1/object/list/{B}', key, 'POST', body))
        nomes |= {i['name'] for i in itens if i.get('id')}
        if len(itens) < 1000: return nomes
        off += 1000

# garante o bucket público no reserva
try:
    req(f'{RES}/storage/v1/bucket', KR, 'POST', json.dumps({'id': B, 'name': B, 'public': True}).encode())
    print('bucket criado no reserva')
except urllib.error.HTTPError as e:
    if e.code not in (400, 409): raise

origem, destino = listar(MAIN, KM), listar(RES, KR)
faltam, sobram = sorted(origem - destino), sorted(destino - origem)
print(f'capas no principal: {len(origem)} | no reserva: {len(destino)} | copiar: {len(faltam)} | remover: {len(sobram)}')

erros = 0
for n in faltam:
    try:
        dado = req(f'{MAIN}/storage/v1/object/{B}/{urllib.parse.quote(n)}', KM)
        req(f'{RES}/storage/v1/object/{B}/{urllib.parse.quote(n)}', KR, 'POST', dado, 'image/jpeg')
    except Exception as e:
        erros += 1; print('falhou', n, e)
if sobram:
    req(f'{RES}/storage/v1/object/{B}', KR, 'DELETE', json.dumps({'prefixes': sobram}).encode())
print('pronto' + (f' ({erros} falhas)' if erros else ''))
sys.exit(1 if erros > len(faltam) // 2 and erros else 0)
