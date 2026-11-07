/* Configurações: reutiliza o sistema de aparência existente. */
(() => {
  'use strict';
  const screen = document.getElementById('cfgScreen');
  if (!screen) return;
  const $cfg = id => document.getElementById(id);
  const safeText = (el, value) => { el.textContent = String(value || ''); };
  const pages = {home:'cfgHome',aparencia:'cfgAppearance',chats:'cfgChatSettings',fontes:'cfgFontPage',idioma:'cfgLanguage'};
  const titles = {home:'Configurações',aparencia:'Aparência',chats:'Configurações de Chats',fontes:'Fontes',idioma:'Idioma'};
  const chatPrefKey='fc_chat_prefs';
  const wallpaperImages={
    atual:null,
    foto:'url("/img/chat-fundo.jpg")',
    noite:'radial-gradient(ellipse at 20% 15%,#454656 0,transparent 48%),linear-gradient(145deg,#171820,#30313b)',
    lavanda:'radial-gradient(ellipse at 18% 12%,#b99be7 0,transparent 52%),linear-gradient(145deg,#dcd1ef,#a99ac5)',
    aurora:'radial-gradient(ellipse at 18% 12%,#80d4ca 0,transparent 46%),radial-gradient(ellipse at 82% 85%,#9c79cd 0,transparent 52%),linear-gradient(145deg,#172b39,#39465a)'
  };
  const bubblePalettes={
    faccliky:{dark:['#473a83','#25273b'],light:['#8b7fc2','#b5b9d8']},
    lavanda:{dark:['#7547a3','#30243c'],light:['#d8c5f5','#eee8f6']},
    oceano:{dark:['#156f97','#203544'],light:['#acdced','#e0f0f5']},
    rosa:{dark:['#923f72','#382433'],light:['#f3c4dd','#f4e8ee']},
    verde:{dark:['#267652','#243a30'],light:['#b8e2ca','#e5f0e8']}
  };
  const nameColors=['default','lilas','azul','verde','rosa'];
  const namePalette={lilas:{dark:'#c9a9ff',light:'#50357d'},azul:{dark:'#62d6f1',light:'#006586'},verde:{dark:'#69d4a2',light:'#186941'},rosa:{dark:'#ff9cc5',light:'#9b355f'}};
  const readChatPrefs=()=>{
    try{const p=JSON.parse(localStorage.getItem(chatPrefKey)||'{}');return {
      fontSize:Math.max(12,Math.min(22,Number(p.fontSize)||14)),radius:Math.max(8,Math.min(28,Number(p.radius)||15)),
      wallpaper:Object.prototype.hasOwnProperty.call(wallpaperImages,p.wallpaper)?p.wallpaper:'atual',nameColor:nameColors.includes(p.nameColor)?p.nameColor:'default',
      bubbleTheme:Object.prototype.hasOwnProperty.call(bubblePalettes,p.bubbleTheme)||p.bubbleTheme==='custom'?p.bubbleTheme:'faccliky',
      bubbleMine:/^#[0-9a-f]{6}$/i.test(p.bubbleMine||'')?p.bubbleMine:'#5b4fe0',
      bubbleThem:/^#[0-9a-f]{6}$/i.test(p.bubbleThem||'')?p.bubbleThem:'#25273b',
      lines:p.lines===3?3:2,animations:p.animations!==false,enterSend:p.enterSend!==false,swipeReply:p.swipeReply!==false,autoTheme:p.autoTheme===true||localStorage.getItem('bl_tema_auto')==='1'
    }}catch(_){return {fontSize:14,radius:15,wallpaper:'atual',nameColor:'default',bubbleTheme:'faccliky',bubbleMine:'#5b4fe0',bubbleThem:'#25273b',lines:2,animations:true,enterSend:true,swipeReply:true,autoTheme:false}}
  };
  const chatPrefs=readChatPrefs();
  function saveChatPrefs(){try{localStorage.setItem(chatPrefKey,JSON.stringify(chatPrefs))}catch(_){}}
  function colorInk(hex){
    const s=hex.replace('#',''),rgb=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2));
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.42?'#171522':'#ffffff';
  }
  function applyChatPrefs(){
    const root=document.documentElement,light=root.classList.contains('claro');
    root.style.setProperty('--chat-message-size',chatPrefs.fontSize+'px');
    root.style.setProperty('--chat-bubble-radius',chatPrefs.radius+'px');
    if(chatPrefs.wallpaper==='atual'){
      delete root.dataset.chatWallpaper;root.style.removeProperty('--chat-wallpaper-image');
    }else{
      root.dataset.chatWallpaper=chatPrefs.wallpaper;
      root.style.setProperty('--chat-wallpaper-image',wallpaperImages[chatPrefs.wallpaper]);
    }
    root.dataset.chatListLines=String(chatPrefs.lines);
    root.dataset.chatAnimations=chatPrefs.animations?'on':'off';
    root.dataset.chatSwipeReply=chatPrefs.swipeReply?'on':'off';
    if(chatPrefs.nameColor==='default'){delete root.dataset.chatNameColor;root.style.removeProperty('--chat-name-color')}
    else{root.dataset.chatNameColor='custom';root.style.setProperty('--chat-name-color',namePalette[chatPrefs.nameColor][light?'light':'dark'])}
    root.dataset.chatBubbles=chatPrefs.bubbleTheme;
    if(chatPrefs.bubbleTheme==='faccliky'){
      ['--chat-bubble-out','--chat-bubble-in','--chat-bubble-out-ink','--chat-bubble-in-ink'].forEach(k=>root.style.removeProperty(k));
    }else{
      const pair=chatPrefs.bubbleTheme==='custom'?[chatPrefs.bubbleMine,chatPrefs.bubbleThem]:bubblePalettes[chatPrefs.bubbleTheme][light?'light':'dark'];
      root.style.setProperty('--chat-bubble-out',pair[0]);root.style.setProperty('--chat-bubble-in',pair[1]);
      root.style.setProperty('--chat-bubble-out-ink',colorInk(pair[0]));root.style.setProperty('--chat-bubble-in-ink',colorInk(pair[1]));
    }
    refreshChatSettings();
  }
  function refreshChatSettings(){
    const set=(id,value)=>{const el=$cfg(id);if(el)el.value=String(value)};
    set('chatFontSize',chatPrefs.fontSize);set('chatRadius',chatPrefs.radius);
    safeText($cfg('chatFontSizeValue'),chatPrefs.fontSize);safeText($cfg('chatRadiusValue'),chatPrefs.radius);
    const light=document.documentElement.classList.contains('claro'),palette=bubblePalettes[chatPrefs.bubbleTheme==='custom'?'faccliky':chatPrefs.bubbleTheme][light?'light':'dark'];
    set('chatBubbleMine',chatPrefs.bubbleTheme==='custom'?chatPrefs.bubbleMine:palette[0]);
    set('chatBubbleThem',chatPrefs.bubbleTheme==='custom'?chatPrefs.bubbleThem:palette[1]);
    const check=(id,value)=>{const el=$cfg(id);if(el)el.checked=!!value};
    check('chatAnimations',chatPrefs.animations);check('chatEnterSend',chatPrefs.enterSend);check('chatSwipeReply',chatPrefs.swipeReply);check('chatAutoTheme',chatPrefs.autoTheme);
    document.querySelectorAll('#cfgChatSettings [data-chat-wallpaper]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chatWallpaper===chatPrefs.wallpaper)));
    document.querySelectorAll('#cfgChatSettings [data-chat-name]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chatName===chatPrefs.nameColor)));
    document.querySelectorAll('#cfgChatSettings [data-chat-bubble-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chatBubbleTheme===chatPrefs.bubbleTheme)));
    document.querySelectorAll('#cfgChatSettings [data-chat-lines]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.chatLines)===chatPrefs.lines)));
  }
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
    refreshChatSettings();
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
    update();return;   // sem deslize: a captura de tela inteira travava em aparelhos mais fracos
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
  function saveAndApplyChatPrefs(){saveChatPrefs();applyChatPrefs()}
  const chatPage=$cfg('cfgChatSettings');
  chatPage.addEventListener('input',e=>{
    if(e.target.id==='chatFontSize'){chatPrefs.fontSize=Number(e.target.value);saveAndApplyChatPrefs()}
    if(e.target.id==='chatRadius'){chatPrefs.radius=Number(e.target.value);saveAndApplyChatPrefs()}
  });
  chatPage.addEventListener('click',e=>{
    const wallpaper=e.target.closest('[data-chat-wallpaper]');
    const name=e.target.closest('[data-chat-name]');
    const theme=e.target.closest('[data-chat-bubble-theme]');
    const lines=e.target.closest('[data-chat-lines]');
    if(wallpaper)chatPrefs.wallpaper=wallpaper.dataset.chatWallpaper;
    if(name)chatPrefs.nameColor=name.dataset.chatName;
    if(theme)chatPrefs.bubbleTheme=theme.dataset.chatBubbleTheme;
    if(lines)chatPrefs.lines=Number(lines.dataset.chatLines)===3?3:2;
    if(wallpaper||name||theme||lines)saveAndApplyChatPrefs();
  });
  ['chatAnimations','chatEnterSend','chatSwipeReply'].forEach(id=>$cfg(id).addEventListener('change',e=>{
    chatPrefs[id==='chatAnimations'?'animations':id==='chatEnterSend'?'enterSend':'swipeReply']=e.target.checked;saveAndApplyChatPrefs();
  }));
  function syncDeviceTheme(){
    if(!chatPrefs.autoTheme)return;
    window.__blTemaAutomatico=true;
    aplicarTema(window.matchMedia('(prefers-color-scheme: light)').matches?'claro':'escuro');
    window.__blTemaAutomatico=false;
  }
  $cfg('chatAutoTheme').addEventListener('change',e=>{
    chatPrefs.autoTheme=e.target.checked;
    try{chatPrefs.autoTheme?localStorage.setItem('bl_tema_auto','1'):localStorage.removeItem('bl_tema_auto')}catch(_){}
    saveChatPrefs();
    if(chatPrefs.autoTheme)syncDeviceTheme();
    else refreshChatSettings();
  });
  const systemTheme=window.matchMedia('(prefers-color-scheme: light)');
  if(systemTheme.addEventListener)systemTheme.addEventListener('change',syncDeviceTheme);
  else if(systemTheme.addListener)systemTheme.addListener(syncDeviceTheme);
  document.addEventListener('bl:tema-atualizado',()=>{
    if(!window.__blTemaAutomatico&&chatPrefs.autoTheme){chatPrefs.autoTheme=false;try{localStorage.removeItem('bl_tema_auto')}catch(_){};saveChatPrefs()}
    applyChatPrefs();
  });
  ['chatBubbleMine','chatBubbleThem'].forEach(id=>$cfg(id).addEventListener('input',e=>{
    if(chatPrefs.bubbleTheme!=='custom'){
      chatPrefs.bubbleMine=$cfg('chatBubbleMine').value;chatPrefs.bubbleThem=$cfg('chatBubbleThem').value;
    }
    chatPrefs.bubbleTheme='custom';chatPrefs[id==='chatBubbleMine'?'bubbleMine':'bubbleThem']=e.target.value;saveAndApplyChatPrefs();
  }));
  const composer=$cfg('chTexto');
  function resizeComposer(){
    if(!composer)return;
    composer.style.height='auto';
    const max=120,base=window.matchMedia('(min-width: 900px)').matches?52:44,height=Math.max(base,Math.min(composer.scrollHeight,max));composer.style.height=height+'px';
    document.documentElement.style.setProperty('--chat-composer-extra',Math.max(0,height-44)+'px');
    composer.style.overflowY=composer.scrollHeight>max?'auto':'hidden';
  }
  if(composer){
    composer.addEventListener('keydown',e=>{
      if(e.key!=='Enter'||e.shiftKey||e.isComposing||e.keyCode===229||!chatPrefs.enterSend)return;
      e.preventDefault();
      if(composer.form.requestSubmit)composer.form.requestSubmit();
      else composer.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      requestAnimationFrame(resizeComposer);
    });
    composer.addEventListener('input',resizeComposer);
    $cfg('chForm').addEventListener('submit',()=>requestAnimationFrame(resizeComposer));
    resizeComposer();
  }
  if(chatPrefs.autoTheme){
    try{localStorage.setItem('bl_tema_auto','1')}catch(_){}
    syncDeviceTheme();
  }
  applyChatPrefs();
  window.addEventListener('popstate', () => {
    if (location.pathname === '/configuracoes') open(false);
    else close();
  });
  if (location.pathname === '/configuracoes') open(false);
})();
