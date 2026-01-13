<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexao.php';

/**
 * API de Pedidos
 *
 * GET  /api/pedidos.php?email=xxx   - Buscar pedidos por email do cliente
 * GET  /api/pedidos.php?numero=xxx  - Buscar pedido por número
 * POST /api/pedidos.php             - Criar novo pedido
 * PUT  /api/pedidos.php?numero=xxx  - Atualizar status do pedido
 */

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            handleGet($conexao);
            break;
        case 'POST':
            handlePost($conexao);
            break;
        case 'PUT':
            handlePut($conexao);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

function handleGet($conexao) {
    // Buscar por usuario_id
    if (isset($_GET['usuario_id'])) {
        $usuarioId = (int)$_GET['usuario_id'];

        $stmt = $conexao->prepare("SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY created_at DESC");
        $stmt->bind_param('i', $usuarioId);
        $stmt->execute();
        $result = $stmt->get_result();

        $pedidos = [];
        while ($pedido = $result->fetch_assoc()) {
            $pedido['itens'] = fetchItensPedido($conexao, (int)$pedido['id']);
            $pedidos[] = $pedido;
        }

        $stmt->close();

        echo json_encode(['success' => true, 'data' => $pedidos], JSON_UNESCAPED_UNICODE);
        return;
    }

    // Buscar por email
    if (isset($_GET['email'])) {
        $email = trim($_GET['email']);

        $stmt = $conexao->prepare("SELECT * FROM pedidos WHERE email_cliente = ? ORDER BY created_at DESC");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();

        $pedidos = [];
        while ($pedido = $result->fetch_assoc()) {
            $pedido['itens'] = fetchItensPedido($conexao, (int)$pedido['id']);
            $pedidos[] = $pedido;
        }

        $stmt->close();

        echo json_encode(['success' => true, 'data' => $pedidos], JSON_UNESCAPED_UNICODE);
        return;
    }

    // Buscar por número do pedido
    if (isset($_GET['numero'])) {
        $numero = trim($_GET['numero']);

        $stmt = $conexao->prepare("SELECT * FROM pedidos WHERE numero = ? LIMIT 1");
        $stmt->bind_param('s', $numero);
        $stmt->execute();
        $result = $stmt->get_result();

        $pedido = $result->fetch_assoc();
        $stmt->close();

        if (!$pedido) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Pedido não encontrado'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $pedido['itens'] = fetchItensPedido($conexao, (int)$pedido['id']);

        echo json_encode(['success' => true, 'data' => $pedido], JSON_UNESCAPED_UNICODE);
        return;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parâmetro email ou numero é obrigatório'], JSON_UNESCAPED_UNICODE);
}

function fetchItensPedido($conexao, int $pedidoId): array {
    $stmt = $conexao->prepare("SELECT 
        id,
        produto_id,
        produto_nome as nome,
        produto_sku as sku,
        produto_imagem as imagem,
        quantidade,
        preco_unitario,
        subtotal
      FROM pedido_itens
      WHERE pedido_id = ?");

    $stmt->bind_param('i', $pedidoId);
    $stmt->execute();
    $result = $stmt->get_result();

    $itens = [];
    while ($item = $result->fetch_assoc()) {
        $itens[] = $item;
    }

    $stmt->close();
    return $itens;
}

function handlePost($conexao) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dados inválidos'], JSON_UNESCAPED_UNICODE);
        return;
    }

    // Validar campos obrigatórios
    $required = ['nome_cliente', 'email_cliente', 'itens', 'total', 'forma_pagamento'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === '' || $input[$field] === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => "Campo obrigatório: $field"], JSON_UNESCAPED_UNICODE);
            return;
        }
    }

    if (!is_array($input['itens']) || count($input['itens']) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Itens do pedido são obrigatórios'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $numero = generateOrderNumber($conexao);

    // Compatibilidade: alguns frontends mandam "aguardando_pagamento"
    $status = $input['status'] ?? 'pendente';
    if ($status === 'aguardando_pagamento') {
        $status = 'pendente';
    }

    $usuarioId = isset($input['usuario_id']) ? (string)$input['usuario_id'] : null;
    $telefone = $input['telefone_cliente'] ?? null;
    $cpf = $input['cpf_cliente'] ?? null;

    $endereco = $input['endereco'] ?? [];
    $endCep = $endereco['cep'] ?? null;
    $endLogradouro = $endereco['logradouro'] ?? null;
    $endNumero = $endereco['numero'] ?? null;
    $endComplemento = $endereco['complemento'] ?? null;
    $endBairro = $endereco['bairro'] ?? null;
    $endCidade = $endereco['cidade'] ?? null;
    $endEstado = $endereco['estado'] ?? null;

    $subtotal = isset($input['subtotal']) ? (float)$input['subtotal'] : (float)$input['total'];
    $desconto = isset($input['desconto']) ? (float)$input['desconto'] : 0.0;
    $frete = isset($input['frete']) ? (float)$input['frete'] : 0.0;
    $total = (float)$input['total'];

    $formaPagamento = $input['forma_pagamento'];
    $observacoes = $input['observacoes'] ?? null;

    $conexao->begin_transaction();

    try {
        $stmt = $conexao->prepare("INSERT INTO pedidos (
            numero,
            usuario_id,
            nome_cliente,
            email_cliente,
            telefone_cliente,
            cpf_cliente,
            endereco_cep,
            endereco_logradouro,
            endereco_numero,
            endereco_complemento,
            endereco_bairro,
            endereco_cidade,
            endereco_estado,
            subtotal,
            desconto,
            frete,
            total,
            forma_pagamento,
            status,
            observacoes
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");

        // bind_param por referência: criar variáveis "primitivas"
        $vNumero = (string)$numero;
        $vUsuarioId = $usuarioId; // pode ser null
        $vNome = (string)$input['nome_cliente'];
        $vEmail = (string)$input['email_cliente'];
        $vTelefone = $telefone;
        $vCpf = $cpf;
        $vCep = $endCep;
        $vLogradouro = $endLogradouro;
        $vEndNumero = $endNumero;
        $vComplemento = $endComplemento;
        $vBairro = $endBairro;
        $vCidade = $endCidade;
        $vEstado = $endEstado;
        $vSubtotal = number_format($subtotal, 2, '.', '');
        $vDesconto = number_format($desconto, 2, '.', '');
        $vFrete = number_format($frete, 2, '.', '');
        $vTotal = number_format($total, 2, '.', '');
        $vForma = (string)$formaPagamento;
        $vStatus = (string)$status;
        $vObs = $observacoes;

        // usar tudo como string para evitar problemas de tipagem/NULL
        $stmt->bind_param(
            str_repeat('s', 20),
            $vNumero,
            $vUsuarioId,
            $vNome,
            $vEmail,
            $vTelefone,
            $vCpf,
            $vCep,
            $vLogradouro,
            $vEndNumero,
            $vComplemento,
            $vBairro,
            $vCidade,
            $vEstado,
            $vSubtotal,
            $vDesconto,
            $vFrete,
            $vTotal,
            $vForma,
            $vStatus,
            $vObs
        );

        if (!$stmt->execute()) {
            throw new Exception('Erro ao inserir pedido: ' . $stmt->error);
        }

        $pedidoId = (int)$conexao->insert_id;
        $stmt->close();

        $stmtItem = $conexao->prepare("INSERT INTO pedido_itens (
            pedido_id,
            produto_id,
            produto_nome,
            produto_sku,
            produto_imagem,
            quantidade,
            preco_unitario,
            subtotal
        ) VALUES (?,?,?,?,?,?,?,?)");

        // Preparar statement para descontar estoque
        $stmtEstoque = $conexao->prepare("UPDATE produtos SET estoque = GREATEST(estoque - ?, 0) WHERE id = ?");

        foreach ($input['itens'] as $item) {
            $produtoId = $item['produto_id'] ?? $item['id'] ?? null;
            $produtoNome = $item['nome'] ?? $item['name'] ?? 'Produto';
            $produtoSku = $item['sku'] ?? null;
            $produtoImagem = $item['imagem'] ?? $item['image'] ?? null;
            $quantidade = (int)($item['quantidade'] ?? $item['quantity'] ?? 1);
            $precoUnit = (float)($item['preco_unitario'] ?? $item['price'] ?? 0);
            $subtotalItem = $precoUnit * $quantidade;

            $vPedidoId = (string)$pedidoId;
            $vProdutoId = $produtoId !== null ? (string)$produtoId : null;
            $vProdutoNome = (string)$produtoNome;
            $vProdutoSku = $produtoSku !== null ? (string)$produtoSku : null;
            $vProdutoImagem = $produtoImagem !== null ? (string)$produtoImagem : null;
            $vQtd = (string)$quantidade;
            $vPrecoUnit = number_format($precoUnit, 2, '.', '');
            $vSubItem = number_format($subtotalItem, 2, '.', '');

            $stmtItem->bind_param(
                'ssssssss',
                $vPedidoId,
                $vProdutoId,
                $vProdutoNome,
                $vProdutoSku,
                $vProdutoImagem,
                $vQtd,
                $vPrecoUnit,
                $vSubItem
            );

            if (!$stmtItem->execute()) {
                throw new Exception('Erro ao inserir item: ' . $stmtItem->error);
            }

            // Descontar estoque do produto
            if ($produtoId !== null) {
                $stmtEstoque->bind_param('ii', $quantidade, $produtoId);
                $stmtEstoque->execute();
            }
        }
        
        $stmtEstoque->close();

        $stmtItem->close();
        $conexao->commit();

        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $pedidoId,
                'numero' => $numero
            ],
            'message' => 'Pedido criado com sucesso'
        ], JSON_UNESCAPED_UNICODE);

    } catch (Throwable $e) {
        $conexao->rollback();
        throw $e;
    }
}

