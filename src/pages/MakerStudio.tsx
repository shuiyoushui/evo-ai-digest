import { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, Zap, Image, MapPin, Newspaper, BarChart3, Eye, MousePointer } from "lucide-react";
import { categories } from "@/data/mockData";

type Step = "url" | "analyzing" | "form";

const MakerStudio = () => {
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");

  const handleAnalyze = () => {
    if (!url) return;
    setStep("analyzing");
    setTimeout(() => setStep("form"), 2500);
  };

  const radarItems = [
    { label: "技术实力", value: 80 },
    { label: "产品设计", value: 70 },
    { label: "市场能力", value: 60 },
    { label: "团队背景", value: 85 },
    { label: "用户口碑", value: 75 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="submit">
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="submit">智能提交</TabsTrigger>
            <TabsTrigger value="promotion">推广中心</TabsTrigger>
          </TabsList>

          {/* SUBMIT */}
          <TabsContent value="submit">
            {step === "url" && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
                <h1 className="text-2xl font-bold text-foreground mb-2">提交你的AI产品</h1>
                <p className="text-muted-foreground text-sm mb-8">粘贴链接，AI自动分析并填充信息</p>
                <div className="w-full max-w-lg flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="粘贴产品URL或GitHub仓库链接..."
                      className="pl-9 h-12 bg-secondary border-border text-base"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    />
                  </div>
                  <Button onClick={handleAnalyze} className="h-12 px-6 gap-2 bg-primary">
                    <Zap className="h-4 w-4" /> AI分析
                  </Button>
                </div>
              </div>
            )}

            {step === "analyzing" && (
              <div className="space-y-6 animate-fade-in max-w-lg mx-auto py-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse-glow">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground font-medium">AI正在分析产品信息...</span>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2" style={{ animationDelay: `${i * 200}ms` }}>
                    <Skeleton className="h-4 w-24 bg-secondary" />
                    <Skeleton className="h-10 w-full bg-secondary" />
                  </div>
                ))}
              </div>
            )}

            {step === "form" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">产品信息</h2>
                    <p className="text-xs text-muted-foreground">AI已自动填充，请检查并补充</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setStep("url")}>重新分析</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">产品名称</label>
                    <Input defaultValue="我的AI产品" className="bg-secondary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">一句话介绍</label>
                    <Input defaultValue="用AI重新定义工作方式" className="bg-secondary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">分类</label>
                    <Select defaultValue="productivity">
                      <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">标签</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["AI助手", "效率", "自动化"].map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t} ×</Badge>
                      ))}
                      <Input placeholder="添加标签" className="h-6 w-20 text-xs bg-secondary" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">产品描述</label>
                  <Textarea defaultValue="这是一款基于大语言模型的AI产品，帮助用户提升工作效率..." className="bg-secondary min-h-[120px]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">相关链接</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="官网 URL" className="bg-secondary" defaultValue={url} />
                    <Input placeholder="GitHub" className="bg-secondary" />
                  </div>
                </div>

                {/* Team Radar */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">团队能力雷达</CardTitle>
                    <CardDescription className="text-xs">调整滑块以展示团队核心能力</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {radarItems.map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="text-foreground font-medium">{item.value}%</span>
                        </div>
                        <Slider defaultValue={[item.value]} max={100} step={5} className="[&_[role=slider]]:bg-primary" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">公司背景</label>
                  <Textarea placeholder="介绍团队和公司背景..." className="bg-secondary" />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setStep("url")}>返回</Button>
                  <Button className="bg-primary">提交审核</Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* PROMOTION */}
          <TabsContent value="promotion" className="space-y-6 animate-fade-in">
            {/* Stats */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />流量数据</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-secondary">
                    <Eye className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">12,456</p>
                    <p className="text-xs text-muted-foreground">总浏览</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary">
                    <MousePointer className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">3,210</p>
                    <p className="text-xs text-muted-foreground">点击量</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary">
                    <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">25.8%</p>
                    <p className="text-xs text-muted-foreground">转化率</p>
                  </div>
                </div>
                {/* Mini chart placeholder */}
                <div className="mt-4 h-32 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">📊 流量趋势图</span>
                </div>
              </CardContent>
            </Card>

            {/* Buy Traffic */}
            <h3 className="text-sm font-semibold text-foreground">购买推广</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border hover-lift cursor-pointer">
                <CardHeader className="pb-2">
                  <Image className="h-5 w-5 text-primary mb-1" />
                  <CardTitle className="text-sm">站内横幅广告</CardTitle>
                  <CardDescription className="text-xs">首页顶部Banner位</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-foreground">¥2,999<span className="text-xs text-muted-foreground font-normal">/周</span></p>
                  <Button size="sm" className="w-full mt-3 bg-primary" variant="default">上传素材</Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover-lift cursor-pointer">
                <CardHeader className="pb-2">
                  <MapPin className="h-5 w-5 text-primary mb-1" />
                  <CardTitle className="text-sm">分类置顶</CardTitle>
                  <CardDescription className="text-xs">在指定分类中排名第一</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-foreground">¥999<span className="text-xs text-muted-foreground font-normal">/周</span></p>
                  <Select>
                    <SelectTrigger className="bg-secondary mt-2 h-8 text-xs"><SelectValue placeholder="选择分类" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover-lift cursor-pointer">
                <CardHeader className="pb-2">
                  <Newspaper className="h-5 w-5 text-primary mb-1" />
                  <CardTitle className="text-sm">站外媒体包</CardTitle>
                  <CardDescription className="text-xs">多渠道分发推广</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-foreground">¥4,999<span className="text-xs text-muted-foreground font-normal">/次</span></p>
                  <div className="space-y-2 mt-3">
                    {["CSDN 专栏", "社交媒体", "邮件Newsletter"].map((ch) => (
                      <label key={ch} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox className="h-3.5 w-3.5" />
                        {ch}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MakerStudio;
