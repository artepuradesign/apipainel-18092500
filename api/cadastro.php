<?php
/**
 * API de Cadastro de Usuários
 * POST /cadastro.php
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

$nome = trim($input['nome'] ?? '');
$email = trim($input['email'] ?? '');
$senha = $input['senha'] ?? '';
$telefone = trim($input['telefone'] ?? '');
$cpf = trim($input['cpf'] ?? '');

// Validações
if (empty($nome)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nome é obrigatório']);
    exit();
}

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email é obrigatório']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email inválido']);
    exit();
}

if (empty($senha)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Senha é obrigatória']);
    exit();
}

if (strlen($senha) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Senha deve ter pelo menos 6 caracteres']);
    exit();
}

// Verificar se email já existe
$stmt = $conexao->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt->close();
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'Este email já está cadastrado']);
    exit();
}
$stmt->close();

// Hash da senha
$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

// Inserir usuário
$stmt = $conexao->prepare("INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo, ativo) VALUES (?, ?, ?, ?, ?, 'cliente', 1)");
$stmt->bind_param("sssss", $nome, $email, $senhaHash, $telefone, $cpf);

if ($stmt->execute()) {
    $userId = $conexao->insert_id;
    $stmt->close();
    
    // Gerar token
    $token = base64_encode($userId . ':' . time());
    
    echo json_encode([
        'success' => true,
        'message' => 'Cadastro realizado com sucesso',
        'data' => [
            'token' => $token,
            'usuario' => [
                'id' => $userId,
                'nome' => $nome,
                'email' => $email,
                'tipo' => 'cliente'
            ]
        ]
    ]);
} else {
    $stmt->close();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar usuário']);
}

$conexao->close();
?>
