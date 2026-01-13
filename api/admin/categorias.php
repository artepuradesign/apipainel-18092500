<?php
/**
 * API CRUD de Categorias do Admin
 */

require_once 'config.php';

// Verificar autenticação
$usuario = verificarAuth();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        if ($id) {
            buscarCategoria($id);
        } else {
            listarCategorias();
        }
        break;
    case 'POST':
        criarCategoria();
        break;
    case 'PUT':
        if (!$id) responderErro('ID é obrigatório');
        atualizarCategoria($id);
        break;
    case 'DELETE':
        if (!$id) responderErro('ID é obrigatório');
        excluirCategoria($id);
        break;
    default:
        responderErro('Método não permitido', 405);
}

function listarCategorias() {
    $conexao = getConnection();
    $result = $conexao->query("SELECT * FROM categorias ORDER BY ordem, nome");
    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row;
    }
    $conexao->close();
    responderSucesso($categorias);
}

function buscarCategoria($id) {
    $conexao = getConnection();
    $stmt = $conexao->prepare("SELECT * FROM categorias WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        responderErro('Categoria não encontrada', 404);
    }
    
    $categoria = $result->fetch_assoc();
    $stmt->close();
    $conexao->close();
    responderSucesso($categoria);
}

function criarCategoria() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['nome'])) {
        responderErro('Nome é obrigatório');
    }
    
    $conexao = getConnection();
    
    $slug = gerarSlug($input['nome']);
    $descricao = $input['descricao'] ?? '';
    $imagem = $input['imagem'] ?? '';
    $ordem = $input['ordem'] ?? 0;
    $ativo = isset($input['ativo']) ? ($input['ativo'] ? 1 : 0) : 1;
    
    $stmt = $conexao->prepare("INSERT INTO categorias (nome, slug, descricao, imagem, ordem, ativo) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssii", $input['nome'], $slug, $descricao, $imagem, $ordem, $ativo);
    
    if (!$stmt->execute()) {
        responderErro('Erro ao criar categoria');
    }
    
    $id = $stmt->insert_id;
    $stmt->close();
    $conexao->close();
    
    responderSucesso(['id' => $id], 'Categoria criada com sucesso');
}

function atualizarCategoria($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $conexao = getConnection();
    
    $campos = [];
    $valores = [];
    $tipos = "";
    
    if (isset($input['nome'])) {
        $campos[] = "nome = ?";
        $valores[] = $input['nome'];
        $tipos .= "s";
        $campos[] = "slug = ?";
        $valores[] = gerarSlug($input['nome']);
        $tipos .= "s";
    }
    if (isset($input['descricao'])) { $campos[] = "descricao = ?"; $valores[] = $input['descricao']; $tipos .= "s"; }
    if (isset($input['imagem'])) { $campos[] = "imagem = ?"; $valores[] = $input['imagem']; $tipos .= "s"; }
    if (isset($input['ordem'])) { $campos[] = "ordem = ?"; $valores[] = intval($input['ordem']); $tipos .= "i"; }
    if (isset($input['ativo'])) { $campos[] = "ativo = ?"; $valores[] = $input['ativo'] ? 1 : 0; $tipos .= "i"; }
    
    if (count($campos) > 0) {
        $sql = "UPDATE categorias SET " . implode(", ", $campos) . " WHERE id = ?";
        $valores[] = $id;
        $tipos .= "i";
        
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param($tipos, ...$valores);
        $stmt->execute();
        $stmt->close();
    }
    
    $conexao->close();
    responderSucesso(['id' => $id], 'Categoria atualizada');
}

function excluirCategoria($id) {
    $conexao = getConnection();
    $stmt = $conexao->prepare("DELETE FROM categorias WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        responderErro('Categoria não encontrada', 404);
    }
    
    $stmt->close();
    $conexao->close();
    responderSucesso(null, 'Categoria excluída');
}

function gerarSlug($texto) {
    $texto = mb_strtolower($texto, 'UTF-8');
    $texto = preg_replace('/[áàãâä]/u', 'a', $texto);
    $texto = preg_replace('/[éèêë]/u', 'e', $texto);
    $texto = preg_replace('/[íìîï]/u', 'i', $texto);
    $texto = preg_replace('/[óòõôö]/u', 'o', $texto);
    $texto = preg_replace('/[úùûü]/u', 'u', $texto);
    $texto = preg_replace('/[ç]/u', 'c', $texto);
    $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
    return trim($texto, '-');
}
?>
