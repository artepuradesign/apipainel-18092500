import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para invalidar o cache de produtos após uma compra
 * Isso força o React Query a buscar dados atualizados do estoque
 */
export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();

  const invalidateAllProducts = () => {
    // Invalida a lista de produtos
    queryClient.invalidateQueries({ queryKey: ['products'] });
    // Invalida todos os produtos individuais
    queryClient.invalidateQueries({ queryKey: ['product'] });
    // Invalida variações de produtos
    queryClient.invalidateQueries({ queryKey: ['productVariations'] });
  };

  const invalidateProduct = (productId: string) => {
    queryClient.invalidateQueries({ queryKey: ['product', productId] });
    queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
  };

  return {
    invalidateAllProducts,
    invalidateProduct,
  };
};
