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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LayoutDashboard, FileText, Megaphone, Settings, Plus, Eye, ThumbsUp, Clock, MessageCircle, Save, Image, Upload, Pencil, Trash2, AlertTriangle, Lock, Cpu, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockInquiries } from "@/data/mockData";
import { useCategories } from "@/hooks/useCategories";
import { useAllProducts, useUpdateProduct } from "@/hooks/useProducts";
import { useAllRecommendations, useUpdateRecommendation, useCreateRecommendation, useDeleteRecommendation } from "@/hooks/useRecommendations";
import { useServiceCategories, useCreateServiceCategory, useUpdateServiceCategory, useDeleteServiceCategory } from "@/hooks/useServiceCategories";
import { useAuth } from "@/contexts/AuthContext";
import { type BannerSlide } from "@/components/home/HomeBanner";
import { useBannerSlides } from "@/hooks/useBannerSlides";
import { useDisplayModules } from "@/hooks/useDisplayModules";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [weights, setWeights] = useState({ upvotes: 40, views: 25, comments: 20, decay: 15 });
  const [savingWeights, setSavingWeights] = useState(false);
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>([]);
  const [savingBanners, setSavingBanners] = useState(false);
  const { data: categories = [] } = useCategories();
  const { data: allProducts = [], isLoading } = useAllProducts();
  const updateProduct = useUpdateProduct();
  const { data: llmRecs = [], isLoading: llmLoading } = useAllRecommendations();
  const updateRec = useUpdateRecommendation();
  const createRec = useCreateRecommendation();
  const deleteRec = useDeleteRecommendation();
  const { data: serviceCategories = [], isLoading: scLoading } = useServiceCategories();
  const createSc = useCreateServiceCategory();
  const updateSc = useUpdateServiceCategory();
  const deleteSc = useDeleteServiceCategory();

  // Load banner slides from DB
  const { data: dbBannerSlides } = useBannerSlides();
  useEffect(() => {
    if (dbBannerSlides && dbBannerSlides.length > 0) {
      setBannerSlides(dbBannerSlides);
    }
  }, [dbBannerSlides]);

  // Load display modules from DB
  const { data: displayModules = [] } = useDisplayModules();

  // Load ranking weights from DB
  useEffect(() => {
    const loadWeights = async () => {
      const { data } = await supabase.from("ranking_weights").select("*").eq("id", "default").single();
      if (data) {
        setWeights({ upvotes: data.upvotes, views: data.views, comments: data.comments, decay: data.decay });
      }
    };
    loadWeights();
  }, []);

  // Service category editing
  const [scEditOpen, setScEditOpen] = useState(false);
  const [scEditId, setScEditId] = useState<string | null>(null);
  const [scEditLabel, setScEditLabel] = useState("");
  const [scEditIcon, setScEditIcon] = useState("Cpu");
  const [scEditDesc, setScEditDesc] = useState("");
  const [scEditOrder, setScEditOrder] = useState(0);
  const [scEditParentId, setScEditParentId] = useState<string | null>(null);
  const [scDeleteConfirmId, setScDeleteConfirmId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const [configSubTabValue, setConfigSubTabValue] = useState("display");

  // LLM rec editing
  const [llmEditOpen, setLlmEditOpen] = useState(false);
  const [llmEditId, setLlmEditId] = useState<string | null>(null);
  const [llmEditName, setLlmEditName] = useState("");
  const [llmEditTag, setLlmEditTag] = useState("");
  const [llmEditOrder, setLlmEditOrder] = useState(0);

  // Category sort order
  const [catOrderList, setCatOrderList] = useState<Array<{ id: string; label: string; icon: string; sort_order: number }>>([]);
  const [savingCatOrder, setSavingCatOrder] = useState(false);

  // Category edit (rename / create)
  const [catEditOpen, setCatEditOpen] = useState(false);
  const [catEditId, setCatEditId] = useState<string | null>(null); // null = create mode
  const [catEditNewId, setCatEditNewId] = useState("");
  const [catEditLabel, setCatEditLabel] = useState("");
  const [catEditIcon, setCatEditIcon] = useState("");
  const [catEditOrder, setCatEditOrder] = useState(0);

  // Category delete
  const [catDeleteOpen, setCatDeleteOpen] = useState(false);
  const [catDeleteId, setCatDeleteId] = useState<string | null>(null);
  const [catDeleteTarget, setCatDeleteTarget] = useState("");
  const [catDeleteProductCount, setCatDeleteProductCount] = useState(0);

  // Category product assignment (after create)
  const [catAssignOpen, setCatAssignOpen] = useState(false);
  const [catAssignId, setCatAssignId] = useState("");
  const [catAssignSelected, setCatAssignSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (categories.length > 0) {
      setCatOrderList(categories.map(c => ({ ...c })));
    }
  }, [categories]);

  const handleSaveCategories = async () => {
    setSavingCatOrder(true);
    try {
      for (const cat of catOrderList) {
        const { error } = await supabase.from("categories").update({ sort_order: cat.sort_order, label: cat.label, icon: cat.icon }).eq("id", cat.id);
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("分类配置已保存");
    } catch (e: any) {
      toast.error("保存失败", { description: e.message });
    } finally {
      setSavingCatOrder(false);
    }
  };

  // Category rename
  const handleSaveCatEdit = async () => {
    if (!catEditLabel.trim()) { toast.error("请填写分类名称"); return; }
    if (catEditId) {
      // Rename mode — update local state only, saved via "保存分类" button
      setCatOrderList(prev => prev.map(c => c.id === catEditId ? { ...c, label: catEditLabel, icon: catEditIcon } : c));
      toast.info("分类已修改，请点击「保存分类」按钮生效");
    } else {
      // Create mode
      if (!catEditNewId.trim()) { toast.error("请填写分类ID"); return; }
      if (catOrderList.some(c => c.id === catEditNewId.trim())) { toast.error("分类ID已存在"); return; }
      const { error } = await supabase.from("categories").insert({ id: catEditNewId.trim(), label: catEditLabel, icon: catEditIcon || "📁", sort_order: catEditOrder });
      if (error) { toast.error("新增失败", { description: error.message }); return; }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("分类已新增");
      // Open product assignment dialog
      setCatAssignId(catEditNewId.trim());
      setCatAssignSelected(new Set());
      setCatAssignOpen(true);
    }
    setCatEditOpen(false);
  };

  // Category delete
  const handleOpenCatDelete = (catId: string) => {
    const count = allProducts.filter(p => p.category_id === catId).length;
    setCatDeleteId(catId);
    setCatDeleteProductCount(count);
    setCatDeleteTarget("");
    setCatDeleteOpen(true);
  };

  const handleConfirmCatDelete = async () => {
    if (!catDeleteId) return;
    if (catDeleteProductCount > 0 && !catDeleteTarget) {
      toast.error("请选择产品迁移的目标分类");
      return;
    }
    try {
      // Migrate products first
      if (catDeleteProductCount > 0 && catDeleteTarget) {
        const { error: moveErr } = await supabase.from("products").update({ category_id: catDeleteTarget }).eq("category_id", catDeleteId);
        if (moveErr) throw moveErr;
      }
      // Delete category
      const { error: delErr } = await supabase.from("categories").delete().eq("id", catDeleteId);
      if (delErr) throw delErr;
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("分类已删除");
    } catch (e: any) {
      toast.error("删除失败", { description: e.message });
    }
    setCatDeleteOpen(false);
    setCatDeleteId(null);
  };

  // Category product assignment
  const handleSaveCatAssign = async () => {
    if (catAssignSelected.size === 0) { setCatAssignOpen(false); return; }
    try {
      const ids = Array.from(catAssignSelected);
      for (const pid of ids) {
        const { error } = await supabase.from("products").update({ category_id: catAssignId }).eq("id", pid);
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`已将 ${ids.length} 个产品分配到新分类`);
    } catch (e: any) {
      toast.error("分配失败", { description: e.message });
    }
    setCatAssignOpen(false);
  };

  // Banner save
  const handleSaveBanners = async () => {
    setSavingBanners(true);
    try {
      for (const slide of bannerSlides) {
        const { error } = await supabase.from("banner_slides").upsert({
          id: slide.id,
          title: slide.title,
          cta: slide.cta,
          link: slide.link,
          active: slide.active,
          gradient: slide.gradient,
          sort_order: slide.sort_order || 0,
          image_url: (slide as any).image_url || '',
        });
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ["banner_slides"] });
      toast.success("Banner 配置已保存");
    } catch (e: any) {
      toast.error("保存失败", { description: e.message });
    } finally {
      setSavingBanners(false);
    }
  };

  // Ranking weights save
  const totalWeight = weights.upvotes + weights.views + weights.comments + weights.decay;

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) {
      toast.error(`权重总和必须等于 100%（当前: ${totalWeight}%）`);
      return;
    }
    setSavingWeights(true);
    try {
      const { error } = await supabase.from("ranking_weights").update({
        upvotes: weights.upvotes,
        views: weights.views,
        comments: weights.comments,
        decay: weights.decay,
        updated_at: new Date().toISOString(),
      }).eq("id", "default");
      if (error) throw error;
      toast.success("排名权重已保存");
    } catch (e: any) {
      toast.error("保存失败", { description: e.message });
    } finally {
      setSavingWeights(false);
    }
  };

  // Display module toggle - save immediately
  const handleToggleModule = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase.from("display_modules").update({ enabled }).eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["display_modules"] });
      toast.success("已更新");
    } catch (e: any) {
      toast.error("更新失败", { description: e.message });
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
  const [savingAi, setSavingAi] = useState(false);

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
    if (field === "active" && value === false) {
      const activeCount = bannerSlides.filter((s) => s.active).length;
      if (activeCount <= 1) {
        toast.error("至少保留一个启用的 Banner");
        return;
      }
    }
    setBannerSlides((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleBannerImageUpload = async (index: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const ext = file.name.split(".").pop();
      const filePath = `banner-${bannerSlides[index].id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("banner-images").upload(filePath, file, { upsert: true });
      if (uploadError) {
        toast.error("上传失败", { description: uploadError.message });
        return;
      }
      const { data: urlData } = supabase.storage.from("banner-images").getPublicUrl(filePath);
      setBannerSlides((prev) => prev.map((s, i) => i === index ? { ...s, image_url: urlData.publicUrl } : s));
      toast.success("图片已上传");
    };
    input.click();
  };

  const handleSaveConfig = async () => {
    const resolvedModel = aiModel === "__custom__" ? aiCustomModel : aiModel;
    if (!resolvedModel.trim()) {
      toast.error("请填写 AI 模型");
      return;
    }
    setSavingAi(true);
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
      toast.success("AI 配置已保存");
    } catch (e: any) {
      toast.error("保存失败", { description: e.message });
    } finally {
      setSavingAi(false);
    }
  };

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

        <main className="flex-1 p-6">
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

              <Tabs value={configSubTabValue} onValueChange={setConfigSubTabValue}>
                <TabsList className="bg-secondary">
                  <TabsTrigger value="display" className="text-xs">展示配置</TabsTrigger>
                  <TabsTrigger value="service" className="text-xs">服务中心配置</TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">AI 配置</TabsTrigger>
                </TabsList>

                {/* ========== 展示配置 ========== */}
                <TabsContent value="display" className="space-y-6 mt-4">
                  {/* Banner Config */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">首页Banner配置</CardTitle>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleSaveBanners} disabled={savingBanners}>
                          <Save className="h-3 w-3" /> {savingBanners ? "保存中..." : "保存Banner"}
                        </Button>
                      </div>
                      <CardDescription className="text-xs">管理首页轮播图的展示内容和状态</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bannerSlides.map((slide, i) => (
                        <div key={slide.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/40 border border-border/30">
                          <div
                            className={`h-20 w-28 rounded-lg border-2 border-dashed border-border/60 ${(slide as any).image_url ? '' : `bg-gradient-to-br ${slide.gradient}`} flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-primary/50 transition-colors group overflow-hidden relative`}
                            onClick={() => handleBannerImageUpload(i)}
                          >
                            {(slide as any).image_url ? (
                              <img src={(slide as any).image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <>
                                <Upload className="h-4 w-4 text-white/60 group-hover:text-white/90 transition-colors" />
                                <span className="text-[9px] text-white/60 mt-1 group-hover:text-white/90">点击上传图片</span>
                              </>
                            )}
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
                      {bannerSlides.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">暂无 Banner 数据</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Function Switches - from display_modules */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3"><CardTitle className="text-sm">功能开关</CardTitle><CardDescription className="text-xs">控制产品详情页各模块的启用状态（实时生效）</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      {displayModules.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">加载中...</p>
                      ) : displayModules.map((mod) => (
                        <div key={mod.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground">{mod.label}</p>
                            <p className="text-xs text-muted-foreground">{mod.description}</p>
                          </div>
                          <Switch checked={mod.enabled} onCheckedChange={(v) => handleToggleModule(mod.id, v)} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Ranking Weights */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">排名算法权重</CardTitle>
                          <CardDescription className="text-xs">调整各因素在排名中的权重占比（总和需为100%）</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleSaveWeights} disabled={savingWeights || totalWeight !== 100}>
                          <Save className="h-3 w-3" /> {savingWeights ? "保存中..." : "保存权重"}
                        </Button>
                      </div>
                    </CardHeader>
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
                      <div className={`flex items-center justify-between pt-2 border-t border-border text-xs font-medium ${totalWeight === 100 ? "text-green-500" : "text-destructive"}`}>
                        <span>权重总和</span>
                        <span className="font-mono">{totalWeight} / 100%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Category Sort */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">产品分类管理</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                            setCatEditId(null); setCatEditNewId(""); setCatEditLabel(""); setCatEditIcon("📁"); setCatEditOrder(catOrderList.length > 0 ? Math.max(...catOrderList.map(c => c.sort_order)) + 1 : 0); setCatEditOpen(true);
                          }}>
                            <Plus className="h-3 w-3" /> 新增分类
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleSaveCategories} disabled={savingCatOrder}>
                            <Save className="h-3 w-3" /> {savingCatOrder ? "保存中..." : "保存分类"}
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-xs">拖动排序值调整分类在导航栏的显示顺序（数值越小越靠前）</CardDescription>
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
                              <TableHead className="text-xs font-medium text-center">操作</TableHead>
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
                                <TableCell className="text-center">
                                  <div className="flex justify-center gap-1">
                                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs" disabled={idx === 0} onClick={() => {
                                      const newList = [...catOrderList];
                                      const prevOrder = newList[idx - 1].sort_order;
                                      newList[idx - 1] = { ...newList[idx - 1], sort_order: newList[idx].sort_order };
                                      newList[idx] = { ...newList[idx], sort_order: prevOrder };
                                      newList.sort((a, b) => a.sort_order - b.sort_order);
                                      setCatOrderList(newList);
                                    }}>↑</Button>
                                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs" disabled={idx === catOrderList.length - 1} onClick={() => {
                                      const newList = [...catOrderList];
                                      const nextOrder = newList[idx + 1].sort_order;
                                      newList[idx + 1] = { ...newList[idx + 1], sort_order: newList[idx].sort_order };
                                      newList[idx] = { ...newList[idx], sort_order: nextOrder };
                                      newList.sort((a, b) => a.sort_order - b.sort_order);
                                      setCatOrderList(newList);
                                    }}>↓</Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                      setCatEditId(cat.id); setCatEditNewId(cat.id); setCatEditLabel(cat.label); setCatEditIcon(cat.icon); setCatEditOrder(cat.sort_order); setCatEditOpen(true);
                                    }}><Pencil className="h-3 w-3" /></Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleOpenCatDelete(cat.id)}>
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
                </TabsContent>

                {/* ========== 服务中心配置 ========== */}
                <TabsContent value="service" className="space-y-6 mt-4">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">服务分类管理</CardTitle>
                          <CardDescription className="text-xs">管理服务中心的分类与服务项目（层级结构：服务分类 → 服务名称）</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                          setScEditId(null); setScEditLabel(""); setScEditIcon("Cpu"); setScEditDesc(""); setScEditOrder(0); setScEditParentId(null); setScEditOpen(true);
                        }}>
                          <Plus className="h-3 w-3" /> 新增分类
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {scLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">加载中...</p>
                      ) : (() => {
                        const parents = serviceCategories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
                        if (parents.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">暂无服务分类，点击上方「新增分类」添加</p>;
                        return parents.map((parent) => {
                          const children = serviceCategories.filter(c => c.parent_id === parent.id).sort((a, b) => a.sort_order - b.sort_order);
                          const isExpanded = expandedCategories.has(parent.id);
                          const isLlmService = (label: string) => label.includes("大模型接入");
                          return (
                            <div key={parent.id} className="rounded-lg border border-border overflow-hidden">
                              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/40 hover:bg-secondary/60 transition-colors">
                                <button className="shrink-0" onClick={() => {
                                  const next = new Set(expandedCategories);
                                  isExpanded ? next.delete(parent.id) : next.add(parent.id);
                                  setExpandedCategories(next);
                                }}>
                                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                </button>
                                <span className="text-base">{parent.icon}</span>
                                <span className="text-sm font-medium text-foreground flex-1">{parent.label}</span>
                                <Badge variant="secondary" className="text-[10px]">排序: {parent.sort_order}</Badge>
                                <Switch checked={parent.enabled} onCheckedChange={(v) => updateSc.mutate({ id: parent.id, enabled: v })} />
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                  setScEditId(parent.id); setScEditLabel(parent.label); setScEditIcon(parent.icon); setScEditDesc(parent.description); setScEditOrder(parent.sort_order); setScEditParentId(null); setScEditOpen(true);
                                }}><Pencil className="h-3 w-3" /></Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setScDeleteConfirmId(parent.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => {
                                  setScEditId(null); setScEditLabel(""); setScEditIcon("Cpu"); setScEditDesc(""); setScEditOrder(children.length); setScEditParentId(parent.id); setScEditOpen(true);
                                }}><Plus className="h-3 w-3" /> 子项</Button>
                              </div>
                              {isExpanded && (
                                <div className="divide-y divide-border">
                                  {children.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">暂无子服务项目</p>
                                  )}
                                  {children.map((child) => (
                                    <div key={child.id}>
                                      <div className="flex items-center gap-2 px-4 py-2.5 pl-10 hover:bg-secondary/20 transition-colors">
                                        <span className="text-sm">{child.icon}</span>
                                        <span className="text-sm text-foreground flex-1">{child.label}</span>
                                        {child.description && <span className="text-xs text-muted-foreground max-w-[200px] truncate hidden md:inline">{child.description}</span>}
                                        <Badge variant="outline" className="text-[10px]">排序: {child.sort_order}</Badge>
                                        <Switch checked={child.enabled} onCheckedChange={(v) => updateSc.mutate({ id: child.id, enabled: v })} />
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                          setScEditId(child.id); setScEditLabel(child.label); setScEditIcon(child.icon); setScEditDesc(child.description); setScEditOrder(child.sort_order); setScEditParentId(child.parent_id); setScEditOpen(true);
                                        }}><Pencil className="h-3 w-3" /></Button>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setScDeleteConfirmId(child.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      {isLlmService(child.label) && (
                                        <div className="bg-secondary/20 border-t border-border px-6 py-4 space-y-3">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <Cpu className="h-3.5 w-3.5 text-primary" />
                                              <span className="text-xs font-medium text-foreground">大模型优选推荐</span>
                                            </div>
                                            <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => { setLlmEditId(null); setLlmEditName(""); setLlmEditTag(""); setLlmEditOrder(llmRecs.length + 1); setLlmEditOpen(true); }}>
                                              <Plus className="h-3 w-3" /> 新增
                                            </Button>
                                          </div>
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
                                                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-4">暂无推荐数据</TableCell></TableRow>
                                                )}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </CardContent>
                  </Card>

                </TabsContent>

                {/* ========== AI 配置 ========== */}
                <TabsContent value="ai" className="space-y-6 mt-4">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">AI 智能解析配置</CardTitle>
                          <CardDescription className="text-xs">配置产品URL解析使用的AI模型和提示词</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">启用</span>
                            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                          </div>
                          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleSaveConfig} disabled={savingAi}>
                            <Save className="h-3 w-3" /> {savingAi ? "保存中..." : "保存配置"}
                          </Button>
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
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

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

      {/* Service Category Edit/Create Dialog */}
      <Dialog open={scEditOpen} onOpenChange={setScEditOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{scEditId ? "编辑服务项" : (scEditParentId ? "新增子服务" : "新增服务分类")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">名称</label>
              <Input value={scEditLabel} onChange={(e) => setScEditLabel(e.target.value)} className="bg-secondary" placeholder="如 技术服务" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">图标 (emoji)</label>
              <Input value={scEditIcon} onChange={(e) => setScEditIcon(e.target.value)} className="bg-secondary" placeholder="Cpu" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">描述</label>
              <Input value={scEditDesc} onChange={(e) => setScEditDesc(e.target.value)} className="bg-secondary" placeholder="服务描述（可选）" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">排序</label>
              <Input type="number" value={scEditOrder} onChange={(e) => setScEditOrder(Number(e.target.value))} className="bg-secondary" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScEditOpen(false)}>取消</Button>
              <Button className="bg-primary" onClick={() => {
                if (!scEditLabel.trim()) { toast.error("请填写名称"); return; }
                if (scEditId) {
                  updateSc.mutate({ id: scEditId, label: scEditLabel, icon: scEditIcon, description: scEditDesc, sort_order: scEditOrder });
                } else {
                  createSc.mutate({ label: scEditLabel, icon: scEditIcon, description: scEditDesc, sort_order: scEditOrder, parent_id: scEditParentId });
                }
                setScEditOpen(false);
                toast.success(scEditId ? "已更新" : "已新增");
              }}>保存</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Category Delete Confirm */}
      <AlertDialog open={!!scDeleteConfirmId} onOpenChange={(open) => { if (!open) setScDeleteConfirmId(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>删除后不可恢复，子分类也将一并删除。确定继续？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (scDeleteConfirmId) {
                const children = serviceCategories.filter(c => c.parent_id === scDeleteConfirmId);
                children.forEach(c => deleteSc.mutate(c.id));
                deleteSc.mutate(scDeleteConfirmId);
                toast.success("已删除");
              }
              setScDeleteConfirmId(null);
            }}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Edit/Create Dialog */}
      <Dialog open={catEditOpen} onOpenChange={setCatEditOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{catEditId ? "编辑分类" : "新增分类"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {!catEditId && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">分类 ID（唯一标识，英文）</label>
                <Input value={catEditNewId} onChange={(e) => setCatEditNewId(e.target.value)} className="bg-secondary font-mono" placeholder="如 dev-tools" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">分类名称</label>
              <Input value={catEditLabel} onChange={(e) => setCatEditLabel(e.target.value)} className="bg-secondary" placeholder="如 开发工具" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">图标 (emoji)</label>
              <Input value={catEditIcon} onChange={(e) => setCatEditIcon(e.target.value)} className="bg-secondary" placeholder="📁" />
            </div>
            {!catEditId && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">排序值</label>
                <Input type="number" value={catEditOrder} onChange={(e) => setCatEditOrder(Number(e.target.value))} className="bg-secondary" />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCatEditOpen(false)}>取消</Button>
              <Button onClick={handleSaveCatEdit}>{catEditId ? "保存" : "创建"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Delete Confirm Dialog */}
      <AlertDialog open={catDeleteOpen} onOpenChange={(open) => { if (!open) { setCatDeleteOpen(false); setCatDeleteId(null); } }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>删除分类</AlertDialogTitle>
            <AlertDialogDescription>
              {catDeleteProductCount > 0
                ? `该分类下有 ${catDeleteProductCount} 个产品，请选择目标分类进行迁移后再删除。`
                : "该分类下没有产品，确认删除此分类？"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {catDeleteProductCount > 0 && (
            <div className="space-y-1.5 px-1">
              <label className="text-xs font-medium text-muted-foreground">迁移到</label>
              <Select value={catDeleteTarget} onValueChange={setCatDeleteTarget}>
                <SelectTrigger className="bg-secondary"><SelectValue placeholder="选择目标分类" /></SelectTrigger>
                <SelectContent>
                  {catOrderList.filter(c => c.id !== catDeleteId).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCatDelete} disabled={catDeleteProductCount > 0 && !catDeleteTarget}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Product Assignment Dialog (after create) */}
      <Dialog open={catAssignOpen} onOpenChange={setCatAssignOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base">分配产品到新分类</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">选择要分配到新分类 <Badge variant="secondary" className="text-[10px]">{catAssignId}</Badge> 的产品（可跳过）</p>
          <div className="max-h-[50vh] overflow-y-auto space-y-1 border border-border rounded-md p-2">
            {allProducts.map((p: any) => (
              <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary/50 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={catAssignSelected.has(p.id)}
                  onChange={(e) => {
                    const next = new Set(catAssignSelected);
                    e.target.checked ? next.add(p.id) : next.delete(p.id);
                    setCatAssignSelected(next);
                  }}
                  className="rounded"
                />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-muted-foreground">{categories.find(c => c.id === p.category_id)?.label || "未分类"}</span>
              </label>
            ))}
            {allProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">暂无产品</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatAssignOpen(false)}>跳过</Button>
            <Button onClick={handleSaveCatAssign} disabled={catAssignSelected.size === 0}>分配 ({catAssignSelected.size})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
