<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexao.php';

/**
 * API de Configurações
 * 
 * GET /api/configuracoes.php - Retorna todas as configurações
 */

try {
    $stmt = $pdo->query("SELECT chave, valor FROM configuracoes");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Converter para objeto chave-valor
    $config = [];
    foreach ($rows as $row) {
        $config[$row['chave']] = $row['valor'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $config
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
