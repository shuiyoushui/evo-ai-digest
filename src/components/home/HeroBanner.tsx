import { products } from "@/data/mockData";
import { Sparkles, ArrowUpRight, TrendingUp } from "lucide-react";

interface HeroBannerProps {
  onProductClick: (id: string) => void;
}

const logoGradients = [
  "product-logo-1", "product-logo-2", "product-logo-3",
  "product-logo-4", "product-logo-5", "product-logo-6",
];

export function HeroBanner({ onProductClick }: HeroBannerProps) {
  const featured = products.filter((p) => p.featured);
  const hero = featured[0];
  const rest = featured.slice(1, 4);

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-6 w-6 rounded-md bg-primary/15 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground tracking-wide">精选推荐</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent ml-2" />
      </div>

      {/* Hero + Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Main Hero Card */}
        <button
          onClick={() => onProductClick(hero.id)}
          className="lg:col-span-3 relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-card/80 to-card/60 p-6 text-left group transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_40px_hsl(238_83%_67%/0.1)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/8 transition-colors duration-500" />
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              <div className={`h-14 w-14 rounded-2xl ${logoGradients[0]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {hero.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-lg">{hero.name}</h3>
                  <span className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded-md font-medium">精选</span>
                </div>
                <p className="text-muted-foreground text-sm">{hero.slogan}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {hero.upvotes.toLocaleString()} 投票</span>
              <span>👁 {(hero.views / 1000).toFixed(1)}k 浏览</span>
              <span>💬 {hero.comments} 评论</span>
            </div>
          </div>
        </button>

        {/* Side Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-3">
          {rest.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onProductClick(p.id)}
              className="relative overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 text-left group transition-all duration-300 hover:border-primary/25 hover:bg-card/80"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${logoGradients[i + 1]} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{p.slogan}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">🔥 {p.upvotes.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
