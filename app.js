const SUPABASE_URL = 'https://wyjrjioipqfltdyupfna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU';

/* Banco reserva: cópia semanal do principal. Se o principal não responder, o site lê daqui (só leitura). */
const RESERVA_URL = 'https://ldghexvlbkiqduzlpdss.supabase.co';
const RESERVA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ2hleHZsYmtpcWR1emxwZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjgzNzAsImV4cCI6MjEwMjkwNDM3MH0.MJOsPqcyc5J5TRH_JxvpH0Eul_v9bwfSeab-bFLe6vM';
let _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const MODO = { reserva:false };
async function responde(url, key, ms){
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try{ const r = await fetch(`${url}/rest/v1/sites_publicos?select=id&limit=1`, { headers:{ apikey:key, Authorization:'Bearer ' + key }, signal:c.signal }); return r.ok; }
  catch(_){ return false; } finally{ clearTimeout(t); }
}
async function escolherBanco(){
  if (await responde(SUPABASE_URL, SUPABASE_KEY, 6000)) return;
  if (!(await responde(RESERVA_URL, RESERVA_KEY, 4500))) return;          // os dois fora: segue no principal e mostra o erro normal
  MODO.reserva = true;
  const cli = supabase.createClient(RESERVA_URL, RESERVA_KEY);
  const LEITURA = ['meu_perfil','perfil_publico','perfis_verificados','meus_stats','site_stats_publico','perfis_selos','ranking_semana','meus_seguindo','meus_seguidores','lista_seguir','ids_em_alta'];
  const rpcOrig = cli.rpc.bind(cli);
  cli.rpc = (nome, args) => {
    if (LEITURA.includes(nome)) return rpcOrig(nome, args);
    if (!['registrar_clique','salvar_site'].includes(nome)) aviso('Publicar e editar estão pausados por alguns instantes.');
    return Promise.resolve({ data:null, error:{ message:'Publicar e editar estão pausados por alguns instantes.' } });
  };
  _supabase = cli;
  document.body.classList.add('modo-reserva');
  const b = document.createElement('div'); b.className = 'aviso-reserva'; b.setAttribute('role', 'status');
  b.textContent = 'Modo de segurança: o mural está no ar, mas publicar e editar estão pausados por alguns instantes.';
  document.body.prepend(b);
  // capas guardadas no armazenamento do principal passam a vir do reserva
  const DE = SUPABASE_URL + '/storage/', PARA = RESERVA_URL + '/storage/';
  const troca = img => { const s = img.getAttribute('src'); if (s && s.startsWith(DE)) img.setAttribute('src', PARA + s.slice(DE.length)); };
  document.querySelectorAll('img').forEach(troca);
  new MutationObserver(ms => ms.forEach(m => {
    if (m.type === 'attributes') troca(m.target);
    else m.addedNodes.forEach(n => { if (n.nodeType === 1){ if (n.tagName === 'IMG') troca(n); n.querySelectorAll && n.querySelectorAll('img').forEach(troca); } });
  })).observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:['src'] });
}
const $ = id => document.getElementById(id);
const LOC = () => ({ pt:'pt-BR', en:'en-US', es:'es-ES' })[window.blLang ? window.blLang() : 'pt'];

const COLS = 'id,brand_name,image_url,link_url,caption,categoria,cliques,owner_hash,handle,img_pos,created_at,verificado';
const PAGE = 24, LIMITE = 10;
const CATEGORIAS = ['Comunidade','Mídia','Ferramentas','Loja','Jogos','Outros'];
const S = { aba:'mural', cat:'Todas', ordem:'recentes', busca:'', pagina:0, temMais:false, seq:0,
            itens:[], meus:[], token:'', hash:'', total:0, perfil:null, dest:{ top:[], novos:[] }, destAba:'top' };
let imagemBase64 = '', editId = null;
let pos = { x:50, y:50 };   // posição da foto de capa (object-position, em %)

/* ---------- utilidades ---------- */
function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function urlSegura(u){ return /^https?:\/\//i.test(u) ? esc(u) : '#'; }
function lerLS(k){ try{ return localStorage.getItem(k); }catch(_){ return null; } }
function gravarLS(k,v){ try{ localStorage.setItem(k,v); }catch(_){} }
function aviso(msg){
  const t = $('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(aviso._t); aviso._t = setTimeout(() => t.classList.remove('on'), 3000);
}
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('');
async function sha256(t){ return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))); }

/* ---------- chave do dono (sem login) ---------- */
async function iniciarChave(){
  let t = lerLS('bl_chave');
  if (!/^[0-9a-f]{64}$/.test(t || '')){ t = hex(crypto.getRandomValues(new Uint8Array(32))); gravarLS('bl_chave', t); }
  S.token = t;
  try{ S.hash = await sha256(t); }catch(_){ S.hash = ''; }
}

/* Título que "decodifica" ao carregar */



/* ---------- modais ---------- */
function abrir(id){ $(id).hidden = false; document.body.classList.add('modal-open'); }
function fechar(id){
  $(id).hidden = true;
  if (!document.querySelector('.modal:not([hidden])')) document.body.classList.remove('modal-open');
}
function fecharTopo(m){
  if (m.id === 'modalConfirma' && confirmar._fim) return confirmar._fim(false);
  if (m.id === 'modalCadastro') return fecharModal();
  fechar(m.id);
}
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (confirmar._fim){ confirmar._fim(false); return; }
  if (!$('menu').hidden){ fecharMenu(); return; }
  const abertos = [...document.querySelectorAll('.modal:not([hidden])')];
  if (abertos.length){ fecharTopo(abertos[abertos.length-1]); return; }
  fecharFicha();
});
document.querySelectorAll('.modal').forEach(m => m.addEventListener('mousedown', e => { if (e.target === m) fecharTopo(m); }));

function confirmar({titulo, texto, botao, quem}){
  return new Promise(res => {
    $('cfTitulo').textContent = titulo; $('cfTexto').textContent = texto; $('cfOk').textContent = botao || 'Confirmar';
    document.querySelectorAll('#modalConfirma .cf-quem').forEach(n => n.remove());
    if (quem) $('cfTitulo').insertAdjacentHTML('beforebegin', `<div class="cf-quem">${miniAv(quem)}<b translate="no">@${esc(quem)}</b></div>`);
    abrir('modalConfirma');
    const fim = v => { fechar('modalConfirma'); $('cfOk').onclick = $('cfNo').onclick = null; confirmar._fim = null; res(v); };
    confirmar._fim = fim; $('cfOk').onclick = () => fim(true); $('cfNo').onclick = () => fim(false);
    setTimeout(() => $('cfNo').focus(), 50);
  });
}

/* ---------- Publicar / editar: uma tela só (prévia do card com a capa + campos) ---------- */
$('inputCat').innerHTML = CATEGORIAS.map(c => `<option>${c}</option>`).join('');
function mostrarErro(m){ const d = $('formErro'); d.textContent = m; d.hidden = false; d.scrollIntoView({ block:'center', behavior:'smooth' }); }
const PT = { src:'', w:0, h:0, zoom:1, tx:0, ty:0, capa:'', item:null, voltarPara:'mural' };

function limparForm(){
  ['inputNome','inputLink','inputLegenda'].forEach(id => $(id).value = '');
  $('inputCat').value = 'Outros'; $('legCount').textContent = '0'; $('formErro').hidden = true;
  imagemBase64 = ''; pos = { x:50, y:50 }; $('fileInput').value = '';
  Object.assign(PT, { src:'', w:0, h:0, zoom:1, tx:0, ty:0, capa:'', item:null });
  $('ptZoom').value = 1; capaUI();
}
function entrarPublicar(){
  if (S.aba !== 'publicar') PT.voltarPara = document.body.classList.contains('modo-perfil') ? 'mural' : (S.aba || 'mural');
  trocarAba('publicar', location.pathname === '/publicar' || S.aba === 'publicar');
  requestAnimationFrame(() => { capaUI(); previa(); });
}
function abrirPublicar(){
  if (MODO.reserva){ aviso('Publicar está pausado por alguns instantes. Tente de novo mais tarde.'); if (location.pathname === '/publicar') irUrl('/', null, true); return; }
  if (S.meus.length >= LIMITE){ aviso(`Você já tem ${LIMITE} sites. Exclua um para publicar outro.`); if (location.pathname === '/publicar') irUrl('/', null, true); return; }
  editId = null; limparForm();
  $('ptTitulo').textContent = 'Nova publicação'; $('btnSalvar').textContent = 'Publicar';
  entrarPublicar();
}
function abrirEditar(id){
  if (MODO.reserva){ aviso('Editar está pausado por alguns instantes. Tente de novo mais tarde.'); return; }
  const it = S.meus.find(s => String(s.id) === String(id)); if (!it) return;
  limparForm(); editId = String(it.id); PT.item = it;
  $('inputNome').value = it.brand_name || ''; $('inputLink').value = it.link_url || '';
  $('inputLegenda').value = it.caption || ''; $('legCount').textContent = $('inputLegenda').value.length;
  $('inputCat').value = CATEGORIAS.includes(it.categoria) ? it.categoria : 'Outros';
  PT.capa = it.image_url; pos = lerPos(it.img_pos);
  $('ptTitulo').textContent = 'Editar site'; $('btnSalvar').textContent = 'Salvar';
  entrarPublicar();
}
function sairPublicar(){ const d = PT.voltarPara || 'mural'; trocarAba(d === 'publicar' ? 'mural' : d); }
function fecharModal(){ editId = null; $('formErro').hidden = true; limparForm(); if (S.aba === 'publicar') sairPublicar(); }
$('btnSalvar').addEventListener('click', () => salvarSite());
$('ptVoltar').addEventListener('click', sairPublicar);

/* capa: escolher (toque ou arrastar e soltar), enquadrar arrastando e zoom */
function capaUI(){
  const img = $('ptImg'), nova = !!PT.src, temCapa = nova || !!PT.capa;
  $('ptDrop').hidden = temCapa; $('ptTrocar').hidden = !temCapa;
  $('ptZoomBox').hidden = !nova; $('ptArraste').hidden = !nova;
  $('ptCrop').classList.toggle('editavel', nova);
  img.hidden = !temCapa;
  if (nova){ if (img.getAttribute('src') !== PT.src) img.src = PT.src; img.classList.remove('fixa'); ajustarCrop(true); }
  else if (PT.capa){ img.src = PT.capa; img.classList.add('fixa'); img.removeAttribute('style'); img.style.objectPosition = posStr(); }
  else { img.removeAttribute('src'); img.removeAttribute('style'); }
}
const abrirArquivo = () => $('fileInput').click();
$('ptDrop').addEventListener('click', abrirArquivo);
$('ptTrocar').addEventListener('click', abrirArquivo);
const crop = $('ptCrop');
['dragenter','dragover'].forEach(t => crop.addEventListener(t, e => { e.preventDefault(); crop.classList.add('over'); }));
['dragleave','drop'].forEach(t => crop.addEventListener(t, e => { e.preventDefault(); crop.classList.remove('over'); }));
crop.addEventListener('drop', e => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) carregarArquivo(f); });
$('fileInput').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) carregarArquivo(f); });

function lerImagem(file, max){
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok({ src:c.toDataURL('image/jpeg', .9), w:c.width, h:c.height });
    };
    img.onerror = () => { URL.revokeObjectURL(url); falha(); };
    img.src = url;
  });
}
async function carregarArquivo(file){
  if (!/^image\//.test(file.type)){ aviso('Escolha um arquivo de imagem.'); return; }
  if (file.size > 15 * 1024 * 1024){ aviso('A imagem passa de 15 MB. Escolha uma menor.'); return; }
  try{
    const r = await lerImagem(file, 2000);
    Object.assign(PT, { src:r.src, w:r.w, h:r.h, zoom:1 }); $('ptZoom').value = 1; $('formErro').hidden = true;
    const img = $('ptImg'); img.onload = () => { img.onload = null; capaUI(); }; img.src = r.src;
  }catch(_){ aviso('Não foi possível ler essa imagem. Tente outra.'); }
}
function medidas(){ const f = $('ptCrop'); return { W:f.clientWidth, H:f.clientHeight }; }
function limitar(){
  const { W, H } = medidas(), s = Math.max(W / PT.w, H / PT.h) * PT.zoom, dw = PT.w * s, dh = PT.h * s;
  PT.tx = Math.min(0, Math.max(W - dw, PT.tx)); PT.ty = Math.min(0, Math.max(H - dh, PT.ty));
  const img = $('ptImg'); img.style.width = dw + 'px'; img.style.height = dh + 'px';
  img.style.transform = `translate(${PT.tx}px, ${PT.ty}px)`;
  return s;
}
function ajustarCrop(centralizar){
  if (!PT.w) return;
  const { W, H } = medidas(); if (!W) return;
  const s = Math.max(W / PT.w, H / PT.h) * PT.zoom;
  if (centralizar){ PT.tx = (W - PT.w * s) / 2; PT.ty = (H - PT.h * s) / 2; }
  limitar();
}
function zoomPara(z, cx, cy){
  if (!PT.src) return;
  const { W, H } = medidas(); z = Math.max(1, Math.min(3, z));
  const s0 = Math.max(W / PT.w, H / PT.h), antes = s0 * PT.zoom, depois = s0 * z;
  cx = cx ?? W / 2; cy = cy ?? H / 2;
  PT.tx = cx - (cx - PT.tx) * depois / antes; PT.ty = cy - (cy - PT.ty) * depois / antes;
  PT.zoom = z; $('ptZoom').value = z; limitar();
}
$('ptZoom').addEventListener('input', e => zoomPara(+e.target.value));
(function arrastar(){
  const f = $('ptCrop'), toques = new Map(); let ini = null, pinca = null;
  f.addEventListener('pointerdown', e => {
    if (!PT.src || e.target.closest('button')) return;
    f.setPointerCapture(e.pointerId); toques.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (toques.size === 1) ini = { x:e.clientX, y:e.clientY, tx:PT.tx, ty:PT.ty };
    if (toques.size === 2){ const [a, b] = [...toques.values()]; pinca = { d:Math.hypot(a.x - b.x, a.y - b.y), z:PT.zoom }; }
    f.classList.add('drag'); $('ptArraste').hidden = true;
  });
  f.addEventListener('pointermove', e => {
    if (!toques.has(e.pointerId)) return;
    toques.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (toques.size === 2 && pinca){
      const [a, b] = [...toques.values()], r = f.getBoundingClientRect();
      zoomPara(pinca.z * Math.hypot(a.x - b.x, a.y - b.y) / pinca.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
    }else if (ini){ PT.tx = ini.tx + e.clientX - ini.x; PT.ty = ini.ty + e.clientY - ini.y; limitar(); }
  });
  const fim = e => { toques.delete(e.pointerId); pinca = null; if (toques.size === 1){ const [p] = [...toques.values()]; ini = { x:p.x, y:p.y, tx:PT.tx, ty:PT.ty }; } else { ini = null; f.classList.remove('drag'); } };
  f.addEventListener('pointerup', fim); f.addEventListener('pointercancel', fim);
  f.addEventListener('wheel', e => { if (!PT.src) return; e.preventDefault(); const r = f.getBoundingClientRect(); zoomPara(PT.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08), e.clientX - r.left, e.clientY - r.top); }, { passive:false });
  addEventListener('resize', () => { if (S.aba === 'publicar' && PT.src) limitar(); });
})();
function recortar(){
  if (!PT.src) return;
  const { W, H } = medidas(), s = limitar(), img = $('ptImg');
  const c = document.createElement('canvas'); c.width = 960; c.height = Math.round(960 * H / W);
  c.getContext('2d').drawImage(img, -PT.tx / s, -PT.ty / s, W / s, H / s, 0, 0, c.width, c.height);
  imagemBase64 = c.toDataURL('image/jpeg', .85); pos = { x:50, y:50 };
}
const posStr = () => `${Math.round(pos.x)}% ${Math.round(pos.y)}%`;
function lerPos(s){ const m = /^(\d{1,3})% (\d{1,3})%$/.exec(s || ''); return m ? { x:Math.min(100, +m[1]), y:Math.min(100, +m[2]) } : { x:50, y:50 }; }

/* prévia ao vivo: nome, categoria, @ */
function previa(){
  const p = S.perfil, it = PT.item || {};
  $('ptNome').textContent = $('inputNome').value.trim() || 'Nome do seu site';
  $('ptSelo').innerHTML = it.verificado ? SELO : '';
  $('ptTag').textContent = $('inputCat').value;
  const h = it.handle || (p && p.handle);
  $('ptArroba').innerHTML = h ? `<span class="arroba">${miniAv(h)}<span>@${esc(h)}</span>${selosDe(h)}</span>` : '<span class="anon">anônimo</span>';
}
['inputNome','inputCat'].forEach(id => $(id).addEventListener('input', previa));
$('inputCat').addEventListener('change', previa);
$('inputLegenda').addEventListener('input', () => { $('legCount').textContent = $('inputLegenda').value.length; });

/* Envia a capa ao Supabase Storage; se falhar, segue com a imagem embutida (como antes) */
async function enviarImagem(dataUrl){
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  try{
    const blob = await (await fetch(dataUrl)).blob();
    const nome = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)).replace(/-/g, '') + '.jpg';
    const { error } = await _supabase.storage.from('capas').upload(nome, blob, { contentType:'image/jpeg', cacheControl:'31536000' });
    if (error) throw error;
    return _supabase.storage.from('capas').getPublicUrl(nome).data.publicUrl;
  }catch(_){ return dataUrl; }
}

