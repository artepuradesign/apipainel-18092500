import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useApiProducts } from "@/hooks/useApiProducts";

const SearchDropdown = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { products, isLoading } = useApiProducts();

  // Filter products based on search query
  const results = query.length > 1 && products 
    ? products.filter(p => 
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 1) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleProductClick = (productSlug: string | number) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/produto/${productSlug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length > 0) {
      setIsOpen(false);
      navigate(`/busca?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="search"
            placeholder="Busca aqui..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query.length > 1 && setIsOpen(true)}
            className="w-full pl-4 pr-16 py-2 rounded-full border-border bg-secondary"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query.length > 0 && (
              <button 
                type="button" 
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button type="submit" className="p-1">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && query.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <span className="text-sm text-primary font-medium">Produtos sugeridos</span>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.slug || product.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-secondary transition-colors text-left"
                >
                  <img
                    src={product.images?.[0] || "https://via.placeholder.com/60"}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded bg-secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-1">{product.name}</p>
                    <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;