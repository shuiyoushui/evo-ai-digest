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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Link2, Zap, LayoutTemplate, Megaphone, Feather, Globe, Send, ChevronDown,
  Plane, Eye, Pencil, Trash2, FileEdit, ArrowRight, Sparkles, Users, Building2, Link, Github,
  Plus, X, Terminal, Briefcase, Banknote, Code, UserPlus, Cpu, CircleDollarSign,
  Radio, LayoutGrid, Newspaper, Target, Rocket, BookOpen, Calculator, FileText,
  Presentation, Handshake, Landmark, Bot, Database, HardDrive, UserCheck, UserCog, Award,
} from "lucide-react";
import { categories, products } from "@/data/mockData";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const serviceCategories = {
  promotion: {
    label: "推广服务", icon: Megaphone,
    items: [
      { id: "csdn-channel", title: "CSDN通道广告", desc: "技术频道精准曝光", icon: Target },
      { id: "csdn-display", title: "CSDN展示广告", desc: "首页与侧边栏Banner广告", icon: LayoutGrid },
      { id: "csdn-custom", title: "CSDN非标广告", desc: "软文、活动、社区推送", icon: Newspaper },
      { id: "domestic-ads", title: "非CSDN国内广告", desc: "其他技术媒体与平台", icon: Radio },
      { id: "overseas-ads", title: "非CSDN出海广告", desc: "Product Hunt发布与全球媒体", icon: Rocket },
    ],
  },
  business: {
    label: "工商财税服务", icon: Building2,
    items: [
      { id: "opc", title: "OPC注册", desc: "一人公司快速注册通道", icon: FileText },
      { id: "bookkeeping", title: "记账服务", desc: "专业财务代理记账", icon: BookOpen },
      { id: "tax", title: "报税服务", desc: "税务合规与筹划", icon: Calculator },
    ],
  },
  financing: {
    label: "项目融资服务", icon: CircleDollarSign,
    items: [
      { id: "roadshow", title: "项目路演", desc: "Demo Day参与与路演辅导", icon: Presentation },
      { id: "vc", title: "VC对接/股权融资", desc: "连接优质投资机构", icon: Handshake },
      { id: "loan", title: "企业贷款/债权融资", desc: "银行与信贷支持", icon: Landmark },
    ],
  },
  tech: {
    label: "产品技术服务", icon: Cpu,
    items: [
      { id: "llm", title: "大模型接入", desc: "API接入与模型部署", icon: Bot },
      { id: "rag", title: "RAG调优", desc: "知识库构建与优化", icon: Database },
      { id: "agent", title: "Agent 开发", desc: "定制智能体开发", icon: Zap },
      { id: "data", title: "语料/数据服务", desc: "数据清洗与标注", icon: HardDrive },
      { id: "compute", title: "计算资源服务", desc: "GPU与云算力", icon: Code },
    ],
  },
  talent: {
    label: "人才服务", icon: Users,
    items: [
      { id: "parttime", title: "兼职", desc: "灵活的开发者/设计师", icon: UserCheck },
      { id: "fulltime", title: "全职", desc: "核心团队招聘", icon: UserPlus },
      { id: "executive", title: "高招", desc: "CTO/联合创始人匹配", icon: Award },
    ],
  },
};

const mockProjects = [
  { id: "p1", name: "我的AI助手", slogan: "你的智能工作伙伴", status: "已上线", date: "2024-03-15" },
  { id: "p2", name: "代码审查Bot", slogan: "AI自动代码审查", status: "审核中", date: "2024-03-10" },
  { id: "p3", name: "智能翻译工具", slogan: "多语言实时翻译", status: "已上线", date: "2024-02-20" },
  ...products.slice(0, 3).map((p) => ({ id: p.id, name: p.name, slogan: p.slogan, status: "已上线", date: p.launchDate })),
];

const uniqueProjects = mockProjects.filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i);

