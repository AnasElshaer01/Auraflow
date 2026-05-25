import {
  useListSummaries,
  useGenerateSummary,
  getListSummariesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, MessageSquare, AlertCircle, TrendingUp, BarChart2 } from "lucide-react";
import { format } from "date-fns";

export default function Summaries() {
  const queryClient = useQueryClient();
  const { data: summaries, isLoading } = useListSummaries({ limit: 10 });
  const generateMutation = useGenerateSummary();

  const handleGenerate = () => {
    generateMutation.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSummariesQueryKey() }),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">AI Summaries</h1>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
            Daily intelligence reports synthesized from brand signals
          </p>
        </div>
        <Button
          data-testid="button-generate-summary"
          size="sm"
          className="gap-2 h-8 text-[10px] font-semibold tracking-[0.1em] uppercase bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
        >
          <Sparkles className="w-3 h-3" />
          {generateMutation.isPending ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full bg-muted/40 rounded-sm" />
            ))
          : (summaries ?? []).length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/30 border border-dashed border-border/30 rounded-sm">
              <FileText className="w-8 h-8 mb-3" />
              <p className="text-[10px] tracking-[0.12em] uppercase mb-4">No intelligence reports yet</p>
              <Button
                size="sm"
                onClick={handleGenerate}
                className="gap-2 h-8 text-[10px] font-semibold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-generate-first-summary"
              >
                <Sparkles className="w-3 h-3" />Generate first report
              </Button>
            </div>
          )
          : (summaries ?? []).map((s) => (
            <Card
              key={s.id}
              data-testid={`card-summary-${s.id}`}
              className="border-border/50 bg-card/80 rounded-sm hover:border-primary/15 transition-colors duration-300"
            >
              <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                      Intelligence Report
                    </CardTitle>
                    <p className="text-sm font-semibold text-foreground mt-0.5 tracking-tight">
                      {format(new Date(s.date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border border-primary/25 text-[9px] font-semibold tracking-[0.1em] uppercase gap-1">
                    <Sparkles className="w-2 h-2" />AI Generated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 px-5 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em]">
                    <BarChart2 className="w-2.5 h-2.5 text-primary/50" />
                    Sentiment Overview
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">{s.sentimentOverview}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em]">
                    <MessageSquare className="w-2.5 h-2.5 text-primary/50" />
                    Top Signals
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed line-clamp-4">{s.topMentions}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em]">
                    <AlertCircle className="w-2.5 h-2.5 text-red-400/60" />
                    Risk Signals
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">{s.mainComplaints}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em]">
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-400/60" />
                    Trending Discussions
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">{s.trendingDiscussions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
