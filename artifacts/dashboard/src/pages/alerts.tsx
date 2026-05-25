import { useListAlerts, useMarkAlertRead, useMarkAllAlertsRead, getListAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function AlertTypeBadge({ type }: { type: string }) {
  if (type === "negative_mention")
    return (
      <Badge className="bg-red-950/60 text-red-400 border border-red-900/40 text-[9px] font-semibold tracking-[0.1em] uppercase gap-1">
        <AlertTriangle className="w-2 h-2" />Negative
      </Badge>
    );
  if (type === "high_engagement")
    return (
      <Badge className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] font-semibold tracking-[0.1em] uppercase gap-1">
        <TrendingUp className="w-2 h-2" />Engagement
      </Badge>
    );
  return (
    <Badge className="bg-amber-950/60 text-amber-400 border border-amber-900/40 text-[9px] font-semibold tracking-[0.1em] uppercase gap-1">
      <Activity className="w-2 h-2" />Competitor
    </Badge>
  );
}

export default function Alerts() {
  const queryClient = useQueryClient();
  const { data: alerts, isLoading } = useListAlerts({ limit: 50 });
  const markReadMutation = useMarkAlertRead();
  const markAllReadMutation = useMarkAllAlertsRead();

  const unreadCount = (alerts ?? []).filter((a) => !a.isRead).length;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ id }, { onSuccess: invalidate });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, { onSuccess: invalidate });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Alerts</h1>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide tabular-nums">
            {unreadCount > 0 ? `${unreadCount} unread signals` : "All signals acknowledged"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-[10px] font-semibold tracking-wide border-border/60 bg-card/60 hover:border-primary/30 text-muted-foreground"
            data-testid="button-mark-all-read"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-3 h-3" />
            Acknowledge all
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-muted/40 rounded-sm" />
            ))
          : (alerts ?? []).length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/30">
              <Bell className="w-8 h-8 mb-3" />
              <p className="text-[10px] tracking-[0.12em] uppercase">No alerts detected</p>
            </div>
          )
          : (alerts ?? []).map((a) => (
            <Card
              key={a.id}
              data-testid={`card-alert-${a.id}`}
              className={`rounded-sm transition-all duration-200 ${
                !a.isRead
                  ? "border-amber-900/40 bg-amber-950/15 hover:border-amber-700/40"
                  : "border-border/40 bg-card/60 hover:border-border/70"
              }`}
            >
              <CardContent className="p-3.5 flex items-start gap-3.5">
                <div
                  className={`mt-0.5 w-7 h-7 rounded-sm flex items-center justify-center shrink-0 ${
                    !a.isRead ? "bg-amber-950/60 border border-amber-900/40" : "bg-muted/40 border border-border/30"
                  }`}
                >
                  <Bell className={`w-3 h-3 ${!a.isRead ? "text-amber-400" : "text-muted-foreground/30"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <AlertTypeBadge type={a.type} />
                    {!a.isRead && (
                      <div className="w-1 h-1 rounded-full bg-primary signal-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/75 leading-snug">{a.message}</p>
                  <p className="text-[9px] text-muted-foreground/35 mt-1 tracking-wide">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!a.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[9px] text-muted-foreground/40 hover:text-primary hover:bg-primary/10 shrink-0 h-6 px-2 tracking-wide uppercase font-semibold"
                    data-testid={`button-mark-read-${a.id}`}
                    onClick={() => handleMarkRead(a.id)}
                    disabled={markReadMutation.isPending}
                  >
                    Ack
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
