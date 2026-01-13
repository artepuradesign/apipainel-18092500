-- =====================================================
-- IPLACE SEMINOVOS - BANCO DE DADOS COMPLETO (MySQL/MariaDB)
-- Script único: schema + dados de exemplo
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- LIMPAR TABELAS EXISTENTES (SE HOUVER)
-- =====================================================
DROP TABLE IF EXISTS pedido_itens;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS produto_variacoes;
DROP TABLE IF EXISTS produto_especificacoes;
DROP TABLE IF EXISTS produto_imagens;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS configuracoes;

-- =====================================================
-- TABELA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14),
    tipo ENUM('admin', 'cliente') DEFAULT 'cliente',
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: categorias
-- =====================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    imagem VARCHAR(500),
    ordem INT DEFAULT 0,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: produtos
-- =====================================================
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    descricao_curta VARCHAR(500),
    categoria_id INT,
    modelo VARCHAR(50),
    condicao ENUM('novo', 'seminovo', 'usado_excelente', 'usado_bom', 'recondicionado', 'com_defeito') DEFAULT 'seminovo',
    condicao_descricao VARCHAR(255),
    preco DECIMAL(10,2) NOT NULL,
    preco_original DECIMAL(10,2),
    desconto_percentual INT DEFAULT 0,
    estoque INT DEFAULT 0,
    garantia_meses INT DEFAULT 3,
    tela VARCHAR(100),
    camera VARCHAR(100),
    chip VARCHAR(50),
    destaque TINYINT(1) DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 5.0,
    reviews INT DEFAULT 0,
    parcelas INT DEFAULT 12,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: produto_imagens
-- =====================================================
CREATE TABLE produto_imagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    ordem INT DEFAULT 0,
    principal TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: produto_especificacoes
