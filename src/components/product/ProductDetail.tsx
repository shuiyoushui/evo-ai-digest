import { useState } from "react";
import { ChevronUp, ExternalLink, CheckCircle, Share2, Eye, MessageCircle, Reply, Rocket } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ShareDialog } from "./ShareDialog";
import type { Product } from "@/data/mockData";
import { relatedProducts, mockComments } from "@/data/mockData";

interface ProductDetailProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onPromote?: (productId: string) => void;
}

export function ProductDetail({ product, open, onClose, onPromote }: ProductDetailProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  if (!product) return null;
  const currentCount = count || product.upvotes;

  const handleUpvote = () => {
    setUpvoted(!upvoted);
    setCount(upvoted ? currentCount - 1 : currentCount + 1);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border p-0">
          {/* Header */}
          <div className="p-6 pb-4">
            <DialogHeader className="mb-0">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center font-bold text-xl border border-border/40 shrink-0">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
                    {product.verified && <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{product.slogan}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{product.comments}</span>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Button onClick={handleUpvote} className={`gap-1.5 ${upvoted ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                <ChevronUp className="h-4 w-4" /> {currentCount}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={product.website} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  访问官网 <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => {
                  onClose();
                  onPromote?.(product.id);
                }}
              >
                <Rocket className="h-3.5 w-3.5" /> 推广此项目
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShareOpen(true)}>
                <Share2 className="h-3.5 w-3.5" /> 分享
              </Button>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2 space-y-5">
              <div className="aspect-video rounded-lg bg-secondary/50 border border-border/40 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">🎬 产品演示视频</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">产品介绍</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{product.description}</div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">核心优势</h3>
                <ul className="space-y-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">✦</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">创始人</h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">{product.maker.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.maker.name}</p>
                    <p className="text-xs text-muted-foreground">{product.maker.title}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">公司信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">公司</span><span className="text-foreground">{product.company.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">成立</span><span className="text-foreground">{product.company.founded}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">地点</span><span className="text-foreground">{product.company.location}</span></div>
                  {product.company.funding && <div className="flex justify-between"><span className="text-muted-foreground">融资</span><span className="text-foreground">{product.company.funding}</span></div>}
                </div>
              </div>
              <div className="glass-card p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">相关产品</h4>
                <div className="space-y-2">
                  {relatedProducts.map((rp) => (
                    <div key={rp.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
                      <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold">{rp.name.slice(0, 2)}</div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{rp.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{rp.slogan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" /> 评论
            </h3>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">我</div>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="写下你的评论..."
                  className="bg-secondary border-border/60 min-h-[72px] text-sm"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button size="sm" className="bg-primary text-xs">发表评论</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {mockComments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">{c.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{c.user}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1.5 transition-colors">
                      <Reply className="h-3 w-3" /> 回复
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ShareDialog product={product} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
