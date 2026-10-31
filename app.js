const SUPABASE_URL = 'https://wyjrjioipqfltdyupfna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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
(function scramble(){
  const el = $('heroTitle'), final = el.dataset.text;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const chars = '01#$%&*<>/\\|=+';
  let frame = 0; const total = 28;
  const id = setInterval(() => {
    frame++;
    el.textContent = final.split('').map((c,i) =>
      c === ' ' ? ' ' : (i < (frame/total)*final.length ? c : chars[Math.floor(Math.random()*chars.length)])
    ).join('');
    if (frame >= total){ clearInterval(id); el.textContent = final; }
  }, 40);
})();

/* Chuva binária de fundo (leve: poucas colunas, ~11 quadros/s, pausa fora da tela) */
(function rain(){
  const cv = $('rain'); if (!cv || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = cv.getContext('2d'); let size, cols, drops;
  function resize(){
    size = innerWidth < 700 ? 26 : 20;
    cv.width = innerWidth; cv.height = innerHeight;
    cols = Math.ceil(cv.width/size); drops = Array.from({length:cols}, () => Math.random()*-40);
    ctx.font = (size-6) + 'px IBM Plex Mono, monospace';
  }
  resize(); addEventListener('resize', resize);
  let last = 0;
  function draw(t){
    requestAnimationFrame(draw);
    if (document.hidden || document.body.classList.contains('modal-open') || document.body.classList.contains('ficha-open') || t - last < (innerWidth < 700 ? 140 : 90)) return;
    last = t;
    ctx.fillStyle = 'rgba(6,7,13,.16)'; ctx.fillRect(0,0,cv.width,cv.height);
    for (let i=0;i<cols;i++){
      if (drops[i] < 0){ drops[i]++; continue; }
      const y = drops[i]*size;
      ctx.fillStyle = Math.random() > .95 ? 'rgba(111,214,255,.9)' : 'rgba(123,108,255,.5)';
      ctx.fillText(Math.random() > .5 ? '1' : '0', i*size, y);
      if (y > cv.height && Math.random() > .97) drops[i] = 0;
      drops[i] += 1;
    }
  }
  requestAnimationFrame(draw);
})();


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

function confirmar({titulo, texto, botao}){
  return new Promise(res => {
    $('cfTitulo').textContent = titulo; $('cfTexto').textContent = texto; $('cfOk').textContent = botao || 'Confirmar';
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
  if (S.meus.length >= LIMITE){ aviso(`Você já tem ${LIMITE} sites. Exclua um para publicar outro.`); if (location.pathname === '/publicar') irUrl('/', null, true); return; }
  editId = null; limparForm();
  $('ptTitulo').textContent = 'Nova publicação'; $('btnSalvar').textContent = 'Publicar';
  entrarPublicar();
}
function abrirEditar(id){
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
  $('ptArroba').innerHTML = h ? `<span class="arroba"><span>@${esc(h)}</span>${VERIF.has(h) ? SELO : ''}</span>` : '<span class="anon">anônimo</span>';
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
    if (e.pointerType === 'mouse'){
      const rx = ((y/r.height) - .5) * -4, ry = ((x/r.width) - .5) * 5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    }
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
const VERIF = new Set();
const arrobaBtn = h => `<button class="arroba" type="button" data-act="perfil" data-h="${esc(h)}" translate="no"><span>@${esc(h)}</span>${VERIF.has(h) ? SELO : ''}</button>`;
async function carregarVerificados(){
  try{
    const { data } = await _supabase.rpc('perfis_verificados');
    (data || []).forEach(h => VERIF.add(h));
    document.querySelectorAll('.arroba[data-h]').forEach(b => { if (VERIF.has(b.dataset.h) && !b.querySelector('.selo')) b.insertAdjacentHTML('beforeend', SELO); });
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
      <span class="vistas" title="${n} ${n === 1 ? 'acesso' : 'acessos'}"><i class="fa-regular fa-eye"></i> ${n}</span>
    </div>
    <div class="body">
      <h3 data-act="detalhes" translate="no"><span>${esc(item.brand_name)}</span>${selo(item)}</h3>
      <div class="line2">
        ${item.handle ? arrobaBtn(item.handle) : '<span class="anon">anônimo</span>'}
      </div>
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
}
function setEstado(html, aviso_){ const e = $('estado'); e.className = 'estado' + (aviso_ ? ' warn' : ''); e.innerHTML = html || ''; }
const BTN_NOVO = '<br><button class="btn-primary" data-act="novo" style="margin-top:14px"><i class="fa-solid fa-plus"></i> Publicar link</button>';
function skeleton(){ $('muralGrid').innerHTML = '<div class="skeleton"></div>'.repeat(4); setEstado(''); $('maisBtn').hidden = true; }
function erroCarga(err){
  console.error(err);
  $('muralGrid').innerHTML = ''; $('maisBtn').hidden = true;
  const desatualizado = err && (err.code === '42703' || /column|function/i.test(err.message || ''));
  setEstado(desatualizado ? 'O banco ainda não foi atualizado. Rode o arquivo supabase.sql no Supabase.' : 'Não foi possível carregar. Atualize a página em instantes.', true);
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
function relacionados(it){
  const mapa = new Map(); S.itens.concat(S.meus).forEach(s => { if (String(s.id) !== String(it.id)) mapa.set(String(s.id), s); });
  const todos = [...mapa.values()];
  const pts = s => (it.handle && s.handle === it.handle ? 2 : 0) + (s.categoria === it.categoria ? 1 : 0);
  const afins = todos.filter(s => pts(s) > 0).sort((a, b) => pts(b) - pts(a));
  return afins.concat(todos.filter(s => !afins.includes(s))).slice(0, 4);
}
function recomecarAnimacao(){
  document.querySelectorAll('#ficha .rise').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
}
const ROTA = { mural:'/', destaques:'/destaques', meus:'/meus-sites', publicar:'/publicar' };
function urlBase(){ return document.body.classList.contains('modo-perfil') && S.busca.startsWith('@') ? '/@' + S.busca.slice(1) : (ROTA[S.aba] || '/'); }
function irUrl(url, state, trocar){
  try{
    if (location.pathname === url && !location.search) trocar = true;
    history[trocar ? 'replaceState' : 'pushState'](state ?? null, '', url);
  }catch(_){}
}
function abrirFicha(id){
  S.fichaId = String(id);
  const it = acharItem(id); if (!it) return;
  const w = $('ficha'), n = it.cliques || 0;
  const img = $('fcImg'); img.style.display = ''; img.onerror = () => { img.style.display = 'none'; };
  img.src = it.image_url; img.style.objectPosition = posSegura(it.img_pos);
  $('fcCat').textContent = it.categoria || 'Outros';
  $('fcNome').innerHTML = esc(it.brand_name) + selo(it);
  $('mAcessos').textContent = `${n} ${n === 1 ? 'acesso' : 'acessos'}`;
  $('mData').textContent = it.created_at ? 'Publicado em ' + new Date(it.created_at).toLocaleDateString(LOC()) : 'Data não informada';
  $('mPerfil').innerHTML = it.handle ? arrobaBtn(it.handle) : '<span class="anon">anônimo</span>';
  const leg = $('fcLegenda'); leg.translate = !it.caption; leg.textContent = it.caption || 'Este site ainda não tem legenda.'; leg.classList.toggle('vazia', !it.caption);

  const extras = acoesDe(it).filter(a => a.act !== 'detalhes' && a.act !== 'copiar');
  $('pnBox').innerHTML = `
    <a class="btn-primary pn-go" data-act="visitar" data-id="${esc(it.id)}" href="${urlSegura(it.link_url)}" target="_blank" rel="noopener noreferrer"><span>Acessar site</span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
    <div class="pn-sec">
      <button class="btn-ghost" type="button" data-act="copiar" data-id="${esc(it.id)}"><i class="fa-regular fa-copy"></i><span>Copiar link</span></button>
      ${extras.map(a => `<button class="btn-ghost${a.danger ? ' btn-danger' : ''}" type="button" data-act="${a.act}" data-id="${esc(it.id)}" aria-label="${a.txt}"><i class="${a.ic}"></i><span>${a.txt}</span></button>`).join('')}
    </div>
    <p class="pn-note">O site abre em uma nova aba. O BLACKE LAVEX não controla o conteúdo dos links publicados.</p>`;

  const rel = relacionados(it);
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
  S.fichaEntrada = false;
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
  }, Math.max(0, 1200 - (performance.now() - splash.t0)));      // fica pelo menos ~1,2 s para não piscar
}
setTimeout(fecharSplash, 7000);

/* ---------- Mural ---------- */
async function buscarMural(reset){
  const meu = ++S.seq;
  if (reset){ S.pagina = 0; S.itens = []; skeleton(); }
  try{
    let q = _supabase.from('sites_publicos').select(COLS, { count:'exact' }).lt('denuncias', 5).eq('oculto', false);
    if (S.cat === 'Salvos') q = q.in('id', FAVS.length ? FAVS.slice(0, 200) : [0]);
    else if (S.cat !== 'Todas') q = q.eq('categoria', S.cat);
    const porArroba = S.busca.startsWith('@');
    if (porArroba){
      const h = normArroba(S.busca);
      q = q.ilike('handle', (h || '-').replace(/_/g, '\\_') + '%');
      if (reset) mostrarPerfil(h);
    }else{
      const t = S.busca.replace(/[%,()*\\]/g, ' ').trim();
      if (t) q = q.or(`brand_name.ilike.%${t}%,caption.ilike.%${t}%,handle.ilike.%${t}%`);
      if (reset) $('perfilBox').hidden = true;
    }
    q = S.ordem === 'acessos'
      ? q.order('cliques', { ascending:false }).order('id', { ascending:false })
      : q.order('created_at', { ascending:false }).order('id', { ascending:false });
    const de = S.pagina * PAGE;
    const { data, error, count } = await q.range(de, de + PAGE);
    if (meu !== S.seq) return;            // chegou uma busca mais nova
    if (error) throw error;
    const lote = (data || []).slice(0, PAGE);
    S.temMais = (data || []).length > PAGE; S.total = count ?? lote.length;
    S.itens = S.itens.concat(lote);
    anexar(lote, reset);
    $('contador').textContent = `${S.total} ${S.total === 1 ? 'site' : 'sites'}`;
    $('maisBtn').hidden = !S.temMais; $('maisBtn').disabled = false; $('maisBtn').textContent = 'Carregar mais';
    vigiarFim();
    if (!S.itens.length){
      const filtrando = S.busca || S.cat !== 'Todas';
      setEstado(S.cat === 'Salvos' && !S.busca ? 'Você ainda não salvou nenhum site. Toque no ♥ de um card para guardar aqui.' : filtrando ? 'Nada encontrado. Tente outra busca ou categoria.' : 'O mural está vazio. Seja o primeiro a publicar.' + BTN_NOVO);
    } else setEstado('');
    fecharSplash();
  }catch(err){ if (meu === S.seq) erroCarga(err); fecharSplash(); }
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
  setEstado(S.meus.length ? '' : (S.hash ? 'Você ainda não publicou nenhum site neste navegador.' + BTN_NOVO : 'Seu navegador bloqueou o recurso de chave. Abra o site em https.'), !S.hash);
}

async function trocarAba(aba, semHistorico, manterPerfil){
  if (!semHistorico) irUrl(ROTA[aba] || '/', { aba });
  if (!manterPerfil && document.body.classList.contains('modo-perfil')){
    if (aba === 'mural' && S.aba === 'mural'){ sairPerfil(); return; }
    modoPerfil(false); S.busca = ''; $('busca').value = '';
  }
  S.aba = aba; document.body.dataset.aba = aba;
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
}
function atualizarPerfilUI(){
  const p = S.perfil; desenharMeuPerfil();
  const m = $('meuArroba');
  if (!p?.handle) m.textContent = 'Você ainda não tem um @';
  else m.innerHTML = `<span class="ma"><span translate="no">@${esc(p.handle)}</span>${p.verificado ? SELO : ''}</span>${p.suspenso ? ' <span>(suspenso)</span>' : ''}${p.pendente ? ` <small class="pendente">Troca para @${esc(p.pendente)} em análise</small>` : ''}`;
  $('btnArroba').innerHTML = '<i class="fa-solid fa-at"></i> ' + (p?.handle ? 'Trocar @' : 'Reservar @');
}
async function mostrarPerfil(h){
  const box = $('perfilBox');
  if (!h || h.length < 3){ box.hidden = true; return; }
  let data = null;
  try{ ({ data } = await _supabase.rpc('perfil_publico', { p_handle:h })); }catch(_){}
  if (!S.busca.startsWith('@') || normArroba(S.busca) !== h) return;   // a busca mudou enquanto carregava
  if (!data){ box.hidden = true; return; }
  if (data.verificado) VERIF.add(data.handle);
  $('pfCard').innerHTML = cartaoPerfil(data, false);
  box.hidden = false;
}

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
    </div>`;
  }
  const ct = Array.isArray(p.contatos) ? p.contatos.filter(c => /^https:\/\//.test(c.url || '')) : [];
  const desde = p.desde ? new Date(p.desde).toLocaleDateString('pt-BR', { month:'long', year:'numeric' }) : '';
  return `<div class="ig${p.verificado ? ' pc-ver' : ''}">
    <div class="ig-av">${avatarHTML(p)}</div>
    <div class="ig-nome"><h2 translate="no">${esc(p.handle)}</h2>${p.verificado ? SELO : ''}${dono ? `<span class="so-pc">${TOOLS(p.handle)}</span>` : ''}</div>
    <ul class="ig-nums">
      ${num(p.sites, 'site', 'sites')}
      ${num(p.acessos, 'acesso', 'acessos', dono && TREND ? ' ' + chipTendencia(TREND.hj, TREND.ontem) : '')}
      ${num(p.salvos, 'salvo', 'salvos')}
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
      ${ct.map(c => `<a class="pc-btn ct" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><i class="${CT_ICO[c.tipo] || 'fa-solid fa-link'}"></i> <span>${nomeContato(c)}</span></a>`).join('')}
      ${dono ? '' : `<button class="pc-btn" type="button" data-act="linkperfil" data-h="${esc(p.handle)}"><i class="fa-solid fa-share-nodes"></i> <span>Compartilhar</span></button>`}
    </div>
  </div>
  <div class="ig-tab"><span><i class="fa-solid fa-table-cells"></i> Sites</span></div>`;
}
function desenharMeuPerfil(){
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
  if (!document.body.classList.contains('modo-perfil')) S.voltar = { scroll:scrollY };
  S.busca = '@' + h; $('busca').value = S.busca; resetChips(); modoPerfil(true);
  if (!semHistorico) irUrl('/@' + h, { perfil:h });
  scrollTo({ top:0 });
  if (S.aba !== 'mural') trocarAba('mural', true, true); else buscarMural(true);
}
function sairPerfil(){
  modoPerfil(false); S.busca = ''; $('busca').value = ''; buscarMural(true);
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
  await carregarPerfil(); fechar('modalChave'); atualizarMeusUI(); aviso(`Chave restaurada: ${S.meus.length} ${S.meus.length === 1 ? 'site encontrado' : 'sites encontrados'}`);
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

$('chips').innerHTML = ['Todas', 'Salvos', ...CATEGORIAS].map(c => `<button class="chip${c === 'Todas' ? ' on' : ''}" data-cat="${c}">${c === 'Salvos' ? '♥ Salvos' : c}</button>`).join('');
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
  try{ await buscarMeus(); }catch(_){ S.meus = []; }
  atualizarMeusUI(); buscarMural(true); carregarPerfil(); carregarVerificados();
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
      const aba = p === '/destaques' ? 'destaques' : p === '/meus-sites' ? 'meus' : 'mural';
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
  if (!lista.length){ g.innerHTML = '<p class="dest-vazio">Ainda não há sites aqui.</p>'; return; }
  lista.forEach((it, i) => {
    const c = criarCard(it, i);
    if (S.destAba === 'top') c.querySelector('.cover').insertAdjacentHTML('beforeend', `<i class="dest-rank">${i + 1}</i>`);
    g.appendChild(c);
  });
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
const STATS = new Map(); let TREND = null;
async function carregarStats(){
  if (!S.token || !S.meus.length) return;
  try{
    const { data, error } = await _supabase.rpc('meus_stats', { p_token:S.token });
    if (error || !data) return;
    STATS.clear(); (data.sites || []).forEach(s => STATS.set(String(s.id), s));
    const d = data.dias || []; TREND = d.length >= 2 ? { hj:d[d.length - 1].n, ontem:d[d.length - 2].n } : null;
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
