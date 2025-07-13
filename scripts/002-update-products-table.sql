-- Atualizar a tabela de produtos com os campos corretos
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_pa VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  lote VARCHAR(100) NOT NULL,
  validade DATE NOT NULL,
  codigo_barras VARCHAR(100),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_codigo_pa ON products(codigo_pa);
CREATE INDEX idx_products_codigo_barras ON products(codigo_barras);
CREATE INDEX idx_products_validade ON products(validade);

-- Inserir alguns produtos de exemplo (opcional)
INSERT INTO products (codigo_pa, descricao, quantidade, lote, validade, codigo_barras, user_id) VALUES
('PA001', 'Produto Exemplo 1', 100, 'LOTE001', '2024-12-31', '7891234567890', NULL),
('PA002', 'Produto Exemplo 2', 50, 'LOTE002', '2024-11-30', '7891234567891', NULL),
('PA003', 'Produto Exemplo 3', 75, 'LOTE003', '2025-01-15', '7891234567892', NULL);
