import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `🔥 推荐一个超棒的AI工具！\n\n📌 ${product.name}\n💡 ${product.slogan}\n\n✨ 核心优势：\n${(product.benefits || []).map((b) => `• ${b}`).join("\n")}\n\n🔗 ${product.website}\n\n#AI产品 #${product.name} #效率工具`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>分享「{product.name}」</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="wechat" className="mt-2">
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="wechat" className="flex-1 text-xs">微信海报</TabsTrigger>
            <TabsTrigger value="rednote" className="flex-1 text-xs">小红书卡片</TabsTrigger>
            <TabsTrigger value="video" className="flex-1 text-xs">竖版视频</TabsTrigger>
          </TabsList>

          <TabsContent value="wechat">
            <div className="bg-gradient-to-b from-primary/20 to-secondary rounded-lg p-6 text-center space-y-4" style={{ aspectRatio: "9/16", maxHeight: 400 }}>
              <div className="pt-8">
                <div className="h-16 w-16 rounded-xl bg-secondary mx-auto flex items-center justify-center font-bold text-xl border border-border/40">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-foreground text-lg mt-3">{product.name}</h3>
                <p className="text-muted-foreground text-xs mt-1">{product.slogan}</p>
              </div>
              <div className="flex-1" />
              <div className="h-24 w-24 bg-secondary rounded-lg mx-auto flex items-center justify-center border border-border/40">
                <span className="text-xs text-muted-foreground">QR Code</span>
              </div>
              <p className="text-[10px] text-muted-foreground">扫码查看详情 · AI产品榜</p>
            </div>
          </TabsContent>

          <TabsContent value="rednote">
            <div className="bg-gradient-to-br from-primary/10 via-secondary to-card rounded-lg p-5 space-y-3" style={{ aspectRatio: "3/4", maxHeight: 400 }}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center font-bold text-sm border border-border/40">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.slogan}</p>
                </div>
              </div>
              <div className="rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1.5">
                {(product.benefits || []).map((b, i) => (
                  <p key={i}>✨ {b}</p>
                ))}
              </div>
              <div className="rounded-md bg-secondary/30 aspect-video flex items-center justify-center">
                <span className="text-xs text-muted-foreground">产品截图预览</span>
              </div>
            </div>
            <Button onClick={handleCopy} className="w-full mt-3 gap-2" variant="outline" size="sm">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "已复制文案" : "复制小红书文案"}
            </Button>
          </TabsContent>

          <TabsContent value="video">
            <div className="bg-secondary rounded-lg flex items-center justify-center" style={{ aspectRatio: "9/16", maxHeight: 400 }}>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <span className="text-lg">▶</span>
                </div>
                <p className="text-xs text-muted-foreground">竖版视频素材</p>
                <p className="text-[10px] text-muted-foreground">9:16 · 适用于抖音/快手</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
