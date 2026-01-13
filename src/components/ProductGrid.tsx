import { useState } from "react";
import ProductCard from "./ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiProducts } from "@/hooks/useApiProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  categoryFilter?: string | null;
  conditionFilter?: string;
  title?: string;
  showSort?: boolean;
}

const ProductGrid = ({ 
  categoryFilter, 
  conditionFilter,
  title = "Produtos",
  showSort = true
}: ProductGridProps) => {
  const [sortBy, setSortBy] = useState("relevance");
  const { products, isLoading, error } = useApiProducts();

  // Filtrar por categoria
  let filteredProducts = categoryFilter
    ? products.filter((p) => p.categorySlug === categoryFilter)
    : products;

  // Filtrar por condição específica
  if (conditionFilter) {
    filteredProducts = filteredProducts.filter((p) => p.condition === conditionFilter);
  }

  // Ordenar produtos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return String(b.id).localeCompare(String(a.id));
      default:
        return 0;
    }
  });

  // Não renderizar seção se não tiver produtos
  if (!isLoading && sortedProducts.length === 0) {
    return null;
  }

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{filteredProducts.length} produtos</p>
        </div>
        {showSort && sortedProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Ordenar por:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 border-foreground/20 focus:ring-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-2">Erro ao carregar produtos</p>
          <p className="text-sm text-muted-foreground">
            Verifique se a API está online em: https://iplaceseminovos.apipainel.com.br/api/produtos.php
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedProducts.map((product, index) => (
            <div key={product.id} style={{ animationDelay: `${index * 50}ms` }}>
              <ProductCard
                id={product.id}
                slug={product.slug}
                image={product.images[0]}
                name={product.name}
                oldPrice={product.originalPrice}
                newPrice={product.price}
                installments={product.installments}
                installmentPrice={product.price / product.installments}
                condition={product.condition}
                rating={product.rating}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;