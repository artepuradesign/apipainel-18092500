# API PHP para Produtos

## Instruções de Instalação

### 1. Faça upload dos arquivos para seu servidor

Copie todos os arquivos desta pasta para seu servidor de hospedagem:
- `conexao.php` - Configuração da conexão com o banco
- `produtos.php` - Lista todos os produtos
- `produto.php` - Retorna um produto específico

### 2. Configure a conexão

Edite o arquivo `conexao.php` e altere a senha:

```php
$senha = 'SUA_NOVA_SENHA'; // Coloque sua nova senha aqui
```

### 3. Ajuste a estrutura da tabela

Os arquivos assumem uma tabela `produtos` com as seguintes colunas:
- `id` (INT)
- `nome` (VARCHAR)
- `descricao` (TEXT)
- `preco` (DECIMAL)
- `preco_promocional` (DECIMAL, nullable)
- `imagem` (VARCHAR)
- `categoria` (VARCHAR)
- `estoque` (INT)
- `ativo` (TINYINT)

**Se sua tabela tiver nomes diferentes**, edite os arquivos `produtos.php` e `produto.php`.

### 4. Endpoints disponíveis

Após o upload, você terá os seguintes endpoints:

| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `https://seusite.com/api/produtos.php` | Lista todos os produtos |
| GET | `https://seusite.com/api/produto.php?id=123` | Retorna produto específico |

### 5. Configure a URL no React

Após hospedar os arquivos, você precisa informar a URL da API no projeto React.

Exemplo de resposta:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "iPhone 15",
      "descricao": "Smartphone Apple",
      "preco": 5999.00,
      "preco_promocional": 5499.00,
      "imagem": "https://seusite.com/imagens/iphone15.jpg",
      "categoria": "Celulares",
      "estoque": 10
    }
  ],
  "total": 1
}
```
