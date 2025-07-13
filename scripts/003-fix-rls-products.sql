-- Habilite RLS (caso ainda não esteja) e crie políticas explícitas
-- Você pode trocar "ENABLE" por "DISABLE" se preferir desativar o RLS por completo.

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que possam conflitar
DROP POLICY IF EXISTS anon_crud ON products;

-- Libera operações completas (SELECT, INSERT, UPDATE, DELETE) para o papel anon
CREATE POLICY anon_crud
ON products
FOR ALL                      -- SELECT, INSERT, UPDATE, DELETE
TO anon
USING (true)                 -- condição de leitura
WITH CHECK (true);           -- condição de escrita
