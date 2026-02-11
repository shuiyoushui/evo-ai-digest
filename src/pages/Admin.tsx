import { useState } from "react";
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
import { LayoutDashboard, FileText, Megaphone, Settings, X, Plus, Eye, ThumbsUp, Clock, MessageCircle, Save, Image } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockInquiries } from "@/data/mockData";
import { defaultBannerSlides, type BannerSlide } from "@/components/home/HomeBanner";
import { toast } from "sonner";

const sidebarItems = [
  { id: "overview", label: "数据总览", icon: LayoutDashboard },
  { id: "submissions", label: "产品审核", icon: FileText },
  { id: "ads", label: "广告管理", icon: Megaphone },
  { id: "config", label: "系统配置", icon: Settings },
];

const mockSubmissions = [
  { id: "1", name: "AutoGPT Pro", status: "待审核", date: "2024-03-20", maker: "张三" },
  { id: "2", name: "AI翻译官", status: "已通过", date: "2024-03-19", maker: "李四" },
  { id: "3", name: "智能客服Bot", status: "待审核", date: "2024-03-18", maker: "王五" },
  { id: "4", name: "代码审查AI", status: "已拒绝", date: "2024-03-17", maker: "赵六" },
];

const categoryInquiryData = [
  { name: "AI Agents", value: 45 },
  { name: "图像生成", value: 30 },
  { name: "开发工具", value: 25 },
  { name: "效率工具", value: 18 },
  { name: "写作", value: 10 },
];

const serviceTypeData = [
  { name: "展示广告", value: 40, fill: "hsl(238, 83%, 67%)" },
  { name: "频道精准", value: 25, fill: "hsl(142, 71%, 45%)" },
  { name: "非标合作", value: 20, fill: "hsl(38, 92%, 50%)" },
  { name: "站外流量", value: 15, fill: "hsl(262, 83%, 58%)" },
];

