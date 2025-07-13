-- Adiciona a coluna is_master na tabela users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE;

-- Opcional: Defina um usuário existente como master para testes
-- Substitua 'seu_username_master' pelo nome de usuário que você deseja tornar master
-- UPDATE users SET is_master = TRUE WHERE username = 'seu_username_master';

-- Se você quiser que a coluna user_id na tabela products não seja nula,
-- e que os produtos existentes sem user_id sejam associados a um usuário padrão,
-- ou que novas entradas sempre tenham um user_id.
-- Isso é importante para o filtro de produtos por usuário.
-- ALTER TABLE products ALTER COLUMN user_id SET NOT NULL;
