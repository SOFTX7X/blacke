/* Configurações: reutiliza o sistema de aparência existente. */
(() => {
  'use strict';
  const screen = document.getElementById('cfgScreen');
  if (!screen) return;
  const $cfg = id => document.getElementById(id);
  const safeText = (el, value) => { el.textContent = String(value || ''); };
  const pages = {home:'cfgHome',aparencia:'cfgAppearance',fontes:'cfgFontPage',idioma:'cfgLanguage'};
  const titles = {home:'Configurações',aparencia:'Aparência',fontes:'Fontes',idioma:'Idioma'};
  let page='home', transitionId=0;
  function showPage(next, animate=true){
    next=pages[next] ? next : 'home';
    const previous=page, outgoing=$cfg(pages[previous]), incoming=$cfg(pages[next]);
    if (previous === next && !incoming.hidden) { refresh(); return; }
    const seq=++transitionId;
    const backwards=(previous==='fontes' && next==='aparencia') || next==='home';
    document.querySelectorAll('.cfg-page').forEach(el => {
      el.classList.remove('cfg-enter','cfg-enter-back','cfg-leave','cfg-leave-back');
      if (el!==outgoing && el!==incoming) el.hidden=true;
    });
    const viewport=$cfg('cfgPages');
    if (viewport) viewport.scrollTop=0;
    page=next;
    incoming.hidden=false;
    safeText($cfg('cfgTitle'),titles[page]);
    if (animate && !screen.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && outgoing!==incoming){
      outgoing.classList.add(backwards?'cfg-leave-back':'cfg-leave');
      incoming.classList.add(backwards?'cfg-enter-back':'cfg-enter');
      setTimeout(() => {
        if (seq!==transitionId) return;
        outgoing.hidden=true;
        outgoing.classList.remove('cfg-leave','cfg-leave-back');
        incoming.classList.remove('cfg-enter','cfg-enter-back');
      },410);
    } else if(outgoing!==incoming) outgoing.hidden=true;
    refresh();
  }
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
    safeText($cfg('cfgFontSummary'), (FONTES.find(f => (f.fam || f.nome) === fam) || FONTES[0]).nome);
    const lang = (typeof blLang === 'function' ? blLang() : 'pt');
    safeText($cfg('cfgLangSummary'), ({pt:'Português',en:'English',es:'Español'})[lang] || 'Português');
    document.querySelectorAll('#cfgIdiomas [data-cfg-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cfgLang === lang)));
    document.querySelectorAll('#cfgTemas [data-cfg-tema]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cfgTema === (document.documentElement.classList.contains('claro') ? 'claro' : 'escuro'))));
    document.querySelectorAll('#cfgFontes [data-cfg-fonte]').forEach(b => {
      const f = FONTES.find(x => x.id === b.dataset.cfgFonte);
      b.setAttribute('aria-pressed', String(!!f && (fam ? (f.fam || f.nome) === fam : f.id === 'padrao')));
    });
  }
  function open(push=true){
    if (push && location.pathname !== '/configuracoes') history.pushState({configuracoes:true}, '', '/configuracoes');
    screen.hidden = false; document.body.classList.add('cfg-open'); $cfg('cfgOpen').classList.add('on'); showPage('home',false);
  }
  function close(){
    ++transitionId; screen.hidden = true; document.body.classList.remove('cfg-open'); $cfg('cfgOpen').classList.remove('on');
    document.querySelectorAll('.cfg-page').forEach(el => { el.hidden=el.id!==pages[page]; el.classList.remove('cfg-enter','cfg-enter-back','cfg-leave','cfg-leave-back'); });
  }
  function back(){
    if (page === 'fontes') { showPage('aparencia'); return; }
    if (page !== 'home') { showPage('home'); return; }
    if (location.pathname === '/configuracoes' && history.state && history.state.configuracoes) history.back();
    else { history.replaceState({aba:'meus'}, '', '/conta'); close(); if (typeof trocarAba === 'function') trocarAba('meus',true); }
  }
  $cfg('cfgBack').addEventListener('click', back);
  $cfg('cfgHome').addEventListener('click', e => { const b=e.target.closest('[data-cfg-page]'); if (b) showPage(b.dataset.cfgPage); });
  $cfg('cfgFontOpen').addEventListener('click', () => showPage('fontes'));
  $cfg('cfgIdiomas').addEventListener('click', e => { const b=e.target.closest('[data-cfg-lang]'); if (!b) return; const original=document.querySelector('#langMenu [data-l="'+b.dataset.cfgLang+'"]'); if (original) original.click(); refresh(); });
  $cfg('cfgOpen').addEventListener('click', () => open());
  document.querySelectorAll('#bnav button:not(#cfgOpen)').forEach(b => b.addEventListener('click', () => { if (!screen.hidden) close(); }));
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
    const check=document.createElement('i'); check.className='fa-solid fa-check cfg-check'; b.append(title,sample,check); fonts.append(b);
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
