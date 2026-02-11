import { useState, useMemo } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { products } from "@/data/mockData";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slogan.toLowerCase().includes(q));
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const product = products.find((p) => p.id === selectedProduct) || null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav onSearch={setSearchQuery} />
      <div className="flex max-w-6xl mx-auto px-4 pt-6 gap-6">
        <CategorySidebar selected={selectedCategory} onSelect={setSelectedCategory} />
        <main className="flex-1 min-w-0 pb-12">
          <HeroBanner onProductClick={setSelectedProduct} />

          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">今日排行</h2>
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} 个产品</span>
          </div>

          <div className="space-y-0.5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p.id)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground text-sm">暂无匹配的产品</div>
          )}
        </main>
      </div>

      <ProductDetail product={product} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Index;
