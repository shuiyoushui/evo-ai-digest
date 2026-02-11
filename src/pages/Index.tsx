import { useState, useMemo } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { products } from "@/data/mockData";
import { TrendingUp, Rocket, Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("total");

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slogan.toLowerCase().includes(q));
    }
    if (timeFilter === "weekly") {
      list = [...list].sort((a, b) => b.views - a.views);
    }
    return list;
  }, [selectedCategory, searchQuery, timeFilter]);

  const newArrivals = useMemo(() => {
    return [...products].sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime()).slice(0, 5);
  }, []);

  const product = products.find((p) => p.id === selectedProduct) || null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav onSearch={setSearchQuery} />
      <div className="flex max-w-6xl mx-auto px-4 pt-6 gap-6">
        <CategorySidebar selected={selectedCategory} onSelect={setSelectedCategory} />
        <main className="flex-1 min-w-0 pb-12">
          <HeroBanner onProductClick={setSelectedProduct} />

          <Tabs defaultValue="hot" className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <TabsList className="bg-secondary">
                <TabsTrigger value="hot" className="gap-1.5 text-sm">
                  <TrendingUp className="h-3.5 w-3.5" /> 🔥 热门趋势
                </TabsTrigger>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="new" className="gap-1.5 text-sm relative">
                      <Rocket className="h-3.5 w-3.5" /> 🚀 最新上线
                      <Lock className="h-3 w-3 text-muted-foreground ml-1 opacity-50" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border-border text-popover-foreground">
                    <p className="text-xs">此模块可通过管理后台配置隐藏</p>
                  </TooltipContent>
                </Tooltip>
              </TabsList>
              <span className="text-xs text-muted-foreground">{filtered.length} 个产品</span>
            </div>

            <TabsContent value="hot" className="mt-0">
              <div className="flex items-center gap-2 mb-3">
                <ToggleGroup type="single" value={timeFilter} onValueChange={(v) => v && setTimeFilter(v)} size="sm">
                  <ToggleGroupItem value="total" className="text-xs h-7 px-3">总榜</ToggleGroupItem>
                  <ToggleGroupItem value="weekly" className="text-xs h-7 px-3">周榜</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-0.5">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p.id)} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground text-sm">暂无匹配的产品</div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-0">
              <div className="space-y-0.5">
                {newArrivals.map((p, i) => (
                  <ProductCard key={p.id} product={{ ...p, rank: i + 1 }} onClick={() => setSelectedProduct(p.id)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ProductDetail product={product} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Index;
