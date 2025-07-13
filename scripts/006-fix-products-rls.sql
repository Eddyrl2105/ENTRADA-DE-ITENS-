-- ───────────────────────────────────────────────────────────
-- ESCOLHA UMA DAS OPÇÕES (comente a outra antes de rodar)
-- ───────────────────────────────────────────────────────────

--------------------  OPÇÃO A – DESATIVAR RLS  --------------------
-- Mais rápido, menos seguro.  Libera tudo para qualquer usuário.
/*
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
*/

--------------------  OPÇÃO B – MANTER RLS E CRIAR POLICIES  -----
-- Mantém a segurança, mas permite SELECT / INSERT / UPDATE / DELETE
-- ao papel `anon` (chave pública do navegador).

-- Habilita RLS (garantia) e remove policies antigas conflitantes
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_select  ON products;
DROP POLICY IF EXISTS anon_insert  ON products;
DROP POLICY IF EXISTS anon_update  ON products;
DROP POLICY IF EXISTS anon_delete  ON products;

-- Libera operações
CREATE POLICY anon_select
  ON products
  FOR SELECT
  TO anon
  USING ( true );

CREATE POLICY anon_insert
  ON products
  FOR INSERT
  TO anon
  WITH CHECK ( true );

CREATE POLICY anon_update
  ON products
  FOR UPDATE
  TO anon
  USING ( true )
  WITH CHECK ( true );

CREATE POLICY anon_delete
  ON products
  FOR DELETE
  TO anon
  USING ( true );