const PIE_COLORS = ["hsl(238, 83%, 67%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(262, 83%, 58%)"];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [cats, setCats] = useState(["AI Agents", "效率工具", "图像生成", "开发者工具", "写作", "营销"]);
  const [newCat, setNewCat] = useState("");
  const [weights, setWeights] = useState({ upvotes: 40, views: 25, comments: 20, decay: 15 });
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(defaultBannerSlides);

  const addCategory = () => {
    if (newCat.trim() && !cats.includes(newCat.trim())) {
      setCats([...cats, newCat.trim()]);
      setNewCat("");
    }
  };

  const updateBanner = (index: number, field: keyof BannerSlide, value: string | boolean) => {
    setBannerSlides((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSaveBanners = () => {
    toast.success("Banner配置已保存", { description: "首页轮播图将在下次刷新时更新" });
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
                    {mockSubmissions.map((s) => (
                      <TableRow key={s.id} className="border-border">
                        <TableCell className="text-sm font-medium">{s.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.maker}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.date}</TableCell>
                        <TableCell><Badge variant={s.status === "已通过" ? "default" : s.status === "已拒绝" ? "destructive" : "secondary"} className="text-[10px]">{s.status}</Badge></TableCell>
                        <TableCell className="text-right"><Button size="sm" variant="ghost" className="text-xs h-7">审核</Button></TableCell>
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
              <h2 className="text-lg font-bold text-foreground">广告管理</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">总咨询请求</p>
                    <p className="text-3xl font-bold text-foreground">128</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs text-muted-foreground font-normal">按分类统计</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={categoryInquiryData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} />
                        <Bar dataKey="value" fill="hsl(238, 83%, 67%)" radius={[0, 4, 4, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs text-muted-foreground font-normal">按服务类型</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={serviceTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={25} strokeWidth={0}>
                          {serviceTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(240, 10%, 5.5%)", border: "1px solid hsl(240, 5%, 17%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,98%)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 ml-2 shrink-0">
                      {serviceTypeData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                          <span className="text-muted-foreground">{d.name}</span>
                          <span className="text-foreground font-medium">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">近期咨询记录</CardTitle></CardHeader>
                <Table>
                  <TableHeader><TableRow className="border-border">
                    <TableHead className="text-xs">项目名称</TableHead><TableHead className="text-xs">服务类型</TableHead><TableHead className="text-xs">联系人</TableHead><TableHead className="text-xs">预算</TableHead><TableHead className="text-xs">日期</TableHead><TableHead className="text-xs">状态</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {mockInquiries.map((inq) => (
                      <TableRow key={inq.id} className="border-border">
                        <TableCell className="text-sm font-medium">{inq.projectName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{inq.serviceType}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{inq.contact}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{inq.budget}</TableCell>
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

              {/* Banner Config - NEW */}
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
                      {/* Thumbnail preview */}
                      <div className={`h-14 w-20 rounded-md bg-gradient-to-br ${slide.gradient} flex items-center justify-center shrink-0`}>
                        <span className="text-[10px] text-white/80 font-medium">预览</span>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">标题</label>
                          <Input
                            value={slide.title}
                            onChange={(e) => updateBanner(i, "title", e.target.value)}
                            className="bg-secondary h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">链接地址</label>
                          <Input
                            value={slide.link}
                            onChange={(e) => updateBanner(i, "link", e.target.value)}
                            className="bg-secondary h-8 text-xs font-mono"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                        <label className="text-[10px] text-muted-foreground">启用</label>
                        <Switch
                          checked={slide.active}
                          onCheckedChange={(v) => updateBanner(i, "active", v)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button onClick={handleSaveBanners} size="sm" className="gap-1.5 bg-primary">
                    <Save className="h-3.5 w-3.5" /> 保存配置
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3"><CardTitle className="text-sm">功能开关</CardTitle><CardDescription className="text-xs">控制平台功能模块的启用状态</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "展示团队雷达图", desc: "在产品详情页显示团队能力雷达", defaultOn: true },
                    { label: "启用融资模块", desc: "显示公司融资信息", defaultOn: true },
                    { label: "开放注册", desc: "允许新用户注册", defaultOn: true },
                    { label: "最新上线模块", desc: "在首页显示「最新上线」Tab", defaultOn: true },
                    { label: "评论功能", desc: "启用产品评论区", defaultOn: false },
                    { label: "CSDN Passport 登录", desc: "允许使用CSDN账号登录", defaultOn: true },
                  ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between">
                      <div><p className="text-sm text-foreground">{toggle.label}</p><p className="text-xs text-muted-foreground">{toggle.desc}</p></div>
                      <Switch defaultChecked={toggle.defaultOn} />
                    </div>
                  ))}
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

              <Card className="bg-card border-border">
                <CardHeader className="pb-3"><CardTitle className="text-sm">AI 配置</CardTitle><CardDescription className="text-xs">配置产品分析使用的AI模型</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs text-muted-foreground">模型名称</label><Input defaultValue="deepseek-v3" className="bg-secondary font-mono text-sm" /></div>
                    <div className="space-y-1.5"><label className="text-xs text-muted-foreground">API Key</label><Input type="password" defaultValue="sk-xxxxxxxxxx" className="bg-secondary font-mono text-sm" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-xs text-muted-foreground">System Prompt</label>
                    <Textarea defaultValue="你是一个AI产品分析专家。根据提供的产品URL或GitHub仓库链接，分析产品的核心功能、目标用户、技术特点，并生成结构化的产品信息。请用中文回答。" className="bg-secondary font-mono text-xs min-h-[120px] leading-relaxed" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3"><CardTitle className="text-sm">分类管理</CardTitle><CardDescription className="text-xs">添加或移除产品分类标签</CardDescription></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cats.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs gap-1 pr-1">{c}<button onClick={() => setCats(cats.filter((x) => x !== c))} className="ml-1 hover:text-destructive transition-colors"><X className="h-3 w-3" /></button></Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="新分类名称..." className="bg-secondary text-sm" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} />
                    <Button size="sm" onClick={addCategory} className="bg-primary gap-1"><Plus className="h-3.5 w-3.5" /> 添加</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
