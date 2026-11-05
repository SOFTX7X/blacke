/* Configurações: reutiliza o sistema de aparência existente. */
(() => {
  'use strict';
  const screen = document.getElementById('cfgScreen');
  if (!screen) return;
  const $cfg = id => document.getElementById(id);
  const safeText = (el, value) => { el.textContent = String(value || ''); };
  function refresh(){
    const p = (typeof S !== 'undefined' && S.perfil) || null;
    safeText($cfg('cfgName'), (p && (p.nome || p.nome_exibicao || p.handle)) || 'Minha conta');
    safeText($cfg('cfgHandle'), p && p.handle ? '@' + p.handle : 'Sem @ reservado');
    const av = $cfg('cfgAvatar');
    av.replaceChildren();
    if (p && p.foto && /^https:\/\//i.test(p.foto)){
      const img = document.createElement('img'); img.alt = ''; img.referrerPolicy = 'no-referrer'; img.src = p.foto; av.append(img);
    } else safeText(av, p && p.handle ? p.handle[0].toUpperCase() : 'B');
    document.querySelectorAll('#cfgTemas [data-cfg-tema]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cfgTema === (document.documentElement.classList.contains('claro') ? 'claro' : 'escuro'))));
    const fam = apLS.get('bl_fonte_n');
    document.querySelectorAll('#cfgFontes [data-cfg-fonte]').forEach(b => {
      const f = FONTES.find(x => x.id === b.dataset.cfgFonte);
      b.setAttribute('aria-pressed', String(!!f && (fam ? (f.fam || f.nome) === fam : f.id === 'padrao')));
    });
  }
  function open(push=true){
    if (push && location.pathname !== '/configuracoes') history.pushState({configuracoes:true}, '', '/configuracoes');
    screen.hidden = false; document.body.classList.add('cfg-open'); refresh();
  }
  function close(){
    screen.hidden = true; document.body.classList.remove('cfg-open');
  }
  function back(){
    if (location.pathname === '/configuracoes' && history.state && history.state.configuracoes) history.back();
    else { history.replaceState({aba:'meus'}, '', '/conta'); close(); if (typeof trocarAba === 'function') trocarAba('meus',true); }
  }
  $cfg('cfgBack').addEventListener('click', back);
  $cfg('cfgOpen').addEventListener('click', () => open());
  $cfg('cfgTemas').addEventListener('click', e => {
    const b = e.target.closest('[data-cfg-tema]'); if (!b) return;
    aplicarTema(b.dataset.cfgTema); refresh();
  });
  const fonts = $cfg('cfgFontes');
  FONTES.forEach(f => {
    const b = document.createElement('button'); b.type='button'; b.dataset.cfgFonte=f.id;
    const title=document.createElement('span'); title.textContent=f.nome;
    const sample=document.createElement('small'); sample.textContent='Aa Bb Cc 123';
    if (f.id !== 'padrao') b.style.fontFamily=(f.fam || f.nome)+',system-ui,sans-serif';
    b.append(title,sample); fonts.append(b);
  });
  fonts.addEventListener('click', e => {
    const b=e.target.closest('[data-cfg-fonte]'); if (!b) return;
    aplicarFonte(b.dataset.cfgFonte); refresh();
  });
  window.addEventListener('popstate', () => {
    if (location.pathname === '/configuracoes') open(false);
    else close();
  });
  if (location.pathname === '/configuracoes') open(false);
})();