async function salvarSite(){
  const nome = $('inputNome').value.trim(), link = $('inputLink').value.trim();
  const legenda = $('inputLegenda').value.trim(), cat = $('inputCat').value;
  const editando = !!editId, btn = $('btnSalvar'); $('formErro').hidden = true;

  if (PT.src) recortar();
  if (!editando && !imagemBase64) return mostrarErro('Escolha uma imagem de capa.');
  if (!nome || !link) return mostrarErro('Preencha o nome e o link.');
  if (!/^https?:\/\/\S+$/i.test(link)) return mostrarErro('O link precisa começar com http:// ou https://');

  btn.disabled = true; btn.textContent = editando ? 'Salvando...' : 'Publicando...';
  const voltar = PT.voltarPara;
  try{
    const imagemFinal = await enviarImagem(imagemBase64);
    if (editando){
      const { data, error } = await _supabase.rpc('editar_meu_site', { p_id:editId, p_token:S.token, p_nome:nome, p_link:link, p_legenda:legenda, p_categoria:cat, p_imagem:imagemFinal || null });
      if (error) throw error;
      if (!data) throw new Error('Esse site não pertence a esta chave.');
      await _supabase.rpc('ajustar_posicao_foto', { p_id:editId, p_token:S.token, p_pos:posStr() });
    }else{
      const { data: novoId, error } = await _supabase.rpc('publicar_site', { p_nome:nome, p_link:link, p_legenda:legenda, p_imagem:imagemFinal, p_categoria:cat, p_token:S.token });
      if (error) throw error;
      if (novoId && posStr() !== '50% 50%') await _supabase.rpc('ajustar_posicao_foto', { p_id:String(novoId), p_token:S.token, p_pos:posStr() });
    }
    aviso(editando ? 'Alterações salvas' : 'Publicado no mural');
    await buscarMeus(); atualizarMeusUI(); S._meusOk = false;
    editId = null; limparForm();
    trocarAba(editando && voltar && voltar !== 'publicar' ? voltar : 'meus');
  }catch(err){
    mostrarErro('Não foi possível salvar: ' + (err.message || 'erro desconhecido'));
  }finally{
    btn.disabled = false; if (S.aba === 'publicar') btn.textContent = editando ? 'Salvar' : 'Publicar';
  }
}

/* ---------- cards ---------- */
function efeitoCard(card){
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.setProperty('--mx', x+'px'); card.style.setProperty('--my', y+'px');

  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
}


const posSegura = s => /^(100|\d{1,2})% (100|\d{1,2})%$/.test(s || '') ? s : '50% 50%';
const ehDono = item => !!S.hash && item.owner_hash === S.hash;
/* ---------- Salvos (favoritos, só neste aparelho) ---------- */
const HEART = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
let FAVS = []; try{ FAVS = JSON.parse(localStorage.getItem('bl_fav') || '[]').map(String).slice(0, 500); }catch(_){}
const ehFav = id => FAVS.includes(String(id));
function favAlternar(id){
  id = String(id); const on = !ehFav(id);
  FAVS = on ? [id, ...FAVS] : FAVS.filter(x => x !== id);
  try{ localStorage.setItem('bl_fav', JSON.stringify(FAVS)); }catch(_){}
  if (S.token) _supabase.rpc('salvar_site', { p_id:id, p_token:S.token, p_on:on }).then(() => {}, () => {});
  document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  aviso(on ? 'Salvo no seu aparelho' : 'Removido dos salvos');
  if (!on && S.aba === 'mural' && S.cat === 'Salvos'){
    document.querySelectorAll(`#muralGrid .card[data-id="${id}"]`).forEach(c => c.remove());
    S.itens = S.itens.filter(s => String(s.id) !== id);
    if (!$('muralGrid').children.length) buscarMural(true);
  }
}

