import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

export interface ShareProduct {
  id: string;
  name: string;
  slogan: string;
  description: string;
  logo: string;
  tags: string[];
  category: string;
  upvotes: number;
  views: number;
  comments: number;
  website: string;
  verified: boolean;
  featured: boolean;
  maker: { name: string; avatar: string; title: string };
  company: { name: string; founded: string; location: string; funding?: string };
  benefits: string[];
  launchDate: string;
  rank: number;
}

interface ShareDialogProps {
  product: ShareProduct;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ product, open, onClose }: ShareDialogProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopyWechat = () => {
    const text = `🔥 发现一个超棒的AI工具！\n\n📌 ${product.name}\n💡 ${product.slogan}\n\n✨ 核心优势：\n${(product.benefits || []).slice(0, 3).map((b) => `• ${b}`).join("\n")}\n\n🔗 ${product.website}\n\n长按识别二维码查看详情`;
    navigator.clipboard.writeText(text);
    setCopiedTab("wechat");
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleCopyRednote = () => {
    const text = `🚀 AI神器推荐 | ${product.name} 💯\n\n姐妹们！！这个AI工具真的绝了！！\n\n💡 ${product.slogan}\n\n${(product.benefits || []).map((b, i) => `${["✨", "🔥", "💪", "🎯", "⚡"][i % 5]} ${b}`).join("\n")}\n\n👉 赶紧去试试：${product.website}\n\n${(product.tags || []).map(t => `#${t}`).join(" ")} #AI工具 #效率神器 #${product.name}`;
    navigator.clipboard.writeText(text);
    setCopiedTab("rednote");
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const qrUrl = product.website || "https://example.com";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>分享「{product.name}」</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="wechat" className="mt-2">
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="wechat" className="flex-1 text-xs">微信海报</TabsTrigger>
            <TabsTrigger value="rednote" className="flex-1 text-xs">小红书海报</TabsTrigger>
          </TabsList>

          {/* WeChat Poster — 9:16, dark/gradient, minimal & elegant */}
          <TabsContent value="wechat">
            <div
              className="rounded-lg overflow-hidden flex flex-col items-center justify-between text-center"
              style={{
                aspectRatio: "9/16",
                maxHeight: 440,
                background: "linear-gradient(180deg, hsl(var(--primary)/0.15) 0%, hsl(var(--background)) 40%, hsl(var(--background)) 100%)",
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
                <div className="h-18 w-18 rounded-2xl bg-secondary border border-border/40 flex items-center justify-center font-bold text-2xl text-foreground shadow-md">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-foreground text-lg leading-tight">{product.name}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-[220px]">{product.slogan}</p>
                {(product.benefits || []).length > 0 && (
                  <div className="mt-2 space-y-1.5 text-left w-full max-w-[240px]">
                    {product.benefits.slice(0, 3).map((b, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-px">✦</span>
                        <span className="line-clamp-2">{b}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="pb-5 flex flex-col items-center gap-2">
                <div className="bg-background rounded-lg p-2 border border-border/40 shadow-sm">
                  <QRCodeSVG value={qrUrl} size={88} level="M" bgColor="transparent" fgColor="hsl(var(--foreground))" />
                </div>
                <p className="text-[10px] text-muted-foreground">长按识别二维码 · 查看详情</p>
              </div>
            </div>
            <Button onClick={handleCopyWechat} className="w-full mt-3 gap-2" variant="outline" size="sm">
              {copiedTab === "wechat" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedTab === "wechat" ? "已复制文案" : "复制微信分享文案"}
            </Button>
          </TabsContent>

          {/* Xiaohongshu Poster — 3:4, warm/vibrant, seed-planting style */}
          <TabsContent value="rednote">
            <div
              className="rounded-lg overflow-hidden flex flex-col p-5 gap-3"
              style={{
                aspectRatio: "3/4",
                maxHeight: 440,
                background: "linear-gradient(135deg, hsl(25 95% 53% / 0.08) 0%, hsl(var(--secondary)) 50%, hsl(var(--card)) 100%)",
              }}
            >
              {/* Header badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[hsl(25,95%,53%)]/15 text-[hsl(25,95%,53%)]">🚀 AI神器推荐</span>
              </div>
              {/* Product info */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center font-bold text-sm border border-border/40 shrink-0">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground text-base truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{product.slogan}</p>
                </div>
              </div>
              {/* Benefits with emoji */}
              {(product.benefits || []).length > 0 && (
                <div className="rounded-lg bg-secondary/60 p-3 space-y-2 flex-1">
                  {product.benefits.map((b, i) => (
                    <p key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span>{["✨", "🔥", "💪", "🎯", "⚡"][i % 5]}</span>
                      <span>{b}</span>
                    </p>
                  ))}
                </div>
              )}
              {/* Tags */}
              {(product.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">#{tag}</span>
                  ))}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">#AI工具</span>
                </div>
              )}
              {/* QR code */}
              <div className="flex items-center gap-3 mt-auto pt-2">
                <div className="bg-background rounded-lg p-1.5 border border-border/40 shrink-0">
                  <QRCodeSVG value={qrUrl} size={56} level="M" bgColor="transparent" fgColor="hsl(var(--foreground))" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">扫码查看详情</p>
                  <p className="text-[10px] text-muted-foreground truncate">{product.website}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleCopyRednote} className="w-full mt-3 gap-2" variant="outline" size="sm">
              {copiedTab === "rednote" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedTab === "rednote" ? "已复制文案" : "复制小红书文案"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
