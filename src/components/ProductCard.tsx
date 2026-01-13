import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { encodeProductId } from "@/lib/productHash";

interface ProductCardProps {
  id?: number | string;
  slug?: string;
  image: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  installments: number;
  installmentPrice: number;
  condition: string;
  rating?: number;
}

const ProductCard = ({
  id = 1,
  slug,
  image,
  name,
  oldPrice,
  newPrice,
  installments,
  installmentPrice,
  condition,
  rating = 4,
}: ProductCardProps) => {
  // Usa slug se disponível, senão gera hash do ID
  const productUrl = slug ? `/produto/${slug}` : `/produto/${encodeProductId(id)}`;

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  return (
    <Link
      to={productUrl}
      className="bg-card rounded-lg p-4 border border-transparent hover:border-border hover:shadow-xl transition-all duration-300 cursor-pointer block group"
    >
      {/* Image */}
      <div className="relative aspect-square rounded-lg mb-4 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
          -{discount}%
        </span>
        <span className="text-xs text-muted-foreground">{condition}</span>
      </div>

      {/* Name */}
      <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] mb-2">
        {name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
          />
        ))}
      </div>

      {/* Price */}
      <div className="space-y-1">
        <p className="text-muted-foreground line-through text-sm">
          {formatPrice(oldPrice)}
        </p>
        <p className="text-xl font-bold text-foreground">
          {formatPrice(newPrice)}
        </p>
        <p className="text-xs text-muted-foreground">
          ou <span className="text-primary">{installments}x</span> de{" "}
          <span className="text-primary">{formatPrice(installmentPrice)}</span>
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
