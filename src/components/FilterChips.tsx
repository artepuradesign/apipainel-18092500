import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterChipsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const FilterChips = ({ selectedCategory, onCategoryChange }: FilterChipsProps) => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="py-6">
        <p className="text-sm text-muted-foreground mb-3">Filtre por:</p>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <p className="text-sm text-muted-foreground mb-3">Filtre por:</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onCategoryChange(null)}
          className={`filter-chip ${selectedCategory === null ? "filter-chip-active" : ""}`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(selectedCategory === cat.slug ? null : cat.slug)}
            className={`filter-chip ${selectedCategory === cat.slug ? "filter-chip-active" : ""}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;
