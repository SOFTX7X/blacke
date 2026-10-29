# BLACKE LAVEX — mural anônimo

Site estático (HTML + CSS + JS) com Supabase. A conexão (URL + chave pública) continua em `app.js`.

## Como atualizar (nesta ordem)
1. Supabase > **SQL Editor**:
   - se ainda não rodou nada da v5: rode `supabase-1-base.sql` e depois `supabase-2-arroba.sql`;
   - se já rodou o da v5: rode só `supabase-2-arroba.sql`;
   - depois rode `supabase-3-posicao-foto.sql` (posição da foto de capa).
2. Suba os arquivos para o GitHub (a Vercel publica sozinha).

## Recursos
- **Meus sites** sem login: cada navegador tem uma chave secreta. Só ela edita/exclui os sites.
- **@ de perfil**: nome único ligado à chave. Busque `@nome` para ver todos os sites daquele perfil.
  - só reserva quem tem 1 site; troca a cada 30 dias (1h de tolerância); libera após 90 dias sem sites.
- **Denúncias com motivo** (golpe, impróprio, link quebrado, outro). 5 denúncias tiram o site do mural.
- **Posição da foto**: ao publicar/editar, arraste a imagem dentro da prévia para escolher o enquadramento.
- Cards de altura fixa. A legenda tem uma área maior (4 linhas) com rolagem dentro do próprio card, sem mexer no layout; o menu ⋮ tem copiar link, compartilhar, denunciar e (em "Meus sites") editar/excluir.
- Categorias, ordenar por acessos, contador de acessos, "Carregar mais", limite de 10 sites por chave.

## Preparado para o painel admin (ainda não incluído)
O banco já tem: `denuncias` (motivo, detalhe, data, resolvida), `perfis.suspenso` e `sites_publicos.oculto`.
Moderação manual por enquanto: veja os comandos no final do `supabase-2-arroba.sql`.