function acharItem(id){ return S.itens.concat(S.meus, S.dest.top, S.dest.novos).find(s => String(s.id) === String(id)); }
function acoesDe(item){
  const l = [
    { act:'detalhes', ic:'fa-regular fa-rectangle-list', txt:'Ver detalhes' },
    { act:'copiar',   ic:'fa-regular fa-copy',           txt:'Copiar link' },
    { act:'fav',      ic: ehFav(item.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart', txt: ehFav(item.id) ? 'Remover dos salvos' : 'Salvar' }
  ];
  l.push({ act:'linkmural', ic:'fa-solid fa-link', txt:'Link no BLACKE' });
  if (navigator.share) l.push({ act:'compartilhar', ic:'fa-solid fa-share-nodes', txt:'Compartilhar' });
  if (ehDono(item)){
    if (S.aba === 'meus') l.push({ act:'editar', ic:'fa-solid fa-pen', txt:'Editar' }, { act:'excluir', ic:'fa-solid fa-trash', txt:'Excluir', danger:true });
  } else l.push({ act:'denunciar', ic:'fa-regular fa-flag', txt:'Denunciar' });
  return l;
}
const SELO = '<svg class="selo" viewBox="0 0 24 24" role="img" aria-label="Verificado"><title>Verificado</title><path fill="currentColor" d="M12 1.6l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3-2.6 1.9-1 3.1-3.2-.1L12 22.4l-2.6-1.9-3.2.1-1-3.1-2.6-1.9 1-3-1-3.1 2.6-1.9 1-3 3.2.1z"/><path fill="none" stroke="#06070d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M7.8 12.3l2.8 2.8 5.6-5.8"/></svg>';
const selo = it => it && it.verificado ? SELO : '';
const META_V = 1000;     // acessos somados nos sites do perfil para ganhar o selo azul (verificado)
const META_SELO = 10000; // ... e o Selo BLACKE (ninja). O admin também pode dar os dois à mão.
const SELO_BLACKE = '<span class="selo-b" role="img" aria-label="Selo BLACKE" title="Selo BLACKE"><svg class="sb-hex" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9l9.6 5.5v11.2L12 23.1 2.4 17.6V6.4z" fill="#4a3fd6"/><path d="M12 .9L2.4 6.4V12L12 6.4z" fill="#8d7fff" opacity=".75"/><path d="M12 .9l9.6 5.5v11.2L12 23.1 2.4 17.6V6.4z" fill="none" stroke="#6fd6ff" stroke-width=".9" stroke-linejoin="round" opacity=".9"/><path d="M17.9 8.3l3.1-1.7-.9 2.6 1.5 1.8-3.3-.4z" fill="#000"/><circle cx="12" cy="12.6" r="6.9" fill="#000"/><path d="M6.38 8.6H17.62A6.9 6.9 0 0 1 18.35 9.9H5.65A6.9 6.9 0 0 1 6.38 8.6Z" fill="#7b6cff"/><path d="M6.8 12.3L10.4 13.3C10.9 13.5 10.9 14.1 10.4 14.3L8 14.9C7.2 15.1 6.5 14.6 6.6 13.9Z" fill="#a99bff"/><path transform="matrix(-1 0 0 1 24 0)" d="M6.8 12.3L10.4 13.3C10.9 13.5 10.9 14.1 10.4 14.3L8 14.9C7.2 15.1 6.5 14.6 6.6 13.9Z" fill="#a99bff"/></svg></span>';
const temVerif = p => !!p && (!!p.verificado || (+p.acessos || 0) >= META_V);
const temSeloB = p => !!p && (!!p.selo || (+p.acessos || 0) >= META_SELO);
const seloElite = p => temSeloB(p) ? SELO_BLACKE : '';
const VERIF = new Set(), NINJA = new Set(), FOTOS = new Map();
const selosDe = h => (VERIF.has(h) ? SELO : '') + (NINJA.has(h) ? SELO_BLACKE : '');
const miniAv = h => { const f = FOTOS.get(h); return `<span class="amini" aria-hidden="true">${f ? `<img src="${esc(f)}" alt="" loading="lazy" decoding="async">` : esc(String(h).charAt(0).toUpperCase())}</span>`; };
const arrobaBtn = h => `<button class="arroba" type="button" data-act="perfil" data-h="${esc(h)}" translate="no">${miniAv(h)}<span>@${esc(h)}</span>${selosDe(h)}</button>`;
async function carregarVerificados(){
  try{
    let v = null, n = [];
    const r = await _supabase.rpc('perfis_selos');
    if (!r.error && r.data && Array.isArray(r.data.v)){ v = r.data.v; n = r.data.n || []; Object.entries(r.data.f || {}).forEach(([h, u]) => { if (/^https:\/\//.test(u)) FOTOS.set(h, u); }); }
    else { const r2 = await _supabase.rpc('perfis_verificados'); v = r2.data || []; }
    v.forEach(h => VERIF.add(h)); n.forEach(h => NINJA.add(h));
    document.querySelectorAll('.arroba[data-h]').forEach(b => {
      const h = b.dataset.h, novo = selosDe(h);
      const av = b.querySelector('.amini'); if (av && av.outerHTML !== miniAv(h)) av.outerHTML = miniAv(h); else if (!av) b.insertAdjacentHTML('afterbegin', miniAv(h));
      if (b.querySelectorAll('.selo,.selo-b').length === (novo.match(/class="selo/g) || []).length) return;
      b.querySelectorAll('.selo,.selo-b').forEach(x => x.remove()); b.insertAdjacentHTML('beforeend', novo);
    });
    if (RANK) desenharRanking();
  }catch(_){}
}
function criarCard(item, i){
  const n = item.cliques || 0;
  const card = document.createElement('article');
  card.className = 'card'; card.dataset.id = item.id; card.style.setProperty('--i', Math.min(i, 12));
  card.innerHTML = `
    <div class="cover" data-act="detalhes" role="button" tabindex="0" aria-label="Ver detalhes de ${esc(item.brand_name)}">
      <img src="${esc(item.image_url)}" alt="Capa de ${esc(item.brand_name)}" loading="lazy" decoding="async" style="object-position:${posSegura(item.img_pos)}"
           onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'">
      <span class="tag">${esc(item.categoria || 'Outros')}</span>
      <button class="fav-btn${ehFav(item.id) ? ' on' : ''}" type="button" data-act="fav" data-id="${esc(item.id)}" aria-pressed="${ehFav(item.id)}" aria-label="Salvar">${HEART}</button>
      ${item.caption ? `<div class="cv-leg" translate="no"><p>${esc(item.caption)}</p></div>` : ''}
      <span class="vistas" title=""${n} ${n === 1 ? 'acesso' : 'acessos'}"><i class="fa-regular fa-eye"></i> ${n}</span>
    </div>
    <div class="body">
      <h3 data-act="detalhes" translate="no"><span>${esc(item.brand_name)}</span>${selo(item)}</h3>
      <div class="line2">
        ${item.handle ? arrobaBtn(item.handle) : '<span class="anon">anônimo</span>'}
      </div>
      <div class="rx" data-rx="${esc(item.id)}">${rxHTML(item.id)}</div>
    </div>
    <div class="foot">
      <a class="visit" data-act="visitar" href="${urlSegura(item.link_url)}" target="_blank" rel="noopener noreferrer">
        <span>Acessar site</span><i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
      <button class="sq" type="button" data-act="menu" aria-label="Mais opções" aria-haspopup="menu"><i class="fa-solid fa-ellipsis-vertical"></i></button>
    </div>`;
  card.querySelector('.cover').addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); abrirFicha(item.id); } });
  efeitoCard(card);
  return card;
}
function anexar(lista, reset){
  const grid = $('muralGrid'); if (reset) grid.innerHTML = '';
  lista.forEach((it, i) => grid.appendChild(criarCard(it, i)));
  carregarReacoes(lista.map(s => s.id));
}

/* ---------- Reações (estilo Telegram, só positivas) ---------- */
const RX = [['fogo','🔥'],['like','👍'],['coracao','❤️'],['amei','😍'],['palmas','👏'],['foguete','🚀']];
const RXE = Object.fromEntries(RX);
const RXT = new Map(), RXM = new Map();   // totais por site e minhas reações
function rxHTML(id){
  id = String(id); const t = RXT.get(id) || {}, m = RXM.get(id) || [];
  const bolhas = RX.filter(([k]) => t[k] > 0).map(([k, e]) => `<button type="button" class="rx-b${m.includes(k) ? ' on' : ''}" data-rxe="${k}" aria-pressed="${m.includes(k)}" aria-label="${e} ${t[k]}"><span>${e}</span><b>${fmtN(t[k])}</b></button>`).join('');
  return bolhas + `<button type="button" class="rx-add" data-rxadd aria-label="Reagir"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01"/></svg><i>+</i></button>`;
}
function rxRedesenhar(id){ document.querySelectorAll(`[data-rx="${CSS.escape(String(id))}"]`).forEach(el => { el.innerHTML = rxHTML(id); }); }
async function carregarReacoes(ids){
  ids = [...new Set(ids.map(String))].filter(id => !RXT.has(id)).slice(0, 200); if (!ids.length) return;
  try{
    const [t, m] = await Promise.all([
      _supabase.rpc('reacoes_de', { p_ids:ids }),
      S.token ? _supabase.rpc('minhas_reacoes', { p_ids:ids, p_token:S.token }) : Promise.resolve({ data:{} })
    ]);
    ids.forEach(id => { RXT.set(id, (t.data || {})[id] || {}); RXM.set(id, (m.data || {})[id] || []); rxRedesenhar(id); });
  }catch(_){}
}
async function reagir(id, k){
  // uma reação por pessoa: escolher outro emoji troca o anterior; tocar no mesmo tira
  id = String(id); const m = RXM.get(id) || [], antes = { ...(RXT.get(id) || {}) }, on = !m.includes(k), t = { ...antes };
  m.forEach(x => { t[x] = Math.max(0, (t[x] || 0) - 1); });
  if (on) t[k] = (t[k] || 0) + 1;
  RXT.set(id, t); RXM.set(id, on ? [k] : []); rxRedesenhar(id);   // resposta imediata
  try{
    const { data, error } = await _supabase.rpc('reagir', { p_id:id, p_emoji:k, p_token:S.token, p_on:on });
    if (error) throw error;
    RXT.set(id, data || {}); rxRedesenhar(id);
  }catch(err){
    RXT.set(id, antes); RXM.set(id, m); rxRedesenhar(id);
    aviso(err.message || 'Não foi possível reagir.');
  }
}
let rxPop = null;
function fecharRxPop(){ if (rxPop){ rxPop.remove(); rxPop = null; } }
function abrirRxPop(btn, id){
  fecharRxPop();
  const p = document.createElement('div'); p.className = 'rx-pop'; p.setAttribute('role', 'menu');
  const m = RXM.get(String(id)) || [];
  p.innerHTML = RX.map(([k, e]) => `<button type="button" role="menuitem" data-rxpick="${k}" class="${m.includes(k) ? 'on' : ''}" aria-label="${e}">${e}</button>`).join('');
  document.body.appendChild(p); rxPop = p; p.dataset.id = id;
  const r = btn.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
  let x = Math.min(innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)), y = r.top - h - 8;
  if (y < 8) y = r.bottom + 8;
  p.style.left = x + 'px'; p.style.top = y + 'px';
}
document.addEventListener('click', e => {
  const pick = e.target.closest('[data-rxpick]');
  if (pick){ e.stopPropagation(); reagir(rxPop.dataset.id, pick.dataset.rxpick); fecharRxPop(); return; }
  const add = e.target.closest('[data-rxadd]'), b = e.target.closest('[data-rxe]');
  if (add || b){
    e.preventDefault(); e.stopPropagation();
    const id = e.target.closest('[data-rx]').dataset.rx;
    if (add) abrirRxPop(add, id); else reagir(id, b.dataset.rxe);
    return;
  }
  if (rxPop && !e.target.closest('.rx-pop')) fecharRxPop();
}, true);
addEventListener('scroll', fecharRxPop, { passive:true });
addEventListener('keydown', e => { if (e.key === 'Escape') fecharRxPop(); });
function setEstado(html, aviso_){ const e = $('estado'); e.className = 'estado' + (aviso_ ? ' warn' : ''); e.innerHTML = html || ''; }
const BTN_NOVO = '<br><button class="btn-primary" data-act="novo" style="margin-top:14px"><i class="fa-solid fa-plus"></i> Publicar link</button>';
/* Estados vazios e de erro: ícone, título, texto e botão */
const ICV = {
  grade:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  busca:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  coracao:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  pasta:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  estrela:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  erro:'<path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',
  chave:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>'
};
const BTNV = {
  publicar:'<button class="btn-primary" type="button" data-act="novo">Publicar link</button>',
  limpar:'<button class="btn-ghost" type="button" data-vz="limpar">Limpar busca e filtros</button>',
  mural:'<button class="btn-ghost" type="button" data-vz="mural">Ver o mural</button>',
  tentar:'<button class="btn-primary" type="button" data-vz="tentar">Tentar de novo</button>'
};
function vazio(ic, titulo, texto, botoes){
  return `<div class="vz"><span class="vz-ic"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICV[ic] || ''}</svg></span>
    <h3>${titulo}</h3><p>${texto}</p>${botoes && botoes.length ? `<div class="vz-btns">${botoes.map(b => BTNV[b]).join('')}</div>` : ''}</div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-vz]'); if (!b) return;
  const v = b.dataset.vz;
  if (v === 'limpar' || v === 'mural'){ S.busca = ''; $('busca').value = ''; resetChips(); document.querySelector('.topbar')?.classList.remove('buscando'); if (S.aba !== 'mural') trocarAba('mural'); else buscarMural(true); }
  else if (v === 'tentar'){ if (S.aba === 'destaques') abrirDestaques(); else trocarAba(S.aba, true, true); }
});
function skeleton(){ $('muralGrid').innerHTML = '<div class="skeleton"></div>'.repeat(4); setEstado(''); $('maisBtn').hidden = true; }
function erroCarga(err){
  console.error(err);
  $('muralGrid').innerHTML = ''; $('maisBtn').hidden = true;
  const desatualizado = err && (err.code === '42703' || /column|function/i.test(err.message || ''));
  setEstado(desatualizado ? 'O banco ainda não foi atualizado. Rode o arquivo supabase.sql no Supabase.' : vazio('erro', 'Não foi possível carregar', 'Verifique sua conexão e tente de novo em instantes.', ['tentar']), desatualizado);
}

/* ---------- menu ⋯, detalhes e copiar ---------- */
let menuId = null;
function fecharMenu(){ $('menu').hidden = true; $('menuBack').hidden = true; menuId = null; }
function abrirMenu(btn, id){
  if (menuId === String(id) && !$('menu').hidden){ fecharMenu(); return; }
  const it = acharItem(id); if (!it) return;
  const m = $('menu');
  m.innerHTML = acoesDe(it).map(a => `<button class="mi${a.danger ? ' danger' : ''}" role="menuitem" data-act="${a.act}" data-id="${esc(id)}"><i class="${a.ic}"></i>${a.txt}</button>`).join('');
  menuId = String(id); $('menuBack').hidden = false; m.hidden = false;
  if (innerWidth > 640){
    const r = btn.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = Math.min(Math.max(8, r.right - w), innerWidth - w - 8) + 'px';
    let top = r.bottom + 6; if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 6);
    m.style.top = top + 'px';
  }
  m.querySelector('.mi')?.focus();
}
addEventListener('scroll', () => { if (!$('menu').hidden) fecharMenu(); }, { passive:true });
addEventListener('resize', () => { if (!$('menu').hidden) fecharMenu(); });

async function copiarLink(id){
  const it = acharItem(id); if (!it) return;
  try{ await navigator.clipboard.writeText(it.link_url); }
  catch(_){ const t = document.createElement('textarea'); t.value = it.link_url; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  aviso('Link copiado');
}
async function compartilhar(id){
  const it = acharItem(id); if (!it) return;
  try{ await navigator.share({ title:it.brand_name, text:it.brand_name + ' — BLACKE LAVEX', url:it.link_url }); }catch(_){}
}

/* Links próprios do mural: /s/ID (site) e /@nome (perfil), com prévia no WhatsApp/Telegram */
async function enviarLink(url, titulo, texto){
  if (navigator.share){ try{ await navigator.share({ title:titulo, text:texto, url }); return; }catch(e){ if (e && e.name === 'AbortError') return; } }
  try{ await navigator.clipboard.writeText(url); }
  catch(_){ const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  aviso('Link copiado');
}
function linkMural(id){ const it = acharItem(id); if (it) enviarLink(`${location.origin}/s/${it.id}`, it.brand_name, it.brand_name + ' — BLACKE LAVEX'); }
function linkPerfil(h){ enviarLink(`${location.origin}/@${h}`, '@' + h, '@' + h + ' no BLACKE LAVEX'); }

/* ---------- Painel completo do site ---------- */
let fichaTimer = null, fichaFoco = null;
const hostDe = u => { try{ return new URL(u).hostname.replace(/^www\./, ''); }catch(_){ return u; } };
function relacionados(it, excluir){
  const mapa = new Map(); S.itens.concat(S.meus).forEach(s => { if (String(s.id) !== String(it.id) && !(excluir && excluir.has(String(s.id)))) mapa.set(String(s.id), s); });
  const todos = [...mapa.values()];
  const pts = s => (it.handle && s.handle === it.handle ? 2 : 0) + (s.categoria === it.categoria ? 1 : 0);
  const afins = todos.filter(s => pts(s) > 0).sort((a, b) => pts(b) - pts(a));
  return afins.concat(todos.filter(s => !afins.includes(s))).slice(0, 4);
}
function recomecarAnimacao(){
  document.querySelectorAll('#ficha .rise').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
}
function atualizarTitulo(){
  const B = 'BLACKE LAVEX';
  const f = $('ficha'), aberta = f && !f.hidden && f.classList.contains('on') && S.fichaId;
  const it = aberta && (acharItem(S.fichaId) || S.meus.find(s => String(s.id) === S.fichaId));
  if (it){ document.title = it.brand_name + ' — ' + B; return; }
  if (document.body.classList.contains('modo-perfil') && S.busca.startsWith('@')){ document.title = S.busca + ' — ' + B; return; }
  document.title = ({ destaques:'Destaques — ' + B, meus:'Conta — ' + B, publicar:'Publicar — ' + B })[S.aba] || B + ' — Mural anônimo';
}
const _tituloBase = atualizarTitulo;
atualizarTitulo = function(){ _tituloBase(); if (typeof NT !== 'undefined' && NT.n > 0) document.title = `(${NT.n > 9 ? '9+' : NT.n}) ` + document.title; };
const ROTA = { mural:'/', destaques:'/destaques', meus:'/conta', publicar:'/publicar' };
// a Conta usa o endereço do próprio @ (/@nome); sem @ reservado, /conta
const rotaDe = aba => aba === 'meus' && S.perfil && S.perfil.handle ? '/@' + S.perfil.handle : (ROTA[aba] || '/');
function urlBase(){ return document.body.classList.contains('modo-perfil') && S.busca.startsWith('@') ? '/@' + S.busca.slice(1) : rotaDe(S.aba); }
function irUrl(url, state, trocar){
  try{
    if (location.pathname === url && !location.search) trocar = true;
    history[trocar ? 'replaceState' : 'pushState'](state ?? null, '', url);
  }catch(_){}
}
function abrirFicha(id){
  S.fichaId = String(id); setTimeout(atualizarTitulo, 0);
  const it = acharItem(id); if (!it) return;
  const w = $('ficha'), n = it.cliques || 0;
  const img = $('fcImg'); img.style.display = ''; img.onerror = () => { img.style.display = 'none'; };
  img.src = it.image_url; img.style.objectPosition = posSegura(it.img_pos);
  $('fcCat').textContent = it.categoria || 'Outros';
  $('fcNome').innerHTML = esc(it.brand_name) + selo(it);
  $('mAcessos').textContent = `${n} ${n === 1 ? 'acesso' : 'acessos'}`;
  $('mData').textContent = it.created_at ? 'Publicado em ' + new Date(it.created_at).toLocaleDateString(LOC()) : 'Data não informada';
  $('mPerfil').innerHTML = it.handle ? arrobaBtn(it.handle) : '<span class="anon">anônimo</span>';
  const fr = $('fcRx'); fr.dataset.rx = it.id; fr.innerHTML = rxHTML(it.id); carregarReacoes([it.id]);
  const leg = $('fcLegenda'); leg.translate = !it.caption; leg.textContent = it.caption || 'Este site ainda não tem legenda.'; leg.classList.toggle('vazia', !it.caption);

  const extras = acoesDe(it).filter(a => a.act !== 'detalhes' && a.act !== 'copiar');
  $('pnBox').innerHTML = `
    <a class="btn-primary pn-go" data-act="visitar" data-id="${esc(it.id)}" href="${urlSegura(it.link_url)}" target="_blank" rel="noopener noreferrer"><span>Acessar site</span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
    <div class="pn-sec">
      <button class="btn-ghost" type="button" data-act="copiar" data-id="${esc(it.id)}"><i class="fa-regular fa-copy"></i><span>Copiar link</span></button>
      ${extras.map(a => `<button class="btn-ghost${a.danger ? ' btn-danger' : ''}" type="button" data-act="${a.act}" data-id="${esc(it.id)}" aria-label="${a.txt}"><i class="${a.ic}"></i><span>${a.txt}</span></button>`).join('')}
    </div>
    <p class="pn-note">O site abre em uma nova aba. O BLACKE LAVEX não controla o conteúdo dos links publicados.</p>`;

  const cardRel = s => `
    <button class="rel" type="button" data-act="detalhes" data-id="${esc(s.id)}">
      <span class="rel-img"><img src="${esc(s.image_url)}" alt="" loading="lazy" decoding="async" style="object-position:${posSegura(s.img_pos)}"></span>
      <b>${esc(s.brand_name)}${selo(s)}</b><small>${esc(s.categoria || 'Outros')}</small>
    </button>`;
  // Mais deste perfil (mesmo @)
  const mapaM = new Map(); S.itens.concat(S.meus, S.dest.top, S.dest.novos).forEach(s => { if (it.handle && s.handle === it.handle && String(s.id) !== String(it.id)) mapaM.set(String(s.id), s); });
  const mais = [...mapaM.values()].slice(0, 4);
  $('pnMais').hidden = !mais.length;
  $('pnMaisT').innerHTML = it.handle ? `Mais de <span translate="no">@${esc(it.handle)}</span>` : '';
  $('pnMaisRel').innerHTML = mais.map(cardRel).join('');
  const rel = relacionados(it, new Set(mais.map(s => String(s.id))));
  $('pnVeja').hidden = !rel.length;
  $('pnRel').innerHTML = rel.map(s => `
    <button class="rel" type="button" data-act="detalhes" data-id="${esc(s.id)}">
      <span class="rel-img"><img src="${esc(s.image_url)}" alt="" loading="lazy" decoding="async" style="object-position:${posSegura(s.img_pos)}"></span>
      <b>${esc(s.brand_name)}${selo(s)}</b><small>${esc(s.categoria || 'Outros')}</small>
    </button>`).join('');

  const aberta = !w.hidden && w.classList.contains('on');
  clearTimeout(fichaTimer);
  if (aberta){                                           // trocou de site com o painel já aberto
    $('pnScroll').scrollTo({ top:0, behavior:'smooth' }); recomecarAnimacao();
    if (!S.rotaSilenciosa) irUrl('/s/' + id, { ficha:String(id) }, true);
  }else{
    fichaFoco = document.activeElement;
    w.classList.remove('sai'); w.hidden = false; document.body.classList.add('ficha-open');
    $('pnScroll').scrollTop = 0; void w.offsetWidth;     // reinicia as animações
    requestAnimationFrame(() => { w.classList.add('on'); w.focus({ preventScroll:true }); });
    if (!S.rotaSilenciosa) irUrl('/s/' + id, { ficha:String(id) });
  }
}
function fecharFicha(voltar = true){
  const w = $('ficha'); if (w.hidden || !w.classList.contains('on')) return;
  w.classList.add('sai'); w.classList.remove('on'); document.body.classList.remove('ficha-open');
  clearTimeout(fichaTimer);
  fichaTimer = setTimeout(() => { w.hidden = true; try{ fichaFoco?.focus({ preventScroll:true }); }catch(_){} }, 460);
  if (voltar){
    if (history.state && history.state.ficha && !S.fichaEntrada){ try{ history.back(); }catch(_){} }
    else irUrl(urlBase(), null, true);
  }
  S.fichaEntrada = false; setTimeout(atualizarTitulo, 0);
}
addEventListener('keydown', e => {                                // Tab não escapa do painel
  if (e.key !== 'Tab' || $('ficha').hidden || document.querySelector('.modal:not([hidden])')) return;
  const f = [...$('ficha').querySelectorAll('a[href],button:not([disabled])')].filter(x => x.getClientRects().length);
  if (!f.length) return;
  const p = f[0], u = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === p || document.activeElement === $('ficha'))){ e.preventDefault(); u.focus(); }
  else if (!e.shiftKey && document.activeElement === u){ e.preventDefault(); p.focus(); }
});

/* ---------- Tela de carregamento ---------- */
const splash = { t0: performance.now(), feito: false };
function fecharSplash(){
  if (splash.feito) return; splash.feito = true;
  const el = $('splash'); if (!el) return;
  setTimeout(() => {
    el.classList.add('sai'); document.body.classList.remove('carregando');
    setTimeout(() => el.remove(), 800);
  }, Math.max(0, 350 - (performance.now() - splash.t0)));       // rápida: só o suficiente para não piscar
}
setTimeout(fecharSplash, 7000);

/* ---------- Mural ---------- */
let ALTA = [], ALTA_T = 0;
async function carregarAlta(){
  if (Date.now() - ALTA_T < 300000) return;
  try{ const { data, error } = await _supabase.rpc('ids_em_alta', { p_limite:200 }); if (!error && Array.isArray(data)){ ALTA = data; ALTA_T = Date.now(); } }catch(_){}
}
async function buscarMural(reset){
  if (typeof desenharRanking === 'function') setTimeout(desenharRanking, 0);
  const meu = ++S.seq;
  if (reset){ S.pagina = 0; S.itens = []; if (S.aba === 'mural') skeleton(); }
  try{
    let q = _supabase.from('sites_publicos').select(COLS, { count:'exact' }).lt('denuncias', 5).eq('oculto', false);
    if (S.cat === 'Salvos') q = q.in('id', FAVS.length ? FAVS.slice(0, 200) : [0]);
    else if (S.cat === 'Seguindo') q = q.in('handle', SEGUINDO.size ? [...SEGUINDO].slice(0, 200) : ['-']);
    else if (S.cat === 'Verificados' || S.cat === 'Selo BLACKE'){
      if (!VERIF.size && !NINJA.size) await carregarVerificados();
      if (meu !== S.seq) return;
      const conj = S.cat === 'Verificados' ? VERIF : NINJA;
      q = q.in('handle', conj.size ? [...conj].slice(0, 200) : ['-']);
    }
    else if (S.cat !== 'Todas') q = q.eq('categoria', S.cat);
    const porArroba = S.busca.startsWith('@');
    if (porArroba){
      const h = normArroba(S.busca);
      q = q.ilike('handle', (h || '-').replace(/_/g, '\\_') + '%');
      if (reset) mostrarPerfil(h);
    }else{
      const t = S.busca.replace(/[%,()*\\]/g, ' ').trim();
      if (t) q = q.or(`brand_name.ilike.%${t}%,caption.ilike.%${t}%,handle.ilike.%${t}%,categoria.ilike.%${t}%`);
      if (reset) $('perfilBox').hidden = true;
    }
    // "Em alta": mais acessados nos últimos 7 dias (ordem vem do banco; sem dados, cai em "mais acessados")
    let alta = false;
    if (S.ordem === 'alta'){ await carregarAlta(); if (meu !== S.seq) return; if (ALTA.length){ alta = true; q = q.in('id', ALTA); } }
    if (!alta) q = (S.ordem === 'acessos' || S.ordem === 'alta')
      ? q.order('cliques', { ascending:false }).order('id', { ascending:false })
      : q.order('created_at', { ascending:false }).order('id', { ascending:false });
    const de = S.pagina * PAGE;
    const { data, error, count } = await (alta ? q.limit(200) : q.range(de, de + PAGE));
    if (meu !== S.seq) return;            // chegou uma busca mais nova
    if (error) throw error;
    if (S.aba !== 'mural'){ fecharSplash(); return; }   // já saiu do mural (ex.: abriu a Conta): não joga sites de outros @ na tela
    let lote = (data || []).slice(0, alta ? 200 : PAGE);
    if (alta){ const pos = new Map(ALTA.map((id, i) => [String(id), i])); lote.sort((x, y) => pos.get(String(x.id)) - pos.get(String(y.id))); lote = lote.slice(de, de + PAGE); }
    S.temMais = alta ? (data || []).length > de + PAGE : (data || []).length > PAGE; S.total = count ?? lote.length;
    S.itens = S.itens.concat(lote);
    anexar(lote, reset);
    $('contador').textContent = `${S.total} ${S.total === 1 ? 'site' : 'sites'}`;
    $('maisBtn').hidden = !S.temMais; $('maisBtn').disabled = false; $('maisBtn').textContent = 'Carregar mais';
    vigiarFim();
    if (!S.itens.length){
      const filtrando = S.busca || S.cat !== 'Todas';
      setEstado((S.cat === 'Verificados' || S.cat === 'Selo BLACKE') && !S.busca ? vazio('busca', 'Nenhum perfil com esse selo ainda', S.cat === 'Selo BLACKE' ? 'O Selo BLACKE é conquistado aos 10 mil acessos.' : 'O selo verificado é conquistado aos mil acessos.', ['mural'])
        : S.cat === 'Seguindo' && !S.busca ? vazio('coracao', 'Você ainda não segue ninguém', S.perfil && S.perfil.handle ? 'Abra um perfil e toque em Seguir para ver os sites dele aqui.' : 'Reserve seu @ e siga perfis para ver os sites deles aqui.', ['mural'])
        : S.cat === 'Salvos' && !S.busca ? vazio('coracao', 'Nenhum site salvo', 'Toque no ♥ de um card para guardar aqui.', ['mural'])
        : filtrando ? vazio('busca', 'Nada encontrado', 'Tente outra busca ou categoria.', ['limpar'])
        : vazio('grade', 'O mural está vazio', 'Seja o primeiro a publicar um site.', ['publicar']));
    } else setEstado('');
    fecharSplash();
  }catch(err){ if (meu === S.seq && S.aba === 'mural') erroCarga(err); fecharSplash(); }
}

/* ---------- Meus sites ---------- */
async function buscarMeus(){
  if (!S.hash){ S.meus = []; return; }
  const { data, error } = await _supabase.from('sites_publicos').select(COLS).eq('owner_hash', S.hash)
    .order('created_at', { ascending:false }).order('id', { ascending:false });
  if (error) throw error;
  S.meus = data || [];
}
function atualizarMeusUI(){
  const n = S.meus.length, acessos = S.meus.reduce((a, s) => a + (s.cliques || 0), 0);
  $('nMeus').textContent = n; $('stSites').textContent = n; $('stAcessos').textContent = acessos;
  $('stLimite').textContent = Math.max(0, LIMITE - n); $('btnExcluirTodos').disabled = n === 0;
  desenharMeuPerfil();
}
function desenharMeus(){
  $('maisBtn').hidden = true; anexar(S.meus, true); atualizarMeusUI(); marcarInsights();
  setEstado(S.meus.length ? '' : (S.hash ? vazio('pasta', 'Nenhum site publicado', 'Os sites que você publicar neste navegador aparecem aqui.', ['publicar']) : vazio('chave', 'Chave bloqueada', 'Seu navegador bloqueou o recurso de chave. Abra o site em https.')));
}

async function trocarAba(aba, semHistorico, manterPerfil){
  if (!semHistorico) irUrl(rotaDe(aba), { aba });
  if (!manterPerfil && document.body.classList.contains('modo-perfil')){
    if (aba === 'mural' && S.aba === 'mural'){ sairPerfil(); return; }
    modoPerfil(false); S.busca = ''; $('busca').value = '';
  }
  S.aba = aba; document.body.dataset.aba = aba; setTimeout(atualizarTitulo, 0); setTimeout(desenharRanking, 0);
  if (aba !== 'mural') $('perfilBox').hidden = true;   // o perfil de outra pessoa não fica junto com o meu
  $('tabMural').classList.toggle('on', aba === 'mural'); $('tabMeus').classList.toggle('on', aba === 'meus'); $('tabDest').classList.toggle('on', aba === 'destaques');
  document.querySelectorAll('#bnav [data-nav]').forEach(x => x.classList.toggle('on', x.dataset.nav === aba));
  document.querySelector('#bnav .bn-pub').classList.toggle('on', aba === 'publicar');
  $('pubTela').hidden = aba !== 'publicar';
  if (aba === 'publicar'){
    $('filtros').hidden = $('searchbar').hidden = $('painelMeus').hidden = $('meuPerfil').hidden = $('destaques').hidden = true;
    ['muralGrid','estado','maisBtn','perfilBox'].forEach(id => $(id).hidden = true);
    scrollTo({ top:0 }); return;
  }
  $('filtros').hidden = $('searchbar').hidden = aba !== 'mural'; $('painelMeus').hidden = $('meuPerfil').hidden = aba !== 'meus';
  $('destaques').hidden = aba !== 'destaques';
  ['muralGrid','estado'].forEach(id => $(id).hidden = aba === 'destaques');
  if (aba === 'destaques'){ $('maisBtn').hidden = true; $('perfilBox').hidden = true; abrirDestaques(); return; }
  if (aba === 'mural'){ buscarMural(true); return; }
  const assinatura = () => S.meus.map(s => s.id + ':' + (s.cliques || 0) + ':' + (s.handle || '') + ':' + (s.verificado ? 1 : 0) + ':' + s.image_url).join('|');
  const ja = S._meusOk ? assinatura() : null;
  if (S._meusOk) desenharMeus(); else skeleton();
  try{
    await buscarMeus(); S._meusOk = true;
    if (S.aba !== 'meus') return;
    if (assinatura() !== ja) desenharMeus();
  }catch(err){ if (!ja) erroCarga(err); }
  carregarStats();
}

async function excluirUm(id){
  const it = S.meus.find(s => String(s.id) === String(id)); if (!it) return;
  if (!await confirmar({ titulo:'Excluir este site?', texto:`"${it.brand_name}" sai do mural para todo mundo. Não dá para desfazer.`, botao:'Excluir' })) return;
  const { data, error } = await _supabase.rpc('excluir_meu_site', { p_id:String(id), p_token:S.token });
  if (error || !data){ aviso('Não foi possível excluir. Tente de novo.'); return; }
  aviso('Site excluído');
  S.meus = S.meus.filter(s => String(s.id) !== String(id)); S.itens = S.itens.filter(s => String(s.id) !== String(id));
  document.querySelector(`.card[data-id="${CSS.escape(String(id))}"]`)?.remove();
  atualizarMeusUI();
  if (S.aba === 'meus') desenharMeus();
}
async function excluirTodos(){
  const n = S.meus.length; if (!n) return;
  if (!await confirmar({ titulo:`Excluir ${n === 1 ? 'seu site' : 'todos os seus ' + n + ' sites'}?`, texto:'Tudo que você publicou com esta chave sai do mural. Não dá para desfazer.', botao:'Excluir tudo' })) return;
  const { data, error } = await _supabase.rpc('excluir_meus_sites', { p_token:S.token });
  if (error){ aviso('Não foi possível excluir. Tente de novo.'); return; }
  aviso(`${data} ${data === 1 ? 'site excluído' : 'sites excluídos'}`);
  S.meus = []; S.itens = S.itens.filter(s => s.owner_hash !== S.hash); desenharMeus();
}

/* ---------- denúncia e cliques ---------- */
function jaDenunciou(id){ try{ return JSON.parse(lerLS('bl_den') || '[]').includes(String(id)); }catch(_){ return false; } }
let denId = null;
function denunciar(id){
  if (jaDenunciou(id)){ aviso('Você já denunciou este site.'); return; }
  denId = String(id); $('dnMotivo').value = 'golpe'; $('dnDetalhe').value = ''; abrir('modalDenuncia');
}
$('dnNo').addEventListener('click', () => fechar('modalDenuncia'));
$('dnOk').addEventListener('click', async () => {
  const btn = $('dnOk'); btn.disabled = true;
  const { error } = await _supabase.rpc('denunciar_site', { p_id:denId, p_motivo:$('dnMotivo').value, p_detalhe:$('dnDetalhe').value.trim() || null });
  btn.disabled = false; fechar('modalDenuncia');
  if (error){ aviso('Não foi possível enviar a denúncia.'); return; }
  try{ const l = JSON.parse(lerLS('bl_den') || '[]'); l.push(denId); gravarLS('bl_den', JSON.stringify(l)); }catch(_){}
  aviso('Denúncia enviada. Obrigado.');
});

function registrarClique(id){
  const k = 'bl_c_' + id;
  try{ if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); }catch(_){}
  _supabase.rpc('registrar_clique', { p_id:String(id) }).then(() => {}, () => {});
}

/* ---------- @ (perfil) ---------- */
const normArroba = v => String(v || '').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
async function carregarPerfil(){
  try{ const { data } = await _supabase.rpc('meu_perfil', { p_token:S.token }); S.perfil = data || null; }
  catch(_){ S.perfil = null; }
  atualizarPerfilUI();
  if (S.aba === 'meus' && !document.body.classList.contains('modo-perfil')) irUrl(rotaDe('meus'), { aba:'meus' }, true);   // endereço da Conta = @ atual
  // abriu o link do próprio @ antes de o perfil carregar: mostra a Conta
  const h = S.perfil && S.perfil.handle;
  if (h && document.body.classList.contains('modo-perfil') && S.busca === '@' + h) irParaPerfil(h, true);
}
function atualizarPerfilUI(){
  const p = S.perfil; desenharMeuPerfil();
  const m = $('meuArroba');
  if (!p?.handle) m.textContent = 'Você ainda não tem um @';
  else m.innerHTML = `<span class="ma"><span translate="no">@${esc(p.handle)}</span>${temVerif(p) ? SELO : ''}${seloElite(p)}</span>${p.suspenso ? ' <span>(suspenso)</span>' : ''}${p.pendente ? ` <small class="pendente">Troca para @${esc(p.pendente)} em análise</small>` : ''}`;
  $('btnArroba').innerHTML = '<i class="fa-solid fa-at"></i> ' + (p?.handle ? 'Trocar @' : 'Reservar @');
}
async function mostrarPerfil(h){
  const box = $('perfilBox');
  if (!h || h.length < 3){ box.hidden = true; return; }
  let data = null;
  try{ ({ data } = await _supabase.rpc('perfil_publico', { p_handle:h })); }catch(_){}
  if (!S.busca.startsWith('@') || normArroba(S.busca) !== h) return;   // a busca mudou enquanto carregava
  if (!data){ box.hidden = true; return; }
  if (temVerif(data)) VERIF.add(data.handle);
  if (temSeloB(data)) NINJA.add(data.handle);
  $('pfCard').innerHTML = cartaoPerfil(data, false);
  $('pfCard').querySelectorAll('[data-seg-btn]').forEach(pintarSeguir);
  box.hidden = false;
}

/* ---------- Seguir perfis ---------- */
const SEGUINDO = new Set();
function segNum(p, tipo){
  const v = +p[tipo] || 0, rot = tipo === 'seguidores' ? (v === 1 ? 'seguidor' : 'seguidores') : 'seguindo';
  return `<li><button type="button" class="ig-sg" data-seg-ver="${tipo}" data-h="${esc(p.handle)}"><b data-segn="${esc(p.handle)}:${tipo}">${fmtN(v)}</b> <span>${rot}</span></button></li>`;
}
const SEGUEME = new Set();   // quem me segue (para "Seguir de volta")
async function carregarSeguindo(){
  SEGUINDO.clear(); SEGUEME.clear();
  if (S.token){
    try{ const { data, error } = await _supabase.rpc('meus_seguindo', { p_token:S.token }); if (!error && Array.isArray(data)) data.forEach(h => SEGUINDO.add(h)); }catch(_){}
    try{ const { data, error } = await _supabase.rpc('meus_seguidores', { p_token:S.token }); if (!error && Array.isArray(data)) data.forEach(h => SEGUEME.add(h)); }catch(_){}
  }
  document.querySelectorAll('[data-seg-btn]').forEach(pintarSeguir);
}
function pintarSeguir(b){
  const on = SEGUINDO.has(b.dataset.h), volta = !on && SEGUEME.has(b.dataset.h);
  b.classList.toggle('on', on); b.classList.toggle('pri', !on); b.setAttribute('aria-pressed', on);
  b.innerHTML = on ? '<i class="fa-solid fa-check"></i> <span>Seguindo</span>' : `<i class="fa-solid fa-user-plus"></i> <span>${volta && !b.classList.contains('seg-lnk') ? 'Seguir de volta' : 'Seguir'}</span>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-seg-btn]'); if (!b || b.dataset.busy) return;
  const h = b.dataset.h;
  if (!S.perfil || !S.perfil.handle){ aviso('Reserve seu @ para seguir perfis'); return; }
  const on = !SEGUINDO.has(h);
  if (!on){
    b.dataset.busy = '1';
    const ok = await confirmar({ titulo:'Deixar de seguir?', texto:'Você pode voltar a seguir quando quiser.', botao:'Deixar de seguir', quem:h });
    delete b.dataset.busy; if (!ok) return;
    b.dataset.busy = '1';
  } else b.dataset.busy = '1';
  on ? SEGUINDO.add(h) : SEGUINDO.delete(h); document.querySelectorAll(`[data-seg-btn][data-h="${CSS.escape(h)}"]`).forEach(pintarSeguir);
  const dlt = on ? 1 : -1, meuH = S.perfil && S.perfil.handle;
  if (meuH) ajustarN(meuH, 'seguindo', dlt); ajustarN(h, 'seguidores', dlt);
  try{
    const { data, error } = await _supabase.rpc('seguir', { p_handle:h, p_token:S.token, p_on:on });
    if (error) throw error;
    if (data && data.seguidores != null) document.querySelectorAll('[data-segn]').forEach(n => { if (n.dataset.segn === h + ':seguidores'){ n.textContent = fmtN(data.seguidores); n.dataset.v = String(data.seguidores); } });
    if (S.perfil) S.perfil.seguindo = Math.max(0, (+S.perfil.seguindo || 0) + dlt);
    atualizarContagens();
  }catch(err){
    on ? SEGUINDO.delete(h) : SEGUINDO.add(h); document.querySelectorAll(`[data-seg-btn][data-h="${CSS.escape(h)}"]`).forEach(pintarSeguir);
    if (meuH) ajustarN(meuH, 'seguindo', -dlt); ajustarN(h, 'seguidores', -dlt);
    const m = String((err && err.message) || '');
    aviso(/Reserve|Limite|si mesmo|encontrado/.test(m) ? m : 'Não foi possível seguir agora.');
  }
  delete b.dataset.busy;
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-rm-seg]'); if (!b || b.dataset.busy) return;
  const h = b.dataset.h; b.dataset.busy = '1';
  const ok = await confirmar({ titulo:'Remover seguidor?', texto:'O perfil não será avisado de que foi removido. Ele poderá voltar a seguir você.', botao:'Remover', quem:h });
  if (!ok){ delete b.dataset.busy; return; }
  const eu0 = S.perfil && S.perfil.handle, li0 = b.closest('li');
  if (eu0) ajustarN(eu0, 'seguidores', -1);
  if (li0) li0.style.display = 'none';
  try{
    const { data, error } = await _supabase.rpc('remover_seguidor', { p_handle:h, p_token:S.token });
    if (error) throw error;
    SEGUEME.delete(h);
    const li = b.closest('li'); if (li) li.remove();
    const eu = S.perfil && S.perfil.handle;
    if (data && data.seguidores != null && eu) pintarSegn(eu, { seguidores:data.seguidores });
    if (S.perfil && data) S.perfil.seguidores = data.seguidores;
    if (!document.querySelector('#sgLista .sg-li')) $('sgLista').innerHTML = '<li class="sg-vz">Nenhum seguidor ainda.</li>';
    aviso('Seguidor removido');
    atualizarContagens();
  }catch(_){ if (eu0) ajustarN(eu0, 'seguidores', 1); if (li0) li0.style.display = ''; aviso('Não foi possível remover agora.'); delete b.dataset.busy; }
});
let SGATUAL = null;
async function abrirListaSeg(h, tipo, quieto){
  SGATUAL = { h, tipo };
  $('sgTitulo').innerHTML = `<span>${tipo === 'seguindo' ? 'Seguindo' : 'Seguidores'}</span> <small translate="no">@${esc(h)}</small>`;
  const ul = $('sgLista'); if (!quieto){ ul.innerHTML = '<li class="sg-vz">Carregando…</li>'; abrir('modalSeg'); }
  let lista = [], ok = false;
  try{ const { data, error } = await _supabase.rpc('lista_seguir', { p_handle:h, p_tipo:tipo, p_limite:100 }); lista = Array.isArray(data) ? data : []; ok = !error && Array.isArray(data); }catch(_){}
  if (quieto && !ok) return;
  if (quieto && ($('modalSeg').hidden || !SGATUAL || SGATUAL.h !== h || SGATUAL.tipo !== tipo)) return;
  lista.forEach(x => { if (x.v) VERIF.add(x.handle); if (x.n) NINJA.add(x.handle); if (/^https:\/\//.test(x.f || '')) FOTOS.set(x.handle, x.f); });
  ul.innerHTML = lista.length
    ? lista.map(x => {
        const eu = S.perfil && S.perfil.handle, outro = eu && eu !== x.handle, H = esc(x.handle);
        const meus = eu && eu === h && tipo === 'seguidores';       // minha própria lista de seguidores: Remover (como no Instagram)
        const nome = `<button type="button" class="sg-r" data-sgp="${H}">${miniAv(x.handle)}<span class="sg-n" translate="no">@${H}</span>${selosDe(x.handle)}</button>`;
        if (meus) return `<li class="sg-li">${nome}<button type="button" class="seg-btn seg-lnk" data-seg-btn data-h="${H}"></button><button type="button" class="sg-b sg-rm" data-rm-seg data-h="${H}">Remover</button></li>`;
        return `<li class="sg-li">${nome}${outro ? `<button type="button" class="seg-btn sg-b" data-seg-btn data-h="${H}"></button>` : ''}</li>`;
      }).join('')
    : `<li class="sg-vz">${tipo === 'seguindo' ? 'Não segue ninguém ainda.' : 'Nenhum seguidor ainda.'}</li>`;
  ul.querySelectorAll('[data-seg-btn]').forEach(pintarSeguir);
}
document.addEventListener('click', e => {
  const v = e.target.closest('[data-seg-ver]');
  if (v){ abrirListaSeg(v.dataset.h, v.dataset.segVer); return; }
  const r = e.target.closest('[data-sgp]');
  if (r){ fechar('modalSeg'); irParaPerfil(r.dataset.sgp); }
});


/* ---------- notificações ---------- */
const NT = { itens:[], n:0, t:0 };
const ntTempo = d => {
  const s = Math.round((new Date(d) - Date.now()) / 1000), a = Math.abs(s);
  try{
    const f = new Intl.RelativeTimeFormat(LOC(), { numeric:'auto' });
    if (a < 60) return f.format(0, 'second');
    if (a < 3600) return f.format(Math.round(s / 60), 'minute');
    if (a < 86400) return f.format(Math.round(s / 3600), 'hour');
    if (a < 604800) return f.format(Math.round(s / 86400), 'day');
    return new Date(d).toLocaleDateString(LOC(), { day:'2-digit', month:'short' });
  }catch(_){ return ''; }
};
function ntConteudo(x){
  const d = x.dados || {};
  let ic = '', txt = '', alvo = '';
  if (x.tipo === 'seguidor'){
    if (x.v) VERIF.add(d.handle); if (x.nj) NINJA.add(d.handle); if (/^https:\/\//.test(x.f || '')) FOTOS.set(d.handle, x.f);
    ic = miniAv(d.handle);
    txt = `<b translate="no">@${esc(d.handle)}</b> <span>começou a seguir você</span>`; alvo = `data-ntp="${esc(d.handle)}"`;
  } else if (x.tipo === 'meta_site'){
    ic = '<i class="nt-ic am"><i class="fa-solid fa-trophy"></i></i>';
    txt = `<span>Seu site</span> <b translate="no">${esc(d.nome || '')}</b> <span>chegou a</span> <b>${fmtN(d.meta)}</b> <span>acessos</span>`; alvo = 'data-ntm="1"';
  } else {
    const nj = d.selo === 'blacke';
    ic = `<i class="nt-ic ${nj ? 'vi' : 'ci'}">${nj ? SELO_BLACKE : SELO}</i>`;
    txt = nj ? '<span>Você conquistou o Selo BLACKE</span>' : '<span>Você conquistou o selo de Verificado</span>'; alvo = 'data-ntm="1"';
  }
  return { ic, txt, alvo };
}
function ntItem(x){
  const { ic, txt, alvo } = ntConteudo(x), tempo = `<time datetime="${esc(x.criado_em)}">${esc(ntTempo(x.criado_em))}</time>`;
  return `<li><button type="button" class="nt-i ${x.lida ? '' : 'nova'}" data-nti="${x.id}" ${alvo}>${ic}<span class="nt-t"><span class="nt-x">${txt}</span>${tempo}</span>${x.lida ? '' : '<i class="nt-d" aria-hidden="true"></i>'}</button></li>`;
}

/* som das notificações (gerado no navegador: dois toques curtos e agudos, sem arquivo) */
let AC = null;
const somLigado = () => lerLS('bl_nt_som') !== '0';
function acordarAudio(){
  try{ AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); }catch(_){}
}
['pointerdown', 'keydown', 'touchstart', 'click'].forEach(ev => addEventListener(ev, () => { if (!AC || AC.state !== 'running') acordarAudio(); }, { passive:true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden && AC && AC.state === 'suspended') acordarAudio(); });
function ntSom(forcar){
  if (!forcar && !somLigado()) return true;           // som desligado de propósito: não precisa de plano B
  try{
    acordarAudio(); if (!AC || AC.state !== 'running') return false;
    const t0 = AC.currentTime + 0.02, mestre = AC.createGain();
    mestre.gain.value = 0.16; mestre.connect(AC.destination);
    [[783.99, 0], [1174.66, 0.13], [1567.98, 0.28]].forEach(([f, d], i) => {
      [[f, 1, 'sine'], [f * 2, 0.22, 'sine']].forEach(([fr, v, tp]) => {
        const o = AC.createOscillator(), g = AC.createGain(), t = t0 + d;
        o.type = tp; o.frequency.setValueAtTime(fr, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * (i === 2 ? 0.8 : 1), t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (i === 2 ? 0.75 : 0.34));
        o.connect(g); g.connect(mestre); o.start(t); o.stop(t + 0.8);
      });
    });
    return true;
  }catch(_){ return false; }
}
function pintarSom(){
  const b = $('ntSom'); if (!b) return;
  const on = somLigado(); b.classList.toggle('off', !on); b.setAttribute('aria-pressed', on);
  b.innerHTML = `<i class="fa-solid ${on ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>`;
}
document.addEventListener('click', e => {
  if (!e.target.closest('#ntSom')) return;
  gravarLS('bl_nt_som', somLigado() ? '0' : '1'); pintarSom(); if (somLigado()) ntSom(true);
});
pintarSom();


/* notificação do sistema (quando a aba está em segundo plano) */
const NT_TXT = {
  pt:{ seg:h => `@${h} começou a seguir você`, meta:(n, m) => `Seu site ${n} chegou a ${m} acessos`, ver:'Você conquistou o selo de Verificado', blk:'Você conquistou o Selo BLACKE' },
  en:{ seg:h => `@${h} started following you`, meta:(n, m) => `Your site ${n} reached ${m} visits`, ver:'You earned the Verified badge', blk:'You earned the BLACKE Badge' },
  es:{ seg:h => `@${h} empezó a seguirte`, meta:(n, m) => `Tu sitio ${n} llegó a ${m} visitas`, ver:'Conseguiste el sello de Verificado', blk:'Conseguiste el Sello BLACKE' }
};
function ntPlano(x){
  const T = NT_TXT[window.blLang ? window.blLang() : 'pt'] || NT_TXT.pt, d = x.dados || {};
  if (x.tipo === 'seguidor') return T.seg(d.handle);
  if (x.tipo === 'meta_site') return T.meta(d.nome || '', fmtN(d.meta));
  return d.selo === 'blacke' ? T.blk : T.ver;
}
function ntSistema(novos, somDoSite){
  try{
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const x = novos[0], extra = novos.length > 1 ? ` (+${novos.length - 1})` : '';
    const n = new Notification('BLACKE LAVEX', { body: ntPlano(x) + extra, icon:'/icon-192.png', tag:'bl-aviso', renotify:true, silent:!!somDoSite && somLigado() });
    n.onclick = () => {
      try{ window.focus(); n.close(); }catch(_){}
      if (x.tipo === 'seguidor') irParaPerfil((x.dados || {}).handle); else trocarAba('meus');
    };
  }catch(_){}
}
function ntPerm(){
  const b = $('ntPerm'); if (!b) return;
  if (!('Notification' in window)){ b.hidden = true; return; }
  const p = Notification.permission; b.hidden = false;
  if (b.dataset.st === p) return; b.dataset.st = p;
  if (p === 'default') b.innerHTML = '<i class="fa-regular fa-bell"></i><span class="nt-pt"><b>Receber avisos fora da aba</b><span>Notificação do sistema quando você estiver em outra aba.</span></span><button type="button" id="ntPermBtn" class="nt-pb">Ativar</button>';
  else if (p === 'denied') b.innerHTML = '<i class="fa-solid fa-bell-slash"></i><span class="nt-pt"><b>Avisos fora da aba bloqueados</b><span>Libere as notificações deste site no cadeado ao lado do endereço.</span></span>';
  else b.innerHTML = '<i class="fa-solid fa-circle-check"></i><span class="nt-pt"><b>Avisos fora da aba ativados</b><span>Toque em Testar e mude de aba para ouvir.</span></span><button type="button" id="ntTeste" class="nt-pb">Testar</button>';
}
let ntTesteRes = null;
document.addEventListener('click', e => {
  const t = e.target.closest('#ntTeste'); if (!t || t.dataset.busy) return;
  t.dataset.busy = '1'; t.textContent = '6…';
  aviso('Mude para outra aba agora: o teste toca em 6 segundos');
  let s = 6; const iv = setInterval(() => { s--; if (s > 0 && t.isConnected) t.textContent = s + '…'; }, 1000);
  setTimeout(() => {
    clearInterval(iv); delete t.dataset.busy; if (t.isConnected) t.textContent = 'Testar';
    const tocou = ntSom(true);
    ntSistema([{ tipo:'meta_site', dados:{ nome:'Teste', meta:100 } }], tocou);
    ntTesteRes = tocou ? 'Som do site: funcionando' : 'O navegador bloqueou o som do site (a notificação usa o som do sistema). Clique na página e teste de novo.';
    if (!document.hidden){ aviso(ntTesteRes); ntTesteRes = null; }
  }, 6000);
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && ntTesteRes){ aviso(ntTesteRes); ntTesteRes = null; } });
document.addEventListener('click', async e => {
  if (!e.target.closest('#ntPermBtn')) return;
  try{ await Notification.requestPermission(); }catch(_){}
  ntPerm(); acordarAudio();
  if ('Notification' in window && Notification.permission === 'granted') aviso('Avisos fora da aba ativados');
});

/* bolha no topo (estilo notificação de celular) quando chega aviso novo */
let ntTimer = 0;
function ntBolha(novos){
  const x = novos[0], { ic, txt, alvo } = ntConteudo(x);
  let b = $('ntBolha');
  if (!b){ b = document.createElement('div'); b.id = 'ntBolha'; b.className = 'nt-bolha'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
  const mais = novos.length > 1 ? `<em class="nt-mais">+${novos.length - 1}</em>` : '';
  b.innerHTML = `<button type="button" class="nt-bn" data-nti="${x.id}" ${alvo}>${ic}<span class="nt-t"><b class="nt-tt">BLACKE LAVEX</b><span class="nt-x">${txt}</span></span>${mais}</button>`;
  b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
  clearTimeout(ntTimer); ntTimer = setTimeout(ntBolhaOff, 6500);
  ntSom();
}
function ntBolhaOff(){ const b = $('ntBolha'); if (b) b.classList.remove('on'); }
function desenharNotif(){
  const l = $('ntLista'); if (!l) return;
  l.innerHTML = NT.itens.length ? NT.itens.map(ntItem).join('') : `<li class="nt-vz"><i class="fa-regular fa-bell"></i><b>Tudo em dia</b><span>Avisos de novos seguidores e metas de acessos aparecem aqui.</span></li>`;
  const b = $('ntN'); b.textContent = NT.n > 9 ? '9+' : String(NT.n); b.hidden = !NT.n;
  $('ntTodas').hidden = !NT.n; atualizarTitulo(); ntPerm();
  $('ntBtn').hidden = !(NT.itens.length || (S.perfil && S.perfil.handle));
}
async function carregarNotif(){
  if (!S.token) return;
  try{
    const { data, error } = await _supabase.rpc('minhas_notificacoes', { p_token:S.token, p_limite:30 });
    if (error || !data) return;
    NT.itens = Array.isArray(data.itens) ? data.itens : []; NT.n = +data.nao_lidas || 0;
    desenharNotif();
    const max = NT.itens.reduce((m, x) => Math.max(m, +x.id || 0), 0), visto = +(lerLS('bl_nt_visto') || 0);
    if (max > visto){
      const novos = NT.itens.filter(x => +x.id > visto && !x.lida);
      gravarLS('bl_nt_visto', String(max));
      if (novos.length){
        if (document.hidden){ const tocou = ntSom(); ntSistema(novos, tocou); }           // em outra aba: som + notificação do sistema
        else if ($('ntPanel').hidden) ntBolha(novos);
      }
    }
  }catch(_){}
}
function ntAbrir(on){
  const p = $('ntPanel'); if (!p) return;
  p.hidden = !on; $('ntBack').hidden = !on; $('ntBtn').setAttribute('aria-expanded', on);
  if (on) carregarNotif();
}
async function ntLer(id){
  try{ await _supabase.rpc('marcar_notificacoes_lidas', { p_token:S.token, p_id:id }); }catch(_){}
  NT.itens.forEach(x => { if (id == null || x.id === id) x.lida = true; });
  NT.n = NT.itens.filter(x => !x.lida).length; desenharNotif();
}
document.addEventListener('click', e => {
  if (e.target.closest('#ntBtn')){ ntAbrir($('ntPanel').hidden); return; }
  if (e.target.closest('#ntTodas')){ ntLer(null); return; }
  const i = e.target.closest('[data-nti]');
  if (i){
    const id = +i.dataset.nti; if (NT.itens.find(x => x.id === id && !x.lida)) ntLer(id);
    ntAbrir(false); ntBolhaOff();
    if (i.dataset.ntp) irParaPerfil(i.dataset.ntp); else if (i.dataset.ntm) trocarAba('meus');
    return;
  }
  if (!$('ntPanel').hidden && !e.target.closest('#ntPanel')) ntAbrir(false);
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('ntPanel').hidden) ntAbrir(false); });
/* mantém tudo em dia entre navegadores/abas: avisos, quem eu sigo e as contagens na tela */
function pintarSegn(h, d){
  document.querySelectorAll('[data-segn]').forEach(n => {
    const [hh, tp] = n.dataset.segn.split(':'); if (hh !== h || d[tp] == null) return;
    n.textContent = fmtN(d[tp]); n.dataset.v = String(d[tp]);
  });
}
async function atualizarContagens(){
  const hs = [...new Set([...document.querySelectorAll('[data-segn]')].map(n => n.dataset.segn.split(':')[0]))].slice(0, 6);
  await Promise.all(hs.map(async h => {
    try{ const { data } = await _supabase.rpc('perfil_publico', { p_handle:h }); if (data) pintarSegn(h, data); }catch(_){}
  }));
  if (S.perfil && S.perfil.handle && S.token){
    try{
      const { data } = await _supabase.rpc('meu_perfil', { p_token:S.token });
      if (data){ S.perfil.seguidores = data.seguidores; S.perfil.seguindo = data.seguindo; pintarSegn(S.perfil.handle, data); }
    }catch(_){}
  }
}
function ajustarN(h, tp, d){
  document.querySelectorAll('[data-segn]').forEach(n => {
    if (n.dataset.segn !== h + ':' + tp) return;
    const v = Math.max(0, (+n.dataset.v || parseInt(String(n.textContent).replace(/\D/g,''), 10) || 0) + d);
    n.textContent = fmtN(v); n.dataset.v = String(v);
  });
}
let sincOcupado = false;
async function sincronizar(){
  if (sincOcupado || !S.token) return;
  if (document.hidden){ carregarNotif(); return; }       // em outra aba: só confere os avisos
  sincOcupado = true;
  try{
    carregarNotif();
    await carregarSeguindo();
    if (!$('modalSeg').hidden && SGATUAL && !document.querySelector('#modalConfirma:not([hidden])')) await abrirListaSeg(SGATUAL.h, SGATUAL.tipo, true);
    await atualizarContagens();
  }finally{ sincOcupado = false; }
}
try{
  const w = new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(1),20000)'], { type:'text/javascript' })));
  w.onmessage = sincronizar;
}catch(_){ setInterval(sincronizar, 20000); }
document.addEventListener('visibilitychange', () => { if (!document.hidden) sincronizar(); });
addEventListener('focus', sincronizar);

/* ---------- cartão de perfil ---------- */
const fmtN = n => { try{ return new Intl.NumberFormat(LOC(), { notation:'compact', maximumFractionDigits:1 }).format(n || 0); }catch(_){ return String(n || 0); } };
const CT_ICO = { telegram:'fa-brands fa-telegram', whatsapp:'fa-brands fa-whatsapp', instagram:'fa-brands fa-instagram' };
function nomeContato(c){
  if (c.tipo === 'telegram') return /t\.me\/(\+|joinchat)/i.test(c.url) ? 'Grupo' : 'Telegram';
  if (c.tipo === 'whatsapp') return /chat\.whatsapp\.com/i.test(c.url) ? 'Grupo' : 'WhatsApp';
  return 'Instagram';
}
function avatarHTML(p){
  const ini = esc(((p && p.handle) || '@').charAt(0).toUpperCase());
  return p && p.foto ? `<img src="${esc(p.foto)}" alt="" loading="lazy" decoding="async">` : `<span class="pc-ini">${ini}</span>`;
}
function cartaoPerfil(p, dono){
  const TOOLS = h => `<span class="pc-tools"><button class="pc-ic" type="button" data-pc="chave" title="Minha chave" aria-label="Minha chave"><i class="fa-solid fa-key"></i></button><button class="pc-ic perigo" type="button" data-pc="excluir" title="Excluir todos os meus sites" aria-label="Excluir todos os meus sites"${S.meus.length ? '' : ' disabled'}><i class="fa-solid fa-trash-can"></i></button>${h ? `<button class="pc-ic" type="button" data-act="linkperfil" data-h="${esc(h)}" title="Compartilhar perfil" aria-label="Compartilhar perfil"><i class="fa-solid fa-share-nodes"></i></button>` : ''}</span>`;
  const num = (v, um, varios, extra) => `<li><b>${fmtN(v)}</b> <span>${+v === 1 ? um : varios}</span>${extra || ''}</li>`;
  if (!p || !p.handle){
    const n = S.meus.length, ac = S.meus.reduce((t, s) => t + (s.cliques || 0), 0);
    return `<div class="ig ig-vz">
      <div class="ig-av"><span class="pc-ini"><i class="fa-solid fa-at"></i></span></div>
      <div class="ig-nome"><h2>Seu perfil</h2>${dono ? TOOLS('') : ''}</div>
      <ul class="ig-nums">${num(n, 'site', 'sites')}${num(ac, 'acesso', 'acessos')}${num(Math.max(0, LIMITE - n), 'vaga livre', 'vagas livres')}</ul>
      <div class="ig-bio"><p class="dim">Reserve um @ para ter um perfil público com foto, bio e botões de contato.</p></div>
      <div class="ig-btns"><button class="pc-btn pri" type="button" data-pc="arroba"><i class="fa-solid fa-at"></i> Reservar @</button></div>
    </div>${dono ? painelNumeros() : ''}`;
  }
  const ct = Array.isArray(p.contatos) ? p.contatos.filter(c => /^https:\/\//.test(c.url || '')) : [];
  const desde = p.desde ? new Date(p.desde).toLocaleDateString('pt-BR', { month:'long', year:'numeric' }) : '';
  return `<div class="ig${temVerif(p) ? ' pc-ver' : ''}">
    <div class="ig-fundo" aria-hidden="true">${p.foto ? `<img src="${esc(p.foto)}" alt="" decoding="async">` : ''}</div>
    <div class="ig-av">${avatarHTML(p)}</div>
    <div class="ig-nome"><h2 translate="no">${esc(p.handle)}</h2>${temVerif(p) ? SELO : ''}${seloElite(p)}${dono ? `<span class="so-pc">${TOOLS(p.handle)}</span>` : ''}</div>
    <ul class="ig-nums">
      ${num(p.sites, 'site', 'sites')}
      ${num(p.acessos, 'acesso', 'acessos', dono && TREND ? ' ' + chipTendencia(TREND.hj, TREND.ontem) : '')}
      ${segNum(p, 'seguidores')}
      ${segNum(p, 'seguindo')}
    </ul>
    <div class="ig-bio">
      ${p.bio ? `<p translate="no">${esc(p.bio)}</p>` : (dono ? '<p class="dim">Adicione uma bio em "Editar perfil".</p>' : '')}
      ${desde ? `<div class="pc-meta"><span>No mural desde ${esc(desde)}</span></div>` : ''}
      ${dono && p.pendente ? `<div class="pc-pend"><i class="fa-regular fa-clock"></i> <span>Troca para @${esc(p.pendente)} em análise</span></div>` : ''}
      ${dono && p.suspenso ? '<div class="pc-pend"><span>Perfil suspenso</span></div>' : ''}
    </div>
    <div class="ig-btns">
      ${dono ? `<button class="pc-btn" type="button" data-pc="editar">Editar perfil</button>
      <button class="pc-btn" type="button" data-pc="arroba">Trocar @</button><span class="so-m">${TOOLS(p.handle)}</span>${ct.length ? '<i class="ig-quebra"></i>' : ''}` : ''}
      ${dono ? '' : `<button class="pc-btn seg-btn" type="button" data-seg-btn data-h="${esc(p.handle)}"></button>`}
      ${dono ? '' : '<i class="ig-quebra seg-q"></i>'}
      ${ct.map(c => `<a class="pc-btn ct" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><i class="${CT_ICO[c.tipo] || 'fa-solid fa-link'}"></i> <span>${nomeContato(c)}</span></a>`).join('')}
      ${dono ? '' : `<a class="pc-btn" href="/bio/${esc(p.handle)}" target="_blank" rel="noopener"><i class="fa-solid fa-link"></i> <span>Página de links</span></a><button class="pc-btn" type="button" data-act="linkperfil" data-h="${esc(p.handle)}"><i class="fa-solid fa-share-nodes"></i> <span>Compartilhar</span></button>`}
    </div>
    ${dono ? `<div class="ig-lk">
      <span class="ig-lk-ic"><i class="fa-solid fa-link"></i></span>
      <div class="ig-lk-t"><b>Sua página de links</b><small translate="no">blackelavex.online/bio/${esc(p.handle)}</small><span>Coloque na bio do Instagram, TikTok ou onde quiser.</span></div>
      <div class="ig-lk-a"><button class="pc-btn" type="button" data-act="copiarbio" data-h="${esc(p.handle)}"><i class="fa-regular fa-copy"></i> <span>Copiar</span></button><a class="pc-btn pri" href="/bio/${esc(p.handle)}" target="_blank" rel="noopener"><span>Abrir</span> <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div>
    </div>` : ''}
  </div>${dono ? painelNumeros() + blocoSelo(p) : ''}
  <div class="ig-tab"><span><i class="fa-solid fa-table-cells"></i> Sites</span></div>`;
}
/* ---------- Seus números (Conta) ---------- */
function barrasHTML(dias){
  const dt = d => new Date(d + 'T12:00:00');
  const max = Math.max(1, ...dias.map(d => +d.n || 0));
  return dias.map((d, i) => {
    const n = +d.n || 0, h = n ? Math.max(8, Math.round(n / max * 100)) : 3, ult_ = i === dias.length - 1;
    const rot = dt(d.d).toLocaleDateString(LOC(), { weekday:'narrow' });
    return `<div class="nm-c${ult_ ? ' hj' : ''}${n === max && n ? ' pico' : ''}" style="--i:${i}" title="${esc(dt(d.d).toLocaleDateString(LOC(), { day:'2-digit', month:'2-digit' }))} · ${n} ${n === 1 ? 'acesso' : 'acessos'}"><em>${n ? fmtN(n) : ''}</em><i style="--h:${h}%"></i><span>${esc(rot)}</span></div>`;
  }).join('');
}
function painelNumeros(){
  if (!SERIE || !S.meus.length) return '';
  const dias = SERIE, soma = l => l.reduce((t, d) => t + (+d.n || 0), 0);
  const tot = soma(dias), ult = soma(dias.slice(-7)), ant = soma(dias.slice(0, Math.max(0, dias.length - 7)).slice(-7));
  const hoje = dias.length ? +dias[dias.length - 1].n || 0 : 0;
  const melhor = dias.reduce((m, d) => (+d.n > (m ? +m.n : 0) ? d : m), null);
  const dt = d => new Date(d + 'T12:00:00');
  let chip;
  if (!ult && !ant) chip = '';
  else if (!ant) chip = '<span class="tend sobe">▲ novo</span>';
  else { const p = Math.round((ult - ant) / ant * 100); chip = p > 0 ? `<span class="tend sobe">▲ ${p}%</span>` : p < 0 ? `<span class="tend desce">▼ ${-p}%</span>` : '<span class="tend igual">= 0%</span>'; }
  const barras = barrasHTML(dias);
  const sites = [...STATS.values()].filter(s => s.n14 > 0).sort((x, y) => y.n14 - x.n14 || y.total - x.total).slice(0, 5);
  const topo = sites.length ? sites[0].n14 : 1;
  const rank = sites.map((s, i) => {
    const it = S.meus.find(x => String(x.id) === String(s.id));
    return `<li style="--i:${i}"><span class="nm-pos">${i + 1}</span><span class="nm-im">${it ? `<img src="${esc(it.image_url)}" alt="" loading="lazy" decoding="async" style="object-position:${posSegura(it.img_pos)}">` : ''}</span><div class="nm-nm"><b translate="no">${esc(s.nome)}</b><span class="nm-br"><i style="--w:${Math.max(4, Math.round(s.n14 / topo * 100))}%"></i></span></div><span class="nm-v"><b>${fmtN(s.n14)}</b>${s.hj ? `<small>+${fmtN(s.hj)} hoje</small>` : ''}</span></li>`;
  }).join('');
  const vida = (S.perfil && +S.perfil.acessos) || S.meus.reduce((t, s) => t + (s.cliques || 0), 0);
  const base = Object.assign({}, S.perfil || {}, { acessos:vida });
  const tem = temSeloB(base), azul = temVerif(base), alvo = azul ? META_SELO : META_V;
  const pct = tem ? 100 : Math.min(100, Math.round(vida / alvo * 100));
  const meta = `<div class="nm-meta${tem ? ' ok' : ''}"><div class="nm-meta-t">${tem ? SELO_BLACKE + '<b>Selo BLACKE conquistado</b>' : `<b>${azul ? 'Meta do Selo BLACKE' : 'Meta do selo verificado'}</b><span><b>${fmtN(vida)}</b> / ${fmtN(alvo)}</span>`}</div><span class="nm-br"><i style="--w:${tem ? 100 : Math.max(vida ? 3 : 0, pct)}%"></i></span></div>`;
  return `<details class="nm" data-nm${S.nmAberto ? ' open' : ''} aria-label="Seus números">
    <summary class="nm-h"><div><h3>Seus números</h3><small class="nm-sub"><b>${fmtN(tot)}</b> <span>${tot === 1 ? 'acesso' : 'acessos'}</span> · <b>${fmtN(hoje)}</b> <span>hoje</span></small></div><div class="nm-ch">${chip}<i class="nm-cv" aria-hidden="true"></i></div></summary>
    <div class="nm-b">
    ${meta}
    <div class="nm-k">
      <div><b>${fmtN(tot)}</b><span>${tot === 1 ? 'acesso' : 'acessos'}</span></div>
      <div><b>${fmtN(hoje)}</b><span>hoje</span></div>
      <div><b>${melhor && melhor.n > 0 ? esc(dt(melhor.d).toLocaleDateString(LOC(), { day:'2-digit', month:'2-digit' })) : '—'}</b><span>melhor dia</span></div>
    </div>
    ${tot ? `<div class="nm-g" role="img" aria-label="Acessos por dia">${barras}</div>` : '<p class="nm-vz">Ainda sem acessos nos últimos 14 dias. Compartilhe sua página de links para começar.</p>'}
    ${rank ? `<h4 class="nm-t">Sites mais acessados</h4><ol class="nm-r">${rank}</ol>` : ''}
    </div>
  </details>`;
}
document.addEventListener('toggle', e => { const d = e.target; if (!d || !d.matches) return; if (d.matches('details.rk')) S.rkAberto = d.open; else if (d.matches('details.nm')) S.nmAberto = d.open; else if (d.matches('details.sl')) S.slAberto = d.open; }, true);
function seloURL(h, t){ return `${location.origin}/selo/${h}${t === 'claro' ? '?t=claro' : ''}`; }
function blocoSelo(p){
  const t = S.seloTema === 'claro' ? 'claro' : 'escuro';
  return `<details class="sl" data-sl${S.slAberto ? ' open' : ''}>
    <summary class="sl-h"><span class="sl-ic"><i class="fa-solid fa-id-badge"></i></span><div class="sl-t"><b>Selo "Estou no BLACKE"</b><span>Para colocar no seu site ou loja</span></div><i class="nm-cv" aria-hidden="true"></i></summary>
    <div class="sl-b">
    <div class="sl-pv ${t}"><img src="${esc(seloURL(p.handle, t))}" alt="Estou no BLACKE LAVEX" width="292" loading="lazy" decoding="async"></div>
    <div class="sl-a">
      <div class="sl-seg" role="group" aria-label="Tema do selo"><button type="button" data-act="temaselo" data-t="escuro" class="${t === 'escuro' ? 'on' : ''}">Escuro</button><button type="button" data-act="temaselo" data-t="claro" class="${t === 'claro' ? 'on' : ''}">Claro</button></div>
      <button class="pc-btn" type="button" data-act="copiarselo" data-h="${esc(p.handle)}"><i class="fa-regular fa-copy"></i> <span>Copiar código</span></button>
      <a class="pc-btn" data-act="baixarselo" data-h="${esc(p.handle)}" href="${esc(seloURL(p.handle, t))}" download="selo-blacke-${esc(p.handle)}.svg"><i class="fa-solid fa-download"></i> <span>Baixar</span></a>
    </div>
    </div>
  </details>`;
}
function iconeConta(){
  const b = $('bnAv'); if (!b) return; const p = S.perfil;
  if (p && p.foto){ b.innerHTML = `<img src="${esc(p.foto)}" alt="">`; b.classList.add('foto'); }
  else if (p && p.handle){ b.innerHTML = `<i>${esc(p.handle.charAt(0).toUpperCase())}</i>`; b.classList.add('foto'); }
}
function desenharMeuPerfil(){
  iconeConta();
  const el = $('meuPerfil'); if (!el) return;
  const p = S.perfil;
  const html = cartaoPerfil(p && p.handle ? p : null, true);
  if (el._html === html) return;
  if (el._html) el.classList.add('pc-ok');
  el._html = html; el.innerHTML = html;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pc]'); if (!b) return;
  if (b.dataset.pc === 'arroba') $('btnArroba').click();
  else if (b.dataset.pc === 'editar') abrirEditarPerfil();
  else if (b.dataset.pc === 'chave') $('btnChave').click();
  else if (b.dataset.pc === 'excluir') $('btnExcluirTodos').click();
});

/* ---------- editar perfil ---------- */
const PE = { foto:null };
function normContato(tipo, v){
  v = String(v || '').trim(); if (!tipo || !v) return null;
  if (tipo === 'telegram'){
    let m = v.match(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/([A-Za-z0-9_+\/-]{3,80})\/?$/i);
    if (m) return 'https://t.me/' + m[1];
    m = v.match(/^@?([A-Za-z0-9_]{4,32})$/); if (m) return 'https://t.me/' + m[1];
    throw new Error('Telegram inválido. Use @usuario ou um link t.me/...');
  }
  if (tipo === 'whatsapp'){
    let m = v.match(/^(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9]{10,40})\/?$/i);
    if (m) return 'https://chat.whatsapp.com/' + m[1];
    m = v.match(/^(?:https?:\/\/)?wa\.me\/(\d{8,15})\/?$/i); if (m) return 'https://wa.me/' + m[1];
    let d = v.replace(/\D/g, '');
    if (d.length === 10 || d.length === 11) d = '55' + d;
    if (/^\d{12,15}$/.test(d)) return 'https://wa.me/' + d;
    throw new Error('WhatsApp inválido. Use o número com DDD ou um link de grupo.');
  }
  if (tipo === 'instagram'){
    const m = v.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9_.]{1,30})\/?(?:\?.*)?$/i) || v.match(/^@?([A-Za-z0-9_.]{1,30})$/);
    if (m) return 'https://www.instagram.com/' + m[1];
    throw new Error('Instagram inválido. Use @usuario.');
  }
  return null;
}
function contatoParaCampo(c){
  if (!c) return '';
  if (c.tipo === 'telegram'){ const m = c.url.match(/t\.me\/(.+)$/); return m ? (/^[A-Za-z0-9_]+$/.test(m[1]) ? '@' + m[1] : 't.me/' + m[1]) : c.url; }
  if (c.tipo === 'whatsapp'){ const m = c.url.match(/wa\.me\/(\d+)/); return m ? '+' + m[1] : c.url.replace(/^https:\/\//, ''); }
  if (c.tipo === 'instagram'){ const m = c.url.match(/instagram\.com\/([^/?]+)/); return m ? '@' + m[1] : c.url; }
  return c.url;
}
function peFotoUI(){
  const img = $('peImg'), p = S.perfil || {};
  $('peIni').textContent = (p.handle || '@').charAt(0).toUpperCase();
  if (PE.foto){ img.src = PE.foto; img.hidden = false; $('peIni').hidden = true; } else { img.hidden = true; img.removeAttribute('src'); $('peIni').hidden = false; }
  $('peRemover').hidden = !PE.foto;
}
function abrirEditarPerfil(){
  const p = S.perfil; if (!p || !p.handle) return $('btnArroba').click();
  PE.foto = p.foto || null; peFotoUI();
  $('peBio').value = p.bio || ''; $('peBioN').textContent = $('peBio').value.length;
  const ct = Array.isArray(p.contatos) ? p.contatos : [];
  [1, 2].forEach(i => { const c = ct[i - 1]; $('peT' + i).value = c ? c.tipo : ''; $('peU' + i).value = contatoParaCampo(c); $('peU' + i).disabled = !c; });
  $('peErro').hidden = true; abrir('modalPerfil');
}
[1, 2].forEach(i => $('peT' + i).addEventListener('change', e => { const u = $('peU' + i); u.disabled = !e.target.value; if (!e.target.value) u.value = ''; else if (!matchMedia('(max-width:640px)').matches) u.focus(); }));
$('peBio').addEventListener('input', e => { $('peBioN').textContent = e.target.value.length; });
$('peAv').addEventListener('click', () => $('peArquivo').click());
$('peTrocar').addEventListener('click', () => $('peArquivo').click());
$('peRemover').addEventListener('click', () => { PE.foto = null; peFotoUI(); });
$('peArquivo').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
  if (!/^image\//.test(f.type)) return peErro('Escolha uma imagem.');
  try{ PE.foto = await fotoQuadrada(f, 360); peFotoUI(); $('peErro').hidden = true; }
  catch(_){ peErro('Não foi possível ler essa imagem.'); }
});
function fotoQuadrada(file, lado){
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = lado;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, lado, lado);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); falha(); };
    img.src = url;
  });
}
function peErro(m){ const e = $('peErro'); e.textContent = m; e.hidden = false; }
$('peSalvar').addEventListener('click', async () => {
  const btn = $('peSalvar'); $('peErro').hidden = true;
  let contatos = [];
  try{
    [1, 2].forEach(i => { const t = $('peT' + i).value, u = normContato(t, $('peU' + i).value); if (t && u) contatos.push({ tipo:t, url:u }); });
  }catch(err){ return peErro(err.message); }
  btn.disabled = true; btn.textContent = 'Salvando...';
  try{
    const foto = PE.foto ? await enviarImagem(PE.foto) : null;
    const { error } = await _supabase.rpc('editar_perfil', { p_token:S.token, p_bio:$('peBio').value, p_foto:foto, p_contatos:contatos });
    if (error) throw error;
    await carregarPerfil(); fechar('modalPerfil'); aviso('Perfil atualizado');
  }catch(err){ peErro(err.message || 'Não foi possível salvar.'); }
  finally{ btn.disabled = false; btn.textContent = 'Salvar perfil'; }
});

