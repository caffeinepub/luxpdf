import { Toaster } from "@/components/ui/sonner";
import { Crown } from "lucide-react";
import { useState } from "react";
import { Footer } from "./components/Footer";
import { TopNav } from "./components/TopNav";
import { PremiumProvider, usePremium } from "./context/PremiumContext";
import { useAllTools } from "./hooks/useQueries";
import { HomePage } from "./pages/HomePage";
import { PricingPage } from "./pages/PricingPage";
import { ToolPage } from "./pages/ToolPage";

type Page = "home" | "tool" | "pricing";

function TrialBanner({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { isTrialing, daysLeftInTrial } = usePremium();
  if (!isTrialing) return null;
  return (
    <div
      data-ocid="app.trial_banner"
      className="relative flex items-center justify-between gap-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light px-4 py-2.5 text-sm font-semibold text-background"
    >
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4" />
        <span>
          Free Trial Active — {daysLeftInTrial} day
          {daysLeftInTrial !== 1 ? "s" : ""} remaining. Your card will be
          charged $9.99 after your trial ends.
        </span>
      </div>
      <button
        type="button"
        data-ocid="app.trial_manage_button"
        onClick={() => onNavigate("pricing")}
        className="shrink-0 rounded-full bg-background/20 px-3 py-0.5 text-xs font-bold transition hover:bg-background/30"
      >
        Manage
      </button>
    </div>
  );
}

function AppInner() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentTool, setCurrentTool] = useState<string>("");
  const { data: tools } = useAllTools();

  const navigate = (page: string, toolSlug?: string) => {
    if (page === "tool" && toolSlug) {
      setCurrentTool(toolSlug);
      setCurrentPage("tool");
    } else if (page === "pricing") {
      setCurrentPage("pricing");
    } else {
      setCurrentPage("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Subtle background texture */}
      <div className="pointer-events-none fixed inset-0 bg-noise opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />

      <TrialBanner onNavigate={navigate} />
      <TopNav onNavigate={navigate} tools={tools} />

      <div className="relative flex-1">
        {currentPage === "home" && <HomePage onNavigate={navigate} />}
        {currentPage === "tool" && (
          <ToolPage slug={currentTool} onNavigate={navigate} />
        )}
        {currentPage === "pricing" && <PricingPage onNavigate={navigate} />}
      </div>

      <Footer onNavigate={navigate} />
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "border-border/60 bg-card text-foreground",
            success: "border-gold/30 bg-gold/10 text-foreground",
            error: "border-destructive/30 bg-destructive/10",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <PremiumProvider>
      <AppInner />
    </PremiumProvider>
  );
}
