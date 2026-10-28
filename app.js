// Configurações do Supabase para o BLACKE LAVEX
const SUPABASE_URL = 'https://wyjrjioipqfltdyupfna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções para abrir e fechar o modal de cadastro
function abrirModal() {
  document.getElementById('modalCadastro').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modalCadastro').classList.add('hidden');
  document.getElementById('formErro').classList.add('hidden');
}

// Carregar e renderizar os sites cadastrados no mural público
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
      grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500">Nenhum site cadastrado ainda. Seja o primeiro a publicar!</div>`;
      return;
    }

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = "bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group";
      
      card.innerHTML = `
        <div>
          <div class="h-48 w-full overflow-hidden bg-slate-950 relative">
            <img src="${item.image_url}" alt="${item.brand_name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop'">
          </div>
          <div class="p-5 space-y-2">
            <h3 class="font-bold text-lg text-white tracking-wide">${item.brand_name}</h3>
            <p class="text-slate-400 text-xs leading-relaxed line-clamp-3">${item.caption || 'Sem descrição.'}</p>
          </div>
        </div>
        <div class="p-5 pt-0">
          <a href="${item.link_url}" target="_blank" class="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
            <span>Acessar Site</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    loading.innerHTML = `<p class="text-red-400">Erro ao carregar os dados do mural.</p>`;
  }
}

// Salvar novo site no banco de dados do Supabase
async function salvarSite() {
  const nome = document.getElementById('inputNome').value.trim();
  const capa = document.getElementById('inputCapa').value.trim();
  const link = document.getElementById('inputLink').value.trim();
  const legenda = document.getElementById('inputLegenda').value.trim();
  const erroDiv = document.getElementById('formErro');
  const btn = document.getElementById('btnSalvar');

  erroDiv.classList.add('hidden');

  if (!nome || !capa || !link) {
    erroDiv.innerText = "Preencha pelo menos o Nome, o Link da Capa e o Link de Acesso!";
    erroDiv.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Publicando...`;

  try {
    const { error } = await _supabase.from('sites_publicos').insert([
      { brand_name: nome, image_url: capa, link_url: link, caption: legenda }
    ]);

    if (error) throw error;

    fecharModal();
    
    // Limpar os campos do formulário
    document.getElementById('inputNome').value = '';
    document.getElementById('inputCapa').value = '';
    document.getElementById('inputLink').value = '';
    document.getElementById('inputLegenda').value = '';
    
    // Atualizar o mural instantaneamente para mostrar o novo site
    carregarMural();
  } catch (err) {
    erroDiv.innerText = "Erro ao publicar: " + err.message;
    erroDiv.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Publicar no Mural";
  }
}

// Inicializar carregamento automático ao abrir a página
carregarMural();
