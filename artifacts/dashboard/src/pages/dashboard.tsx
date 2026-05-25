import { useGetDashboardStats, useGetSentimentTrend, useListMentions, useListAlerts, useTriggerScan, getGetDashboardStatsQueryKey, getListMentionsQueryKey, getListAlertsQueryKey, getGetSentimentTrendQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MessageSquare, TrendingUp, TrendingDown, Minus, AlertTriangle, Tag, Bell, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatCard({ label, value, icon: Icon, color, isLoading }: { label: string; value?: number; icon: React.ElementType; color: string; isLoading: boolean }) {
  return (
    <Card data-testid={`card-stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{label}</p>
          {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold text-foreground">{value ?? 0}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive") return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">Positive</Badge>;
  if (sentiment === "negative") return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px]">Negative</Badge>;
  return <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0 text-[10px]">Neutral</Badge>;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: trend, isLoading: trendLoading } = useGetSentimentTrend();
  const { data: mentionsData, isLoading: mentionsLoading } = useListMentions({ limit: 6 });
  const { data: alerts, isLoading: alertsLoading } = useListAlerts({ limit: 5 });
  const scanMutation = useTriggerScan();

  const handleScan = () => {
    scanMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMentionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSentimentTrendQueryKey() });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live brand intelligence across Reddit</p>
        </div>
        <Button
          data-testid="button-trigger-scan"
          size="sm"
          onClick={handleScan}
          disabled={scanMutation.isPending}
          className="gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanMutation.isPending ? "animate-spin" : ""}`} />
          {scanMutation.isPending ? "Scanning..." : "Scan Now"}
        </Button>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Mentions" value={stats?.totalMentions} icon={MessageSquare} color="bg-primary/10 text-primary" isLoading={statsLoading} />
        <StatCard label="Positive" value={stats?.positiveMentions} icon={TrendingUp} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" isLoading={statsLoading} />
        <StatCard label="Negative" value={stats?.negativeMentions} icon={TrendingDown} color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" isLoading={statsLoading} />
        <StatCard label="Neutral" value={stats?.neutralMentions} icon={Minus} color="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" isLoading={statsLoading} />
        <StatCard label="Urgent" value={stats?.urgentMentions} icon={AlertTriangle} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" isLoading={statsLoading} />
        <StatCard label="Complaints" value={stats?.complaintMentions} icon={AlertTriangle} color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" isLoading={statsLoading} />
        <StatCard label="Unread Alerts" value={stats?.unreadAlerts} icon={Bell} color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" isLoading={statsLoading} />
        <StatCard label="Keywords" value={stats?.trackedKeywords} icon={Tag} color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" isLoading={statsLoading} />
      </div>

      {/* Sentiment trend chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">Sentiment Trend — Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNeu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area type="monotone" dataKey="positive" stroke="#10b981" fill="url(#gradPos)" strokeWidth={2} name="Positive" />
                <Area type="monotone" dataKey="neutral" stroke="#94a3b8" fill="url(#gradNeu)" strokeWidth={2} name="Neutral" />
                <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#gradNeg)" strokeWidth={2} name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent mentions + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Recent Mentions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {mentionsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              : (mentionsData?.mentions ?? []).map((m) => (
                  <div key={m.id} data-testid={`card-mention-${m.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{m.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">r/{m.subreddit}</span>
                        <span className="text-[10px] text-muted-foreground">{m.upvotes} upvotes</span>
                        {m.isUrgent && <span className="text-[10px] text-amber-600 font-medium">Urgent</span>}
                      </div>
                    </div>
                    <SentimentBadge sentiment={m.sentiment} />
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {alertsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : (alerts ?? []).map((a) => (
                  <div key={a.id} data-testid={`card-alert-${a.id}`} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${a.isRead ? "border-transparent" : "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-900/10"}`}>
                    <Bell className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${a.isRead ? "text-muted-foreground" : "text-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">{a.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                    </div>
                    {!a.isRead && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />}
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
