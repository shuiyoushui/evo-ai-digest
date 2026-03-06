import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const marqueeItems = [
  "🔥 Vibe Coding",
  "⚡️ AI Agents",
  "🚀 极速冷启动",
  "🤖 智能体沙盒",
  "🧠 RAG Pipeline",
  "💡 Prompt Engineering",
  "🛠 MCP Protocol",
  "🌐 Multi-Agent",
];

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative py-16 md:py-24 text-center overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[200px] bg-[hsl(280,70%,50%)]/8 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[200px] bg-[hsl(25,95%,53%)]/6 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          <span className="gradient-text">探索下一代</span>
          <br />
          <span className="text-foreground">AI 生产力</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          从 Vibe Coding 到自主智能体。在这里发现、构建并增长改变世界的工作流。
        </p>

        {/* Glowing Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-[hsl(280,70%,50%)]/30 to-primary/40 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="relative flex items-center bg-card border border-border/60 rounded-xl overflow-hidden shadow-2xl">
            <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
            <Input
              placeholder="搜索 AI 工具、Agent、Vibe Coding..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 md:h-14 text-sm md:text-base pl-3"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
              }}
            />
          </div>
        </form>
      </div>

      {/* Scrolling Marquee */}
      <div className="mt-10 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-3 px-4 py-1.5 rounded-full text-xs font-medium border border-border/40 bg-secondary/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
