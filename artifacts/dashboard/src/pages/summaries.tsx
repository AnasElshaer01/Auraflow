import { useListSummaries, useGenerateSummary, getListSummariesQueryKey } from "@workspace/api-client-react";
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
          <h1 className="text-xl font-semibold text-foreground">AI Summaries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Daily intelligence reports generated from your mentions</p>
        </div>
        <Button
          data-testid="button-generate-summary"
          size="sm"
          className="gap-2"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {generateMutation.isPending ? "Generating..." : "Generate Summary"}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)
          : (summaries ?? []).length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm mb-3">No summaries yet</p>
              <Button size="sm" onClick={handleGenerate} className="gap-2" data-testid="button-generate-first-summary">
                <Sparkles className="w-3.5 h-3.5" />Generate your first summary
              </Button>
            </div>
          )
          : (summaries ?? []).map((s) => (
            <Card key={s.id} data-testid={`card-summary-${s.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {format(new Date(s.date), "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px] gap-1">
                    <Sparkles className="w-2.5 h-2.5" />AI Generated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <BarChart2 className="w-3 h-3" />Sentiment Overview
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{s.sentimentOverview}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <MessageSquare className="w-3 h-3" />Top Mentions
                  </div>
                  <p className="text-xs text-foreground leading-relaxed line-clamp-4">{s.topMentions}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <AlertCircle className="w-3 h-3" />Main Complaints
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{s.mainComplaints}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <TrendingUp className="w-3 h-3" />Trending Discussions
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{s.trendingDiscussions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
