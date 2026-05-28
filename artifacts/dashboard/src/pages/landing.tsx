import { Link } from "wouter";
import { useGetDashboardStats } from "@workspace/api-client-react";
import {
  MessageSquare, Bell, FileText, Tag, ArrowRight, Radio, Shield,
  TrendingUp, Eye, Zap, ChevronRight, Activity, Globe,
} from "lucide-react";
import logoSrc from "@/assets/auraflow-logo.png";

function SignalRing() {
  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
      <div className="orbit-40 absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-primary/6" />
      <div className="orbit-28 absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-primary/10" />
      <div className="orbit-18 absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-primary/16" />
      <div className="orbit-12 absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-primary/24" />
      <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-primary/35" />

      {[
        { top: "8%",  left: "22%",  delay: "0s"   },
        { top: "18%", right: "12%", delay: "0.8s"  },
        { bottom: "18%", left: "15%", delay: "1.6s" },
        { bottom: "10%", right: "20%", delay: "2.4s" },
        { top: "48%", left: "2%",   delay: "3.2s"  },
        { top: "38%", right: "3%",  delay: "4s"    },
      ].map((pos, i) => {
        const { delay, ...cssPos } = pos;
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/50 signal-pulse"
            style={{ ...cssPos, animationDelay: delay }}
          />
        );
      })}

      <div className="relative z-10">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-sm bg-primary/10 border border-primary/35 flex items-center justify-center backdrop-blur-sm"
          style={{ boxShadow: "0 0 24px rgba(7,211,232,0.15)" }}
        >
          <svg width="26" height="26" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2.5" fill="hsl(var(--primary))" />
            <circle cx="9" cy="9" r="5"   stroke="hsl(var(--primary))" strokeWidth="0.75" strokeOpacity="0.6" />
            <circle cx="9" cy="9" r="7.5" stroke="hsl(var(--primary))" strokeWidth="0.5"  strokeOpacity="0.3" />
            <line x1="9"   y1="1.5" x2="9"  y2="4"  stroke="hsl(var(--primary))" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="16.5" y1="9" x2="14"  y2="9"  stroke="hsl(var(--primary))" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="9"   y1="16.5" x2="9" y2="14" stroke="hsl(var(--primary))" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="1.5" y1="9"  x2="4"   y2="9"  stroke="hsl(var(--primary))" strokeWidth="1.2" strokeOpacity="0.7" />
          </svg>
        </div>
        <span className="absolute inset-0 rounded-sm border border-primary/20 animate-ping opacity-25" />
      </div>
    </div>
  );
}

function StatCounter({ label, value, suffix = "" }: { label: string; value?: number | string; suffix?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-5 px-4">
      <span className="text-xl sm:text-2xl font-semibold text-foreground tabular-nums">
        {value ?? "—"}{suffix}
      </span>
      <span className="text-[10px] text-muted-foreground/50 tracking-[0.14em] uppercase font-medium text-center">{label}</span>
    </div>
  );
}

const features = [
  {
    icon: Globe,
    title: "Reddit Signal Capture",
    desc: "Continuous scanning of thousands of subreddits for any mention of your brand, competitors, or keywords — surfaced in seconds.",
    accent: "text-primary",
    bg: "bg-primary/8 border-primary/20",
  },
  {
    icon: TrendingUp,
    title: "AI Sentiment Engine",
    desc: "Every mention is classified as positive, neutral, or negative with AI-grade language understanding. Urgency and complaint signals are flagged automatically.",
    accent: "text-emerald-400",
    bg: "bg-emerald-950/40 border-emerald-900/30",
  },
  {
    icon: Bell,
    title: "Smart Alert System",
    desc: "Instant notifications for high-engagement posts, negative sentiment spikes, and competitor activity. Never miss a reputation event.",
    accent: "text-amber-400",
    bg: "bg-amber-950/40 border-amber-900/30",
  },
  {
    icon: FileText,
    title: "Daily Intelligence Reports",
    desc: "AI-synthesized daily briefings: top signals, complaint patterns, trending discussions, and sentiment overview — ready every morning.",
    accent: "text-violet-400",
    bg: "bg-violet-950/40 border-violet-900/30",
  },
  {
    icon: Tag,
    title: "Keyword & Competitor Tracking",
    desc: "Track brands, competitors, and any topic. Classify them as brand signals, competitor intel, or market keywords. Add or remove anytime.",
    accent: "text-cyan-400",
    bg: "bg-cyan-950/40 border-cyan-900/30",
  },
  {
    icon: Shield,
    title: "Reputation Defence",
    desc: "Urgent and complaint mentions are separated from noise. Catch reputation crises before they escalate — with the precision of an intelligence system.",
    accent: "text-red-400",
    bg: "bg-red-950/40 border-red-900/30",
  },
];