function handlePut($conexao) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dados inválidos'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $pedidoNumero = null;
    if (isset($_GET['numero'])) {
        $pedidoNumero = trim($_GET['numero']);
    } elseif (isset($input['numero'])) {
        $pedidoNumero = trim($input['numero']);
    }

    if (!$pedidoNumero) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Número do pedido é obrigatório'], JSON_UNESCAPED_UNICODE);
        return;
    }

    if (!isset($input['status']) || !$input['status']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Status é obrigatório'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $status = $input['status'];
    if ($status === 'aguardando_pagamento') {
        $status = 'pendente';
    }

    $stmt = $conexao->prepare("UPDATE pedidos SET status = ?, updated_at = NOW() WHERE numero = ?");
    $stmt->bind_param('ss', $status, $pedidoNumero);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao atualizar pedido'], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        return;
    }

    if ($stmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Pedido não encontrado'], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        return;
    }

    $stmt->close();

    echo json_encode([
        'success' => true,
        'data' => ['numero' => $pedidoNumero, 'status' => $status],
        'message' => 'Pedido atualizado com sucesso'
    ], JSON_UNESCAPED_UNICODE);
}

function generateOrderNumber($conexao) {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $attempts = 0;
    $maxAttempts = 10;

    do {
        $numero = '';
        for ($i = 0; $i < 6; $i++) {
            $numero .= $characters[rand(0, strlen($characters) - 1)];
        }

        $stmt = $conexao->prepare("SELECT COUNT(*) as c FROM pedidos WHERE numero = ?");
        $stmt->bind_param('s', $numero);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        $exists = ((int)($row['c'] ?? 0)) > 0;
        $attempts++;

    } while ($exists && $attempts < $maxAttempts);

    if ($attempts >= $maxAttempts) {
        $numero = strtoupper(substr(md5(time() . rand()), 0, 6));
    }

    return $numero;
}
