import { API_BASE_URL } from './api';

export interface PedidoItem {
  id?: number;
  produto_id?: number;
  nome: string;
  sku?: string;
  imagem?: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  numero: string;
  usuario_id?: number;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente?: string;
  cpf_cliente?: string;
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  forma_pagamento: 'pix' | 'cartao' | 'boleto';
  status: 'aguardando_pagamento' | 'pendente' | 'pago' | 'preparando' | 'enviado' | 'entregue' | 'cancelado';
  codigo_rastreio?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  itens: PedidoItem[];
}

export interface CreatePedidoData {
  usuario_id?: number;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente?: string;
  cpf_cliente?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  subtotal: number;
  desconto?: number;
  frete?: number;
  total: number;
  forma_pagamento: 'pix' | 'cartao' | 'boleto';
  status?: 'aguardando_pagamento' | 'pendente' | 'pago';
  observacoes?: string;
  itens: Array<{
    id?: number;
    produto_id?: number;
    nome?: string;
    name?: string;
    sku?: string;
    imagem?: string;
    image?: string;
    quantidade?: number;
    quantity?: number;
    preco_unitario?: number;
    price?: number;
  }>;
}

// Criar novo pedido
export const createPedido = async (data: CreatePedidoData): Promise<{ id: number; numero: string }> => {
  const response = await fetch(`${API_BASE_URL}/pedidos.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar pedido');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao criar pedido');
  }

  return result.data;
};

// Buscar pedidos por email
export const fetchPedidosByEmail = async (email: string): Promise<Pedido[]> => {
  const response = await fetch(`${API_BASE_URL}/pedidos.php?email=${encodeURIComponent(email)}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar pedidos');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar pedidos');
  }

  return result.data;
};

// Buscar pedidos por usuario_id
export const fetchPedidosByUsuarioId = async (usuarioId: number): Promise<Pedido[]> => {
  const response = await fetch(`${API_BASE_URL}/pedidos.php?usuario_id=${usuarioId}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar pedidos');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar pedidos');
  }

  return result.data;
};

// Buscar pedido por número
export const fetchPedidoByNumero = async (numero: string): Promise<Pedido | null> => {
  const response = await fetch(`${API_BASE_URL}/pedidos.php?numero=${encodeURIComponent(numero)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Erro ao buscar pedido');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar pedido');
  }

  return result.data;
};

// Atualizar status do pedido
export const updatePedidoStatus = async (
  numero: string,
  status: 'aguardando_pagamento' | 'pago' | 'pendente' | 'preparando' | 'enviado' | 'entregue' | 'cancelado'
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/pedidos.php?numero=${encodeURIComponent(numero)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao atualizar pedido');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Erro ao atualizar pedido');
  }
};
