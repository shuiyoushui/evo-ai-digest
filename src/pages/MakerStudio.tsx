import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Link2, Zap, LayoutTemplate, Megaphone, Feather, Globe, Send, ChevronDown,
  Plane, Eye, Pencil, Trash2, FileEdit, ArrowRight, Sparkles, Users, Link, Github,
  Plus, X, Terminal, Code, Cpu, Building2,
  Radio, LayoutGrid, Newspaper, Target, Rocket,
  Sprout, Star, TrendingUp, Upload, Shield, AlertTriangle, User,
} from "lucide-react";
import { categories, products } from "@/data/mockData";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

type SubmitStep = "choose" | "analyzing" | "form";

interface SkillItem { name: string; description: string }
interface PromptItem { title: string; content: string }

// Mock AI-prefilled data
const mockAIData = {
  name: "我的AI产品",
  slogan: "用AI重新定义工作方式",
  category: "efficiency",
  tags: ["AI助手", "Web", "Freemium"],
  description: "这是一款基于大语言模型的AI产品，致力于帮助用户通过智能化工具提升日常工作效率。核心功能包括智能问答、文档分析和任务自动化。",
  website: "",
  github: "",
  founderName: "张三",
  founderTitle: "CEO & Co-founder",
  companyName: "AI科技有限公司",
  companyFounded: "2024",
  companyLocation: "北京",
  companyFunding: "种子轮",
  companyBio: "一家专注于AI应用的初创公司",
  skills: [
    { name: "智能问答", description: "基于RAG的上下文问答能力" },
    { name: "文档分析", description: "支持PDF、Word等文档解析与总结" },
  ] as SkillItem[],
  prompts: [
    { title: "总结文档", content: "请阅读以下文档内容，提取核心观点并生成一份不超过500字的中文摘要..." },
  ] as PromptItem[],
};

const emptyFormData = {
  name: "", slogan: "", category: "", tags: [] as string[], description: "",
  website: "", github: "", founderName: "", founderTitle: "", companyName: "",
  companyFounded: "", companyLocation: "", companyFunding: "", companyBio: "",
  skills: [] as SkillItem[],
  prompts: [] as PromptItem[],
};

const platformPresets = ["Web", "Mobile App", "Browser Plugin", "Desktop"];
const pricingPresets = ["Free", "Paid", "Freemium"];

// Self-service promotion cards
const selfServiceCards = [
  { id: "seed", title: "种子用户获取", desc: "精准获取早期高质量种子用户，快速验证产品方向", icon: Sprout },
  { id: "review", title: "体验评测用户获取", desc: "邀请目标用户深度体验产品并撰写真实评测", icon: Star },
  { id: "growth", title: "用户规模增长", desc: "多渠道大规模投放，实现用户快速增长", icon: TrendingUp },
];

const budgetOptions = [100, 500, 1000, 5000];

