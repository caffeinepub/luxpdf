import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, CreditCard, Crown, Lock } from "lucide-react";
import { useState } from "react";
import { usePremium } from "../context/PremiumContext";

interface StartTrialModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StartTrialModal({
  open,
  onClose,
  onSuccess,
}: StartTrialModalProps) {
  const { startTrial } = usePremium();
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [emailError, setEmailError] = useState("");

  const trialEndDate = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleSubmit = () => {
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    startTrial(email.trim());
    onSuccess?.();
    onClose();
    setEmail("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="trial.dialog"
        className="max-w-md border-gold/20 bg-card p-0 text-foreground shadow-gold-sm"
      >
        {/* Header gradient strip */}
        <div className="rounded-t-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20">
                <Crown className="h-5 w-5 text-background" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-background">
                  Start Your Free Trial
                </DialogTitle>
                <p className="text-xs font-medium text-background/80">
                  7 days free, then $9.99/month. Cancel anytime.
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-5">
          {/* Trial summary */}
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-2">
            {[
              { text: "7 days completely free" },
              { text: `Cancel before ${trialEndDate} and pay nothing` },
              { text: "Full access to all premium tools" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/20">
                  <Check className="h-2.5 w-2.5 text-gold" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="trial-email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </label>
            <Input
              id="trial-email"
              data-ocid="trial.input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className="border-border/60 bg-background/50 focus-visible:border-gold/40 focus-visible:ring-gold/20"
            />
            {emailError && (
              <p
                data-ocid="trial.error_state"
                className="text-xs text-destructive"
              >
                {emailError}
              </p>
            )}
          </div>

          {/* Card details (visual only) */}
          <div className="space-y-3">
            <label
              htmlFor="trial-card"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Payment Details
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                id="trial-card"
                data-ocid="trial.card_input"
                placeholder="Card number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="border-border/60 bg-background/50 pl-9 font-mono text-sm focus-visible:border-gold/40 focus-visible:ring-gold/20"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                data-ocid="trial.expiry_input"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="border-border/60 bg-background/50 font-mono text-sm focus-visible:border-gold/40 focus-visible:ring-gold/20"
                maxLength={7}
              />
              <Input
                data-ocid="trial.cvc_input"
                placeholder="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="border-border/60 bg-background/50 font-mono text-sm focus-visible:border-gold/40 focus-visible:ring-gold/20"
                maxLength={4}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
              <Lock className="h-3 w-3" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            type="button"
            data-ocid="trial.submit_button"
            className="w-full rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light py-5 text-sm font-black text-background shadow-gold-sm transition hover:shadow-gold"
            onClick={handleSubmit}
          >
            Start Free Trial →
          </Button>

          <p className="text-center text-[10px] text-muted-foreground/60">
            No charge until {trialEndDate}. Cancel anytime before trial ends.
          </p>

          <button
            type="button"
            data-ocid="trial.cancel_button"
            onClick={onClose}
            className="w-full text-center text-xs text-muted-foreground/50 transition hover:text-muted-foreground"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
