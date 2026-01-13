import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Star, SlidersHorizontal, Loader2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useApiProducts } from "@/hooks/useApiProducts";
import { encodeProductId } from "@/lib/productHash";

// Faixas de preço
const PRICE_RANGES = [
  { label: "Até R$ 1.500", min: 0, max: 1500 },
  { label: "R$ 1.500 - R$ 3.000", min: 1500, max: 3000 },
  { label: "R$ 3.000 - R$ 5.000", min: 3000, max: 5000 },
  { label: "Acima de R$ 5.000", min: 5000, max: Infinity }
];

// Mapeamento de cores para códigos hex
const COLOR_CODES: Record<string, string> = {
  "amarelo": "#FFD700",
  "azul": "#007AFF",
  "branco": "#FFFFFF",
  "bronze": "#CD7F32",
  "cinza": "#808080",
  "dourado": "#FFD700",
  "laranja": "#FF9500",
  "prata": "#C0C0C0",
  "preto": "#1C1C1E",
  "rosa": "#FF2D55",
  "roxo": "#AF52DE",
  "verde": "#34C759",
  "vermelho": "#FF3B30",
  "titânio": "#A0A0A0",
  "natural": "#E5D6C8",
  "meia-noite": "#1C1C1E",
  "estelar": "#F5F5DC",
};

interface FilterState {
  models: string[];
  conditions: string[];
  capacities: string[];
  colors: string[];
  priceRanges: number[];
}

interface AvailableFilters {
  models: { value: string; count: number }[];
  conditions: { value: string; count: number }[];
  capacities: { value: string; count: number }[];
  colors: { value: string; code: string; count: number }[];
}

interface FilterContentProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableFilters: AvailableFilters;
}