function resetChips(){ S.cat = 'Todas'; document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.cat === 'Todas')); }
/* Página de perfil: abre limpa (sem título, busca e filtros), com Voltar */
function modoPerfil(on){ document.body.classList.toggle('modo-perfil', !!on); }
function irParaPerfil(h, semHistorico){
  // o meu próprio @ abre a minha Conta (com Editar perfil, Trocar @ etc.)
  if (S.perfil && S.perfil.handle && S.perfil.handle === String(h).toLowerCase()){
    if (semHistorico) irUrl(rotaDe('meus'), { aba:'meus' }, true);
    trocarAba('meus', !!semHistorico); return;
  }
  if (!document.body.classList.contains('modo-perfil')) S.voltar = { scroll:scrollY };
  S.busca = '@' + h; $('busca').value = S.busca; resetChips(); modoPerfil(true);
  if (!semHistorico) irUrl('/@' + h, { perfil:h });
  setTimeout(atualizarTitulo, 0);
  scrollTo({ top:0 });
  if (S.aba !== 'mural') trocarAba('mural', true, true); else buscarMural(true);
}
function sairPerfil(){
  modoPerfil(false); setTimeout(atualizarTitulo, 0); S.busca = ''; $('busca').value = ''; buscarMural(true);
  const y = S.voltar && S.voltar.scroll; S.voltar = null;
  if (y) setTimeout(() => scrollTo({ top:y }), 350);
}
$('pfLimpar').addEventListener('click', () => trocarAba('mural'));
// se a busca mudar ou o perfil sumir, sai do modo perfil
$('busca').addEventListener('input', () => modoPerfil(false));
new MutationObserver(() => { if ($('perfilBox').hidden && document.body.classList.contains('modo-perfil') && !S.busca.startsWith('@')) modoPerfil(false); }).observe($('perfilBox'), { attributes:true, attributeFilter:['hidden'] });
$('arrobaInput').addEventListener('input', e => { e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_@]/g, '').replace(/@/g, ''); });

