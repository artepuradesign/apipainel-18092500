<?php
/**
 * API CRUD de Produtos do Admin
 * GET    /admin/produtos.php - Lista todos os produtos
 * GET    /admin/produtos.php?id=X - Busca produto específico
 * POST   /admin/produtos.php - Criar novo produto
 * PUT    /admin/produtos.php?id=X - Atualizar produto
 * DELETE /admin/produtos.php?id=X - Excluir produto
 */

require_once 'config.php';

// Verificar autenticação
$usuario = verificarAuth();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        if ($id) {
            buscarProduto($id);
        } else {
            listarProdutos();
        }
        break;
    case 'POST':
        criarProduto();
        break;
    case 'PUT':
        if (!$id) {
            responderErro('ID do produto é obrigatório');
        }
        atualizarProduto($id);
        break;
    case 'DELETE':
        if (!$id) {
            responderErro('ID do produto é obrigatório');
        }
        excluirProduto($id);
        break;
    default:
        responderErro('Método não permitido', 405);
}

/**
 * Listar todos os produtos
 */
function listarProdutos() {
    $conexao = getConnection();
    
    $sql = "SELECT 
                p.*,
                c.nome as categoria_nome,
                c.slug as categoria_slug
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.created_at DESC";
    
    $result = $conexao->query($sql);
    $produtos = [];
    
    while ($row = $result->fetch_assoc()) {
        // Buscar imagens do produto
        $stmtImg = $conexao->prepare("SELECT id, url, ordem, principal FROM produto_imagens WHERE produto_id = ? ORDER BY ordem");
        $stmtImg->bind_param("i", $row['id']);
        $stmtImg->execute();
        $imgResult = $stmtImg->get_result();
        $imagens = [];
        while ($img = $imgResult->fetch_assoc()) {
            $imagens[] = [
                'id' => (int)$img['id'],
                'url' => $img['url'],
                'ordem' => (int)$img['ordem'],
                'principal' => (bool)$img['principal']
            ];
        }
        $stmtImg->close();
        
        // Buscar especificações
        $stmtSpec = $conexao->prepare("SELECT label, valor FROM produto_especificacoes WHERE produto_id = ? ORDER BY ordem");
        $stmtSpec->bind_param("i", $row['id']);
        $stmtSpec->execute();
        $specResult = $stmtSpec->get_result();
        $specs = [];
        while ($spec = $specResult->fetch_assoc()) {
            $specs[] = $spec;
        }
        $stmtSpec->close();
        
        $row['imagens'] = $imagens;
        $row['especificacoes'] = $specs;
        $produtos[] = $row;
    }
    
    $conexao->close();
    responderSucesso($produtos);
}

/**
 * Buscar produto específico
 */
function buscarProduto($id) {
    $conexao = getConnection();
    
    $stmt = $conexao->prepare("SELECT 
                p.*,
                c.nome as categoria_nome,
                c.slug as categoria_slug
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        $conexao->close();
        responderErro('Produto não encontrado', 404);
    }
    
    $produto = $result->fetch_assoc();
    $stmt->close();
    
    // Buscar imagens
    $stmtImg = $conexao->prepare("SELECT id, url, ordem, principal FROM produto_imagens WHERE produto_id = ? ORDER BY ordem");
    $stmtImg->bind_param("i", $id);
    $stmtImg->execute();
    $imgResult = $stmtImg->get_result();
    $imagens = [];
    while ($img = $imgResult->fetch_assoc()) {
        $imagens[] = [
            'id' => (int)$img['id'],
            'url' => $img['url'],
            'ordem' => (int)$img['ordem'],
            'principal' => (bool)$img['principal']
        ];
    }
    $stmtImg->close();
    
    // Buscar especificações
    $stmtSpec = $conexao->prepare("SELECT label, valor FROM produto_especificacoes WHERE produto_id = ? ORDER BY ordem");
    $stmtSpec->bind_param("i", $id);
    $stmtSpec->execute();
    $specResult = $stmtSpec->get_result();
    $specs = [];
    while ($spec = $specResult->fetch_assoc()) {
        $specs[] = $spec;
    }
    $stmtSpec->close();
    
    $produto['imagens'] = $imagens;
    $produto['especificacoes'] = $specs;
    
    $conexao->close();
    responderSucesso($produto);
}

