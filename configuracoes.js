/* Configurações: reutiliza o sistema de aparência existente. */
(() => {
  'use strict';
  const screen = document.getElementById('cfgScreen');
  if (!screen) return;
  const $cfg = id => document.getElementById(id);
  const safeText = (el, value) => { el.textContent = String(value || ''); };
  const pages = {home:'cfgHome',aparencia:'cfgAppearance',fontes:'cfgFontPage',idioma:'cfgLanguage'};
  const titles = {home:'Configurações',aparencia:'Aparência',fontes:'Fontes',idioma:'Idioma'};
  let page='home';
  const motionOff=() => true; // Subpáginas de Ajustes sem animações.
  function stopAnimations(){
    Object.values(pages).forEach(id=>{
      const el=$cfg(id);
      el.getAnimations().forEach(a=>a.cancel());
      el.style.removeProperty('position');
      el.style.removeProperty('inset');
      el.style.removeProperty('width');
      el.style.removeProperty('z-index');
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
    });
    $cfg('cfgPages').style.removeProperty('min-height');
  }
  function showPage(next, animate=true){
    next=pages[next] ? next : 'home';
    const previous=page;
    stopAnimations();
    page=next;
    // A página anterior é removida antes da animação: nenhuma sobra fica visível.
    Object.entries(pages).forEach(([key,id])=>{
      const el=$cfg(id);
      el.hidden=key!==next;
      el.setAttribute('aria-hidden',String(key!==next));
    });
    safeText($cfg('cfgTitle'),titles[next]);
    $cfg('cfgBack').hidden=next==='home';
    $cfg('cfgHeader').hidden=next==='home';
    const incoming=$cfg(pages[next]);
    if(animate && previous!==next && !screen.hidden && !motionOff()){
      const backwards=next==='home'||(previous==='fontes'&&next==='aparencia');
      incoming.animate([
        {transform:'translate3d('+(backwards?'-24px':'24px')+',0,0)'},
        {transform:'translate3d(0,0,0)'}
      ],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
    }
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
  window.addEventListener('bl:perfil-atualizado',refresh);
  // Ajustes é uma tela real do fluxo do documento, não uma camada fixa.
  function switchScreen(show, animate=true){
    const update=()=>{
      if(window.BLPages)window.BLPages.show(show?'configuracoes':(typeof S!=='undefined'?S.aba:'mural'));
      else screen.hidden=!show;
      document.body.classList.toggle('cfg-open',show);
      $cfg('cfgOpen').classList.toggle('on',show);
      if(show)showPage('home',false);
      window.scrollTo(0,0);
    };
    const navOff=window.matchMedia('(prefers-reduced-motion: reduce), (min-width: 900px)').matches;
    if(!animate || navOff || !document.startViewTransition || document.visibilityState==='hidden'){update();return;}
    const root=document.documentElement;
    // Ajustes fica entre Publicar e Conta no menu: a direção segue a posição da aba atual.
    const ordem=['mural','usuarios','chat','publicar','ajustes','meus'];
    const atual=ordem.indexOf(typeof S!=='undefined'?S.aba:'mural');
    root.dataset.navDirection=show?(atual<4?'forward':'back'):'back';
    try{
      const transition=document.startViewTransition(update);
      transition.finished.finally(()=>{delete root.dataset.navDirection;}).catch(()=>{});
    }catch(e){delete root.dataset.navDirection;update();}
  }
  function open(push=true){
    if(push && location.pathname!=='/configuracoes')history.pushState({configuracoes:true},'','/configuracoes');
    if(!screen.hidden){showPage('home',false);return;}
    switchScreen(true);
  }
  function close(animate=true){
    stopAnimations();
    if(screen.hidden)return;
    switchScreen(false,animate);
  }
  function back(){
    if(page==='fontes'){showPage('aparencia');return;}
    if(page!=='home'){showPage('home');return;}
    if(location.pathname==='/configuracoes' && history.state && history.state.configuracoes)history.back();
    else{history.replaceState({aba:'meus'},'','/conta');close();if(typeof trocarAba==='function')trocarAba('meus',true);}
  }
  window.BLCloseSettings=()=>close(false);
  $cfg('cfgBack').addEventListener('click', back);
  $cfg('cfgHome').addEventListener('click', e => { const b=e.target.closest('[data-cfg-page]'); if (b) showPage(b.dataset.cfgPage); });
  $cfg('cfgFontOpen').addEventListener('click', () => showPage('fontes'));
  $cfg('cfgIdiomas').addEventListener('click', e => { const b=e.target.closest('[data-cfg-lang]'); if (!b) return; const original=document.querySelector('#langMenu [data-l="'+b.dataset.cfgLang+'"]'); if (original) original.click(); refresh(); });
  $cfg('cfgOpen').addEventListener('click', () => open());
  document.querySelectorAll('#bnav button:not(#cfgOpen)').forEach(b => b.addEventListener('click', () => { if (!screen.hidden) close(false); }));
  $cfg('cfgTemas').addEventListener('click', e => {
    const b = e.target.closest('[data-cfg-tema]'); if (!b) return;
    aplicarTema(b.dataset.cfgTema); refresh();
  });
  const fonts = $cfg('cfgFontes');
  FONTES.forEach(f => {
    const b = document.createElement('button'); b.type='button'; b.dataset.cfgFonte=f.id;
    const title=document.createElement('span'); title.textContent=f.nome;
    const sample=document.createElement('small'); sample.textContent='Aa Bb Cc 123';
    // Apenas a amostra demonstra a fonte; nomes e dimensões da lista ficam estáveis.
    if (f.id !== 'padrao') sample.style.fontFamily=(f.fam || f.nome)+',system-ui,sans-serif';
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