$('btnArroba').addEventListener('click', () => {
  const p = S.perfil; $('arrobaErro').hidden = true;
  $('arrobaInput').value = p?.handle || '';
  $('btnSalvarArroba').textContent = p?.handle ? 'Trocar @' : 'Reservar @';
  $('btnLiberarArroba').hidden = !p?.handle;
  const info = $('arrobaInfo');
  if (p?.pendente) info.textContent = 'Troca para @' + p.pendente + ' em análise';
  else if (p?.handle && !p.pode_trocar) info.textContent = 'Você poderá trocar de @ em ' + new Date(p.troca_em).toLocaleDateString(LOC());
  else info.textContent = '';
  abrir('modalArroba'); if (!matchMedia('(max-width:640px)').matches) setTimeout(() => $('arrobaInput').focus(), 60);
});
function erroArroba(m){ const e = $('arrobaErro'); e.textContent = m; e.hidden = false; }
$('btnSalvarArroba').addEventListener('click', async () => {
  const h = normArroba($('arrobaInput').value), btn = $('btnSalvarArroba'); $('arrobaErro').hidden = true;
  if (h.length < 3) return erroArroba('Use pelo menos 3 caracteres.');
  if (!S.meus.length) return erroArroba('Publique pelo menos 1 site antes de reservar um @.');
  btn.disabled = true;
  try{
    const { data:res, error } = await _supabase.rpc('reservar_arroba', { p_handle:h, p_token:S.token });
    if (error) throw error;
    await carregarPerfil(); await buscarMeus(); atualizarMeusUI();
    fechar('modalArroba');
    if (String(res || '').startsWith('analise:')){ aviso('Pedido enviado: @' + h + ' em análise'); return; }
    aviso('@' + h + ' agora é seu');
    if (S.aba === 'meus') desenharMeus(); else buscarMural(true);
  }catch(err){ erroArroba(err.message || 'Não foi possível reservar.'); }
  finally{ btn.disabled = false; }
});
$('btnLiberarArroba').addEventListener('click', async () => {
  if (!await confirmar({ titulo:'Liberar seu @?', texto:'Qualquer pessoa poderá pegar esse nome e seus sites ficam sem @.', botao:'Liberar' })) return;
  const { data, error } = await _supabase.rpc('liberar_arroba', { p_token:S.token });
  if (error || !data){ erroArroba('Não foi possível liberar.'); return; }
  await carregarPerfil(); await buscarMeus(); atualizarMeusUI(); fechar('modalArroba'); aviso('@ liberado');
  if (S.aba === 'meus') desenharMeus(); else buscarMural(true);
});

