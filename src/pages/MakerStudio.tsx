import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Link2, Zap, LayoutTemplate, Megaphone, Feather, Globe, Send, ChevronDown,
  Plane, Eye, Pencil, Trash2, ExternalLink,
} from "lucide-react";
import { categories, products } from "@/data/mockData";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Step = "url" | "analyzing" | "form";

const promotionServices = [
  { id: "display", title: "CSDN 展示广告", desc: "首页及侧边栏Banner广告投放", icon: LayoutTemplate, color: "text-blue-400", hot: false },
  { id: "channel", title: "CSDN 用户通道广告", desc: "特定技术频道精准曝光（如 Python、AI）", icon: Megaphone, color: "text-emerald-400", hot: false },
  { id: "non-standard", title: "CSDN 非标推广", desc: "软文推广、公众号推送、达人内容合作", icon: Feather, color: "text-amber-400", hot: false },
  { id: "domestic", title: "国内其他平台付费推广", desc: "CSDN 资源外的国内商业投放推广", icon: Globe, color: "text-purple-400", hot: false },
  { id: "overseas", title: "海外推广", desc: "Product Hunt、Hacker News 及全球媒体投放推广", icon: Plane, color: "text-rose-400", hot: true },
];

const mockProjects = [
  { id: "p1", name: "我的AI助手", slogan: "你的智能工作伙伴", status: "已上线", date: "2024-03-15" },
  { id: "p2", name: "代码审查Bot", slogan: "AI自动代码审查", status: "审核中", date: "2024-03-10" },
  { id: "p3", name: "智能翻译工具", slogan: "多语言实时翻译", status: "已上线", date: "2024-02-20" },
  ...products.slice(0, 3).map((p) => ({ id: p.id, name: p.name, slogan: p.slogan, status: "已上线", date: p.launchDate })),
];

const uniqueProjects = mockProjects.filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i);

const MakerStudio = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("submit");
  const [selectedProject, setSelectedProject] = useState(uniqueProjects[0]);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");
  const [myProjects, setMyProjects] = useState(uniqueProjects);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof uniqueProjects[0] | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const projectName = searchParams.get("project");
    if (tab === "promotion") {
      setActiveTab("promotion");
      if (projectName) {
        const found = uniqueProjects.find((p) => p.name === projectName);
        if (found) setSelectedProject(found);
      }
    }
  }, [searchParams]);

  const handleAnalyze = () => {
    if (!url) return;
    setStep("analyzing");
    setTimeout(() => setStep("form"), 2500);
  };

  const handleSubmitInquiry = () => {
    setInquiryOpen(false);
    toast.success("咨询请求已发送给CSDN管理员", { description: "我们将在1-2个工作日内联系您" });
  };

  const handleDeleteProject = (id: string) => {
    setMyProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success("项目已删除");
  };

  const handleEditProject = (proj: typeof uniqueProjects[0]) => {
    setEditingProject({ ...proj });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProject) return;
    setMyProjects((prev) => prev.map((p) => p.id === editingProject.id ? editingProject : p));
    setEditOpen(false);
    toast.success("项目信息已更新");
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="submit">智能提交</TabsTrigger>
            <TabsTrigger value="projects">我的项目</TabsTrigger>
            <TabsTrigger value="promotion">推广中心</TabsTrigger>
          </TabsList>

          {/* SUBMIT TAB */}
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

          {/* MY PROJECTS TAB */}
          <TabsContent value="projects" className="animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-4">我的项目</h3>
            {myProjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">暂无项目，去提交一个吧</div>
            ) : (
              <div className="space-y-3">
                {myProjects.map((proj) => (
                  <Card key={proj.id} className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center font-bold text-sm shrink-0 border border-border/40">
                        {proj.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">{proj.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{proj.slogan}</p>
                      </div>
                      <Badge variant={proj.status === "已上线" ? "default" : "secondary"} className="text-[10px] shrink-0">
                        {proj.status}
                      </Badge>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="查看">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="编辑" onClick={() => handleEditProject(proj)}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="删除">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>确定要删除「{proj.name}」吗？此操作不可恢复。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteProject(proj.id)}>删除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PROMOTION TAB */}
          <TabsContent value="promotion" className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">当前项目:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {selectedProject.name} <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border z-50 max-h-60 overflow-y-auto">
                  {uniqueProjects.map((proj) => (
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
                <Card key={svc.id} className={`bg-card border-border hover-lift cursor-pointer group relative ${svc.hot ? "ring-1 ring-rose-500/30" : ""}`} onClick={() => { setInquiryService(svc.title); setInquiryOpen(true); }}>
                  {svc.hot && (
                    <Badge className="absolute -top-2 right-3 bg-rose-500 text-white text-[10px] px-2 py-0.5">Hot</Badge>
                  )}
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
            <div className="text-xs text-muted-foreground">推广项目: <span className="text-foreground font-medium">{selectedProject.name}</span></div>
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

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">编辑项目</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">产品名称</label>
                <Input value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} className="bg-secondary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">一句话介绍</label>
                <Input value={editingProject.slogan} onChange={(e) => setEditingProject({ ...editingProject, slogan: e.target.value })} className="bg-secondary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">官网链接</label>
                <Input placeholder="https://..." className="bg-secondary" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
                <Button className="bg-primary" onClick={handleSaveEdit}>保存</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MakerStudio;
