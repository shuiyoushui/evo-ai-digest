import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/mockData";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(product.upvotes);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpvoted(!upvoted);
    setCount((c) => (upvoted ? c - 1 : c + 1));
  };

  const getInitials = (name: string) =>
    name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 px-4 py-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer animate-fade-in"
    >
      {/* Rank */}
      <span className="w-6 text-center text-sm font-semibold text-muted-foreground shrink-0">
        {product.rank}
      </span>

      {/* Logo */}
      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-foreground font-bold text-base shrink-0 border border-border/40">
        {getInitials(product.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm truncate">{product.name}</h3>
          {product.verified && (
            <span className="text-primary text-xs">✓</span>
          )}
        </div>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{product.slogan}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Upvote */}
      <button
        onClick={handleUpvote}
        className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border transition-all shrink-0 ${
          upvoted
            ? "border-primary bg-primary/10 text-primary"
            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
        }`}
      >
        <ChevronUp className="h-4 w-4" />
        <span className="text-xs font-semibold">{count}</span>
      </button>
    </div>
  );
}
