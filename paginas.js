/* Cada seção ocupa seu próprio contêiner sem duplicar nós ou listeners. */
(() => {
  'use strict';
  const host=document.querySelector('main');
  if(!host)return;
  const definitions={
    mural:['.hero','#ranking','.toolbar','#perfilBox','#destaques','#muralGrid','#estado','#maisBtn'],
    usuarios:['#usuarios'],
    chat:['#chatSec'],
    publicar:['#pubTela'],
    meus:['#avisoConta','#meuPerfil','#painelMeus']
  };
  const screens={};
  for(const [key,selectors] of Object.entries(definitions)){
    const section=document.createElement('section');
    section.className='bl-page';
    section.dataset.page=key;
    section.setAttribute('aria-label',({mural:'Mural',usuarios:'Usuários',chat:'Mensagens',publicar:'Publicar',meus:'Conta'})[key]);
    for(const selector of selectors){
      const node=host.querySelector(selector);
      if(node)section.appendChild(node);
    }
    host.appendChild(section);
    screens[key]=section;
  }
  const settings=document.getElementById('cfgScreen');
  if(settings){host.appendChild(settings);settings.classList.add('bl-page');settings.dataset.page='configuracoes';screens.configuracoes=settings;}
  let active='mural';
  function show(key){
    if(!screens[key])return;
    active=key;
    for(const [name,node] of Object.entries(screens)){
      node.hidden=name!==key;
      node.setAttribute('aria-hidden',String(name!==key));
    }
    host.dataset.activePage=key;
  }
  show('mural');
  window.BLPages={show,get active(){return active;},screens};
})();
