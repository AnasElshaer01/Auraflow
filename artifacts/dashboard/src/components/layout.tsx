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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, MessageSquare, Tag, Bell, FileText, Radio } from "lucide-react";
import { useListAlerts } from "@workspace/api-client-react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/mentions", label: "Mentions", icon: MessageSquare },
  { href: "/app/keywords", label: "Keywords", icon: Tag },
  { href: "/app/alerts", label: "Alerts", icon: Bell },
  { href: "/app/summaries", label: "AI Summaries", icon: FileText },
];

function SignalDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
    </span>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: alerts } = useListAlerts({ limit: 100, unreadOnly: true });
  const unreadCount = Array.isArray(alerts) ? alerts.length : 0;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-sm bg-primary/10 border border-primary/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="2" fill="hsl(var(--primary))" />
                  <circle cx="9" cy="9" r="4.5" stroke="hsl(var(--primary))" strokeWidth="0.75" strokeOpacity="0.5" />
                  <circle cx="9" cy="9" r="7" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.25" />
                  <line x1="9" y1="2" x2="9" y2="4" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.6" />
                  <line x1="16" y1="9" x2="14" y2="9" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.6" />
                  <line x1="9" y1="16" x2="9" y2="14" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.6" />
                  <line x1="2" y1="9" x2="4" y2="9" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.6" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-sidebar-foreground">
                AuraFlow
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <SignalDot />
                <p className="text-[9px] text-primary/70 tracking-[0.14em] uppercase font-medium">
                  Monitoring active
                </p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-4 px-2">
          <div className="px-3 mb-2">
            <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-muted-foreground/50">
              Intelligence
            </p>
          </div>
          <SidebarMenu className="gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/app" ? location === "/app" : location.startsWith(href);
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm text-[12px] font-medium tracking-wide transition-all ${
                        isActive
                          ? "text-primary bg-primary/8 border border-primary/20"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/60"}`} />
                      <span>{label}</span>
                      {label === "Alerts" && unreadCount > 0 && (
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-primary/15 text-primary border border-primary/25 tracking-wide">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] text-muted-foreground/40 tracking-[0.12em] uppercase">
              Reddit · 24/7 scan
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col min-w-0 intelligence-grid">
        <header className="flex h-11 items-center gap-3 border-b border-border/60 px-4 shrink-0 bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="text-muted-foreground/50 hover:text-muted-foreground w-7 h-7" />
          <div className="h-3.5 w-px bg-border/60" />
          <span className="text-[10px] text-muted-foreground/50 font-medium tracking-[0.14em] uppercase">
            {navItems.find((n) => (n.href === "/app" ? location === "/app" : location.startsWith(n.href)))?.label ?? "AuraFlow"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <SignalDot />
            <span className="text-[9px] text-muted-foreground/40 tracking-wider uppercase">Live</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </div>
  );
}
