import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterSection {
  title: string;
  options: string[];
}

const filters: FilterSection[] = [
  {
    title: "Tipo",
    options: [
      "iPhone 16 Pro Max",
      "iPhone 16 Pro",
      "iPhone 16",
      "iPhone 15 Pro Max",
      "iPhone 15 Pro",
      "iPhone 15",
      "iPhone 14 Pro Max",
      "iPhone 14",
      "iPhone 13 Pro Max",
      "iPhone 13",
      "iPhone 12",
      "iPhone 11",
    ],
  },
  {
    title: "Capacidade",
    options: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  },
  {
    title: "Cor",
    options: [
      "Prata",
      "Cinza Espacial",
      "Dourado",
      "Azul",
      "Vermelho",
      "Preto",
      "Branco",
      "Titânio Natural",
      "Titânio Preto",
    ],
  },
];

interface SidebarProps {
  onFilterChange?: (filters: Record<string, string[]>) => void;
}

const Sidebar = ({ onFilterChange }: SidebarProps) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (section: string, option: string) => {
    setSelected((prev) => {
      const current = prev[section] || [];
      let newSelected;
      if (current.includes(option)) {
        newSelected = { ...prev, [section]: current.filter((o) => o !== option) };
      } else {
        newSelected = { ...prev, [section]: [...current, option] };
      }
      onFilterChange?.(newSelected);
      return newSelected;
    });
  };

  const clearFilters = () => {
    setSelected({});
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.values(selected).some((arr) => arr.length > 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}

      {filters.map((filter) => (
        <div key={filter.title} className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground">{filter.title}</h3>
          <div className="space-y-2">
            {filter.options.slice(0, 6).map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
              >
                <Checkbox
                  checked={(selected[filter.title] || []).includes(option)}
                  onCheckedChange={() => toggleOption(filter.title, option)}
                />
                <span className="text-muted-foreground">{option}</span>
              </label>
            ))}
            {filter.options.length > 6 && (
              <button className="text-primary text-sm font-medium hover:underline">
                Ver mais
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {Object.values(selected).flat().length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-4 bg-card rounded-lg border border-border p-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </h2>
          <FilterContent />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
