import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, Users, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface OverviewStats {
  totalApproved: number;
  yesterdaySubmitted: number;
  pendingCount: number;
  totalUsers: number;
}

interface TrendItem {
  date: string;
  count: number;
}

export function OverviewTab() {
  const [stats, setStats] = useState<OverviewStats>({ totalApproved: 0, yesterdaySubmitted: 0, pendingCount: 0, totalUsers: 0 });
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const now = new Date();
      const yesterday = subDays(now, 1);
      const yesterdayStart = startOfDay(yesterday).toISOString();
      const yesterdayEnd = endOfDay(yesterday).toISOString();
      const sevenDaysAgo = startOfDay(subDays(now, 6)).toISOString();

      const [approvedRes, yesterdayRes, pendingRes, usersRes, trendRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("products").select("id", { count: "exact", head: true }).gte("created_at", yesterdayStart).lte("created_at", yesterdayEnd),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("created_at").eq("status", "approved").gte("created_at", sevenDaysAgo),
      ]);

      setStats({
        totalApproved: approvedRes.count ?? 0,
        yesterdaySubmitted: yesterdayRes.count ?? 0,
        pendingCount: pendingRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
      });

      // Group trend data by day
      const dayMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        dayMap[format(subDays(now, i), "MM-dd")] = 0;
      }
      (trendRes.data || []).forEach((row: { created_at: string }) => {
        const key = format(new Date(row.created_at), "MM-dd");
        if (key in dayMap) dayMap[key]++;
      });
      setTrend(Object.entries(dayMap).map(([date, count]) => ({ date, count })));
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "总产品数", value: stats.totalApproved, icon: CheckCircle, desc: "审核通过" },
    { label: "昨日提交", value: stats.yesterdaySubmitted, icon: FileText, desc: "自然日" },
    { label: "待审核", value: stats.pendingCount, icon: Clock, desc: "累计待处理" },
    { label: "总用户数", value: stats.totalUsers, icon: Users, desc: "注册用户" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg font-bold text-foreground">数据总览</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "—" : s.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">近 7 日审核通过产品数</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">加载中...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trend}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="count" name="通过数" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