const steps = [
  {
    n: "01",
    title: "Define your signals",
    desc: "Add your brand name, competitor names, and keywords. AuraFlow begins monitoring immediately — no setup delays.",
  },
  {
    n: "02",
    title: "AuraFlow watches 24/7",
    desc: "Our scanner continuously monitors Reddit, classifying every mention with AI sentiment analysis and urgency detection.",
  },
  {
    n: "03",
    title: "Act on intelligence",
    desc: "Receive smart alerts, browse filtered mentions, and read your AI daily briefing. Know what's being said before it matters.",
  },
];

export default function Landing() {
  const { data: stats } = useGetDashboardStats();

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 h-14 w-full">
          <img
            src={logoSrc}
            alt="AuraFlow"
            className="h-6 w-auto object-contain"
          />
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-6 text-[11px] text-muted-foreground/60 font-medium tracking-wide uppercase">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#how" className="hover:text-primary transition-colors">How it works</a>
            </div>
            <Link href="/app">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.1em] uppercase px-3 sm:px-4 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap">
                Enter Platform <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 intelligence-grid opacity-50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(7,211,232,0.055) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl w-full mx-auto gap-6 sm:gap-8 pt-14">
          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-primary/20 bg-primary/5 text-[10px] font-semibold tracking-[0.14em] uppercase text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Live monitoring · Reddit · 24 / 7
          </div>

          {/* Headline */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold text-foreground leading-[1.05] tracking-[-0.03em]">
              Your brand.<br />
              <span className="text-primary">Always watched.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground/65 max-w-xl mx-auto leading-relaxed font-light tracking-wide">
              AuraFlow monitors Reddit for every mention of your brand, competitors, and keywords —
              then transforms raw signals into actionable intelligence with AI.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link href="/app">
              <span
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 rounded-sm bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:bg-primary/90 transition-all cursor-pointer"
                style={{ boxShadow: "0 0 28px rgba(7,211,232,0.22)" }}
              >
                Open Intelligence Platform
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <span className="flex items-center justify-center gap-2 px-6 py-3 rounded-sm border border-white/10 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all tracking-wide cursor-pointer">
                Explore features
              </span>
            </a>
          </div>

          {/* Signal animation */}
          <div className="mt-2 sm:mt-4 opacity-85">
            <SignalRing />
          </div>
        </div>
      </section>

      {/* ── Live stats ───────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-white/5">
            <StatCounter label="Mentions tracked"  value={stats?.totalMentions} />
            <StatCounter label="Positive signals"  value={stats?.positiveMentions} />
            <StatCounter label="Alerts generated"  value={stats?.unreadAlerts} />
            <StatCounter label="Keywords active"   value={stats?.trackedKeywords} />
            <StatCounter label="Uptime"            value="99.9" suffix="%" />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/70 border border-primary/15 bg-primary/5 px-3 py-1.5 rounded-sm">
              <Activity className="w-2.5 h-2.5" />
              Platform capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-[-0.02em]">
              Precision intelligence.<br />
              <span className="text-muted-foreground/45">For every signal.</span>
            </h2>
            <p className="text-sm text-muted-foreground/50 max-w-lg mx-auto leading-relaxed">
              Six core modules working together to give you complete situational awareness of your brand's online presence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map(({ icon: Icon, title, desc, accent, bg }) => (
              <div
                key={title}
                className="group p-5 rounded-sm border border-white/6 bg-card/60 hover:border-primary/15 hover:bg-card/90 transition-all duration-300"
              >
                <div className={`w-9 h-9 rounded-sm border flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`w-4 h-4 ${accent}`} />
                </div>
                <h3 className="text-[13px] font-semibold text-foreground/85 mb-2 tracking-tight">{title}</h3>
                <p className="text-xs text-muted-foreground/48 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-8 sm:mb-10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-[-0.02em]">
              Intelligence at a glance
            </h2>
            <p className="text-sm text-muted-foreground/45">
              Your live brand dashboard — data from your actual monitored signals.
            </p>
          </div>

          <div
            className="rounded-sm border border-white/8 overflow-hidden bg-card/40"
            style={{ boxShadow: "0 0 80px rgba(7,211,232,0.04)" }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6 bg-background/60">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              <div className="flex-1 mx-4">
                <div className="mx-auto max-w-xs h-5 rounded-sm bg-white/4 flex items-center justify-center">
                  <span className="text-[9px] text-muted-foreground/30 tracking-wide">auraflow.app / dashboard</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary signal-pulse" />
                <span className="text-[9px] text-primary/50 tracking-wider uppercase">Live</span>
              </div>
            </div>
            {/* Stats */}
            <div className="p-4 sm:p-6 intelligence-grid">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Total Mentions",  val: stats?.totalMentions  ?? "—", color: "text-primary"    },
                  { label: "Positive",        val: stats?.positiveMentions ?? "—", color: "text-emerald-400" },
                  { label: "Negative",        val: stats?.negativeMentions ?? "—", color: "text-red-400"    },
                  { label: "Unread Alerts",   val: stats?.unreadAlerts   ?? "—", color: "text-amber-400"  },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-sm border border-white/6 bg-background/60 p-3 sm:p-4">
                    <p className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.14em] font-semibold mb-2">{label}</p>
                    <p className={`text-xl sm:text-2xl font-semibold tabular-nums ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              {/* Sparkline */}
              <div className="rounded-sm border border-white/6 bg-background/60 p-4 h-28 flex flex-col gap-2">
                <p className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.14em]">Sentiment trend — last 7 days</p>
                <div className="flex-1 flex items-end gap-1">
                  {[4, 6, 5, 8, 7, 10, 9, 12, 8, 6, 9, 11, 7, 8].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-0.5 justify-end">
                      <div className="rounded-sm bg-primary/20" style={{ height: `${h * 5}px` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/70 border border-primary/15 bg-primary/5 px-3 py-1.5 rounded-sm">
              <Zap className="w-2.5 h-2.5" />
              How it works
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-[-0.02em]">
              From signal to action.<br />
              <span className="text-muted-foreground/45">In three steps.</span>
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map(({ n, title, desc }) => (
                <div key={n} className="relative flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-sm border border-primary/25 bg-primary/8 flex items-center justify-center">
                    <span className="text-[11px] font-bold tracking-[0.1em] text-primary">{n}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/85 mb-2 tracking-tight">{title}</h3>
                    <p className="text-xs text-muted-foreground/48 leading-relaxed max-w-xs mx-auto">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand pillars ─────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y border-white/5 bg-card/30">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Eye,
                title: "Omnipresent awareness",
                desc: "AuraFlow sees what your team can't. Every thread, every comment, every signal — captured automatically.",
              },
              {
                icon: Shield,
                title: "Reputation defence",
                desc: "Complaints and urgent mentions are separated from noise. Catch crises before they compound.",
              },
              {
                icon: Radio,
                title: "Silent. Always on.",
                desc: "No manual effort. No missed signals. AuraFlow runs continuously in the background — your silent intelligence layer.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3 p-6">
                <Icon className="w-5 h-5 text-primary/60" />
                <h3 className="text-sm font-semibold text-foreground/75 tracking-tight">{title}</h3>
                <p className="text-xs text-muted-foreground/42 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(7,211,232,0.05) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-2xl mx-auto w-full text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-[-0.03em]">
            Start watching.<br />
            <span className="text-primary">Now.</span>
          </h2>
          <p className="text-sm text-muted-foreground/48 leading-relaxed max-w-md mx-auto">
            Add your brand name and AuraFlow begins monitoring Reddit in seconds.
            No credit card. No setup. Just intelligence.
          </p>
          <div className="pt-2">
            <Link href="/app">
              <span
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-sm bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:bg-primary/90 transition-all cursor-pointer"
                style={{ boxShadow: "0 0 36px rgba(7,211,232,0.28)" }}
              >
                Open AuraFlow Platform
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src={logoSrc}
            alt="AuraFlow"
            className="h-5 w-auto object-contain opacity-35"
          />
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground/28 tracking-[0.12em] uppercase">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
              <span className="relative inline-flex rounded-full h-1 w-1 bg-primary/60" />
            </span>
            AI-powered · Reddit monitoring · Brand intelligence · 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
