import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { HomeBanner } from "@/components/home/HomeBanner";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { useProducts } from "@/hooks/useProducts";
import { useUserUpvotes } from "@/hooks/useUpvotes";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Rocket, Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("total");

  const { data: products = [], isLoading } = useProducts(selectedCategory);
  const { data: userUpvotes = new Set<string>() } = useUserUpvotes(user?.id);

  const filtered = useMemo(() => {
    let list = products;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slogan.toLowerCase().includes(q));
    }
    if (timeFilter === "weekly") {
      list = [...list].sort((a, b) => b.views - a.views);
    }
    return list;
  }, [products, searchQuery, timeFilter]);

  const newArrivals = useMemo(() => {
    return [...products].sort((a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime()).slice(0, 5);
  }, [products]);

  const product = products.find((p) => p.id === selectedProduct) || null;

  const handlePromote = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (p) navigate(`/maker?tab=promotion&project=${encodeURIComponent(p.name)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav onSearch={setSearchQuery} />
      <div className="hero-glow h-48 -mt-1 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex gap-8">
          <CategorySidebar selected={selectedCategory} onSelect={setSelectedCategory} />
          <main className="flex-1 min-w-0 pb-16">
            <HomeBanner />
            <HeroBanner onProductClick={setSelectedProduct} />

            <Tabs defaultValue="hot" className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-secondary/60 border border-border/30 p-1 rounded-xl">
                  <TabsTrigger value="hot" className="gap-1.5 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <TrendingUp className="h-3.5 w-3.5" /> 🔥 热门趋势
                  </TabsTrigger>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="new" className="gap-1.5 text-sm rounded-lg relative data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Rocket className="h-3.5 w-3.5" /> 🚀 最新上线
                        <Lock className="h-3 w-3 text-muted-foreground ml-1 opacity-40" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border-border text-popover-foreground">
                      <p className="text-xs">此模块可通过管理后台配置隐藏</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
                <span className="text-xs text-muted-foreground/60 tabular-nums">{filtered.length} 个产品</span>
              </div>

              <TabsContent value="hot" className="mt-0">
                <div className="flex items-center gap-2 mb-4">
                  <ToggleGroup type="single" value={timeFilter} onValueChange={(v) => v && setTimeFilter(v)} size="sm">
                    <ToggleGroupItem value="total" className="text-xs h-7 px-4 rounded-lg data-[state=on]:bg-primary/15 data-[state=on]:text-primary">总榜</ToggleGroupItem>
                    <ToggleGroupItem value="weekly" className="text-xs h-7 px-4 rounded-lg data-[state=on]:bg-primary/15 data-[state=on]:text-primary">周榜</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm divide-y divide-border/20 overflow-hidden">
                    {filtered.map((p, i) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        rank={i + 1}
                        onClick={() => setSelectedProduct(p.id)}
                        isUpvoted={userUpvotes instanceof Set ? userUpvotes.has(p.id) : false}
                      />
                    ))}
                  </div>
                )}
                {!isLoading && filtered.length === 0 && (
                  <div className="text-center py-24 text-muted-foreground/60 text-sm">暂无匹配的产品</div>
                )}
              </TabsContent>

              <TabsContent value="new" className="mt-0">
                <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm divide-y divide-border/20 overflow-hidden">
                  {newArrivals.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      rank={i + 1}
                      onClick={() => setSelectedProduct(p.id)}
                      isUpvoted={userUpvotes instanceof Set ? userUpvotes.has(p.id) : false}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <ProductDetail
        product={product}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onPromote={handlePromote}
      />
    </div>
  );
};

export default Index;
