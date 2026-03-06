import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Crosshair, Rocket, Mail, MessageCircle } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="hero-glow h-48 -mt-1 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4 shadow-lg">
            AH
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Agent Hunt</h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            下一代 AI 产品的发射台
          </p>
        </div>

        {/* Bento Grid */}
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 auto-rows-min">
            {/* Card 1 — Large */}
            <Card className="md:col-span-3 bg-card border-border/50 hover-lift group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
              <CardContent className="p-7 relative z-10">
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">秒级解析，全网首秀</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  告别繁琐填表。粘贴 URL 或 GitHub 仓库，大模型自动抓取 Tech Stack 与核心技能，3分钟开启你的 AI 产品首发。
                </p>
              </CardContent>
            </Card>

            {/* Card 2 — Small top right */}
            <Card className="md:col-span-2 bg-card border-border/50 hover-lift group overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[hsl(280,70%,50%)]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 group-hover:bg-[hsl(280,70%,50%)]/10 transition-colors" />
              <CardContent className="p-7 relative z-10">
                <div className="h-12 w-12 rounded-xl bg-[hsl(280,70%,50%)]/15 flex items-center justify-center mb-4">
                  <Crosshair className="h-6 w-6 text-[hsl(280,70%,50%)]" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">越过噪音，直达内核</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  不看华丽包装，直击 AI 产品的 Agent 技能树与优质 Prompt 库，硬核极客为你提供最真实的深度评测。
                </p>
              </CardContent>
            </Card>

            {/* Card 3 — Full width bottom */}
            <Card className="md:col-span-5 bg-gradient-to-r from-card via-card to-card border-border/50 hover-lift group overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-24 bg-[hsl(25,95%,53%)]/5 rounded-full blur-3xl group-hover:bg-[hsl(25,95%,53%)]/10 transition-colors" />
              <CardContent className="p-7 relative z-10 flex flex-col md:flex-row md:items-center gap-5">
                <div className="h-12 w-12 rounded-xl bg-[hsl(25,95%,53%)]/15 flex items-center justify-center shrink-0">
                  <Rocket className="h-6 w-6 text-[hsl(25,95%,53%)]" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-2">流量引爆，精准破圈</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    绑定开发者社区账号，解锁专属流量引擎。精准触达首批体验官，让你的好想法获取海量极客曝光。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> 联系我们
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">邮箱：</span>
                <span className="text-sm text-foreground">contact@ai-maker-planet.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">微信公众号：</span>
                <span className="text-sm text-foreground">Agent Hunt</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">商务合作微信：</span>
                <span className="text-sm text-foreground">aimaker_biz</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
