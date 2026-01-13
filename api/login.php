<?php
/**
 * API de Login de Usuários
 * POST /login.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexao.php';

// Apenas POST é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit();
}

// Obter dados do corpo da requisição
$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['email'] ?? '');
$senha = $input['senha'] ?? '';

// Validações
if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email é obrigatório']);
    exit();
}

if (empty($senha)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Senha é obrigatória']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email inválido']);
    exit();
}

// Buscar usuário
$stmt = $conexao->prepare("SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ? AND ativo = 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conexao->close();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Email ou senha inválidos']);
    exit();
}

$usuario = $result->fetch_assoc();
$stmt->close();
$conexao->close();

// Verificar senha
if (!password_verify($senha, $usuario['senha'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Email ou senha inválidos']);
    exit();
}

// Gerar token
$token = base64_encode($usuario['id'] . ':' . time());

// Retornar dados do usuário
echo json_encode([
    'success' => true,
    'message' => 'Login realizado com sucesso',
    'data' => [
        'token' => $token,
        'usuario' => [
            'id' => $usuario['id'],
            'nome' => $usuario['nome'],
            'email' => $usuario['email'],
            'tipo' => $usuario['tipo']
        ]
    ]
]);
?>
