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

/* Logo (clique para trocar) */
$('brandBtn').addEventListener('click', e => { e.preventDefault(); $('logoFileInput').click(); });
function mudarLogo(event){
  const file = event.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => { $('logoImg').src = e.target.result; try{ localStorage.setItem('blacke_lavex_logo', e.target.result); }catch(_){} };
  r.readAsDataURL(file);
}
try{ const s = localStorage.getItem('blacke_lavex_logo'); if (s) $('logoImg').src = s; }catch(_){}

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

/* Chuva binária de fundo */
(function rain(){
  const cv = $('rain'); if (!cv || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = cv.getContext('2d'); const size = 16; let cols, drops;
  function resize(){ cv.width = innerWidth; cv.height = innerHeight; cols = Math.ceil(cv.width/size); drops = Array.from({length:cols}, () => Math.random()*-50); }
  resize(); addEventListener('resize', resize);
  let last = 0;
  function draw(t){
    requestAnimationFrame(draw);
    if (document.hidden || t - last < 70) return; last = t;
    ctx.fillStyle = 'rgba(6,7,13,.14)'; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.font = '13px IBM Plex Mono, monospace';
    for (let i=0;i<cols;i++){
      const y = drops[i]*size;
      ctx.fillStyle = Math.random() > .96 ? 'rgba(111,214,255,.9)' : 'rgba(123,108,255,.45)';
      ctx.fillText(Math.random() > .5 ? '1' : '0', i*size, y);
      if (y > cv.height && Math.random() > .975) drops[i] = 0;
      drops[i] += 1;
    }
  }
  requestAnimationFrame(draw);
})();

/* Modal */
function abrirModal(){ $('modalCadastro').hidden = false; setTimeout(() => $('inputNome').focus(), 60); }
function fecharModal(){ $('modalCadastro').hidden = true; $('formErro').hidden = true; removerImagem(); }
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('modalCadastro').hidden) fecharModal(); });
$('modalCadastro').addEventListener('mousedown', e => { if (e.target.id === 'modalCadastro') fecharModal(); });
$('uploadArea').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('fileInput').click(); } });

function processarImagem(event){
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 5*1024*1024){ mostrarErro('A imagem passa de 5 MB. Escolha uma menor.'); return; }
  const r = new FileReader();
  r.onload = e => {
    imagemBase64 = e.target.result;
    $('imagePreview').src = imagemBase64;
    $('previewContainer').hidden = false; $('uploadArea').hidden = true;
  };
  r.readAsDataURL(file);
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
      const rx = ((y/r.height) - .5) * -6, ry = ((x/r.width) - .5) * 8;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
}

function desenhar(lista){
  const grid = $('muralGrid'); grid.innerHTML = '';
  lista.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'card'; card.style.setProperty('--i', Math.min(i, 12));
    card.innerHTML = `
      <div class="cover">
        <img src="${esc(item.image_url)}" alt="Capa de ${esc(item.brand_name)}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'">
      </div>
      <div class="body">
        <h3>${esc(item.brand_name)}</h3>
        <p>${esc(item.caption) || 'Sem legenda.'}</p>
      </div>
      <a class="visit" href="${urlSegura(item.link_url)}" target="_blank" rel="noopener noreferrer">
        <span>Acessar site</span><i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>`;
    efeitoCard(card); grid.appendChild(card);
  });
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
