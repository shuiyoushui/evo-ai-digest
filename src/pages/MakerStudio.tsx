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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link2, Zap, Monitor, Target, FileText, ExternalLink, Send, ChevronDown } from "lucide-react";
import { categories } from "@/data/mockData";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Step = "url" | "analyzing" | "form";

const promotionServices = [
  { id: "display", title: "CSDN展示广告", desc: "在CSDN资源内投放Banner展示广告", icon: Monitor, color: "text-blue-400" },
  { id: "channel", title: "CSDN频道精准", desc: "在特定技术频道进行精准定向广告投放", icon: Target, color: "text-green-400" },
  { id: "non-standard", title: "CSDN非标合作", desc: "软文推广、公众号推送、达人内容合作", icon: FileText, color: "text-amber-400" },
  { id: "external", title: "站外付费流量", desc: "在CSDN资源外的商业投放推广", icon: ExternalLink, color: "text-purple-400" },
];

const mockProjects = [
  { id: "p1", name: "我的AI助手" },
  { id: "p2", name: "代码审查Bot" },
  { id: "p3", name: "智能翻译工具" },
];

const MakerStudio = () => {
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");

  const handleAnalyze = () => {
    if (!url) return;
    setStep("analyzing");
    setTimeout(() => setStep("form"), 2500);
  };

  const handleSubmitInquiry = () => {
    setInquiryOpen(false);
    toast.success("咨询请求已发送给CSDN管理员", { description: "我们将在1-2个工作日内联系您" });
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

          {/* SUBMIT TAB - keep existing */}
          <TabsContent value="submit">
            {step === "url" && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
                <h1 className="text-2xl font-bold text-foreground mb-2">提交你的AI产品</h1>
                <p className="text-muted-foreground text-sm mb-8">粘贴链接，AI自动分析并填充信息</p>
                <div className="w-full max-w-lg flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="粘贴产品URL或GitHub仓库链接..." className="pl-9 h-12 bg-secondary border-border text-base" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()} />
                  </div>
                  <Button onClick={handleAnalyze} className="h-12 px-6 gap-2 bg-primary"><Zap className="h-4 w-4" /> AI分析</Button>
                </div>
              </div>
            )}
            {step === "analyzing" && (
              <div className="space-y-6 animate-fade-in max-w-lg mx-auto py-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse"><Zap className="h-4 w-4 text-primary" /></div>
                  <span className="text-sm text-foreground font-medium">AI正在分析产品信息...</span>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="space-y-2"><Skeleton className="h-4 w-24 bg-secondary" /><Skeleton className="h-10 w-full bg-secondary" /></div>))}
              </div>
            )}
            {step === "form" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-lg font-bold text-foreground">产品信息</h2><p className="text-xs text-muted-foreground">AI已自动填充，请检查并补充</p></div>
                  <Button size="sm" variant="ghost" onClick={() => setStep("url")}>重新分析</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">产品名称</label><Input defaultValue="我的AI产品" className="bg-secondary" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">一句话介绍</label><Input defaultValue="用AI重新定义工作方式" className="bg-secondary" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">分类</label>
                    <Select defaultValue="productivity"><SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>))}</SelectContent></Select>
                  </div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">标签</label>
                    <div className="flex flex-wrap gap-1.5">{["AI助手", "效率", "自动化"].map((t) => (<Badge key={t} variant="secondary" className="text-xs">{t} ×</Badge>))}<Input placeholder="添加标签" className="h-6 w-20 text-xs bg-secondary" /></div>
                  </div>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">产品描述</label><Textarea defaultValue="这是一款基于大语言模型的AI产品..." className="bg-secondary min-h-[120px]" /></div>
                <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">相关链接</label>
                  <div className="grid grid-cols-2 gap-3"><Input placeholder="官网 URL" className="bg-secondary" defaultValue={url} /><Input placeholder="GitHub" className="bg-secondary" /></div>
                </div>
                <Card className="bg-card border-border"><CardHeader className="pb-3"><CardTitle className="text-sm">团队能力雷达</CardTitle><CardDescription className="text-xs">调整滑块以展示团队核心能力</CardDescription></CardHeader>
                  <CardContent className="space-y-4">{radarItems.map((item) => (<div key={item.label} className="space-y-1.5"><div className="flex justify-between text-xs"><span className="text-muted-foreground">{item.label}</span><span className="text-foreground font-medium">{item.value}%</span></div><Slider defaultValue={[item.value]} max={100} step={5} className="[&_[role=slider]]:bg-primary" /></div>))}</CardContent>
                </Card>
                <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">公司背景</label><Textarea placeholder="介绍团队和公司背景..." className="bg-secondary" /></div>
                <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setStep("url")}>返回</Button><Button className="bg-primary">提交审核</Button></div>
              </div>
            )}
          </TabsContent>

          {/* PROMOTION TAB - New */}
          <TabsContent value="promotion" className="space-y-6 animate-fade-in">
            {/* Project Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">当前项目:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {selectedProject.name} <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border z-50">
                  {mockProjects.map((proj) => (
                    <DropdownMenuItem key={proj.id} onClick={() => setSelectedProject(proj)} className="text-sm cursor-pointer">
                      {proj.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="text-lg font-bold text-foreground">推广服务</h3>
            <p className="text-sm text-muted-foreground -mt-4">选择适合的推广方案，提交咨询后CSDN团队将与您联系</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotionServices.map((svc) => (
                <Card key={svc.id} className="bg-card border-border hover-lift cursor-pointer group" onClick={() => { setInquiryService(svc.title); setInquiryOpen(true); }}>
                  <CardHeader className="pb-2">
                    <svc.icon className={`h-6 w-6 ${svc.color} mb-2`} />
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">{svc.title}</CardTitle>
                    <CardDescription className="text-xs">{svc.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                      <Send className="h-3 w-3" /> 立即咨询
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">提交咨询 - {inquiryService}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">联系人</label>
              <Input placeholder="您的姓名" className="bg-secondary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">电话 / 微信</label>
              <Input placeholder="方便联系的方式" className="bg-secondary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">预算范围</label>
              <Select>
                <SelectTrigger className="bg-secondary"><SelectValue placeholder="选择预算范围" /></SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="1-3">1万 - 3万</SelectItem>
                  <SelectItem value="3-5">3万 - 5万</SelectItem>
                  <SelectItem value="5-10">5万 - 10万</SelectItem>
                  <SelectItem value="10-20">10万 - 20万</SelectItem>
                  <SelectItem value="20+">20万以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">具体需求</label>
              <Textarea placeholder="请描述您的推广需求..." className="bg-secondary min-h-[80px]" />
            </div>
            <Button onClick={handleSubmitInquiry} className="w-full bg-primary gap-2">
              <Send className="h-3.5 w-3.5" /> 发送给管理员
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MakerStudio;
