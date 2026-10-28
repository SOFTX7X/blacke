// Configurações do Supabase
const SUPABASE_URL = 'https://wyjrjioipqfltdyupfna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Função para resgatar o código no banco Supabase
 */
async function resgatarCodigo() {
  const codigoInput = document.getElementById('codigoInput');
  const codigo = codigoInput.value.trim().toUpperCase();
  const msgErro = document.getElementById('mensagemErro');
  const btn = document.getElementById('btnResgatar');

  msgErro.classList.add('hidden');

  if (!codigo) {
    msgErro.innerText = 'Por favor, digite o seu código!';
    msgErro.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Verificando...</span>`;

  try {
    const { data, error } = await _supabase.rpc('resgatar_login', { codigo_digitado: codigo });

    if (error) {
      msgErro.innerText = 'Erro ao processar código: ' + error.message;
      msgErro.classList.remove('hidden');
      return;
    }

    if (!data.sucesso) {
      msgErro.innerText = data.mensagem;
      msgErro.classList.remove('hidden');
      return;
    }

    // Oculta o formulário após a validação
    document.getElementById('formSection').classList.add('hidden');

    // Preenche os campos com as informações retornadas
    document.getElementById('outUsuario').value = data.usuario || '';
    document.getElementById('outSenha').value = data.senha || '';
    document.getElementById('outDns').value = data.dns_url || '';
    document.getElementById('outInstrucoes').innerText = data.instrucoes || 'Sem instruções adicionais.';

    // Exibe a seção de resultados
    document.getElementById('resultadoSection').classList.remove('hidden');
  } catch (err) {
    msgErro.innerText = 'Ocorreu um erro inesperado de conexão.';
    msgErro.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Liberar Acesso</span><i class="fa-solid fa-arrow-right text-xs"></i>';
  }
}

/**
 * Função para copiar texto dos inputs
 */
function copiar(idInput, botao) {
  const input = document.getElementById(idInput);
  navigator.clipboard.writeText(input.value).then(() => {
    const originalHTML = botao.innerHTML;
    
    botao.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> Copiado!`;
    botao.classList.add('btn-copiado');
    
    setTimeout(() => {
      botao.innerHTML = originalHTML;
      botao.classList.remove('btn-copiado');
    }, 2000);
  });
}

// Atalho para acionar o resgate ao apertar a tecla ENTER
document.getElementById('codigoInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    resgatarCodigo();
  }
});
