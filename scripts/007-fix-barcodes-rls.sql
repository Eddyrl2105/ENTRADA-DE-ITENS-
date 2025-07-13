-- ───────────────────────────────────────────────────────────
-- GARANTIR RLS PARA A TABELA `barcodes`
-- ───────────────────────────────────────────────────────────

-- Habilita RLS na tabela barcodes (se ainda não estiver)
ALTER TABLE barcodes ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que possam conflitar
DROP POLICY IF EXISTS anon_select ON barcodes;

-- Cria uma política que permite SELECT para o papel `anon`
-- Isso é necessário para que o frontend possa ler os dados de códigos de barras
CREATE POLICY anon_select
  ON barcodes
  FOR SELECT
  TO anon
  USING ( true );

-- Opcional: Se você quiser permitir INSERT/UPDATE/DELETE para `anon` também
-- DROP POLICY IF EXISTS anon_insert ON barcodes;
-- DROP POLICY IF EXISTS anon_update ON barcodes;
-- DROP POLICY IF EXISTS anon_delete ON barcodes;

-- CREATE POLICY anon_insert
--   ON barcodes
--   FOR INSERT
--   TO anon
--   WITH CHECK ( true );

-- CREATE POLICY anon_update
--   ON barcodes
--   FOR UPDATE
--   TO anon
--   USING ( true )
--   WITH CHECK ( true );

-- CREATE POLICY anon_delete
--   ON barcodes
--   FOR DELETE
--   TO anon
--   USING ( true );
