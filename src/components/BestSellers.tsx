import { Link } from "react-router-dom";
import { useApiProducts } from "@/hooks/useApiProducts";
import { encodeProductId } from "@/lib/productHash";
import { Loader2, Star, TrendingUp } from "lucide-react";

interface BestSellersProps {
  excludeProductId?: string;
}

const BestSellers = ({ excludeProductId }: BestSellersProps) => {
  const { products, isLoading } = useApiProducts();

  // Simular produtos mais vendidos baseando-se nos que têm maior rating e reviews
  // Em produção, isso viria de um endpoint específico baseado em pedidos reais
  const bestSellers = products
    ?.filter((p) => p.id !== excludeProductId)
    ?.sort((a, b) => {
      const scoreA = (a.rating || 0) * (a.reviews || 1);
      const scoreB = (b.rating || 0) * (b.reviews || 1);
      return scoreB - scoreA;
    })
    ?.slice(0, 8);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!bestSellers || bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Mais Vendidos</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bestSellers.map((product) => (
          <Link
            key={product.id}
            to={`/produto/${encodeProductId(product.id)}`}
            className="group bg-card border border-border rounded-xl p-3 hover:shadow-lg transition-all"
          >
            <div className="aspect-square bg-secondary/30 rounded-lg overflow-hidden mb-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({product.reviews || 0})
              </span>
            </div>
            <p className="font-bold text-foreground">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
