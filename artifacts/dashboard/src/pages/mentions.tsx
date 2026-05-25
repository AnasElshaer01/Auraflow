import { useState } from "react";
import { useListMentions, useListKeywords, getListMentionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, AlertTriangle, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive") return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] shrink-0">Positive</Badge>;
  if (sentiment === "negative") return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px] shrink-0">Negative</Badge>;
  return <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0 text-[10px] shrink-0">Neutral</Badge>;
}

export default function Mentions() {
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [keywordFilter, setKeywordFilter] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const params: Record<string, string | number> = { limit, offset };
  if (sentimentFilter !== "all") params.sentiment = sentimentFilter;
  if (keywordFilter !== "all") params.keywordId = Number(keywordFilter);

  const { data: mentionsData, isLoading } = useListMentions(params, {
    query: { queryKey: getListMentionsQueryKey(params) },
  });
  const { data: keywords } = useListKeywords();

  const mentions = mentionsData?.mentions ?? [];
  const total = mentionsData?.total ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Mentions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total mentions found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={sentimentFilter} onValueChange={(v) => { setSentimentFilter(v); setOffset(0); }}>
          <SelectTrigger data-testid="select-sentiment-filter" className="w-40 h-8 text-xs">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
        <Select value={keywordFilter} onValueChange={(v) => { setKeywordFilter(v); setOffset(0); }}>
          <SelectTrigger data-testid="select-keyword-filter" className="w-44 h-8 text-xs">
            <SelectValue placeholder="Keyword" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Keywords</SelectItem>
            {(keywords ?? []).map((k) => (
              <SelectItem key={k.id} value={String(k.id)}>{k.text}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mention cards */}
      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : mentions.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No mentions found</p>
            </div>
          )
          : mentions.map((m) => (
            <Card key={m.id} data-testid={`card-mention-${m.id}`} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground leading-snug">{m.title}</span>
                    </div>
                    {m.body && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.body}</p>
                    )}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                      <span className="text-[11px] text-muted-foreground">by {m.author}</span>
                      {m.subreddit && <span className="text-[11px] text-primary font-medium">r/{m.subreddit}</span>}
                      <span className="text-[11px] text-muted-foreground">{m.upvotes} upvotes</span>
                      <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(m.mentionedAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {m.isUrgent && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
                          <AlertTriangle className="w-3 h-3" />Urgent
                        </span>
                      )}
                      {m.isComplaint && (
                        <span className="text-[10px] font-medium text-orange-600">Complaint</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <SentimentBadge sentiment={m.sentiment} />
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-mention-${m.id}`}
                      className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors"
                    >
                      Reddit <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} data-testid="button-prev-page">
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} data-testid="button-next-page">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
