import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/services/api";

interface Variation {
  id: number;
  color: string;
  colorCode: string;
  capacity: string;
  stock: number;
  price: number;
  available: boolean;
}

interface ColorOption {
  name: string;
  code: string;
  available: boolean;
}

interface CapacityOption {
  value: string;
  available: boolean;
}

interface VariationsData {
  variations: Variation[];
  colors: ColorOption[];
  capacities: CapacityOption[];
}

const fetchProductVariations = async (productId: string): Promise<VariationsData> => {
  const response = await fetch(`${API_BASE_URL}/produto_variacoes.php?produto_id=${productId}`);
  
  if (!response.ok) {
    throw new Error("Erro ao buscar variações");
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Erro ao buscar variações");
  }
  
  return data.data;
};

export const useProductVariations = (productId: string) => {
  return useQuery({
    queryKey: ["productVariations", productId],
    queryFn: () => fetchProductVariations(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export type { Variation, ColorOption, CapacityOption, VariationsData };
