/* BLACKE LAVEX — idiomas (PT padrão, EN, ES).
   Traduz o que aparece na tela comparando o texto em português com este dicionário;
   textos de usuários (nomes, legendas) nunca são traduzidos. */
(() => {
  const D = [ // [pt, en, es]
    ['carregando mural','loading wall','cargando muro'],
    ['Comunidade no Telegram','Telegram community','Comunidad en Telegram'],
    ['Comunidade','Community','Comunidad'],
    ['Publicar link','Publish link','Publicar enlace'],
    ['Mural de sites e marcas','Wall of sites and brands','Muro de sitios y marcas'],
    ['Publique seu link com capa e legenda. Sem conta, sem cadastro.','Publish your link with a cover and caption. No account, no sign-up.','Publica tu enlace con portada y descripción. Sin cuenta, sin registro.'],
    ['Buscar por nome, legenda ou @perfil','Search by name, caption or @profile','Buscar por nombre, descripción o @perfil'],
    ['Mural','Wall','Muro'],
    ['Destaques','Featured','Destacados'],
    ['Meus sites','My sites','Mis sitios'],
    ['Ordenar','Sort','Ordenar'],
    ['Mais recentes','Newest','Más recientes'],
    ['Mais acessados','Most visited','Más visitados'],
    ['Compartilhar perfil','Share profile','Compartir perfil'],
    ['Compartilhar','Share','Compartir'],
    ['Limpar','Clear','Limpiar'],
    ['Em destaque','Featured','Destacados'],
    ['Novos','New','Nuevos'],
    ['sites','sites','sitios'],
    ['acessos','visits','visitas'],
    ['vagas livres','free slots','cupos libres'],
    ['Você ainda não tem um @','You don\'t have an @ yet','Aún no tienes un @'],
    ['Reservar @','Reserve @','Reservar @'],
    ['Desempenho','Performance','Rendimiento'],
    ['Acessos por dia nos últimos 14 dias','Visits per day over the last 14 days','Visitas por día en los últimos 14 días'],
    ['Minha chave','My key','Mi clave'],
    ['Excluir todos','Delete all','Eliminar todos'],
    ['Seus sites são ligados a este navegador por uma chave secreta, não a uma conta. Guarde a chave para gerenciá-los em outro aparelho.','Your sites are tied to this browser by a secret key, not an account. Save the key to manage them on another device.','Tus sitios están vinculados a este navegador mediante una clave secreta, no una cuenta. Guarda la clave para gestionarlos en otro dispositivo.'],
    ['Carregar mais','Load more','Cargar más'],
    ['BLACKE LAVEX · rede privada','BLACKE LAVEX · private network','BLACKE LAVEX · red privada'],
    ['·','·','·'],
    ['Publicar no mural','Publish to the wall','Publicar en el muro'],
    ['Editar site','Edit site','Editar sitio'],
    ['Sua capa, seu link e uma legenda. Sem cadastro.','Your cover, your link and a caption. No sign-up.','Tu portada, tu enlace y una descripción. Sin registro.'],
    ['Fechar','Close','Cerrar'],
    ['Capa','Cover','Portada'],
    ['Toque para escolher a imagem','Tap to choose an image','Toca para elegir la imagen'],
    ['Reduzida automaticamente · você ajusta o enquadramento','Resized automatically · you adjust the framing','Reducida automáticamente · tú ajustas el encuadre'],
    ['Trocar imagem','Change image','Cambiar imagen'],
    ['Ao publicar, você concorda com os','By publishing, you agree to the','Al publicar, aceptas los'],
    ['Termos','Terms','Términos'],
    ['e a','and the','y la'],
    ['Política de Privacidade','Privacy Policy','Política de Privacidad'],
    ['Privacidade','Privacy','Privacidad'],
    ['BLACKE LAVEX · rede privada ·','BLACKE LAVEX · private network ·','BLACKE LAVEX · red privada ·'],
    ['você já tem uma troca de @ em análise','you already have an @ change under review','ya tienes un cambio de @ en revisión'],
    ['(suspenso)','(suspended)','(suspendido)'],
    ['Verificado','Verified','Verificado'],
    ['Editar perfil','Edit profile','Editar perfil'],
    ['Trocar @','Change @','Cambiar @'],
    ['Salvar perfil','Save profile','Guardar perfil'],
    ['Salvando...','Saving...','Guardando...'],
    ['Perfil atualizado','Profile updated','Perfil actualizado'],
    ['Seu perfil','Your profile','Tu perfil'],
    ['Reserve um @ para ter um perfil público com foto, bio e botões de contato.','Reserve an @ to get a public profile with photo, bio and contact buttons.','Reserva un @ para tener un perfil público con foto, bio y botones de contacto.'],
    ['Adicione uma bio em "Editar perfil".','Add a bio in "Edit profile".','Agrega una bio en "Editar perfil".'],
    ['Perfil suspenso','Profile suspended','Perfil suspendido'],
    ['salvo','save','guardado'],['salvos','saves','guardados'],
    ['vagas livres','free slots','espacios libres'],
    ['Grupo','Group','Grupo'],
    ['Trocar foto','Change photo','Cambiar foto'],
    ['Remover','Remove','Quitar'],
    ['Bio','Bio','Bio'],
    ['Botões de contato','Contact buttons','Botones de contacto'],
    ['Nenhum','None','Ninguno'],
    ['Conte em poucas palavras o que você faz','Tell in a few words what you do','Cuenta en pocas palabras lo que haces'],
    ['@usuario, número ou link','@user, number or link','@usuario, número o enlace'],
    ['Telegram: @usuario ou link de grupo (t.me/...). WhatsApp: número com DDD ou link de grupo. Instagram: @usuario.','Telegram: @user or group link (t.me/...). WhatsApp: number with country/area code or group link. Instagram: @user.','Telegram: @usuario o enlace de grupo (t.me/...). WhatsApp: número con código de área o enlace de grupo. Instagram: @usuario.'],
    ['Escolha uma imagem.','Choose an image.','Elige una imagen.'],
    ['Não foi possível ler essa imagem.','Could not read this image.','No se pudo leer esta imagen.'],
    ['Telegram inválido. Use @usuario ou um link t.me/...','Invalid Telegram. Use @user or a t.me/... link','Telegram inválido. Usa @usuario o un enlace t.me/...'],
    ['WhatsApp inválido. Use o número com DDD ou um link de grupo.','Invalid WhatsApp. Use the number with area code or a group link.','WhatsApp inválido. Usa el número con código de área o un enlace de grupo.'],
    ['Instagram inválido. Use @usuario.','Invalid Instagram. Use @user.','Instagram inválido. Usa @usuario.'],
    ['a bio passa de 150 caracteres','the bio is over 150 characters','la bio supera los 150 caracteres'],
    ['foto inválida','invalid photo','foto inválida'],
    ['foto muito grande','photo too large','foto demasiado grande'],
    ['reserve um @ antes de editar o perfil','reserve an @ before editing your profile','reserva un @ antes de editar tu perfil'],
    ['contato inválido: use um link do Telegram, WhatsApp ou Instagram','invalid contact: use a Telegram, WhatsApp or Instagram link','contacto inválido: usa un enlace de Telegram, WhatsApp o Instagram'],
    ['no máximo 2 contatos','at most 2 contacts','máximo 2 contactos'],
    ['visualização','view','visualización'],['visualizações','views','visualizaciones'],
    ['Minha chave','My key','Mi clave'],
    ['Excluir todos os meus sites','Delete all my sites','Eliminar todos mis sitios'],
    ['Prévia da capa','Cover preview','Vista previa de la portada'],
    ['Arraste para ajustar','Drag to adjust','Arrastra para ajustar'],
    ['Centralizar','Center','Centrar'],
    ['Seu site','Your site','Tu sitio'],
    ['Nome da marca ou site','Brand or site name','Nombre de la marca o sitio'],
    ['Ex: Anonymous BR','e.g. Anonymous BR','Ej: Anonymous BR'],
    ['Link','Link','Enlace'],
    ['Categoria','Category','Categoría'],
    ['Legenda','Caption','Descripción'],
    ['Em uma ou duas frases, o que as pessoas encontram aí?','In one or two sentences, what will people find there?','En una o dos frases, ¿qué encontrará la gente ahí?'],
    ['Publicar','Publish','Publicar'],
    ['Salvar alterações','Save changes','Guardar cambios'],
    ['Cancelar','Cancel','Cancelar'],
    ['Confirmar','Confirm','Confirmar'],
    ['É ela que prova que os sites são seus. Quem tiver essa chave consegue editar e excluir seus sites, então não compartilhe. Se limpar os dados do navegador, você perde o acesso, a menos que tenha guardado a chave.','It\'s what proves the sites are yours. Anyone with this key can edit and delete your sites, so don\'t share it. If you clear your browser data you lose access, unless you saved the key.','Es lo que prueba que los sitios son tuyos. Quien tenga esta clave puede editar y eliminar tus sitios, así que no la compartas. Si borras los datos del navegador pierdes el acceso, a menos que hayas guardado la clave.'],
    ['Chave deste navegador','This browser\'s key','Clave de este navegador'],
    ['Mostrar chave','Show key','Mostrar clave'],
    ['Copiar','Copy','Copiar'],
    ['Já tem uma chave? Cole aqui para recuperar seus sites','Already have a key? Paste it here to recover your sites','¿Ya tienes una clave? Pégala aquí para recuperar tus sitios'],
    ['64 caracteres','64 characters','64 caracteres'],
    ['Usar','Use','Usar'],
    ['Seu @','Your @','Tu @'],
    ['O @ é só seu: ninguém mais pode usar esse nome e ele aparece nos seus sites. Quem busca por @seunome vê todos os seus sites juntos.','The @ is yours alone: nobody else can use that name and it shows on your sites. Anyone searching @yourname sees all your sites together.','El @ es solo tuyo: nadie más puede usar ese nombre y aparece en tus sitios. Quien busque @tunombre ve todos tus sitios juntos.'],
    ['Escolha o nome','Choose a name','Elige el nombre'],
    ['seunome','yourname','tunombre'],
    ['3 a 20 caracteres: letras, números ou _','3 to 20 characters: letters, numbers or _','De 3 a 20 caracteres: letras, números o _'],
    ['Só quem já tem 1 site publicado pode reservar','Only people with 1 published site can reserve one','Solo quien ya tiene 1 sitio publicado puede reservar'],
    ['Dá para trocar a cada 30 dias','You can change it every 30 days','Se puede cambiar cada 30 días'],
    ['Sem nenhum site por 90 dias, o @ volta a ficar livre','With no sites for 90 days, the @ becomes free again','Sin ningún sitio durante 90 días, el @ vuelve a quedar libre'],
    ['Perdeu a chave, perdeu o @ (copie a chave em "Minha chave")','Lose the key, lose the @ (copy the key in "My key")','Si pierdes la clave, pierdes el @ (copia la clave en "Mi clave")'],
    ['Liberar meu @','Release my @','Liberar mi @'],
    ['Denunciar este site','Report this site','Denunciar este sitio'],
    ['Motivo','Reason','Motivo'],
    ['Golpe ou link perigoso','Scam or dangerous link','Estafa o enlace peligroso'],
    ['Conteúdo impróprio','Inappropriate content','Contenido inapropiado'],
    ['Link quebrado','Broken link','Enlace roto'],
    ['Outro','Other','Otro'],
    ['Detalhes (opcional)','Details (optional)','Detalles (opcional)'],
    ['O que há de errado?','What\'s wrong?','¿Qué está mal?'],
    ['Enviar denúncia','Send report','Enviar denuncia'],
    ['Voltar ao mural','Back to the wall','Volver al muro'],
    ['Sobre este site','About this site','Sobre este sitio'],
    ['Veja também','See also','Ver también'],
    ['Navegação','Navigation','Navegación'],
    ['Acessar site','Visit site','Visitar sitio'],
    ['O site abre em uma nova aba. O BLACKE LAVEX não controla o conteúdo dos links publicados.','The site opens in a new tab. BLACKE LAVEX does not control the content of published links.','El sitio se abre en una pestaña nueva. BLACKE LAVEX no controla el contenido de los enlaces publicados.'],
    ['Este site ainda não tem legenda.','This site has no caption yet.','Este sitio aún no tiene descripción.'],
    ['anônimo','anonymous','anónimo'],
    ['Ver detalhes','View details','Ver detalles'],
    ['Copiar link','Copy link','Copiar enlace'],
    ['Salvar','Save','Guardar'],
    ['Remover dos salvos','Remove from saved','Quitar de guardados'],
    ['Link no BLACKE','BLACKE link','Enlace en BLACKE'],
    ['Mais opções','More options','Más opciones'],
    ['Editar','Edit','Editar'],
    ['Excluir','Delete','Eliminar'],
    ['Denunciar','Report','Denunciar'],
    ['Todas','All','Todas'],
    ['♥ Salvos','♥ Saved','♥ Guardados'],
    ['Mídia','Media','Medios'],
    ['Ferramentas','Tools','Herramientas'],
    ['Loja','Store','Tienda'],
    ['Jogos','Games','Juegos'],
    ['Outros','Other','Otros'],
    ['Mais clicado','Most clicked','Más clicado'],
    ['em 14 dias','in 14 days','en 14 días'],
    ['Ainda não há sites aqui.','No sites here yet.','Aún no hay sitios aquí.'],
    ['O gráfico conta os acessos de hoje em diante. Os acessos anteriores aparecem só no total de cada site.','The chart counts visits from today onwards. Earlier visits only appear in each site\'s total.','El gráfico cuenta las visitas de hoy en adelante. Las anteriores solo aparecen en el total de cada sitio.'],
    ['hoje','today','hoy'],
    ['Data não informada','Date not available','Fecha no disponible'],
    ['Mais opções','More options','Más opciones'],
    // avisos, erros e estados
    ['Salvo no seu aparelho','Saved on your device','Guardado en tu dispositivo'],
    ['Removido dos salvos','Removed from saved','Quitado de guardados'],
    ['Link copiado','Link copied','Enlace copiado'],
    ['A imagem passa de 15 MB. Escolha uma menor.','The image is over 15 MB. Choose a smaller one.','La imagen supera los 15 MB. Elige una más pequeña.'],
    ['Não foi possível ler essa imagem. Tente outra.','Could not read that image. Try another.','No se pudo leer esa imagen. Prueba con otra.'],
    ['Escolha uma imagem de capa.','Choose a cover image.','Elige una imagen de portada.'],
    ['Preencha o nome e o link.','Fill in the name and the link.','Completa el nombre y el enlace.'],
    ['O link precisa começar com http:// ou https://','The link must start with http:// or https://','El enlace debe empezar con http:// o https://'],
    ['Esse site não pertence a esta chave.','This site doesn\'t belong to this key.','Este sitio no pertenece a esta clave.'],
    ['Alterações salvas','Changes saved','Cambios guardados'],
    ['Publicado no mural','Published to the wall','Publicado en el muro'],
    ['erro desconhecido','unknown error','error desconocido'],
    ['O banco ainda não foi atualizado. Rode o arquivo supabase.sql no Supabase.','The database has not been updated yet. Run supabase.sql in Supabase.','La base de datos aún no se actualizó. Ejecuta supabase.sql en Supabase.'],
    ['Não foi possível carregar. Atualize a página em instantes.','Could not load. Refresh the page in a moment.','No se pudo cargar. Actualiza la página en unos instantes.'],
    ['Você ainda não salvou nenhum site. Toque no ♥ de um card para guardar aqui.','You haven\'t saved any site yet. Tap the ♥ on a card to keep it here.','Aún no guardaste ningún sitio. Toca el ♥ de una tarjeta para guardarlo aquí.'],
    ['Nada encontrado. Tente outra busca ou categoria.','Nothing found. Try another search or category.','No se encontró nada. Prueba otra búsqueda o categoría.'],
    ['O mural está vazio. Seja o primeiro a publicar.','The wall is empty. Be the first to publish.','El muro está vacío. Sé el primero en publicar.'],
    ['Você ainda não publicou nenhum site neste navegador.','You haven\'t published any site in this browser yet.','Aún no publicaste ningún sitio en este navegador.'],
    ['Seu navegador bloqueou o recurso de chave. Abra o site em https.','Your browser blocked the key feature. Open the site over https.','Tu navegador bloqueó la función de clave. Abre el sitio con https.'],
    ['Excluir este site?','Delete this site?','¿Eliminar este sitio?'],
    ['Não foi possível excluir. Tente de novo.','Could not delete. Try again.','No se pudo eliminar. Inténtalo de nuevo.'],
    ['Site excluído','Site deleted','Sitio eliminado'],
    ['Tudo que você publicou com esta chave sai do mural. Não dá para desfazer.','Everything you published with this key leaves the wall. This can\'t be undone.','Todo lo que publicaste con esta clave sale del muro. No se puede deshacer.'],
    ['Excluir tudo','Delete everything','Eliminar todo'],
    ['Você já denunciou este site.','You already reported this site.','Ya denunciaste este sitio.'],
    ['Não foi possível enviar a denúncia.','Could not send the report.','No se pudo enviar la denuncia.'],
    ['Denúncia enviada. Obrigado.','Report sent. Thank you.','Denuncia enviada. Gracias.'],
    ['Use pelo menos 3 caracteres.','Use at least 3 characters.','Usa al menos 3 caracteres.'],
    ['Publique pelo menos 1 site antes de reservar um @.','Publish at least 1 site before reserving an @.','Publica al menos 1 sitio antes de reservar un @.'],
    ['Não foi possível reservar.','Could not reserve.','No se pudo reservar.'],
    ['Liberar seu @?','Release your @?','¿Liberar tu @?'],
    ['Qualquer pessoa poderá pegar esse nome e seus sites ficam sem @.','Anyone will be able to take that name and your sites will have no @.','Cualquiera podrá tomar ese nombre y tus sitios quedarán sin @.'],
    ['Não foi possível liberar.','Could not release.','No se pudo liberar.'],
    ['@ liberado','@ released','@ liberado'],
    ['Chave copiada. Guarde em um lugar seguro.','Key copied. Keep it somewhere safe.','Clave copiada. Guárdala en un lugar seguro.'],
    ['Chave inválida. Ela tem 64 caracteres (0-9 e a-f).','Invalid key. It has 64 characters (0-9 and a-f).','Clave inválida. Tiene 64 caracteres (0-9 y a-f).'],
    ['Essa já é a chave deste navegador.','That\'s already this browser\'s key.','Esa ya es la clave de este navegador.'],
    ['Trocar de chave?','Switch key?','¿Cambiar de clave?'],
    ['Os sites desta chave atual só serão gerenciáveis de novo se você tiver guardado ela. Copie antes se precisar.','The sites under the current key can only be managed again if you saved it. Copy it first if needed.','Los sitios de la clave actual solo se podrán gestionar de nuevo si la guardaste. Cópiala antes si la necesitas.'],
    ['Esse site não está mais no mural','That site is no longer on the wall','Ese sitio ya no está en el muro'],
    ['Não foi possível abrir esse site','Could not open that site','No se pudo abrir ese sitio'],
    ['Ainda sem acessos registrados.','No visits recorded yet.','Aún sin visitas registradas.'],
    // mensagens do servidor
    ['esse link já está no mural','that link is already on the wall','ese enlace ya está en el muro'],
    ['muitas publicações em pouco tempo. Tente de novo mais tarde','too many posts in a short time. Try again later','demasiadas publicaciones en poco tiempo. Inténtalo más tarde'],
    ['o mural recebeu muitas publicações agora. Tente em alguns minutos','the wall is receiving many posts right now. Try again in a few minutes','el muro está recibiendo muchas publicaciones. Inténtalo en unos minutos'],
    ['limite de 10 sites atingido','limit of 10 sites reached','límite de 10 sitios alcanzado'],
    ['link inválido','invalid link','enlace inválido'],
    ['imagem inválida ou muito grande','invalid or too large image','imagen inválida o demasiado grande'],
    ['perfil suspenso','profile suspended','perfil suspendido']
  ];
  const MES = { en:['January','February','March','April','May','June','July','August','September','October','November','December'],
                es:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'] };
  const MPT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const un = (n, one, many) => n === 1 ? one : many;
  const W = { // palavras com singular/plural por idioma
    en:{ site:['site','sites'], acesso:['visit','visits'] }, es:{ site:['sitio','sitios'], acesso:['visita','visitas'] } };
  const w = (L, k, n) => un(+n, W[L][k][0], W[L][k][1]);
  const P = [ // padrões com números/nomes: [regex PT, (L, ...grupos) => texto]
    [/^(\d+) (?:site|sites)$/, (L, n) => `${n} ${w(L, 'site', n)}`],
    [/^(\d+) (?:acesso|acessos)$/, (L, n) => `${n} ${w(L, 'acesso', n)}`],
    [/^(\d+) (?:acesso|acessos) em 14 dias$/, (L, n) => `${n} ${w(L, 'acesso', n)} ${L === 'en' ? 'in 14 days' : 'en 14 días'}`],
    [/^Publicado em (.+)$/, (L, d) => (L === 'en' ? 'Published on ' : 'Publicado el ') + d],
    [/^(\d+) (?:site|sites) · (\d+) (?:acesso|acessos) · no mural desde (\S+) de (\d{4})$/, (L, s, a, m, y) => {
      const i = MPT.indexOf(m.toLowerCase()), mm = i < 0 ? m : MES[L][i];
      return `${s} ${w(L, 'site', s)} · ${a} ${w(L, 'acesso', a)} · ${L === 'en' ? `on the wall since ${mm} ${y}` : `en el muro desde ${mm} de ${y}`}`;
    }],
    [/^Você poderá trocar de @ em (.+)$/, (L, d) => (L === 'en' ? 'You can change your @ on ' : 'Podrás cambiar tu @ el ') + d],
    [/^No mural desde (\S+) de (\d{4})$/, (L, m, y) => { const i = MPT.indexOf(m.toLowerCase()), mm = i < 0 ? m : MES[L][i]; return L === 'en' ? `On the wall since ${mm} ${y}` : `En el muro desde ${mm} de ${y}`; }],
    [/^Troca para (@\S+) em análise$/, (L, h) => L === 'en' ? `Change to ${h} under review` : `Cambio a ${h} en revisión`],
    [/^Pedido enviado: (@\S+) em análise$/, (L, h) => L === 'en' ? `Request sent: ${h} under review` : `Solicitud enviada: ${h} en revisión`],
    [/^(@\S+) agora é seu$/, (L, h) => L === 'en' ? `${h} is now yours` : `${h} ahora es tuyo`],
    [/^Você já tem (\d+) sites\. Exclua um para publicar outro\.$/, (L, n) => L === 'en' ? `You already have ${n} sites. Delete one to publish another.` : `Ya tienes ${n} sitios. Elimina uno para publicar otro.`],
    [/^Não foi possível salvar: (.*)$/, (L, m) => (L === 'en' ? 'Could not save: ' : 'No se pudo guardar: ') + tr(m, L)],
    [/^"(.*)" sai do mural para todo mundo\. Não dá para desfazer\.$/, (L, n) => L === 'en' ? `"${n}" leaves the wall for everyone. This can't be undone.` : `"${n}" sale del muro para todos. No se puede deshacer.`],
    [/^Excluir seu site\?$/, L => L === 'en' ? 'Delete your site?' : '¿Eliminar tu sitio?'],
    [/^Excluir todos os (\d+) sites\?$/, (L, n) => L === 'en' ? `Delete all ${n} of your sites?` : `¿Eliminar tus ${n} sitios?`],
    [/^(\d+) (?:site excluído|sites excluídos)$/, (L, n) => L === 'en' ? `${n} ${un(+n, 'site', 'sites')} deleted` : `${n} ${un(+n, 'sitio eliminado', 'sitios eliminados')}`],
    [/^Chave restaurada: (\d+) (?:site encontrado|sites encontrados)$/, (L, n) => L === 'en' ? `Key restored: ${n} ${un(+n, 'site', 'sites')} found` : `Clave restaurada: ${n} ${un(+n, 'sitio encontrado', 'sitios encontrados')}`],
    [/^Ver detalhes de (.*)$/, (L, n) => (L === 'en' ? 'View details of ' : 'Ver detalles de ') + n],
    [/^Capa de (.*)$/, (L, n) => (L === 'en' ? 'Cover of ' : 'Portada de ') + n],
    [/^(\d\d\/\d\d): (\d+) (?:acesso|acessos)$/, (L, d, n) => `${d}: ${n} ${w(L, 'acesso', n)}`]
  ];
  const MAP = {}; D.forEach(r => { MAP[r[0]] = { en:r[1], es:r[2] }; });
  const norm = s => s.replace(/\s+/g, ' ').trim();
  function tr(pt, L){
    if (L === 'pt') return pt;
    const k = norm(pt); if (!k) return pt;
    let out = MAP[k] && MAP[k][L];
    if (!out) for (const [re, f] of P){ const m = re.exec(k); if (m){ out = f(L, ...m.slice(1)); break; } }
    if (!out) return pt;
    const lead = pt.match(/^\s*/)[0], tail = pt.match(/\s*$/)[0];
    return lead + out + tail;
  }

  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'data-text'];
  let L = 'pt';
  const SKIP = n => { const p = n.nodeType === 3 ? n.parentElement : n; return !p || p.closest('script,style,noscript,[translate="no"],textarea:not([placeholder])') && !p.matches('[placeholder]'); };
  const obs = new MutationObserver(muts => { obs.disconnect(); try{ muts.forEach(m => {
      if (m.type === 'characterData') texto(m.target);
      else if (m.type === 'attributes') atributo(m.target, m.attributeName);
      else m.addedNodes.forEach(varrer);
    }); }finally{ ligar(); } });
  const ligar = () => obs.observe(document.documentElement, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTRS });

  function texto(n){
    if (SKIP(n)) return;
    const cur = n.nodeValue;
    if (n.__out !== undefined && cur === n.__out){ // nosso texto: só reaplica (troca de idioma)
      const out = tr(n.__pt, L); if (out !== cur){ n.nodeValue = out; n.__out = out; } return; }
    n.__pt = cur; const out = tr(cur, L); n.__out = out; if (out !== cur) n.nodeValue = out;
  }
  function atributo(el, a){
    if (!el.closest || el.closest('[translate="no"]') && a !== 'placeholder') return;
    const v = el.getAttribute(a); if (v == null) return;
    const st = el.__at || (el.__at = {}), s = st[a];
    if (s && s.out === v){ const out = tr(s.pt, L); if (out !== v){ el.setAttribute(a, out); s.out = out; } return; }
    const out = tr(v, L); st[a] = { pt:v, out }; if (out !== v) el.setAttribute(a, out);
  }
  function varrer(root){
    if (root.nodeType === 3){ texto(root); return; }
    if (root.nodeType !== 1) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n = root; do{
      if (n.nodeType === 3) texto(n);
      else ATTRS.forEach(a => { if (n.hasAttribute && n.hasAttribute(a)) atributo(n, a); });
    }while ((n = w.nextNode()));
  }

  function aplicar(l){
    L = l; document.documentElement.lang = ({ pt:'pt-BR', en:'en', es:'es' })[l];
    try{ localStorage.setItem('bl_lang', l); }catch(_){}
    obs.disconnect(); varrer(document.body);
    const t = document.querySelector('title'); if (t){ t.__pt = t.__pt || t.textContent; }
    ligar();
    const b = document.getElementById('langBtn'); if (b) b.querySelector('b').textContent = l.toUpperCase();
    document.querySelectorAll('#langMenu [data-l]').forEach(x => x.classList.toggle('on', x.dataset.l === l));
  }
  window.blLang = () => L;

  function iniciar(){
    let l = 'pt'; try{ l = localStorage.getItem('bl_lang') || ''; }catch(_){}
    if (!['pt', 'en', 'es'].includes(l)){ const n = (navigator.language || 'pt').slice(0, 2).toLowerCase(); l = n === 'es' ? 'es' : n === 'pt' ? 'pt' : 'en'; }
    const btn = document.getElementById('langBtn'), menu = document.getElementById('langMenu');
    const abrir = v => { menu.hidden = !v; btn.setAttribute('aria-expanded', v); };
    btn.addEventListener('click', e => { e.stopPropagation(); abrir(menu.hidden); });
    document.addEventListener('click', () => abrir(false));
    menu.addEventListener('click', e => { const o = e.target.closest('[data-l]'); if (o){ aplicar(o.dataset.l); abrir(false); } });
    addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });
    aplicar(l);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