/* ---------- chave ---------- */
$('btnChave').addEventListener('click', () => {
  $('chaveAtual').value = S.token; $('chaveAtual').type = 'password'; $('chaveNova').value = ''; $('chaveErro').hidden = true;
  abrir('modalChave');
});
$('btnVerChave').addEventListener('click', () => { const i = $('chaveAtual'); i.type = i.type === 'password' ? 'text' : 'password'; });
$('btnCopiarChave').addEventListener('click', async () => {
  try{ await navigator.clipboard.writeText(S.token); }
  catch(_){ const i = $('chaveAtual'); i.type = 'text'; i.select(); document.execCommand('copy'); i.type = 'password'; }
  aviso('Chave copiada. Guarde em um lugar seguro.');
});
$('btnUsarChave').addEventListener('click', async () => {
  const nova = $('chaveNova').value.trim().toLowerCase(), erro = $('chaveErro');
  if (!/^[0-9a-f]{64}$/.test(nova)){ erro.textContent = 'Chave inválida. Ela tem 64 caracteres (0-9 e a-f).'; erro.hidden = false; return; }
  if (nova === S.token){ erro.textContent = 'Essa já é a chave deste navegador.'; erro.hidden = false; return; }
  if (S.meus.length && !await confirmar({ titulo:'Trocar de chave?', texto:'Os sites desta chave atual só serão gerenciáveis de novo se você tiver guardado ela. Copie antes se precisar.', botao:'Trocar' })) return;
  gravarLS('bl_chave', nova); await iniciarChave();
  try{ await buscarMeus(); }catch(_){ S.meus = []; }
  await carregarPerfil(); carregarSeguindo(); fechar('modalChave'); atualizarMeusUI(); aviso(`Chave restaurada: ${S.meus.length} ${S.meus.length === 1 ? 'site encontrado' : 'sites encontrados'}`);
  if (S.aba === 'meus') desenharMeus(); else buscarMural(true);
});
$('btnExcluirTodos').addEventListener('click', excluirTodos);

