import { ChevronUp, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleUpvote } from "@/hooks/useUpvotes";
import { toast } from "sonner";
import type { DbProduct } from "@/hooks/useProducts";

interface ProductCardProps {
  product: DbProduct;
  rank: number;
  onClick: () => void;
  isUpvoted: boolean;
}

const logoGradients = [
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-purple-500 to-pink-500",
  "bg-gradient-to-br from-teal-500 to-cyan-500",
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-rose-500 to-red-500",
  "bg-gradient-to-br from-emerald-500 to-teal-500",
  "bg-gradient-to-br from-gray-600 to-gray-400",
  "bg-gradient-to-br from-violet-500 to-purple-500",
  "bg-gradient-to-br from-sky-500 to-blue-500",
  "bg-gradient-to-br from-gray-800 to-gray-600",
];

export function ProductCard({ product, rank, onClick, isUpvoted }: ProductCardProps) {
  const { user, isLoggedIn } = useAuth();
  const toggleUpvote = useToggleUpvote();

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn || !user) {
      toast.error("请先登录后再投票");
      return;
    }
    toggleUpvote.mutate({
      userId: user.id,
      productId: product.id,
      isUpvoted,
    });
  };

  const getInitials = (name: string) =>
    name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const rankClass =
    rank === 1 ? "rank-gold" : rank === 2 ? "rank-silver" : rank === 3 ? "rank-bronze" : "";

  const gradientIndex = product.name.charCodeAt(0) % logoGradients.length;

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-secondary/40 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/30"
    >
      <span className={`w-7 text-center text-base font-bold shrink-0 ${rankClass || "text-muted-foreground/60"}`}>
        {rank}
      </span>

      <div className={`h-12 w-12 rounded-xl ${logoGradients[gradientIndex]} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ${rank <= 3 ? "ring-1 ring-white/10" : ""}`}>
        {getInitials(product.name)}
      </div>

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
                <TooltipContent className="text-xs">csdn 助力新产品曝光中</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{product.slogan}</p>
        <div className="flex items-center gap-1.5 mt-2">
          {(product.tags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-normal bg-secondary/80 text-muted-foreground border-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <button
        onClick={handleUpvote}
        disabled={toggleUpvote.isPending}
        className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border transition-all duration-200 shrink-0 ${
          isUpvoted
            ? "border-primary bg-primary/15 text-primary shadow-[0_0_15px_hsl(238_83%_67%/0.15)]"
            : "border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary/50"
        }`}
      >
        <ChevronUp className={`h-4 w-4 transition-transform ${isUpvoted ? "scale-110" : ""}`} />
        <span className="text-xs font-bold tabular-nums">{(product.upvote_count || 0).toLocaleString()}</span>
      </button>
    </div>
  );
}
