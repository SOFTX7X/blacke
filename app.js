const SUPABASE_URL = 'https://wyjrjioipqfltdyupfna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let imagemBase64 = "";
let registros = [];

const $ = id => document.getElementById(id);

/* Segurança: nunca injetar texto de usuário como HTML */
function esc(v){
  return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function urlSegura(u){ return /^https?:\/\//i.test(u) ? esc(u) : '#'; }

/* Toast */
function aviso(msg){
  const t = $('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(aviso._t); aviso._t = setTimeout(() => t.classList.remove('on'), 2800);
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
    if (document.hidden || document.body.classList.contains('modal-open') || t - last < 90) return;
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

/* Modal */
function abrirModal(){ document.body.classList.add('modal-open'); $('modalCadastro').hidden = false; setTimeout(() => $('inputNome').focus(), 60); }
function fecharModal(){ document.body.classList.remove('modal-open'); $('modalCadastro').hidden = true; $('formErro').hidden = true; removerImagem(); }
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('modalCadastro').hidden) fecharModal(); });
$('modalCadastro').addEventListener('mousedown', e => { if (e.target.id === 'modalCadastro') fecharModal(); });
$('uploadArea').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('fileInput').click(); } });

/* Reduz a imagem antes de enviar (900px, JPEG) — deixa o mural muito mais leve */
function comprimir(file){
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width*s); c.height = Math.round(img.height*s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); falha(); };
    img.src = url;
  });
}
async function processarImagem(event){
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 15*1024*1024){ mostrarErro('A imagem passa de 15 MB. Escolha uma menor.'); return; }
  try{
    imagemBase64 = await comprimir(file);
    $('imagePreview').src = imagemBase64;
    $('previewContainer').hidden = false; $('uploadArea').hidden = true; $('formErro').hidden = true;
  }catch(_){ mostrarErro('Não foi possível ler essa imagem. Tente outra.'); }
}
function removerImagem(){
  imagemBase64 = ""; $('fileInput').value = ""; $('imagePreview').src = "";
  $('previewContainer').hidden = true; $('uploadArea').hidden = false;
}
function mostrarErro(m){ const d = $('formErro'); d.textContent = m; d.hidden = false; }

/* Cards */
function efeitoCard(card){
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.setProperty('--mx', x+'px'); card.style.setProperty('--my', y+'px');
    if (e.pointerType === 'mouse'){
      const rx = ((y/r.height) - .5) * -4, ry = ((x/r.width) - .5) * 5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    }
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
}

/* Legenda longa: "Ver mais / Ver menos" (ou toque na própria legenda) */
function ligarLegenda(card){
  const p = card.querySelector('.cap'), b = card.querySelector('.more');
  const alternar = () => {
    const aberto = p.classList.toggle('open');
    b.textContent = aberto ? 'Ver menos' : 'Ver mais';
  };
  b.addEventListener('click', alternar);
  p.addEventListener('click', () => { if (p.classList.contains('can')) alternar(); });
}
function medirLegendas(){
  document.querySelectorAll('.card').forEach(card => {
    const p = card.querySelector('.cap'), b = card.querySelector('.more');
    if (p.classList.contains('open')) return;
    const longa = p.scrollHeight > p.clientHeight + 1;
    p.classList.toggle('can', longa); b.classList.toggle('show', longa);
  });
}
let _rz; addEventListener('resize', () => { clearTimeout(_rz); _rz = setTimeout(medirLegendas, 150); });

function desenhar(lista){
  const grid = $('muralGrid'); grid.innerHTML = '';
  lista.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'card'; card.style.setProperty('--i', Math.min(i, 12));
    card.innerHTML = `
      <div class="cover">
        <img src="${esc(item.image_url)}" alt="Capa de ${esc(item.brand_name)}" loading="lazy" decoding="async"
             onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'">
      </div>
      <div class="body">
        <h3>${esc(item.brand_name)}</h3>
        <p class="cap">${esc(item.caption) || 'Sem legenda.'}</p>
        <button class="more" type="button">Ver mais</button>
      </div>
      <a class="visit" href="${urlSegura(item.link_url)}" target="_blank" rel="noopener noreferrer">
        <span>Acessar site</span><i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>`;
    efeitoCard(card); ligarLegenda(card); grid.appendChild(card);
  });
  requestAnimationFrame(medirLegendas);
  const total = registros.length;
  $('contador').textContent = lista.length === total ? `${total} ${total === 1 ? 'site' : 'sites'}` : `${lista.length} de ${total}`;
  const est = $('estado'); est.className = 'estado';
  est.innerHTML = lista.length ? '' : (total ? 'Nada encontrado para essa busca.' : 'O mural está vazio. Seja o primeiro a publicar.');
}

$('busca').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  desenhar(!q ? registros : registros.filter(r => (r.brand_name + ' ' + (r.caption || '')).toLowerCase().includes(q)));
});

async function carregarMural(){
  const grid = $('muralGrid');
  grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  try{
    const { data, error } = await _supabase.from('sites_publicos').select('*').order('id', { ascending:false });
    if (error) throw error;
    registros = data || [];
    desenhar(registros);
  }catch(err){
    grid.innerHTML = '';
    const est = $('estado'); est.className = 'estado warn';
    est.textContent = 'Não foi possível carregar o mural. Atualize a página em instantes.';
  }
}

async function salvarSite(){
  const nome = $('inputNome').value.trim(), link = $('inputLink').value.trim(), legenda = $('inputLegenda').value.trim();
  const btn = $('btnSalvar'); $('formErro').hidden = true;

  if (!imagemBase64) return mostrarErro('Escolha uma imagem de capa.');
  if (!nome || !link) return mostrarErro('Preencha o nome e o link.');
  if (!/^https?:\/\//i.test(link)) return mostrarErro('O link precisa começar com http:// ou https://');

  btn.disabled = true; btn.textContent = 'Publicando...';
  try{
    const { error } = await _supabase.from('sites_publicos').insert([{ brand_name:nome, image_url:imagemBase64, link_url:link, caption:legenda }]);
    if (error) throw error;
    fecharModal();
    ['inputNome','inputLink','inputLegenda'].forEach(id => $(id).value = '');
    aviso('Publicado no mural');
    carregarMural();
  }catch(err){
    mostrarErro('Não foi possível publicar: ' + err.message);
  }finally{
    btn.disabled = false; btn.textContent = 'Publicar';
  }
}

carregarMural();