/* ---------- eventos gerais ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!e.target.closest('#menu') && !(el && el.dataset.act === 'menu')) fecharMenu();
  if (!el) return;
  const a = el.dataset.act, id = el.dataset.id || el.closest('[data-id]')?.dataset.id;
  if (el.closest('#menu')) fecharMenu();
  if (['editar','excluir','denunciar'].includes(a)) fecharFicha();
  switch (a){
    case 'novo': if (S.aba !== 'publicar') abrirPublicar(); break;
    case 'menu': abrirMenu(el, id); break;
    case 'detalhes': abrirFicha(id); break;
    case 'fecharficha': fecharFicha(); break;
    case 'copiar': copiarLink(id); break;
    case 'fav': e.stopPropagation(); favAlternar(id); break;
    case 'compartilhar': compartilhar(id); break;
    case 'linkmural': linkMural(id); break;
    case 'linkperfil': linkPerfil(el.dataset.h); break;
    case 'temaselo': {
      const t = el.dataset.t === 'claro' ? 'claro' : 'escuro'; S.seloTema = t;
      const bl = el.closest('.sl'); if (!bl) break;
      bl.querySelectorAll('.sl-seg button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
      const pv = bl.querySelector('.sl-pv'); pv.classList.toggle('claro', t === 'claro'); pv.classList.toggle('escuro', t !== 'claro');
      const h = bl.querySelector('[data-h]').dataset.h; pv.querySelector('img').src = seloURL(h, t);
      const dl = bl.querySelector('[data-act="baixarselo"]'); if (dl) dl.href = seloURL(h, t);
      break;
    }
    case 'copiarselo': {
      const h = el.dataset.h, t = S.seloTema === 'claro' ? 'claro' : 'escuro';
      const cod = `<a href="https://blackelavex.online/bio/${h}" target="_blank" rel="noopener"><img src="https://blackelavex.online/selo/${h}${t === 'claro' ? '?t=claro' : ''}" alt="Estou no BLACKE LAVEX" width="292" height="${/^[a-z0-9_]{3,20}$/.test(h) ? 84 : 72}"></a>`;
      (navigator.clipboard ? navigator.clipboard.writeText(cod) : Promise.reject()).then(() => aviso('Código copiado'), () => prompt('Copie o código:', cod)); break;
    }
    case 'copiarbio': { const u = `${location.origin}/bio/${el.dataset.h}`; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => aviso('Link copiado'), () => prompt('Copie o link:', u)); break; }
    case 'editar': abrirEditar(id); break;
    case 'excluir': excluirUm(id); break;
    case 'denunciar': denunciar(id); break;
    case 'visitar': registrarClique(id); break;
    case 'perfil': {
      const h = el.dataset.h;
      if (!$('ficha').hidden && $('ficha').classList.contains('on')){
        // veio da ficha: fecha sem voltar no histórico e troca a entrada da ficha pela do perfil
        fecharFicha(false); S.fichaEntrada = false;
        irUrl('/@' + h, { perfil:h }, true); irParaPerfil(h, true); break;
      }
      irParaPerfil(h); break;
    }
  }
});
const _pubAberto = () => !$('modalCadastro').hidden;
$('bnav').addEventListener('click', e => { if (_pubAberto() && e.target.closest('.bn-pub')) e.stopPropagation(); }, true);
document.querySelectorAll('#bnav [data-nav]').forEach(b => b.addEventListener('click', () => {
  if (_pubAberto()){ fecharModal(); } if (S.aba !== b.dataset.nav || document.body.classList.contains('modo-perfil')) trocarAba(b.dataset.nav); else window.scrollTo({top:0,behavior:'smooth'}); }));
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => { if (S.aba !== b.dataset.aba) trocarAba(b.dataset.aba); }));

$('chips').innerHTML = ['Todas', 'Salvos', 'Seguindo', 'Verificados', 'Selo BLACKE', ...CATEGORIAS].map(c => `<button class="chip${c === 'Todas' ? ' on' : ''}" data-cat="${c}">${c === 'Salvos' ? '♥ Salvos' : c === 'Verificados' ? '✓ Verificados' : c}</button>`).join('');
$('chips').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
  S.cat = b.dataset.cat; buscarMural(true);
});
$('ordem').addEventListener('change', e => { S.ordem = e.target.value; buscarMural(true); });
let _bt; $('busca').addEventListener('input', e => { clearTimeout(_bt); _bt = setTimeout(() => { S.busca = e.target.value.trim(); buscarMural(true); }, 350); });
/* Rolagem infinita: ao chegar perto do fim, carrega o próximo lote (o botão segue como alternativa) */
const _io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
  const b = $('maisBtn'); if (es.some(e => e.isIntersecting) && !b.hidden && !b.disabled) b.click();
}, { rootMargin:'700px 0px' }) : null;
function vigiarFim(){ if (_io){ _io.unobserve($('maisBtn')); _io.observe($('maisBtn')); } }
$('maisBtn').addEventListener('click', () => { $('maisBtn').disabled = true; $('maisBtn').textContent = 'Carregando...'; S.pagina++; buscarMural(false); });

