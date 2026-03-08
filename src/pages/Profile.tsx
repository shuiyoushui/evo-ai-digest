import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Upload, Shield, AlertTriangle, Rocket, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { profile, isLoggedIn, updateProfile, bindCSDN } = useAuth();
  const navigate = useNavigate();
  const [profileNickname, setProfileNickname] = useState(profile?.nickname || "");
  const [profilePhone, setProfilePhone] = useState(profile?.phone || "");
  const [profileEmail, setProfileEmail] = useState(profile?.email || "");
  const [csdnUsername, setCsdnUsername] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">请先登录</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ nickname: profileNickname, phone: profilePhone, email: profileEmail });
      toast.success("个人信息已保存");
    } catch {
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleBindCSDN = async () => {
    if (!csdnUsername) { toast.error("请输入CSDN用户名"); return; }
    try {
      await bindCSDN(csdnUsername);
      toast.success("CSDN账号绑定成功！", { description: "您已获得免费曝光流量资格" });
    } catch {
      toast.error("绑定失败");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h3 className="text-lg font-bold text-foreground">个人信息维护</h3>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><CardTitle className="text-sm">基本信息</CardTitle></div>
            <CardDescription className="text-xs">管理您的头像和昵称</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-primary/15 text-primary">{(profile?.nickname || "U").slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload className="h-5 w-5 text-muted-foreground" /></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{profile?.nickname || "未登录"}</p>
                <p className="text-xs text-muted-foreground">点击头像更换</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">昵称</label>
              <Input value={profileNickname} onChange={(e) => setProfileNickname(e.target.value)} className="bg-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><CardTitle className="text-sm">安全设置</CardTitle></div>
            <CardDescription className="text-xs">管理手机号、邮箱和密码</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">手机号</label>
              <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="bg-secondary" placeholder="输入手机号" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">邮箱</label>
              <Input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="输入邮箱地址" className="bg-secondary" />
            </div>
            <div className="flex justify-end">
              <Button className="bg-primary" onClick={handleSaveProfile} disabled={saving}>{saving ? "保存中..." : "保存信息"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(25,95%,53%)]/10 to-transparent p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-[hsl(25,95%,53%)]" />
              <h4 className="text-sm font-bold text-foreground">CSDN 账号集成</h4>
              {profile?.csdn_bound && <Rocket className="h-4 w-4 text-[hsl(25,95%,53%)]" />}
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="rounded-lg bg-[hsl(25,95%,53%)]/5 border border-[hsl(25,95%,53%)]/20 p-3">
              <p className="text-sm text-foreground font-medium">🚀 关联 CSDN 账号即可获取免费曝光流量！</p>
              <p className="text-xs text-muted-foreground mt-1">绑定后，您的产品将获得额外的 CSDN 社区曝光资源</p>
            </div>
            {profile?.csdn_bound ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <Rocket className="h-4 w-4 text-[hsl(25,95%,53%)]" />
                <span className="text-sm text-foreground">{profile.csdn_username}</span>
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

        <Card className="bg-card border-destructive/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><CardTitle className="text-sm text-destructive">危险操作</CardTitle></div>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-xs text-muted-foreground mb-3">删除账号后，所有数据将不可恢复。</p>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="text-xs">账号注销</Button></AlertDialogTrigger>
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
    </div>
  );
};

export default Profile;
