import { useState } from "react";
import { Search, Plus, LogIn, Hexagon, User, Settings, LogOut, Rocket } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TopNavProps {
  onSearch?: (query: string) => void;
}

export function TopNav({ onSearch }: TopNavProps) {
  const location = useLocation();
  const { user, isLoggedIn, login, register, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Form state
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleLogin = () => {
    if (!phone || !password) { toast.error("请填写手机号和密码"); return; }
    login(phone, password);
    setAuthOpen(false);
    setPhone(""); setPassword("");
    toast.success("登录成功");
  };

  const handleRegister = () => {
    if (!phone || !password || !nickname) { toast.error("请填写所有字段"); return; }
    register(phone, password, nickname);
    setAuthOpen(false);
    setPhone(""); setPassword(""); setNickname("");
    toast.success("注册成功");
  };

  const handleLogout = () => {
    logout();
    toast.success("已退出登录");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <Hexagon className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-foreground text-base leading-tight tracking-tight">Agent Hunt</span>
              <span className="text-[10px] text-muted-foreground leading-tight">发现最好的AI工具</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link to="/">
              <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" className="text-sm">发现</Button>
            </Link>
            <Link to="/news">
              <Button variant={location.pathname === "/news" ? "secondary" : "ghost"} size="sm" className="text-sm">AI 资讯</Button>
            </Link>
            <Link to="/about">
              <Button variant={location.pathname === "/about" ? "secondary" : "ghost"} size="sm" className="text-sm">关于我们</Button>
            </Link>
            <Link to="/admin">
              <Button variant={location.pathname === "/admin" ? "secondary" : "ghost"} size="sm" className="text-sm">管理后台</Button>
            </Link>
          </nav>

          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索AI产品..."
                className="pl-9 bg-secondary border-border/60 h-9 text-sm"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Right side: Submit -> Publisher Center -> User */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/maker">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">提交产品</span>
              </Button>
            </Link>
            <Link to="/maker">
              <Button variant={location.pathname === "/maker" ? "secondary" : "ghost"} size="sm" className="text-sm">
                发布者中心
              </Button>
            </Link>

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/15 text-primary">
                        {user.nickname.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.nickname}</span>
                    {user.csdnBound && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Rocket className="h-4 w-4 text-[hsl(25,95%,53%)] animate-in fade-in duration-300 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            csdn 助力新产品曝光中
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/maker?tab=profile" className="flex items-center gap-2">
                      <Settings className="h-3.5 w-3.5" /> 个人信息维护
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-3.5 w-3.5 mr-2" /> 退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setAuthOpen(true)}>
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">登录/注册</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Login / Register Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-center">欢迎来到 Agent Hunt</DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "register")} className="mt-2">
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="login" className="flex-1 text-sm">登录</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 text-sm">注册</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">手机号</label>
                <Input placeholder="输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">密码</label>
                <Input type="password" placeholder="输入密码" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary" />
              </div>
              <Button className="w-full bg-primary" onClick={handleLogin}>登录</Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">昵称</label>
                <Input placeholder="设置昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} className="bg-secondary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">手机号</label>
                <Input placeholder="输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">密码</label>
                <Input type="password" placeholder="设置密码" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary" />
              </div>
              <Button className="w-full bg-primary" onClick={handleRegister}>注册</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