/* ---------- início ---------- */
(async function iniciar(){
  await iniciarChave();
  // confere o banco em paralelo (não atrasa o mural); se o principal estiver fora, recarrega os dados do reserva
  escolherBanco().then(() => { if (MODO.reserva){ buscarMural(true); carregarPerfil(); carregarVerificados(); carregarSeguindo(); carregarNotif(); } });
  try{ await buscarMeus(); }catch(_){ S.meus = []; }
  atualizarMeusUI(); buscarMural(true); carregarPerfil(); carregarVerificados(); carregarRanking(); carregarSeguindo(); carregarNotif();
  if (FAVS.length && S.token && !lerLS('bl_fav_sync')){
    Promise.all(FAVS.slice(0, 100).map(id => _supabase.rpc('salvar_site', { p_id:String(id), p_token:S.token, p_on:true }))).then(() => gravarLS('bl_fav_sync', '1'), () => {});
  }
  abrirLinkDireto();
})();

if ('serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));

/* Publicar: com o teclado aberto, o botão Publicar aparece logo abaixo do formulário (visível e sem cobrir os campos) */
(() => {
  const vv = window.visualViewport;
  const checar = () => {
    const h0 = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--h0')) || innerHeight;
    const aberto = !$('modalCadastro').hidden && (vv ? vv.height : innerHeight) < h0 - 150;
    document.body.classList.toggle('kb', aberto);
    if (aberto){ const f = document.activeElement; if (f && f.scrollIntoView && f.closest('#modalCadastro')) setTimeout(() => f.scrollIntoView({ block:'center', behavior:'smooth' }), 120); }
  };
  addEventListener('resize', checar); if (vv) vv.addEventListener('resize', checar);
  new MutationObserver(checar).observe($('modalCadastro'), { attributes:true, attributeFilter:['hidden'] });
})();

/* Abre direto o site (?s=ID) ou o perfil (?p=nome) vindos de um link compartilhado */
/* ---------- Rotas: cada tela tem seu link ----------
   /            Mural          /destaques   Destaques
   /meus-sites  Meus sites     /@nome       Perfil
   /s/ID        Site           /publicar    abre o Publicar */
async function abrirSitePorId(id){
  try{
    let it = acharItem(id);
    if (!it){
      const { data } = await _supabase.from('sites_publicos').select(COLS).eq('id', id).lt('denuncias', 5).eq('oculto', false).maybeSingle();
      if (!data){ aviso('Esse site não está mais no mural'); irUrl(urlBase(), null, true); return; }
      S.itens.push(data); it = data;
    }
    S.rotaSilenciosa = true; abrirFicha(it.id); S.rotaSilenciosa = false;
  }catch(_){ S.rotaSilenciosa = false; aviso('Não foi possível abrir esse site'); }
}
function rotear(){
  const p = location.pathname.replace(/\/+$/, '') || '/';
  const ms = p.match(/^\/s\/(\d{1,12})$/), mp = p.match(/^\/@([a-z0-9_]{3,30})$/i);
  if (!ms) fecharFicha(false);
  if (mp){
    const h = mp[1].toLowerCase();
    if (!(document.body.classList.contains('modo-perfil') && S.busca === '@' + h)) irParaPerfil(h, true);
  }else if (!ms){
    if (p === '/publicar'){ if (S.aba !== 'publicar') abrirPublicar(); }
    else{
      const aba = p === '/destaques' ? 'destaques' : (p === '/conta' || p === '/meus-sites') ? 'meus' : 'mural';
      if (document.body.classList.contains('modo-perfil') || S.aba !== aba) trocarAba(aba, true);
    }
  }
  if (ms && !(S.fichaId === ms[1] && !$('ficha').hidden)) abrirSitePorId(ms[1]);
}
addEventListener('popstate', rotear);
async function abrirLinkDireto(){
  const q = new URLSearchParams(location.search), s = q.get('s'), p = q.get('p');
  if (p && /^[a-z0-9_]{3,30}$/i.test(p)) irUrl('/@' + p.toLowerCase(), null, true);
  else if (s && /^\d{1,12}$/.test(s)){ irUrl('/s/' + s, null, true); S.fichaEntrada = true; }
  else if (location.search) irUrl(location.pathname, null, true);
  if (location.pathname.startsWith('/s/')) S.fichaEntrada = true;
  rotear();
}

/* ---------- Destaques: seção própria (mais acessados e novos) ---------- */
function desenharDestaques(){
  const lista = S.dest[S.destAba] || [], g = $('destLista');
  document.querySelectorAll('#destaques [data-d]').forEach(b => b.classList.toggle('on', b.dataset.d === S.destAba));
  g.innerHTML = '';
  if (!lista.length){ g.innerHTML = vazio('estrela', 'Ainda não há destaques', S.destAba === 'top' ? 'Os sites mais acessados aparecem aqui.' : 'Os sites mais novos aparecem aqui.', ['mural']); return; }
  lista.forEach((it, i) => {
    const c = criarCard(it, i);
    if (S.destAba === 'top') c.querySelector('.cover').insertAdjacentHTML('beforeend', `<i class="dest-rank${i < 3 ? ' top' : ''}">#${i + 1}</i>`);
    g.appendChild(c);
  });
  carregarReacoes(lista.map(s => s.id));
}
async function abrirDestaques(){
  $('destLista').innerHTML = '<div class="skeleton"></div>'.repeat(4);
  try{
    const base = () => _supabase.from('sites_publicos').select(COLS).lt('denuncias', 5).eq('oculto', false);
    const [t, n] = await Promise.all([
      base().gt('cliques', 0).order('cliques', { ascending:false }).order('id', { ascending:false }).limit(12),
      base().order('created_at', { ascending:false }).order('id', { ascending:false }).limit(12)
    ]);
    if (S.aba !== 'destaques') return;
    S.dest.top = t.data || []; S.dest.novos = n.data || [];
    if (!S.dest.top.length) S.destAba = 'novos';
  }catch(_){ S.dest = { top:[], novos:[] }; }
  desenharDestaques();
}
$('destaques').addEventListener('click', e => {
  const b = e.target.closest('[data-d]'); if (!b) return;
  S.destAba = b.dataset.d; desenharDestaques();
});

/* ---------- Desempenho dos meus sites (últimos 14 dias) ---------- */
const STATS = new Map(); let TREND = null, SERIE = null;
async function carregarStats(){
  if (!S.token || !S.meus.length) return;
  try{
    const { data, error } = await _supabase.rpc('meus_stats', { p_token:S.token });
    if (error || !data) return;
    STATS.clear(); (data.sites || []).forEach(s => STATS.set(String(s.id), s));
    const d = data.dias || []; SERIE = d.length ? d : null; TREND = d.length >= 2 ? { hj:d[d.length - 1].n, ontem:d[d.length - 2].n } : null;
    if (S.aba === 'meus'){ marcarInsights(); desenharMeuPerfil(); }
  }catch(_){}
}
function chipTendencia(hj, ontem){
  if (hj == null || ontem == null) return '';
  const d = hj - ontem;
  if (d > 0) return `<span class="tend sobe" title="Hoje ${hj} · Ontem ${ontem}">▲ ${fmtN(d)}</span>`;
  if (d < 0) return `<span class="tend desce" title="Hoje ${hj} · Ontem ${ontem}">▼ ${fmtN(-d)}</span>`;
  return `<span class="tend igual" title="Hoje ${hj} · Ontem ${ontem}">= 0</span>`;
}
function marcarInsights(){
  if (S.aba !== 'meus') return;
  document.querySelectorAll('#muralGrid .card').forEach(c => {
    const s = STATS.get(String(c.dataset.id)), it = S.meus.find(x => String(x.id) === String(c.dataset.id));
    const total = s ? s.total : (it ? it.cliques || 0 : 0);
    let el = c.querySelector('.ins'); if (!el){ el = document.createElement('div'); el.className = 'ins'; c.querySelector('.cover').appendChild(el); }
    el.innerHTML = `<span class="ins-n"><i class="fa-regular fa-eye"></i><b>${fmtN(total)}</b><em>${total === 1 ? 'visualização' : 'visualizações'}</em></span>${s ? chipTendencia(s.hj, s.ontem) : ''}`;
  });
}

/* Menu lateral do PC: abre só quando o mouse entra de verdade (não ao recarregar com o mouse parado em cima) e fecha ao clicar */
(() => {
  const r = $('bnav'); if (!r) return;
  let mexeu = false;
  r.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; if (!mexeu){ mexeu = true; return; } r.classList.add('aberto'); });
  r.addEventListener('pointerleave', () => { r.classList.remove('aberto'); mexeu = false; });
  r.addEventListener('click', e => { r.classList.remove('aberto'); mexeu = false; const b = e.target.closest('button,a'); if (b && e.detail) b.blur(); });
  // o menu só abre pelo teclado com Tab (F5 e outras teclas não abrem)
  addEventListener('keydown', e => { if (e.key === 'Tab') document.documentElement.classList.add('tecla'); });
  addEventListener('pointerdown', () => document.documentElement.classList.remove('tecla'));
})();
addEventListener('load', () => setTimeout(() => document.documentElement.classList.add('pronto'), 500));


/* PC: ao rolar, busca + categorias ficam fixas logo abaixo do topo */
(() => {
  const hero = document.querySelector('.hero'), bar = document.querySelector('.toolbar'), sb = $('searchbar');
  if (!hero || !bar || !sb || !('IntersectionObserver' in window)) return;
  const pc = matchMedia('(min-width:900px)'), lar = sb.parentNode, prox = sb.nextSibling;
  const ajustarTopo = () => { const t = document.querySelector('.topbar'); document.documentElement.style.setProperty('--topo', (t ? Math.round(t.getBoundingClientRect().height + 14) : 60) + 'px'); };
  ajustarTopo(); addEventListener('resize', ajustarTopo);
  let fixo = false;
  const aplicar = on => {
    on = on && pc.matches && S.aba === 'mural' && !document.body.classList.contains('modo-perfil');
    if (on === fixo) return; fixo = on;
    bar.classList.toggle('fixa', on); document.body.classList.toggle('barra-fixa', on);
  };
  new IntersectionObserver(([e]) => aplicar(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin:'-70px 0px 0px 0px' }).observe(hero);
  pc.addEventListener('change', () => aplicar(false));
  document.addEventListener('click', e => { if (e.target.closest('#bnav')) setTimeout(() => aplicar(scrollY > hero.offsetTop + hero.offsetHeight), 50); });
})();


/* Cabeçalho em bolha: ícone de busca à esquerda, marca no centro, idioma à direita */
(() => {
  const tb = document.querySelector('.topbar'), sb = $('searchbar'); if (!tb || !sb) return;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'tb-busca'; btn.setAttribute('aria-label', 'Buscar'); btn.title = 'Buscar';
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
  const acoes = tb.querySelector('.top-actions'); tb.insertBefore(btn, acoes);
  const fechar = document.createElement('button');
  fechar.type = 'button'; fechar.className = 'sb-fechar'; fechar.setAttribute('aria-label', 'Fechar busca');
  fechar.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  sb.appendChild(fechar); tb.insertBefore(sb, acoes);
  const abrirBusca = () => {
    if (S.aba !== 'mural' || document.body.classList.contains('modo-perfil')) trocarAba('mural');
    sb.hidden = false; tb.classList.add('buscando'); setTimeout(() => $('busca').focus(), 30);
  };
  const fecharBusca = () => {
    tb.classList.remove('buscando');
    if ($('busca').value){ $('busca').value = ''; S.busca = ''; modoPerfil(false); buscarMural(true); }
  };
  btn.addEventListener('click', abrirBusca);
  fechar.addEventListener('click', fecharBusca);
  $('busca').addEventListener('keydown', e => { if (e.key === 'Escape'){ e.stopPropagation(); fecharBusca(); } });
  $('busca').addEventListener('blur', () => setTimeout(() => { if (!$('busca').value && document.activeElement !== $('busca')) tb.classList.remove('buscando'); }, 150));
  // ao abrir um perfil pela busca (@nome), mostra o texto na barra
  new MutationObserver(() => { if ($('busca').value && S.busca && !document.body.classList.contains('modo-perfil')) tb.classList.add('buscando'); }).observe(document.body, { attributes:true, attributeFilter:['class'] });
})();


/* ---------- Ranking da semana (top sites dos últimos 7 dias) ---------- */
let RANK = null;
async function carregarRanking(){
  try{
    const { data, error } = await _supabase.rpc('ranking_semana', { p_limite:10 });
    RANK = !error && Array.isArray(data) && data.length ? data : null;
  }catch(_){ RANK = null; }
  desenharRanking();
}
function desenharRanking(){
  const el = $('ranking'); if (!el) return;
  const mostrar = RANK && S.aba === 'mural' && !document.body.classList.contains('modo-perfil') && !S.busca && S.cat === 'Todas';
  el.hidden = !mostrar; if (!mostrar) return;
  RANK.forEach(it => { if (!acharItem(it.id)) S.itens.push(it); });
  const topo = Math.max(1, +RANK[0].n7 || 1), tot = RANK.reduce((t, s) => t + (+s.n7 || 0), 0);
  const faces = RANK.slice(0, 3).map(s => miniAv(s.handle)).join('');
  const linhas = RANK.map((s, i) => `<li style="--i:${i}"><span class="nm-pos">${i + 1}</span><button type="button" class="rk-av" data-act="perfil" data-h="${esc(s.handle)}" aria-label="Ver @${esc(s.handle)}">${miniAv(s.handle)}</button><div class="nm-nm"><b translate="no">@${esc(s.handle)}${selosDe(s.handle)}</b><span class="nm-br"><i style="--w:${Math.max(4, Math.round((+s.n7 || 0) / topo * 100))}%"></i></span></div><span class="nm-v"><b>${fmtN(+s.n7 || 0)}</b>${+s.hj ? `<small>+${fmtN(+s.hj)} hoje</small>` : ''}</span><span class="rk-ac"><button type="button" class="btn-ghost" data-act="detalhes" data-id="${esc(s.id)}">Detalhes</button><a class="btn-primary" data-act="visitar" data-id="${esc(s.id)}" href="${urlSegura(s.link_url)}" target="_blank" rel="noopener noreferrer">Acessar site</a></span></li>`).join('');
  el.innerHTML = `<details class="nm rk" data-rk${S.rkAberto ? ' open' : ''}>
    <summary class="nm-h"><div><h3>Ranking da semana</h3><small class="nm-sub">Top ${RANK.length} · <b>${fmtN(tot)}</b> <span>${tot === 1 ? 'acesso' : 'acessos'}</span> <span>em 7 dias</span></small></div><div class="nm-ch"><span class="rk-f">${faces}</span><i class="nm-cv" aria-hidden="true"></i></div></summary>
    <div class="nm-b"><ol class="nm-r">${linhas}</ol></div>
  </details>`;
}

/* ---------- Sugestões de @ enquanto digita ---------- */
let _sgT, _sgSeq = 0;
function fecharSug(){ const b = $('sugestoes'); if (b) b.hidden = true; }
$('busca').addEventListener('input', e => {
  clearTimeout(_sgT);
  const t = String(e.target.value || '').trim().replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9_]{2,30}$/.test(t)){ fecharSug(); return; }
  _sgT = setTimeout(async () => {
    const meu = ++_sgSeq;
    try{
      const { data } = await _supabase.from('sites_publicos').select('handle').lt('denuncias', 5).eq('oculto', false).not('handle', 'is', null).ilike('handle', t.replace(/_/g, '\\_') + '%').limit(40);
      if (meu !== _sgSeq || !$('busca').value.trim()) return;
      const hs = [...new Set((data || []).map(x => x.handle).filter(Boolean))].sort((x, y) => (VERIF.has(y) - VERIF.has(x)) || x.localeCompare(y)).slice(0, 6);
      const box = $('sugestoes');
      if (!hs.length){ box.hidden = true; return; }
      box.innerHTML = '<div class="sug-t">Perfis</div>' + hs.map(h => `<button type="button" class="sug-i" data-sug="${esc(h)}">${miniAv(h)}<span class="sug-n" translate="no">@${esc(h)}</span>${selosDe(h)}</button>`).join('');
      box.hidden = false;
    }catch(_){}
  }, 220);
});
$('busca').addEventListener('blur', () => setTimeout(fecharSug, 180));
$('busca').addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Enter') fecharSug(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-sug]'); if (!b) return;
  fecharSug(); $('busca').value = ''; S.busca = ''; irParaPerfil(b.dataset.sug);
});
