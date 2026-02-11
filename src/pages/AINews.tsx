import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock } from "lucide-react";

const mockNews = [
  {
    id: "n1",
    title: "OpenAI 发布 GPT-5：多模态推理能力大幅提升",
    source: "36Kr",
    date: "2026-02-10",
    summary: "OpenAI 正式推出 GPT-5 模型，在多模态推理、长上下文理解和代码生成方面带来显著提升，标志着通用人工智能的又一重大突破。",
    tags: ["大模型", "OpenAI"],
    url: "#",
  },
  {
    id: "n2",
    title: "DeepSeek V4 开源发布，性能逼近闭源模型",
    source: "机器之心",
    date: "2026-02-09",
    summary: "深度求索最新发布的 DeepSeek V4 模型在多项基准测试中表现优异，开源社区反响热烈，进一步推动国产大模型生态发展。",
    tags: ["开源", "国产大模型"],
    url: "#",
  },
  {
    id: "n3",
    title: "Product Hunt 本周最佳：AI 视频编辑工具 CapCut Pro AI",
    source: "Product Hunt",
    date: "2026-02-08",
    summary: "字节跳动旗下 CapCut 推出 Pro AI 版本，集成了智能剪辑、AI 特效生成和自动字幕功能，获得 Product Hunt 本周最佳产品。",
    tags: ["视频", "AI工具"],
    url: "#",
  },
  {
    id: "n4",
    title: "Anthropic Claude 4 发布：安全对齐的新标杆",
    source: "TechCrunch",
    date: "2026-02-07",
    summary: "Anthropic 发布 Claude 4 系列模型，在安全性和有用性之间实现了更好的平衡，200K 上下文窗口和改进的工具使用能力成为亮点。",
    tags: ["安全AI", "Claude"],
    url: "#",
  },
  {
    id: "n5",
    title: "阿里通义千问推出 Agent 平台，降低 AI 应用开发门槛",
    source: "36Kr",
    date: "2026-02-06",
    summary: "通义千问正式推出 Agent 开发平台，支持零代码创建 AI Agent，并提供丰富的工具插件和知识库集成能力。",
    tags: ["AI Agents", "阿里"],
    url: "#",
  },
  {
    id: "n6",
    title: "Midjourney V7 内测开启：照片级真实感再进一步",
    source: "AI 前线",
    date: "2026-02-05",
    summary: "Midjourney V7 版本进入内测阶段，新模型在人物面部细节、光影效果和文字渲染方面有了质的飞跃。",
    tags: ["图像生成", "Midjourney"],
    url: "#",
  },
];

const AINews = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">AI 资讯</h1>
        <p className="text-sm text-muted-foreground mb-8">关注 AI 行业最新动态和产品发布</p>

        <div className="space-y-4">
          {mockNews.map((news) => (
            <Card key={news.id} className="bg-card border-border hover-lift group cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors mb-1.5">
                      {news.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{news.summary}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {news.date}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-5 px-2 border-primary/30 text-primary">
                        {news.source}
                      </Badge>
                      {news.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-2">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AINews;
