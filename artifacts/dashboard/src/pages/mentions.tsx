import { useState } from "react";
import { useListMentions, useListKeywords, getListMentionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, AlertTriangle, MessageCircle, Triangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

function PlatformLabel({ platform, url }: { platform: string; url: string }) {
  const isHN = platform === "hackernews";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-0.5 text-[9px] text-muted-foreground/40 hover:text-primary transition-colors tracking-wide uppercase"
    >
      {isHN ? (
        <>
          <Triangle className="w-2 h-2 fill-orange-500/60 stroke-none" />
          HN
        </>
      ) : (
        <>Reddit</>
      )}
      <ArrowUpRight className="w-2.5 h-2.5" />
    </a>
  );
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
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Mentions</h1>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide tabular-nums">
            {total} signals detected
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={sentimentFilter} onValueChange={(v) => { setSentimentFilter(v); setOffset(0); }}>
          <SelectTrigger
            data-testid="select-sentiment-filter"
            className="w-40 h-8 text-[11px] font-medium tracking-wide bg-card/80 border-border/60 text-muted-foreground hover:border-primary/30 transition-colors"
          >
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/80 text-[11px]">
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
        <Select value={keywordFilter} onValueChange={(v) => { setKeywordFilter(v); setOffset(0); }}>
          <SelectTrigger
            data-testid="select-keyword-filter"
            className="w-44 h-8 text-[11px] font-medium tracking-wide bg-card/80 border-border/60 text-muted-foreground hover:border-primary/30 transition-colors"
          >
            <SelectValue placeholder="Keyword" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/80 text-[11px]">
            <SelectItem value="all">All Keywords</SelectItem>
            {(keywords ?? []).map((k) => (
              <SelectItem key={k.id} value={String(k.id)}>{k.text}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mention list */}
      <div className="space-y-1.5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-muted/40 rounded-sm" />
            ))
          : mentions.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/40">
              <MessageCircle className="w-8 h-8 mb-3" />
              <p className="text-xs tracking-[0.1em] uppercase">No signals found</p>
              <p className="text-[10px] mt-1 text-muted-foreground/30">
                Use "Scan Now" in the dashboard to fetch live mentions
              </p>
            </div>
          )
          : mentions.map((m) => (
            <Card
              key={m.id}
              data-testid={`card-mention-${m.id}`}
              className="border-border/50 bg-card/70 hover:border-primary/20 hover:bg-card/90 transition-all duration-200 rounded-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground/85 leading-snug">{m.title}</span>
                    {m.body && (
                      <p className="text-[11px] text-muted-foreground/50 mt-1 line-clamp-2 leading-relaxed">
                        {m.body}
                      </p>
                    )}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                      <span className="text-[10px] text-muted-foreground/40">
                        by {m.author}
                      </span>
                      {m.subreddit && (
                        <span className="text-[10px] text-primary/70 font-medium">
                          r/{m.subreddit}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                        {m.upvotes} {m.platform === "hackernews" ? "pts" : "upvotes"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40">
                        {formatDistanceToNow(new Date(m.mentionedAt), { addSuffix: true })}
                      </span>
                    </div>
                    {(m.isUrgent || m.isComplaint) && (
                      <div className="flex items-center gap-2 mt-1.5">
                        {m.isUrgent && (
                          <span className="flex items-center gap-1 text-[9px] font-semibold tracking-[0.1em] uppercase text-amber-400">
                            <AlertTriangle className="w-2.5 h-2.5" />Urgent
                          </span>
                        )}
                        {m.isComplaint && (
                          <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-orange-400">
                            Complaint
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <SentimentBadge sentiment={m.sentiment} />
                    <PlatformLabel platform={m.platform ?? "hackernews"} url={m.url} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-muted-foreground/40 tracking-wide tabular-nums">
            {offset + 1}–{Math.min(offset + limit, total)} of {total} signals
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              data-testid="button-prev-page"
              className="h-7 text-[10px] font-medium tracking-wide border-border/60 bg-card/60 hover:border-primary/30 text-muted-foreground"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              data-testid="button-next-page"
              className="h-7 text-[10px] font-medium tracking-wide border-border/60 bg-card/60 hover:border-primary/30 text-muted-foreground"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
