import { useState } from "react";
import { Search, Plus, LogIn, Hexagon, Settings, LogOut, Rocket, Phone, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TopNavProps {
  onSearch?: (query: string) => void;
}

export function TopNav({ onSearch }: TopNavProps) {
  const location = useLocation();
  const { profile, isLoggedIn, loginWithPhone, registerWithPhone, logout, isAdmin } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Register state
  const [regNickname, setRegNickname] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setRegNickname(""); setRegPhone(""); setRegPassword("");
    setLoginPhone(""); setLoginPassword("");
    setSubmitting(false);
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const resetState = () => {
    setRegStep("email"); setRegEmail(""); setRegOtp(""); setRegPassword(""); setRegNickname("");
    setLoginMode("password"); setLoginEmail(""); setLoginPassword("");
    setLoginOtpStep("email"); setLoginOtpCode("");
    setSubmitting(false); setOtpSending(false);
  };

  // ===== Register Flow =====
  const handleRegSendOtp = async () => {
    if (!regEmail) { toast.error("请输入邮箱"); return; }
    setOtpSending(true);
    try {
      await sendOtp(regEmail);
      setRegStep("otp");
      startCountdown();
      toast.success("验证码已发送到邮箱");
    } catch (e: any) {
      toast.error(e.message || "发送验证码失败");
    } finally {
      setOtpSending(false);
    }
  };

  const handleRegVerifyOtp = async () => {
    if (regOtp.length !== 6) { toast.error("请输入6位验证码"); return; }
    setSubmitting(true);
    try {
      await verifyOtp(regEmail, regOtp);
      setRegStep("password");
      toast.success("邮箱验证成功，请设置密码和昵称");
    } catch (e: any) {
      toast.error(e.message || "验证码错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegSetPassword = async () => {
    if (!regPassword || regPassword.length < 6) { toast.error("密码至少6位"); return; }
    if (!regNickname) { toast.error("请输入昵称"); return; }
    setSubmitting(true);
    try {
      await setPasswordAfterOtp(regPassword);
      await supabase.auth.updateUser({ data: { nickname: regNickname } });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ nickname: regNickname }).eq("id", user.id);
      }
      resetState();
      setAuthOpen(false);
      toast.success("注册成功！");
    } catch (e: any) {
      toast.error(e.message || "设置密码失败");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Login Flow =====
  const handleLoginWithPassword = async () => {
    if (!loginEmail || !loginPassword) { toast.error("请填写邮箱和密码"); return; }
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      resetState();
      setAuthOpen(false);
      toast.success("登录成功");
    } catch (e: any) {
      toast.error(e.message || "登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSendOtp = async () => {
    if (!loginEmail) { toast.error("请输入邮箱"); return; }
    setOtpSending(true);
    try {
      await sendOtp(loginEmail);
      setLoginOtpStep("otp");
      startCountdown();
      toast.success("验证码已发送到邮箱");
    } catch (e: any) {
      toast.error(e.message || "发送验证码失败");
    } finally {
      setOtpSending(false);
    }
  };

  const handleLoginWithOtp = async () => {
    if (loginOtpCode.length !== 6) { toast.error("请输入6位验证码"); return; }
    setSubmitting(true);
    try {
      await loginWithOtp(loginEmail, loginOtpCode);
      resetState();
      setAuthOpen(false);
      toast.success("登录成功");
    } catch (e: any) {
      toast.error(e.message || "验证码错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
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
            <Link to="/"><Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" className="text-sm">发现</Button></Link>
            <Link to="/news"><Button variant={location.pathname === "/news" ? "secondary" : "ghost"} size="sm" className="text-sm">AI 资讯</Button></Link>
            <Link to="/about"><Button variant={location.pathname === "/about" ? "secondary" : "ghost"} size="sm" className="text-sm">关于我们</Button></Link>
            {isAdmin && (
              <Link to="/admin"><Button variant={location.pathname === "/admin" ? "secondary" : "ghost"} size="sm" className="text-sm">管理后台</Button></Link>
            )}
          </nav>

          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索AI产品..." className="pl-9 bg-secondary border-border/60 h-9 text-sm" onChange={(e) => onSearch?.(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/maker?tab=submit">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">提交产品</span>
              </Button>
            </Link>
            <Link to="/maker?tab=projects">
              <Button variant={location.pathname === "/maker" ? "secondary" : "ghost"} size="sm" className="text-sm">发布者中心</Button>
            </Link>

            {isLoggedIn && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/15 text-primary">{profile.nickname.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{profile.nickname}</span>
                    {profile.csdn_bound && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild><Rocket className="h-4 w-4 text-[hsl(25,95%,53%)] cursor-pointer" /></TooltipTrigger>
                          <TooltipContent className="text-xs">csdn 助力新产品曝光中</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center gap-2"><Settings className="h-3.5 w-3.5" /> 个人信息维护</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-3.5 w-3.5 mr-2" /> 退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setAuthOpen(true)}>
                <LogIn className="h-4 w-4" /><span className="hidden sm:inline text-sm">登录/注册</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={authOpen} onOpenChange={(open) => { setAuthOpen(open); if (!open) resetState(); }}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-center">欢迎来到 Agent Hunt</DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={(v) => { setAuthTab(v as "login" | "register"); resetState(); }} className="mt-2">
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="login" className="flex-1 text-sm">登录</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 text-sm">注册</TabsTrigger>
            </TabsList>

            {/* ===== 登录 ===== */}
            <TabsContent value="login" className="space-y-4 mt-4">
              {/* 登录方式切换 */}
              <div className="flex gap-2">
                <Button
                  variant={loginMode === "password" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => { setLoginMode("password"); setLoginOtpStep("email"); setLoginOtpCode(""); }}
                >
                  <Lock className="h-3.5 w-3.5" /> 密码登录
                </Button>
                <Button
                  variant={loginMode === "otp" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => { setLoginMode("otp"); setLoginOtpStep("email"); }}
                >
                  <KeyRound className="h-3.5 w-3.5" /> 验证码登录
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">邮箱</label>
                <Input
                  placeholder="输入邮箱"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-secondary"
                />
              </div>

              {loginMode === "password" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">密码</label>
                    <Input
                      type="password"
                      placeholder="输入密码"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-secondary"
                      onKeyDown={(e) => e.key === "Enter" && handleLoginWithPassword()}
                    />
                  </div>
                  <Button className="w-full bg-primary" onClick={handleLoginWithPassword} disabled={submitting}>
                    {submitting ? "登录中..." : "登录"}
                  </Button>
                </>
              ) : (
                <>
                  {loginOtpStep === "email" ? (
                    <Button className="w-full bg-primary" onClick={handleLoginSendOtp} disabled={otpSending || countdown > 0}>
                      {otpSending ? "发送中..." : countdown > 0 ? `重新发送 (${countdown}s)` : "发送验证码"}
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">验证码</label>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={loginOtpCode} onChange={setLoginOtpCode}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <button
                          className="text-xs text-primary hover:underline mt-1 disabled:text-muted-foreground"
                          disabled={countdown > 0}
                          onClick={handleLoginSendOtp}
                        >
                          {countdown > 0 ? `${countdown}s 后可重发` : "重新发送"}
                        </button>
                      </div>
                      <Button className="w-full bg-primary" onClick={handleLoginWithOtp} disabled={submitting}>
                        {submitting ? "验证中..." : "验证并登录"}
                      </Button>
                    </>
                  )}
                </>
              )}
            </TabsContent>

            {/* ===== 注册 ===== */}
            <TabsContent value="register" className="space-y-4 mt-4">
              {regStep === "email" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">邮箱</label>
                    <Input placeholder="输入邮箱" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="bg-secondary" />
                  </div>
                  <Button className="w-full bg-primary" onClick={handleRegSendOtp} disabled={otpSending || countdown > 0}>
                    <Mail className="h-4 w-4 mr-1.5" />
                    {otpSending ? "发送中..." : countdown > 0 ? `重新发送 (${countdown}s)` : "发送验证码"}
                  </Button>
                </>
              )}

              {regStep === "otp" && (
                <>
                  <p className="text-xs text-muted-foreground text-center">
                    验证码已发送至 <span className="text-foreground font-medium">{regEmail}</span>
                  </p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={regOtp} onChange={setRegOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <button
                    className="text-xs text-primary hover:underline disabled:text-muted-foreground block mx-auto"
                    disabled={countdown > 0}
                    onClick={handleRegSendOtp}
                  >
                    {countdown > 0 ? `${countdown}s 后可重发` : "重新发送"}
                  </button>
                  <Button className="w-full bg-primary" onClick={handleRegVerifyOtp} disabled={submitting}>
                    {submitting ? "验证中..." : "验证邮箱"}
                  </Button>
                </>
              )}

              {regStep === "password" && (
                <>
                  <p className="text-xs text-muted-foreground text-center">
                    邮箱 <span className="text-foreground font-medium">{regEmail}</span> 已验证 ✓
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">昵称</label>
                    <Input placeholder="设置昵称" value={regNickname} onChange={(e) => setRegNickname(e.target.value)} className="bg-secondary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">密码</label>
                    <Input
                      type="password"
                      placeholder="设置密码（至少6位）"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="bg-secondary"
                      onKeyDown={(e) => e.key === "Enter" && handleRegSetPassword()}
                    />
                  </div>
                  <Button className="w-full bg-primary" onClick={handleRegSetPassword} disabled={submitting}>
                    {submitting ? "注册中..." : "完成注册"}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
