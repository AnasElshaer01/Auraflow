import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, MessageSquare, Tag, Bell, FileText } from "lucide-react";
import { useListAlerts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mentions", label: "Mentions", icon: MessageSquare },
  { href: "/keywords", label: "Keywords", icon: Tag },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/summaries", label: "AI Summaries", icon: FileText },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: alerts } = useListAlerts({ unreadOnly: true });
  const unreadCount = Array.isArray(alerts) ? alerts.length : 0;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">L</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">ListenAI</p>
              <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Social Intelligence</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-3 px-2">
          <SidebarMenu>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                      {label === "Alerts" && unreadCount > 0 && (
                        <Badge
                          data-testid="badge-unread-alerts"
                          className="ml-auto text-[10px] px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center bg-destructive text-destructive-foreground"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <header className="flex h-12 items-center gap-3 border-b border-border px-4 shrink-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            {navItems.find((n) => (n.href === "/" ? location === "/" : location.startsWith(n.href)))?.label ?? "ListenAI"}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </div>
  );
}
