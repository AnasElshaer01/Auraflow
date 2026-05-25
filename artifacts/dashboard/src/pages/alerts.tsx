import { useListAlerts, useMarkAlertRead, useMarkAllAlertsRead, getListAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function AlertTypeBadge({ type }: { type: string }) {
  if (type === "negative_mention") return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px] gap-1"><AlertTriangle className="w-2.5 h-2.5" />Negative</Badge>;
  if (type === "high_engagement") return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] gap-1"><TrendingUp className="w-2.5 h-2.5" />High Engagement</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] gap-1"><Activity className="w-2.5 h-2.5" />Competitor Spike</Badge>;
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
          <h1 className="text-xl font-semibold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            data-testid="button-mark-all-read"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          : (alerts ?? []).length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Bell className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No alerts yet</p>
            </div>
          )
          : (alerts ?? []).map((a) => (
            <Card
              key={a.id}
              data-testid={`card-alert-${a.id}`}
              className={`transition-colors ${!a.isRead ? "border-amber-200 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-900/10" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!a.isRead ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"}`}>
                  <Bell className={`w-3.5 h-3.5 ${!a.isRead ? "text-amber-500" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTypeBadge type={a.type} />
                    {!a.isRead && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                  </div>
                  <p className="text-sm text-foreground mt-1 leading-snug">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                </div>
                {!a.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                    data-testid={`button-mark-read-${a.id}`}
                    onClick={() => handleMarkRead(a.id)}
                    disabled={markReadMutation.isPending}
                  >
                    Dismiss
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