const FilterContent = ({ filters, setFilters, availableFilters }: FilterContentProps) => {
  const [modelSearch, setModelSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    model: false,
    condition: true,
    price: true,
    capacity: true,
    color: true
  });

  const filteredModels = availableFilters.models.filter(m =>
    m.value.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (type: keyof FilterState, value: string | number) => {
    setFilters(prev => {
      const current = prev[type] as (string | number)[];
      const exists = current.includes(value);
      return {
        ...prev,
        [type]: exists
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  return (
    <div className="space-y-4">
      {/* Modelo */}
      {availableFilters.models.length > 0 && (
        <div className="border-b border-border pb-4">
          <button
            onClick={() => toggleSection('model')}
            className="flex items-center justify-between w-full text-left font-medium text-sm mb-2"
          >
            Modelo
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.model ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.model && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Buscar Modelo"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredModels.map((model) => (
                  <label key={model.value} className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:bg-secondary/50 px-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.models.includes(model.value)}
                      onChange={() => toggleFilter('models', model.value)}
                      className="rounded border-border"
                    />
                    <span className="text-foreground flex-1">{model.value}</span>
                    <span className="text-xs text-muted-foreground">({model.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Condição */}
      {availableFilters.conditions.length > 0 && (
        <div className="border-b border-border pb-4">
          <button
            onClick={() => toggleSection('condition')}
            className="flex items-center justify-between w-full text-left font-medium text-sm mb-2"
          >
            Condição
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.condition ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.condition && (
            <div className="space-y-1">
              {availableFilters.conditions.map((cond) => (
                <label key={cond.value} className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:bg-secondary/50 px-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.conditions.includes(cond.value)}
                    onChange={() => toggleFilter('conditions', cond.value)}
                    className="rounded border-border"
                  />
                  <span className="text-foreground flex-1">{cond.value}</span>
                  <span className="text-xs text-muted-foreground">({cond.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preço */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-medium text-sm mb-2"
        >
          Preço
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.price && (
          <div className="space-y-1">
            {PRICE_RANGES.map((range, idx) => (
              <label key={range.label} className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:bg-secondary/50 px-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.priceRanges.includes(idx)}
                  onChange={() => toggleFilter('priceRanges', idx)}
                  className="rounded border-border"
                />
                <span className="text-foreground">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Capacidade */}
      {availableFilters.capacities.length > 0 && (
        <div className="border-b border-border pb-4">
          <button
            onClick={() => toggleSection('capacity')}
            className="flex items-center justify-between w-full text-left font-medium text-sm mb-2"
          >
            Capacidade
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.capacity ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.capacity && (
            <div className="space-y-1">
              {availableFilters.capacities.map((cap) => (
                <label key={cap.value} className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:bg-secondary/50 px-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.capacities.includes(cap.value)}
                    onChange={() => toggleFilter('capacities', cap.value)}
                    className="rounded border-border"
                  />
                  <span className="text-foreground flex-1">{cap.value}</span>
                  <span className="text-xs text-muted-foreground">({cap.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cor */}
      {availableFilters.colors.length > 0 && (
        <div className="pb-4">
          <button
            onClick={() => toggleSection('color')}
            className="flex items-center justify-between w-full text-left font-medium text-sm mb-2"
          >
            Cor
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.color ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.color && (
            <div className="space-y-1">
              {availableFilters.colors.map((color) => (
                <label key={color.value} className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:bg-secondary/50 px-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color.value)}
                    onChange={() => toggleFilter('colors', color.value)}
                    className="rounded border-border"
                  />
                  <span
                    className="w-4 h-4 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: color.code }}
                  />
                  <span className="text-foreground flex-1">{color.value}</span>
                  <span className="text-xs text-muted-foreground">({color.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Busca = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoria = searchParams.get("categoria") || "";
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    models: [],
    conditions: [],
    capacities: [],
    colors: [],
    priceRanges: []
  });
  
  const { products, isLoading, error } = useApiProducts();

  // Calcular filtros disponíveis dinamicamente baseado nos produtos
  const availableFilters = useMemo((): AvailableFilters => {
    if (!products) return { models: [], conditions: [], capacities: [], colors: [] };
    
    const modelCounts = new Map<string, number>();
    const conditionCounts = new Map<string, number>();
    const capacityCounts = new Map<string, number>();
    const colorCounts = new Map<string, number>();
    
    products.forEach(product => {
      // Extrair modelo do nome (ex: "iPhone 13 128GB Preto" -> "IPHONE 13")
      const modelMatch = product.name?.match(/iPhone\s+(\d+|SE)\s*(Pro|Plus|Max|Mini)?(\s*Pro\s*Max)?/i);
      if (modelMatch) {
        const model = modelMatch[0].toUpperCase().trim();
        modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
      }
      
      // Condição - usar o label se disponível
      const condition = product.conditionLabel || product.condition;
      if (condition) {
        conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
      }
      
      // Capacidade - extrair do nome
      const capMatch = product.name?.match(/(\d+)\s*(GB|TB)/i);
      if (capMatch) {
        const capacity = `${capMatch[1]}${capMatch[2].toUpperCase()}`;
        capacityCounts.set(capacity, (capacityCounts.get(capacity) || 0) + 1);
      }
      
      // Cor - verificar no campo color ou extrair do nome
      const productColor = product.color?.toLowerCase();
      if (productColor && productColor.trim()) {
        const colorKey = productColor.trim();
        colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
      } else {
        // Tentar extrair cor do nome do produto
        const nameWords = (product.name || '').toLowerCase().split(/\s+/);
        for (const word of nameWords) {
          if (COLOR_CODES[word]) {
            colorCounts.set(word, (colorCounts.get(word) || 0) + 1);
            break;
          }
        }
      }
    });
    
    // Ordenar capacidades numericamente
    const sortCapacity = (a: string, b: string) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      const isTbA = a.includes('TB');
      const isTbB = b.includes('TB');
      if (isTbA && !isTbB) return 1;
      if (!isTbA && isTbB) return -1;
      return numA - numB;
    };
    
    return {
      models: Array.from(modelCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => {
          const numA = parseInt(a.value.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.value.match(/\d+/)?.[0] || '0');
          return numB - numA; // Ordem decrescente (mais novos primeiro)
        }),
      conditions: Array.from(conditionCounts.entries())
        .map(([value, count]) => ({ value, count })),
      capacities: Array.from(capacityCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => sortCapacity(a.value, b.value)),
      colors: Array.from(colorCounts.entries())
        .map(([value, count]) => ({ 
          value: value.charAt(0).toUpperCase() + value.slice(1), 
          code: COLOR_CODES[value.toLowerCase()] || '#A0A0A0',
          count 
        }))
        .sort((a, b) => a.value.localeCompare(b.value))
    };
  }, [products]);

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      models: [],
      conditions: [],
      capacities: [],
      colors: [],
      priceRanges: []
    });
  };

  // Filtrar produtos baseado na busca, categoria e filtros
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      // Filtro por categoria (usando slug)
      if (categoria) {
        const categoryMatch = 
          product.categorySlug?.toLowerCase() === categoria.toLowerCase() ||
          product.category?.toLowerCase() === categoria.toLowerCase();
        if (!categoryMatch) return false;
      }
      
      // Filtro por termo de busca
      if (query) {
        const searchLower = query.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        const categoryNameMatch = product.category?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descMatch && !categoryNameMatch) return false;
      }

      // Filtro por modelo
      if (filters.models.length > 0) {
        const productNameUpper = product.name?.toUpperCase() || '';
        const modelMatch = filters.models.some(model => 
          productNameUpper.includes(model) || 
          productNameUpper.includes(model.replace('IPHONE ', ''))
        );
        if (!modelMatch) return false;
      }

      // Filtro por condição
      if (filters.conditions.length > 0) {
        const productCondition = (product.conditionLabel || product.condition || '').toLowerCase();
        const conditionMatch = filters.conditions.some(cond => {
          const filterCondition = cond.toLowerCase();
          return productCondition.includes(filterCondition) || 
                 filterCondition.includes(productCondition);
        });
        if (!conditionMatch) return false;
      }

      // Filtro por capacidade
      if (filters.capacities.length > 0) {
        const productName = (product.name || '').toUpperCase();
        const productCapacity = (product.capacity || '').toUpperCase();
        const capacityMatch = filters.capacities.some(cap => 
          productName.includes(cap.toUpperCase()) || 
          productCapacity.includes(cap.toUpperCase())
        );
        if (!capacityMatch) return false;
      }

      // Filtro por cor
      if (filters.colors.length > 0) {
        const productColor = (product.color || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        const colorMatch = filters.colors.some(color => 
          productColor.includes(color.toLowerCase()) || 
          productName.includes(color.toLowerCase())
        );
        if (!colorMatch) return false;
      }

      // Filtro por faixa de preço
      if (filters.priceRanges.length > 0) {
        const price = product.price || 0;
        const priceMatch = filters.priceRanges.some(idx => {
          const range = PRICE_RANGES[idx];
          return price >= range.min && price < range.max;
        });
        if (!priceMatch) return false;
      }
      
      return true;
    });
  }, [products, query, categoria, filters]);

  const searchLabel = categoria || query || "Todos os produtos";

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb - Hidden on mobile */}
      <div className="bg-secondary py-2 md:py-3 hidden sm:block">
        <div className="container">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">{categoria ? categoria : `Busca: "${query}"`}</span>
          </nav>
        </div>
      </div>

      <main className="container py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filtros</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-foreground hover:underline">
                    Limpar
                  </button>
                )}
              </div>
              <FilterContent filters={filters} setFilters={setFilters} availableFilters={availableFilters} />
            </div>
          </aside>

          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold truncate">{searchLabel}</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {isLoading ? "Carregando..." : `${filteredProducts.length} produtos`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filtros
                      {hasActiveFilters && (
                        <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                          {Object.values(filters).flat().length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px]">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 overflow-y-auto max-h-[70vh]">
                      <FilterContent filters={filters} setFilters={setFilters} availableFilters={availableFilters} />
                    </div>
                    <div className="mt-6 pt-4 border-t border-border flex gap-2">
                      {hasActiveFilters && (
                        <Button variant="outline" className="flex-1" onClick={clearFilters}>
                          Limpar
                        </Button>
                      )}
                      <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                        Aplicar
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <select className="px-2 md:px-4 py-2 border border-border rounded-lg bg-background text-xs md:text-sm">
                  <option>Relevância</option>
                  <option>Menor preço</option>
                  <option>Maior preço</option>
                </select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.models.map(model => (
                  <span key={model} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
                    {model}
                    <button onClick={() => setFilters(prev => ({ ...prev, models: prev.models.filter(m => m !== model) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.conditions.map(cond => (
                  <span key={cond} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
                    {cond}
                    <button onClick={() => setFilters(prev => ({ ...prev, conditions: prev.conditions.filter(c => c !== cond) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.capacities.map(cap => (
                  <span key={cap} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
                    {cap}
                    <button onClick={() => setFilters(prev => ({ ...prev, capacities: prev.capacities.filter(c => c !== cap) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.colors.map(color => (
                  <span key={color} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
                    {color}
                    <button onClick={() => setFilters(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.priceRanges.map(idx => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
                    {PRICE_RANGES[idx].label}
                    <button onClick={() => setFilters(prev => ({ ...prev, priceRanges: prev.priceRanges.filter(p => p !== idx) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive">Erro ao carregar produtos</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? "Nenhum produto encontrado com os filtros selecionados" 
                    : `Nenhum produto encontrado para "${query || categoria}"`
                  }
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/produto/${encodeProductId(product.id)}`}
                    className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Image */}
                    <div className="aspect-square p-4 bg-secondary/30 relative overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                      {product.discountPercent > 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded">
                          -{product.discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4 space-y-2">
                      <span className="text-xs text-muted-foreground">{product.category}</span>
                      <h3 className="font-medium text-sm md:text-base line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-1">
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

                      <div className="space-y-1">
                        {product.originalPrice > product.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                        <p className="text-lg md:text-xl font-bold text-foreground">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ou {product.installments}x de {formatPrice(product.price / product.installments)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Busca;
