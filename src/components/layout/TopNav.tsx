import { Search, Plus, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface TopNavProps {
  onSearch?: (query: string) => void;
}

export function TopNav({ onSearch }: TopNavProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-4 px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            AI
          </div>
          <span className="font-semibold text-foreground text-lg hidden sm:block">AI 创客星球</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link to="/">
            <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" className="text-sm">发现</Button>
          </Link>
          <Link to="/maker">
            <Button variant={location.pathname === "/maker" ? "secondary" : "ghost"} size="sm" className="text-sm">创作者中心</Button>
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

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/maker">
            <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">提交产品</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">CSDN登录</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
