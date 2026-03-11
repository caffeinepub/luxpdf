import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Crown, FileText, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { Tool } from "../backend";
import { usePremium } from "../context/PremiumContext";
import { CATEGORIES, FALLBACK_TOOLS } from "../lib/toolsData";
import { StartTrialModal } from "./StartTrialModal";

interface TopNavProps {
  onNavigate: (page: string, toolSlug?: string) => void;
  tools?: Tool[];
}

const ICON_MAP: Record<string, string> = {
  Organize: "🗂",
  Convert: "🔄",
  Optimize: "⚡",
  Security: "🔒",
  Edit: "✏️",
  Advanced: "🔮",
};

export function TopNav({ onNavigate, tools }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const { isPremium, isTrialing, daysLeftInTrial } = usePremium();

  const allTools = tools && tools.length > 0 ? tools : FALLBACK_TOOLS;
  const navCategories = CATEGORIES.filter((c) => c !== "All");

  const getToolsForCategory = (cat: string) =>
    allTools.filter((t) => t.category === cat).slice(0, 4);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 font-display text-xl font-black tracking-tight"
            data-ocid="nav.home_link"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-dark shadow-gold-sm">
              <FileText className="h-4 w-4 text-background" />
            </div>
            <span className="text-foreground">
              Lux<span className="text-gold-gradient">PDF</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navCategories.map((cat, i) => (
              <div
                key={cat}
                className="relative"
                onMouseEnter={() => setActiveDropdown(cat)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  data-ocid={`nav.menu_link.${i + 1}`}
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {cat}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {activeDropdown === cat && (
                  <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-border/60 bg-popover p-3 shadow-xl animate-scale-in">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold/70">
                      <span>{ICON_MAP[cat]}</span> {cat}
                    </p>
                    <div className="space-y-0.5">
                      {getToolsForCategory(cat).map((tool) => (
                        <button
                          type="button"
                          key={tool.slug}
                          onClick={() => {
                            onNavigate("tool", tool.slug);
                            setActiveDropdown(null);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >
                          {tool.name}
                          {tool.tier === "premium" && (
                            <span className="ml-1.5 rounded-full bg-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                              PRO
                            </span>
                          )}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate("home");
                          setActiveDropdown(null);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gold/70 transition hover:text-gold"
                      >
                        View all {cat} tools →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("pricing")}
              className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground md:block"
              data-ocid="nav.pricing_link"
            >
              Pricing
            </button>

            {isTrialing ? (
              <div className="hidden items-center gap-2 md:flex">
                <Badge className="gap-1 border-gold/30 bg-gold/10 text-gold">
                  <Crown className="h-3 w-3" /> Trial: {daysLeftInTrial} day
                  {daysLeftInTrial !== 1 ? "s" : ""} left
                </Badge>
                <button
                  type="button"
                  data-ocid="nav.manage_trial_link"
                  onClick={() => onNavigate("pricing")}
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Manage
                </button>
              </div>
            ) : isPremium ? (
              <div className="hidden items-center gap-2 md:flex">
                <Badge className="gap-1 border-gold/30 bg-gold/10 text-gold">
                  <Sparkles className="h-3 w-3" /> Premium ✦
                </Badge>
              </div>
            ) : (
              <Button
                type="button"
                data-ocid="nav.start_trial_button"
                variant="outline"
                size="sm"
                onClick={() => setTrialModalOpen(true)}
                className="hidden rounded-full border-gold/40 bg-gold/5 px-4 text-xs font-bold text-gold transition hover:bg-gold/10 hover:border-gold/60 md:flex"
              >
                <Sparkles className="mr-1.5 h-3 w-3" />
                Start Free Trial
              </Button>
            )}

            <Button
              type="button"
              data-ocid="nav.go_premium_button"
              onClick={() => onNavigate("pricing")}
              className="rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-5 py-2 text-sm font-bold text-background shadow-gold-sm transition hover:shadow-gold"
            >
              Go Premium
            </Button>
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground transition hover:text-foreground md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border/40 bg-background/95 px-4 pb-4 md:hidden">
            <div className="space-y-1 pt-2">
              {navCategories.map((cat, i) => (
                <div key={cat}>
                  <p className="px-2 pt-2 text-[11px] font-bold uppercase tracking-widest text-gold/50">
                    {cat}
                  </p>
                  {getToolsForCategory(cat).map((tool) => (
                    <button
                      type="button"
                      key={tool.slug}
                      data-ocid={`nav.menu_link.${i + 1}`}
                      onClick={() => {
                        onNavigate("tool", tool.slug);
                        setMobileOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                {!isPremium && (
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid="nav.mobile_start_trial_button"
                    onClick={() => {
                      setTrialModalOpen(true);
                      setMobileOpen(false);
                    }}
                    className="w-full rounded-full border-gold/40 bg-gold/5 font-bold text-gold"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Free Trial
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    onNavigate("pricing");
                    setMobileOpen(false);
                  }}
                  className="w-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light font-bold text-background"
                >
                  Go Premium
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <StartTrialModal
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
      />
    </>
  );
}
