import { Button } from "@/components/ui/button";
import {
  Check,
  Code2,
  Crown,
  GitCompare,
  MessageSquare,
  PenTool,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { RestoreAccessModal } from "../components/RestoreAccessModal";
import { StartTrialModal } from "../components/StartTrialModal";
import { usePremium } from "../context/PremiumContext";

interface PricingPageProps {
  onNavigate: (page: string, toolSlug?: string) => void;
}

const FREE_FEATURES = [
  "20+ PDF tools included",
  "Unlimited file size — no anxiety",
  "Batch processing for multiple files",
  "No account or sign-up needed",
  "All Organize tools (Merge, Split, Rotate, Reorder)",
  "All Convert tools (PDF ↔ Word, Excel, PPT, Images)",
  "All Optimize tools (Compress, Grayscale, Flatten, Repair)",
  "All Security tools (Protect & Unlock PDF)",
  "All Edit tools (Watermark, Page Numbers, Metadata, Crop)",
  "Browser-side processing — your files stay private",
];

const PREMIUM_FEATURES = [
  "Everything in Free, forever",
  "Sign PDF (draw, type, or upload signature)",
  "Annotate PDF (highlights, comments, shapes)",
  "Compare two PDFs side-by-side",
  "Priority cloud processing (faster)",
  "REST API access for developers",
  "Team workspace & sharing",
  "Dedicated support & SLA",
];

const ADVANCED_TOOLS = [
  { icon: PenTool, label: "Sign PDF", desc: "Draw or type signatures" },
  {
    icon: MessageSquare,
    label: "Annotate PDF",
    desc: "Add comments & highlights",
  },
  { icon: GitCompare, label: "Compare PDFs", desc: "Side-by-side diff view" },
  { icon: Code2, label: "API Access", desc: "Integrate with your apps" },
  { icon: Users, label: "Team Sharing", desc: "Collaborate with your team" },
  { icon: Zap, label: "Priority Processing", desc: "Lightning-fast results" },
];

export function PricingPage({ onNavigate }: PricingPageProps) {
  const { isPremium, isTrialing, daysLeftInTrial, cancelTrial } = usePremium();
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  return (
    <main className="animate-fade-in px-4 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold/70">
            Pricing
          </p>
          <h1 className="mb-4 font-display text-4xl font-black text-foreground md:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            No hidden fees, no surprise restrictions. Most users never need to
            upgrade — and that's intentional.
          </p>
        </div>

        {/* Active trial notice */}
        {isTrialing && (
          <div
            data-ocid="pricing.trial_banner"
            className="mb-8 rounded-xl border border-gold/30 bg-gold/10 p-4 text-center"
          >
            <p className="font-semibold text-gold">
              ✦ Free Trial Active — {daysLeftInTrial} day
              {daysLeftInTrial !== 1 ? "s" : ""} remaining
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your card will be charged $9.99 after your trial ends.
            </p>
            <button
              type="button"
              data-ocid="pricing.cancel_trial_button"
              onClick={cancelTrial}
              className="mt-2 text-xs text-muted-foreground underline underline-offset-2 transition hover:text-destructive"
            >
              Cancel trial
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-border/50 bg-card p-8">
            <div className="mb-8">
              <div className="mb-1 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Free
              </div>
              <div className="font-display text-5xl font-black text-foreground">
                $0
              </div>
              <div className="text-sm text-muted-foreground">
                per month, forever
              </div>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              data-ocid="pricing.free_cta_button"
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-border/60 font-semibold transition hover:border-gold/30 hover:bg-gold/5"
              onClick={() => onNavigate("home")}
            >
              Start for Free
            </Button>
          </div>

          {/* Premium */}
          <div className="relative flex flex-col rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-transparent to-transparent p-8 shadow-gold-sm">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-background shadow-gold-sm">
                ✦ Most Popular
              </div>
            </div>

            <div className="mb-8 mt-2">
              <div className="mb-1 text-sm font-bold uppercase tracking-widest text-gold/70">
                Premium
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-black text-gold">
                  $9.99
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-gold/70 font-medium">
                7-day free trial, then $9.99/mo
              </div>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15">
                    <Check className="h-3 w-3 text-gold" />
                  </div>
                  <span className="text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <Button
                data-ocid="pricing.premium_cta_button"
                size="lg"
                className="w-full rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light font-bold text-background shadow-gold-sm"
                disabled
              >
                <Crown className="mr-2 h-4 w-4" />
                {isTrialing ? "Trial Active" : "Premium Active"}
              </Button>
            ) : (
              <Button
                data-ocid="pricing.premium_cta_button"
                size="lg"
                className="w-full rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light font-bold text-background shadow-gold-sm transition hover:shadow-gold"
                onClick={() => setTrialModalOpen(true)}
              >
                <Crown className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
            )}

            <p className="mt-2 text-center text-xs text-muted-foreground">
              No charge for 7 days. Cancel anytime before trial ends.
            </p>

            <p className="mt-2 text-center text-xs text-muted-foreground">
              Already tried?{" "}
              <button
                type="button"
                data-ocid="pricing.restore_access_button"
                onClick={() => setRestoreModalOpen(true)}
                className="font-semibold text-gold underline-offset-2 transition hover:underline"
              >
                Restore Access
              </button>
            </p>
          </div>
        </div>

        {/* Premium Features Grid */}
        <div className="mt-20">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold/70">
              What Premium Unlocks
            </p>
            <h2 className="font-display text-2xl font-black text-foreground md:text-3xl">
              Advanced tools for power users
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {ADVANCED_TOOLS.map((tool) => (
              <div
                key={tool.label}
                className="rounded-xl border border-gold/15 bg-gradient-to-br from-gold/5 to-transparent p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                  <tool.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mb-1 font-display text-sm font-bold text-foreground">
                  {tool.label}
                </h3>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-16 rounded-2xl border border-border/40 bg-card/50 p-8 text-center">
          <h2 className="mb-2 font-display text-xl font-bold text-foreground">
            Still have questions?
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            We believe in honest pricing. If you're not sure whether Free covers
            your needs, it probably does.
          </p>
          <Button
            variant="outline"
            className="border-border/60 hover:border-gold/30 hover:bg-gold/5"
            onClick={() => onNavigate("home")}
          >
            Explore All Free Tools
          </Button>
        </div>
      </div>

      <StartTrialModal
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        onSuccess={() => onNavigate("home")}
      />
      <RestoreAccessModal
        open={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
      />
    </main>
  );
}
