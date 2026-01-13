import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductById, Product } from '@/services/api';

export type { Product };

export const useApiProducts = () => {
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id || p.slug === id);
  };

  const getProductsByCategory = (category: string): Product[] => {
    if (!category || category === 'Todos') return products;
    return products.filter((p) => 
      p.category === category || 
      p.categorySlug === category.toLowerCase()
    );
  };

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.category.toLowerCase().includes(lowercaseQuery) ||
        p.description?.toLowerCase().includes(lowercaseQuery) ||
        p.sku?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  const featuredProducts = products.filter(p => p.isFeatured);

  return {
    products,
    isLoading,
    error,
    refetch,
    getProductById,
    getProductsByCategory,
    searchProducts,
    categories,
    featuredProducts,
  };
};

export const useApiProduct = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => fetchProductById(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000,
  });
};
