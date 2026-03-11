import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { usePremium } from "../context/PremiumContext";

interface RestoreAccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function RestoreAccessModal({ open, onClose }: RestoreAccessModalProps) {
  const { restoreAccess } = usePremium();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleRestore = () => {
    if (!email.trim()) return;
    const found = restoreAccess(email.trim());
    setStatus(found ? "success" : "error");
    if (found) {
      setTimeout(() => {
        onClose();
        setEmail("");
        setStatus("idle");
      }, 1800);
    }
  };

  const handleClose = () => {
    onClose();
    setEmail("");
    setStatus("idle");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="restore.dialog"
        className="max-w-sm border-border/50 bg-card text-foreground"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
              <KeyRound className="h-4 w-4 text-gold" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                Restore Premium Access
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Enter the email you used to start your trial.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Input
            data-ocid="restore.input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            className="border-border/60 bg-background/50 focus-visible:border-gold/40 focus-visible:ring-gold/20"
          />

          {status === "success" && (
            <p
              data-ocid="restore.success_state"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400"
            >
              ✓ Access restored! Welcome back.
            </p>
          )}
          {status === "error" && (
            <p
              data-ocid="restore.error_state"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
            >
              No subscription found for this email.
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              data-ocid="restore.submit_button"
              className="flex-1 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light font-bold text-background shadow-gold-sm"
              onClick={handleRestore}
            >
              Restore Access
            </Button>
            <Button
              type="button"
              data-ocid="restore.cancel_button"
              variant="outline"
              className="rounded-xl border-border/60"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
