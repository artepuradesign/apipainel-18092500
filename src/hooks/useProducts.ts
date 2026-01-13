import productsData from '@/data/products.json';

export interface Product {
  id: number;
  name: string;
  color: string;
  capacity: string;
  category: string;
  condition: string;
  oldPrice: number;
  newPrice: number;
  installments: number;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  specs: { label: string; value: string }[];
}

export const useProducts = () => {
  const products: Product[] = productsData.products;

  const getProductById = (id: number): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const getProductsByCategory = (category: string): Product[] => {
    if (!category || category === 'Todos') return products;
    return products.filter((p) => p.category === category);
  };

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.category.toLowerCase().includes(lowercaseQuery) ||
        p.color.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    products,
    getProductById,
    getProductsByCategory,
    searchProducts,
  };
};
