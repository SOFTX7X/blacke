# BLACKE LAVEX — mural anônimo

Site estático (HTML + CSS + JS) com Supabase.

## Como atualizar (nesta ordem)
1. Supabase > **SQL Editor** > New query > cole o conteúdo de `supabase.sql` > **Run** (só uma vez).
2. Suba os arquivos para o GitHub (Vercel publica sozinho).

> Se subir o site antes do SQL, o mural mostra "O banco ainda não foi atualizado".

## Recursos
- Meus sites: cada navegador recebe uma chave secreta (sem login). Só quem tem a chave edita/exclui os próprios sites.
- Chave de acesso: copiar e restaurar em outro aparelho (botão "Minha chave").
- Editar, excluir um ou excluir todos.
- Categorias, busca, ordenar por recentes/mais acessados, "Carregar mais".
- Contador de acessos por site, denúncia (5 denúncias tiram do mural).
- Limite de 10 sites por chave e validação no servidor.

## Moderação (você, dono do projeto)
No SQL Editor:
- apagar: `delete from public.sites_publicos where id = 123;`
- devolver denunciado: `update public.sites_publicos set denuncias = 0 where id = 123;`
