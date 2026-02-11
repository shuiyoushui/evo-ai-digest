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
import { LayoutDashboard, FileText, Megaphone, Settings, X, Plus, Eye, ThumbsUp, Clock, MessageCircle } from "lucide-react";

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

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [cats, setCats] = useState(["AI Agents", "效率工具", "图像生成", "开发者工具", "视频", "写作", "营销"]);
  const [newCat, setNewCat] = useState("");
  const [weights, setWeights] = useState({ upvotes: 40, views: 25, comments: 20, decay: 15 });

  const addCategory = () => {
    if (newCat.trim() && !cats.includes(newCat.trim())) {
      setCats([...cats, newCat.trim()]);
      setNewCat("");
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
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-secondary rounded-none">
              {sidebarItems.map((i) => <TabsTrigger key={i.id} value={i.id} className="text-xs">{i.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
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
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="h-48 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">📊 平台趋势图表</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">产品审核</h2>
              <Card className="bg-card border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-xs">产品名称</TableHead>
                      <TableHead className="text-xs">提交者</TableHead>
                      <TableHead className="text-xs">日期</TableHead>
                      <TableHead className="text-xs">状态</TableHead>
                      <TableHead className="text-xs text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSubmissions.map((s) => (
                      <TableRow key={s.id} className="border-border">
                        <TableCell className="text-sm font-medium">{s.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.maker}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.date}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "已通过" ? "default" : s.status === "已拒绝" ? "destructive" : "secondary"} className="text-[10px]">
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-xs h-7">审核</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === "ads" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">广告管理</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "进行中", count: 5, revenue: "¥12,500" },
                  { label: "待审批", count: 3, revenue: "¥8,200" },
                  { label: "已完成", count: 28, revenue: "¥68,500" },
                ].map((ad) => (
                  <Card key={ad.label} className="bg-card border-border">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">{ad.count}</p>
                      <p className="text-xs text-muted-foreground mb-1">{ad.label}</p>
                      <p className="text-sm text-primary font-medium">{ad.revenue}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">系统配置</h2>

              {/* Feature Toggles */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">功能开关</CardTitle>
                  <CardDescription className="text-xs">控制平台功能模块的启用状态</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "展示团队雷达图", desc: "在产品详情页显示团队能力雷达", defaultOn: true },
                    { label: "启用融资模块", desc: "显示公司融资信息", defaultOn: true },
                    { label: "开放注册", desc: "允许新用户注册", defaultOn: true },
                    { label: "评论功能", desc: "启用产品评论区", defaultOn: false },
                    { label: "CSDN Passport 登录", desc: "允许使用CSDN账号登录", defaultOn: true },
                  ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground">{toggle.label}</p>
                        <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                      </div>
                      <Switch defaultChecked={toggle.defaultOn} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ranking Algorithm */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">排名算法权重</CardTitle>
                  <CardDescription className="text-xs">调整各因素在排名中的权重占比（总和需为100%）</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { key: "upvotes" as const, label: "投票权重", icon: ThumbsUp },
                    { key: "views" as const, label: "浏览权重", icon: Eye },
                    { key: "comments" as const, label: "评论权重", icon: MessageCircle },
                    { key: "decay" as const, label: "时间衰减", icon: Clock },
                  ].map((w) => (
                    <div key={w.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <w.icon className="h-3 w-3" />{w.label}
                        </span>
                        <span className="text-foreground font-semibold font-mono">{weights[w.key]}%</span>
                      </div>
                      <Slider
                        value={[weights[w.key]]}
                        onValueChange={([v]) => setWeights({ ...weights, [w.key]: v })}
                        max={100}
                        step={5}
                        className="[&_[role=slider]]:bg-primary"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Configuration */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">AI 配置</CardTitle>
                  <CardDescription className="text-xs">配置产品分析使用的AI模型</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">模型名称</label>
                      <Input defaultValue="deepseek-v3" className="bg-secondary font-mono text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">API Key</label>
                      <Input type="password" defaultValue="sk-xxxxxxxxxx" className="bg-secondary font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">System Prompt</label>
                    <Textarea
                      defaultValue="你是一个AI产品分析专家。根据提供的产品URL或GitHub仓库链接，分析产品的核心功能、目标用户、技术特点，并生成结构化的产品信息。请用中文回答。"
                      className="bg-secondary font-mono text-xs min-h-[120px] leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Management */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">分类管理</CardTitle>
                  <CardDescription className="text-xs">添加或移除产品分类标签</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cats.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs gap-1 pr-1">
                        {c}
                        <button
                          onClick={() => setCats(cats.filter((x) => x !== c))}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="新分类名称..."
                      className="bg-secondary text-sm"
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCategory()}
                    />
                    <Button size="sm" onClick={addCategory} className="bg-primary gap-1">
                      <Plus className="h-3.5 w-3.5" /> 添加
                    </Button>
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
