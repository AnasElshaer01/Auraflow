import {
  useGetDashboardStats,
  useGetSentimentTrend,
  useListMentions,
  useListAlerts,
  useTriggerScan,
  getGetDashboardStatsQueryKey,
  getListMentionsQueryKey,
  getListAlertsQueryKey,
  getGetSentimentTrendQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  MessageSquare, TrendingUp, TrendingDown, Minus, AlertTriangle, Tag, Bell, RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatCard({
  label, value, icon: Icon, color, isLoading,
}: {
  label: string; value?: number; icon: React.ElementType; color: string; isLoading: boolean;
}) {
  return (
    <Card className="border-border/60 bg-card/80 hover:border-primary/20 transition-colors duration-300">
      <CardContent className="p-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.14em] mb-2">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-14 bg-muted/60" />
          ) : (
            <p className="text-3xl font-semibold text-foreground tabular-nums">{value ?? 0}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive")
    return (
      <Badge className="bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 text-[9px] font-semibold tracking-wide uppercase shrink-0">
        Positive
      </Badge>
    );
  if (sentiment === "negative")
    return (
      <Badge className="bg-red-950/70 text-red-400 border border-red-800/40 text-[9px] font-semibold tracking-wide uppercase shrink-0">
        Negative
      </Badge>
    );
  return (
    <Badge className="bg-slate-800/80 text-slate-400 border border-slate-700/40 text-[9px] font-semibold tracking-wide uppercase shrink-0">
      Neutral
    </Badge>
  );
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
            Real-time brand intelligence across Reddit
          </p>
        </div>
        <Button
          data-testid="button-trigger-scan"
          size="sm"
          onClick={handleScan}
          disabled={scanMutation.isPending}
          className="gap-2 h-8 text-xs font-semibold tracking-wide bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 shadow-none"
          variant="outline"
        >
          <RefreshCw className={`w-3 h-3 ${scanMutation.isPending ? "animate-spin" : ""}`} />
          {scanMutation.isPending ? "Scanning..." : "Scan Now"}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Mentions" value={stats?.totalMentions} icon={MessageSquare}
          color="bg-primary/8 text-primary border border-primary/20" isLoading={statsLoading} />
        <StatCard label="Positive" value={stats?.positiveMentions} icon={TrendingUp}
          color="bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" isLoading={statsLoading} />
        <StatCard label="Negative" value={stats?.negativeMentions} icon={TrendingDown}
          color="bg-red-950/60 text-red-400 border border-red-900/40" isLoading={statsLoading} />
        <StatCard label="Neutral" value={stats?.neutralMentions} icon={Minus}
          color="bg-slate-800/60 text-slate-400 border border-slate-700/40" isLoading={statsLoading} />
        <StatCard label="Urgent" value={stats?.urgentMentions} icon={AlertTriangle}
          color="bg-amber-950/60 text-amber-400 border border-amber-900/40" isLoading={statsLoading} />
        <StatCard label="Complaints" value={stats?.complaintMentions} icon={AlertTriangle}
          color="bg-orange-950/60 text-orange-400 border border-orange-900/40" isLoading={statsLoading} />
        <StatCard label="Unread Alerts" value={stats?.unreadAlerts} icon={Bell}
          color="bg-violet-950/60 text-violet-400 border border-violet-900/40" isLoading={statsLoading} />
        <StatCard label="Keywords" value={stats?.trackedKeywords} icon={Tag}
          color="bg-primary/8 text-primary border border-primary/20" isLoading={statsLoading} />
      </div>

      {/* Sentiment trend chart */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
            Sentiment Signal — Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-4">
          {trendLoading ? (
            <Skeleton className="h-52 w-full bg-muted/40" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNeu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", letterSpacing: "0.05em" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false} allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                    fontSize: 11,
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                  }}
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeOpacity: 0.3 }}
                />
                <Legend
                  iconType="circle" iconSize={6}
                  wrapperStyle={{ fontSize: 10, paddingTop: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}
                />
                <Area type="monotone" dataKey="positive" stroke="#34d399" fill="url(#gradPos)" strokeWidth={1.5} name="Positive" dot={false} />
                <Area type="monotone" dataKey="neutral" stroke="#94a3b8" fill="url(#gradNeu)" strokeWidth={1.5} name="Neutral" dot={false} />
                <Area type="monotone" dataKey="negative" stroke="#f87171" fill="url(#gradNeg)" strokeWidth={1.5} name="Negative" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent mentions + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
              Recent Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 px-3 pb-3">
            {mentionsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-muted/40" />)
              : (mentionsData?.mentions ?? []).map((m) => (
                <div
                  key={m.id}
                  data-testid={`card-mention-${m.id}`}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-sm hover:bg-muted/30 transition-colors group border border-transparent hover:border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground/80 truncate group-hover:text-foreground transition-colors">
                      {m.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-primary/60 font-medium">r/{m.subreddit}</span>
                      <span className="text-[10px] text-muted-foreground/50">{m.upvotes} upvotes</span>
                      {m.isUrgent && (
                        <span className="text-[9px] text-amber-400 font-semibold tracking-wide uppercase">Urgent</span>
                      )}
                    </div>
                  </div>
                  <SentimentBadge sentiment={m.sentiment} />
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
              Alert Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 px-3 pb-3">
            {alertsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-muted/40" />)
              : (alerts ?? []).map((a) => (
                <div
                  key={a.id}
                  data-testid={`card-alert-${a.id}`}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-sm border transition-colors ${
                    a.isRead
                      ? "border-transparent"
                      : "border-amber-900/30 bg-amber-950/20"
                  }`}
                >
                  <Bell
                    className={`w-3 h-3 mt-0.5 shrink-0 ${a.isRead ? "text-muted-foreground/40" : "text-amber-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground/70 leading-snug">{a.message}</p>
                    <p className="text-[9px] text-muted-foreground/40 mt-0.5 tracking-wide">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!a.isRead && (
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0 signal-pulse" />
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
