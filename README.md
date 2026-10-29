# BLACKE LAVEX — mural anônimo

Site estático (HTML + CSS + JS) com Supabase. A conexão (URL + chave pública) continua em `app.js`.

## Como atualizar (nesta ordem)
1. Supabase > **SQL Editor**:
   - se ainda não rodou nada da v5: rode `supabase-1-base.sql` e depois `supabase-2-arroba.sql`;
   - se já rodou o da v5: rode só `supabase-2-arroba.sql`.
2. Suba os arquivos para o GitHub (a Vercel publica sozinha).

## Recursos
- **Meus sites** sem login: cada navegador tem uma chave secreta. Só ela edita/exclui os sites.
- **@ de perfil**: nome único ligado à chave. Busque `@nome` para ver todos os sites daquele perfil.
  - só reserva quem tem 1 site; troca a cada 30 dias (1h de tolerância); libera após 90 dias sem sites.
- **Denúncias com motivo** (golpe, impróprio, link quebrado, outro). 5 denúncias tiram o site do mural.
- Categorias, ordenar por acessos, contador de acessos, "Carregar mais", limite de 10 sites por chave.

## Preparado para o painel admin (ainda não incluído)
O banco já tem: `denuncias` (motivo, detalhe, data, resolvida), `perfis.suspenso` e `sites_publicos.oculto`.
Moderação manual por enquanto: veja os comandos no final do `supabase-2-arroba.sql`.
