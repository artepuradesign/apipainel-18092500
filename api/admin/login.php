<?php
/**
 * API de Login do Admin
 * POST /admin/login.php
 */

require_once 'config.php';

// Apenas POST é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderErro('Método não permitido', 405);
}

// Obter dados do corpo da requisição
$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['email'] ?? '');
$senha = $input['senha'] ?? '';

// Validações
if (empty($email)) {
    responderErro('Email é obrigatório');
}

if (empty($senha)) {
    responderErro('Senha é obrigatória');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responderErro('Email inválido');
}

// Buscar usuário
$conexao = getConnection();
$stmt = $conexao->prepare("SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ? AND tipo = 'admin' AND ativo = 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conexao->close();
    responderErro('Email ou senha inválidos', 401);
}

$usuario = $result->fetch_assoc();
$stmt->close();
$conexao->close();

// Verificar senha
if (!password_verify($senha, $usuario['senha'])) {
    responderErro('Email ou senha inválidos', 401);
}

// Gerar token simples (base64 do ID:timestamp)
$token = base64_encode($usuario['id'] . ':' . time());

// Retornar dados do usuário
responderSucesso([
    'token' => $token,
    'usuario' => [
        'id' => $usuario['id'],
        'nome' => $usuario['nome'],
        'email' => $usuario['email'],
        'tipo' => $usuario['tipo']
    ]
], 'Login realizado com sucesso');
?>
