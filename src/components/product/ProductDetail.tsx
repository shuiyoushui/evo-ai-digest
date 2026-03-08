import { useState } from "react";
import {
  ChevronUp, ExternalLink, CheckCircle, Share2, Eye, MessageCircle,
  Reply, Rocket, Terminal, Zap,
  Copy, Check
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ShareDialog } from "./ShareDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleUpvote, useUserUpvotes } from "@/hooks/useUpvotes";
import { toast } from "sonner";
import type { DbProduct } from "@/hooks/useProducts";
import { mockComments } from "@/data/mockData";

const fallbackSkills = [
  { name: "联网搜索", description: "实时搜索互联网获取最新数据和信息" },
  { name: "代码解释器", description: "运行 Python 代码进行数据分析和计算" },
  { name: "图像生成", description: "根据文字描述生成高质量图像" },
  { name: "长文本理解", description: "支持超长上下文的深度理解与分析" },
  { name: "文档解析", description: "解析 PDF、Word 等格式文档内容" },
  { name: "多模态理解", description: "理解图片、图表等视觉内容" },
];

const fallbackPrompts = [
  { title: "修复 Bug", content: "分析以下 React 代码片段，找出导致重复渲染的问题并给出修复方案。" },
  { title: "编写测试", content: "为以下函数生成 Jest 单元测试用例，覆盖正常输入、边界条件和异常情况。" },
  { title: "代码审查", content: "对以下代码进行 Code Review，从性能、安全性、可读性三个维度给出改进建议。" },
  { title: "架构设计", content: "我需要设计一个支持百万用户的实时聊天系统，请给出技术架构方案。" },
];

interface ProductDetailProps {
  product: DbProduct | null;
  open: boolean;
  onClose: () => void;
  onPromote?: (productId: string) => void;
}

export function ProductDetail({ product, open, onClose, onPromote }: ProductDetailProps) {
  const { user, isLoggedIn } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toggleUpvote = useToggleUpvote();
  const { data: userUpvotes = new Set<string>() } = useUserUpvotes(user?.id);

  if (!product) return null;

  const skills = ((product.skills as { name: string; description: string }[] | null) || []).length > 0
    ? (product.skills as { name: string; description: string }[])
    : fallbackSkills;
  const prompts = ((product.prompts as { title: string; content: string }[] | null) || []).length > 0
    ? (product.prompts as { title: string; content: string }[])
    : fallbackPrompts;
  const hasSkillsOrPrompts = true;

  const isUpvoted = userUpvotes instanceof Set ? userUpvotes.has(product.id) : false;

  const handleUpvote = () => {
    if (!isLoggedIn || !user) {
      toast.error("请先登录后再投票");
      return;
    }
    toggleUpvote.mutate({ userId: user.id, productId: product.id, isUpvoted });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Convert DbProduct to ShareDialog format
  const shareProduct = {
    id: product.id,
    name: product.name,
    slogan: product.slogan,
    description: product.description,
    logo: product.logo_url,
    tags: product.tags || [],
    category: product.category_id,
    upvotes: product.upvote_count || 0,
    views: product.views,
    comments: 0,
    website: product.website,
    verified: product.verified,
    featured: product.featured,
    maker: { name: product.maker_name, avatar: product.maker_avatar, title: product.maker_title },
    company: { name: product.company_name, founded: product.company_founded, location: product.company_location, funding: product.company_funding },
    benefits: product.benefits || [],
    launchDate: product.launch_date,
    rank: 0,
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
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
                    {product.featured && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild><Rocket className="h-4 w-4 text-[hsl(25,95%,53%)] cursor-pointer" /></TooltipTrigger>
                          <TooltipContent className="text-xs">csdn 助力新产品曝光中</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{product.slogan}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><ChevronUp className="h-3 w-3" />{(product.upvote_count || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Button onClick={handleUpvote} disabled={toggleUpvote.isPending} className={`gap-1.5 ${isUpvoted ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                <ChevronUp className="h-4 w-4" /> {(product.upvote_count || 0).toLocaleString()}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={product.website} target="_blank" rel="noopener noreferrer" className="gap-1.5">访问官网 <ExternalLink className="h-3 w-3" /></a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10" onClick={() => { onClose(); onPromote?.(product.id); }}>
                <Rocket className="h-3.5 w-3.5" /> 推广此项目
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShareOpen(true)}>
                <Share2 className="h-3.5 w-3.5" /> 分享
              </Button>
            </div>
          </div>

          <Separator />

          <div className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-secondary/50 mb-6">
                <TabsTrigger value="overview" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> 概览</TabsTrigger>
                {hasSkillsOrPrompts && (
                  <TabsTrigger value="skills" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> 技能 & Prompts</TabsTrigger>
                )}
                <TabsTrigger value="community" className="gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> 社区评价</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
                  <div className="space-y-5">
                    <div className="aspect-video rounded-lg bg-secondary/50 border border-border/40 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">🎬 产品演示视频</span>
                    </div>
                    {(product.tags && product.tags.length > 0) && (
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">产品介绍</h3>
                      <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{product.description}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">核心优势</h3>
                      <ul className="space-y-2">
                        {(product.benefits || []).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-0.5">✦</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Card className="bg-secondary/30 border-border/40">
                      <CardContent className="p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">创始人</h4>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">{product.maker_name[0]}</div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{product.maker_name}</p>
                            <p className="text-xs text-muted-foreground">{product.maker_title}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary/30 border-border/40">
                      <CardContent className="p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">公司信息</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">公司</span><span className="text-foreground">{product.company_name}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">成立</span><span className="text-foreground">{product.company_founded}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">地点</span><span className="text-foreground">{product.company_location}</span></div>
                          {product.company_funding && <div className="flex justify-between"><span className="text-muted-foreground">融资</span><span className="text-foreground">{product.company_funding}</span></div>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {hasSkillsOrPrompts && (
                <TabsContent value="skills">
                  <div className="space-y-6">
                    {skills.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Agent 技能</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {skills.map((skill) => (
                            <Card key={skill.name} className="bg-secondary/30 border-border/40 hover:border-primary/30 transition-colors">
                              <CardContent className="p-4 flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Zap className="h-4 w-4 text-primary" /></div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{skill.name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{skill.description}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    {prompts.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Terminal className="h-4 w-4 text-primary" /> 最佳 Prompt 库</h3>
                        <div className="space-y-3">
                          {prompts.map((p, idx) => (
                            <div key={idx} className="rounded-lg border border-border/40 overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 bg-secondary/40">
                                <span className="text-sm font-medium text-foreground">{p.title}</span>
                                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => handleCopy(`prompt-${idx}`, p.content)}>
                                  {copiedId === `prompt-${idx}` ? <><Check className="h-3 w-3 text-primary" /> 已复制</> : <><Copy className="h-3 w-3" /> 复制</>}
                                </Button>
                              </div>
                              <div className="px-4 py-3 bg-secondary font-mono text-xs text-muted-foreground leading-relaxed">{p.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="community">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> 评论</h3>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">我</div>
                    <div className="flex-1 space-y-2">
                      <Textarea placeholder="写下你的评论..." className="bg-secondary border-border/60 min-h-[72px] text-sm" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                      <div className="flex justify-end"><Button size="sm" className="bg-primary text-xs">发表评论</Button></div>
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
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1.5 transition-colors"><Reply className="h-3 w-3" /> 回复</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <ShareDialog product={shareProduct} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