-- =====================================================
CREATE TABLE produto_especificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    label VARCHAR(100) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: produto_variacoes
-- Variações de cor e capacidade
-- =====================================================
CREATE TABLE produto_variacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    cor VARCHAR(50),
    cor_codigo VARCHAR(7),
    capacidade VARCHAR(20),
    estoque INT DEFAULT 0,
    preco DECIMAL(10,2),
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: pedidos
-- =====================================================
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INT,
    nome_cliente VARCHAR(100) NOT NULL,
    email_cliente VARCHAR(255) NOT NULL,
    telefone_cliente VARCHAR(20),
    cpf_cliente VARCHAR(14),
    endereco_cep VARCHAR(10),
    endereco_logradouro VARCHAR(255),
    endereco_numero VARCHAR(20),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(2),
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    frete DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    forma_pagamento ENUM('pix', 'cartao', 'boleto') NOT NULL,
    status ENUM('pendente', 'pago', 'preparando', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
    codigo_rastreio VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: pedido_itens
-- =====================================================
CREATE TABLE pedido_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT,
    produto_nome VARCHAR(255) NOT NULL,
    produto_sku VARCHAR(50),
    produto_imagem VARCHAR(500),
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABELA: configuracoes
-- =====================================================
CREATE TABLE configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_slug ON produtos(slug);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_numero ON pedidos(numero);
CREATE INDEX idx_variacoes_produto ON produto_variacoes(produto_id);

-- =====================================================
-- DADOS: USUÁRIO ADMIN (senha: admin123)
-- =====================================================
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Administrador', 'admin@iplace.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- =====================================================
-- DADOS: CATEGORIAS
-- =====================================================
INSERT INTO categorias (nome, slug, descricao, ordem) VALUES
('iPhones', 'iphones', 'Smartphones Apple iPhone seminovos', 1),
('iPads', 'ipads', 'Tablets Apple iPad seminovos', 2),
('MacBooks', 'macbooks', 'Notebooks Apple MacBook seminovos', 3),
('Apple Watch', 'apple-watch', 'Relógios Apple Watch seminovos', 4),
('AirPods', 'airpods', 'Fones Apple AirPods seminovos', 5),
('Acessórios', 'acessorios', 'Acessórios Apple originais', 6);

-- =====================================================
-- DADOS: PRODUTOS
-- =====================================================
INSERT INTO produtos (sku, nome, slug, descricao, descricao_curta, categoria_id, modelo, condicao, condicao_descricao, preco, preco_original, desconto_percentual, estoque, garantia_meses, tela, camera, chip, destaque, rating, reviews, parcelas) VALUES
('IPH15PRO256', 'iPhone 15 Pro 256GB', 'iphone-15-pro-256gb', 'iPhone 15 Pro com chip A17 Pro, câmera de 48MP, Dynamic Island e corpo em titânio. Aparelho em excelente estado.', 'iPhone 15 Pro 256GB seminovo em excelente estado', 1, 'IPHONE 15 PRO', 'seminovo', 'Excelente - Sem marcas de uso', 6499.00, 7999.00, 19, 5, 6, '6.1" Super Retina XDR ProMotion', '48MP + 12MP + 12MP + LiDAR', 'A17 Pro', 1, 4.9, 127, 12),
('IPH14PLUS128', 'iPhone 14 Plus 128GB', 'iphone-14-plus-128gb', 'iPhone 14 Plus com tela de 6.7 polegadas, chip A15 Bionic e câmera dupla de 12MP.', 'iPhone 14 Plus 128GB seminovo', 1, 'IPHONE 14 PLUS', 'seminovo', 'Muito Bom - Pequenas marcas', 4299.00, 5499.00, 22, 8, 6, '6.7" Super Retina XDR', '12MP + 12MP', 'A15 Bionic', 1, 4.7, 89, 12),
('IPH13128', 'iPhone 13 128GB', 'iphone-13-128gb', 'iPhone 13 com chip A15 Bionic, câmera dupla de 12MP e 5G.', 'iPhone 13 128GB seminovo', 1, 'IPHONE 13', 'usado_bom', 'Bom - Marcas leves de uso', 2999.00, 3999.00, 25, 12, 3, '6.1" Super Retina XDR', '12MP + 12MP', 'A15 Bionic', 0, 4.5, 234, 12),
('IPH12128', 'iPhone 12 128GB', 'iphone-12-128gb', 'iPhone 12 com chip A14 Bionic, tela Super Retina XDR e 5G.', 'iPhone 12 128GB seminovo', 1, 'IPHONE 12', 'usado_bom', 'Bom - Algumas marcas', 2199.00, 2999.00, 27, 15, 3, '6.1" Super Retina XDR', '12MP + 12MP', 'A14 Bionic', 0, 4.4, 312, 12),
('IPADPRO11M2', 'iPad Pro 11" M2 256GB', 'ipad-pro-11-m2-256gb', 'iPad Pro 11 polegadas com chip M2, tela Liquid Retina XDR.', 'iPad Pro 11" M2 256GB seminovo', 2, NULL, 'seminovo', 'Excelente - Como novo', 6299.00, 7999.00, 21, 3, 6, '11" Liquid Retina XDR', '12MP + 10MP + LiDAR', 'M2', 1, 4.8, 56, 12),
('IPADAIR5256', 'iPad Air 5ª Geração 256GB', 'ipad-air-5-256gb', 'iPad Air com chip M1, tela Liquid Retina de 10.9".', 'iPad Air 5ª Geração 256GB seminovo', 2, NULL, 'seminovo', 'Muito Bom - Pequenas marcas', 4499.00, 5699.00, 21, 6, 6, '10.9" Liquid Retina', '12MP', 'M1', 0, 4.6, 78, 12),
('MBPROM2PRO14', 'MacBook Pro 14" M2 Pro 512GB', 'macbook-pro-14-m2-pro-512gb', 'MacBook Pro 14 polegadas com chip M2 Pro, 16GB RAM, SSD 512GB.', 'MacBook Pro 14" M2 Pro 512GB seminovo', 3, NULL, 'seminovo', 'Excelente - Pouquíssimo uso', 12499.00, 15999.00, 22, 2, 6, '14.2" Liquid Retina XDR', NULL, 'M2 Pro', 1, 4.9, 34, 12),
('MBAIRM2256', 'MacBook Air M2 256GB', 'macbook-air-m2-256gb', 'MacBook Air com chip M2, 8GB RAM, SSD 256GB.', 'MacBook Air M2 256GB seminovo', 3, NULL, 'seminovo', 'Muito Bom - Marcas leves', 7499.00, 9499.00, 21, 4, 6, '13.6" Liquid Retina', NULL, 'M2', 0, 4.7, 92, 12),
('AWS9GPS45', 'Apple Watch Series 9 GPS 45mm', 'apple-watch-series-9-gps-45mm', 'Apple Watch Series 9 com GPS, caixa de alumínio e pulseira esportiva.', 'Apple Watch Series 9 GPS 45mm seminovo', 4, NULL, 'seminovo', 'Excelente - Sem marcas', 2899.00, 3699.00, 22, 7, 6, '45mm OLED Retina', NULL, 'S9 SiP', 1, 4.8, 45, 12),
('AWULTRA2', 'Apple Watch Ultra 2', 'apple-watch-ultra-2', 'Apple Watch Ultra 2 com GPS + Celular, caixa de titânio 49mm.', 'Apple Watch Ultra 2 seminovo', 4, NULL, 'seminovo', 'Excelente - Como novo', 5499.00, 6999.00, 21, 2, 6, '49mm OLED Retina', NULL, 'S9 SiP', 1, 4.9, 28, 12),
('APPMAX', 'AirPods Max', 'airpods-max', 'AirPods Max com cancelamento de ruído ativo e áudio espacial.', 'AirPods Max seminovo', 5, NULL, 'seminovo', 'Muito Bom - Pequenas marcas', 2999.00, 4299.00, 30, 4, 3, NULL, NULL, 'H1', 0, 4.6, 67, 12),
('APPPRO2', 'AirPods Pro 2ª Geração', 'airpods-pro-2-geracao', 'AirPods Pro 2ª geração com cancelamento de ruído e estojo MagSafe.', 'AirPods Pro 2ª Geração seminovo', 5, NULL, 'seminovo', 'Excelente - Pouquíssimo uso', 1499.00, 1899.00, 21, 10, 3, NULL, NULL, 'H2', 1, 4.8, 156, 12),
('MAGSAFE15W', 'Carregador MagSafe 15W', 'carregador-magsafe-15w', 'Carregador MagSafe original Apple com potência de 15W.', 'Carregador MagSafe 15W Original', 6, NULL, 'novo', 'Novo - Lacrado', 299.00, 399.00, 25, 25, 12, NULL, NULL, NULL, 0, 4.9, 89, 12);

-- =====================================================
-- DADOS: IMAGENS DOS PRODUTOS
-- =====================================================
INSERT INTO produto_imagens (produto_id, url, ordem, principal) VALUES
(1, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(2, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-7inch-blue?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(3, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-pink?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(4, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-black-select-2020?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(5, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-select-202210-11inch-space-gray-wifi?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(6, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-finish-select-gallery-202211-blue-wifi?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(7, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(8, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba-midnight-select-202306?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(9, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-702w-702?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(10, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra-702?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(11, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-spacegray-202011?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(12, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1),
(13, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXH3?wid=800&hei=800&fmt=jpeg&qlt=90', 0, 1);

-- =====================================================
-- DADOS: ESPECIFICAÇÕES DOS PRODUTOS
-- =====================================================
INSERT INTO produto_especificacoes (produto_id, label, valor, ordem) VALUES
(1, 'Armazenamento', '256GB', 1),
(1, 'Chip', 'A17 Pro', 2),
(1, 'Tela', '6.1" Super Retina XDR', 3),
(1, 'Câmera', '48MP + 12MP + 12MP', 4),
(1, 'Bateria', 'Saúde 95%', 5),
(2, 'Armazenamento', '128GB', 1),
(2, 'Chip', 'A15 Bionic', 2),
(2, 'Tela', '6.7" Super Retina XDR', 3),
(2, 'Bateria', 'Saúde 88%', 4),
(3, 'Armazenamento', '128GB', 1),
(3, 'Chip', 'A15 Bionic', 2),
(3, 'Tela', '6.1" Super Retina XDR', 3),
(3, 'Bateria', 'Saúde 82%', 4),
(5, 'Armazenamento', '256GB', 1),
(5, 'Chip', 'M2', 2),
(5, 'Tela', '11" Liquid Retina XDR', 3),
(7, 'Armazenamento', '512GB SSD', 1),
(7, 'Chip', 'M2 Pro', 2),
(7, 'Memória', '16GB RAM', 3),
(7, 'Tela', '14.2" Liquid Retina XDR', 4),
(9, 'Tamanho', '45mm', 1),
(9, 'Material', 'Alumínio', 2),
(9, 'Conectividade', 'GPS', 3),
(12, 'Tipo', 'In-ear', 1),
(12, 'Cancelamento de Ruído', 'Ativo', 2),
(12, 'Estojo', 'MagSafe', 3);

-- =====================================================
-- DADOS: VARIAÇÕES (cor/capacidade)
-- =====================================================
INSERT INTO produto_variacoes (produto_id, cor, cor_codigo, capacidade, estoque, preco, ativo) VALUES
-- iPhone 13 128GB (produto_id = 3)
(3, 'Rosa', '#FADADD', '128GB', 5, 2999.00, 1),
(3, 'Azul', '#87CEEB', '128GB', 3, 2999.00, 1),
(3, 'Preto', '#1C1C1C', '128GB', 0, 2999.00, 1),
(3, 'Branco', '#F5F5F5', '128GB', 0, 2999.00, 1),
(3, 'Verde', '#98D8AA', '128GB', 2, 2999.00, 1),
(3, 'Vermelho', '#DC143C', '128GB', 0, 2999.00, 1),
(3, 'Rosa', '#FADADD', '256GB', 2, 3299.00, 1),
(3, 'Azul', '#87CEEB', '256GB', 1, 3299.00, 1),
(3, 'Preto', '#1C1C1C', '256GB', 0, 3299.00, 1),
(3, 'Rosa', '#FADADD', '512GB', 0, 3799.00, 1),

-- iPhone 15 Pro (produto_id = 1)
(1, 'Titânio Natural', '#D4D4D4', '256GB', 3, 6499.00, 1),
(1, 'Titânio Azul', '#5A6E7F', '256GB', 2, 6499.00, 1),
(1, 'Titânio Preto', '#1C1C1C', '256GB', 1, 6499.00, 1),
(1, 'Titânio Branco', '#F5F5F5', '256GB', 0, 6499.00, 1),
(1, 'Titânio Natural', '#D4D4D4', '512GB', 1, 7499.00, 1),
(1, 'Titânio Natural', '#D4D4D4', '1TB', 0, 8499.00, 1);

-- =====================================================
-- DADOS: CONFIGURAÇÕES
-- =====================================================
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('loja_nome', 'iPlace Seminovos', 'Nome da loja'),
('loja_telefone', '(11) 99999-9999', 'Telefone'),
('loja_whatsapp', '5511999999999', 'WhatsApp'),
('loja_email', 'contato@iplaceseminovos.com.br', 'Email'),
('frete_gratis_acima', '500', 'Valor mínimo para frete grátis'),
('parcelas_maximo', '12', 'Máximo de parcelas'),
('parcelas_sem_juros', '6', 'Parcelas sem juros');

SET FOREIGN_KEY_CHECKS = 1;
