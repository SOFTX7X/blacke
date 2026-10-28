const SUPABASE_URL = 'https://wyjrjioipqfltdyupfna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let imagemBase64 = "";

// Evita que textos/links cadastrados injetem HTML ou scripts na página
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function urlSegura(u) {
  return /^https?:\/\//i.test(u) ? esc(u) : '#';
}

// Sistema para carregar a Logo personalizada direto do dispositivo
function mudarLogo(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const logoUrl = e.target.result;
    const imgLogo = document.getElementById('logoImg');
    imgLogo.src = logoUrl;
    imgLogo.classList.remove('hidden');
    document.getElementById('logoIcon').classList.add('hidden');
    
    // Salva no navegador para não sumir ao atualizar a página
    localStorage.setItem('blacke_lavex_logo', logoUrl);
  };
  reader.readAsDataURL(file);
}

// Carregar logo salva ao iniciar (se houver)
window.addEventListener('DOMContentLoaded', () => {
  const savedLogo = localStorage.getItem('blacke_lavex_logo');
  if (savedLogo) {
    document.getElementById('logoImg').src = savedLogo;
  }
});

// Modal
function abrirModal() {
  document.getElementById('modalCadastro').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modalCadastro').classList.add('hidden');
  document.getElementById('formErro').classList.add('hidden');
  removerImagem();
}

// Upload de imagem do Card
function processarImagem(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem é muito grande. Escolha uma de até 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    imagemBase64 = e.target.result;
    document.getElementById('imagePreview').src = imagemBase64;
    document.getElementById('previewContainer').classList.remove('hidden');
    document.getElementById('uploadArea').classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

function removerImagem() {
  imagemBase64 = "";
  document.getElementById('fileInput').value = "";
  document.getElementById('imagePreview').src = "";
  document.getElementById('previewContainer').classList.add('hidden');
  document.getElementById('uploadArea').classList.remove('hidden');
}

// Carregar mural
async function carregarMural() {
  const grid = document.getElementById('muralGrid');
  const loading = document.getElementById('loadingState');

  try {
    const { data, error } = await _supabase
      .from('sites_publicos')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    loading.style.display = 'none';
    grid.innerHTML = '';

    if (!data || data.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-20 text-zinc-600 font-mono text-xs">NENHUM REGISTRO ENCONTRADO NO SISTEMA.</div>`;
      return;
    }

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = "bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-zinc-700 transition-all group";
      
      card.innerHTML = `
        <div>
          <div class="h-48 w-full overflow-hidden bg-black relative">
            <img src="${esc(item.image_url)}" alt="${esc(item.brand_name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 grayscale contrast-110 brightness-90 group-hover:brightness-110" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop'">
          </div>
          <div class="p-5 space-y-2">
            <h3 class="font-mono font-bold text-sm text-white tracking-wide uppercase">${esc(item.brand_name)}</h3>
            <p class="text-zinc-400 text-xs font-sans leading-relaxed line-clamp-3">${esc(item.caption) || 'Sem descrição.'}</p>
          </div>
        </div>
        <div class="p-5 pt-0">
          <a href="${urlSegura(item.link_url)}" target="_blank" rel="noopener noreferrer" class="w-full bg-zinc-900 hover:bg-accent text-zinc-300 hover:text-black border border-zinc-800 hover:border-accent-hi py-3 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
            <span>ACESSAR SITE</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    loading.innerHTML = `<p class="text-zinc-400 font-mono text-xs">ERRO DE CONEXÃO COM O BANCO DE DADOS.</p>`;
  }
}

// Salvar
async function salvarSite() {
  const nome = document.getElementById('inputNome').value.trim();
  const link = document.getElementById('inputLink').value.trim();
  const legenda = document.getElementById('inputLegenda').value.trim();
  const erroDiv = document.getElementById('formErro');
  const btn = document.getElementById('btnSalvar');

  erroDiv.classList.add('hidden');

  if (!imagemBase64) {
    erroDiv.innerText = "Adicione uma foto de capa.";
    erroDiv.classList.remove('hidden');
    return;
  }

  if (!nome || !link) {
    erroDiv.innerText = "Preencha o Nome e o Link.";
    erroDiv.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ENVIANDO...`;

  try {
    const { error } = await _supabase.from('sites_publicos').insert([
      { brand_name: nome, image_url: imagemBase64, link_url: link, caption: legenda }
    ]);

    if (error) throw error;

    fecharModal();
    document.getElementById('inputNome').value = '';
    document.getElementById('inputLink').value = '';
    document.getElementById('inputLegenda').value = '';
    carregarMural();
  } catch (err) {
    erroDiv.innerText = "Erro ao publicar: " + err.message;
    erroDiv.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Publicar no Mural";
  }
}

carregarMural();
