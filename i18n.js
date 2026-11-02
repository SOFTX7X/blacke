/* BLACKE LAVEX — idiomas (PT padrão, EN, ES).
   Traduz o que aparece na tela comparando o texto em português com este dicionário;
   textos de usuários (nomes, legendas) nunca são traduzidos. */
(() => {
  const D = [ // [pt, en, es]
    ['Notificações','Notifications','Notificaciones'],['Receber avisos fora da aba','Get alerts outside the tab','Recibe avisos fuera de la pestaña'],['Notificação do sistema quando você estiver em outra aba.','System notification when you are on another tab.','Notificación del sistema cuando estés en otra pestaña.'],['Ativar','Enable','Activar'],['Testar','Test','Probar'],['Avisos fora da aba bloqueados','Alerts outside the tab are blocked','Avisos fuera de la pestaña bloqueados'],['Libere as notificações deste site no cadeado ao lado do endereço.','Allow notifications for this site using the lock next to the address.','Permite las notificaciones de este sitio en el candado junto a la dirección.'],['Avisos fora da aba ativados','Alerts outside the tab enabled','Avisos fuera de la pestaña activados'],['Toque em Testar e mude de aba para ouvir.','Tap Test and switch tabs to hear it.','Toca Probar y cambia de pestaña para oírlo.'],['Avisos fora da aba ativados','Alerts outside the tab enabled','Avisos fuera de la pestaña activados'],['Som das notificações','Notification sound','Sonido de notificaciones'],['Marcar todas como lidas','Mark all as read','Marcar todas como leídas'],
    ['começou a seguir você','started following you','empezó a seguirte'],['Seu site','Your site','Tu sitio'],['chegou a','reached','llegó a'],
    ['Você conquistou o Selo BLACKE','You earned the BLACKE Badge','Conseguiste el Sello BLACKE'],['Você conquistou o selo de Verificado','You earned the Verified badge','Conseguiste el sello de Verificado'],
    ['Tudo em dia','All caught up','Todo al día'],['Avisos de novos seguidores e metas de acessos aparecem aqui.','New follower and visit milestone alerts show up here.','Los avisos de nuevos seguidores y metas de visitas aparecen aquí.'],
    ['Meta do selo verificado','Verified badge goal','Meta del sello verificado'],
    ['Para colocar no seu site ou loja','To put on your site or store','Para poner en tu sitio o tienda'],
    ['Selo BLACKE conquistado','BLACKE Badge earned','Sello BLACKE conseguido'],
    ['Meta do Selo BLACKE','BLACKE Badge goal','Meta del Sello BLACKE'],
    ['Selo "Estou no BLACKE"','"I\'m on BLACKE" badge','Sello "Estoy en BLACKE"'],
    ['Coloque no seu site, loja ou página. Quem clicar vai direto para a sua página de links.','Put it on your site, store or page. Anyone who clicks goes straight to your link page.','Ponlo en tu sitio, tienda o página. Quien haga clic irá directo a tu página de enlaces.'],
    ['Escuro','Dark','Oscuro'],
    ['Claro','Light','Claro'],
    ['Copiar código','Copy code','Copiar código'],
    ['Baixar','Download','Descargar'],
    ['Código copiado','Code copied','Código copiado'],
    ['7 dias','7 days','7 días'],
    ['Seus números','Your numbers','Tus números'],
    ['Últimos 14 dias','Last 14 days','Últimos 14 días'],
    ['vs semana anterior','vs previous week','vs semana anterior'],
    ['melhor dia','best day','mejor día'],
    ['dias','days','días'],
    ['Pesquisar','Search','Buscar'],['Nenhum resultado.','No results.','Sin resultados.'],
    ['Sites mais acessados','Most visited sites','Sitios más visitados'],
    ['Ainda sem acessos nos últimos 14 dias. Compartilhe sua página de links para começar.','No visits in the last 14 days yet. Share your link page to get started.','Aún sin visitas en los últimos 14 días. Comparte tu página de enlaces para empezar.'],
    ['Crie a sua página grátis','Create your free page','Crea tu página gratis'],
    ['Grupo no Telegram','Telegram group','Grupo de Telegram'],
    ['Grupo no WhatsApp','WhatsApp group','Grupo de WhatsApp'],
    ['Ainda não há links por aqui.','No links here yet.','Todavía no hay enlaces aquí.'],
    ['Perfil não encontrado','Profile not found','Perfil no encontrado'],
    ['Este @ não existe ou foi removido.','This @ does not exist or was removed.','Este @ no existe o fue eliminado.'],
    ['Feito no','Made on','Hecho en'],
    ['· sem cadastro','· no sign-up','· sin registro'],
    ['Ir para o mural','Go to the wall','Ir al muro'],
    ['Página de links','Link page','Página de enlaces'],
    ['Sua página de links','Your link page','Tu página de enlaces'],
    ['Coloque na bio do Instagram, TikTok ou onde quiser.','Put it in your Instagram or TikTok bio, or anywhere you like.','Ponla en la bio de Instagram, TikTok o donde quieras.'],
    ['Copiar','Copy','Copiar'],
    ['site','site','sitio'],
    ['acesso','visit','visita'],
    ['Abrir','Open','Abrir'],
    ['carregando mural','loading wall','cargando muro'],
    ['Comunidade no Telegram','Telegram community','Comunidad en Telegram'],
    ['Comunidade','Community','Comunidad'],
    ['Publicar link','Publish link','Publicar enlace'],
    ['Mural de sites e marcas','Wall of sites and brands','Muro de sitios y marcas'],
    ['Publique seu link com capa e legenda. Sem conta, sem cadastro.','Publish your link with a cover and caption. No account, no sign-up.','Publica tu enlace con portada y descripción. Sin cuenta, sin registro.'],
    ['Buscar por nome, categoria ou @perfil','Search by name, category or @profile','Buscar por nombre, categoría o @perfil'],['Perfis','Profiles','Perfiles'],
    ['Buscar por nome, legenda ou @perfil','Search by name, caption or @profile','Buscar por nombre, descripción o @perfil'],
    ['Mural','Wall','Muro'],
    ['Destaques','Featured','Destacados'],
    ['Meus sites','My sites','Mis sitios'],
    ['Ordenar','Sort','Ordenar'],
    ['Mais recentes','Newest','Más recientes'],
    ['Mais acessados','Most visited','Más visitados'],
    ['✓ Verificados','✓ Verified','✓ Verificados'],['Selo BLACKE','BLACKE badge','Sello BLACKE'],
    ['Nenhum perfil com esse selo ainda','No profiles with this badge yet','Aún no hay perfiles con esta insignia'],
    ['O Selo BLACKE é conquistado aos 10 mil acessos.','The BLACKE badge is earned at 10 thousand visits.','El sello BLACKE se gana con 10 mil visitas.'],
    ['O selo verificado é conquistado aos mil acessos.','The verified badge is earned at one thousand visits.','El sello verificado se gana con mil visitas.'],
    ['Em alta (7 dias)','Trending (7 days)','En alza (7 días)'],
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
    ['Voltar ao mural','Back to the wall','Volver al muro'],
    ['Nova publicação','New post','Nueva publicación'],['Editar site','Edit site','Editar sitio'],
    ['Capa','Cover','Portada'],['Ajustar','Adjust','Ajustar'],['Detalhes','Details','Detalles'],
    ['Avançar','Next','Siguiente'],['Salvar','Save','Guardar'],
    ['Escolha a capa do seu site','Choose your site cover','Elige la portada de tu sitio'],
    ['Arraste uma imagem para cá ou','Drag an image here or','Arrastra una imagen aquí o'],
    ['Selecionar do aparelho','Select from device','Seleccionar del dispositivo'],
    ['JPG, PNG ou WEBP · até 15 MB','JPG, PNG or WEBP · up to 15 MB','JPG, PNG o WEBP · hasta 15 MB'],
    ['Arraste para enquadrar · use o zoom para aproximar','Drag to frame · use zoom to get closer','Arrastra para encuadrar · usa el zoom para acercar'],
    ['Trocar imagem','Change image','Cambiar imagen'],['Trocar capa','Change cover','Cambiar portada'],
    ['Prévia no mural','Preview on the wall','Vista previa en el muro'],
    ['Link do site','Site link','Enlace del sitio'],['Legenda','Caption','Descripción'],
    ['Nome do seu site','Your site name','Nombre de tu sitio'],
    ['Escolha um arquivo de imagem.','Choose an image file.','Elige un archivo de imagen.'],
    ['Escolher capa','Choose cover','Elegir portada'],['Toque ou arraste uma imagem','Tap or drag an image','Toca o arrastra una imagen'],
    ['Arraste para ajustar','Drag to adjust','Arrastra para ajustar'],['no mural','on the wall','en el muro'],
    ['Modo de segurança: o mural está no ar, mas publicar e editar estão pausados por alguns instantes.','Safe mode: the wall is online, but publishing and editing are paused for a moment.','Modo seguro: el muro está en línea, pero publicar y editar están en pausa por unos instantes.'],
    ['Modo de segurança: o servidor principal está instável. Você pode usar o site normalmente; suas ações serão sincronizadas quando ele voltar.','Safe mode: the main server is unstable. You can keep using the site normally; your actions will sync when it is back.','Modo seguro: el servidor principal está inestable. Puedes usar el sitio con normalidad; tus acciones se sincronizarán cuando vuelva.'],
    ['ESTAMOS EM MANUTENÇÃO','WE ARE UNDER MAINTENANCE','ESTAMOS EN MANTENIMIENTO'],['Voltamos em instantes. Esta página atualiza sozinha.','We will be back shortly. This page refreshes by itself.','Volvemos en unos instantes. Esta página se actualiza sola.'],
    ['Usuários','Users','Usuarios'],['Procure pessoas pelo @ e siga quem você curte.','Find people by their @ and follow the ones you like.','Busca personas por su @ y sigue a quien te guste.'],['Procurar usuário (@nome)','Search user (@name)','Buscar usuario (@nombre)'],['Procurar usuário','Search user','Buscar usuario'],['Em destaque','Featured','Destacados'],['Resultados','Results','Resultados'],['Nenhum usuário encontrado.','No users found.','Ningún usuario encontrado.'],['Ainda não há usuários.','No users yet.','Aún no hay usuarios.'],['Não foi possível buscar agora. Tente de novo.','Could not search right now. Try again.','No se pudo buscar ahora. Inténtalo de nuevo.'],['seguidor','follower','seguidor'],['seguidores','followers','seguidores'],
    ['selecionadas','selected','seleccionadas'],['Selecionar','Select','Seleccionar'],['Selecionar conversas','Select chats','Seleccionar chats'],['Selecionar mensagens','Select messages','Seleccionar mensajes'],['Limpar conversa','Clear chat','Vaciar chat'],['Apagar conversa','Delete chat','Eliminar chat'],['Apagar mensagem?','Delete message?','¿Eliminar mensaje?'],['Apagar para mim','Delete for me','Eliminar para mí'],['Apagar para todos','Delete for everyone','Eliminar para todos'],['Fixar','Pin','Fijar'],['Desafixar','Unpin','Desfijar'],['Silenciar','Mute','Silenciar'],['Reativar notificações','Unmute','Reactivar notificaciones'],['Arquivar','Archive','Archivar'],['Desarquivar','Unarchive','Desarchivar'],['Marcar como lida','Mark as read','Marcar como leída'],['Arquivadas','Archived','Archivadas'],['Fixadas','Pinned','Fijados'],['Limpar','Clear','Vaciar'],['Apagar','Delete','Eliminar'],['Cancelar','Cancel','Cancelar'],['Opções da conversa','Chat options','Opciones del chat'],['Nenhuma conversa arquivada.','No archived chats.','Ningún chat archivado.'],['Nenhuma conversa. Procure o @ de alguém acima.','No chats. Search for someone\'s @ above.','Ningún chat. Busca el @ de alguien arriba.'],['Apagar para mim some só do seu lado. Apagar para todos remove das duas conversas (só até 24 horas depois de enviar).','Delete for me removes it only on your side. Delete for everyone removes it from both chats (only within 24 hours of sending).','Eliminar para mí solo lo quita de tu lado. Eliminar para todos lo quita de ambos chats (solo hasta 24 horas después de enviar).'],['Vai sumir só do seu lado; a outra pessoa continua vendo.','It disappears only on your side; the other person still sees it.','Desaparece solo de tu lado; la otra persona lo sigue viendo.'],['Todas as mensagens somem só do seu lado. A conversa continua na lista e a outra pessoa não é afetada.','All messages disappear only on your side. The chat stays in the list and the other person is not affected.','Todos los mensajes desaparecen solo de tu lado. El chat sigue en la lista y la otra persona no se ve afectada.'],['A conversa sai da sua lista e o histórico some só do seu lado. A outra pessoa não é afetada. Ela volta se chegar mensagem nova.','The chat leaves your list and the history disappears only on your side. The other person is not affected. It comes back if a new message arrives.','El chat sale de tu lista y el historial desaparece solo de tu lado. La otra persona no se ve afectada. Vuelve si llega un mensaje nuevo.'],['Limpar conversa?','Clear chat?','¿Vaciar chat?'],['Apagar conversa?','Delete chat?','¿Eliminar chat?'],['Conversa limpa.','Chat cleared.','Chat vaciado.'],['Conversa apagada.','Chat deleted.','Chat eliminado.'],['Conversa fixada.','Chat pinned.','Chat fijado.'],['Conversa desafixada.','Chat unpinned.','Chat desfijado.'],['Conversa silenciada.','Chat muted.','Chat silenciado.'],['Notificações reativadas.','Notifications on.','Notificaciones activadas.'],['Conversa arquivada.','Chat archived.','Chat archivado.'],['Conversa desarquivada.','Chat unarchived.','Chat desarchivado.'],['Marcada como lida.','Marked as read.','Marcada como leída.'],['Você pode fixar no máximo 5 conversas','You can pin at most 5 chats','Puedes fijar como máximo 5 chats'],['Mensagens','Messages','Mensajes'],['Online','Online','En línea'],['Usuários bloqueados','Blocked users','Usuarios bloqueados'],['Denunciar conversa','Report conversation','Denunciar conversación'],['A conversa é enviada para análise do BLACKE. Ela continua aberta; você escolhe se também quer bloquear.','The conversation is sent to BLACKE for review. It stays open; you choose whether to block as well.','La conversación se envía a BLACKE para revisión. Sigue abierta; tú eliges si también quieres bloquear.'],['Também bloquear','Also block','Bloquear también'],['Quem você bloqueia não pode te seguir nem conversar com você. Ao desbloquear, vocês precisam se seguir de novo para conversar.','People you block cannot follow you or chat with you. After unblocking, you need to follow each other again to chat.','Quien bloqueas no puede seguirte ni chatear contigo. Al desbloquear, deben seguirse de nuevo para chatear.'],['Desbloquear','Unblock','Desbloquear'],['Você não bloqueou ninguém.','You have not blocked anyone.','No has bloqueado a nadie.'],['Links','Links','Enlaces'],['Bloquear','Block','Bloquear'],['Denunciar','Report','Denunciar'],['seguidores','followers','seguidores'],['seguindo','following','siguiendo'],['sites','sites','sitios'],['No mural desde','On the wall since','En el muro desde'],['Bio','Bio','Bio'],['Perfil','Profile','Perfil'],['Opções','Options','Opciones'],['digitando','typing','escribiendo'],['Responder','Reply','Responder'],['Remover','Remove','Quitar'],['Cancelar resposta','Cancel reply','Cancelar respuesta'],['Hoje','Today','Hoy'],['Ontem','Yesterday','Ayer'],['Buscar','Search','Buscar'],['Escrever mensagem','Write a message','Escribir mensaje'],['Ninguém encontrado.','No one found.','Nadie encontrado.'],['Você','You','Tú'],['Offline','Offline','Desconectado'],['Visto','Seen','Visto'],['Aparecer online','Appear online','Aparecer en línea'],['Escolha uma pessoa para conversar','Pick someone to chat with','Elige a alguien para conversar'],['Mensagem','Message','Mensaje'],['Escreva uma mensagem','Write a message','Escribe un mensaje'],['Começar uma conversa','Start a conversation','Empezar una conversación'],['Você só conversa com quem se segue mutuamente. Siga alguém e peça para seguir você de volta.','You can only chat with people you follow each other. Follow someone and ask them to follow you back.','Solo puedes chatear con quien se sigue mutuamente. Sigue a alguien y pídele que te siga de vuelta.'],['Diga oi 👋','Say hi 👋','Di hola 👋'],['Mensagem apagada','Message deleted','Mensaje eliminado'],['Bloquear','Block','Bloquear'],['Desbloquear','Unblock','Desbloquear'],['Denunciar conversa','Report conversation','Denunciar conversación'],['Você bloqueou este usuário.','You blocked this user.','Bloqueaste a este usuario.'],['Vocês precisam se seguir mutuamente para conversar.','You need to follow each other to chat.','Deben seguirse mutuamente para conversar.'],['Sem links e sem arquivos. Conversas só são vistas por quem participa; denúncias vão para análise.','No links or files. Only participants see conversations; reports go to review.','Sin enlaces ni archivos. Solo los participantes ven las conversaciones; las denuncias se revisan.'],['Usuário bloqueado.','User blocked.','Usuario bloqueado.'],['Denúncia enviada. Obrigado.','Report sent. Thank you.','Denuncia enviada. Gracias.'],['Reserve seu @ para usar o chat','Reserve your @ to use chat','Reserva tu @ para usar el chat'],['Não foi possível carregar agora.','Could not load right now.','No se pudo cargar ahora.'],['Não foi possível enviar agora.','Could not send right now.','No se pudo enviar ahora.'],['Mais opções','More options','Más opciones'],['Apagar mensagem','Delete message','Eliminar mensaje'],['Enviar','Send','Enviar'],
    ['Publicar e editar estão pausados por alguns instantes.','Publishing and editing are paused for a moment.','Publicar y editar están en pausa por unos instantes.'],
    ['Publicar está pausado por alguns instantes. Tente de novo mais tarde.','Publishing is paused for a moment. Try again later.','Publicar está en pausa por unos instantes. Inténtalo más tarde.'],
    ['Editar está pausado por alguns instantes. Tente de novo mais tarde.','Editing is paused for a moment. Try again later.','Editar está en pausa por unos instantes. Inténtalo más tarde.'],
    ['Conta','Account','Cuenta'],
    ['Mais deste perfil','More from this profile','Más de este perfil'],['Mais de','More from','Más de'],
    ['Buscar','Search','Buscar'],['Fechar busca','Close search','Cerrar búsqueda'],
    ['Os sites mais acessados e os mais novos do mural.','The most visited and newest sites on the wall.','Los sitios más visitados y más nuevos del muro.'],
    ['Não foi possível carregar','Could not load','No se pudo cargar'],
    ['Verifique sua conexão e tente de novo em instantes.','Check your connection and try again in a moment.','Revisa tu conexión e inténtalo de nuevo en unos instantes.'],
    ['Tentar de novo','Try again','Intentar de nuevo'],
    ['Nenhum site salvo','No saved sites','Ningún sitio guardado'],
    ['Toque no ♥ de um card para guardar aqui.','Tap the ♥ on a card to save it here.','Toca el ♥ de una tarjeta para guardarla aquí.'],
    ['Ver o mural','See the wall','Ver el muro'],
    ['Nada encontrado','Nothing found','No se encontró nada'],
    ['Tente outra busca ou categoria.','Try another search or category.','Prueba otra búsqueda o categoría.'],
    ['Limpar busca e filtros','Clear search and filters','Limpiar búsqueda y filtros'],
    ['O mural está vazio','The wall is empty','El muro está vacío'],
    ['Seja o primeiro a publicar um site.','Be the first to publish a site.','Sé el primero en publicar un sitio.'],
    ['Nenhum site publicado','No published sites','Ningún sitio publicado'],
    ['Os sites que você publicar neste navegador aparecem aqui.','Sites you publish in this browser appear here.','Los sitios que publiques en este navegador aparecen aquí.'],
    ['Chave bloqueada','Key blocked','Clave bloqueada'],
    ['Seu navegador bloqueou o recurso de chave. Abra o site em https.','Your browser blocked the key feature. Open the site over https.','Tu navegador bloqueó la clave. Abre el sitio con https.'],
    ['Ainda não há destaques','No highlights yet','Aún no hay destacados'],
    ['Os sites mais acessados aparecem aqui.','The most visited sites appear here.','Los sitios más visitados aparecen aquí.'],
    ['Os sites mais novos aparecem aqui.','The newest sites appear here.','Los sitios más nuevos aparecen aquí.'],
    ['Reagir','React','Reaccionar'],['Não foi possível reagir.','Could not react.','No se pudo reaccionar.'],
    ['muitas reações em pouco tempo. Tente mais tarde.','too many reactions in a short time. Try again later.','demasiadas reacciones en poco tiempo. Inténtalo más tarde.'],
    ['Aviso da moderação','Moderation notice','Aviso de moderación'],['Aviso da moderação:','Moderation notice:','Aviso de moderación:'],['Prazo para corrigir:','Deadline to fix:','Plazo para corregir:'],['Prazo encerrado','Deadline passed','Plazo vencido'],['Já corrigi','I fixed it','Ya corregí'],['Você avisou que corrigiu. Aguarde a análise da moderação.','You said you fixed it. Wait for the moderators to review.','Avisaste que corregiste. Espera la revisión de moderación.'],['Você já corrigiu tudo?','Have you fixed everything?','¿Ya corregiste todo?'],['A moderação vai conferir. Se faltar algo, você recebe um novo prazo.','Moderators will check. If something is missing, you get a new deadline.','Moderación lo revisará. Si falta algo, recibes un nuevo plazo.'],['Sim, já corrigi','Yes, I fixed it','Sí, ya corregí'],['Aviso enviado à moderação','Sent to moderators','Enviado a moderación'],['Não foi possível enviar agora.','Could not send right now.','No se pudo enviar ahora.'],['d','d','d'],['h','h','h'],['min','min','min'],
    ['Seguir','Follow','Seguir'],['Seguir de volta','Follow back','Seguir también'],['Remover','Remove','Quitar'],['Remover seguidor?','Remove follower?','¿Quitar seguidor?'],['O perfil não será avisado de que foi removido. Ele poderá voltar a seguir você.','The profile won\'t be told they were removed. They can follow you again.','No se avisará al perfil de que fue quitado. Podrá volver a seguirte.'],['Seguidor removido','Follower removed','Seguidor quitado'],['Não foi possível remover agora.','Could not remove right now.','No se pudo quitar ahora.'],['Deixar de seguir?','Unfollow?','¿Dejar de seguir?'],['Deixar de seguir','Unfollow','Dejar de seguir'],['Você pode voltar a seguir quando quiser.','You can follow again anytime.','Puedes volver a seguir cuando quieras.'],['Seguindo','Following','Siguiendo'],['Seguidores','Followers','Seguidores'],['seguidores','followers','seguidores'],['seguidor','follower','seguidor'],['seguindo','following','siguiendo'],
    ['Nenhum seguidor ainda.','No followers yet.','Aún no hay seguidores.'],['Não segue ninguém ainda.','Not following anyone yet.','Aún no sigue a nadie.'],
    ['Reserve seu @ para seguir perfis','Reserve your @ to follow profiles','Reserva tu @ para seguir perfiles'],['Não foi possível seguir agora.','Could not follow right now.','No se pudo seguir ahora.'],
    ['Você ainda não segue ninguém','You are not following anyone yet','Aún no sigues a nadie'],
    ['Abra um perfil e toque em Seguir para ver os sites dele aqui.','Open a profile and tap Follow to see their sites here.','Abre un perfil y toca Seguir para ver sus sitios aquí.'],
    ['Reserve seu @ e siga perfis para ver os sites deles aqui.','Reserve your @ and follow profiles to see their sites here.','Reserva tu @ y sigue perfiles para ver sus sitios aquí.'],
    ['Carregando…','Loading…','Cargando…'],
    ['Ranking da semana','Weekly ranking','Ranking de la semana'],['em 7 dias','in 7 days','en 7 días'],
    ['Ver detalhes','See details','Ver detalles'],
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
