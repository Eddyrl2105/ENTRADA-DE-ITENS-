-- ──────────────────────────────────────────────────────────────
-- OPÇÃO 1 — DESATIVAR RLS (mais simples)
-- ──────────────────────────────────────────────────────────────
-- Se você NÃO precisa de regras de segurança por linha agora,
-- basta desativar o RLS e o erro desaparecerá:

-- alter table products disable row level security;

-- ──────────────────────────────────────────────────────────────
-- OPÇÃO 2 — MANTER RLS E LIBERAR O PAPEL `anon`
-- ──────────────────────────────────────────────────────────────
-- Habilite RLS (caso já não esteja) e crie policies explícitas
-- permitindo SELECT / INSERT / UPDATE / DELETE para `anon`.

alter table products enable row level security;

-- Remova políticas antigas que possam conflitar
drop policy if exists "anon_select"  on products;
drop policy if exists "anon_insert"  on products;
drop policy if exists "anon_update"  on products;
drop policy if exists "anon_delete"  on products;

-- SELECT
create policy "anon_select"
on products
for select
to anon
using ( true );

-- INSERT
create policy "anon_insert"
on products
for insert
to anon
with check ( true );

-- UPDATE
create policy "anon_update"
on products
for update
to anon
using ( true )
with check ( true );

-- DELETE
create policy "anon_delete"
on products
for delete
to anon
using ( true );
