import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Download,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

type ProcessState =
  | "idle"
  | "uploading"
  | "processing"
  | "finalizing"
  | "success"
  | "error";

interface ProgressStateProps {
  state: ProcessState;
  onReset: () => void;
  toolName: string;
  downloadBlob?: Blob | null;
  downloadFilename?: string;
}

const MESSAGES: Record<ProcessState, string> = {
  idle: "",
  uploading: "Uploading your files securely...",
  processing: "Processing with precision...",
  finalizing: "Finalizing your document...",
  success: "Your file is ready to download!",
  error: "Something went wrong. Please try again.",
};

const PROGRESS_VALUES: Record<ProcessState, number> = {
  idle: 0,
  uploading: 25,
  processing: 65,
  finalizing: 90,
  success: 100,
  error: 0,
};

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 200 - 100,
  size: Math.random() * 6 + 4,
  delay: Math.random() * 0.5,
  duration: Math.random() * 0.8 + 0.8,
}));

export function ProgressState({
  state,
  onReset,
  toolName,
  downloadBlob,
  downloadFilename,
}: ProgressStateProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const target = PROGRESS_VALUES[state];
    const timer = setTimeout(() => setDisplayProgress(target), 50);
    return () => clearTimeout(timer);
  }, [state]);

  if (state === "idle") return null;

  if (state === "success") {
    return (
      <div
        data-ocid="tool.success_state"
        className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-gold/5 p-8 text-center"
      >
        {/* Gold particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute bottom-0 rounded-full bg-gold"
              style={
                {
                  left: `calc(50% + ${p.x}px)`,
                  width: p.size,
                  height: p.size,
                  animation: `particle-float ${p.duration}s ease-out ${p.delay}s infinite`,
                  "--x-drift": `${p.x * 0.5}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
            <CheckCircle2 className="h-8 w-8 text-gold" />
          </div>
          <h3 className="mb-2 font-display text-xl font-bold text-foreground">
            {toolName} Complete!
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            {MESSAGES.success}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              data-ocid="tool.primary_button"
              className="gap-2 bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 font-bold text-background shadow-gold-sm hover:shadow-gold"
              onClick={() => {
                if (downloadBlob) {
                  const url = URL.createObjectURL(downloadBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = downloadFilename || "result.pdf";
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              disabled={!downloadBlob}
            >
              <Download className="h-4 w-4" />
              Download Result
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              className="gap-2 border-border/60"
            >
              <RefreshCw className="h-4 w-4" />
              Process Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        data-ocid="tool.error_state"
        className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mb-2 font-display text-xl font-bold text-foreground">
          Processing Failed
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">{MESSAGES.error}</p>
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div
      data-ocid="tool.loading_state"
      className="rounded-2xl border border-border/60 bg-card p-8 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
        <Sparkles className="h-8 w-8 animate-pulse text-gold" />
      </div>
      <h3 className="mb-2 font-display text-lg font-bold text-foreground">
        {MESSAGES[state]}
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Your files are processed locally — they never leave your browser.
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{MESSAGES[state]}</span>
          <span>{displayProgress}%</span>
        </div>
        <Progress
          value={displayProgress}
          className="h-2 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-gold-dark [&>div]:to-gold"
        />
      </div>
    </div>
  );
}

export type { ProcessState };
