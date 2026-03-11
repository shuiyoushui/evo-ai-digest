import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LayoutDashboard, FileText, Megaphone, Settings, Plus, Eye, ThumbsUp, Clock, MessageCircle, Save, Image, Upload, Pencil, Trash2, AlertTriangle, Lock, Cpu, FolderTree } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockInquiries } from "@/data/mockData";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { useAllProducts, useUpdateProduct } from "@/hooks/useProducts";
import { useAllRecommendations, useUpdateRecommendation, useCreateRecommendation, useDeleteRecommendation } from "@/hooks/useRecommendations";
import { useServiceCategories, useCreateServiceCategory, useUpdateServiceCategory, useDeleteServiceCategory } from "@/hooks/useServiceCategories";
import { useDisplayModules, useUpdateDisplayModule } from "@/hooks/useDisplayModules";
import { useAuth } from "@/contexts/AuthContext";
import { defaultBannerSlides, type BannerSlide } from "@/components/home/HomeBanner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const sidebarItems = [
  { id: "overview", label: "数据总览", icon: LayoutDashboard },
  { id: "submissions", label: "产品审核", icon: FileText },
  { id: "ads", label: "广告管理", icon: Megaphone },
  { id: "config", label: "系统配置", icon: Settings },
];

const statusMap: Record<string, string> = { pending: "待审核", approved: "已通过", rejected: "已拒绝" };

const categoryInquiryData = [
  { name: "开发与编程", value: 45 },
  { name: "视觉与创意", value: 30 },
  { name: "智能体", value: 25 },
  { name: "效率与办公", value: 18 },
  { name: "写作营销", value: 10 },
];

const serviceTypeData = [
  { name: "种子用户", value: 42 },
  { name: "体验评测", value: 31 },
  { name: "规模增长", value: 27 },
];

const PIE_COLORS = [
  "hsl(230, 90%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
  "hsl(350, 80%, 55%)",
];

const AI_MODELS = [
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (推荐)" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5", label: "GPT-5" },
];

