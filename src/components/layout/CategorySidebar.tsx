import { categories } from "@/data/mockData";

interface CategorySidebarProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategorySidebar({ selected, onSelect }: CategorySidebarProps) {
  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <div className="sticky top-20">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">分类</h3>
        <nav className="space-y-0.5">
          <button
            onClick={() => onSelect(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              selected === null
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <span>🔥</span>
            <span>全部</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                selected === cat.id
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              <span className="text-xs text-muted-foreground">{cat.count}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
