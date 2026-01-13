<?php
/**
 * API de Categorias
 * GET /categorias.php - Lista todas as categorias ativas
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
    $query = "SELECT id, nome, slug, descricao, imagem, ordem 
              FROM categorias 
              WHERE ativo = 1 
              ORDER BY ordem ASC, nome ASC";
    
    $result = $conexao->query($query);
    
    if (!$result) {
        throw new Exception('Erro ao buscar categorias');
    }
    
    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = [
            'id' => (int)$row['id'],
            'name' => $row['nome'],
            'slug' => $row['slug'],
            'description' => $row['descricao'],
            'image' => $row['imagem'],
            'order' => (int)$row['ordem']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $categorias,
        'total' => count($categorias)
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