// Technical Services cards
const techServiceCards = [
  { id: "llm", title: "大模型接入", desc: "API integration, model deployment, and fine-tuning.", icon: Cpu },
  { id: "mcp", title: "MCP 开发服务", desc: "Model Context Protocol & Custom Agent development.", icon: Code },
  { id: "cloud", title: "其他模型/云服务等", desc: "GPU computing resources, RAG, and data processing.", icon: Globe },
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
  const { user, isLoggedIn, updateUser, bindCSDN } = useAuth();
  const [submitStep, setSubmitStep] = useState<SubmitStep>("choose");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("submit");
  const [selectedProject, setSelectedProject] = useState(uniqueProjects[0]);
  const [myProjects, setMyProjects] = useState(uniqueProjects);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState(emptyFormData);
  const [editNewTag, setEditNewTag] = useState("");
  const [formData, setFormData] = useState(emptyFormData);
  const [newTag, setNewTag] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);

  // Profile form state
  const [profileNickname, setProfileNickname] = useState(user?.nickname || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [csdnUsername, setCsdnUsername] = useState("");

  // Generic inquiry dialog (for non-promotion services)
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");

  // Self-service modals
  const [seedOpen, setSeedOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);

  // Modal A: Seed
  const [seedBudget, setSeedBudget] = useState("500");
  const [seedCustomBudget, setSeedCustomBudget] = useState("");
  const [seedGoal, setSeedGoal] = useState("impressions");

  // Modal B: Review
  const [reviewBudget, setReviewBudget] = useState("500");
  const [reviewCustomBudget, setReviewCustomBudget] = useState("");
  const [reviewGoal, setReviewGoal] = useState("experience");

  // Modal C: Growth
  const [growthChannels, setGrowthChannels] = useState<string[]>([]);
  const [growthRequirements, setGrowthRequirements] = useState("");

  const getEffectiveBudget = (budget: string, custom: string) => {
    if (budget === "custom") return parseInt(custom) || 0;
    return parseInt(budget) || 0;
  };

  const estimateSeedResults = () => {
    const b = getEffectiveBudget(seedBudget, seedCustomBudget);
    if (b === 0) return "—";
    if (seedGoal === "impressions") return `~${(b * 20).toLocaleString()} 次曝光`;
    return `~${(b * 2).toLocaleString()} 次点击`;
  };

  const estimateReviewResults = () => {
    const b = getEffectiveBudget(reviewBudget, reviewCustomBudget);
    if (b === 0) return "—";
    return `~${Math.floor(b / 5).toLocaleString()} 人`;
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    const projectName = searchParams.get("project");
    if (tab === "promotion") {
      setActiveTab("promotion");
      if (projectName) {
        const found = uniqueProjects.find((p) => p.name === projectName);
        if (found) setSelectedProject(found);
      }
    } else if (tab === "profile") {
      setActiveTab("profile");
    }
  }, [searchParams]);

  const handleAIAnalyze = () => {
    if (!url) return;
    setIsAIMode(true);
    setSubmitStep("analyzing");
    setTimeout(() => {
      setFormData({ ...mockAIData, website: url });
      setSubmitStep("form");
    }, 2500);
  };

  const handleManualEntry = () => {
    setIsAIMode(false);
    setFormData(emptyFormData);
    setSubmitStep("form");
  };

  const handleSubmitInquiry = () => {
    setInquiryOpen(false);
    toast.success("咨询请求已发送给管理员", { description: "我们将在1-2个工作日内联系您" });
  };

  const handleDeleteProject = (id: string) => {
    setMyProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success("项目已删除");
  };

  const handleEditProject = (proj: typeof uniqueProjects[0]) => {
    setEditingProjectId(proj.id);
    setEditFormData({
      ...emptyFormData,
      name: proj.name,
      slogan: proj.slogan,
    });
    setActiveTab("edit");
  };

  const handleSaveEdit = () => {
    if (!editingProjectId) return;
    setMyProjects((prev) => prev.map((p) => p.id === editingProjectId ? { ...p, name: editFormData.name, slogan: editFormData.slogan } : p));
    setEditingProjectId(null);
    setActiveTab("projects");
    toast.success("产品信息已更新");
  };

  const handleSaveProfile = () => {
    updateUser({ nickname: profileNickname, phone: profilePhone, email: profileEmail });
    toast.success("个人信息已保存");
  };

  const handleBindCSDN = () => {
    if (!csdnUsername) { toast.error("请输入CSDN用户名"); return; }
    bindCSDN(csdnUsername);
    toast.success("CSDN账号绑定成功！", { description: "您已获得免费曝光流量资格" });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const togglePresetTag = (tag: string) => {
    if (formData.tags.includes(tag)) {
      handleRemoveTag(tag);
    } else {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, { name: "", description: "" }] });
  };

  const updateSkill = (idx: number, field: keyof SkillItem, value: string) => {
    const updated = [...formData.skills];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, skills: updated });
  };

  const removeSkill = (idx: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) });
  };

  const addPrompt = () => {
    setFormData({ ...formData, prompts: [...formData.prompts, { title: "", content: "" }] });
  };

  const updatePrompt = (idx: number, field: keyof PromptItem, value: string) => {
    const updated = [...formData.prompts];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, prompts: updated });
  };

  const removePrompt = (idx: number) => {
    setFormData({ ...formData, prompts: formData.prompts.filter((_, i) => i !== idx) });
  };

  const handleSubmitProduct = () => {
    toast.success("产品已提交审核", { description: "我们将在1-2个工作日内完成审核" });
    setSubmitStep("choose");
    setFormData(emptyFormData);
    setUrl("");
  };

  const handleCardClick = (cardId: string) => {
    if (cardId === "seed") setSeedOpen(true);
    else if (cardId === "review") setReviewOpen(true);
    else if (cardId === "growth") setGrowthOpen(true);
  };

  const handleSubmitSeed = () => {
    setSeedOpen(false);
    toast.success("种子用户获取需求已提交", { description: `预算: ¥${getEffectiveBudget(seedBudget, seedCustomBudget)}` });
  };

  const handleSubmitReview = () => {
    setReviewOpen(false);
    toast.success("体验评测需求已提交", { description: `预算: ¥${getEffectiveBudget(reviewBudget, reviewCustomBudget)}` });
  };

  const handleSubmitGrowth = () => {
    setGrowthOpen(false);
    toast.success("用户规模增长需求已提交", { description: `已选${growthChannels.length}个渠道` });
  };

  const toggleGrowthChannel = (ch: string) => {
    setGrowthChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const renderBudgetSelector = (budget: string, setBudgetFn: (v: string) => void, customBudget: string, setCustomFn: (v: string) => void) => (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">流量套餐</label>
      <div className="flex flex-wrap gap-2">
        {budgetOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setBudgetFn(String(opt))}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              budget === String(opt)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-foreground border-border hover:border-primary/40"
            }`}
          >
            ¥{opt.toLocaleString()}
          </button>
        ))}
        <button
          onClick={() => setBudgetFn("custom")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            budget === "custom"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-foreground border-border hover:border-primary/40"
          }`}
        >
          自定义
        </button>
      </div>
      {budget === "custom" && (
        <Input
          type="number"
          placeholder="输入自定义金额..."
          value={customBudget}
          onChange={(e) => setCustomFn(e.target.value)}
          className="bg-secondary mt-2"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="submit">智能提交</TabsTrigger>
            <TabsTrigger value="projects">产品管理</TabsTrigger>
            <TabsTrigger value="promotion">服务中心</TabsTrigger>
          </TabsList>

          {/* SUBMIT TAB */}
          <TabsContent value="submit">
            {/* Step 1: Choose submission method */}
            {submitStep === "choose" && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-2">提交你的AI产品</h1>
                  <p className="text-muted-foreground text-sm">选择你偏好的提交方式</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                  {/* Option A: Smart AI Import */}
                  <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3 relative">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-base">⚡️ 智能AI导入</CardTitle>
                      <CardDescription className="text-xs">粘贴URL或GitHub链接，AI自动分析并填充产品信息</CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="粘贴URL或GitHub链接..."
                            className="pl-9 h-10 bg-secondary border-border text-sm"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAIAnalyze()}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAIAnalyze} className="w-full gap-2 bg-primary">
                        <Zap className="h-4 w-4" /> 开始分析
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Option B: Manual Entry */}
                  <Card
                    className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
                    onClick={handleManualEntry}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3 relative">
                      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                        <FileEdit className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-base">📝 手动填写</CardTitle>
                      <CardDescription className="text-xs">从空白表单开始，手动录入产品所有信息</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <p className="text-xs text-muted-foreground mb-4">适合暂无在线产品或需要精细控制每个字段的创作者</p>
                        <Button variant="outline" className="gap-2">
                          从空白开始 <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step: Analyzing */}
            {submitStep === "analyzing" && (
              <div className="space-y-6 animate-fade-in max-w-lg mx-auto py-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse"><Zap className="h-4 w-4 text-primary" /></div>
                  <span className="text-sm text-foreground font-medium">AI正在分析产品信息...</span>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="space-y-2"><Skeleton className="h-4 w-24 bg-secondary" /><Skeleton className="h-10 w-full bg-secondary" /></div>))}
              </div>
            )}

            {/* Step: Unified Form */}
            {submitStep === "form" && (
              <div className="animate-fade-in max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">产品信息</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isAIMode ? "AI已自动填充以下字段，请检查并补充" : "请填写完整的产品信息"}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setSubmitStep("choose"); setUrl(""); }}>
                    ← 返回
                  </Button>
                </div>

                {/* Section 1: Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-1 mb-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="h-5 w-1 bg-primary rounded-full" /> 基本信息
                    </h3>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">产品名称 *</label>
                          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="输入产品名称" className="bg-secondary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Slogan *</label>
                          <Input value={formData.slogan} onChange={(e) => setFormData({ ...formData, slogan: e.target.value })} placeholder="一句话介绍你的产品" className="bg-secondary" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">分类 *</label>
                          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                            <SelectTrigger className="bg-secondary"><SelectValue placeholder="选择产品分类" /></SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">标签</label>
                          <div className="flex flex-wrap gap-1.5 items-center min-h-[40px] p-2 rounded-md bg-secondary border border-border">
                            {formData.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs gap-1 pr-1 bg-background">
                                {t}
                                <button onClick={() => handleRemoveTag(t)} className="ml-0.5 hover:text-destructive transition-colors">×</button>
                              </Badge>
                            ))}
                            <Input
                              placeholder="添加标签..."
                              className="h-6 w-24 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 p-0"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                            />
                          </div>
                          <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] text-muted-foreground mr-1">平台:</span>
                              {platformPresets.map((tag) => (
                                <button key={tag} onClick={() => togglePresetTag(tag)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${formData.tags.includes(tag) ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}>{tag}</button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] text-muted-foreground mr-1">定价:</span>
                              {pricingPresets.map((tag) => (
                                <button key={tag} onClick={() => togglePresetTag(tag)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${formData.tags.includes(tag) ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}>{tag}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">产品描述 *</label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="详细描述你的产品功能、特色和目标用户..." className="bg-secondary min-h-[140px]" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section 2: AI Skills & Prompts */}
                  <div className="space-y-1 mb-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="h-5 w-1 bg-primary rounded-full" /> AI 技能与提示词
                    </h3>
                    <p className="text-xs text-muted-foreground ml-3">描述产品的核心AI能力和推荐提示词</p>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5 space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> Agent Skills</label>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addSkill}><Plus className="h-3 w-3" /> 添加技能</Button>
                        </div>
                        {formData.skills.length === 0 && <p className="text-xs text-muted-foreground/60 text-center py-3">暂无技能，点击上方按钮添加</p>}
                        {formData.skills.map((skill, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-secondary/40 border border-border/30">
                            <div className="flex-1 space-y-2">
                              <Input value={skill.name} onChange={(e) => updateSkill(idx, "name", e.target.value)} placeholder="技能名称" className="bg-background h-8 text-sm" />
                              <Textarea value={skill.description} onChange={(e) => updateSkill(idx, "description", e.target.value)} placeholder="技能描述..." className="bg-background min-h-[60px] text-sm" />
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeSkill(idx)}><X className="h-3 w-3 text-muted-foreground" /></Button>
                          </div>
                        ))}
                      </div>
                      <Separator className="bg-border/60" />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Terminal className="h-3 w-3 text-primary" /> Prompt Library</label>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addPrompt}><Plus className="h-3 w-3" /> 添加提示词</Button>
                        </div>
                        {formData.prompts.length === 0 && <p className="text-xs text-muted-foreground/60 text-center py-3">暂无提示词，点击上方按钮添加</p>}
                        {formData.prompts.map((prompt, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-secondary/40 border border-border/30">
                            <div className="flex-1 space-y-2">
                              <Input value={prompt.title} onChange={(e) => updatePrompt(idx, "title", e.target.value)} placeholder="提示词标题" className="bg-background h-8 text-sm" />
                              <Textarea value={prompt.content} onChange={(e) => updatePrompt(idx, "content", e.target.value)} placeholder="提示词内容..." className="bg-background min-h-[80px] text-sm font-mono" />
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removePrompt(idx)}><X className="h-3 w-3 text-muted-foreground" /></Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section 3: Links */}
                  <div className="space-y-1 mb-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><div className="h-5 w-1 bg-primary rounded-full" /> 相关链接</h3>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Link className="h-3 w-3" /> 官方网站</label>
                          <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." className="bg-secondary font-mono text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Github className="h-3 w-3" /> GitHub</label>
                          <Input value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} placeholder="https://github.com/..." className="bg-secondary font-mono text-sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section 4: Team & Company */}
                  <div className="space-y-1 mb-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><div className="h-5 w-1 bg-primary rounded-full" /> 团队与公司</h3>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Users className="h-3 w-3" /> 创始人/负责人</label>
                          <Input value={formData.founderName} onChange={(e) => setFormData({ ...formData, founderName: e.target.value })} placeholder="姓名" className="bg-secondary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">职位</label>
                          <Input value={formData.founderTitle} onChange={(e) => setFormData({ ...formData, founderTitle: e.target.value })} placeholder="CEO / CTO / ..." className="bg-secondary" />
                        </div>
                      </div>
                      <Separator className="bg-border/60" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Building2 className="h-3 w-3" /> 公司名称</label>
                          <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="公司名称" className="bg-secondary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">成立年份</label>
                          <Input value={formData.companyFounded} onChange={(e) => setFormData({ ...formData, companyFounded: e.target.value })} placeholder="2024" className="bg-secondary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">所在地</label>
                          <Input value={formData.companyLocation} onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })} placeholder="北京 / 旧金山 / ..." className="bg-secondary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">融资阶段</label>
                          <Input value={formData.companyFunding} onChange={(e) => setFormData({ ...formData, companyFunding: e.target.value })} placeholder="种子轮 / A轮 / ..." className="bg-secondary" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">公司简介</label>
                        <Textarea value={formData.companyBio} onChange={(e) => setFormData({ ...formData, companyBio: e.target.value })} placeholder="简要介绍团队和公司背景..." className="bg-secondary min-h-[80px]" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Actions */}
                  <div className="flex justify-end gap-3 pt-2 pb-8">
                    <Button variant="outline" onClick={() => { setSubmitStep("choose"); setUrl(""); }}>取消</Button>
                    <Button variant="outline">保存草稿</Button>
                    <Button className="bg-primary gap-2" onClick={handleSubmitProduct}>
                      <Send className="h-4 w-4" /> 提交审核
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* MY PROJECTS TAB */}
          <TabsContent value="projects" className="animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-4">产品管理</h3>
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
                      <Badge variant={proj.status === "已上线" ? "default" : "secondary"} className="text-[10px] shrink-0">{proj.status}</Badge>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="查看"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="编辑" onClick={() => handleEditProject(proj)}><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="删除"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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

          {/* EDIT PRODUCT TAB (full form) */}
          <TabsContent value="edit" className="animate-fade-in">
            {editingProjectId && (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">编辑产品</h2>
                    <p className="text-xs text-muted-foreground mt-1">修改产品的完整信息</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingProjectId(null); setActiveTab("projects"); }}>← 返回列表</Button>
                </div>
                <div className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">产品名称 *</label>
                          <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-secondary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Slogan *</label>
                          <Input value={editFormData.slogan} onChange={(e) => setEditFormData({ ...editFormData, slogan: e.target.value })} className="bg-secondary" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">分类</label>
                          <Select value={editFormData.category} onValueChange={(v) => setEditFormData({ ...editFormData, category: v })}>
                            <SelectTrigger className="bg-secondary"><SelectValue placeholder="选择产品分类" /></SelectTrigger>
                            <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">标签</label>
                          <div className="flex flex-wrap gap-1.5 items-center min-h-[40px] p-2 rounded-md bg-secondary border border-border">
                            {editFormData.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs gap-1 pr-1 bg-background">{t}<button onClick={() => setEditFormData({ ...editFormData, tags: editFormData.tags.filter((x) => x !== t) })} className="ml-0.5 hover:text-destructive">×</button></Badge>
                            ))}
                            <Input placeholder="添加标签..." className="h-6 w-24 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 p-0" value={editNewTag} onChange={(e) => setEditNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (editNewTag.trim()) { setEditFormData({ ...editFormData, tags: [...editFormData.tags, editNewTag.trim()] }); setEditNewTag(""); } } }} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">产品描述</label>
                        <Textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="bg-secondary min-h-[140px]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">官方网站</label>
                          <Input value={editFormData.website} onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })} placeholder="https://..." className="bg-secondary font-mono text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">GitHub</label>
                          <Input value={editFormData.github} onChange={(e) => setEditFormData({ ...editFormData, github: e.target.value })} placeholder="https://github.com/..." className="bg-secondary font-mono text-sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end gap-3 pt-2 pb-8">
                    <Button variant="outline" onClick={() => { setEditingProjectId(null); setActiveTab("projects"); }}>取消</Button>
                    <Button className="bg-primary gap-2" onClick={handleSaveEdit}><Send className="h-4 w-4" /> 保存修改</Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-lg font-bold text-foreground">个人信息维护</h3>

              {/* Section 1: Basic Info */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">基本信息</CardTitle>
                  </div>
                  <CardDescription className="text-xs">管理您的头像和昵称</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-2xl bg-primary/15 text-primary">
                          {(user?.nickname || "U").slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user?.nickname || "未登录"}</p>
                      <p className="text-xs text-muted-foreground">点击头像更换</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">昵称</label>
                    <Input value={profileNickname} onChange={(e) => setProfileNickname(e.target.value)} className="bg-secondary" />
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Security */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">安全设置</CardTitle>
                  </div>
                  <CardDescription className="text-xs">管理手机号、邮箱和密码</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">手机号</label>
                    <div className="flex gap-2">
                      <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="bg-secondary flex-1" />
                      <Button variant="outline" size="sm" className="shrink-0 text-xs">更换</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">绑定邮箱</label>
                    <Input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="输入邮箱地址" className="bg-secondary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">密码</label>
                    <Button variant="outline" size="sm" className="w-full text-xs">修改密码</Button>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-primary" onClick={handleSaveProfile}>保存信息</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Account Binding */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="bg-gradient-to-r from-[hsl(25,95%,53%)]/10 to-transparent p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-[hsl(25,95%,53%)]" />
                    <h4 className="text-sm font-bold text-foreground">CSDN 账号集成</h4>
                    {user?.csdnBound && (
                      <Rocket className="h-4 w-4 text-[hsl(25,95%,53%)]" />
                    )}
                  </div>
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="rounded-lg bg-[hsl(25,95%,53%)]/5 border border-[hsl(25,95%,53%)]/20 p-3">
                    <p className="text-sm text-foreground font-medium">🚀 关联 CSDN 账号即可获取免费曝光流量！</p>
                    <p className="text-xs text-muted-foreground mt-1">绑定后，您的产品将获得额外的 CSDN 社区曝光资源</p>
                  </div>
                  {user?.csdnBound ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                      <Rocket className="h-4 w-4 text-[hsl(25,95%,53%)]" />
                      <span className="text-sm text-foreground">{user.csdnUsername}</span>
                      <span className="text-xs text-muted-foreground">· 已绑定</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input value={csdnUsername} onChange={(e) => setCsdnUsername(e.target.value)} placeholder="输入CSDN用户名" className="bg-secondary flex-1" />
                      <Button onClick={handleBindCSDN} className="bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,48%)] text-white shrink-0">绑定账号</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 4: Danger Zone */}
              <Card className="bg-card border-destructive/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <CardTitle className="text-sm text-destructive">危险操作</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pb-5">
                  <p className="text-xs text-muted-foreground mb-3">删除账号后，所有数据将不可恢复。</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="text-xs">账号注销</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认注销账号</AlertDialogTitle>
                        <AlertDialogDescription>此操作将永久删除您的账号和所有关联数据。此操作不可恢复。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认注销</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SERVICE CENTER TAB */}
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

            <div>
              <p className="text-sm text-muted-foreground">覆盖产品全生命周期的一站式生态服务市场</p>
            </div>

            <Tabs defaultValue="self-promotion" className="w-full">
              <TabsList className="bg-secondary w-full justify-start flex-wrap h-auto gap-1 p-1.5">
                <TabsTrigger value="self-promotion" className="gap-1.5 text-xs data-[state=active]:bg-background">
                  <Megaphone className="h-3.5 w-3.5" /> 自助推广
                </TabsTrigger>
                <TabsTrigger value="tech" className="gap-1.5 text-xs data-[state=active]:bg-background">
                  <Cpu className="h-3.5 w-3.5" /> 技术服务
                </TabsTrigger>
              </TabsList>

              {/* Self-Service Promotion Tab */}
              <TabsContent value="self-promotion" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selfServiceCards.map((svc) => (
                    <Card
                      key={svc.id}
                      className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group"
                      onClick={() => handleCardClick(svc.id)}
                    >
                      <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <svc.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{svc.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{svc.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Technical Services Tab */}
              <TabsContent value="tech" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {techServiceCards.map((svc) => (
                    <Card
                      key={svc.id}
                      className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group"
                      onClick={() => { setInquiryService(svc.title); setInquiryOpen(true); }}
                    >
                      <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <svc.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{svc.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{svc.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Generic Inquiry Dialog (for non-promotion services) */}
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
              <label className="text-xs font-medium text-muted-foreground">具体需求</label>
              <Textarea placeholder="请描述您的需求..." className="bg-secondary min-h-[80px]" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInquiryOpen(false)}>取消</Button>
              <Button onClick={handleSubmitInquiry} className="bg-primary gap-2">
                <Send className="h-3.5 w-3.5" /> 提交需求
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal A: Seed User Acquisition */}
      <Dialog open={seedOpen} onOpenChange={setSeedOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">种子用户获取</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="text-xs text-muted-foreground">推广项目: <span className="text-foreground font-medium">{selectedProject.name}</span></div>

            {renderBudgetSelector(seedBudget, setSeedBudget, seedCustomBudget, setSeedCustomBudget)}

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">推广目标</label>
              <Select value={seedGoal} onValueChange={setSeedGoal}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="impressions">获取曝光</SelectItem>
                  <SelectItem value="clicks">获取点击</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">预估流量</p>
              <p className="text-lg font-bold text-primary">{estimateSeedResults()}</p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSeedOpen(false)}>取消</Button>
              <Button onClick={handleSubmitSeed} className="bg-primary">提交需求</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal B: Experience & Review User */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">体验评测用户获取</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="text-xs text-muted-foreground">推广项目: <span className="text-foreground font-medium">{selectedProject.name}</span></div>

            {renderBudgetSelector(reviewBudget, setReviewBudget, reviewCustomBudget, setReviewCustomBudget)}

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">评测目标</label>
              <Select value={reviewGoal} onValueChange={setReviewGoal}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="experience">体验产品</SelectItem>
                  <SelectItem value="development">产品开发</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">预估触达</p>
              <p className="text-lg font-bold text-primary">{estimateReviewResults()}</p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewOpen(false)}>取消</Button>
              <Button onClick={handleSubmitReview} className="bg-primary">提交需求</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal C: User Scale Growth */}
      <Dialog open={growthOpen} onOpenChange={setGrowthOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">用户规模增长</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="text-xs text-muted-foreground">推广项目: <span className="text-foreground font-medium">{selectedProject.name}</span></div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">推广渠道（多选）</label>
              {[
                { id: "csdn-display", label: "CSDN 展示广告" },
                { id: "csdn-channel", label: "CSDN 通道广告" },
                { id: "csdn-custom", label: "CSDN 非标广告" },
                { id: "non-csdn", label: "非 CSDN 推广" },
                { id: "overseas", label: "出海推广" },
              ].map((ch) => (
                <div key={ch.id} className="flex items-center gap-2">
                  <Checkbox
                    id={ch.id}
                    checked={growthChannels.includes(ch.id)}
                    onCheckedChange={() => toggleGrowthChannel(ch.id)}
                  />
                  <label htmlFor={ch.id} className="text-sm text-foreground cursor-pointer">{ch.label}</label>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">具体需求</label>
              <Textarea
                placeholder="请描述您的预算和需求..."
                value={growthRequirements}
                onChange={(e) => setGrowthRequirements(e.target.value)}
                className="bg-secondary min-h-[80px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setGrowthOpen(false)}>取消</Button>
              <Button onClick={handleSubmitGrowth} className="bg-primary">提交需求</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MakerStudio;
