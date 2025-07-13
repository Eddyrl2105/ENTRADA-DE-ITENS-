-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_pa VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  quantidade_lote INTEGER NOT NULL,
  validade DATE NOT NULL,
  codigo_barras VARCHAR(100),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de códigos de barras (para referência)
CREATE TABLE IF NOT EXISTS barcodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_barras VARCHAR(100) UNIQUE NOT NULL,
  codigo_pa VARCHAR(50),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns códigos de barras de exemplo
INSERT INTO barcodes (codigo_barras, codigo_pa, descricao) VALUES
('7891234567890', 'PA001', 'Produto Exemplo 1'),
('7891234567891', 'PA002', 'Produto Exemplo 2'),
('7891234567892', 'PA003', 'Produto Exemplo 3')
ON CONFLICT (codigo_barras) DO NOTHING;
