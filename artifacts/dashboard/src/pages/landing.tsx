import { Link } from "wouter";
import { useGetDashboardStats } from "@workspace/api-client-react";
import {
  Bell, FileText, Tag, ArrowRight, Radio, Shield,
  TrendingUp, Eye, Zap, Activity, Globe, ChevronDown,
} from "lucide-react";
import iconSrc from "@/assets/auraflow-icon-v2.png";
import logoSrc from "@/assets/auraflow-logo-v2.png";

/* ── Orbital Radar Scanner ──────────────────────────────────────────────────
   Pure rings + rotating sweep beam + signal pulses — no center icon.
   ─────────────────────────────────────────────────────────────────────────── */
function OrbitalScanner() {
  const rings = [170, 132, 97, 64, 33];
  const signalAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="relative select-none" style={{ width: 420, height: 420 }}>
      <style>{`
        @keyframes af-radar-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes af-ring-breathe {
          0%, 100% { opacity: .06; }
          50%       { opacity: .20; }
        }
        @keyframes af-signal-pulse {
          0%, 100% { opacity: 0;    }
          40%, 60%  { opacity: .55; }
        }
        @keyframes af-dot-glow {
          0%, 100% { opacity: .9; r: 3;  }
          50%       { opacity: .5; r: 4.5; }
        }
        @keyframes af-halo {
          0%, 100% { opacity: .12; r: 9;  }
          50%       { opacity: .04; r: 16; }
        }
        .af-sweep  { transform-origin: 210px 210px; animation: af-radar-spin 5s linear infinite; }
        .af-sweep2 { transform-origin: 210px 210px; animation: af-radar-spin 5s linear infinite; }
      `}</style>

      {/* Conic sweep trail — rotates same speed as the line */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none" style={{
        background: "conic-gradient(from -90deg, rgba(7,211,232,0.13) 0deg, rgba(7,211,232,0.05) 55deg, transparent 80deg)",
        animation: "af-radar-spin 5s linear infinite",
        transformOrigin: "center",
      }} />

      <svg viewBox="0 0 420 420" className="absolute inset-0 w-full h-full" overflow="visible">
        <defs>
          <radialGradient id="af-bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(7,211,232,0.07)" />
            <stop offset="100%" stopColor="rgba(7,211,232,0)" />
          </radialGradient>
          {/* Sweep-line gradient: bright at tip, fades to center */}
          <linearGradient id="af-sweep-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="rgba(7,211,232,0)" />
            <stop offset="100%" stopColor="rgba(7,211,232,0.85)" />
          </linearGradient>
        </defs>

        {/* Soft background glow */}
        <circle cx="210" cy="210" r="200" fill="url(#af-bg-glow)" />

        {/* Concentric rings */}
        {rings.map((r, i) => (
          <circle key={r} cx="210" cy="210" r={r}
            fill="none"
            stroke="rgba(7,211,232,1)"
            strokeWidth={i === 0 ? 0.5 : 0.75}
            style={{
              animation: `af-ring-breathe ${3.2 + i * 0.65}s ease-in-out infinite`,
              animationDelay: `${i * 0.45}s`,
            }}
          />
        ))}

        {/* Dashed radial signal lines at 8 angles */}
        {signalAngles.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 210 + 33 * Math.cos(rad);
          const y1 = 210 + 33 * Math.sin(rad);
          const x2 = 210 + 170 * Math.cos(rad);
          const y2 = 210 + 170 * Math.sin(rad);
          return (
            <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(7,211,232,1)"
              strokeWidth="0.5"
              strokeDasharray="4 10"
              style={{
                animation: `af-signal-pulse ${1.8 + (i % 4) * 0.45}s ease-in-out infinite`,
                animationDelay: `${i * 0.28}s`,
              }}
            />
          );
        })}

        {/* Rotating sweep arm — line from center to outer ring */}
        <g className="af-sweep">
          <line x1="210" y1="210" x2="210" y2="40"
            stroke="url(#af-sweep-grad)"
            strokeWidth="1.2"
          />
          {/* Bright tip dot */}
          <circle cx="210" cy="40" r="2" fill="rgba(7,211,232,0.9)" />
        </g>

        {/* Orbiting dots — each on a different ring */}
        {[
          { cy: 40,  dur: "12s", startDeg: 0   },
          { cy: 78,  dur: "9s",  startDeg: 130 },
          { cy: 113, dur: "7s",  startDeg: 250 },
          { cy: 146, dur: "5s",  startDeg: 70  },
          { cy: 177, dur: "16s", startDeg: 190 },
        ].map(({ cy, dur, startDeg }, i) => (
          <circle key={i} cx="210" cy={cy} r={2.8 - i * 0.3} fill="rgba(7,211,232,0.85)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${startDeg} 210 210`}
              to={`${startDeg + 360} 210 210`}
              dur={dur}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Center — small bright dot with halo pulse */}
        <circle cx="210" cy="210" r="9" fill="rgba(7,211,232,0.08)">
          <animate attributeName="r"       values="9;16;9"        dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="210" cy="210" r="3" fill="rgba(7,211,232,0.95)">
          <animate attributeName="r"       values="3;4.5;3"   dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

/* ── Stat counter ────────────────────────────────────────────────────────── */
function StatCounter({ label, value, suffix = "" }: { label: string; value?: number | string; suffix?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-4">
      <span className="text-xl sm:text-2xl font-semibold text-foreground tabular-nums">
        {value ?? "—"}{suffix}
      </span>
      <span className="text-[10px] text-muted-foreground/50 tracking-[0.14em] uppercase font-medium text-center">{label}</span>
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────────────── */
const features = [
  { icon: Globe,     title: "Reddit Signal Capture",       desc: "Continuous scanning of thousands of subreddits for any mention of your brand, competitors, or keywords — surfaced in seconds.", accent: "text-primary",      bg: "bg-primary/8 border-primary/20" },
  { icon: TrendingUp,title: "AI Sentiment Engine",         desc: "Every mention is classified as positive, neutral, or negative with AI-grade language understanding. Urgency and complaint signals are flagged automatically.", accent: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-900/30" },
  { icon: Bell,      title: "Smart Alert System",          desc: "Instant notifications for high-engagement posts, negative sentiment spikes, and competitor activity. Never miss a reputation event.", accent: "text-amber-400",  bg: "bg-amber-950/40 border-amber-900/30" },
  { icon: FileText,  title: "Daily Intelligence Reports",  desc: "AI-synthesized daily briefings: top signals, complaint patterns, trending discussions, and sentiment overview — ready every morning.", accent: "text-violet-400", bg: "bg-violet-950/40 border-violet-900/30" },
  { icon: Tag,       title: "Keyword & Competitor Tracking",desc: "Track brands, competitors, and any topic. Add or remove anytime.", accent: "text-cyan-400",  bg: "bg-cyan-950/40 border-cyan-900/30" },
  { icon: Shield,    title: "Reputation Defence",          desc: "Urgent and complaint mentions are separated from noise. Catch reputation crises before they escalate.", accent: "text-red-400",    bg: "bg-red-950/40 border-red-900/30" },
];

const steps = [
  { n: "01", title: "Define your signals",   desc: "Add your brand name, competitor names, and keywords. AuraFlow begins monitoring immediately — no setup delays." },
  { n: "02", title: "AuraFlow watches 24/7", desc: "Our scanner continuously monitors Reddit, classifying every mention with AI sentiment analysis and urgency detection." },
  { n: "03", title: "Act on intelligence",   desc: "Receive smart alerts, browse filtered mentions, and read your AI daily briefing. Know what's being said before it matters." },
];

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const { data: stats } = useGetDashboardStats();

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans">

      {/* ══ NAV — Anyscale-style layout ══════════════════════════════════════
          [Logo]   Features  How it works  Pricing          Log in  [Enter Platform]
      ═══════════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-10 h-16 flex items-center gap-8">

          {/* ── Logo ── */}
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer shrink-0">
              <img src={iconSrc} alt="" className="h-7 w-auto"
                style={{ filter: "drop-shadow(0 0 8px rgba(7,211,232,0.35))" }} />
              <span className="text-[15px] font-semibold text-foreground tracking-tight">FLOW</span>
            </div>
          </Link>

          {/* ── Nav links (center) ── */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            <a href="#features"
              className="px-3 py-1.5 rounded-md text-[13px] text-muted-foreground/70 hover:text-foreground hover:bg-white/5 transition-all font-medium">
              Features
            </a>
            <a href="#how"
              className="px-3 py-1.5 rounded-md text-[13px] text-muted-foreground/70 hover:text-foreground hover:bg-white/5 transition-all font-medium flex items-center gap-1">
              How it works
            </a>
            <a href="#pricing"
              className="px-3 py-1.5 rounded-md text-[13px] text-muted-foreground/70 hover:text-foreground hover:bg-white/5 transition-all font-medium">
              Pricing
            </a>
          </div>

          {/* ── Right: Log in + CTA ── */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <Link href="/app">
              <span className="hidden sm:inline text-[13px] text-muted-foreground/65 hover:text-foreground transition-colors cursor-pointer font-medium px-2">
                Log in
              </span>
            </Link>
            <Link href="/app">
              <span
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap"
                style={{ boxShadow: "0 0 18px rgba(7,211,232,0.28)" }}
              >
                Enter Platform
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 intelligence-grid opacity-40" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(7,211,232,0.05) 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl w-full mx-auto gap-7 pt-16">

          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-semibold tracking-[0.14em] uppercase text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Live monitoring · Reddit · 24 / 7
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold leading-[1.04] tracking-[-0.03em]">
              Your brand.<br />
              <span className="text-primary">Always watched.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground/60 max-w-xl mx-auto leading-relaxed font-light">
              AuraFlow monitors Reddit for every mention of your brand, competitors, and keywords —
              then turns raw signals into actionable intelligence with AI.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link href="/app">
              <span className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:bg-primary/90 transition-all cursor-pointer"
                style={{ boxShadow: "0 0 28px rgba(7,211,232,0.24)" }}>
                Open Intelligence Platform
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <span className="flex items-center justify-center gap-2 px-7 py-3 rounded-md border border-white/10 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all cursor-pointer">
                Explore features
              </span>
            </a>
          </div>

          {/* ── Orbital radar animation — pure rings + sweep ── */}
          <div className="mt-4 opacity-90">
            <OrbitalScanner />
          </div>
        </div>
      </section>

      {/* ══ LIVE STATS ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-white/5 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-white/5">
            <StatCounter label="Mentions tracked" value={stats?.totalMentions} />
            <StatCounter label="Positive signals"  value={stats?.positiveMentions} />
            <StatCounter label="Alerts generated"  value={stats?.unreadAlerts} />
            <StatCounter label="Keywords active"   value={stats?.trackedKeywords} />
            <StatCounter label="Uptime"            value="99.9" suffix="%" />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/70 border border-primary/15 bg-primary/5 px-3 py-1.5 rounded-sm">
              <Activity className="w-2.5 h-2.5" /> Platform capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
              Precision intelligence.<br /><span className="text-muted-foreground/40">For every signal.</span>
            </h2>
            <p className="text-sm text-muted-foreground/50 max-w-lg mx-auto leading-relaxed">
              Six core modules working together to give you complete situational awareness of your brand's online presence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map(({ icon: Icon, title, desc, accent, bg }) => (
              <div key={title} className="group p-5 rounded-md border border-white/6 bg-card/60 hover:border-primary/15 hover:bg-card/90 transition-all duration-300">
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

      {/* ══ DASHBOARD PREVIEW ════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em]">Intelligence at a glance</h2>
            <p className="text-sm text-muted-foreground/45">Your live brand dashboard — data from your actual monitored signals.</p>
          </div>
          <div className="rounded-md border border-white/8 overflow-hidden bg-card/40"
            style={{ boxShadow: "0 0 80px rgba(7,211,232,0.04)" }}>
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
            <div className="p-4 sm:p-6 intelligence-grid">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Total Mentions",  val: stats?.totalMentions  ?? "—", color: "text-primary" },
                  { label: "Positive",        val: stats?.positiveMentions ?? "—", color: "text-emerald-400" },
                  { label: "Negative",        val: stats?.negativeMentions ?? "—", color: "text-red-400" },
                  { label: "Unread Alerts",   val: stats?.unreadAlerts   ?? "—", color: "text-amber-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-sm border border-white/6 bg-background/60 p-4">
                    <p className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.14em] font-semibold mb-2">{label}</p>
                    <p className={`text-2xl font-semibold tabular-nums ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-sm border border-white/6 bg-background/60 p-4 h-28 flex flex-col gap-2">
                <p className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.14em]">Sentiment trend — last 7 days</p>
                <div className="flex-1 flex items-end gap-1">
                  {[4,6,5,8,7,10,9,12,8,6,9,11,7,8].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div className="rounded-sm bg-primary/20" style={{ height: `${h * 5}px` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section id="how" className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/70 border border-primary/15 bg-primary/5 px-3 py-1.5 rounded-sm">
              <Zap className="w-2.5 h-2.5" /> How it works
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
              From signal to action.<br /><span className="text-muted-foreground/40">In three steps.</span>
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map(({ n, title, desc }) => (
                <div key={n} className="relative flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 w-16 h-16 rounded-md border border-primary/25 bg-primary/8 flex items-center justify-center">
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

      {/* ══ BRAND PILLARS ════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 border-y border-white/5 bg-card/30">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Eye,    title: "Omnipresent awareness", desc: "AuraFlow sees what your team can't. Every thread, every comment, every signal — captured automatically." },
              { icon: Shield, title: "Reputation defence",    desc: "Complaints and urgent mentions are separated from noise. Catch crises before they compound." },
              { icon: Radio,  title: "Silent. Always on.",    desc: "No manual effort. No missed signals. AuraFlow runs continuously in the background." },
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

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(7,211,232,0.05) 0%, transparent 70%)" }} />
        <div className="relative max-w-2xl mx-auto w-full text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em]">
            Start watching.<br /><span className="text-primary">Now.</span>
          </h2>
          <p className="text-sm text-muted-foreground/48 leading-relaxed max-w-md mx-auto">
            Add your brand name and AuraFlow begins monitoring Reddit in seconds. No credit card. No setup.
          </p>
          <div className="pt-2">
            <Link href="/app">
              <span className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:bg-primary/90 transition-all cursor-pointer"
                style={{ boxShadow: "0 0 36px rgba(7,211,232,0.28)" }}>
                Open AuraFlow Platform
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6"
        style={{ borderTopColor: "rgba(7,211,232,0.06)" }}>
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={iconSrc} alt="AuraFlow" className="h-5 w-auto opacity-40"
              style={{ filter: "drop-shadow(0 0 4px rgba(7,211,232,0.3))" }} />
            <span className="text-[11px] font-semibold text-foreground/25 tracking-[0.1em] uppercase">Flow</span>
          </div>
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
