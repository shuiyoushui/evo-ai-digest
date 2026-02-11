import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, TrendingUp, DollarSign, Mail, MessageCircle } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="hero-glow h-48 -mt-1 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 -mt-24 relative z-10 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4 shadow-lg">
            AI
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">AI 创客星球</h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            连接开发者与 AI 机遇的一站式平台
          </p>
        </div>

        {/* Project Positioning */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" /> 项目定位
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI 创客星球致力于成为中国领先的 AI 产品发现与交流平台。我们汇聚全球优质 AI 工具与产品，
                为开发者、创业者和企业用户搭建一个发现、评测和推广 AI 产品的生态社区。
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                无论你是 AI 工具的使用者还是创造者，都能在这里找到属于你的舞台。
                我们相信，每一个优秀的 AI 产品都值得被更多人看到。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Value Proposition */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> 核心价值
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Rocket,
                title: "孵化",
                desc: "为早期 AI 产品提供曝光机会，助力产品从0到1快速成长。",
                color: "text-blue-400",
              },
              {
                icon: TrendingUp,
                title: "流量",
                desc: "依托 CSDN 技术社区生态，精准触达百万级开发者用户。",
                color: "text-emerald-400",
              },
              {
                icon: DollarSign,
                title: "变现",
                desc: "多元化推广服务与商业合作机会，帮助产品实现商业价值。",
                color: "text-amber-400",
              },
            ].map((item) => (
              <Card key={item.title} className="bg-card border-border hover-lift">
                <CardContent className="p-5 text-center">
                  <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-3`} />
                  <h3 className="font-semibold text-foreground text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
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
                <span className="text-sm text-foreground">AI创客星球</span>
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
