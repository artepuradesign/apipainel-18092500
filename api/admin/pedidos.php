<?php
/**
 * API de Pedidos do Admin
 */

require_once 'config.php';

// Verificar autenticação
$usuario = verificarAuth();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        if ($id) {
            buscarPedido($id);
        } else {
            listarPedidos();
        }
        break;
    case 'PUT':
        if (!$id) responderErro('ID é obrigatório');
        atualizarPedido($id);
        break;
    default:
        responderErro('Método não permitido', 405);
}

function listarPedidos() {
    $conexao = getConnection();
    
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $limite = isset($_GET['limite']) ? intval($_GET['limite']) : 50;
    $pagina = isset($_GET['pagina']) ? intval($_GET['pagina']) : 1;
    $offset = ($pagina - 1) * $limite;
    
    $where = "";
    if ($status) {
        $where = "WHERE status = '" . $conexao->real_escape_string($status) . "'";
    }
    
    $sql = "SELECT * FROM pedidos $where ORDER BY created_at DESC LIMIT $limite OFFSET $offset";
    $result = $conexao->query($sql);
    
    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        $pedidos[] = $row;
    }
    
    // Total
    $sqlTotal = "SELECT COUNT(*) as total FROM pedidos $where";
    $totalResult = $conexao->query($sqlTotal);
    $total = $totalResult->fetch_assoc()['total'];
    
    $conexao->close();
    
    responderSucesso([
        'pedidos' => $pedidos,
        'total' => intval($total),
        'pagina' => $pagina,
        'limite' => $limite
    ]);
}

function buscarPedido($id) {
    $conexao = getConnection();
    
    $stmt = $conexao->prepare("SELECT * FROM pedidos WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        responderErro('Pedido não encontrado', 404);
    }
    
    $pedido = $result->fetch_assoc();
    $stmt->close();
    
    // Buscar itens
    $stmtItens = $conexao->prepare("SELECT * FROM pedido_itens WHERE pedido_id = ?");
    $stmtItens->bind_param("i", $id);
    $stmtItens->execute();
    $itensResult = $stmtItens->get_result();
    
    $itens = [];
    while ($item = $itensResult->fetch_assoc()) {
        $itens[] = $item;
    }
    $stmtItens->close();
    
    $pedido['itens'] = $itens;
    
    $conexao->close();
    responderSucesso($pedido);
}

function atualizarPedido($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $conexao = getConnection();
    
    $campos = [];
    $valores = [];
    $tipos = "";
    
    if (isset($input['status'])) { 
        $campos[] = "status = ?"; 
        $valores[] = $input['status']; 
        $tipos .= "s"; 
    }
    if (isset($input['codigo_rastreio'])) { 
        $campos[] = "codigo_rastreio = ?"; 
        $valores[] = $input['codigo_rastreio']; 
        $tipos .= "s"; 
    }
    if (isset($input['observacoes'])) { 
        $campos[] = "observacoes = ?"; 
        $valores[] = $input['observacoes']; 
        $tipos .= "s"; 
    }
    
    if (count($campos) > 0) {
        $sql = "UPDATE pedidos SET " . implode(", ", $campos) . " WHERE id = ?";
        $valores[] = $id;
        $tipos .= "i";
        
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param($tipos, ...$valores);
        
        if (!$stmt->execute()) {
            responderErro('Erro ao atualizar pedido');
        }
        
        if ($stmt->affected_rows === 0) {
            responderErro('Pedido não encontrado', 404);
        }
        
        $stmt->close();
    }
    
    $conexao->close();
    responderSucesso(['id' => $id], 'Pedido atualizado');
}
?>
