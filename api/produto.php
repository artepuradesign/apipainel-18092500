<?php
/**
 * API Pública - Produto Individual
 * Endpoint: GET /api/produto.php?id=xxx ou /api/produto.php?slug=xxx
 * Tabelas em português (iplace_novo.sql)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexao.php';

try {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
    
    if (!$id && !$slug) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'ID ou slug do produto é obrigatório'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Buscar produto
    if ($id) {
        $sql = "SELECT 
                    p.*, 
                    c.nome as categoria_nome,
                    c.slug as categoria_slug
                FROM produtos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE p.id = ? AND p.ativo = 1";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param('i', $id);
    } else {
        $sql = "SELECT 
                    p.*,
                    c.nome as categoria_nome,
                    c.slug as categoria_slug
                FROM produtos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE p.slug = ? AND p.ativo = 1";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param('s', $slug);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    
    if (!$row) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Produto não encontrado'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $produtoId = intval($row['id']);
    
    // Buscar imagens
    $sqlImagens = "SELECT url, principal FROM produto_imagens WHERE produto_id = ? ORDER BY principal DESC, ordem ASC";
    $stmtImagens = $conexao->prepare($sqlImagens);
    $stmtImagens->bind_param('i', $produtoId);
    $stmtImagens->execute();
    $resultImagens = $stmtImagens->get_result();
    
    $imagens = [];
    while ($img = $resultImagens->fetch_assoc()) {
        $imagens[] = $img['url'];
    }
    $stmtImagens->close();
    
    // Se não tiver imagens, usar placeholder
    if (empty($imagens)) {
        $imagens[] = '/placeholder.svg';
    }
    
    // Buscar especificações
    $sqlSpecs = "SELECT label, valor FROM produto_especificacoes WHERE produto_id = ? ORDER BY ordem ASC";
    $stmtSpecs = $conexao->prepare($sqlSpecs);
    $stmtSpecs->bind_param('i', $produtoId);
    $stmtSpecs->execute();
    $resultSpecs = $stmtSpecs->get_result();
    
    $specs = [];
    while ($spec = $resultSpecs->fetch_assoc()) {
        $specs[] = [
            'label' => $spec['label'],
            'value' => $spec['valor']
        ];
    }
    $stmtSpecs->close();
    
    $condicaoLabelMap = [
        'novo' => 'Novo',
        'seminovo' => 'Seminovo',
        'usado' => 'Usado'
    ];
    
    $condition = $condicaoLabelMap[$row['condicao']] ?? $row['condicao'];
    $conditionDescription = !empty($row['condicao_descricao']) ? $row['condicao_descricao'] : $condition;

    // Formatar produto
    $produto = [
        'id' => strval($row['id']),
        'sku' => $row['sku'],
        'name' => $row['nome'],
        'slug' => $row['slug'],
        'description' => $row['descricao'] ?? '',
        'shortDescription' => $row['descricao_curta'] ?? '',
        'category' => $row['categoria_nome'] ?? 'Outros',
        'categorySlug' => $row['categoria_slug'] ?? 'outros',
        'condition' => $condition,
        'conditionDescription' => $conditionDescription,
        'price' => floatval($row['preco']),
        'originalPrice' => floatval($row['preco_original'] ?? $row['preco']),
        'discountPercent' => intval($row['desconto_percentual'] ?? 0),
        'stock' => intval($row['estoque']),
        'images' => $imagens,
        'warrantyMonths' => intval($row['garantia_meses'] ?? 3),
        'isFeatured' => (bool)$row['destaque'],
        'rating' => floatval($row['rating'] ?? 5.0),
        'reviews' => intval($row['reviews'] ?? 0),
        'specs' => $specs,
        'installments' => intval($row['parcelas'] ?? 12)
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $produto
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conexao->close();
?>
