import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ToolCard } from "../components/ToolCard";
import { useAllTools } from "../hooks/useQueries";
import { CATEGORIES, type Category, FALLBACK_TOOLS } from "../lib/toolsData";

interface HomePageProps {
  onNavigate: (page: string, toolSlug?: string) => void;
}

const WHY_FEATURES = [
  {
    icon: Zap,
    title: "Genuinely Generous Free Tier",
    description:
      "20+ tools available completely free. No file size limits, no watermarks, no count restrictions.",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/15",
  },
  {
    icon: ShieldCheck,
    title: "No Account Required",
    description:
      "Jump straight in. Your files are processed in the browser and never stored on our servers.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/15",
  },
  {
    icon: Layers,
    title: "Batch Processing, Always Free",
    description:
      "Process multiple files simultaneously without a premium plan. Handle entire workflows in one click.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/15",
  },
];

/** Flanked-dash section eyebrow — consistent luxury treatment */
function Eyebrow({ children }: { children: string }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="h-px w-5 bg-gold/40" />
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold/60">
        {children}
      </span>
      <span className="h-px w-5 bg-gold/40" />
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const { data: backendTools, isLoading } = useAllTools();

  const tools =
    backendTools && backendTools.length > 0 ? backendTools : FALLBACK_TOOLS;

  const filteredTools = useMemo(() => {
    let list = tools;
    if (activeCategory !== "All") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [tools, activeCategory, search]);

  return (
    <main className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-28">
        {/* Multi-layer atmospheric depth */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Central gold bloom — the anchor of the luxury atmosphere */}
          <div
            className="animate-hero-bloom absolute left-1/2 top-[-80px] h-[560px] w-[560px] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(75 0.12 75 / 0.18) 0%, oklch(75 0.12 75 / 0.07) 40%, transparent 70%)",
            }}
          />
          {/* Secondary ambient left-cool */}
          <div
            className="absolute -left-32 top-1/3 h-80 w-80 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(ellipse, oklch(60 0.08 240 / 0.15) 0%, transparent 70%)",
            }}
          />
          {/* Secondary ambient right-warm */}
          <div
            className="absolute -right-24 top-1/4 h-72 w-72 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(ellipse, oklch(68 0.10 55 / 0.10) 0%, transparent 70%)",
            }}
          />
          {/* Thin horizontal gold hairline */}
          <div
            className="absolute left-1/2 top-[140px] h-px w-48 -translate-x-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(75 0.12 75 / 0.4), transparent)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-gold-pulse rounded-full bg-gold" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/80">
              Premium PDF Toolkit
            </span>
          </div>

          {/* Headline — two visual lines for hierarchy and drama */}
          <h1 className="mb-3 font-display font-black leading-none tracking-[0.01em] text-foreground">
            <span className="block text-4xl opacity-80 md:text-5xl lg:text-6xl">
              Your PDF Toolkit,
            </span>
            <span
              className="mt-1 block text-6xl md:text-7xl lg:text-8xl"
              style={{ lineHeight: 1.0 }}
            >
              <span className="animate-shimmer">Elevated.</span>
            </span>
          </h1>

          <p className="mx-auto mb-10 mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            20+ free tools. No file size anxiety. No forced sign-up.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="gap-2 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 font-bold text-background shadow-gold-sm transition hover:shadow-gold"
              onClick={() =>
                document
                  .getElementById("tools-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="gap-2 rounded-full border-border/50 px-8 font-semibold text-foreground/80 transition hover:border-gold/40 hover:bg-gold/5 hover:text-foreground"
              onClick={() => onNavigate("pricing")}
            >
              View Pricing
            </Button>
          </div>

          {/* Stats strip — proper credential bar with dividers */}
          <div className="mx-auto mt-14 inline-flex items-stretch divide-x divide-border/40 overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm">
            {[
              { value: "20+", label: "Free Tools" },
              { value: "\u221e", label: "File Size" },
              { value: "0", label: "Sign-ups" },
              { value: "100%", label: "Browser-side" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center px-6 py-4"
              >
                <span className="font-display text-2xl font-black leading-none text-gold">
                  {value}
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Section ─────────────────────────────────────────────── */}
      <section id="tools-section" className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          {/* Search + tabs header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                data-ocid="home.search_input"
                placeholder="Search tools…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-secondary pl-10 placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as Category)}
            className="mb-8"
          >
            <TabsList className="flex h-auto flex-wrap gap-1.5 bg-transparent p-0">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  data-ocid="home.category.tab"
                  className="rounded-full border border-border/40 bg-card/60 px-4 py-1.5 text-sm font-medium text-muted-foreground transition data-[state=active]:border-gold/40 data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <Skeleton key={i} className="h-44 rounded-xl bg-secondary/50" />
              ))}
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Search className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="font-display text-lg font-bold">No tools found</p>
              <p className="mt-1 text-sm">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredTools.map((tool, i) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  index={i + 1}
                  onClick={() => onNavigate("tool", tool.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why LuxPDF ────────────────────────────────────────────────── */}
      <section className="border-y border-border/40 bg-card/20 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <Eyebrow>Why LuxPDF</Eyebrow>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Built for people who value their time
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {WHY_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className={`rounded-2xl border ${feat.border} bg-card p-7`}
              >
                <div
                  className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${feat.bg}`}
                >
                  <feat.icon className={`h-5 w-5 ${feat.color}`} />
                </div>
                <h3 className="mb-2.5 font-display text-[15px] font-bold text-foreground">
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Teaser ────────────────────────────────────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Simple plans, real value
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-border/50 bg-card p-7">
              <div className="mb-7">
                <div className="mb-0.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Free
                </div>
                <div className="font-display text-4xl font-black text-foreground">
                  $0
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    /forever
                  </span>
                </div>
              </div>
              <ul className="mb-7 space-y-2.5">
                {[
                  "20+ tools included",
                  "Unlimited file size",
                  "Batch processing",
                  "No account needed",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/70" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-border/60 font-semibold transition hover:border-gold/30 hover:bg-gold/5"
                onClick={() =>
                  document
                    .getElementById("tools-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Start for Free
              </Button>
            </div>

            {/* Premium */}
            <div className="relative rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-7 shadow-gold-sm">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-4 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-background shadow-gold-sm">
                  ✦ Most Popular
                </span>
              </div>
              <div className="mb-7 mt-1">
                <div className="mb-0.5 text-sm font-semibold uppercase tracking-widest text-gold/70">
                  Premium
                </div>
                <div className="font-display text-4xl font-black text-gold">
                  $9.99
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
              </div>
              <ul className="mb-7 space-y-2.5">
                {[
                  "Everything in Free",
                  "Sign & Annotate PDFs",
                  "Compare Documents",
                  "API Access",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold/60" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                className="w-full rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light font-bold text-background shadow-gold-sm transition hover:shadow-gold"
                onClick={() => onNavigate("pricing")}
              >
                Go Premium
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