const MakerStudio = () => {
  const [searchParams] = useSearchParams();
  const [submitStep, setSubmitStep] = useState<SubmitStep>("choose");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("submit");
  const [selectedProject, setSelectedProject] = useState(uniqueProjects[0]);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");
  const [myProjects, setMyProjects] = useState(uniqueProjects);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof uniqueProjects[0] | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [newTag, setNewTag] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="submit">智能提交</TabsTrigger>
            <TabsTrigger value="projects">我的项目</TabsTrigger>
            <TabsTrigger value="promotion">推广服务</TabsTrigger>
            <TabsTrigger value="more">更多服务……</TabsTrigger>
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
                          {/* Preset Tag Chips */}
                          <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] text-muted-foreground mr-1">平台:</span>
                              {platformPresets.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => togglePresetTag(tag)}
                                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                    formData.tags.includes(tag)
                                      ? "bg-primary/15 text-primary border-primary/30"
                                      : "bg-secondary/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] text-muted-foreground mr-1">定价:</span>
                              {pricingPresets.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => togglePresetTag(tag)}
                                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                    formData.tags.includes(tag)
                                      ? "bg-primary/15 text-primary border-primary/30"
                                      : "bg-secondary/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">产品描述 *</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="详细描述你的产品功能、特色和目标用户..."
                          className="bg-secondary min-h-[140px]"
                        />
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
                      {/* Agent Skills */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Zap className="h-3 w-3 text-primary" /> Agent Skills
                          </label>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addSkill}>
                            <Plus className="h-3 w-3" /> 添加技能
                          </Button>
                        </div>
                        {formData.skills.length === 0 && (
                          <p className="text-xs text-muted-foreground/60 text-center py-3">暂无技能，点击上方按钮添加</p>
                        )}
                        {formData.skills.map((skill, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-secondary/40 border border-border/30">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={skill.name}
                                onChange={(e) => updateSkill(idx, "name", e.target.value)}
                                placeholder="技能名称，如：Web Browsing"
                                className="bg-background h-8 text-sm"
                              />
                              <Textarea
                                value={skill.description}
                                onChange={(e) => updateSkill(idx, "description", e.target.value)}
                                placeholder="技能描述..."
                                className="bg-background min-h-[60px] text-sm"
                              />
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeSkill(idx)}>
                              <X className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-border/60" />

                      {/* Prompt Library */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Terminal className="h-3 w-3 text-primary" /> Prompt Library
                          </label>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addPrompt}>
                            <Plus className="h-3 w-3" /> 添加提示词
                          </Button>
                        </div>
                        {formData.prompts.length === 0 && (
                          <p className="text-xs text-muted-foreground/60 text-center py-3">暂无提示词，点击上方按钮添加</p>
                        )}
                        {formData.prompts.map((prompt, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-secondary/40 border border-border/30">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={prompt.title}
                                onChange={(e) => updatePrompt(idx, "title", e.target.value)}
                                placeholder="提示词标题，如：Fix Bug"
                                className="bg-background h-8 text-sm"
                              />
                              <Textarea
                                value={prompt.content}
                                onChange={(e) => updatePrompt(idx, "content", e.target.value)}
                                placeholder="提示词内容..."
                                className="bg-background min-h-[80px] text-sm font-mono"
                              />
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removePrompt(idx)}>
                              <X className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section 3: Links */}
                  <div className="space-y-1 mb-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="h-5 w-1 bg-primary rounded-full" /> 相关链接
                    </h3>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Link className="h-3 w-3" /> 官方网站
                          </label>
                          <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." className="bg-secondary font-mono text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Github className="h-3 w-3" /> GitHub
                          </label>
                          <Input value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} placeholder="https://github.com/..." className="bg-secondary font-mono text-sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section 4: Team & Company */}
                  <div className="space-y-1 mb-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="h-5 w-1 bg-primary rounded-full" /> 团队与公司
                    </h3>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Users className="h-3 w-3" /> 创始人/负责人
                          </label>
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
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" /> 公司名称
                          </label>
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

          {/* PROMOTION SERVICES TAB */}
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
              <h3 className="text-lg font-bold text-foreground">推广服务</h3>
              <p className="text-sm text-muted-foreground mt-1">覆盖产品全生命周期的一站式生态服务市场</p>
            </div>

            <Tabs defaultValue="promotion" className="w-full">
              <TabsList className="bg-secondary w-full justify-start flex-wrap h-auto gap-1 p-1.5">
                {Object.entries(serviceCategories).map(([key, cat]) => (
                  <TabsTrigger key={key} value={key} className="gap-1.5 text-xs data-[state=active]:bg-background">
                    <cat.icon className="h-3.5 w-3.5" /> {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(serviceCategories).map(([key, cat]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.items.map((svc) => (
                      <Card
                        key={svc.id}
                        className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group"
                        onClick={() => { setInquiryService(svc.title); setInquiryOpen(true); }}
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <svc.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{svc.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{svc.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* MORE SERVICES TAB */}
          <TabsContent value="more" className="animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-2">更多服务</h3>
            <p className="text-sm text-muted-foreground mb-6">以下服务正在持续接入中，敬请期待</p>
            <div className="space-y-3">
              {[
                { name: "OPC 注册", desc: "一站式开放平台企业认证与注册服务" },
                { name: "大模型服务", desc: "大模型接入、微调训练及私有化部署服务" },
                { name: "云计算服务", desc: "弹性云资源、GPU算力及基础设施托管服务" },
              ].map((svc) => (
                <Card key={svc.name} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{svc.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{svc.desc}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">即将上线</Badge>
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
