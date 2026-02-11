import { categories } from "@/data/mockData";
import { LayoutGrid } from "lucide-react";

interface CategorySidebarProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategorySidebar({ selected, onSelect }: CategorySidebarProps) {
  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-20">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-3 flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5" />
          分类导航
        </h3>
        <nav className="space-y-1">
          <button
            onClick={() => onSelect(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              selected === null
                ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-[0_0_15px_hsl(238_83%_67%/0.08)]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
            }`}
          >
            <span className="text-base">🔥</span>
            <span>全部</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                selected === cat.id
                  ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-[0_0_15px_hsl(238_83%_67%/0.08)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              <span className={`text-[11px] tabular-nums ${selected === cat.id ? "text-primary/70" : "text-muted-foreground/50"}`}>{cat.count}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
