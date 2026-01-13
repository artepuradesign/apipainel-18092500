<?php
/**
 * Arquivo de configuração e conexão com o banco de dados
 * IMPORTANTE: Configure a senha antes de fazer upload
 */

// Configurações do banco de dados
$host = '45.151.120.2';
$usuario = 'u617342185_iplace';
$banco = 'u617342185_iplace';
$senha = 'Acerola@2026'; // TROQUE PELA SUA SENHA

// Criar conexão
$conexao = new mysqli($host, $usuario, $senha, $banco);

// Verificar conexão
if ($conexao->connect_error) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'error' => 'Erro na conexão com o banco de dados'
    ]));
}

// Definir charset
$conexao->set_charset("utf8mb4");
?>
