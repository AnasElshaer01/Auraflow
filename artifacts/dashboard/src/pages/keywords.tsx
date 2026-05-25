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
  if (type === "brand") return <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Brand</Badge>;
  if (type === "competitor") return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 text-[10px]">Competitor</Badge>;
  return <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0 text-[10px]">Keyword</Badge>;
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
        <h1 className="text-xl font-semibold text-foreground">Keywords</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track brands, competitors, and topics across Reddit</p>
      </div>

      {/* Add keyword form */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />Track a new keyword
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Keyword or brand name</FormLabel>
                    <FormControl>
                      <Input data-testid="input-keyword-text" placeholder="e.g. Acme Corp, SaaS pricing..." {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-40">
                    <FormLabel className="text-xs">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-keyword-type" className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                className="sm:self-end h-8"
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
      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          : (keywords ?? []).length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Tag className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No keywords yet — add one above</p>
            </div>
          )
          : (keywords ?? []).map((kw) => (
            <div
              key={kw.id}
              data-testid={`card-keyword-${kw.id}`}
              className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{kw.text}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Added {formatDistanceToNow(new Date(kw.createdAt), { addSuffix: true })}
                </p>
              </div>
              <TypeBadge type={kw.type} />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                data-testid={`button-delete-keyword-${kw.id}`}
                onClick={() => handleDelete(kw.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
