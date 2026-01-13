<?php
/**
 * API Pública - Variações de Produto
 * Endpoint: GET /api/produto_variacoes.php?produto_id=xxx
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
    $produtoId = isset($_GET['produto_id']) ? intval($_GET['produto_id']) : null;
    
    if (!$produtoId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'ID do produto é obrigatório'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Buscar todas as variações do produto
    $sql = "SELECT id, cor, cor_codigo, capacidade, estoque, preco, ativo 
            FROM produto_variacoes 
            WHERE produto_id = ? 
            ORDER BY capacidade ASC, cor ASC";
    
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('i', $produtoId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $variacoes = [];
    $cores = [];
    $capacidades = [];
    $coresMap = [];
    $capacidadesMap = [];
    
    while ($row = $result->fetch_assoc()) {
        $variacao = [
            'id' => intval($row['id']),
            'color' => $row['cor'],
            'colorCode' => $row['cor_codigo'],
            'capacity' => $row['capacidade'],
            'stock' => intval($row['estoque']),
            'price' => floatval($row['preco']),
            'available' => intval($row['estoque']) > 0 && $row['ativo'] == 1
        ];
        $variacoes[] = $variacao;
        
        // Agrupar cores únicas
        if ($row['cor'] && !isset($coresMap[$row['cor']])) {
            $hasStock = false;
            $coresMap[$row['cor']] = [
                'name' => $row['cor'],
                'code' => $row['cor_codigo'],
                'available' => false
            ];
        }
        if ($row['cor'] && intval($row['estoque']) > 0) {
            $coresMap[$row['cor']]['available'] = true;
        }
        
        // Agrupar capacidades únicas
        if ($row['capacidade'] && !isset($capacidadesMap[$row['capacidade']])) {
            $capacidadesMap[$row['capacidade']] = [
                'value' => $row['capacidade'],
                'available' => false
            ];
        }
        if ($row['capacidade'] && intval($row['estoque']) > 0) {
            $capacidadesMap[$row['capacidade']]['available'] = true;
        }
    }
    $stmt->close();
    
    // Converter maps para arrays
    $cores = array_values($coresMap);
    $capacidades = array_values($capacidadesMap);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'variations' => $variacoes,
            'colors' => $cores,
            'capacities' => $capacidades
        ]
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
