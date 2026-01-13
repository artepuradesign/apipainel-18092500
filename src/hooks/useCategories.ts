import { useQuery } from '@tanstack/react-query';
import { fetchCategories, Category } from '@/services/api';

export type { Category };

export const useCategories = () => {
  const { 
    data: categories = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
};
