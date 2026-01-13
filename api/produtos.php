<?php
/**
 * API Pública - Lista de Produtos
 * Endpoint: GET /api/produtos.php
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
    // Buscar produtos ativos com estoque
    $sql = "SELECT 
                p.id,
                p.sku,
                p.nome,
                p.slug,
                p.descricao,
                p.descricao_curta,
                p.categoria_id,
                c.nome as categoria_nome,
                c.slug as categoria_slug,
                p.condicao,
                p.condicao_descricao,
                p.preco,
                p.preco_original,
                p.desconto_percentual,
                p.estoque,
                p.garantia_meses,
                p.destaque,
                p.rating,
                p.reviews,
                p.parcelas,
                p.ativo,
                p.created_at,
                p.updated_at
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.ativo = 1 AND p.estoque > 0
            ORDER BY p.destaque DESC, p.created_at DESC";
    
    $result = $conexao->query($sql);
    
    if (!$result) {
        throw new Exception('Erro na consulta: ' . $conexao->error);
    }
    
    $produtos = [];
    
    while ($row = $result->fetch_assoc()) {
        $produtoId = intval($row['id']);
        
        // Buscar imagens do produto
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
        
        // Buscar especificações do produto
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
        
        // Mapear label da condição para exibição
        $condicaoLabelMap = [
            'novo' => 'Novos',
            'seminovo' => 'Seminovos',
            'usado_excelente' => 'Usado - Excelente',
            'usado_bom' => 'Usado - Bom',
            'recondicionado' => 'Recondicionados',
            'com_defeito' => 'Com Defeito'
        ];
        
        // Retorna o valor bruto da condição (usado para filtrar)
        $condition = $row['condicao'];
        // Label formatado para exibição
        $conditionLabel = $condicaoLabelMap[$row['condicao']] ?? ucfirst($row['condicao']);
        $conditionDescription = !empty($row['condicao_descricao']) ? $row['condicao_descricao'] : $conditionLabel;

        // Formatar produto para o frontend
        $produtos[] = [
            'id' => strval($row['id']),
            'sku' => $row['sku'],
            'name' => $row['nome'],
            'slug' => $row['slug'],
            'description' => $row['descricao'] ?? '',
            'shortDescription' => $row['descricao_curta'] ?? '',
            'category' => $row['categoria_nome'] ?? 'Outros',
            'categorySlug' => $row['categoria_slug'] ?? 'outros',
            'condition' => $condition,
            'conditionLabel' => $conditionLabel,
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
    }
    
    echo json_encode([
        'success' => true,
        'data' => $produtos,
        'total' => count($produtos)
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
