import { products } from "@/data/mockData";
import { Sparkles } from "lucide-react";

interface HeroBannerProps {
  onProductClick: (id: string) => void;
}

export function HeroBanner({ onProductClick }: HeroBannerProps) {
  const featured = products.filter((p) => p.featured);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">精选推荐</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {featured.slice(0, 3).map((p) => (
          <button
            key={p.id}
            onClick={() => onProductClick(p.id)}
            className="glass-card p-4 text-left hover-lift group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-sm border border-border/40">
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
                <p className="text-xs text-muted-foreground">🔥 {p.upvotes}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{p.slogan}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
