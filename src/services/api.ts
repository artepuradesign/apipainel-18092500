// URL base da API PHP
export const API_BASE_URL = 'https://iplaceseminovos.apipainel.com.br/api';

// Interface do produto vindo da API (já normalizada pelo PHP)
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  categorySlug: string;
  condition: string;
  conditionLabel: string;
  conditionDescription: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  stock: number;
  images: string[];
  warrantyMonths: number;
  isFeatured: boolean;
  rating: number;
  reviews: number;
  specs: { label: string; value: string }[];
  installments: number;
  // Campos legados para compatibilidade
  oldPrice: number;
  newPrice: number;
  color: string;
  capacity: string;
}

// Função para normalizar produto da API para o formato do app
export const normalizeProduct = (apiProduct: any): Product => {
  return {
    ...apiProduct,
    // Campos legados para compatibilidade com componentes existentes
    oldPrice: apiProduct.originalPrice || apiProduct.price,
    newPrice: apiProduct.price,
    color: '',
    capacity: '',
  };
};

// Buscar todos os produtos
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/produtos.php`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar produtos');
    }
    
    return data.data.map(normalizeProduct);
  } catch (error) {
    console.error('Erro ao buscar produtos da API:', error);
    throw error;
  }
};

// Buscar produto por ID ou slug
export const fetchProductById = async (idOrSlug: string): Promise<Product | null> => {
  try {
    // Detecta se é UUID, número (id INT) ou slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const isNumericId = /^\d+$/.test(idOrSlug);
    const param = (isUuid || isNumericId) ? `id=${idOrSlug}` : `slug=${idOrSlug}`;
    
    const response = await fetch(`${API_BASE_URL}/produto.php?${param}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar produto');
    }
    
    return normalizeProduct(data.data);
  } catch (error) {
    console.error('Erro ao buscar produto da API:', error);
    throw error;
  }
};

// Interface de categoria da API
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
}

// Buscar categorias do banco de dados
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categorias.php`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar categorias');
    }
    
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};
