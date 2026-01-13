import { useState, useMemo } from "react";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import FilterChips from "@/components/FilterChips";
import ProductGrid from "@/components/ProductGrid";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useApiProducts } from "@/hooks/useApiProducts";

// Mapeamento de condição para label de exibição
const CONDITION_LABELS: Record<string, string> = {
  "novo": "Novos",
  "seminovo": "Seminovos",
  "usado_excelente": "Usado - Excelente",
  "usado_bom": "Usado - Bom",
  "recondicionado": "Recondicionados",
  "com_defeito": "Com Defeito"
};

// Ordem de prioridade para exibição das condições
const CONDITION_ORDER = ["novo", "seminovo", "usado_excelente", "usado_bom", "recondicionado", "com_defeito"];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, isLoading } = useApiProducts();

  // Extrair condições únicas dos produtos existentes e ordenar
  const existingConditions = useMemo(() => {
    const conditions = [...new Set(products.map(p => p.condition))];
    return conditions.sort((a, b) => {
      const indexA = CONDITION_ORDER.indexOf(a);
      const indexB = CONDITION_ORDER.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, [products]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      
      <main className="container py-4 md:py-8">
        {/* Filter Chips - Horizontal scroll on mobile */}
        <div className="mb-4 md:mb-6">
          <FilterChips 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
        </div>
        
        {/* Seções dinâmicas baseadas nas condições existentes */}
        {!isLoading && existingConditions.map((condition) => (
          <section key={condition} className="mb-12">
            <ProductGrid 
              categoryFilter={selectedCategory} 
              conditionFilter={condition}
              title={CONDITION_LABELS[condition] || condition}
            />
          </section>
        ))}

        {/* Loading state */}
        {isLoading && (
          <section className="mb-12">
            <ProductGrid 
              categoryFilter={selectedCategory}
              title="Carregando..."
            />
          </section>
        )}
      </main>

      <FAQ />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;