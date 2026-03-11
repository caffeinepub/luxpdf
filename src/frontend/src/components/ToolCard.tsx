import {
  Contrast,
  Crop,
  Crown,
  Eraser,
  File,
  FileSpreadsheet,
  FileText,
  FileType,
  GitCompare,
  GitMerge,
  Hash,
  Image,
  Images,
  Layers,
  LayoutGrid,
  Lock,
  MessageSquare,
  Minimize2,
  PenTool,
  Presentation,
  RotateCcw,
  Scissors,
  Stamp,
  Table2,
  Tags,
  Unlock,
  Wrench,
} from "lucide-react";
import type { Tool } from "../backend";

const ICON_COMPONENTS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  GitMerge,
  Scissors,
  RotateCcw,
  LayoutGrid,
  FileText,
  Table2,
  Image,
  FileType,
  FileSpreadsheet,
  Minimize2,
  Contrast,
  Wrench,
  Layers,
  Lock,
  Unlock,
  Stamp,
  Eraser,
  Hash,
  Crop,
  Tags,
  PenTool,
  MessageSquare,
  GitCompare,
  Images,
  Presentation,
  PresentationIcon: Presentation,
};

interface ToolCardProps {
  tool: Tool;
  index: number;
  onClick: () => void;
}

/**
 * Per-category icon accent colors — icon ring only.
 * Cards themselves are uniformly dark; the icon color is the sole
 * category signal, keeping the grid visually calm and luxurious.
 */
const ICON_COLOR: Record<string, string> = {
  Organize: "text-sky-400",
  Convert: "text-violet-400",
  Optimize: "text-emerald-400",
  Security: "text-rose-400",
  Edit: "text-amber-400",
  Advanced: "text-gold",
};

const ICON_RING: Record<string, string> = {
  Organize: "ring-sky-400/20   bg-sky-400/8",
  Convert: "ring-violet-400/20 bg-violet-400/8",
  Optimize: "ring-emerald-400/20 bg-emerald-400/8",
  Security: "ring-rose-400/20  bg-rose-400/8",
  Edit: "ring-amber-400/20  bg-amber-400/8",
  Advanced: "ring-gold/20       bg-gold/8",
};

export function ToolCard({ tool, index, onClick }: ToolCardProps) {
  const IconComponent = ICON_COMPONENTS[tool.iconName] || File;
  const isPremium = tool.tier === "premium";
  const iconColor = ICON_COLOR[tool.category] || "text-gold";
  const iconRing = ICON_RING[tool.category] || "ring-gold/20 bg-gold/8";

  return (
    <button
      type="button"
      data-ocid={`tool.card.${index}`}
      onClick={onClick}
      className={
        "group relative flex w-full flex-col rounded-xl border border-border/40 " +
        "bg-card p-5 text-left " +
        /* subtle top-surface gloss */
        "[background-image:linear-gradient(to_bottom,oklch(20_0.025_260/0.6)_0%,transparent_60%)] " +
        "transition duration-300 " +
        "hover:-translate-y-[3px] hover:border-gold/35 " +
        "hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_18px_oklch(75_0.12_75/0.18)] " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      }
    >
      {/* Premium badge only — Free is the default, not worth labelling */}
      {isPremium && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5">
          <Crown className="h-2.5 w-2.5 text-gold" />
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-gold">
            Pro
          </span>
        </div>
      )}

      {/* Icon — larger, with category-colored tinted ring */}
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${iconRing} ${iconColor}`}
      >
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Name */}
      <h3 className="mb-1.5 font-display text-[13px] font-bold leading-snug text-foreground">
        {tool.name}
      </h3>

      {/* Description */}
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {tool.description}
      </p>

      {/* Hover CTA — fades in smoothly */}
      <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gold/0 transition duration-200 group-hover:text-gold/75">
        <span>Open tool</span>
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </button>
  );
}