const Admin = () => {
  const { isAdmin, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [weights, setWeights] = useState({ upvotes: 40, views: 25, comments: 20, decay: 15 });
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(defaultBannerSlides);
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { data: allProducts = [], isLoading } = useAllProducts();
  const updateProduct = useUpdateProduct();
  const { data: llmRecs = [], isLoading: llmLoading } = useAllRecommendations();
  const updateRec = useUpdateRecommendation();
  const createRec = useCreateRecommendation();
  const deleteRec = useDeleteRecommendation();

  // Service categories
  const { data: serviceCategories = [] } = useServiceCategories();
  const createServiceCat = useCreateServiceCategory();
  const updateServiceCat = useUpdateServiceCategory();
  const deleteServiceCat = useDeleteServiceCategory();

  // Display modules
  const { data: displayModules = [] } = useDisplayModules();
  const updateDisplayModule = useUpdateDisplayModule();

  // LLM rec editing
  const [llmEditOpen, setLlmEditOpen] = useState(false);
  const [llmEditId, setLlmEditId] = useState<string | null>(null);
  const [llmEditName, setLlmEditName] = useState("");
  const [llmEditTag, setLlmEditTag] = useState("");
  const [llmEditOrder, setLlmEditOrder] = useState(0);

  // Category editing
  const [catEditOpen, setCatEditOpen] = useState(false);
  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [catEditNewId, setCatEditNewId] = useState("");
  const [catEditLabel, setCatEditLabel] = useState("");
  const [catEditIcon, setCatEditIcon] = useState("");
  const [catEditOrder, setCatEditOrder] = useState(0);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<string | null>(null);

  // Service category editing
  const [svcEditOpen, setSvcEditOpen] = useState(false);
  const [svcEditId, setSvcEditId] = useState<string | null>(null);
  const [svcEditParent, setSvcEditParent] = useState<string | null>(null);
  const [svcEditLabel, setSvcEditLabel] = useState("");
  const [svcEditDesc, setSvcEditDesc] = useState("");
  const [svcEditIcon, setSvcEditIcon] = useState("Cpu");
  const [svcEditOrder, setSvcEditOrder] = useState(0);
  const [svcDeleteConfirm, setSvcDeleteConfirm] = useState<string | null>(null);

  // Category sort order (kept for backward compat)
  const [catOrderList, setCatOrderList] = useState<Array<{ id: string; label: string; icon: string; sort_order: number }>>([]);
  const [savingCatOrder, setSavingCatOrder] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      setCatOrderList(categories.map(c => ({ ...c })));
    }
  }, [categories]);

  const handleSaveCategoryOrder = async () => {
    setSavingCatOrder(true);
    try {
      for (const cat of catOrderList) {
        await updateCategory.mutateAsync({ id: cat.id, sort_order: cat.sort_order });
      }
      toast.success("分类排序已保存");
    } catch (e: any) {
      toast.error("保存失败", { description: e.message });
    } finally {
      setSavingCatOrder(false);
    }
  };

  const [aiModel, setAiModel] = useState("google/gemini-3-flash-preview");
  const [aiCustomModel, setAiCustomModel] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiEndpoint, setAiEndpoint] = useState("https://ai.gateway.lovable.dev/v1/chat/completions");
  const [scraperEndpoint, setScraperEndpoint] = useState("https://api.firecrawl.dev/v1/scrape");
  const [aiApiKeyName, setAiApiKeyName] = useState("LOVABLE_API_KEY");
  const [scraperApiKeyName, setScraperApiKeyName] = useState("FIRECRAWL_API_KEY");
  const [aiConfigLoaded, setAiConfigLoaded] = useState(false);

  useEffect(() => {
    const loadAiConfig = async () => {
      const { data } = await supabase
        .from("ai_config")
        .select("*")
        .eq("config_key", "analyze_url")
        .single();
      if (data) {
        const d = data as any;
        const model = d.model || "google/gemini-3-flash-preview";
        const isPreset = AI_MODELS.some((m) => m.value === model);
        setAiModel(isPreset ? model : "__custom__");
        setAiCustomModel(isPreset ? "" : model);
        setAiPrompt(d.system_prompt || "");
        setAiEnabled(d.enabled ?? true);
        setAiEndpoint(d.ai_endpoint || "https://ai.gateway.lovable.dev/v1/chat/completions");
        setScraperEndpoint(d.scraper_endpoint || "https://api.firecrawl.dev/v1/scrape");
        setAiApiKeyName(d.ai_api_key_name || "LOVABLE_API_KEY");
        setScraperApiKeyName(d.scraper_api_key_name || "FIRECRAWL_API_KEY");
        setAiConfigLoaded(true);
      }
    };
    loadAiConfig();
  }, []);

  const updateBanner = (index: number, field: keyof BannerSlide, value: string | boolean) => {
    setBannerSlides((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSaveConfig = async () => {
    const resolvedModel = aiModel === "__custom__" ? aiCustomModel : aiModel;
    if (!resolvedModel.trim()) {
      toast.error("请填写 AI 模型");
      return;
    }
    try {
      const { error } = await supabase
        .from("ai_config")
        .update({
          model: resolvedModel,
          system_prompt: aiPrompt,
          enabled: aiEnabled,
          ai_endpoint: aiEndpoint,
          scraper_endpoint: scraperEndpoint,
          ai_api_key_name: aiApiKeyName,
          scraper_api_key_name: scraperApiKeyName,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("config_key", "analyze_url");
      if (error) throw error;
      toast.success("系统配置已保存");
    } catch (e: any) {
      toast.error("保存失败", { description: e.message });
    }
  };

  // Helpers for service categories
  const topLevelSvcCats = serviceCategories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => serviceCategories.filter(c => c.parent_id === parentId);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-border/60 min-h-[calc(100vh-56px)] p-4 hidden md:block">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">管理后台</h3>
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${activeTab === item.id ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-secondary rounded-none">
              {sidebarItems.map((i) => <TabsTrigger key={i.id} value={i.id} className="text-xs">{i.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>

        <main className="flex-1 p-6 pb-24">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">数据总览</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "总产品数", value: "1,284", icon: FileText },
                  { label: "今日提交", value: "23", icon: Plus },
                  { label: "总用户数", value: "45.2K", icon: Eye },
                  { label: "本月收入", value: "¥89,200", icon: Megaphone },
                ].map((s) => (
                  <Card key={s.label} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2"><s.icon className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{s.label}</span></div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-card border-border"><CardContent className="p-4"><div className="h-48 rounded-lg bg-secondary/50 flex items-center justify-center"><span className="text-sm text-muted-foreground">📊 平台趋势图表</span></div></CardContent></Card>
            </div>
          )}

          {/* SUBMISSIONS */}
          {activeTab === "submissions" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">产品审核</h2>
              <Card className="bg-card border-border">
                <Table>
                  <TableHeader><TableRow className="border-border">
                    <TableHead className="text-xs">产品名称</TableHead><TableHead className="text-xs">提交者</TableHead><TableHead className="text-xs">日期</TableHead><TableHead className="text-xs">状态</TableHead><TableHead className="text-xs text-right">操作</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">加载中...</TableCell></TableRow>
                    ) : allProducts.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">暂无产品</TableCell></TableRow>
                    ) : allProducts.map((s: any) => (
                      <TableRow key={s.id} className="border-border">
                        <TableCell className="text-sm font-medium">{s.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.maker_name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{statusMap[s.status] || s.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                          {s.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" className="text-xs h-7 text-green-500" onClick={() => updateProduct.mutate({ id: s.id, status: "approved" })}>通过</Button>
                              <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" onClick={() => updateProduct.mutate({ id: s.id, status: "rejected" })}>拒绝</Button>
                            </>
                          )}
                          {s.status !== "pending" && <span className="text-xs text-muted-foreground">已处理</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* ADS MANAGEMENT */}
          {activeTab === "ads" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">推广管理</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "推广请求总数", value: "128" },
                  { label: "技术服务请求总数", value: "47" },
                ].map((kpi) => (
                  <Card key={kpi.label} className="bg-card border-border">
                    <CardContent className="p-5 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">近期推广记录</CardTitle></CardHeader>
                <Table>
                  <TableHeader><TableRow className="border-border">
                    <TableHead className="text-xs">项目名称</TableHead>
                    <TableHead className="text-xs">服务类型</TableHead>
                    <TableHead className="text-xs">预算</TableHead>
                    <TableHead className="text-xs">目标详情</TableHead>
                    <TableHead className="text-xs">日期</TableHead>
                    <TableHead className="text-xs">状态</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {mockInquiries.map((inq) => (
                      <TableRow key={inq.id} className="border-border">
                        <TableCell className="text-sm font-medium">{inq.projectName}</TableCell>
                        <TableCell>
                          <Badge variant={inq.serviceType === "种子用户" ? "default" : inq.serviceType === "体验评测" ? "secondary" : "outline"} className="text-[10px]">{inq.serviceType}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{inq.budget}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{inq.goalDetails}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{inq.date}</TableCell>
                        <TableCell>
                          <Badge variant={inq.status === "已完成" ? "default" : inq.status === "已跟进" ? "secondary" : "outline"} className="text-[10px]">{inq.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* CONFIG */}
          {activeTab === "config" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">系统配置</h2>

              {/* Banner Config */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">首页Banner配置</CardTitle>
                  </div>
                  <CardDescription className="text-xs">管理首页轮播图的展示内容和状态</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bannerSlides.map((slide, i) => (
                    <div key={slide.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/40 border border-border/30">
                      <div className={`h-20 w-28 rounded-lg border-2 border-dashed border-border/60 bg-gradient-to-br ${slide.gradient} flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-primary/50 transition-colors group`}>
                        <Upload className="h-4 w-4 text-white/60 group-hover:text-white/90 transition-colors" />
                        <span className="text-[9px] text-white/60 mt-1 group-hover:text-white/90">点击上传图片</span>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">标题</label>
                          <Input value={slide.title} onChange={(e) => updateBanner(i, "title", e.target.value)} className="bg-secondary h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">链接地址</label>
                          <Input value={slide.link} onChange={(e) => updateBanner(i, "link", e.target.value)} className="bg-secondary h-8 text-xs font-mono" placeholder="https://..." />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                        <label className="text-[10px] text-muted-foreground">启用</label>
                        <Switch checked={slide.active} onCheckedChange={(v) => updateBanner(i, "active", v)} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Display Modules Config - Database backed */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">产品详情页模块配置</CardTitle>
                  <CardDescription className="text-xs">控制产品详情页各模块的展示状态（实时生效）</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayModules.map((mod) => (
                    <div key={mod.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground">{mod.label}</p>
                        <p className="text-xs text-muted-foreground">{mod.description}</p>
                      </div>
                      <Switch
                        checked={mod.enabled}
                        onCheckedChange={(v) => updateDisplayModule.mutate({ id: mod.id, enabled: v })}
                      />
                    </div>
                  ))}
                  {displayModules.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">暂无模块配置</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3"><CardTitle className="text-sm">排名算法权重</CardTitle><CardDescription className="text-xs">调整各因素在排名中的权重占比（总和需为100%）</CardDescription></CardHeader>
                <CardContent className="space-y-5">
                  {([
                    { key: "upvotes" as const, label: "投票权重", icon: ThumbsUp },
                    { key: "views" as const, label: "浏览权重", icon: Eye },
                    { key: "comments" as const, label: "评论权重", icon: MessageCircle },
                    { key: "decay" as const, label: "时间衰减", icon: Clock },
                  ]).map((w) => (
                    <div key={w.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><w.icon className="h-3 w-3" />{w.label}</span>
                        <span className="text-foreground font-semibold font-mono">{weights[w.key]}%</span>
                      </div>
                      <Slider value={[weights[w.key]]} onValueChange={([v]) => setWeights({ ...weights, [w.key]: v })} max={100} step={5} className="[&_[role=slider]]:bg-primary" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Config - Database-backed */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">AI 智能解析配置</CardTitle>
                      <CardDescription className="text-xs">配置产品URL解析使用的AI模型和提示词</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">启用</span>
                      <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">AI Endpoint</label>
                      <Input value={aiEndpoint} onChange={(e) => setAiEndpoint(e.target.value)} className="bg-secondary font-mono text-xs" placeholder="https://ai.gateway.lovable.dev/v1/chat/completions" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">AI API Key 环境变量名</label>
                      <Input value={aiApiKeyName} onChange={(e) => setAiApiKeyName(e.target.value)} className="bg-secondary font-mono text-xs" placeholder="LOVABLE_API_KEY" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">爬虫 Endpoint</label>
                      <Input value={scraperEndpoint} onChange={(e) => setScraperEndpoint(e.target.value)} className="bg-secondary font-mono text-xs" placeholder="https://api.firecrawl.dev/v1/scrape" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">爬虫 API Key 环境变量名</label>
                      <Input value={scraperApiKeyName} onChange={(e) => setScraperApiKeyName(e.target.value)} className="bg-secondary font-mono text-xs" placeholder="FIRECRAWL_API_KEY" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">AI 模型</label>
                    <Select value={aiModel} onValueChange={(v) => { setAiModel(v); if (v !== "__custom__") setAiCustomModel(""); }}>
                      <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                        <SelectItem value="__custom__">自定义模型 ID...</SelectItem>
                      </SelectContent>
                    </Select>
                    {aiModel === "__custom__" && (
                      <Input value={aiCustomModel} onChange={(e) => setAiCustomModel(e.target.value)} className="bg-secondary font-mono text-xs mt-2" placeholder="输入自定义模型 ID，如 volcengine/doubao-pro" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">System Prompt</label>
                    <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="bg-secondary font-mono text-xs min-h-[120px] leading-relaxed" placeholder="输入系统提示词..." />
                  </div>
                </CardContent>
              </Card>

              {/* Category Management - Full CRUD */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">产品分类管理</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                        setCatEditId(null); setCatEditNewId(""); setCatEditLabel(""); setCatEditIcon(""); setCatEditOrder(catOrderList.length); setCatEditOpen(true);
                      }}>
                        <Plus className="h-3 w-3" /> 新增分类
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleSaveCategoryOrder} disabled={savingCatOrder}>
                        <Save className="h-3 w-3" /> {savingCatOrder ? "保存中..." : "保存排序"}
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">管理产品分类的名称、图标和排序</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border bg-secondary/30">
                          <TableHead className="text-xs font-medium">图标</TableHead>
                          <TableHead className="text-xs font-medium">分类ID</TableHead>
                          <TableHead className="text-xs font-medium">分类名称</TableHead>
                          <TableHead className="text-xs font-medium text-center">排序值</TableHead>
                          <TableHead className="text-xs font-medium text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {catOrderList.map((cat, idx) => (
                          <TableRow key={cat.id} className="border-border">
                            <TableCell className="text-base">{cat.icon}</TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">{cat.id}</TableCell>
                            <TableCell className="text-sm font-medium">{cat.label}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                value={cat.sort_order}
                                onChange={(e) => {
                                  const newList = [...catOrderList];
                                  newList[idx] = { ...newList[idx], sort_order: parseInt(e.target.value) || 0 };
                                  setCatOrderList(newList);
                                }}
                                className="w-16 h-7 text-xs text-center bg-secondary mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                  setCatEditId(cat.id); setCatEditNewId(cat.id); setCatEditLabel(cat.label); setCatEditIcon(cat.icon); setCatEditOrder(cat.sort_order); setCatEditOpen(true);
                                }}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setCatDeleteConfirm(cat.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Service Categories Management */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">服务中心分类管理</CardTitle>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                      setSvcEditId(null); setSvcEditParent(null); setSvcEditLabel(""); setSvcEditDesc(""); setSvcEditIcon("Cpu"); setSvcEditOrder(topLevelSvcCats.length); setSvcEditOpen(true);
                    }}>
                      <Plus className="h-3 w-3" /> 新增一级分类
                    </Button>
                  </div>
                  <CardDescription className="text-xs">管理服务中心的分类和子服务（树形结构）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border bg-secondary/30">
                          <TableHead className="text-xs font-medium">名称</TableHead>
                          <TableHead className="text-xs font-medium">描述</TableHead>
                          <TableHead className="text-xs font-medium text-center">排序</TableHead>
                          <TableHead className="text-xs font-medium text-center">启用</TableHead>
                          <TableHead className="text-xs font-medium text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topLevelSvcCats.map((cat) => (
                          <>
                            <TableRow key={cat.id} className="border-border bg-secondary/20">
                              <TableCell className="text-sm font-semibold">{cat.icon} {cat.label}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{cat.description}</TableCell>
                              <TableCell className="text-center text-xs text-muted-foreground">{cat.sort_order}</TableCell>
                              <TableCell className="text-center">
                                <Switch checked={cat.enabled} onCheckedChange={(v) => updateServiceCat.mutate({ id: cat.id, enabled: v })} />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => {
                                    setSvcEditId(null); setSvcEditParent(cat.id); setSvcEditLabel(""); setSvcEditDesc(""); setSvcEditIcon("Cpu"); setSvcEditOrder(getChildren(cat.id).length); setSvcEditOpen(true);
                                  }}>
                                    <Plus className="h-3 w-3" /> 子项
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                    setSvcEditId(cat.id); setSvcEditParent(cat.parent_id); setSvcEditLabel(cat.label); setSvcEditDesc(cat.description); setSvcEditIcon(cat.icon); setSvcEditOrder(cat.sort_order); setSvcEditOpen(true);
                                  }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setSvcDeleteConfirm(cat.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {getChildren(cat.id).map((child) => (
                              <TableRow key={child.id} className="border-border">
                                <TableCell className="text-sm pl-8">↳ {child.label}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{child.description}</TableCell>
                                <TableCell className="text-center text-xs text-muted-foreground">{child.sort_order}</TableCell>
                                <TableCell className="text-center">
                                  <Switch checked={child.enabled} onCheckedChange={(v) => updateServiceCat.mutate({ id: child.id, enabled: v })} />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                      setSvcEditId(child.id); setSvcEditParent(child.parent_id); setSvcEditLabel(child.label); setSvcEditDesc(child.description); setSvcEditIcon(child.icon); setSvcEditOrder(child.sort_order); setSvcEditOpen(true);
                                    }}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setSvcDeleteConfirm(child.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        ))}
                        {topLevelSvcCats.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">暂无服务分类，点击上方按钮新增</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* LLM Recommendations Management */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">大模型优选推荐</CardTitle>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { setLlmEditId(null); setLlmEditName(""); setLlmEditTag(""); setLlmEditOrder(llmRecs.length + 1); setLlmEditOpen(true); }}>
                      <Plus className="h-3 w-3" /> 新增
                    </Button>
                  </div>
                  <CardDescription className="text-xs">管理大模型接入的优选推荐列表（名称、标签、排序、启用状态）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border bg-secondary/30">
                          <TableHead className="text-xs font-medium">模型名称</TableHead>
                          <TableHead className="text-xs font-medium">推荐标签</TableHead>
                          <TableHead className="text-xs font-medium text-center">排序</TableHead>
                          <TableHead className="text-xs font-medium text-center">启用</TableHead>
                          <TableHead className="text-xs font-medium text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {llmRecs.map((rec) => (
                          <TableRow key={rec.id} className="border-border">
                            <TableCell className="text-sm font-medium">{rec.name}</TableCell>
                            <TableCell>{rec.tag ? <Badge variant="secondary" className="text-[10px]">{rec.tag}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                            <TableCell className="text-center text-xs text-muted-foreground">{rec.sort_order}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={rec.enabled} onCheckedChange={(v) => updateRec.mutate({ id: rec.id, enabled: v })} />
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setLlmEditId(rec.id); setLlmEditName(rec.name); setLlmEditTag(rec.tag); setLlmEditOrder(rec.sort_order); setLlmEditOpen(true); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { deleteRec.mutate(rec.id); toast.success("已删除"); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {llmRecs.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">暂无推荐数据</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Sticky footer for Config page */}
      {activeTab === "config" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-end gap-3">
            <Button variant="ghost" className="text-sm">取消</Button>
            <Button className="bg-primary text-sm gap-1.5" onClick={handleSaveConfig}>
              <Save className="h-3.5 w-3.5" /> 保存配置
            </Button>
          </div>
        </div>
      )}

      {/* LLM Recommendation Edit/Create Dialog */}
      <Dialog open={llmEditOpen} onOpenChange={setLlmEditOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{llmEditId ? "编辑推荐模型" : "新增推荐模型"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">模型名称</label>
              <Input value={llmEditName} onChange={(e) => setLlmEditName(e.target.value)} className="bg-secondary" placeholder="如 DeepSeek V3" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">推荐标签</label>
              <Input value={llmEditTag} onChange={(e) => setLlmEditTag(e.target.value)} className="bg-secondary" placeholder="如 性价比之王（留空则无标签）" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">排序</label>
              <Input type="number" value={llmEditOrder} onChange={(e) => setLlmEditOrder(Number(e.target.value))} className="bg-secondary" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLlmEditOpen(false)}>取消</Button>
              <Button className="bg-primary" onClick={() => {
                if (!llmEditName.trim()) { toast.error("请填写模型名称"); return; }
                if (llmEditId) {
                  updateRec.mutate({ id: llmEditId, name: llmEditName, tag: llmEditTag, sort_order: llmEditOrder });
                } else {
                  createRec.mutate({ name: llmEditName, tag: llmEditTag, sort_order: llmEditOrder });
                }
                setLlmEditOpen(false);
                toast.success(llmEditId ? "已更新" : "已新增");
              }}>保存</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Edit/Create Dialog */}
      <Dialog open={catEditOpen} onOpenChange={setCatEditOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{catEditId ? "编辑分类" : "新增分类"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {!catEditId && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">分类 ID（唯一标识，创建后不可修改）</label>
                <Input value={catEditNewId} onChange={(e) => setCatEditNewId(e.target.value)} className="bg-secondary font-mono" placeholder="如 devcode" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">分类名称</label>
              <Input value={catEditLabel} onChange={(e) => setCatEditLabel(e.target.value)} className="bg-secondary" placeholder="如 开发与编程" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">图标（Emoji）</label>
              <Input value={catEditIcon} onChange={(e) => setCatEditIcon(e.target.value)} className="bg-secondary" placeholder="如 💻" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">排序</label>
              <Input type="number" value={catEditOrder} onChange={(e) => setCatEditOrder(Number(e.target.value))} className="bg-secondary" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCatEditOpen(false)}>取消</Button>
              <Button className="bg-primary" onClick={async () => {
                if (!catEditLabel.trim()) { toast.error("请填写分类名称"); return; }
                try {
                  if (catEditId) {
                    await updateCategory.mutateAsync({ id: catEditId, label: catEditLabel, icon: catEditIcon, sort_order: catEditOrder });
                  } else {
                    if (!catEditNewId.trim()) { toast.error("请填写分类 ID"); return; }
                    await createCategory.mutateAsync({ id: catEditNewId, label: catEditLabel, icon: catEditIcon, sort_order: catEditOrder });
                  }
                  setCatEditOpen(false);
                  toast.success(catEditId ? "分类已更新" : "分类已新增");
                } catch (e: any) {
                  toast.error("操作失败", { description: e.message });
                }
              }}>保存</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Delete Confirm */}
      <AlertDialog open={!!catDeleteConfirm} onOpenChange={() => setCatDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分类？</AlertDialogTitle>
            <AlertDialogDescription>删除后该分类下的产品将失去分类关联，此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              if (catDeleteConfirm) {
                try {
                  await deleteCategory.mutateAsync(catDeleteConfirm);
                  toast.success("分类已删除");
                } catch (e: any) {
                  toast.error("删除失败", { description: e.message });
                }
              }
              setCatDeleteConfirm(null);
            }}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service Category Edit/Create Dialog */}
      <Dialog open={svcEditOpen} onOpenChange={setSvcEditOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{svcEditId ? "编辑服务分类" : (svcEditParent ? "新增子服务" : "新增一级分类")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">名称</label>
              <Input value={svcEditLabel} onChange={(e) => setSvcEditLabel(e.target.value)} className="bg-secondary" placeholder="如 自助推广" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">描述</label>
              <Input value={svcEditDesc} onChange={(e) => setSvcEditDesc(e.target.value)} className="bg-secondary" placeholder="简短描述" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">图标</label>
              <Input value={svcEditIcon} onChange={(e) => setSvcEditIcon(e.target.value)} className="bg-secondary" placeholder="Lucide 图标名或 Emoji" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">排序</label>
              <Input type="number" value={svcEditOrder} onChange={(e) => setSvcEditOrder(Number(e.target.value))} className="bg-secondary" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSvcEditOpen(false)}>取消</Button>
              <Button className="bg-primary" onClick={async () => {
                if (!svcEditLabel.trim()) { toast.error("请填写名称"); return; }
                try {
                  if (svcEditId) {
                    await updateServiceCat.mutateAsync({ id: svcEditId, label: svcEditLabel, description: svcEditDesc, icon: svcEditIcon, sort_order: svcEditOrder });
                  } else {
                    await createServiceCat.mutateAsync({ label: svcEditLabel, description: svcEditDesc, icon: svcEditIcon, sort_order: svcEditOrder, parent_id: svcEditParent });
                  }
                  setSvcEditOpen(false);
                  toast.success(svcEditId ? "已更新" : "已新增");
                } catch (e: any) {
                  toast.error("操作失败", { description: e.message });
                }
              }}>保存</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Category Delete Confirm */}
      <AlertDialog open={!!svcDeleteConfirm} onOpenChange={() => setSvcDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该服务分类？</AlertDialogTitle>
            <AlertDialogDescription>删除一级分类将同时删除其下所有子服务，此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              if (svcDeleteConfirm) {
                try {
                  await deleteServiceCat.mutateAsync(svcDeleteConfirm);
                  toast.success("已删除");
                } catch (e: any) {
                  toast.error("删除失败", { description: e.message });
                }
              }
              setSvcDeleteConfirm(null);
            }}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
