-- Adicionar alguns dados de exemplo para testar a busca por Código PA
INSERT INTO barcodes (codigo_barras, codigo_pa, descricao) VALUES
('7891234567890', 'PA001', 'Produto Exemplo 1 - Teste'),
('7891234567891', 'PA002', 'Produto Exemplo 2 - Teste'),
('7891234567892', 'PA003', 'Produto Exemplo 3 - Teste'),
('1234567890123', 'PA004', 'Produto Teste 4'),
('9876543210987', 'PA005', 'Produto Teste 5')
ON CONFLICT (codigo_barras) DO NOTHING;

-- Adicionar alguns produtos de exemplo (opcional)
-- Estes serão usados como referência para busca por PA
INSERT INTO products (codigo_pa, descricao, quantidade, lote, validade, codigo_barras, user_id) VALUES
('PA006', 'Produto Base 6', 100, 'LOTE006', '2024-12-31', '1111111111111', NULL),
('PA007', 'Produto Base 7', 50, 'LOTE007', '2024-11-30', '2222222222222', NULL),
('PA008', 'Produto Base 8', 75, 'LOTE008', '2025-01-15', '3333333333333', NULL)
ON CONFLICT DO NOTHING;
