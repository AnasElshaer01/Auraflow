import { useListKeywords, useCreateKeyword, useDeleteKeyword, getListKeywordsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Tag, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const schema = z.object({
  text: z.string().min(1, "Keyword is required"),
  type: z.enum(["brand", "competitor", "keyword"]),
});
type FormValues = z.infer<typeof schema>;

function TypeBadge({ type }: { type: string }) {
  if (type === "brand")
    return (
      <Badge className="bg-primary/10 text-primary border border-primary/25 text-[9px] font-semibold tracking-[0.1em] uppercase">
        Brand
      </Badge>
    );
  if (type === "competitor")
    return (
      <Badge className="bg-orange-950/60 text-orange-400 border border-orange-900/40 text-[9px] font-semibold tracking-[0.1em] uppercase">
        Competitor
      </Badge>
    );
  return (
    <Badge className="bg-slate-800/80 text-slate-400 border border-slate-700/40 text-[9px] font-semibold tracking-[0.1em] uppercase">
      Keyword
    </Badge>
  );
}

export default function Keywords() {
  const queryClient = useQueryClient();
  const { data: keywords, isLoading } = useListKeywords();
  const createMutation = useCreateKeyword();
  const deleteMutation = useDeleteKeyword();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { text: "", type: "keyword" },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListKeywordsQueryKey() });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListKeywordsQueryKey() }) }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Keywords</h1>
        <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
          Define signals to track across Reddit — brands, competitors, topics
        </p>
      </div>

      {/* Add keyword */}
      <Card className="border-border/60 bg-card/80">
        <CardContent className="p-5">
          <h2 className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-4 flex items-center gap-2">
            <Plus className="w-3 h-3 text-primary" />
            Track a new signal
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground/60 font-semibold">
                      Signal keyword
                    </FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-keyword-text"
                        placeholder="e.g. Acme Corp, SaaS pricing..."
                        {...field}
                        className="h-8 text-xs bg-background/60 border-border/60 focus:border-primary/50 placeholder:text-muted-foreground/30"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-36">
                    <FormLabel className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground/60 font-semibold">
                      Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger
                          data-testid="select-keyword-type"
                          className="h-8 text-xs bg-background/60 border-border/60 hover:border-primary/30"
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border/80 text-xs">
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="competitor">Competitor</SelectItem>
                        <SelectItem value="keyword">Keyword</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="sm"
                className="sm:self-end h-8 text-xs font-semibold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-add-keyword"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Keyword list */}
      <div className="space-y-1.5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-muted/40 rounded-sm" />
            ))
          : (keywords ?? []).length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/30">
              <Tag className="w-8 h-8 mb-3" />
              <p className="text-[10px] tracking-[0.12em] uppercase">No signals defined</p>
            </div>
          )
          : (keywords ?? []).map((kw) => (
            <div
              key={kw.id}
              data-testid={`card-keyword-${kw.id}`}
              className="flex items-center gap-4 px-4 py-3 rounded-sm border border-border/50 bg-card/70 hover:border-primary/20 hover:bg-card/90 transition-all duration-200 group"
            >
              <Tag className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 group-hover:text-primary/50 transition-colors" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground/80">{kw.text}</span>
                <p className="text-[9px] text-muted-foreground/40 mt-0.5 tracking-wide">
                  Added {formatDistanceToNow(new Date(kw.createdAt), { addSuffix: true })}
                </p>
              </div>
              <TypeBadge type={kw.type} />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground/20 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                data-testid={`button-delete-keyword-${kw.id}`}
                onClick={() => handleDelete(kw.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
