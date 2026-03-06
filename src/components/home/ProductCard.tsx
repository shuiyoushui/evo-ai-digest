import { useState } from "react";
import { ChevronUp, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Product } from "@/data/mockData";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const logoClasses: Record<string, string> = {
  "1": "product-logo-1",
  "2": "product-logo-2",
  "3": "product-logo-3",
  "4": "product-logo-4",
  "5": "product-logo-5",
  "6": "product-logo-6",
  "7": "product-logo-7",
  "8": "product-logo-8",
  "9": "product-logo-9",
  "10": "product-logo-10",
};

const vibeCodingTags = ["Vibe Coding", "AI 编程", "AI编程", "编辑器"];

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

  const rankClass =
    product.rank === 1 ? "rank-gold" :
    product.rank === 2 ? "rank-silver" :
    product.rank === 3 ? "rank-bronze" : "";

  const isTop3 = product.rank <= 3;
  const isVibeCoding = product.tags.some((t) => vibeCodingTags.includes(t)) || product.category === "devcode";

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-secondary/40 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/30 ${isVibeCoding ? "vibe-coding-border !border-[hsl(280,70%,50%,0.25)]" : ""}`}
    >
      {/* Rank */}
      <span className={`w-7 text-center text-base font-bold shrink-0 ${rankClass || "text-muted-foreground/60"}`}>
        {product.rank}
      </span>

      {/* Logo */}
      <div className={`h-12 w-12 rounded-xl ${logoClasses[product.id] || "bg-secondary"} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ${isTop3 ? "ring-1 ring-white/10" : ""}`}>
        {getInitials(product.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm truncate">{product.name}</h3>
          {product.verified && (
            <span className="text-xs bg-primary/15 text-primary px-1 py-0.5 rounded font-medium leading-none">✓</span>
          )}
          {product.featured && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Rocket className="h-3.5 w-3.5 text-[hsl(25,95%,53%)] shrink-0 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  csdn 助力新产品曝光中
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{product.slogan}</p>
        <div className="flex items-center gap-1.5 mt-2">
          {product.tags.slice(0, 3).map((tag) => {
            const isHot = tag === "热门" || product.rank <= 3;
            const isNew = tag === "新品";
            const isVibe = vibeCodingTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant="secondary"
                className={`text-[10px] px-2 py-0.5 h-auto font-normal border-0 ${
                  isVibe ? "bg-[hsl(280,70%,50%)]/15 text-[hsl(280,70%,65%)] border border-[hsl(280,70%,50%)]/30" :
                  isHot && product.rank === 1 ? "glow-badge-hot" :
                  isNew ? "glow-badge-new" :
                  "bg-secondary/80 text-muted-foreground"
                }`}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Upvote */}
      <button
        onClick={handleUpvote}
        className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border transition-all duration-200 shrink-0 ${
          upvoted
            ? "border-primary bg-primary/15 text-primary shadow-[0_0_15px_hsl(238_83%_67%/0.15)]"
            : "border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary/50"
        }`}
      >
        <ChevronUp className={`h-4 w-4 transition-transform ${upvoted ? "scale-110" : ""}`} />
        <span className="text-xs font-bold tabular-nums">{count.toLocaleString()}</span>
      </button>
    </div>
  );
}