/**
 * Criar novo produto
 */
function criarProduto() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validações
    if (empty($input['nome'])) {
        responderErro('Nome é obrigatório');
    }
    
    if (empty($input['preco']) || !is_numeric($input['preco'])) {
        responderErro('Preço é obrigatório e deve ser numérico');
    }
    
    $conexao = getConnection();
    
    // Gerar slug
    $slug = gerarSlug($input['nome']);
    
    // Verificar se slug já existe
    $stmtCheck = $conexao->prepare("SELECT id FROM produtos WHERE slug = ?");
    $stmtCheck->bind_param("s", $slug);
    $stmtCheck->execute();
    if ($stmtCheck->get_result()->num_rows > 0) {
        $slug .= '-' . time();
    }
    $stmtCheck->close();
    
    // Gerar SKU se não fornecido
    $sku = $input['sku'] ?? 'SKU' . time();
    
    // Inserir produto
    $stmt = $conexao->prepare("INSERT INTO produtos 
        (sku, nome, slug, descricao, descricao_curta, categoria_id, modelo, condicao, condicao_descricao, 
         preco, preco_original, desconto_percentual, estoque, garantia_meses, tela, camera, chip, destaque, parcelas, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $ativo = isset($input['ativo']) ? ($input['ativo'] ? 1 : 0) : 1;
    $destaque = isset($input['destaque']) ? ($input['destaque'] ? 1 : 0) : 0;
    $categoriaId = !empty($input['categoria_id']) ? intval($input['categoria_id']) : null;
    $modelo = $input['modelo'] ?? null;
    $condicao = $input['condicao'] ?? 'seminovo';
    $condicaoDescricao = $input['condicao_descricao'] ?? '';
    $descricao = $input['descricao'] ?? '';
    $descricaoCurta = $input['descricao_curta'] ?? '';
    $preco = floatval($input['preco']);
    $precoOriginal = !empty($input['preco_original']) ? floatval($input['preco_original']) : $preco;
    $desconto = !empty($input['desconto_percentual']) ? intval($input['desconto_percentual']) : 0;
    $estoque = !empty($input['estoque']) ? intval($input['estoque']) : 0;
    $garantia = !empty($input['garantia_meses']) ? intval($input['garantia_meses']) : 3;
    $tela = $input['tela'] ?? null;
    $camera = $input['camera'] ?? null;
    $chip = $input['chip'] ?? null;
    $parcelas = !empty($input['parcelas']) ? intval($input['parcelas']) : 12;
    
    $stmt->bind_param("sssssisssddiiisssiis", 
        $sku, $input['nome'], $slug, $descricao, $descricaoCurta, $categoriaId,
        $modelo, $condicao, $condicaoDescricao, $preco, $precoOriginal, $desconto,
        $estoque, $garantia, $tela, $camera, $chip, $destaque, $parcelas, $ativo
    );
    
    if (!$stmt->execute()) {
        $stmt->close();
        $conexao->close();
        responderErro('Erro ao criar produto: ' . $stmt->error);
    }
    
    $produtoId = $stmt->insert_id;
    $stmt->close();
    
    // Inserir imagens
    if (!empty($input['imagens']) && is_array($input['imagens'])) {
        $stmtImg = $conexao->prepare("INSERT INTO produto_imagens (produto_id, url, ordem, principal) VALUES (?, ?, ?, ?)");
        foreach ($input['imagens'] as $ordem => $url) {
            $principal = $ordem === 0 ? 1 : 0;
            $stmtImg->bind_param("isii", $produtoId, $url, $ordem, $principal);
            $stmtImg->execute();
        }
        $stmtImg->close();
    }
    
    // Inserir especificações
    if (!empty($input['especificacoes']) && is_array($input['especificacoes'])) {
        $stmtSpec = $conexao->prepare("INSERT INTO produto_especificacoes (produto_id, label, valor, ordem) VALUES (?, ?, ?, ?)");
        foreach ($input['especificacoes'] as $ordem => $spec) {
            if (!empty($spec['label']) && !empty($spec['valor'])) {
                $stmtSpec->bind_param("issi", $produtoId, $spec['label'], $spec['valor'], $ordem);
                $stmtSpec->execute();
            }
        }
        $stmtSpec->close();
    }
    
    $conexao->close();
    
    responderSucesso(['id' => $produtoId, 'slug' => $slug], 'Produto criado com sucesso');
}

/**
 * Atualizar produto
 */
function atualizarProduto($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $conexao = getConnection();
    
    // Verificar se produto existe
    $stmtCheck = $conexao->prepare("SELECT id FROM produtos WHERE id = ?");
    $stmtCheck->bind_param("i", $id);
    $stmtCheck->execute();
    if ($stmtCheck->get_result()->num_rows === 0) {
        $stmtCheck->close();
        $conexao->close();
        responderErro('Produto não encontrado', 404);
    }
    $stmtCheck->close();
    
    // Montar query de atualização
    $campos = [];
    $valores = [];
    $tipos = "";
    
    if (isset($input['nome'])) {
        $campos[] = "nome = ?";
        $valores[] = $input['nome'];
        $tipos .= "s";
        
        // Atualizar slug
        $slug = gerarSlug($input['nome']);
        $stmtSlug = $conexao->prepare("SELECT id FROM produtos WHERE slug = ? AND id != ?");
        $stmtSlug->bind_param("si", $slug, $id);
        $stmtSlug->execute();
        if ($stmtSlug->get_result()->num_rows > 0) {
            $slug .= '-' . $id;
        }
        $stmtSlug->close();
        $campos[] = "slug = ?";
        $valores[] = $slug;
        $tipos .= "s";
    }
    
    if (isset($input['sku'])) { $campos[] = "sku = ?"; $valores[] = $input['sku']; $tipos .= "s"; }
    if (isset($input['descricao'])) { $campos[] = "descricao = ?"; $valores[] = $input['descricao']; $tipos .= "s"; }
    if (isset($input['descricao_curta'])) { $campos[] = "descricao_curta = ?"; $valores[] = $input['descricao_curta']; $tipos .= "s"; }
    if (isset($input['categoria_id'])) { $campos[] = "categoria_id = ?"; $valores[] = intval($input['categoria_id']); $tipos .= "i"; }
    if (isset($input['modelo'])) { $campos[] = "modelo = ?"; $valores[] = $input['modelo']; $tipos .= "s"; }
    if (isset($input['condicao'])) { $campos[] = "condicao = ?"; $valores[] = $input['condicao']; $tipos .= "s"; }
    if (isset($input['condicao_descricao'])) { $campos[] = "condicao_descricao = ?"; $valores[] = $input['condicao_descricao']; $tipos .= "s"; }
    if (isset($input['preco'])) { $campos[] = "preco = ?"; $valores[] = floatval($input['preco']); $tipos .= "d"; }
    if (isset($input['preco_original'])) { $campos[] = "preco_original = ?"; $valores[] = floatval($input['preco_original']); $tipos .= "d"; }
    if (isset($input['desconto_percentual'])) { $campos[] = "desconto_percentual = ?"; $valores[] = intval($input['desconto_percentual']); $tipos .= "i"; }
    if (isset($input['estoque'])) { $campos[] = "estoque = ?"; $valores[] = intval($input['estoque']); $tipos .= "i"; }
    if (isset($input['garantia_meses'])) { $campos[] = "garantia_meses = ?"; $valores[] = intval($input['garantia_meses']); $tipos .= "i"; }
    if (isset($input['tela'])) { $campos[] = "tela = ?"; $valores[] = $input['tela']; $tipos .= "s"; }
    if (isset($input['camera'])) { $campos[] = "camera = ?"; $valores[] = $input['camera']; $tipos .= "s"; }
    if (isset($input['chip'])) { $campos[] = "chip = ?"; $valores[] = $input['chip']; $tipos .= "s"; }
    if (isset($input['destaque'])) { $campos[] = "destaque = ?"; $valores[] = $input['destaque'] ? 1 : 0; $tipos .= "i"; }
    if (isset($input['parcelas'])) { $campos[] = "parcelas = ?"; $valores[] = intval($input['parcelas']); $tipos .= "i"; }
    if (isset($input['ativo'])) { $campos[] = "ativo = ?"; $valores[] = $input['ativo'] ? 1 : 0; $tipos .= "i"; }
    
    if (count($campos) > 0) {
        $sql = "UPDATE produtos SET " . implode(", ", $campos) . " WHERE id = ?";
        $valores[] = $id;
        $tipos .= "i";
        
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param($tipos, ...$valores);
        
        if (!$stmt->execute()) {
            $stmt->close();
            $conexao->close();
            responderErro('Erro ao atualizar produto: ' . $stmt->error);
        }
        $stmt->close();
    }
    
    // Atualizar imagens
    if (isset($input['imagens']) && is_array($input['imagens'])) {
        // Remover imagens antigas
        $stmtDel = $conexao->prepare("DELETE FROM produto_imagens WHERE produto_id = ?");
        $stmtDel->bind_param("i", $id);
        $stmtDel->execute();
        $stmtDel->close();
        
        // Inserir novas
        $stmtImg = $conexao->prepare("INSERT INTO produto_imagens (produto_id, url, ordem, principal) VALUES (?, ?, ?, ?)");
        foreach ($input['imagens'] as $ordem => $url) {
            $principal = $ordem === 0 ? 1 : 0;
            $stmtImg->bind_param("isii", $id, $url, $ordem, $principal);
            $stmtImg->execute();
        }
        $stmtImg->close();
    }
    
    // Atualizar especificações
    if (isset($input['especificacoes']) && is_array($input['especificacoes'])) {
        // Remover antigas
        $stmtDel = $conexao->prepare("DELETE FROM produto_especificacoes WHERE produto_id = ?");
        $stmtDel->bind_param("i", $id);
        $stmtDel->execute();
        $stmtDel->close();
        
        // Inserir novas
        $stmtSpec = $conexao->prepare("INSERT INTO produto_especificacoes (produto_id, label, valor, ordem) VALUES (?, ?, ?, ?)");
        foreach ($input['especificacoes'] as $ordem => $spec) {
            if (!empty($spec['label']) && !empty($spec['valor'])) {
                $stmtSpec->bind_param("issi", $id, $spec['label'], $spec['valor'], $ordem);
                $stmtSpec->execute();
            }
        }
        $stmtSpec->close();
    }
    
    $conexao->close();
    
    responderSucesso(['id' => $id], 'Produto atualizado com sucesso');
}

/**
 * Excluir produto
 */
function excluirProduto($id) {
    $conexao = getConnection();
    
    $stmt = $conexao->prepare("DELETE FROM produtos WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if (!$stmt->execute()) {
        $stmt->close();
        $conexao->close();
        responderErro('Erro ao excluir produto');
    }
    
    if ($stmt->affected_rows === 0) {
        $stmt->close();
        $conexao->close();
        responderErro('Produto não encontrado', 404);
    }
    
    $stmt->close();
    $conexao->close();
    
    responderSucesso(null, 'Produto excluído com sucesso');
}

/**
 * Gerar slug a partir do nome
 */
function gerarSlug($texto) {
    $texto = mb_strtolower($texto, 'UTF-8');
    $texto = preg_replace('/[áàãâä]/u', 'a', $texto);
    $texto = preg_replace('/[éèêë]/u', 'e', $texto);
    $texto = preg_replace('/[íìîï]/u', 'i', $texto);
    $texto = preg_replace('/[óòõôö]/u', 'o', $texto);
    $texto = preg_replace('/[úùûü]/u', 'u', $texto);
    $texto = preg_replace('/[ç]/u', 'c', $texto);
    $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
    $texto = trim($texto, '-');
    return $texto;
}
?>
